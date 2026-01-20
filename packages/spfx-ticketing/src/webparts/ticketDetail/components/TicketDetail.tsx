import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Stack,
  Label,
  Dropdown,
  IDropdownOption,
  TextField,
  PrimaryButton,
  DefaultButton,
  MessageBar,
  MessageBarType,
  Spinner,
  Dialog,
  DialogType,
  DialogFooter
} from '@fluentui/react';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IAppConfig } from '../../../models/ConfigModels';
import { ITicket, ITimelineEntry, IReplyTemplate } from '../../../models/TicketModels';
import { SharePointService } from '../../../services/SharePointService';
import { AppLogger } from '../../../services/AppLogger';
import { EmailService } from '../../../services/EmailService';
import { applyTemplate } from '../../../utils/TemplateUtils';
import { buildIdempotencyKey } from '../../../utils/HashUtils';
import { formatDateTime } from '../../../utils/DateUtils';
import { formatTicketSubject } from '../../../utils/TicketIdUtils';

export interface ITicketDetailProps {
  context: WebPartContext;
  config: IAppConfig;
}

const TicketDetail: React.FC<ITicketDetailProps> = ({ context, config }) => {
  const [ticket, setTicket] = useState<ITicket | null>(null);
  const [timeline, setTimeline] = useState<ITimelineEntry[]>([]);
  const [templates, setTemplates] = useState<IReplyTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedTemplate, setSelectedTemplate] = useState<IReplyTemplate | undefined>();
  const [previewSubject, setPreviewSubject] = useState<string>('');
  const [previewBody, setPreviewBody] = useState<string>('');
  const [freeText, setFreeText] = useState<string>('');
  const [recipient, setRecipient] = useState<string>('Customer');
  const [customRecipient, setCustomRecipient] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const spService = useMemo(() => new SharePointService(context, config), [context, config]);
  const logger = useMemo(() => new AppLogger(context, config), [context, config]);
  const emailService = useMemo(() => new EmailService(context, config), [context, config]);

  const ticketIdParam = new URLSearchParams(window.location.search).get('TicketId')
    || new URLSearchParams(window.location.search).get('ticketId');

  const loadData = async (): Promise<void> => {
    setLoading(true);
    setError(undefined);
    try {
      if (!ticketIdParam) {
        setError('Ticket-ID fehlt in der URL.');
        return;
      }
      const ticketItem = await spService.getTicketById(ticketIdParam);
      if (!ticketItem) {
        setError('Ticket nicht gefunden.');
        return;
      }
      setTicket(ticketItem);
      const timelineItems = await spService.getTimeline(ticketItem.id);
      setTimeline(timelineItems);
    } catch (err) {
      logger.error('Ticketdaten konnten nicht geladen werden.', err);
      setError('Ticketdaten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const loadTemplates = async (): Promise<void> => {
      try {
        const items = await spService.getTemplates(selectedCategory);
        setTemplates(items);
      } catch (err) {
        logger.error('Templates konnten nicht geladen werden.', err);
      }
    };

    loadTemplates();
  }, [selectedCategory]);

  useEffect(() => {
    if (!ticket || !selectedTemplate) {
      setPreviewSubject('');
      setPreviewBody('');
      return;
    }

    const contextValues = {
      TicketId: ticket.ticketId,
      Name: ticket.requesterName,
      OrderNo: '',
      ShipLink: '',
      InvoiceCopy: ''
    };

    const subject = applyTemplate(selectedTemplate.subjectTemplate, contextValues);
    const body = applyTemplate(selectedTemplate.bodyTemplate, contextValues);

    setPreviewSubject(subject);
    setPreviewBody(body);
  }, [ticket, selectedTemplate]);

  const templateOptions: IDropdownOption[] = templates.map((template) => ({
    key: template.id,
    text: template.templateName
  }));

  const categoryOptions: IDropdownOption[] = [
    { key: 'Allgemein', text: 'Allgemein' },
    { key: 'Rechnung', text: 'Rechnung' },
    { key: 'Versand', text: 'Versand' }
  ];

  const recipientOptions: IDropdownOption[] = [
    { key: 'Customer', text: 'Kunde' },
    { key: 'FieldSales', text: 'Außendienst' },
    { key: 'Custom', text: 'Manuell' }
  ];

  const handleSend = async (): Promise<void> => {
    if (!ticket || !selectedTemplate) {
      setError('Bitte wählen Sie ein Template.');
      return;
    }

    setSending(true);
    setError(undefined);
    setSuccess(undefined);

    try {
      const to = recipient === 'FieldSales' ? ticket.fieldSalesEmail : ticket.requesterEmail;
      const recipientAddress = recipient === 'Custom' ? customRecipient : to;

      if (!recipientAddress) {
        setError('Empfänger fehlt.');
        return;
      }

      const subject = formatTicketSubject(ticket.ticketId, previewSubject || ticket.title);
      const body = `${previewBody}\n\n${freeText}`.trim();
      const idempotencyKey = await buildIdempotencyKey([
        ticket.ticketId,
        subject,
        body,
        new Date().toISOString().slice(0, 16),
        context.pageContext.user.loginName
      ]);

      const exists = await spService.idempotencyExists(idempotencyKey, ticket.id);
      if (exists) {
        setError('Diese E-Mail wurde bereits gesendet.');
        return;
      }

      const result = await emailService.sendMail({
        to: [recipientAddress],
        subject,
        body,
        idempotencyKey
      });

      if (!result.ok) {
        setError(result.error || 'E-Mail konnte nicht gesendet werden.');
        return;
      }

      await spService.addTimelineEntry({
        ticketLookupId: ticket.id,
        entryType: 'OutgoingEmail',
        body,
        from: config.sharedMailbox,
        to: recipientAddress,
        messageId: result.messageId,
        sentAt: new Date().toISOString(),
        idempotencyKey
      });

      await spService.updateTicket(ticket.id, {
        Status: 'Wartet auf Kunde',
        LastActionAt: new Date().toISOString(),
        Title: ticket.title
      });

      setSuccess('E-Mail gesendet und protokolliert.');
      setConfirmOpen(false);
      setFreeText('');
      await loadData();
    } catch (err) {
      logger.error('E-Mail Versand fehlgeschlagen.', err);
      setError('E-Mail konnte nicht gesendet werden.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <Spinner label="Laden..." />;
  }

  if (!ticket) {
    return <MessageBar messageBarType={MessageBarType.error}>{error ?? 'Ticket nicht gefunden.'}</MessageBar>;
  }

  return (
    <Stack tokens={{ childrenGap: 16 }}>
      <Label variant="large">Ticket-Detail</Label>
      <Stack horizontal tokens={{ childrenGap: 16 }}>
        <Stack>
          <Label>Ticket-ID</Label>
          <div>{ticket.ticketId}</div>
        </Stack>
        <Stack>
          <Label>Status</Label>
          <div>{ticket.status}</div>
        </Stack>
        <Stack>
          <Label>Letzte Aktion</Label>
          <div>{formatDateTime(ticket.lastActionAt)}</div>
        </Stack>
      </Stack>

      {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}
      {success && <MessageBar messageBarType={MessageBarType.success}>{success}</MessageBar>}

      <Stack tokens={{ childrenGap: 8 }}>
        <Label variant="large">Timeline</Label>
        {timeline.map((entry) => (
          <Stack key={entry.id} tokens={{ childrenGap: 4 }}>
            <Label>{entry.entryType} - {formatDateTime(entry.sentAt)}</Label>
            <div>{entry.body}</div>
          </Stack>
        ))}
      </Stack>

      <Stack tokens={{ childrenGap: 8 }}>
        <Label variant="large">Antworten</Label>
        <Dropdown
          label="Kategorie"
          options={categoryOptions}
          selectedKey={selectedCategory}
          onChange={(_, option) => setSelectedCategory(option?.key as string)}
        />
        <Dropdown
          label="Template"
          options={templateOptions}
          selectedKey={selectedTemplate?.id}
          onChange={(_, option) => {
            const template = templates.find((item) => item.id === option?.key);
            setSelectedTemplate(template);
          }}
        />
        <TextField label="Betreff" value={previewSubject} onChange={(_, value) => setPreviewSubject(value ?? '')} />
        <TextField label="Vorschau" multiline rows={6} value={previewBody} onChange={(_, value) => setPreviewBody(value ?? '')} />
        <TextField label="Freitext" multiline rows={4} value={freeText} onChange={(_, value) => setFreeText(value ?? '')} />
        <Dropdown
          label="Empfänger"
          options={recipientOptions}
          selectedKey={recipient}
          onChange={(_, option) => setRecipient(option?.key as string)}
        />
        {recipient === 'Custom' && (
          <TextField label="Empfängeradresse" value={customRecipient} onChange={(_, value) => setCustomRecipient(value ?? '')} />
        )}
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <PrimaryButton text="Senden" onClick={() => setConfirmOpen(true)} disabled={sending} />
          <DefaultButton text="Entwurf löschen" onClick={() => { setPreviewBody(''); setPreviewSubject(''); setFreeText(''); }} />
        </Stack>
      </Stack>

      <Dialog
        hidden={!confirmOpen}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'E-Mail senden',
          subText: 'Möchten Sie diese E-Mail wirklich senden?'
        }}
        onDismiss={() => setConfirmOpen(false)}
      >
        <DialogFooter>
          <PrimaryButton text="Senden" onClick={handleSend} disabled={sending} />
          <DefaultButton text="Abbrechen" onClick={() => setConfirmOpen(false)} />
        </DialogFooter>
      </Dialog>
    </Stack>
  );
};

export default TicketDetail;
