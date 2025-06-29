/**
 * This file is part of the KEF Control Panel.
 *
 * Copyright (c) 2025 Marcus Moll (https://github.com/PHP-Expert)
 *
 * This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 */

let API_BASE_URL = './api';
let DEBUG_ENABLED = false; // New variable to store debug state

window.api = {
    setApiBaseUrl: function(baseUrl, basePath, debugEnabled) {
        let finalPath = basePath;
        if (!finalPath || finalPath === '/') { // Handle empty or just '/'
            finalPath = '/';
        }
        // Ensure basePath ends with a slash if it's not empty
        if (finalPath !== '/' && !finalPath.endsWith('/')) {
            finalPath += '/';
        }

        API_BASE_URL = `${window.location.origin}${finalPath}api`;
        DEBUG_ENABLED = debugEnabled; // Set the debug state

        if (DEBUG_ENABLED) {
            console.log("API_BASE_URL set to:", API_BASE_URL);
        }
    },

    fetchSpeakers: async function() {
        try {
            const url = `${API_BASE_URL}/speakers`;
            if (DEBUG_ENABLED) {
                console.log("Fetching speakers from:", url);
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (DEBUG_ENABLED) {
                console.error("Could not fetch speakers:", error);
            }
            return [];
        }
    },

    addSpeaker: async function(speaker) {
        try {
            const response = await fetch(`${API_BASE_URL}/speakers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(speaker),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (DEBUG_ENABLED) {
                console.error("Could not add speaker:", error);
            }
        }
    },

    deleteSpeaker: async function(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/speakers/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            if (DEBUG_ENABLED) {
                console.error(`Could not delete speaker ${id}:`, error);
            }
        }
    },

    updateSpeaker: async function(id, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/speakers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (DEBUG_ENABLED) {
                console.error(`Could not update speaker ${id}:`, error);
            }
        }
    },

    reorderSpeakers: async function(ids) {
        try {
            const response = await fetch(`${API_BASE_URL}/speakers/reorder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(ids),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (DEBUG_ENABLED) {
                console.error("Could not reorder speakers:", error);
            }
        }
    },

    getSpeakerStatus: async function(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/speaker/${id}/status`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (DEBUG_ENABLED) {
                console.error(`Could not get status for speaker ${id}:`, error);
            }
            return null;
        }
    },

    controlSpeaker: async function(id, action, value) {
        try {
            let url = `${API_BASE_URL}/speaker/${id}/control/${action}`;
            if (value !== undefined) {
                url += `/${value}`;
            }
            const response = await fetch(url, {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (DEBUG_ENABLED) {
                console.error(`Could not control speaker ${id}:`, error);
            }
        }
    },

    setSpeakerPower: async function(id, state) {
        try {
            const response = await fetch(`${API_BASE_URL}/speaker/${id}/power`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ state }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (DEBUG_ENABLED) {
                console.error(`Could not set speaker power for ${id}:`, error);
            }
        }
    },

    getSpeakerModelName: async function(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/speaker/${id}/modelName`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.modelName; // Assuming the API returns { modelName: "LS50WII" }
        } catch (error) {
            if (DEBUG_ENABLED) {
                console.error(`Could not get speaker model name for ${id}:`, error);
            }
            return null;
        }
    },

    fetchConfig: async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/config`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (DEBUG_ENABLED) {
                console.error("Could not fetch config:", error);
            }
            return { app_base_url: '', app_base_path: '/', debug_enabled: false };
        }
    },

    saveConfig: async function(config) {
        try {
            const response = await fetch(`${API_BASE_URL}/config`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            if (DEBUG_ENABLED) {
                console.error("Could not save config:", error);
            }
        }
    }
};
