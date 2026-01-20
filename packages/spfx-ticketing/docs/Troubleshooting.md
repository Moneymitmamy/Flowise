# Troubleshooting

## Häufige Fehler
- **Ticket nicht gefunden**: TicketId fehlt in der URL oder Liste hat keine Übereinstimmung.
- **E-Mail konnte nicht gesendet werden**: Prüfen Sie Graph-Berechtigungen oder Power Automate Endpoint.
- **Health Check Fehler**: Liste existiert nicht oder falscher Listenname.

## Berechtigungen
- Agenten benötigen mindestens Lesen/Schreiben auf Tickets und TicketTimeline.
- Shared Mailbox Rechte für Send-As.

## Idempotenz
- Wenn eine E-Mail als Duplikat erkannt wird, prüfen Sie die Timeline auf IdempotencyKey.

## Logging
- Aktivieren Sie AppLogs, um Fehlermeldungen nachzuverfolgen.
