package com.cinevista.utils;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

/**
 * JSON serialization/deserialization utilities using Gson.
 */
public class JsonUtil {

    private static final Gson GSON = new GsonBuilder()
            .setPrettyPrinting()
            .serializeNulls()
            .create();

    private static final Gson GSON_COMPACT = new Gson();

    /**
     * Serialize an object to a pretty-printed JSON string.
     */
    public static String toJson(Object obj) {
        return GSON.toJson(obj);
    }

    /**
     * Serialize an object to a compact JSON string (no extra whitespace).
     */
    public static String toJsonCompact(Object obj) {
        return GSON_COMPACT.toJson(obj);
    }

    /**
     * Deserialize a JSON string into an object of the specified type.
     */
    public static <T> T fromJson(String json, Class<T> clazz) {
        return GSON.fromJson(json, clazz);
    }
}
