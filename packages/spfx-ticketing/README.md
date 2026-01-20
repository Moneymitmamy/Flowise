# SPFx Ticketing UI (SharePoint Online)

Dieses Paket stellt eine produktionsreife SPFx-Lösung für ein SharePoint-basiertes Ticket-System bereit. Es enthält drei WebParts (Ticket-Cockpit, Ticket-Detail, Ticket-Setup), die über den Tenant App Catalog bereitgestellt werden können.

## Struktur

```
packages/spfx-ticketing
├── config
├── docs
├── scripts
├── src
│   ├── loc
│   ├── models
│   ├── services
│   ├── utils
│   └── webparts
└── tests
```

## Build

```bash
npm install
npm run build
npm run bundle -- --ship
gulp package-solution --ship
```

## Deployment (Kurz)

1. `.sppkg` in den Tenant App Catalog hochladen.
2. App für Zielsite bereitstellen.
3. WebParts auf modernen Seiten hinzufügen.

Details: siehe `docs/Admin-Install-Guide.md`.
