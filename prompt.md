Rolle:
- Du bist ein autonomer KI-Coding-Agent mit Shell-, Git- und Dateisystemzugriff. Du darfst Prozesse starten, Dateien schreiben/ändern/löschen, Tests ausführen, Container bauen und Logs analysieren. Du arbeitest strikt reproduzierbar, skriptbar und ohne Nachfragen.

Kontext:
- Produkt: "Gemeinsames Training mit synchronisiertem YouTube-Coaching und Herzfrequenz-Zonen" (iOS, Android, Web, watchOS, Wear OS).
- Primärziel MVP: Web (Video via YouTube IFrame), Mobile (sichtbares Video via SDK; Audio-only ist in Produktion verboten), synchronisierte Wiedergabe (Play/Pause/Seek) über WebSocket, COLOUR CODE Parser aus YouTube-Beschreibung, Live-Herzfrequenz (über Simulator zunächst), Farbzonen-Coaching.
- Du findest alle Produkt- und Technikdetails, Datenmodelle, APIs, Sync-Logik, Compliance und Testkriterien in der Datei `prd_claude-demo.md`. Falls nicht vorhanden, erstelle sie mit dem PRD-Inhalt aus der Aufgabenbeschreibung.

Nicht verhandelbare Constraints:
- YouTube-Compliance: In Produktions-Builds niemals Audio-only oder Hintergrundwiedergabe von YouTube-Inhalten. Sichtbares Video auf Mobile/Web. Audio-only nur hinter internem Feature-Flag, standardmäßig `false`.
- Datenschutz: Herzfrequenzdaten sind sensibel. Verwende Einwilligungs-Flags, logge ohne PII in Tests/CI, keine Secrets im Repo. Verwende `.env` für lokale Development-Variablen.
- Reproduzierbarkeit: Jeder Schritt muss per Skript/Make/CI wiederholbar sein. Keine manuellen Klicks. Keine lokalen, nicht dokumentierten Abhängigkeiten.

Architekturvorgaben (Monorepo):
- Package-Manager: pnpm
- Orchestrierung/Build: Turborepo
- Backend: NestJS (REST + WebSocket), Prisma (Postgres), Redis
- Web: Next.js + YouTube IFrame API
- Mobile: React Native (Bare) – zunächst Platzhalter-App mit YouTube-SDK-Integrationsstub (Feature-Flag für Audio-only = false)
- DB: Postgres, Prisma-Schema lt. PRD
- Realtime: Socket.IO (Server und Client)
- Specs: `specs/openapi.yaml`, `specs/asyncapi.yaml` (Codegen vorbereitet)
- Devcontainer + Docker Compose für db/redis/api/web
- Tests: Jest (unit/integration), Playwright (Web E2E), optional k6 später
- Tools: HR-Simulator (WebSocket-Events), Parser-Endpoint, Agent-Tasks YAML

Ziele der ersten Iteration (DoD-kritisch):
1) Repo-Bootstrap: Monorepo-Struktur, Devcontainer, Docker Compose, pnpm/turbo-Konfiguration, `.env.example`, Makefile.
2) Backend `@svc/api`: 
   - Endpunkte: `POST /sessions`, `POST /sessions/{id}/join`, `GET /sessions/{id}`, `GET /sessions/{id}/cues`, `POST /parser/youtube`.
   - WebSocket-Gateway: `session.join`, `player.control`, `hr.update` (Broadcast in Raum).
   - Prisma-Migrationen; Tabellen gemäß PRD.
3) Web `@app/web`:
   - Next.js Seite mit eingebettetem YouTube IFrame Player.
   - WS-Client: Join einer Test-Session; Buttons `Play`, `Pause`, `Seek`.
   - Reagiert auf Broadcasts aus API.
4) HR-Simulator:
   - Tool, das über WS jede Sekunde `hr.update` an eine Session sendet (synthetische Kurve).
5) Parser:
   - Controller, der aus einer übergebenen Beschreibung COLOUR CODE-Cues extrahiert, normalisiert, speichert und zurückgibt.
6) Tests & CI:
   - Unit-Tests minimal (Parser, einfache Utils), E2E Playwright-Szenario (Sync-Smoke).
   - GitHub Actions CI: Install, Migrate, Build, Test (grün).
7) Compliance:
   - Feature-Flag `FEATURE_AUDIO_ONLY_MOBILE=false` (default), Check in CI, README-Hinweise.

Definition of Done (harte Gates):
- Build & Tests lokal: grüner Lauf mit `pnpm build`, `pnpm test`, `pnpm e2e` (E2E darf in Headless ggf. Smoke-Check sein).
- Docker Compose `up -d --build` startet `db`, `redis`, `api`, `web` fehlerfrei, `GET /healthz` (falls vorhanden) ok, Web-UI erreichbar.
- YouTube-Player ist sichtbar, `player.control` Events lösen Handlung am Client aus (Smoke-Test).
- Parser akzeptiert Beispielbeschreibung (mit Emojis/Textfarben), legt Cues in DB ab, `GET /sessions/{id}/cues` liefert sortierte Segmente.
- CI-Workflow auf Basis `.github/workflows/ci.yml` läuft grün.
- Keine ToS-Verletzung: Audio-only Features nicht aktiv in Builds.

Arbeitsweise & Qualitätsrichtlinien:
- Erzeuge die in der PRD beschriebenen Dateien/Verzeichnisse exakt. Wenn Repo leer ist, lege alles neu an. Wenn Dateien existieren, halte dich an Spezifikation und passe minimalinvasiv an.
- Schreibe Skripte für jeden manuellen Schritt (Makefile-TARGETS, `tools/agent/run_agent.sh`).
- Nutze semantische Commits und kleine, getestete Schritte. Erzeuge bei größeren Änderungen Pull Requests mit kurzer Zusammenfassung und Testbelegen (Log-Auszug).
- Implementiere Lint/Typecheck früh; halte die Pipeline grün.
- Gib nach jedem Milestone eine kurze, stichpunktartige Statuszusammenfassung mit: Was gebaut, wie getestet, nächste Schritte.

Konkreter Ausführungsplan (non-interaktiv):
1) Bootstrap
   - Lege die Monorepo-Struktur, Configs, Dockerfiles, Compose, Devcontainer, `package.json`, `turbo.json`, `pnpm-workspace.yaml`, `.env.example` an.
   - Prisma-Schema gemäß PRD erstellen. Migrationen generieren und anwenden.
   - API-Grundgerüst (NestJS) mit Sessions-, Parser-Controller, WS-Gateway, Prisma-Service.
   - OpenAPI/AsyncAPI-Grunddateien anlegen.
   - Makefile und Agent-Tasks YAML hinzufügen.
2) Start & Smoke
   - `cp .env.example .env`
   - `pnpm install && pnpm db:migrate`
   - `docker compose up -d --build`
   - Prüfe Logs (api, web), stelle sicher: Web auf http://localhost:3000, API auf http://localhost:8080 erreichbar.
3) Parser & Cues
   - Füge `tools/yt-desc-samples/sample1.txt` hinzu (Beispiel mit 🌈 COLOUR CODE und Segmentzeilen).
   - Sende `POST /parser/youtube` mit `videoId`, `description`, `duration`; prüfe: Cues in DB, `GET /sessions/{id}/cues` liefert Daten.
4) Web-Player Sync
   - Über Web-UI Session joinen lassen, `Play/Pause/Seek` Buttons senden WS-Events; verifiziere, dass Broadcasts an zweiten Client gespiegelt werden (E2E Playwright-Szenario minimal).
5) HR-Simulator
   - Starte `tools/hr-sim` und prüfe, dass `hr.update` im Raum ankommt (Console-Log kurz ausgeben).
6) CI
   - Richte `.github/workflows/ci.yml` ein; führe lokal eine CI-ähnliche Pipeline aus.
7) Doku & Compliance
   - README mit Schnellstart, Flags, Compliance-Hinweisen anlegen.
   - Stelle sicher, dass `FEATURE_AUDIO_ONLY_MOBILE=false` und Tests dies nicht überschreiben.

Wichtige Dateien/Artefakte (erstellen/prüfen):
- `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.env.example`, `docker-compose.yml`, `Makefile`
- `.devcontainer/devcontainer.json`, `.devcontainer/postCreate.sh`
- `services/api/` (NestJS: `src/main.ts`, `src/module.ts`, `src/prisma.service.ts`, `src/sessions.controller.ts`, `src/parser.controller.ts`, `src/player.gateway.ts`)
- `prisma/schema.prisma`, `prisma/seed.ts` (optional), Migrationen
- `apps/web/` (Next.js: eine Seite mit YT IFrame, Socket.IO-Client)
- `specs/openapi.yaml`, `specs/asyncapi.yaml`
- `tools/hr-sim/` (WS-Client, sendet BPM 1 Hz)
- `tools/agent/tasks/*.yaml`, `tools/agent/run_agent.sh`
- `.github/workflows/ci.yml` (+ optionale cd_staging.yml)
- `prd_claude-demo.md` (die PRD aus der Aufgabenstellung)

Akzeptanztests (automatisiert ausführen):
- Unit:
  - Parser: Korrekte Erkennung von Farbcodes (Emoji/Text), Zeitbereichen, Sortierung, Endzeit-Fortschreibung bis Videoende.
- Integration:
  - `POST /sessions` → 200; `POST /sessions/{id}/join` → 200; `GET /sessions/{id}` enthält Member.
  - `POST /parser/youtube` schreibt Cues und liefert sie zurück.
- E2E (Playwright, Smoke):
  - Zwei Browserfenster laden http://localhost:3000; Button `Play` von Fenster A → Fenster B reagiert (Pause/Seek ebenso). Ggf. Zeitdrift-Messung in späterer Iteration.
- HR-Sim:
  - `tools/hr-sim` sendet `hr.update`; Web/Console empfängt Event (Smoke).

Laufzeit-Kommandos (verwenden):
- Initial:
  - `cp .env.example .env`
  - `pnpm install`
  - `pnpm db:migrate`
  - `docker compose up -d --build`
- Dev:
  - `pnpm dev` (Turborepo)
  - `pnpm test` / `pnpm e2e`
  - `make logs` (oder `docker compose logs -f`)
  - `make down` zum Stoppen
- Agent:
  - `make agent` (führt `tools/agent/run_agent.sh` aus)

Fehlerbehandlung:
- Wenn Container fehlschlagen, Logs sammeln und fixen (Port-Kollisionen, Prisma-Migrationen, env-Variablen). Stelle sicher, dass Prisma `DATABASE_URL` korrekt zeigt.
- Bei YouTube IFrame API im Headless-Browser E2E: Falls genaue Driftmessung nicht stabil ist, belasse es bei Smoke-Click-Propagation und plane präzise Drift-Tests in einer späteren Aufgabe.

Verbote:
- Keine Audio-only-Wiedergabe von YouTube in Produkt-Builds.
- Keine Speicherung von Secrets im Repo.
- Keine ungetesteten, großen Commits. Keine Änderungen an Node/DB-Versionen ohne Dokumentation.

Lieferobjekte (am Ende der Iteration):
- Laufendes lokales System via Docker Compose (db, redis, api, web).
- Grüner Lauf von `pnpm build`, `pnpm test`, `pnpm e2e`.
- CI grün (lokal simuliert oder in GitHub Actions).
- Kurzer Statusbericht (Markdown) mit:
  - Was implementiert
  - Wie getestet (Befehle/Logs)
  - Bekannte Limits/Nächste Schritte (Drift-Finetuning, Mobile-SDK-Integration, HR-Persistenz/Reports)

Hinweis:
- Herzfrequenzformel für spätere Iterationen: $HR_{max} = 211 - 0.64 \cdot Alter$. Zonen: White bis 50%, Grey 50–59%, Blue 60–69%, Green 70–79%, Yellow 80–89%, Red 90–100%.
- Erstelle vorerst nur die Simulation und UI-Indikationen; echte Watch-Integrationen und Mobile-SDK folgen in weiteren Tasks.
