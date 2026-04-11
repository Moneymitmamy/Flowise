# Google Drive AI Organizer – Setup Anleitung

## Überblick
Dieser n8n-Workflow scannt deine komplette Google Drive, nutzt GPT-4o zur
Kategorisierung, erstellt eine optimale Ordnerstruktur und sortiert alle Dateien ein.

---

## Schritt 1: Google Drive Credentials in n8n einrichten

1. n8n öffnen → **Credentials** → **Add Credential**
2. Typ wählen: **Google Drive OAuth2 API**
3. Eintragen:
   - **Client ID:** `408331659955-ma6gc4hsqe68s17gc5dq9kcc55c2i3v5.apps.googleusercontent.com`
   - **Client Secret:** *(neu generiertes Secret – das alte wurde kompromittiert!)*
4. **OAuth Redirect URL** aus n8n kopieren und in Google Cloud Console eintragen
5. **Connect** klicken und Google-Account authorisieren
6. Credential benennen: `Google Drive (Mein Account)`

> ⚠️ **WICHTIG:** Generiere in der Google Cloud Console einen NEUEN OAuth Secret!
> Das alte Secret wurde in einem Chat geteilt und muss als kompromittiert betrachtet werden.

---

## Schritt 2: OpenAI Credentials einrichten

1. n8n → **Credentials** → **Add Credential**
2. Typ: **OpenAI API**
3. **API Key:** *(neuen Key generieren – der alte wurde kompromittiert!)*
4. Benennen: `OpenAI (Mein Account)`

> ⚠️ **WICHTIG:** Generiere auf platform.openai.com einen NEUEN API Key!

---

## Schritt 3: Workflow importieren

1. n8n → **Workflows** → **Import from file**
2. `google-drive-ai-organizer.json` auswählen
3. In jedem Node mit Google Drive / OpenAI die Credentials auswählen
   (die soeben erstellten)

---

## Schritt 4: Workflow anpassen (optional)

### Batch-Größe ändern
Im Node **"Code: In Batches aufteilen"** die Variable `BATCH_SIZE = 80` anpassen.
- Kleinerer Wert = mehr API-Calls, aber genauere Analyse
- Größerer Wert = schneller, aber evtl. unvollständig

### Duplikate nicht löschen, nur markieren
Im Node **"Code: AI-Antworten zusammenführen"** kannst du `action: 'delete_duplicate'`
durch `action: 'keep'` ersetzen, um Duplikate nur zu markieren.

---

## Workflow-Ablauf

```
Start
  └─> Drive: Alle Dateien listen (komplett, inkl. Metadaten)
        └─> Code: Aufbereiten & Duplikate per MD5 erkennen
              └─> In 80er-Batches aufteilen
                    └─> OpenAI GPT-4o: Jede Datei kategorisieren
                          └─> Alle Antworten zusammenführen
                                └─> OpenAI: Ordnerstruktur optimieren
                                      └─> Ordner erstellen (einer nach dem anderen)
                                            └─> Dateien verschieben
                                                  └─> Duplikate löschen
                                                        └─> Zusammenfassung
```

---

## Google Cloud Console – Benötigte APIs

Stelle sicher, dass diese APIs aktiviert sind:
- **Google Drive API**
- **Google Sheets API** (optional)

Redirect URI in OAuth-Client hinzufügen:
`https://DEINE-N8N-URL/rest/oauth2-credential/callback`

---

## Kosten-Schätzung (OpenAI)

| Drive-Größe | Batches | Geschätzte Kosten |
|-------------|---------|-------------------|
| ~100 Dateien | 2 | ~$0.05 |
| ~500 Dateien | 7 | ~$0.20 |
| ~2000 Dateien | 25 | ~$0.80 |

GPT-4o ist günstig für diese Textaufgabe.

---

## Troubleshooting

**"No credentials found"** → Credentials in jedem Node neu auswählen

**"Quota exceeded"** → BATCH_SIZE auf 40 reduzieren, Workflow neu starten

**"Cannot read file content"** → Normal für binäre Dateien; der Flow nutzt nur Metadaten

**Ordner werden doppelt erstellt** → Workflow-Static-Data zurücksetzen: im Workflow
auf "..." → "Reset static data" klicken
