# Test Plan

## Unit Tests
- TicketId Parsing (`parseTicketIdFromSubject`)
- Template Placeholder Substitution (`applyTemplate`)

## Manual Tests
1. Ticket-Cockpit lädt Tickets und filtert korrekt.
2. Suche nach Ticket-ID liefert Ergebnisse.
3. Ticket-Detail zeigt Timeline.
4. Antwort senden via Graph (SendMail) funktioniert.
5. Power Automate Fallback sendet E-Mail.
6. Timeline-Log wird erstellt und Status aktualisiert.
7. Idempotency verhindert doppeltes Senden.
