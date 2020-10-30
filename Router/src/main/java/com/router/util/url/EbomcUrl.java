package com.router.util.url;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class EbomcUrl {
	@Value("${ebomc.url}")
	private String base;

	public String login(int type) {
		String url = "";
		switch (type) {
		case 1:
			url="/acctAuthen";
			break;
		case 2:
			url="/createKey";
			break;
		case 3:
			url="/keyValidate";
			break;
		default:
			break;
		}
		return base+url;
	}

	public String getBase() {
		return base;
	}

	public void setBase(String base) {
		this.base = base;
	}
	
}
