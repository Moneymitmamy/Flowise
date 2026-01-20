# Deployment Guide

## Build
```bash
npm install
npm run build
npm run bundle -- --ship
gulp package-solution --ship
```

## Tenant App Catalog
1. `spfx-ticketing-ui.sppkg` in den Tenant App Catalog hochladen.
2. App bereitstellen.
3. Zielsite öffnen und App hinzufügen.

## WebParts hinzufügen
- Moderne Seite bearbeiten.
- WebParts hinzufügen: **Ticket-Cockpit**, **Ticket-Detail**, **Ticket-Setup**.

## Konfiguration
- WebPart Properties setzen (Listen-Namen, Shared Mailbox, Prefix, Logging, Email Mode).
- Power Automate Endpoint eintragen, wenn Graph nicht erlaubt ist.
