# KEF Control Panel - TODO

Dieses Dokument beschreibt die Schritte zur Entwicklung der KEF-Lautsprecher-Steuerungsanwendung.

## Abgeschlossene Phasen

-   **Phase 1: Backend (PHP)**
    -   Grundstruktur erstellt (`api` Verzeichnis, `speakers.json`, `index.php` Router).
    -   Lautsprecher-Verwaltung (CRUD API) implementiert (`GET`, `POST`, `PUT`, `DELETE`, `reorder`).
    -   KEF Speaker API-Integration mit `KefConnector.php` (HTTP-basiert) implementiert.
    -   Control API Endpunkte (`GET /api/speakers/{id}/status`, `POST /api/speakers/{id}/control`, `GET/POST /api/speaker/{id}/power`) implementiert.
    -   Anwendungseinstellungen (Basis-URL, Basispfad, Debug-Modus) in `config.json` und `config.php` implementiert.

-   **Phase 2: Frontend (HTML/JavaScript)**
    -   Grundgerüst (HTML & CSS) erstellt (`index.html`, `css/style.css`, `js/app.js`, `js/api.js`).
    -   Dashboard-Ansicht mit Lautsprecherkarten, Statusanzeige und Steuerungselementen (Power, Volume, Source, Mute) implementiert.
    -   Einstellungs-Ansicht (CRUD-Interface für Lautsprecher) implementiert.
    -   Drag-and-Drop-Funktionalität für Lautsprecher-Reihenfolge implementiert.
    -   Anwendungseinstellungen im Frontend konfigurierbar gemacht.
    -   Automatische Erkennung und Speicherung des Lautsprechermodellnamens beim Hinzufügen/Bearbeiten von Lautsprechern.
    -   Lokales Hosting externer Ressourcen (MDL, SortableJS, Fonts) implementiert.
    -   Debug-Modus (UI-Button und Log-Steuerung) implementiert.
    -   API-Info-Overlay mit generierten GET-Request-Links implementiert, aktualisiert mit korrekten Source-Beispielen und Basis-URL aus den Einstellungen.
    -   Manuelle und automatische Refresh-Optionen implementiert.
    -   Wiedergabesteuerung (Play/Pause, Nächster/Vorheriger Titel) implementiert.

-   **Phase 3: Fehlerbehandlung und UX-Verfeinerung**
    -   Detaillierte Fehlermeldungen im Frontend mittels Snackbar-Nachrichten implementiert.

## Nächste Schritte / Mögliche Erweiterungen

-   **Fehlerbehandlung und UX-Verfeinerung:**
    -   Ladeindikatoren für alle API-Aufrufe.
    -   Bessere visuelle Rückmeldung bei fehlgeschlagenen Aktionen.
-   **Erweiterte Lautsprecher-Informationen:**
    -   Anzeige von Song-Informationen (Titel, Künstler, Album-Cover) im Dashboard.
    -   Anzeige weiterer System-Infos (MAC-Adresse, Firmware-Version) in den Einstellungen.
-   **DSP-Einstellungen:**
    -   Implementierung von DSP-Steuerungselementen im Frontend (falls gewünscht).
-   **Quellen-Mapping:**
    -   Dynamisches Mapping von Quell-Strings zu benutzerfreundlichen Namen im Frontend.
-   **Authentifizierung/Autorisierung:**
    -   Falls die Anwendung öffentlich zugänglich gemacht wird, wäre eine einfache Authentifizierung sinnvoll.
-   **Responsives Design:**
    -   Weitere Optimierungen für verschiedene Bildschirmgrößen und Geräte.