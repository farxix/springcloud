package com.web.security;

import org.apache.commons.codec.binary.Hex;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

public class AESUtils {
    // private static final String KEY_ALGORITHM = "DES";
    /* AES/CBC/PKCS5Padding */
    private static final String AES_CIPHER_ALGORITHM = "AES/CBC/PKCS5Padding";
    // private static final String DES_CIPHER_ALGORITHM = "DES/ECB/PKCS5Padding";
    private static final String DEFAULT_CIPHER_ALGORITHM = AES_CIPHER_ALGORITHM;

    private static final String sKey = "XXYYZZ0123456789"; // GHIJKLMNOPQRSTUVWXYZ
    private static final String ivParameter = "0123456789axbycz"; // GHIJKLMNOPQRSTUVWXYZ
    private static final SecretKeySpec SECRET_KEY_SPEC = new SecretKeySpec(sKey.getBytes(), "AES");
    private static final IvParameterSpec IV_PARAMETER_SPEC = new IvParameterSpec(ivParameter.getBytes());


    public static String encryptWithAES(String plainText) {
        try {
            Cipher cipher;
            cipher = Cipher.getInstance(DEFAULT_CIPHER_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, SECRET_KEY_SPEC, IV_PARAMETER_SPEC);

            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            return Hex.encodeHexString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("encrypt password failed", e);
        }
    }

    // 解密
    public static String decryptWithAES(String sSrc) {
        try {
//            Cipher cipher = Cipher.getInstance(DEFAULT_CIPHER_ALGORITHM);
//            cipher.init(Cipher.DECRYPT_MODE, SECRET_KEY_SPEC, IV_PARAMETER_SPEC);
//
//            byte[] decodedValue = Hex.decodeHex(sSrc);
//
//            byte[] original = cipher.doFinal(decodedValue);
//            return new String(original, StandardCharsets.UTF_8);
            return null;
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }

    public static void main(String[] args) {
        List<String> strings = Arrays.asList("asdfasdf", "test", "a", "liuxiyong", "Cwr!20131210");

        for (String string : strings) {
            test(string);
        }
    }

    private static void test(String plainText) {
        String encrypt = encryptWithAES(plainText);
        String decrypt = decryptWithAES(encrypt);

        System.out.println(String.format("plainText=[%s], encrypted=[%s], decrypted=[%s]\n", plainText, encrypt, decrypt));
    }
}
