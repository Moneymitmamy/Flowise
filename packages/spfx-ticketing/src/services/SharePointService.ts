import { WebPartContext } from '@microsoft/sp-webpart-base';
import { spfi, SPFI } from '@pnp/sp';
import { SPFx } from '@pnp/sp/behaviors/spfx';
import { IAppConfig } from '../models/ConfigModels';
import { ITicket, ITicketFilters, ITimelineEntry, IReplyTemplate } from '../models/TicketModels';

export class SharePointService {
  private sp: SPFI;

  constructor(private context: WebPartContext, private config: IAppConfig) {
    this.sp = spfi().using(SPFx(context));
  }

  public async getTickets(filters: ITicketFilters, top = 20): Promise<ITicket[]> {
    const list = this.sp.web.lists.getByTitle(this.config.ticketsListTitle);
    const odataFilters: string[] = [];

    if (filters.status) {
      odataFilters.push(`Status eq '${filters.status}'`);
    }
    if (filters.assignedToId) {
      odataFilters.push(`AssignedToId eq ${filters.assignedToId}`);
    }
    if (filters.unassigned) {
      odataFilters.push('AssignedToId eq null');
    }
    if (filters.search) {
      odataFilters.push(`substringof('${filters.search}', Title) or substringof('${filters.search}', TicketId)`);
    }
    if (filters.overdue) {
      const nowIso = new Date().toISOString();
      odataFilters.push(`DueDate lt datetime'${nowIso}'`);
      odataFilters.push(`Status ne 'Erledigt'`);
    }
    if (filters.doneToday) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      odataFilters.push(`Modified ge datetime'${start.toISOString()}' and Modified lt datetime'${end.toISOString()}'`);
    }

    const filterQuery = odataFilters.length > 0 ? odataFilters.join(' and ') : undefined;

    const items = await list.items
      .select('Id', 'Title', 'TicketId', 'Status', 'Priority', 'AssignedTo/Title', 'AssignedToId', 'RequesterName', 'RequesterEmail', 'Channel', 'Category', 'DueDate', 'LastActionAt', 'Created', 'Modified', 'FieldSalesEmail')
      .expand('AssignedTo')
      .filter(filterQuery || '')
      .orderBy('Modified', false)
      .top(top)();

    return items.map((item) => ({
      id: item.Id,
      title: item.Title,
      ticketId: item.TicketId,
      status: item.Status,
      priority: item.Priority,
      assignedTo: item.AssignedTo?.Title,
      assignedToId: item.AssignedToId,
      requesterName: item.RequesterName,
      requesterEmail: item.RequesterEmail,
      channel: item.Channel,
      category: item.Category,
      dueDate: item.DueDate,
      lastActionAt: item.LastActionAt,
      created: item.Created,
      modified: item.Modified,
      fieldSalesEmail: item.FieldSalesEmail
    }));
  }

  public async getTicketById(ticketId: string): Promise<ITicket | null> {
    const list = this.sp.web.lists.getByTitle(this.config.ticketsListTitle);
    const items = await list.items
      .select('Id', 'Title', 'TicketId', 'Status', 'Priority', 'AssignedTo/Title', 'AssignedToId', 'RequesterName', 'RequesterEmail', 'Channel', 'Category', 'DueDate', 'LastActionAt', 'Created', 'Modified', 'FieldSalesEmail', 'ThreadKey')
      .expand('AssignedTo')
      .filter(`TicketId eq '${ticketId}'`)
      .top(1)();

    if (!items.length) {
      return null;
    }

    const item = items[0];
    return {
      id: item.Id,
      title: item.Title,
      ticketId: item.TicketId,
      status: item.Status,
      priority: item.Priority,
      assignedTo: item.AssignedTo?.Title,
      assignedToId: item.AssignedToId,
      requesterName: item.RequesterName,
      requesterEmail: item.RequesterEmail,
      channel: item.Channel,
      category: item.Category,
      dueDate: item.DueDate,
      lastActionAt: item.LastActionAt,
      created: item.Created,
      modified: item.Modified,
      fieldSalesEmail: item.FieldSalesEmail,
      threadKey: item.ThreadKey
    };
  }

  public async getTimeline(ticketItemId: number): Promise<ITimelineEntry[]> {
    const list = this.sp.web.lists.getByTitle(this.config.timelineListTitle);
    const items = await list.items
      .select('Id', 'TicketLookupId', 'EntryType', 'Body', 'From', 'To', 'Cc', 'MessageId', 'SentAt', 'Author/Title', 'IdempotencyKey')
      .expand('Author')
      .filter(`TicketLookupId eq ${ticketItemId}`)
      .orderBy('Created', true)();

    return items.map((item) => ({
      id: item.Id,
      ticketLookupId: item.TicketLookupId,
      entryType: item.EntryType,
      body: item.Body,
      from: item.From,
      to: item.To,
      cc: item.Cc,
      messageId: item.MessageId,
      sentAt: item.SentAt,
      createdBy: item.Author?.Title,
      idempotencyKey: item.IdempotencyKey
    }));
  }

  public async addTimelineEntry(entry: Omit<ITimelineEntry, 'id'>): Promise<void> {
    await this.sp.web.lists.getByTitle(this.config.timelineListTitle).items.add({
      TicketLookupId: entry.ticketLookupId,
      EntryType: entry.entryType,
      Body: entry.body,
      From: entry.from,
      To: entry.to,
      Cc: entry.cc,
      MessageId: entry.messageId,
      SentAt: entry.sentAt,
      IdempotencyKey: entry.idempotencyKey
    });
  }

  public async updateTicket(ticketItemId: number, fields: Record<string, unknown>): Promise<void> {
    await this.sp.web.lists.getByTitle(this.config.ticketsListTitle).items.getById(ticketItemId).update(fields);
  }

  public async getTemplates(category?: string): Promise<IReplyTemplate[]> {
    const list = this.sp.web.lists.getByTitle(this.config.templatesListTitle);
    const filters = [`Active eq 1`];
    if (category) {
      filters.push(`Category eq '${category}'`);
    }

    const items = await list.items
      .select('Id', 'TemplateName', 'Category', 'Audience', 'SubjectTemplate', 'BodyTemplate', 'Active')
      .filter(filters.join(' and '))();

    return items.map((item) => ({
      id: item.Id,
      templateName: item.TemplateName,
      category: item.Category,
      audience: item.Audience,
      subjectTemplate: item.SubjectTemplate,
      bodyTemplate: item.BodyTemplate,
      active: item.Active
    }));
  }

  public async idempotencyExists(idempotencyKey: string, ticketItemId: number): Promise<boolean> {
    const list = this.sp.web.lists.getByTitle(this.config.timelineListTitle);
    const items = await list.items
      .select('Id', 'IdempotencyKey')
      .filter(`TicketLookupId eq ${ticketItemId} and IdempotencyKey eq '${idempotencyKey}'`)
      .top(1)();
    return items.length > 0;
  }
}
