<?php

/**
 * This file is part of the KEF Control Panel.
 *
 * Copyright (c) 2025 Marcus Moll (https://github.com/PHP-Expert)
 *
 * This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/4.0/ or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 */

/**
 * Handles GET and POST requests for application configuration.
 * Configuration data is stored in 'config.json'.
 *
 * @param string $method The HTTP request method (GET, POST).
 * @return void
 */
function handle_config($method) {
    $config_file = 'config.json';

    switch ($method) {
        case 'GET':
            // Retrieve current configuration.
            if (file_exists($config_file)) {
                $config = json_decode(file_get_contents($config_file), true);
                echo json_encode($config);
            } else {
                // Return default configuration if file does not exist.
                echo json_encode(['app_base_url' => '', 'app_base_path' => '/', 'debug_enabled' => false]);
            }
            break;
        case 'POST':
            // Update configuration settings.
            $data = json_decode(file_get_contents('php://input'), true);
            $current_config = file_exists($config_file) ? json_decode(file_get_contents($config_file), true) : ['app_base_url' => '', 'app_base_path' => '/', 'debug_enabled' => false];

            // Update individual settings if provided in the request.
            if (isset($data['app_base_url'])) {
                $current_config['app_base_url'] = $data['app_base_url'];
            }
            if (isset($data['app_base_path'])) {
                $current_config['app_base_path'] = $data['app_base_path'];
            }
            if (isset($data['debug_enabled'])) {
                $current_config['debug_enabled'] = (bool)$data['debug_enabled'];
            }

            // Save the updated configuration to file.
            file_put_contents($config_file, json_encode($current_config, JSON_PRETTY_PRINT));
            echo json_encode($current_config);
            http_response_code(200);
            break;
        default:
            // Method not allowed for this endpoint.
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
            break;
    }
}