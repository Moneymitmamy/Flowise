import { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFI } from '@pnp/sp';
import { SPFx } from '@pnp/sp/behaviors/spfx';
import { IAppConfig } from '../models/ConfigModels';

export class AppLogger {
  private sp: SPFI;

  constructor(private context: WebPartContext, private config: IAppConfig) {
    this.sp = spfi().using(SPFx(context));
  }

  public info(message: string, data?: unknown): void {
    // eslint-disable-next-line no-console
    console.info(`[Ticketing] ${message}`, data ?? '');
    this.writeToList('Info', message, data).catch(() => undefined);
  }

  public error(message: string, data?: unknown): void {
    // eslint-disable-next-line no-console
    console.error(`[Ticketing] ${message}`, data ?? '');
    this.writeToList('Error', message, data).catch(() => undefined);
  }

  private async writeToList(level: string, message: string, data?: unknown): Promise<void> {
    if (!this.config.enableAppLogging || !this.config.logsListTitle) {
      return;
    }

    await this.sp.web.lists.getByTitle(this.config.logsListTitle).items.add({
      Title: `${level}: ${message}`,
      Level: level,
      Data: data ? JSON.stringify(data) : ''
    });
  }
}
