export type TicketStatus =
  | 'Neu'
  | 'In Bearbeitung'
  | 'Wartet auf Kunde'
  | 'Wartet auf Außendienst'
  | 'Erledigt'
  | 'Überfällig';

export interface ITicket {
  id: number;
  title: string;
  ticketId: string;
  status: TicketStatus;
  priority: string;
  assignedTo?: string;
  assignedToId?: number;
  requesterName: string;
  requesterEmail: string;
  channel: string;
  category: string;
  dueDate?: string;
  lastActionAt?: string;
  sourceMessageId?: string;
  threadKey?: string;
  fieldSalesEmail?: string;
  approvalState?: string;
  created?: string;
  modified?: string;
}

export interface ITimelineEntry {
  id: number;
  ticketLookupId: number;
  entryType: 'IncomingEmail' | 'OutgoingEmail' | 'InternalNote' | 'StatusChange';
  body: string;
  from?: string;
  to?: string;
  cc?: string;
  messageId?: string;
  sentAt?: string;
  createdBy?: string;
  idempotencyKey?: string;
}

export interface IReplyTemplate {
  id: number;
  templateName: string;
  category: string;
  audience: 'Customer' | 'FieldSales' | 'Internal';
  subjectTemplate: string;
  bodyTemplate: string;
  active: boolean;
}

export interface ITicketFilters {
  search?: string;
  status?: string;
  assignedToId?: number;
  unassigned?: boolean;
  overdue?: boolean;
  waitingForCustomer?: boolean;
  waitingForFieldSales?: boolean;
  doneToday?: boolean;
}
