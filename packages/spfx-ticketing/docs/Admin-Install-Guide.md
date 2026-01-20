# Admin Installationsleitfaden

## Voraussetzungen
- SharePoint Online Tenant App Catalog ist aktiviert.
- Benutzer:innen (Agents) haben Berechtigungen auf den Ticketlisten.
- Shared Mailbox existiert (z. B. `support@company.tld`).

## Deployment (Tenant App Catalog)
1. `.sppkg` aus `sharepoint/solution/spfx-ticketing-ui.sppkg` hochladen.
2. App tenantweit bereitstellen (falls nötig).
3. Zielsite auswählen und App hinzufügen.

## App-Registrierung (Microsoft Graph)
**Delegated SendMail:**
1. AAD App für SPFx hinzufügen (automatisch via Tenant Admin Center möglich).
2. Berechtigungen: `Mail.Send` (delegiert) nur für benannte Benutzergruppe.
3. Admin Consent erteilen.
4. Agents benötigen Send-As/Send-on-behalf Rechte auf der Shared Mailbox.

**Application SendMail (optional):**
- Nur verwenden, wenn der Tenant Application Permissions erlaubt.
- Admin Consent nötig, bevorzugt restriktive Mailbox-Access-Policy.

## Power Automate Fallback (Standard Connector)
- Flow mit HTTP-Trigger (anonymer Zugriff deaktiviert) und Outlook `Send an email (V2)`.
- Rückgabe JSON: `{ "messageId": "<id>" }`.
- Endpoint in Ticket-Setup hinterlegen.

## Konfiguration
- WebPart-Eigenschaften pro Seite setzen (Listen-Namen, Shared Mailbox, Prefix).
- Optional: AppLogs-Liste aktivieren und Schreibrechte einschränken.

## Sicherheit & Governance
- Keine Secrets im Client.
- Least-Privilege für Listenrechte und Graph-Berechtigungen.
- AppLogs optional, nur für Admins sichtbar.

## Monitoring
- Health Check im Ticket-Setup ausführen.
- SharePoint Audit Log für Listenaktivität nutzen.
