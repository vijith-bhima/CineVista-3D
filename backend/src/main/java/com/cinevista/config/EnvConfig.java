package com.cinevista.config;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Reads configuration from a .env file in the project root.
 * Each line should be in KEY=VALUE format. Lines starting with # are ignored.
 */
public class EnvConfig {

    private static final Map<String, String> config = new HashMap<>();

    static {
        loadEnv(".env");
    }

    /**
     * Load environment variables from the given file path.
     */
    private static void loadEnv(String filePath) {
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                // Skip empty lines and comments
                if (line.isEmpty() || line.startsWith("#")) continue;
                int idx = line.indexOf('=');
                if (idx > 0) {
                    String key = line.substring(0, idx).trim();
                    String value = line.substring(idx + 1).trim();
                    config.put(key, value);
                }
            }
            System.out.println("[EnvConfig] Loaded " + config.size() + " config values from " + filePath);
        } catch (IOException e) {
            System.err.println("[EnvConfig] Warning: Could not read " + filePath + " - " + e.getMessage());
            System.err.println("[EnvConfig] Using default values.");
        }
    }

    /**
     * Get a config value by key, returning the default if not found.
     */
    public static String get(String key, String defaultValue) {
        return config.getOrDefault(key, defaultValue);
    }

    /**
     * Get a config value by key.
     */
    public static String get(String key) {
        return config.get(key);
    }

    /**
     * Get an integer config value.
     */
    public static int getInt(String key, int defaultValue) {
        String val = config.get(key);
        if (val == null) return defaultValue;
        try {
            return Integer.parseInt(val);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
