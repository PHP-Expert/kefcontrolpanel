<?php

/**
 * This file is part of the KEF Control Panel.
 *
 * Copyright (c) 2025 Marcus Moll (https://github.com/PHP-Expert)
 *
 * This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 */
class KefConnector {
    /**
     * @var string The host address of the KEF speaker (e.g., 'http://192.168.111.179').
     */
    private string $host;

    /**
     * @var int The timeout for HTTP requests in seconds.
     */
    private int $timeout;

    /**
     * @var array An array of valid audio sources for KEF speakers.
     */
    private static array $validSources = [
        "wifi", "bluetooth", "tv", "optic", "coaxial", "analog", "standby", "optical", "usb"
    ];

    /**
     * Constructor for the KefConnector class.
     * Ensures the host URL has a scheme (http:// or https://).
     *
     * @param string $host The host address of the KEF speaker.
     * @param int $timeout Timeout for HTTP requests in seconds (default: 5).
     */
    public function __construct(string $host, int $timeout = 5) {
        // Ensure the host has a scheme (http:// or https://)
        if (!preg_match('~^(?:f|ht)tps?://~i', $host)) {
            $host = 'http://' . $host;
        }
        $this->host = rtrim($host, '/');
        $this->timeout = $timeout;
    }

    /**
     * Sets the speaker's audio source (e.g., wifi, bluetooth, tv, optic, coaxial, analog, standby).
     * Setting to "standby" puts the speaker in standby mode.
     *
     * @param string $source The desired audio source.
     * @throws InvalidArgumentException If an invalid source is provided.
     * @throws RuntimeException If the HTTP request fails.
     *
     * Example Request:
     * GET /api/setData?path=settings:/kef/play/physicalSource&roles=value&value={"type":"kefPhysicalSource","kefPhysicalSource":"wifi"}
     */
    public function setSource(string $source): void {
        if (!in_array($source, self::$validSources, true)) {
            throw new InvalidArgumentException("Invalid source: $source");
        }
        $payload = [
            "path"  => "settings:/kef/play/physicalSource",
            "roles" => "value",
            "value" => json_encode([
                "type" => "kefPhysicalSource",
                "kefPhysicalSource" => $source
            ])
        ];
        $this->httpGet('/api/setData', $payload);
    }

    /**
     * Retrieves the current audio source of the speaker.
     *
     * @return string|null The current source (e.g., 'wifi') or null if not available.
     *
     * Example Request:
     * GET /api/getData?path=settings:/kef/play/physicalSource&roles=value
     * Example Response: [{"kefPhysicalSource":"wifi"}]
     */
    public function getSource(): ?string {
        $data = $this->httpGet('/api/getData', [
            "path" => "settings:/kef/play/physicalSource",
            "roles" => "value"
        ]);
        return $data[0]['kefPhysicalSource'] ?? null;
    }

    /**
     * Powers on the speaker from standby mode.
     *
     * Example Request:
     * GET /api/setData?path=settings:/kef/play/physicalSource&roles=value&value={"type":"kefPhysicalSource","kefPhysicalSource":"powerOn"}
     */
    public function powerOn(): void {
        $payload = [
            "path"  => "settings:/kef/play/physicalSource",
            "roles" => "value",
            "value" => json_encode([
                "type" => "kefPhysicalSource",
                "kefPhysicalSource" => "powerOn"
            ])
        ];
        $this->httpGet('/api/setData', $payload);
    }

    /**
     * Puts the speaker into standby mode.
     */
    public function shutdown(): void {
        $this->setSource("standby");
    }

    /**
     * Returns all valid audio sources as an array.
     *
     * @return array An array of valid source strings.
     */
    public static function getAvailableSources(): array {
        return self::$validSources;
    }

    /**
     * Sets the volume level of the speaker (0 to 100).
     *
     * @param int $vol The desired volume level.
     * @throws RuntimeException If the HTTP request fails.
     *
     * Example Request:
     * GET /api/setData?path=player:volume&roles=value&value={"type":"i32_","i32_":35}
     */
    public function setVolume(int $vol): void {
        $vol = max(0, min(100, $vol));
        $payload = [
            "path"  => "player:volume",
            "roles" => "value",
            "value" => json_encode([
                "type" => "i32_",
                "i32_" => $vol
            ])
        ];
        $this->httpGet('/api/setData', $payload);
    }

    /**
     * Retrieves the current volume level of the speaker (0 to 100).
     *
     * @return int|null The current volume level or null if not available.
     *
     * Example Request:
     * GET /api/getData?path=player:volume&roles=value
     * Example Response: [{"i32_":42}]
     */
    public function getVolume(): ?int {
        $data = $this->httpGet('/api/getData', [
            "path" => "player:volume",
            "roles" => "value"
        ]);
        return $data[0]['i32_'] ?? null;
    }

    /**
     * Sets the mute state of the speaker.
     *
     * @param bool $mute True to mute, false to unmute.
     * @throws RuntimeException If the HTTP request fails.
     *
     * Example Request:
     * GET /api/setData?path=settings:/mediaPlayer/mute&roles=value&value={"type":"bool_","bool_":true}
     */
    public function setMute(bool $mute): void {
        $payload = [
            "path"  => "settings:/mediaPlayer/mute",
            "roles" => "value",
            "value" => json_encode([
                "type" => "bool_",
                "bool_" => $mute
            ])
        ];
        $this->httpGet('/api/setData', $payload);
    }

    /**
     * Checks if the speaker is currently muted.
     *
     * @return bool|null True if muted, false if not, or null if status is not available.
     *
     * Example Request:
     * GET /api/getData?path=settings:/mediaPlayer/mute&roles=value
     * Example Response: [{"bool_":false}]
     */
    public function isMuted(): ?bool {
        $data = $this->httpGet('/api/getData', [
            "path" => "settings:/mediaPlayer/mute",
            "roles" => "value"
        ]);
        return $data[0]['bool_'] ?? null;
    }

    /**
     * Retrieves the device name of the speaker.
     *
     * @return string|null The device name (e.g., "KEF LS50W II") or null if not available.
     *
     * Example Request:
     * GET /api/getData?path=settings:/deviceName&roles=value
     * Example Response: [{"string_":"KEF LS50W II"}]
     */
    public function getDeviceName(): ?string {
        $data = $this->httpGet('/api/getData', [
            "path" => "settings:/deviceName",
            "roles" => "value"
        ]);
        return $data[0]['string_'] ?? null;
    }

    /**
     * Retrieves the model name of the speaker.
     *
     * @return string|null The model name (e.g., "LS50WII") or null if not available.
     *
     * Example Request:
     * GET /api/getData?path=settings:/kef/host/modelName&roles=value
     * Example Response: [{"string_":"LS50WII"}]
     */
    public function getModelName(): ?string {
        $data = $this->httpGet('/api/getData', [
            "path" => "settings:/kef/host/modelName",
            "roles" => "value"
        ]);
        return $data[0]['string_'] ?? null;
    }

    /**
     * Retrieves the current firmware version of the speaker.
     *
     * @return string|null The firmware version (e.g., "v1.7.5") or null if not available.
     *
     * Example Request:
     * GET /api/getData?path=settings:/version&roles=value
     * Example Response: [{"string_":"v1.7.5"}]
     */
    public function getFirmwareVersion(): ?string {
        $data = $this->httpGet('/api/getData', [
            "path" => "settings:/version",
            "roles" => "value"
        ]);
        return $data[0]['string_'] ?? null;
    }

    /**
     * Retrieves the MAC address of the speaker.
     *
     * @return string|null The MAC address (e.g., "D4:5D:64:xx:xx:xx") or null if not available.
     *
     * Example Request:
     * GET /api/getData?path=settings:/system/primaryMacAddress&roles=value
     * Example Response: [{"string_":"D4:5D:64:xx:xx:xx"}]
     */
    public function getMacAddress(): ?string {
        $data = $this->httpGet('/api/getData', [
            "path" => "settings:/system/primaryMacAddress",
            "roles" => "value"
        ]);
        return $data[0]['string_'] ?? null;
    }

    /**
     * Retrieves the current power status of the speaker.
     *
     * @return string|null The speaker status (e.g., "poweredOn", "standby") or null if not available.
     *
     * Example Request:
     * GET /api/getData?path=settings:/kef/host/speakerStatus&roles=value
     * Example Response: [{"kefSpeakerStatus":"poweredOn"}]
     */
    public function getSpeakerStatus(): ?string {
        $data = $this->httpGet('/api/getData', [
            "path" => "settings:/kef/host/speakerStatus",
            "roles" => "value"
        ]);
        return $data[0]['kefSpeakerStatus'] ?? null;
    }

    /**
     * Executes an HTTP GET request to the KEF speaker's API and returns the response as an array.
     *
     * @param string $endpoint The API endpoint (e.g., '/api/getData').
     * @param array $params Associative array of query parameters.
     * @return array The JSON decoded response as an associative array.
     * @throws RuntimeException If the HTTP request fails or the JSON response is invalid.
     */
    private function httpGet(string $endpoint, array $params): array {
        $url = $this->host . $endpoint . '?' . http_build_query($params);
        error_log("DEBUG: HTTP GET request to: " . $url);
        $opts = ['http' => ['timeout' => $this->timeout]];
        $ctx = stream_context_create($opts);
        $res = file_get_contents($url, false, $ctx);
        if ($res === false) {
            error_log("HTTP GET failed for URL: " . $url . ", Error: " . error_get_last()['message']);
            throw new RuntimeException("GET failed: $url");
        }
        $json = json_decode($res, true);

        // If json_decode returns anything other than an array, or if there's a JSON error,
        // treat it as an invalid response and return an empty array or throw an exception.
        if (!is_array($json)) {
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log("Invalid JSON from URL: " . $url . ", JSON Error: " . json_last_error_msg() . ", Response: " . $res);
                throw new RuntimeException("Invalid JSON from $url");
            }
            // If no JSON error, but not an array (e.g., "null", "true", "false", or empty string)
            error_log("DEBUG: JSON decode result is not an array for URL: " . $url . ", Response: " . $res . ". Returning empty array.");
            return [];
        }

        error_log("DEBUG: Raw response: " . var_export($res, true));
        error_log("DEBUG: JSON decoded: " . var_export($json, true));
        return $json;
    }
}