import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Pivot, PivotItem, SearchBox, DetailsList, DetailsListLayoutMode, SelectionMode, Stack, MessageBar, MessageBarType, Spinner, Label } from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IAppConfig } from '../../../models/ConfigModels';
import { ITicket, ITicketFilters } from '../../../models/TicketModels';
import { SharePointService } from '../../../services/SharePointService';
import { AppLogger } from '../../../services/AppLogger';
import { formatDateTime, isOverdue } from '../../../utils/DateUtils';

export interface ITicketCockpitProps {
  context: WebPartContext;
  config: IAppConfig;
}

const TicketCockpit: React.FC<ITicketCockpitProps> = ({ context, config }) => {
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>();
  const [search, setSearch] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Meine');

  const spService = useMemo(() => new SharePointService(context, config), [context, config]);
  const logger = useMemo(() => new AppLogger(context, config), [context, config]);

  const loadTickets = async (filters: ITicketFilters): Promise<void> => {
    setLoading(true);
    setError(undefined);
    try {
      const items = await spService.getTickets(filters);
      setTickets(items);
    } catch (err) {
      logger.error('Tickets konnten nicht geladen werden.', err);
      setError('Tickets konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filters: ITicketFilters = {
      search
    };

    if (activeTab === 'Meine') {
      filters.assignedToId = context.pageContext.legacyPageContext.userId;
    }
    if (activeTab === 'Unzugewiesen') {
      filters.unassigned = true;
      filters.status = 'Neu';
    }
    if (activeTab === 'Überfällig') {
      filters.overdue = true;
    }
    if (activeTab === 'Wartet auf Kunde') {
      filters.status = 'Wartet auf Kunde';
    }
    if (activeTab === 'Wartet auf Außendienst') {
      filters.status = 'Wartet auf Außendienst';
    }
    if (activeTab === 'Erledigt') {
      filters.status = 'Erledigt';
      filters.doneToday = true;
    }

    loadTickets(filters);
  }, [activeTab, search]);

  const columns = [
    { key: 'ticketId', name: 'Ticket-ID', fieldName: 'ticketId', minWidth: 110, maxWidth: 150 },
    { key: 'title', name: 'Betreff', fieldName: 'title', minWidth: 200, maxWidth: 350 },
    { key: 'status', name: 'Status', fieldName: 'status', minWidth: 120, maxWidth: 160 },
    { key: 'assignedTo', name: 'Zuständig', fieldName: 'assignedTo', minWidth: 140, maxWidth: 200 },
    { key: 'dueDate', name: 'Fällig', fieldName: 'dueDate', minWidth: 110, maxWidth: 140 },
    { key: 'lastActionAt', name: 'Letzte Aktion', fieldName: 'lastActionAt', minWidth: 130, maxWidth: 160 }
  ];

  const items = tickets.map((ticket) => ({
    ...ticket,
    dueDate: ticket.dueDate ? `${formatDateTime(ticket.dueDate)}${isOverdue(ticket.dueDate) ? ' ⚠️' : ''}` : '',
    lastActionAt: formatDateTime(ticket.lastActionAt)
  }));

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      <Label variant="large">Ticket-Cockpit</Label>
      <SearchBox
        placeholder="Suche nach Ticket-ID oder Betreff"
        value={search}
        onChange={(_, value) => setSearch(value ?? '')}
      />
      <Pivot selectedKey={activeTab} onLinkClick={(item) => setActiveTab(item?.props.itemKey ?? 'Meine')}>
        <PivotItem headerText="Meine Tickets" itemKey="Meine" />
        <PivotItem headerText="Unzugewiesen" itemKey="Unzugewiesen" />
        <PivotItem headerText="Überfällig" itemKey="Überfällig" />
        <PivotItem headerText="Wartet auf Kunde" itemKey="Wartet auf Kunde" />
        <PivotItem headerText="Wartet auf Außendienst" itemKey="Wartet auf Außendienst" />
        <PivotItem headerText="Erledigt (heute)" itemKey="Erledigt" />
      </Pivot>
      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}
      {loading ? (
        <Spinner label="Laden..." />
      ) : (
        <DetailsList
          items={items}
          columns={columns}
          layoutMode={DetailsListLayoutMode.fixedColumns}
          selectionMode={SelectionMode.none}
        />
      )}
    </Stack>
  );
};

export default TicketCockpit;
