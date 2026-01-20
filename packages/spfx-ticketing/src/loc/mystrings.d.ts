declare interface ITicketingStrings {
  TicketCockpitTitle: string;
  TicketDetailTitle: string;
  TicketSetupTitle: string;
  Loading: string;
  ErrorGeneric: string;
  SendConfirmTitle: string;
  SendConfirmContent: string;
  SendSuccess: string;
  SendFailed: string;
  RequiredField: string;
}

declare module 'TicketingStrings' {
  const strings: ITicketingStrings;
  export = strings;
}
