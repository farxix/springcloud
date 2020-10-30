package com.router.api.utils;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;

public class JacksonUtil {

	private static ObjectMapper objectMapper = new ObjectMapper();
	// private static ObjectMapper includeObjectMapper = new ObjectMapper();
	// private static ObjectMapper excludeObjectMapper = new ObjectMapper();

	static {
		objectMapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_CONTROL_CHARS, true);
		objectMapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
		objectMapper.configure(JsonParser.Feature.ALLOW_BACKSLASH_ESCAPING_ANY_CHARACTER, true);
		objectMapper.setDateFormat(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));
		// 设置输入时忽略JSON字符串中存在而Java对象实际没有的属性
		objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

		// 设置不输出值为 null 的属性
		objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
	}

	/**
	 * 将JSON字符串根据指定的Class反序列化成Java对象。
	 *
	 * @param json      JSON字符串
	 * @param pojoClass Java对象Class
	 * @return 反序列化生成的Java对象
	 * @throws Exception 如果反序列化过程中发生错误，将抛出异常
	 */
	public static <T> T decode(String json, Class<T> pojoClass) throws Exception {
		try {
			return objectMapper.readValue(json, pojoClass);
		} catch (Exception e) {
			throw e;
		}
	}

	/**
	 * 将JSON字符串根据指定的Class反序列化成Java对象。
	 *
	 * @param json      JSON字符串
	 * @param reference 类型引用
	 * @return 反序列化生成的Java对象
	 * @throws Exception 如果反序列化过程中发生错误，将抛出异常
	 */
	public static <T> Object decode(String json, TypeReference<T> reference) throws Exception {
		try {
			return objectMapper.readValue(json, reference);
		} catch (Exception e) {
			throw e;
		}
	}

	/**
	 * 将JSON字符串根据指定的Class反序列化成Java对象。
	 *
	 * @param inputStream 输入字符流
	 * @param reference   类型引用
	 * @return 反序列化生成的Java对象
	 * @throws Exception 如果反序列化过程中发生错误，将抛出异常
	 */
	public static <T> T decode(InputStream inputStream, Class<T> reference) throws Exception {
		try {
			return objectMapper.readValue(inputStream, reference);
		} catch (Exception e) {
			throw e;
		}
	}

	/**
	 * 将Java对象序列化成JSON字符串。
	 *
	 * @param obj 待序列化生成JSON字符串的Java对象
	 * @return JSON字符串
	 * @throws Exception 如果序列化过程中发生错误，将抛出异常
	 */
	public static String encode(Object obj) throws Exception {
		try {
			return objectMapper.writeValueAsString(obj);
		} catch (Exception e) {
			throw e;
		}
	}

	/**
	 * 将Java对象序列化成JSON字符串。
	 *
	 * @param obj 待序列化生成JSON字符串的Java对象
	 * @return JSON字符串
	 * @throws Exception 如果序列化过程中发生错误，将抛出异常
	 */
	public static void encode(OutputStream outputStream, Object obj) throws Exception {
		try {
			objectMapper.writeValue(outputStream, obj);
		} catch (Exception e) {
			throw e;
		}
	}

	/**
	 * 过滤Java对象。
	 *
	 * @param source   需要处理的java对象
	 * @param includes 需要保留的节点
	 * @param excludes 需要过滤的节点
	 * @param filterId 过滤器编码
	 * @return Object 类型为source对应的类型
	 * @throws Exception
	 */
	/*
	 * public static <T> T filter(T source, String[] includes, String[] excludes,
	 * String filterId) throws Exception { if (source == null) { return null; } if
	 * (ArrayUtils.isEmpty(includes) && ArrayUtils.isEmpty(excludes)) { return
	 * source; }
	 * 
	 * boolean hadFilter = false; String jsonResult = null; if
	 * (ArrayUtils.isNotEmpty(includes)) { SimpleFilterProvider simpleFilterProvider
	 * = new SimpleFilterProvider().addFilter(filterId,
	 * SimpleBeanPropertyFilter.filterOutAllExcept(includes)); jsonResult =
	 * includeObjectMapper.writer(simpleFilterProvider).writeValueAsString(source);
	 * hadFilter = true; }
	 * 
	 * if (ArrayUtils.isNotEmpty(excludes)) { SimpleFilterProvider
	 * simpleFilterProvider = new SimpleFilterProvider().addFilter(filterId,
	 * SimpleBeanPropertyFilter.serializeAllExcept(excludes));
	 * //excludeObjectMapper.getSerializationConfig().addMixInAnnotations(Object.
	 * class, source.getClass()); Object target = source; if (hadFilter) { target =
	 * decode(jsonResult, source.getClass()); } jsonResult =
	 * excludeObjectMapper.writer(simpleFilterProvider).writeValueAsString(target);
	 * hadFilter = true; }
	 * 
	 * return hadFilter ? (T) decode(jsonResult, source.getClass()) : source; }
	 */
}
