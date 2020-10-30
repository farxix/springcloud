package com.router.api;

import lombok.Data;

import java.util.Map;

@Data
public class DataParam {
	private String tokenId;
	private String userTel;
	private String module;
	private String url;
	private Map<String,Object> param;
	
}
