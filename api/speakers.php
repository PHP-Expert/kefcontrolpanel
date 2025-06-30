<?php

/**
 * This file is part of the KEF Control Panel.
 *
 * Copyright (c) 2025 Marcus Moll (https://github.com/PHP-Expert)
 *
 * This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 */
function handle_speakers($method, $request) {
    $speakers_file = '../data/speakers.json';

    switch ($method) {
        case 'GET':
            error_log("DEBUG: handle_speakers - GET request received.");
            if (file_exists($speakers_file)) {
                $content = file_get_contents($speakers_file);
                if ($content === false) {
                    error_log("ERROR: Failed to read speakers.json");
                    echo json_encode([]);
                } else {
                    $speakers = json_decode($content, true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        error_log("ERROR: Invalid JSON in speakers.json: " . json_last_error_msg());
                        echo json_encode([]);
                    } else {
                        echo json_encode($speakers);
                    }
                }
            } else {
                error_log("DEBUG: speakers.json does not exist, returning empty array.");
                echo json_encode([]);
            }
            break;
        case 'POST':
            error_log("DEBUG: handle_speakers - POST request received.");
            $data = json_decode(file_get_contents('php://input'), true);
            if (isset($request[0]) && $request[0] == 'reorder') {
                // Handle reordering of speakers.
                error_log("DEBUG: handle_speakers - Reorder request.");
                $ordered_ids = $data;
                $speakers = file_exists($speakers_file) ? json_decode(file_get_contents($speakers_file), true) : [];
                $ordered_speakers = [];
                foreach ($ordered_ids as $id) {
                    foreach ($speakers as $speaker) {
                        if ($speaker['id'] === $id) {
                            $ordered_speakers[] = $speaker;
                            break;
                        }
                    }
                }
                if (file_put_contents($speakers_file, json_encode($ordered_speakers, JSON_PRETTY_PRINT)) === false) {
                    error_log("ERROR: Failed to write to speakers.json during reorder.");
                }
                echo json_encode($ordered_speakers);
                http_response_code(200);
            } else if (isset($data['name']) && isset($data['ip'])) {
                // Handle adding a new speaker.
                error_log("DEBUG: handle_speakers - Add new speaker request.");
                $speakers = file_exists($speakers_file) ? json_decode(file_get_contents($speakers_file), true) : [];
                require_once 'KefApi.php';
                $kef_api = new KefApi($data['ip']);
                $model_name = $kef_api->getModelName();
                $device_name = $kef_api->getDeviceName();

                $new_speaker = [
                    'id' => uniqid(),
                    'name' => $data['name'], // User-provided name
                    'ip' => $data['ip'],
                    'model' => $model_name, // Retrieved model name
                    'device_name' => $device_name // Retrieved device name
                ];
                $speakers[] = $new_speaker;
                if (file_put_contents($speakers_file, json_encode($speakers, JSON_PRETTY_PRINT)) === false) {
                    error_log("ERROR: Failed to write to speakers.json during add.");
                }
                echo json_encode($new_speaker);
                http_response_code(201);
            } else {
                // Invalid input for POST request.
                http_response_code(400);
                echo json_encode(['error' => 'Invalid input']);
                error_log("ERROR: handle_speakers - Invalid input for POST request.");
            }
            break;
        case 'PUT':
            error_log("DEBUG: handle_speakers - PUT request received.");
            if (isset($request[0])) {
                // Handle updating an existing speaker.
                $id = $request[0];
                $data = json_decode(file_get_contents('php://input'), true);
                $speakers = file_exists($speakers_file) ? json_decode(file_get_contents($speakers_file), true) : [];
                $updated = false;
                foreach ($speakers as &$speaker) {
                    if ($speaker['id'] === $id) {
                        if (isset($data['name'])) $speaker['name'] = $data['name'];
                        if (isset($data['ip'])) {
                            $speaker['ip'] = $data['ip'];
                            require_once 'KefApi.php';
                            $kef_api = new KefApi($speaker['ip']);
                            $model_name = $kef_api->getModelName();
                            $device_name = $kef_api->getDeviceName();

                            $speaker['model'] = $model_name;
                            $speaker['device_name'] = $device_name; // Store retrieved device name
                        }
                        $updated = true;
                        break;
                    }
                }
                if ($updated) {
                    if (file_put_contents($speakers_file, json_encode($speakers, JSON_PRETTY_PRINT)) === false) {
                        error_log("ERROR: Failed to write to speakers.json during update.");
                    }
                    echo json_encode($speakers);
                } else {
                    // Speaker not found for update.
                    http_response_code(404);
                    echo json_encode(['error' => 'Speaker not found']);
                    error_log("ERROR: handle_speakers - Speaker not found for PUT request: " . $id);
                }
            } else {
                // Invalid input for PUT request.
                http_response_code(400);
                echo json_encode(['error' => 'Invalid input']);
                error_log("ERROR: handle_speakers - Invalid input for PUT request.");
            }
            break;
        case 'DELETE':
            error_log("DEBUG: handle_speakers - DELETE request received.");
            if (isset($request[0])) {
                // Handle deleting a speaker.
                $id = $request[0];
                $speakers = file_exists($speakers_file) ? json_decode(file_get_contents($speakers_file), true) : [];
                $speakers = array_values(array_filter($speakers, function($speaker) use ($id) {
                    return $speaker['id'] !== $id;
                }));
                if (file_put_contents($speakers_file, json_encode($speakers, JSON_PRETTY_PRINT)) === false) {
                    error_log("ERROR: Failed to write to speakers.json during delete.");
                }
                http_response_code(204);
            } else {
                // Invalid input for DELETE request.
                http_response_code(400);
                echo json_encode(['error' => 'Invalid input']);
                error_log("ERROR: handle_speakers - Invalid input for DELETE request.");
            }
            break;
        default:
            // Method not allowed.
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            error_log("ERROR: handle_speakers - Method Not Allowed: " . $method);
            break;
    }
}