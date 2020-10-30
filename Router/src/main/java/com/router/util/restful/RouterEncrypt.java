package com.router.util.restful;

import com.asiainfo.omp.aes.EncryptUtils;
import com.asiainfo.omp.api.JsonResponse;
import com.asiainfo.omp.util.json.JsonUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RouterEncrypt {
	@Value("${spring.encrypt.debug}")
	private boolean isEncrypt;
	@Autowired
	private EncryptUtils encryptUtils;

	public boolean geEncrypt() {
		return isEncrypt;
	}

	public String encrypt(JsonResponse response) {
		return encrypt(JsonUtils.toString(response));
	}

	public String encrypt(String content) {
		if (!isEncrypt) {
			return encryptUtils.encrypt(content);
		}
		return content;
	}

	public String decrypt(String content) {

		// System.out.println(encryptUtils.decrypt("b1ko8Xc7OW4WGkdpt70AsdOqLXv1n6L684moHSsnOfGFwqBZUsQdhhGfw60qTCY53xYcbYIPsUIZhz3MdkLIeiPP9IYQEOTo1a5uNhJD1HhAf/xO9VBrG/I8MJwqaRfvI4Pog9E27MluRLUUTtWoZI82aUPfM8DGfgh0a5Hdu2s="));

		if (!isEncrypt) {
			return encryptUtils.decrypt(content);
		}
		return content;
	}

}
