<?php

/**
 * This file is part of the KEF Control Panel.
 *
 * Copyright (c) 2025 Marcus Moll (https://github.com/PHP-Expert)
 *
 * This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 */

// Load configuration to determine debug logging settings.
$config_file = 'config.json';
$debug_enabled = false;

/**
 * Check if the configuration file exists and load debug settings.
 */
if (file_exists($config_file)) {
    $config = json_decode(file_get_contents($config_file), true);
    if (isset($config['debug_enabled'])) {
        $debug_enabled = (bool)$config['debug_enabled'];
    }
}

/**
 * Configure PHP error reporting based on debug mode.
 */
if ($debug_enabled) {
    ini_set('error_log', '../data/debug.log');
    ini_set('display_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(0);
}

/**
 * Set CORS headers to allow cross-origin requests.
 */
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

/**
 * Handle OPTIONS requests for CORS preflight.
 */
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Parse the request path.
 * @var array $request An array containing the path segments.
 */
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$script_name = dirname($_SERVER['SCRIPT_NAME']);
$base_path = str_replace('\\', '/', $script_name);

// Remove the base path from the request URI
if (strpos($request_uri, $base_path) === 0) {
    $request_uri = substr($request_uri, strlen($base_path));
}

$request = explode('/', trim($request_uri,'/'));

/**
 * Route requests based on the first path segment.
 */
if ($request[0] == 'test') {
    // Handle test endpoint.
    echo json_encode(['message' => 'Hello World from API']);
    http_response_code(200);
    exit();
} else if ($request[0] == 'speakers') {
    // Handle speaker management (CRUD) requests.
    require_once 'speakers.php';
    handle_speakers($method, array_slice($request, 1));
} else if ($request[0] == 'config') {
    // Handle application configuration requests.
    require_once 'config.php';
    handle_config($method);
} else if ($request[0] == 'speaker' && isset($request[1])) {
    // Handle individual speaker control requests.
    require_once 'KefApi.php';

    /** @var string $speaker_id The ID of the speaker from the request path. */
    $speaker_id = $request[1];

    /** @var array $speakers Loaded speaker configurations. */
    $speakers = file_exists('../data/speakers.json') ? json_decode(file_get_contents('../data/speakers.json'), true) : [];

    /** @var string|null $ip The IP address of the target speaker. */
    $ip = null;
    foreach ($speakers as $speaker) {
        if ($speaker['id'] === $speaker_id) {
            $ip = $speaker['ip'];
            break;
        }
    }

    // If speaker IP is not found, return 404.
    if (!$ip) {
        http_response_code(404);
        echo json_encode(['error' => 'Speaker not found']);
        exit();
    }

    /** @var KefApi $kef_api Instance of KefApi for interacting with the speaker. */
    $kef_api = new KefApi($ip);

    // Route speaker-specific requests.
    if ($method == 'GET' && isset($request[2]) && $request[2] == 'status') {
        // Get speaker status.
        echo json_encode($kef_api->getStatus());
    } else if ($method == 'POST' && isset($request[2]) && $request[2] == 'control') {
        // Handle POST requests for speaker control (e.g., setVolume, mute).
        $data = json_decode(file_get_contents('php://input'), true);
        $action = $data['action'];
        $value = isset($data['value']) ? $data['value'] : null;
        $response = ['success' => false];

        switch ($action) {
            case 'setPower': $response = $kef_api->setPower($value); break;
            case 'setVolume': $response = $kef_api->setVolume($value); break;
            case 'setSource': $response = $kef_api->setSource($value); break;
            case 'mute': $response = $kef_api->mute(); break;
            case 'unmute': $response = $kef_api->unmute(); break;
            default: http_response_code(400); echo json_encode(['error' => 'Invalid control action']); exit();
        }
        echo json_encode($response);
    } else if ($method == 'GET' && isset($request[2]) && $request[2] == 'control' && isset($request[3])) {
        // Handle GET requests for speaker control (e.g., setVolume via URL param).
        $action = $request[3];
        $value = $request[4] ?? null;
        $response = ['success' => false];

        switch ($action) {
            case 'setVolume': $response = $kef_api->setVolume($value); break;
            case 'setSource': $response = $kef_api->setSource($value); break;
            case 'mute': $response = $kef_api->mute(); break;
            case 'unmute': $response = $kef_api->unmute(); break;
            case 'togglePlayPause': $response = $kef_api->togglePlayPause(); break;
            case 'nextTrack': $response = $kef_api->nextTrack(); break;
            case 'prevTrack': $response = $kef_api->prevTrack(); break;
            default: http_response_code(400); echo json_encode(['error' => 'Invalid control action']); exit();
        }
        echo json_encode($response);
    } else if ($method == 'GET' && isset($request[2]) && $request[2] == 'modelName') {
        // Get speaker model name.
        $modelName = $kef_api->getModelName();
        echo json_encode(['modelName' => $modelName]);
    } else if ($method == 'POST' && isset($request[2]) && $request[2] == 'power') {
        // Set speaker power state (on/off) via POST.
        $data = json_decode(file_get_contents('php://input'), true);
        $state = $data['state'] ?? null;
        if ($state === 'on' || $state === 'off') {
            $response = $kef_api->setPower($state);
            echo json_encode($response);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid power state']);
        }
    } else if ($method == 'GET' && isset($request[2]) && $request[2] == 'power' && isset($request[3])) {
        // Set speaker power state (on/off) or source via GET.
        $param = $request[3];
        if ($param === 'on' || $param === 'off') {
            $response = $kef_api->setPower($param);
            echo json_encode($response);
        } else {
            // Assume it's a source if not 'on' or 'off'
            require_once 'KefConnector.php';
            $validSources = KefConnector::getAvailableSources();
            if (in_array($param, $validSources)) {
                $response = $kef_api->setSource($param);
                echo json_encode($response);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid source: ' . $param . '. Valid sources are: ' . implode(', ', $validSources)]);
            }
        }
    } else {
        // Return 404 for unknown speaker-specific endpoints.
        http_response_code(404);
        echo json_encode(['error' => 'Not Found']);
    }
} else {
    // Return 404 for unknown top-level endpoints.
    http_response_code(404);
    echo json_encode(['error' => 'Not Found']);
}