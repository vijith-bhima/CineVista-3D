package com.cinevista.utils;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.Map;

/**
 * QR code generation utility using ZXing.
 * Generates QR codes and returns them as base64-encoded PNG data URIs.
 */
public class QrCodeUtil {

    private static final int QR_SIZE = 250; // pixels

    /**
     * Generate a QR code containing the given text, returned as a data URI.
     * Format: "data:image/png;base64,..."
     *
     * @param text the text to encode in the QR code (e.g. ticket ID)
     * @return base64-encoded PNG data URI
     */
    public static String generateQrDataUri(String text) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = Map.of(
                    EncodeHintType.MARGIN, 1,
                    EncodeHintType.CHARACTER_SET, "UTF-8"
            );

            BitMatrix matrix = writer.encode(text, BarcodeFormat.QR_CODE, QR_SIZE, QR_SIZE, hints);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", baos);

            String base64 = Base64.getEncoder().encodeToString(baos.toByteArray());
            return "data:image/png;base64," + base64;

        } catch (WriterException | IOException e) {
            System.err.println("[QrCodeUtil] Failed to generate QR code: " + e.getMessage());
            return null;
        }
    }
}
