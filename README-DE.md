# KEF Control Panel

## Projektbeschreibung

Dies ist eine Webanwendung zur Steuerung von KEF LS50 Wireless II, LSX II und LS60 Lautsprechern. Sie bietet eine benutzerfreundliche Oberfläche zur Verwaltung mehrerer Lautsprecher, zur Steuerung ihrer Kernfunktionen (Ein/Aus, Lautstärke, Quelle, Stummschaltung) und eine REST-API für die externe Integration.

## Verwendete Technologien

-   **Backend:** PHP
    -   Verwaltet die Lautsprecherkonfiguration (gespeichert in `speakers.json`).
    -   Bietet eine REST-API zur Lautsprechersteuerung und Statusabfrage.
    -   Verwendet die `KefConnector`-Klasse zur Kommunikation mit KEF-Lautsprechern über deren HTTP-API.
-   **Frontend:** HTML, JavaScript, CSS
    -   Single-Page-Anwendung (SPA)-Struktur.
    -   **Material Design Lite (MDL):** Für eine reaktionsschnelle und moderne Benutzeroberfläche.
    -   **SortableJS:** Für Drag-and-Drop-Funktionalität beim Neuanordnen von Lautsprechern.

## Hauptmerkmale

-   **Lautsprecherverwaltung (CRUD):** Hinzufügen, Bearbeiten, Löschen und Neuanordnen von Lautsprechern.
-   **Dashboard:** Zeigt konfigurierte Lautsprecher mit Echtzeit-Statusaktualisierungen an, einschließlich Lautsprecher-ID und Modellname.
-   **Kernsteuerungen:** Ein-/Ausschalten, Lautstärkeregelung, Quellenauswahl, Stummschalten/Stummschaltung aufheben.
-   **Wiedergabesteuerung:** Wiedergabe/Pause, nächster Titel, vorheriger Titel.
-   **Gruppensteuerungen:** Alle Lautsprecher ausschalten oder alle gleichzeitig stummschalten/Stummschaltung aufheben.
-   **REST-API:** Ermöglicht externen Anwendungen die Steuerung von Lautsprechern über GET- und POST-Anfragen.
-   **Anwendungseinstellungen:** Konfigurieren der Basis-URL und des Basispfads der Anwendung. Steuerung des Debug-Modus (aktiviert/deaktiviert Debug-Logging und Sichtbarkeit der UI-Schaltflächen).
-   **Debug-Modus:** Schaltet die Anzeige von Roh-API-Antworten zur Fehlerbehebung um.
-   **API-Info-Overlay:** Bietet eine schnelle Referenz für GET-API-Endpunkte für jeden konfigurierten Lautsprecher.
-   **Manuelle Aktualisierung:** Schaltfläche zur manuellen Aktualisierung des Lautsprecherstatus.
-   **Auto-Refresh-Umschalter:** Schaltfläche zum Anhalten/Fortsetzen automatischer Statusaktualisierungen.

## Webinterface

Die Weboberfläche bietet eine benutzerfreundliche Möglichkeit, Ihre KEF-Lautsprecher zu steuern.

### Dashboard
![Webinterface Screenshot](screenshots/interface.png)

### API Info Overlay
![API Info Overlay Screenshot](screenshots/api.png)

## So führen Sie die Anwendung aus

### Mit dem PHP-Entwicklungsserver

1.  **Voraussetzungen:** Stellen Sie sicher, dass PHP installiert ist.
2.  **Zum Projektstammverzeichnis navigieren:** Öffnen Sie Ihr Terminal und navigieren Sie zum Stammverzeichnis des Projekts (`/Users/marcus/Projects/kef`).
3.  **PHP-Entwicklungsserver starten:** Führen Sie den folgenden Befehl aus:
    ```bash
    php -S localhost:8000
    ```
    (Sie können `localhost:8000` in Ihren gewünschten Host und Port ändern.)
4.  **Im Browser aufrufen:** Öffnen Sie Ihren Webbrowser und gehen Sie zu `http://localhost:8000` (oder Ihrem konfigurierten Host und Port).

### Mit Docker Compose (V1 - Legacy)

1.  **Voraussetzungen:** Stellen Sie sicher, dass Docker und Docker Compose (V1) installiert sind.
2.  **Zum Projektstammverzeichnis navigieren:** Öffnen Sie Ihr Terminal und navigieren Sie zum Stammverzeichnis des Projekts (`/Users/marcus/Projects/kef`).
3.  **Mit Docker Compose bauen und ausführen:** Führen Sie den folgenden Befehl aus:
    ```bash
    docker-compose up --build -d
    ```
    Dieser Befehl erstellt das Docker-Image und startet den Container im Hintergrund. Die Dateien `config.json`, `debug.log` und `speakers.json` werden lokal im Verzeichnis `./data/` Ihres Projekts gespeichert, dank Docker-Volumes.
4.  **Im Browser aufrufen:** Öffnen Sie Ihren Webbrowser und gehen Sie zu `http://localhost:8000`.
5.  **Anwendung stoppen:** Um die Docker-Container zu stoppen, führen Sie aus:
    ```bash
    docker-compose down
    ```

### Mit Docker Compose (V2 - Plugin)

1.  **Voraussetzungen:** Stellen Sie sicher, dass Docker und Docker Compose (V2) Plugin installiert sind.
2.  **Zum Projektstammverzeichnis navigieren:** Öffnen Sie Ihr Terminal und navigieren Sie zum Stammverzeichnis des Projekts (`/Users/marcus/Projects/kef`).
3.  **Mit Docker Compose bauen und ausführen:** Führen Sie den folgenden Befehl aus:
    ```bash
    docker compose up --build -d
    ```
    Dieser Befehl erstellt das Docker-Image und startet den Container im Hintergrund. Die Dateien `config.json`, `debug.log` und `speakers.json` werden lokal im Verzeichnis `./data/` Ihres Projekts gespeichert, dank Docker-Volumes.
4.  **Im Browser aufrufen:** Öffnen Sie Ihren Webbrowser und gehen Sie zu `http://localhost:8000`.
5.  **Anwendung stoppen:** Um die Docker-Container zu stoppen, führen Sie aus:
    ```bash
    docker compose down
    ```

## API-Endpunkte Übersicht

Die Anwendung stellt eine REST-API zur Lautsprechersteuerung bereit. Alle API-Endpunkte sind relativ zur Basis-URL und zum Basispfad der Anwendung (z.B. `http://localhost:8000/api/...`).

-   **Lautsprecherverwaltung:**
    -   `GET /api/speakers`: Alle konfigurierten Lautsprecher abrufen.
    -   `POST /api/speakers`: Neuen Lautsprecher hinzufügen.
        ```bash
        curl -X POST -H "Content-Type: application/json" -d '{"name":"Wohnzimmer Lautsprecher","ip":"192.168.1.100"}' http://localhost:8000/api/speakers
        ```
    -   `PUT /api/speakers/{id}`: Bestehenden Lautsprecher aktualisieren.
        ```bash
        curl -X PUT -H "Content-Type: application/json" -d '{"name":"Aktualisierter Wohnzimmer Lautsprecher"}' http://localhost:8000/api/speakers/YOUR_SPEAKER_ID
        ```
    -   `DELETE /api/speakers/{id}`: Lautsprecher löschen.
        ```bash
        curl -X DELETE http://localhost:8000/api/speakers/YOUR_SPEAKER_ID
        ```
    -   `POST /api/speakers/reorder`: Lautsprecher neu anordnen.
        ```bash
        curl -X POST -H "Content-Type: application/json" -d '["ID1", "ID3", "ID2"]' http://localhost:8000/api/speakers/reorder
        ```

-   **Lautsprechersteuerung (GET & POST):**
    -   `GET /api/speaker/{id}/power/{state}`: Stromstatus oder Quelle einstellen.
        -   Einschalten: `http://localhost:8000/api/speaker/YOUR_SPEAKER_ID/power/on`
        -   Ausschalten: `http://localhost:8000/api/speaker/YOUR_SPEAKER_ID/power/off`
        -   Quelle einstellen (z.B. Optisch): `http://localhost:8000/api/speaker/YOUR_SPEAKER_ID/power/optical` (Hinweis: Das Einstellen einer Quelle schaltet den Lautsprecher auch ein, falls er ausgeschaltet ist.)
    -   `POST /api/speaker/{id}/power`: Stromstatus über JSON-Body einstellen.
        ```bash
        curl -X POST -H "Content-Type: application/json" -d '{"state": "on"}' http://localhost:8000/api/speaker/YOUR_SPEAKER_ID/power
        ```
    -   `GET /api/speaker/{id}/control/{action}/{value}`: Lautsprecheraktionen steuern.
        -   Lautstärke auf 50 einstellen: `http://localhost:8000/api/speaker/YOUR_SPEAKER_ID/control/setVolume/50`
        -   Stummschalten: `http://localhost:8000/api/speaker/YOUR_SPEAKER_ID/control/mute`
        -   Stummschaltung aufheben: `http://localhost:8000/api/speaker/YOUR_SPEAKER_ID/control/unmute`
        -   Wiedergabe/Pause umschalten: `http://localhost:8000/api/speaker/YOUR_SPEAKER_ID/control/togglePlayPause`
        -   Nächster Titel: `http://localhost:8000/api/speaker/YOUR_SPEAKER_ID/control/nextTrack`
        -   Vorheriger Titel: `http://localhost:8000/api/speaker/YOUR_SPEAKER_ID/control/prevTrack`
    -   `POST /api/speaker/{id}/control`: Lautsprecheraktionen über JSON-Body steuern.
        ```bash
        curl -X POST -H "Content-Type: application/json" -d '{"action": "setVolume", "value": 50}' http://localhost:8000/api/speaker/YOUR_SPEAKER_ID/control
        ```
    -   `GET /api/speaker/{id}/status`: Aktuellen Lautsprecherstatus abrufen.
        ```bash
        curl http://localhost:8000/api/speaker/YOUR_SPEAKER_ID/status
        ```
    -   `GET /api/speaker/{id}/modelName`: Lautsprechermodellnamen abrufen.
        ```bash
        curl http://localhost:8000/api/speaker/YOUR_SPEAKER_ID/modelName
        ```

-   **Anwendungskonfiguration:**
    -   `GET /api/config`: Anwendungseinstellungen abrufen.
    -   `POST /api/config`: Anwendungseinstellungen speichern.
        ```bash
        curl -X POST -H "Content-Type: application/json" -d '{"app_base_url":"http://my-domain.com","debug_enabled":true}' http://localhost:8000/api/config
        ```

## File Structure

-   `index.html`: Main application entry point (frontend).
-   `css/style.css`: Custom CSS styles.
-   `js/api.js`: JavaScript functions for interacting with the backend API.
-   `js/app.js`: Main frontend application logic.
-   `api/`: Backend PHP files.
    -   `index.php`: Main API router.
    -   `speakers.php`: Handles speaker CRUD operations.
    -   `config.php`: Handles application configuration operations.
    -   `KefConnector.php`: PHP class for communicating with KEF speakers via their HTTP API.
    -   `speakers.json`: Stores speaker configurations.
    -   `config.json`: Stores application settings.
    -   `debug.log`: Log file for PHP errors and debug messages.

## Interaction with KEF Speakers

Die `KefConnector.php` Klasse ist für die Kommunikation mit den KEF-Lautsprechern verantwortlich. Sie verwendet HTTP GET/POST Anfragen an die interne API des Lautsprechers. Der Stromstatus wird aus der Quelle des Lautsprechers abgeleitet (z.B. 'standby' bedeutet ausgeschaltet).

## Lizenz

Dieses Projekt ist unter der **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International Lizenz (CC BY-NC-SA 4.0)** lizenziert.

-   **BY (Namensnennung):** Sie müssen angemessene Namensnennung vornehmen, einen Link zur Lizenz bereitstellen und angeben, ob Änderungen vorgenommen wurden. Dies kann in jeder angemessenen Weise geschehen, jedoch nicht in einer Weise, die den Eindruck erweckt, der Lizenzgeber unterstütze Sie oder Ihre Nutzung.
-   **NC (Nicht-kommerziell):** Sie dürfen das Material nicht für kommerzielle Zwecke nutzen.
-   **SA (Weitergabe unter gleichen Bedingungen):** Wenn Sie das Material remixen, transformieren oder darauf aufbauen, müssen Sie Ihre Beiträge unter derselben Lizenz wie das Original verbreiten.

Eine Kopie dieser Lizenz finden Sie unter [http://creativecommons.org/licenses/by-nc-sa/4.0/](http://creativecommons.org/licenses/by-nc-sa/4.0/).

Drittanbieter-Bibliotheken und Schriftarten, die in diesem Projekt verwendet werden, behalten ihre ursprünglichen Open-Source-Lizenzen, wie in der Datei `LICENSE` beschrieben.