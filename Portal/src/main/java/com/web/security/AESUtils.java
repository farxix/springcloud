package com.web.security;

import org.apache.commons.codec.binary.Hex;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

public class AESUtils {
    private static final String DEFAULT_CIPHER_ALGORITHM = "AES/CBC/PKCS5Padding";

    // 转为AES专用密钥
    private static final String sKey = "XXYYZZ0123456789"; // GHIJKLMNOPQRSTUVWXYZ
    private static final String ivParameter = "0123456789axbycz";
    private static final SecretKeySpec SECRET_KEY_SPEC = new SecretKeySpec(sKey.getBytes(), "AES");
    private static final IvParameterSpec IV_PARAMETER_SPEC = new IvParameterSpec(ivParameter.getBytes());

    public static String encryptWithAES(String plainText) {
        try {
            // 创建加密器
            Cipher cipher = Cipher.getInstance(DEFAULT_CIPHER_ALGORITHM);
            // 初始化加密模式的加密器
            cipher.init(Cipher.ENCRYPT_MODE, SECRET_KEY_SPEC, IV_PARAMETER_SPEC);
            // 加密
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Hex.encodeHexString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException(" encrypt password failed", e);
        }
    }

    public static String decryptWithAES(String sSrc) {
        try {
            Cipher cipher = Cipher.getInstance(DEFAULT_CIPHER_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, SECRET_KEY_SPEC, IV_PARAMETER_SPEC);

            byte[] decodedValue = Hex.decodeHex(sSrc.toCharArray());
            byte[] original = cipher.doFinal(decodedValue);
            return new String(original, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("decrypt password failed", e);
        }
    }

    public static void main(String[] args) {
        String plainText = "hello everyone!";
        String encrypt = encryptWithAES(plainText);
        String decrypt = decryptWithAES(encrypt);
        System.out.println(String.format("plainText=[%s], encrypted=[%s], decrypted=[%s]\n", plainText, encrypt, decrypt));
    }
}
