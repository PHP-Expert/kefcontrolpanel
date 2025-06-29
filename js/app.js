/**
 * This file is part of the KEF Control Panel.
 *
 * Copyright (c) 2025 Marcus Moll (https://github.com/PHP-Expert)
 *
 * This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM Element References ---
    const dashboardView = document.getElementById('dashboard-view');
    const settingsView = document.getElementById('settings-view');
    const navLinks = document.querySelectorAll('.mdl-navigation__link');
    const addSpeakerForm = document.getElementById('add-speaker-form');

    // Group control buttons
    const groupPowerOffButton = document.getElementById('group-power-off');
    const groupMuteToggleButton = document.getElementById('group-mute-toggle');

    // Debug and API Info elements
    const debugToggle = document.getElementById('debug-toggle');
    const apiInfoButton = document.getElementById('api-info-button');
    const apiInfoOverlay = document.getElementById('api-info-overlay');
    const apiInfoCloseButton = apiInfoOverlay.querySelector('.close');

    // Refresh buttons
    const manualRefreshButton = document.getElementById('manual-refresh-button');
    const toggleAutoRefreshButton = document.getElementById('toggle-auto-refresh-button');

    /**
     * @type {number|null} autoRefreshInterval - Stores the interval ID for auto-refresh, or null if not active.
     */
    let autoRefreshInterval = null;

    

    /**
     * @type {Object} appConfig - Stores the application's configuration fetched from the backend.
     */
    let appConfig = await window.api.fetchConfig();

    // Set the API base URL for all subsequent API calls based on fetched configuration.
    window.api.setApiBaseUrl(appConfig.app_base_url, appConfig.app_base_path, appConfig.debug_enabled);

    // Initialize debug mode visibility based on the application configuration.
    debugToggle.parentElement.style.display = appConfig.debug_enabled ? 'block' : 'none';
    document.body.classList.toggle('debug-mode', appConfig.debug_enabled);
    

    /**
     * Renders the API information overlay with links for controlling speakers.
     * Allows users to select a speaker and view its corresponding API endpoints.
     */
    async function renderApiInfoOverlay() {
        const speakers = await window.api.fetchSpeakers();
        const apiLinksContainer = document.getElementById('api-links-container');
        apiLinksContainer.innerHTML = ''; // Clear previous content

        if (speakers.length === 0) {
            apiLinksContainer.innerHTML = '<p>No speakers configured to generate API links.</p>';
            return;
        }

        // Create speaker selection dropdown
        const speakerSelect = document.createElement('select');
        speakerSelect.id = 'api-speaker-select';
        speakerSelect.className = 'mdl-select__input';

        speakers.forEach(speaker => {
            const option = document.createElement('option');
            option.value = speaker.id;
            option.textContent = `${speaker.name} (${speaker.ip})`;
            speakerSelect.appendChild(option);
        });

        const speakerSelectLabel = document.createElement('label');
        speakerSelectLabel.setAttribute('for', 'api-speaker-select');
        speakerSelectLabel.textContent = 'Select Speaker:';

        const speakerSelectWrapper = document.createElement('div');
        speakerSelectWrapper.className = 'mdl-select-wrapper';
        speakerSelectWrapper.appendChild(speakerSelectLabel);
        speakerSelectWrapper.appendChild(speakerSelect);
        apiLinksContainer.appendChild(speakerSelectWrapper);

        const apiLinksDisplay = document.createElement('div');
        apiLinksDisplay.id = 'api-links-display';
        apiLinksContainer.appendChild(apiLinksDisplay);

        /**
         * Renders the API links for a given speaker.
         * @param {string} selectedSpeakerId - The ID of the speaker to render API links for.
         */
        const renderApiLinks = (selectedSpeakerId) => {
            const selectedSpeaker = speakers.find(s => s.id === selectedSpeakerId);
            if (!selectedSpeaker) {
                apiLinksDisplay.innerHTML = '<p>Speaker not found.</p>';
                return;
            }

            const baseUrl = appConfig.app_base_url || window.location.origin;
            const basePath = appConfig.app_base_path || '/';
            const apiBase = `${baseUrl}${basePath}api`;
            const speakerId = selectedSpeaker.id;
            const speakerName = selectedSpeaker.name;

            apiLinksDisplay.innerHTML = `
                <h4>${speakerName} (ID: ${speakerId})</h4>
                <div class="api-section">
                    <h5>Power & Source:</h5>
                    <div class="api-link-item">
                        <code id="api-power-on-${speakerId}">${apiBase}/speaker/${speakerId}/power/on</code>
                        <button class="mdl-button mdl-js-button mdl-button--icon copy-button" data-target="api-power-on-${speakerId}"><i class="material-icons">content_copy</i></button>
                    </div>
                    <div class="api-link-item">
                        <code id="api-power-off-${speakerId}">${apiBase}/speaker/${speakerId}/power/off</code>
                        <button class="mdl-button mdl-js-button mdl-button--icon copy-button" data-target="api-power-off-${speakerId}"><i class="material-icons">content_copy</i></button>
                    </div>
                    <div class="api-link-item">
                        <code id="api-set-source-${speakerId}">${apiBase}/speaker/${speakerId}/power/wifi</code> (e.g., Wifi)
                        <button class="mdl-button mdl-js-button mdl-button--icon copy-button" data-target="api-set-source-${speakerId}"><i class="material-icons">content_copy</i></button>
                    </div>
                </div>
                <div class="api-section">
                    <h5>Volume (Example: Set to 50):</h5>
                    <div class="api-link-item">
                        <code id="api-set-volume-${speakerId}">${apiBase}/speaker/${speakerId}/control/setVolume/50</code>
                        <button class="mdl-button mdl-js-button mdl-button--icon copy-button" data-target="api-set-volume-${speakerId}"><i class="material-icons">content_copy</i></button>
                    </div>
                </div>
                <div class="api-section">
                    <h5>Mute:</h5>
                    <div class="api-link-item">
                        <code id="api-mute-${speakerId}">${apiBase}/speaker/${speakerId}/control/mute</code>
                        <button class="mdl-button mdl-js-button mdl-button--icon copy-button" data-target="api-mute-${speakerId}"><i class="material-icons">content_copy</i></button>
                    </div>
                    <div class="api-link-item">
                        <code id="api-unmute-${speakerId}">${apiBase}/speaker/${speakerId}/control/unmute</code>
                        <button class="mdl-button mdl-js-button mdl-button--icon copy-button" data-target="api-unmute-${speakerId}"><i class="material-icons">content_copy</i></button>
                    </div>
                </div>
                <p><strong>Available Sources:</strong> <code>optical</code>, <code>wifi</code>, <code>bluetooth</code>, <code>tv</code>, <code>usb</code></p>
            `;
        };

        // Initial render for the first speaker
        if (speakers.length > 0) {
            speakerSelect.value = speakers[0].id;
            renderApiLinks(speakers[0].id);
        }

        // Event listener for speaker selection change
        speakerSelect.addEventListener('change', (e) => {
            renderApiLinks(e.target.value);
        });

        // Event listener for copy buttons within the API links container
        apiLinksContainer.addEventListener('click', (e) => {
            if (e.target.closest('.copy-button')) {
                const button = e.target.closest('.copy-button');
                const targetId = button.dataset.target;
                const codeElement = document.getElementById(targetId);
                if (codeElement) {
                    navigator.clipboard.writeText(codeElement.textContent).then(() => {
                        // Provide visual feedback to the user
                        button.querySelector('i').textContent = 'check';
                        setTimeout(() => {
                            button.querySelector('i').textContent = 'content_copy';
                        }, 1000);
                    }).catch(err => {
                        console.error('Failed to copy: ', err);
                    });
                }
            }
        });

        // Upgrade all new/updated MDL components in the overlay
        componentHandler.upgradeDom();
        apiInfoOverlay.classList.add('is-visible');
    }

    // Event listener for the API Info button to open the overlay
    apiInfoButton.addEventListener('click', renderApiInfoOverlay);

    /**
     * Closes the API information overlay.
     */
    function closeApiInfoOverlay() {
        apiInfoOverlay.classList.remove('is-visible');
    }

    /**
     * Handles manual dashboard refresh.
     */
    function handleManualRefresh() {
        renderDashboard();
    }

    /**
     * Toggles the auto-refresh functionality for the dashboard.
     */
    function toggleAutoRefresh() {
        const icon = toggleAutoRefreshButton.querySelector('i');
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
            icon.textContent = 'play_arrow';
            toggleAutoRefreshButton.title = 'Resume Auto Refresh';
        } else {
            autoRefreshInterval = setInterval(() => {
                // Only refresh if not on the settings page
                if (window.location.hash !== '#settings') {
                    renderDashboard();
                }
            }, 5000); // Refresh every 5 seconds
            icon.textContent = 'pause';
            toggleAutoRefreshButton.title = 'Pause Auto Refresh';
        }
    }

    /**
     * Handles the change event for the debug mode toggle switch.
     * @param {Event} e - The change event object.
     */
    function handleDebugToggleChange(e) {
        document.body.classList.toggle('debug-mode', e.target.checked);
    }

    /**
     * Handles the action to power off all configured speakers.
     */
    async function handleGroupPowerOff() {
        if (confirm('Are you sure you want to turn off all speakers?')) {
            const speakers = await window.api.fetchSpeakers();
            for (const speaker of speakers) {
                await window.api.controlSpeaker(speaker.id, 'setPower', 'off');
            }
            renderDashboard(); // Refresh dashboard to reflect changes
        }
    }

    /**
     * Handles the action to mute/unmute all configured speakers.
     * Currently, it mutes all speakers for simplicity.
     */
    async function handleGroupMuteToggle() {
        const speakers = await window.api.fetchSpeakers();
        for (const speaker of speakers) {
            // Assuming 'mute' action toggles mute state on the speaker
            await window.api.controlSpeaker(speaker.id, 'mute');
        }
        renderDashboard(); // Refresh dashboard to reflect changes
    }

    // --- Event Listeners ---
    apiInfoCloseButton.addEventListener('click', closeApiInfoOverlay);
    manualRefreshButton.addEventListener('click', handleManualRefresh);
    toggleAutoRefreshButton.addEventListener('click', toggleAutoRefresh);
    debugToggle.addEventListener('change', handleDebugToggleChange);
    groupPowerOffButton.addEventListener('click', handleGroupPowerOff);
    groupMuteToggleButton.addEventListener('click', handleGroupMuteToggle);

    /**
     * Navigates between different views (dashboard and settings) based on the provided hash.
     * @param {string} hash - The URL hash indicating the desired view (e.g., '#settings', '#dashboard').
     */
    async function navigate(hash) {
        // Hide all views initially
        dashboardView.style.display = 'none';
        settingsView.style.display = 'none';

        if (hash === '#settings') {
            settingsView.style.display = 'block';
            await renderSettings();
        } else { // Default to dashboard view
            dashboardView.style.display = 'block';
            await renderDashboard();
        }
    }

    // Event listeners for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default anchor link behavior
            navigate(e.target.hash);
        });
    });

    /**
     * Handles the submission of the add/edit speaker form.
     * @param {Event} e - The submit event object.
     */
    async function handleAddSpeakerFormSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('speaker-name').value;
        const ip = document.getElementById('speaker-ip').value;
        const editingId = addSpeakerForm.dataset.editingId;

        if (name && ip) {
            if (editingId) {
                // Fetch existing speakers to compare
                const existingSpeakers = await window.api.fetchSpeakers();
                const existingSpeaker = existingSpeakers.find(s => s.id === editingId);

                // Only update if name or IP has changed
                if (existingSpeaker && (existingSpeaker.name !== name || existingSpeaker.ip !== ip)) {
                    await window.api.updateSpeaker(editingId, { name, ip });
                    alert('Speaker updated successfully!');
                } else {
                    alert('No changes detected for speaker.');
                }
                delete addSpeakerForm.dataset.editingId; // Clear editing state
                addSpeakerForm.querySelector('button').textContent = 'Add'; // Reset button text
            } else {
                // Add new speaker
                await window.api.addSpeaker({ name, ip });
            }
            addSpeakerForm.reset(); // Clear form fields
            renderSettings(); // Re-render settings to show updated speaker list
        }
    }

    // Event listener for the add/edit speaker form submission
    addSpeakerForm.addEventListener('submit', handleAddSpeakerFormSubmit);

    /**
     * @type {Object.<string, HTMLElement>} speakerCards - Stores references to speaker card elements by speaker ID.
     */
    const speakerCards = {};

    /**
     * Creates and initializes a speaker card element with its controls and event listeners.
     * @param {Object} speaker - The speaker object containing id, name, and ip.
     * @returns {HTMLElement} The created speaker card element.
     */
    async function createSpeakerCard(speaker) {
        const cell = document.createElement('div');
        cell.className = 'mdl-cell mdl-cell--4-col';
        cell.setAttribute('speaker_id', speaker.id);

        const modelName = await window.api.getSpeakerModelName(speaker.id);
        if (modelName) {
            cell.classList.add(modelName.toLowerCase());
        }

        const card = document.createElement('div');
        card.className = 'mdl-card mdl-shadow--2dp';
        card.innerHTML = `
            <div class="mdl-card__title">
                <h2 class="mdl-card__title-text">${speaker.name}</h2>
            </div>
            <div class="mdl-card__supporting-text">
                IP: ${speaker.ip}<br>
                <div class="collapsible-content">
                    Device Name: ${speaker.device_name || 'N/A'}<br>
                    ID: ${speaker.id}<br>
                    Power: <span id="power-${speaker.id}">Unknown</span><br>
                    Volume: <span id="volume-${speaker.id}">Unknown</span><br>
                    Source: <span id="source-${speaker.id}">Unknown</span><br>
                    Muted: <span id="muted-${speaker.id}">Unknown</span>
                    <div class="debug-info">
                        <h4>Raw Status:</h4>
                        <pre id="raw-status-${speaker.id}"></pre>
                    </div>
                </div>
                <button class="mdl-button mdl-js-button mdl-button--icon toggle-details-button">
                    <i class="material-icons">expand_more</i>
                </button>
            </div>
            <div class="mdl-card__actions mdl-card--border">
                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="power-switch-${speaker.id}">
                    <input type="checkbox" id="power-switch-${speaker.id}" class="mdl-switch__input">
                    <span class="mdl-switch__label">Power</span>
                </label>
            </div>
            <div class="mdl-card__actions mdl-card--border">
                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="mute-switch-${speaker.id}">
                    <input type="checkbox" id="mute-switch-${speaker.id}" class="mdl-switch__input">
                    <span class="mdl-switch__label">Mute</span>
                </label>
            </div>
            <div class="mdl-card__actions mdl-card--border">
                <input class="mdl-slider mdl-js-slider" type="range" min="0" max="100" value="0" id="volume-slider-${speaker.id}">
                <span id="volume-value-${speaker.id}" class="volume-value">0%</span>
            </div>
            <div class="mdl-card__actions mdl-card--border" id="source-buttons-${speaker.id}">
                <!-- Source buttons will be rendered here -->
            </div>
            <div class="mdl-card__actions mdl-card--border">
                <button class="mdl-button mdl-js-button mdl-button--icon" id="prev-track-button-${speaker.id}">
                    <i class="material-icons">skip_previous</i>
                </button>
                <button class="mdl-button mdl-js-button mdl-button--icon" id="play-pause-button-${speaker.id}">
                    <i class="material-icons">play_arrow</i>
                </button>
                <button class="mdl-button mdl-js-button mdl-button--icon" id="next-track-button-${speaker.id}">
                    <i class="material-icons">skip_next</i>
                </button>
            </div>
            <div class="mdl-card__menu">
                <button class="mdl-button mdl-js-button mdl-js-ripple-effect" id="mute-button-${speaker.id}">
                    <i class="material-icons">volume_off</i>
                </button>
            </div>
        `;
        cell.appendChild(card);
        speakerCards[speaker.id] = cell; // Store reference to the cell element

        // Upgrade MDL components within the new card
        componentHandler.upgradeElement(card);

        // Add event listeners
        card.querySelector(`#power-switch-${speaker.id}`).addEventListener('change', async (e) => {
            await window.api.setSpeakerPower(speaker.id, e.target.checked ? 'on' : 'off');
        });

        card.querySelector(`#mute-switch-${speaker.id}`).addEventListener('change', async (e) => {
            await window.api.controlSpeaker(speaker.id, e.target.checked ? 'mute' : 'unmute');
        });

        card.querySelector(`#volume-slider-${speaker.id}`).addEventListener('input', async (e) => {
            const newVolume = e.target.value;
            const volumeValueElement = card.querySelector(`#volume-value-${speaker.id}`);
            if (volumeValueElement) {
                volumeValueElement.textContent = `${newVolume}%`;
            }
            await window.api.controlSpeaker(speaker.id, 'setVolume', newVolume);
        });

        const sourceButtonsContainer = card.querySelector(`#source-buttons-${speaker.id}`);
        const sources = ['wifi', 'bluetooth', 'tv', 'optical', 'usb']; // Dummy sources
        sources.forEach(source => {
            const button = document.createElement('button');
            button.className = 'mdl-button mdl-js-button mdl-button--raised';
            button.textContent = source;
            button.addEventListener('click', async () => {
                await window.api.controlSpeaker(speaker.id, 'setSource', source);
            });
            sourceButtonsContainer.appendChild(button);
        });

        card.querySelector(`#mute-button-${speaker.id}`).addEventListener('click', async () => {
            // This will be updated by updateSpeakerCardStatus
        });

        card.querySelector(`#play-pause-button-${speaker.id}`).addEventListener('click', async () => {
            await window.api.controlSpeaker(speaker.id, 'togglePlayPause');
        });

        card.querySelector(`#next-track-button-${speaker.id}`).addEventListener('click', async () => {
            await window.api.controlSpeaker(speaker.id, 'nextTrack');
        });

        card.querySelector(`#prev-track-button-${speaker.id}`).addEventListener('click', async () => {
            await window.api.controlSpeaker(speaker.id, 'prevTrack');
        });

        // Add event listener for the toggle button
        const toggleButton = card.querySelector('.toggle-details-button');
        const collapsibleContent = card.querySelector('.collapsible-content');

        // Upgrade the toggle button specifically
        componentHandler.upgradeElement(toggleButton);

        toggleButton.addEventListener('click', () => {
            collapsibleContent.classList.toggle('expanded');
            toggleButton.classList.toggle('expanded');
        });

        return cell;
    }

    /**
     * Renders the dashboard view, displaying all configured speakers and their controls.
     */
    async function renderDashboard() {
        const speakers = await window.api.fetchSpeakers();
        let grid = dashboardView.querySelector('.mdl-grid');

        if (!grid) {
            grid = document.createElement('div');
            grid.className = 'mdl-grid';
            dashboardView.innerHTML = ''; // Clear only once if grid doesn't exist
            dashboardView.appendChild(grid);
        }

        const currentSpeakerIds = new Set(speakers.map(s => s.id));
        const existingCardIds = new Set(Object.keys(speakerCards));

        // Remove cards for speakers that no longer exist
        for (const speakerId of existingCardIds) {
            if (!currentSpeakerIds.has(speakerId)) {
                const cardElement = speakerCards[speakerId];
                if (cardElement && cardElement.parentNode) {
                    cardElement.parentNode.removeChild(cardElement);
                }
                delete speakerCards[speakerId];
            }
        }

        if (speakers.length === 0) {
            dashboardView.innerHTML = `<p>No speakers configured. Go to settings to add one.</p>`;
            return;
        }

        // Create or update speaker cards and append them in the correct order
        for (const speaker of speakers) {
            let cardElement = speakerCards[speaker.id];
            if (!cardElement) {
                cardElement = await createSpeakerCard(speaker);
                grid.appendChild(cardElement);
            } else {
                // Ensure existing card is in the correct position
                const existingGridChildren = Array.from(grid.children);
                const currentIndex = existingGridChildren.indexOf(cardElement);
                const desiredIndex = speakers.indexOf(speaker);

                if (currentIndex !== desiredIndex) {
                    if (desiredIndex < existingGridChildren.length) {
                        grid.insertBefore(cardElement, existingGridChildren[desiredIndex]);
                    } else {
                        grid.appendChild(cardElement);
                    }
                }
            }
            await updateSpeakerCardStatus(speaker.id, cardElement);
        }
    }

    /**
     * Updates the status display of a single speaker card.
     * @param {string} speakerId - The ID of the speaker to update.
     * @param {HTMLElement} cardElement - The HTML element representing the speaker card.
     */
    async function updateSpeakerCardStatus(speakerId, cardElement) {
        if (appConfig.debug_enabled) {
            console.log(`Fetching status for speaker: ${speakerId}`);
        }
        const status = await window.api.getSpeakerStatus(speakerId);
        if (appConfig.debug_enabled) {
            console.log(`Status for ${speakerId}:`, status);
        }

        if (status) {
            cardElement.classList.remove('offline');

            const powerElement = cardElement.querySelector(`#power-${speakerId}`);
            const volumeElement = cardElement.querySelector(`#volume-${speakerId}`);
            const sourceElement = cardElement.querySelector(`#source-${speakerId}`);
            const mutedElement = cardElement.querySelector(`#muted-${speakerId}`);

            // Update text content only if changed
            if (powerElement.textContent !== status.power) {
                powerElement.textContent = status.power;
            }
            if (volumeElement.textContent !== String(status.volume)) {
                volumeElement.textContent = status.volume;
            }
            const volumeValueElement = cardElement.querySelector(`#volume-value-${speakerId}`);
            if (volumeValueElement && volumeValueElement.textContent !== `${status.volume}%`) {
                volumeValueElement.textContent = `${status.volume}%`;
            }
            if (sourceElement.textContent !== status.source) {
                sourceElement.textContent = status.source;
            }
            if (mutedElement.textContent !== String(status.muted)) {
                mutedElement.textContent = status.muted;
            }

            // Update power switch state
            const powerSwitch = cardElement.querySelector(`#power-switch-${speakerId}`);
            if (powerSwitch && powerSwitch.checked !== (status.power === 'on')) {
                powerSwitch.checked = (status.power === 'on');
                if (powerSwitch.parentElement.MaterialSwitch) {
                    powerSwitch.parentElement.MaterialSwitch.checkToggleState();
                }
            }

            // Update mute switch state
            const muteSwitch = cardElement.querySelector(`#mute-switch-${speakerId}`);
            if (muteSwitch && muteSwitch.checked !== status.muted) {
                muteSwitch.checked = status.muted;
                if (muteSwitch.parentElement.MaterialSwitch) {
                    muteSwitch.parentElement.MaterialSwitch.checkToggleState();
                }
            }

            // Update volume slider state
            const volumeSlider = cardElement.querySelector(`#volume-slider-${speakerId}`);
            if (volumeSlider && parseInt(volumeSlider.value) !== status.volume) {
                volumeSlider.value = status.volume;
                if (volumeSlider.MaterialSlider) {
                    volumeSlider.MaterialSlider.change(status.volume);
                }
            }

            // Update source buttons visual state
            const sourceButtonsContainer = cardElement.querySelector(`#source-buttons-${speakerId}`);
            if (sourceButtonsContainer) {
                Array.from(sourceButtonsContainer.children).forEach(button => {
                    if (button.textContent === status.source) {
                        button.classList.add('mdl-button--colored');
                    } else {
                        button.classList.remove('mdl-button--colored');
                    }
                });
            }

            // Update mute button icon and action
            const muteButton = cardElement.querySelector(`#mute-button-${speakerId}`);
            if (muteButton) {
                muteButton.querySelector('i').textContent = status.muted ? 'volume_off' : 'volume_up';
                muteButton.onclick = async () => {
                    await window.api.controlSpeaker(speakerId, status.muted ? 'unmute' : 'mute');
                };
            }

            // Update play/pause button icon
            const playPauseButton = cardElement.querySelector(`#play-pause-button-${speakerId}`);
            if (playPauseButton) {
                playPauseButton.querySelector('i').textContent = (status.raw_speaker_status === 'playing') ? 'pause' : 'play_arrow';
            }

            // Display raw status in debug mode
            const rawStatusElement = cardElement.querySelector(`#raw-status-${speakerId}`);
            if (rawStatusElement) {
                rawStatusElement.textContent = JSON.stringify(status, null, 2);
            }

        } else {
            // Speaker is offline or status could not be fetched
            cardElement.classList.add('offline');
            cardElement.querySelector(`#power-${speakerId}`).textContent = 'Offline';
            cardElement.querySelector(`#raw-status-${speakerId}`).textContent = 'Could not fetch status.';
        }
    }

    /**
     * Renders the settings view, including speaker management and application configuration.
     */
    async function renderSettings() {
        const speakerListSettings = document.getElementById('speaker-list-settings');
        const speakers = await window.api.fetchSpeakers();
        speakerListSettings.innerHTML = ''; // Clear previous content

        if (speakers.length > 0) {
            const list = document.createElement('ul');
            list.className = 'demo-list-control mdl-list';
            speakers.forEach(speaker => {
                const listItem = document.createElement('li');
                listItem.className = 'mdl-list__item';
                listItem.innerHTML = `
                    <span class="mdl-list__item-primary-content">
                        <i class="material-icons mdl-list__item-icon">speaker</i>
                        ${speaker.name} (${speaker.ip}) ${speaker.model ? `(${speaker.model})` : ''} ${speaker.device_name ? `(${speaker.device_name})` : ''}
                    </span>
                    <span class="mdl-list__item-secondary-action">
                        <button class="mdl-button mdl-js-button mdl-button--icon" data-id="${speaker.id}" action="edit">
                            <i class="material-icons">edit</i>
                        </button>
                        <button class="mdl-button mdl-js-button mdl-button--icon" data-id="${speaker.id}" action="delete">
                            <i class="material-icons">delete</i>
                        </button>
                    </span>
                `;
                // Event listener for editing a speaker
                listItem.querySelector('[action="edit"]').addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    const speakerToEdit = speakers.find(s => s.id === id);
                    if (speakerToEdit) {
                        document.getElementById('speaker-name').value = speakerToEdit.name;
                        document.getElementById('speaker-ip').value = speakerToEdit.ip;
                        addSpeakerForm.querySelector('button').textContent = 'Save';
                        addSpeakerForm.dataset.editingId = id;
                    }
                });

                // Event listener for deleting a speaker
                listItem.querySelector('[action="delete"]').addEventListener('click', async (e) => {
                    const id = e.currentTarget.dataset.id;
                    if (confirm('Are you sure you want to delete this speaker?')) {
                        await window.api.deleteSpeaker(id);
                        renderSettings(); // Re-render settings after deletion
                    }
                });
                list.appendChild(listItem);
            });
            speakerListSettings.appendChild(list);

            // Initialize SortableJS for drag-and-drop reordering
            new Sortable(list, {
                animation: 150,
                onEnd: async (evt) => {
                    const ids = Array.from(evt.target.children).map(item => item.querySelector('[action="delete"]').dataset.id);
                    await window.api.reorderSpeakers(ids);
                }
            });
        }

        // --- Application Settings Form Handling ---
        const appSettingsForm = document.getElementById('app-settings-form');
        const appBaseUrlInput = document.getElementById('app-base-url');
        const appBasePathInput = document.getElementById('app-base-path');
        const debugSettingsToggle = document.getElementById('debug-settings-toggle');
        const debugButton = document.getElementById('debug-toggle');

        // Populate form fields with current application configuration
        appBaseUrlInput.value = appConfig.app_base_url || '';
        appBasePathInput.value = appConfig.app_base_path || '/';
        debugSettingsToggle.checked = appConfig.debug_enabled || false;

        // Manually update MDL switch state if it exists
        if (debugSettingsToggle.parentElement.MaterialSwitch) {
            debugSettingsToggle.parentElement.MaterialSwitch.checkToggleState();
        }

        // Update debug button visibility based on config
        debugButton.parentElement.style.display = appConfig.debug_enabled ? 'block' : 'none';
        document.body.classList.toggle('debug-mode', appConfig.debug_enabled);

        // Event listener for application settings form submission
        appSettingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newConfig = {
                app_base_url: appBaseUrlInput.value,
                app_base_path: appBasePathInput.value,
                debug_enabled: debugSettingsToggle.checked
            };
            appConfig = await window.api.saveConfig(newConfig); // Update global config
            alert('Settings saved. Please refresh the page for full effect.');
            renderSettings(); // Re-render settings to update debug button visibility immediately
        });

        // Upgrade MDL components for the new form elements
        componentHandler.upgradeElement(appBaseUrlInput.parentElement);
        componentHandler.upgradeElement(appBasePathInput.parentElement);
        componentHandler.upgradeElement(debugSettingsToggle.parentElement);
    }

    // Initial render based on hash in the URL, or default to an empty hash (dashboard).
    await navigate(window.location.hash || '');

    // Start auto-refresh for the dashboard view.
    toggleAutoRefresh();

    // Ensure all Material Design Lite (MDL) components are upgraded after the initial render.
    // This is crucial for MDL elements added dynamically or present on page load.
    componentHandler.upgradeDom();
});
 
