package com.router.api.utils;

import com.router.api.JsonRequest;
import com.router.api.JsonResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;

import java.util.*;

/**
 * $Id: CommonUtils.java
 * <p>
 * Copyright(c) 1995-2017 by Asiainfo.com(China) All rights reserved.
 *
 * @author Jacob Liu <Liuxy8@asiainfo.com> 2018/1/11 11:47
 */
@SuppressWarnings("unchecked")
public class CommonUtils {
	private final static Logger logger = LoggerFactory.getLogger(CommonUtils.class);

	public static <T> T getData(JsonRequest request, Class<T> clazz) {
		final Object data = request.getData();
		if (data == null) {
			try {
				return clazz.newInstance();
			} catch (Exception e) {
				logger.error("clazz.newInstance failed", e);
			}
		}

		// 使用 Jackson 将对请求中的 data 转换为新对象
		try {
			String dataAsJson = JacksonUtil.encode(data);
			return JacksonUtil.decode(dataAsJson, clazz);
		} catch (Exception e) {
			logger.error("getData failed", e);
			// 使用 BeanUtil 进行转换
			try {
				Map map = null;
				if (data instanceof LinkedHashMap) {
					map = (LinkedHashMap) data;
				}
				if (data instanceof HashMap) {
					map = (HashMap) data;
				}
				T obj = clazz.newInstance();
				BeanUtils.populate(obj, map);
				return obj;
			} catch (Exception e1) {
				logger.warn("使用 BeanUtil 将请求中的 data 转换类实例出错，目标类实例名称：{}", clazz.getName());
			}
		}
		return null;
	}

	public static <T> T getData(JsonResponse response, Class<T> clazz) {
		final Object data = response.getData();
		if (data == null) {
			try {
				return clazz.newInstance();
			} catch (Exception e) {
				logger.error("clazz.newInstance failed", e);
			}
		}

		// 使用 Jackson 将对请求中的 data 转换为新对象
		try {
			String dataAsJson = JacksonUtil.encode(data);
			return JacksonUtil.decode(dataAsJson, clazz);
		} catch (Exception e) {
			logger.warn("使用 Jackson 将请求中的 data 转换类实例出错，API 请求：,目标类实例名称：{}，现使用 BeanUtil 进行转换", clazz.getName());

			// 使用 BeanUtil 进行转换
			try {
				Map map = null;
				if (data instanceof LinkedHashMap) {
					map = (LinkedHashMap) data;
				}
				if (data instanceof HashMap) {
					map = (HashMap) data;
				}
				T obj = clazz.newInstance();
				BeanUtils.populate(obj, map);
				return obj;
			} catch (Exception e1) {
				logger.warn("使用 BeanUtil 将请求中的 data 转换类实例出错，目标类实例名称：{}", clazz.getName());
			}
		}
		return null;
	}

	/**
	 * 解析请求中 data 节点的某个属性值为对象。
	 * <p>
	 * 例如：
	 * </p>
	 * 
	 * <pre>
	 * "data":{
	 *    "response": {
	 *        "include": ["detail"],
	 *        "exclude": ["versionName", "commentCount"],
	 *        "flag": 1
	 *    }
	 * }
	 * </pre>
	 * <p>
	 * 调用：<br/>
	 * </p>
	 * ResponseFields responseFields = (ResponseFields)
	 * CommonUtil.extractValueAsObject(data, "response", ResponseFields.class);
	 *
	 * @param data         data 节点对象
	 * @param propertyName data 节点的属性名称
	 * @param clazz        对象类名
	 * @return 如果解析过程出错，那么返回空的对象
	 */
	public static Object extractValueAsObject(Object data, String propertyName, Class clazz) {
		Object obj = null;
		try {
			obj = clazz.newInstance();
			if (data instanceof LinkedHashMap) {
				LinkedHashMap propertyObject = (LinkedHashMap) ((LinkedHashMap) data).get(propertyName);
				BeanUtils.populate(obj, propertyObject);
			}
		} catch (Exception e) {
			logger.warn("解析 data 节点中的某个值为对象时出错，内容为：{}", data.toString(), e);
		}

		return obj;
	}

	public static <T> T map2object(Object data, Class<T> clazz) {
		try {
			T obj = clazz.newInstance();
			if (data instanceof LinkedHashMap) {
				LinkedHashMap dataMap = (LinkedHashMap) data;
				BeanUtils.populate(obj, dataMap);

				return obj;
			}
		} catch (Exception e) {
			try {
				String encode = JacksonUtil.encode(data);
				return JacksonUtil.decode(encode, clazz);
			} catch (Exception e1) {
				logger.error("map2object failed", e1);
			}
		}

		return null;
	}

	/**
	 * 将请求数据转化为map对象
	 *
	 * @param request 客户端请求json数据转换的类
	 * @return Map/null
	 */
	public static Map getDataMap(JsonRequest request) {
		try {
			final Object data = request.getData();
			Map map = null;
			if (data instanceof LinkedHashMap) {
				map = (LinkedHashMap) data;
			}
			if (data instanceof HashMap) {
				map = (HashMap) data;
			}
			return map;
		} catch (Exception e) {
			logger.info(e.getMessage());
		}
		return null;
	}

	/**
	 * 解析请求中 data 节点的某个属性值为列表对象。
	 * <p>
	 * 例如：
	 * </p>
	 * 
	 * <pre>
	 * "data":{
	 *    "list":[
	 *        {"id":"10001","name":"user10001"},
	 *        {"id":"10009","name":"user10009"}
	 *     ]
	 * }
	 * </pre>
	 * <p>
	 * 调用：<br/>
	 * </p>
	 * List&lt;ExampleUserData&gt; list = CommonUtil.extractValueAsList(data,
	 * "list", ExampleUserData.class);
	 *
	 * @param data         data 节点对象
	 * @param propertyName data 节点的属性名称
	 * @param clazz        对象类名
	 * @return 如果解析过程出错，那么返回空的列表
	 */
	public static <T> List<T> extractValueAsList(Object data, String propertyName, Class clazz) {
		List result = new ArrayList();
		try {
			if (data instanceof LinkedHashMap) {
				List d = (List) ((LinkedHashMap) data).get(propertyName);
				for (Object aD : d) {
					Map map = (LinkedHashMap) aD;
					Object obj = clazz.newInstance();
					BeanUtils.populate(obj, map);
					result.add(obj);
				}
			}
		} catch (Exception e) {
			logger.warn("解析 data 节点中的某个值为列表时出错，内容为：{}", data.toString());
		}

		return result;
	}

	public static <T> List<T> extractValueAsList(Object data, Class<T> clazz) {
		List result = new ArrayList();
		try {
			List d = (List) data;
			for (Object aD : d) {
				Map map = (LinkedHashMap) aD;
				Object obj = clazz.newInstance();
				BeanUtils.populate(obj, map);
				result.add(obj);
			}
		} catch (Exception e) {
			logger.warn("解析 data 节点中的某个值为列表时出错，内容为：{}", data.toString());
		}

		return result;
	}

	/**
	 * 将bean转为map对象
	 *
	 * @param bean target bean
	 * @return map result
	 * @deprecated 这个方法用点问题，会强制把对象的值转换为 String，用 describeBean 方法可以保留原有类型
	 */
	public static Map<String, String> beanToMap(Object bean) {
		Map<String, String> map = new HashMap<>();
		try {
			BeanUtils.populate(bean, map);
			map.remove("class"); // 移除class自己的key
		} catch (Exception e) {
			logger.error("将bean转为map出错：{}", e.getMessage(), e);
		}
		return map;
	}

	/**
	 * 将 bean 转为map对象
	 *
	 * @param bean 值对象
	 * @return bean 的属性列表
	 */
	public static Map<String, Object> describeBean(Object bean) {
		Map<String, Object> map = null;
		try {
			map = PropertyUtils.describe(bean);
			map.remove("class"); // 移除class自己的key
		} catch (Exception e) {
			logger.error("将bean转为map出错：{}", e.getMessage(), e);
		}
		return map;
	}

	/**
	 * 将bean转为map对象（map中的value不转为String）
	 *
	 * @param bean target bean
	 * @return map result object
	 */
	public static Map<String, Object> beanToPropertyMap(Object bean) {
		Map<String, Object> map = null;
		try {
			map = PropertyUtils.describe(bean);
			map.remove("class"); // 移除class自己的key
		} catch (Exception e) {
			logger.error("将bean转为map出错：{}", e.getMessage(), e);
		}
		return map;
	}
}
