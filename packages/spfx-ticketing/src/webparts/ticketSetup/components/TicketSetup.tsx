import * as React from 'react';
import { useMemo, useState } from 'react';
import { Stack, Label, TextField, Toggle, Dropdown, IDropdownOption, PrimaryButton, MessageBar, MessageBarType } from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IAppConfig } from '../../../models/ConfigModels';
import { HealthCheckService } from '../../../services/HealthCheckService';

export interface ITicketSetupProps {
  context: WebPartContext;
  config: IAppConfig;
}

const TicketSetup: React.FC<ITicketSetupProps> = ({ context, config }) => {
  const [healthResult, setHealthResult] = useState<string | undefined>();
  const [healthError, setHealthError] = useState<string | undefined>();

  const healthService = useMemo(() => new HealthCheckService(context, config), [context, config]);

  const emailModeOptions: IDropdownOption[] = [
    { key: 'GraphSendMail', text: 'Microsoft Graph SendMail' },
    { key: 'PowerAutomate', text: 'Power Automate (HTTP Trigger)' }
  ];

  const handleHealthCheck = async (): Promise<void> => {
    setHealthResult(undefined);
    setHealthError(undefined);
    const result = await healthService.run();
    if (result.ok) {
      setHealthResult('Health Check erfolgreich.');
    } else {
      setHealthError(result.messages.join(' | '));
    }
  };

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      <Label variant="large">Ticket-Setup</Label>
      <TextField label="Tickets-Liste" value={config.ticketsListTitle} readOnly />
      <TextField label="Timeline-Liste" value={config.timelineListTitle} readOnly />
      <TextField label="Templates-Liste" value={config.templatesListTitle} readOnly />
      <TextField label="Shared Mailbox" value={config.sharedMailbox} readOnly />
      <TextField label="Ticket-ID Prefix" value={config.ticketIdPrefix} readOnly />
      <Dropdown label="E-Mail Versand" selectedKey={config.emailSendingMode} options={emailModeOptions} disabled />
      <Toggle label="App Logging" checked={config.enableAppLogging} disabled />
      <PrimaryButton text="Health Check" onClick={handleHealthCheck} />
      {healthResult && <MessageBar messageBarType={MessageBarType.success}>{healthResult}</MessageBar>}
      {healthError && <MessageBar messageBarType={MessageBarType.error}>{healthError}</MessageBar>}
    </Stack>
  );
};

export default TicketSetup;
