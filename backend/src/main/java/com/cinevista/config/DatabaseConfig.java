package com.cinevista.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

/**
 * JDBC connection pool for PostgreSQL.
 * Pre-creates connections for low latency and gracefully expands under concurrent bursts.
 */
public class DatabaseConfig {

    private static final int POOL_SIZE = EnvConfig.getInt("DB_POOL_SIZE", 25);
    private static final BlockingQueue<Connection> pool = new ArrayBlockingQueue<>(POOL_SIZE);
    private static String dbUrl;
    private static String dbUser;
    private static String dbPassword;

    /**
     * Initialize the connection pool using values from EnvConfig.
     */
    public static void init() {
        dbUrl = EnvConfig.get("DB_URL", "jdbc:postgresql://localhost:5433/cinevista");
        dbUser = EnvConfig.get("DB_USER", "postgres");
        dbPassword = EnvConfig.get("DB_PASSWORD", "");

        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("PostgreSQL JDBC driver not found", e);
        }

        // Pre-create connections for the pool
        int created = 0;
        for (int i = 0; i < POOL_SIZE; i++) {
            try {
                Connection conn = DriverManager.getConnection(dbUrl, dbUser, dbPassword);
                pool.offer(conn);
                created++;
            } catch (SQLException e) {
                System.err.println("[DatabaseConfig] Failed to create connection #" + (i + 1) + ": " + e.getMessage());
            }
        }
        System.out.println("[DatabaseConfig] Connection pool initialized with " + created + " connections to " + dbUrl);
    }

    /**
     * Borrow a connection from the pool.
     * Polls the pool; if temporarily exhausted under heavy load, spawns a fresh connection.
     */
    public static Connection getConnection() throws SQLException {
        try {
            Connection conn = pool.poll(500, TimeUnit.MILLISECONDS);
            if (conn != null && !conn.isClosed() && conn.isValid(2)) {
                return conn;
            }
            // Fallback: create fresh connection if pool is drained or borrowed connection expired
            return DriverManager.getConnection(dbUrl, dbUser, dbPassword);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new SQLException("Interrupted while acquiring database connection", e);
        }
    }

    /**
     * Return a connection back to the pool.
     * If the pool is full or connection is closed, closes the connection.
     */
    public static void releaseConnection(Connection conn) {
        if (conn == null) return;
        try {
            if (!conn.isClosed()) {
                conn.setAutoCommit(true);
                if (!pool.offer(conn)) {
                    conn.close();
                }
            }
        } catch (SQLException e) {
            System.err.println("[DatabaseConfig] Error releasing connection: " + e.getMessage());
        }
    }
}
