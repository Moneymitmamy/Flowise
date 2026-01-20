import { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFI } from '@pnp/sp';
import { SPFx } from '@pnp/sp/behaviors/spfx';
import { IAppConfig, IHealthCheckResult } from '../models/ConfigModels';

export class HealthCheckService {
  private sp: SPFI;

  constructor(private context: WebPartContext, private config: IAppConfig) {
    this.sp = spfi().using(SPFx(context));
  }

  public async run(): Promise<IHealthCheckResult> {
    const messages: string[] = [];

    const listTitles = [
      this.config.ticketsListTitle,
      this.config.timelineListTitle,
      this.config.templatesListTitle,
      this.config.logsListTitle
    ].filter(Boolean) as string[];

    for (const title of listTitles) {
      try {
        await this.sp.web.lists.getByTitle(title).select('Id')();
      } catch (error) {
        messages.push(`Liste nicht gefunden: ${title}`);
      }
    }

    if (!this.config.sharedMailbox) {
      messages.push('Shared Mailbox ist nicht konfiguriert.');
    }

    if (this.config.emailSendingMode === 'PowerAutomate' && !this.config.powerAutomateEndpoint) {
      messages.push('Power Automate Endpoint fehlt.');
    }

    return {
      ok: messages.length === 0,
      messages
    };
  }
}
