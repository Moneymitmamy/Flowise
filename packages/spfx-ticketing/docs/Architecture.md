# Architekturübersicht

## Komponenten
- **Ticket-Cockpit**: Übersicht, Filter, Suche, KPI-ähnliche Sichten.
- **Ticket-Detail**: Timeline, Antworten mit Templates, Statuspflege.
- **Ticket-Setup**: Konfiguration und Health Check.

## Datenhaltung (SharePoint)
- Tickets
- TicketTimeline
- ReplyTemplates
- (Optional) AppLogs

## E-Mail Versand
- **Primär**: Microsoft Graph `SendMail` (delegiert oder optional Application).
- **Fallback**: Power Automate HTTP Trigger + Outlook Connector (Standard).

## Sicherheit
- Keine Secrets im Client.
- Least-Privilege: Listenrechte + Mail.Send nur für Agenten.
- Logging optional in AppLogs.

## Resilienz
- IdempotencyKey pro Sendevorgang.
- Fehlermeldungen in deutscher Sprache.

## Ticket-ID Logik
- Format: `{Prefix}{YYYY}-{6-stellige Sequenz}`.
- Ticket-ID wird im Betreff als `[{TicketId}]` ergänzt.
- Parsing erfolgt über Regex in der UI-Logik.
