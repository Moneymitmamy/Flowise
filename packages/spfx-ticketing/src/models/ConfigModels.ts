export type EmailSendingMode = 'GraphSendMail' | 'PowerAutomate';

export interface IAppConfig {
  ticketsListTitle: string;
  timelineListTitle: string;
  templatesListTitle: string;
  logsListTitle?: string;
  routingRulesListTitle?: string;
  sharedMailbox: string;
  ticketIdPrefix: string;
  defaultStatuses: string[];
  enableAppLogging: boolean;
  emailSendingMode: EmailSendingMode;
  powerAutomateEndpoint?: string;
}

export interface IHealthCheckResult {
  ok: boolean;
  messages: string[];
}
