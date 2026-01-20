import { MSGraphClientV3 } from '@microsoft/sp-http';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IAppConfig } from '../models/ConfigModels';

export interface ISendMailPayload {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  from?: string;
  idempotencyKey: string;
}

export interface ISendMailResult {
  ok: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  constructor(private context: WebPartContext, private config: IAppConfig) {}

  public async sendMail(payload: ISendMailPayload): Promise<ISendMailResult> {
    if (this.config.emailSendingMode === 'GraphSendMail') {
      return this.sendViaGraph(payload);
    }

    return this.sendViaPowerAutomate(payload);
  }

  private async sendViaGraph(payload: ISendMailPayload): Promise<ISendMailResult> {
    try {
      const client: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient('3');
      await client.api(`/users/${this.config.sharedMailbox}/sendMail`).post({
        message: {
          subject: payload.subject,
          body: {
            contentType: 'HTML',
            content: payload.body
          },
          toRecipients: payload.to.map((address) => ({ emailAddress: { address } })),
          ccRecipients: payload.cc?.map((address) => ({ emailAddress: { address } })) ?? []
        },
        saveToSentItems: true
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  }

  private async sendViaPowerAutomate(payload: ISendMailPayload): Promise<ISendMailResult> {
    if (!this.config.powerAutomateEndpoint) {
      return { ok: false, error: 'Power Automate endpoint nicht konfiguriert.' };
    }

    try {
      const response = await fetch(this.config.powerAutomateEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: payload.to,
          cc: payload.cc,
          subject: payload.subject,
          body: payload.body,
          idempotencyKey: payload.idempotencyKey
        })
      });

      if (!response.ok) {
        return { ok: false, error: `Power Automate Fehler: ${response.status}` };
      }

      const data = (await response.json()) as { messageId?: string };
      return { ok: true, messageId: data.messageId };
    } catch (error) {
      return { ok: false, error: (error as Error).message };
    }
  }
}
