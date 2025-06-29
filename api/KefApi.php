<?php
/**
 * This file is part of the KEF Control Panel.
 *
 * Copyright (c) 2025 Marcus Moll (https://github.com/PHP-Expert)
 *
 * This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 */

require_once 'KefConnector.php';

class KefApi {
    /**
     * @var string The IP address of the KEF speaker.
     */
    private $ip;

    /**
     * @var KefConnector The KefConnector instance for communication.
     */
    private $connector;

    /**
     * Constructor for the KefApi class.
     * @param string $ip The IP address of the KEF speaker.
     */
    public function __construct($ip) {
        $this->ip = $ip;
        $this->connector = new KefConnector($this->ip);
    }

    /**
     * Retrieves the current status of the speaker.
     * @return array|null An associative array with the current status (power, volume, source, muted, raw_speaker_status) or null on error.
     */
    public function getStatus(): ?array {
        try {
            $volume = $this->connector->getVolume();
            $source = $this->connector->getSource();
            $muted = $this->connector->isMuted();
            $speakerStatus = $this->connector->getSpeakerStatus();

            // Determine power status based on source
            $power = ($source === 'standby') ? 'off' : 'on';

            return [
                'power' => $power,
                'volume' => $volume,
                'source' => $source,
                'muted' => $muted,
                'raw_speaker_status' => $speakerStatus, // For debugging/more info
            ];
        } catch (RuntimeException $e) {
            error_log("KEF API Error (getStatus): " . $e->getMessage());
            return null; // Indicate failure
        }
    }

    /**
     * Sets the power state of the speaker.
     * @param string $state The desired state ('on' or 'off').
     * @return array An associative array indicating the success of the operation.
     */
    public function setPower(string $state): array {
        try {
            if ($state === 'on') {
                $this->connector->powerOn();
            } else if ($state === 'off') {
                $this->connector->shutdown();
            }
            return ['success' => true];
        } catch (RuntimeException $e) {
            error_log("KEF API Error (setPower): " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Sets the volume level of the speaker.
     * @param int $level The desired volume level (0-100).
     * @return array An associative array indicating the success of the operation.
     */
    public function setVolume(int $level): array {
        try {
            $this->connector->setVolume($level);
            return ['success' => true];
        } catch (RuntimeException $e) {
            error_log("KEF API Error (setVolume): " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Selects the audio source for the speaker.
     * @param string $source The desired audio source (e.g., 'wifi', 'bluetooth', 'tv', 'optical', 'usb').
     * @return array An associative array indicating the success of the operation.
     */
    public function setSource(string $source): array {
        try {
            $this->connector->setSource($source);
            return ['success' => true];
        } catch (RuntimeException $e) {
            error_log("KEF API Error (setSource): " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Mutes the speaker.
     * @return array An associative array indicating the success of the operation.
     */
    public function mute(): array {
        try {
            $this->connector->setMute(true);
            return ['success' => true];
        } catch (RuntimeException $e) {
            error_log("KEF API Error (mute): " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Unmutes the speaker.
     * @return array An associative array indicating the success of the operation.
     */
    public function unmute(): array {
        try {
            $this->connector->setMute(false);
            return ['success' => true];
        } catch (RuntimeException $e) {
            error_log("KEF API Error (unmute): " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Retrieves the model name of the speaker.
     * @return string|null The model name or null on error.
     */
    public function getModelName(): ?string {
        try {
            return $this->connector->getModelName();
        } catch (RuntimeException $e) {
            error_log("KEF API Error (getModelName): " . $e->getMessage());
            return null;
        }
    }

    /**
     * Retrieves the device name of the speaker.
     * @return string|null The device name or null on error.
     */
    public function getDeviceName(): ?string {
        try {
            return $this->connector->getDeviceName();
        } catch (RuntimeException $e) {
            error_log("KEF API Error (getDeviceName): " . $e->getMessage());
            return null;
        }
    }

    /**
     * Toggles play/pause state of the speaker.
     * @return array An associative array indicating the success of the operation.
     */
    public function togglePlayPause(): array {
        try {
            // Assuming KefConnector has a method for this, e.g., togglePlayPause()
            // If not, this would need to be implemented in KefConnector or handled here
            // based on current status.
            // For now, let's assume a direct call exists.
            $this->connector->togglePlayPause();
            return ['success' => true];
        } catch (RuntimeException $e) {
            error_log("KEF API Error (togglePlayPause): " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Skips to the next track.
     * @return array An associative array indicating the success of the operation.
     */
    public function nextTrack(): array {
        try {
            // Assuming KefConnector has a method for this, e.g., nextTrack()
            $this->connector->nextTrack();
            return ['success' => true];
        } catch (RuntimeException $e) {
            error_log("KEF API Error (nextTrack): " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Skips to the previous track.
     * @return array An associative array indicating the success of the operation.
     */
    public function prevTrack(): array {
        try {
            // Assuming KefConnector has a method for this, e.g., previousTrack()
            $this->connector->previousTrack();
            return ['success' => true];
        } catch (RuntimeException $e) {
            error_log("KEF API Error (prevTrack): " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
}