import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IPropertyPaneConfiguration, PropertyPaneTextField, PropertyPaneToggle, PropertyPaneDropdown } from '@microsoft/sp-property-pane';
import TicketCockpit from './components/TicketCockpit';
import { IAppConfig } from '../../models/ConfigModels';

export interface ITicketCockpitWebPartProps extends IAppConfig {}

export default class TicketCockpitWebPart extends BaseClientSideWebPart<ITicketCockpitWebPartProps> {
  public render(): void {
    const element = React.createElement(TicketCockpit, {
      context: this.context,
      config: this.properties
    });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Ticket-Cockpit Konfiguration' },
          groups: [
            {
              groupName: 'Listen',
              groupFields: [
                PropertyPaneTextField('ticketsListTitle', { label: 'Tickets-Liste' }),
                PropertyPaneTextField('timelineListTitle', { label: 'Timeline-Liste' }),
                PropertyPaneTextField('templatesListTitle', { label: 'Templates-Liste' }),
                PropertyPaneTextField('logsListTitle', { label: 'AppLogs-Liste' })
              ]
            },
            {
              groupName: 'E-Mail',
              groupFields: [
                PropertyPaneTextField('sharedMailbox', { label: 'Shared Mailbox' }),
                PropertyPaneTextField('ticketIdPrefix', { label: 'Ticket-ID Prefix' }),
                PropertyPaneDropdown('emailSendingMode', {
                  label: 'E-Mail Versand',
                  options: [
                    { key: 'GraphSendMail', text: 'Microsoft Graph SendMail' },
                    { key: 'PowerAutomate', text: 'Power Automate (HTTP Trigger)' }
                  ]
                }),
                PropertyPaneTextField('powerAutomateEndpoint', { label: 'Power Automate Endpoint' }),
                PropertyPaneToggle('enableAppLogging', { label: 'App Logging aktivieren' })
              ]
            }
          ]
        }
      ]
    };
  }
}
