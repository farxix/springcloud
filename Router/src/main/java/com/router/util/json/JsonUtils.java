package com.router.util.json;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class JsonUtils {
	private final static Logger LOGGER = LoggerFactory.getLogger(JsonUtils.class);
	private static ObjectMapper mapper = null;

	static {
		mapper = new ObjectMapper();

	}

	public static synchronized ObjectMapper newInstance() {
		if (mapper == null) {
			mapper = new ObjectMapper();
		}
		return mapper;
	}

	public static String toJson(Object obj) throws Exception {
		return mapper.writeValueAsString(obj);
	}

	public static <T> T toBean(String json,Class<T> classes)throws Exception{
		return mapper.readValue(json, classes);
	}
	
	public static <T> T toBeans(String json,Class<T> classes){
		try {
			return mapper.readValue(json, classes);
		} catch (Exception e) {
			LOGGER.error("JSON 转换异常，json信息："+json+",",e);
		} 
		return null;
	}
	
	public static String toString(Object obj) {
		try {
			return mapper.writeValueAsString(obj);
		} catch (JsonProcessingException e) {
			LOGGER.error("JSON 转换异常，obj信息："+obj+",",e);
		}
		return "";
	}
}
