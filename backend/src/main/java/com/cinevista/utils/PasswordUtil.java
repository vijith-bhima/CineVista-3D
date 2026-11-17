package com.cinevista.utils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Password hashing utility using SHA-256.
 * Note: In production, use bcrypt or Argon2. SHA-256 is used here for simplicity.
 */
public class PasswordUtil {

    /**
     * Hash a password using SHA-256 and return the hex string.
     */
    public static String hash(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(password.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Verify a password against a stored hash.
     */
    public static boolean verify(String password, String storedHash) {
        return hash(password).equals(storedHash);
    }

    /**
     * Convert byte array to lowercase hex string.
     */
    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
