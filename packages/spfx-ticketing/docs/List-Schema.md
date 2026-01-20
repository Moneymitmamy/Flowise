# Listenschema

## Tickets (Liste)
- Title (Betreff)
- TicketId (Einzellinie Text, eindeutig)
- Status (Choice)
- Priority (Choice)
- AssignedTo (Person)
- RequesterName (Text)
- RequesterEmail (Text)
- Channel (Choice: Email, PDF, etc.)
- Category (Choice)
- DueDate (Datum)
- LastActionAt (Datum)
- SourceMessageId (Text)
- ThreadKey (Text)
- FieldSalesEmail (Text)
- ApprovalState (Choice, optional)

## TicketTimeline (Liste)
- TicketLookup (Lookup zu Tickets)
- EntryType (Choice: IncomingEmail, OutgoingEmail, InternalNote, StatusChange)
- Body (Mehrzeilig)
- From (Text)
- To (Text)
- Cc (Text)
- MessageId (Text)
- SentAt (Datum)
- IdempotencyKey (Text)

## ReplyTemplates (Liste)
- TemplateName (Text)
- Category (Choice)
- Audience (Choice: Customer, FieldSales, Internal)
- SubjectTemplate (Text)
- BodyTemplate (Mehrzeilig)
- Active (Ja/Nein)

## AppLogs (optional)
- Title
- Level (Choice: Info, Error)
- Data (Mehrzeilig)

## Indizes
- Tickets: TicketId (unique), Status, AssignedTo, DueDate.
- TicketTimeline: TicketLookup, SentAt.
