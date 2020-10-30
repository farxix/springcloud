package com.router.util.restful;

import com.asiainfo.omp.api.*;
import com.asiainfo.omp.api.utils.CommonUtils;
import com.asiainfo.omp.api.utils.JacksonUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections.MapUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.net.SocketTimeoutException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * $Id: ApiInvokeService.java
 * <p>
 * Copyright(c) 1995-2017 by Asiainfo.com(China) All rights reserved.
 *
 * @author Jacob Liu <Liuxy8@asiainfo.com> 2018/1/11 15:27
 */
@Service
@Slf4j
public class ApiInvokeService {
	private final static Logger logger = LoggerFactory.getLogger(ApiInvokeService.class);
	private final static Client user_client = new Client("userId", "userName", "token", "ticket");

	@Autowired
	private RestTemplate restTemplate;

	@Value("${api.gateway.server.address}")
	private String apiWebServerAddress;
	@Value("${api.gateway.connect.timeout}")
	private int conTimeout;
	@Value("${api.gateway.read.timeout}")
	private int readTimeout;

	public WebResult module(String moduleName, String url, Map<String, Object> param, Page page) {
		ServiceContext serviceContext = new ServiceContext(moduleName, url, conTimeout, readTimeout);
		if (MapUtils.isEmpty(param)) {
			return operate(serviceContext, page, "{}");
		}
		return operate(serviceContext, page, param);
	}

	public WebResult module(String moduleName, String url, Map<String, Object> param) {
		ServiceContext serviceContext = new ServiceContext(moduleName, url, conTimeout, readTimeout);
		if (MapUtils.isEmpty(param)) {
			return operate(serviceContext, "{}");
		}
		return operate(serviceContext, param);
	}

	@SuppressWarnings("unchecked")
	public List<LinkedHashMap<String, List<String>>> roleAlarmList(ServiceContext serviceContext, Object reqParam) {
		Page reqPage = new Page();

		JsonRequest request = new JsonRequest.Builder(String.valueOf(System.currentTimeMillis()), serviceContext,
				user_client).data(reqParam).page(reqPage).build();

		JsonResponse jsonResponse = execute(request);
		Object obj = jsonResponse.getData();
		if (obj == null) {
			return null;
		}
		return (List<LinkedHashMap<String, List<String>>>) obj;
	}

	public WebResult operate(ServiceContext serviceContext, Object reqParam) {
		return this.operate(serviceContext, null, reqParam);
	}

	@SuppressWarnings("unchecked")
	public WebResult operate(ServiceContext serviceContext, Page page, Object reqParam) {
		Page reqPage = page;
		if (reqPage == null) {
			reqPage = new Page();
		}
		JsonRequest request = new JsonRequest.Builder(String.valueOf(System.currentTimeMillis()), serviceContext,
				user_client).data(reqParam).page(reqPage).build();

		JsonResponse jsonResponse = execute(request);

		WebResult webResult = new WebResult(jsonResponse.getStatus(), jsonResponse.getMessage());
		Object opResult = jsonResponse.getData();

		if (null != opResult) {
			OperationResult object = CommonUtils.getData(jsonResponse, OperationResult.class);
			webResult.setTotal(object.getTotal());
			webResult.setData(object.getData());
		}

		return webResult;
	}

	public JsonResponse execute(JsonRequest request) {
		try {
			return post(request);
		} catch (Exception e) {
			return handleExcepton(request, e);
		}
	}

	private JsonResponse handleExcepton(JsonRequest request, Exception e) {
		logger.error("invoke failed, reqUrl: {}, errMsg: {}", request.getServiceContext().getUrl(), e.getMessage());
		String detailERRMsg = "调用后台接口失败: %s";
		String errMsg = e.getMessage(); // 错误原因未知
		if (e instanceof HttpServerErrorException) {
			errMsg = "API服务状态异常";
		}

		Throwable cause = e.getCause();
		if (cause instanceof SocketTimeoutException) {
			if (cause.getMessage().contains("connect timed out")) {
				errMsg = "连接超时";
			}
		}

		return JsonResponse.newError(request.getId(), StatusCodeConstants.INVOKE_ERROR,
				String.format(detailERRMsg, errMsg));
	}

	private JsonResponse post(JsonRequest request) {
		long startTime = System.currentTimeMillis();
		int httpCode = -1;
		int bizCode = -1;
		try {
			String reqUrl = buildReqUrl(request);
			logger.debug("reqId={}, request url: {}", request.getId(), reqUrl);
			if (logger.isDebugEnabled()) {
				try {
					log.debug("reqId={}, json content={}", request.getId(), JacksonUtil.encode(request));
				} catch (Exception e) {
					logger.error("JacksonUtil decode JsonRequest failed");
				}
			}
			ResponseEntity<JsonResponse> responseEntity = restTemplate.postForEntity(reqUrl, request,
					JsonResponse.class);
			httpCode = responseEntity.getStatusCodeValue();
			if (httpCode == HttpStatus.OK.value()) {
				JsonResponse jsonResponse = responseEntity.getBody();
				bizCode = jsonResponse.getStatus();
				if (logger.isDebugEnabled()) {
					try {
						log.debug("resId={}, json content={}", jsonResponse.getId(), JacksonUtil.encode(jsonResponse));
					} catch (Exception e) {
						logger.error("JacksonUtil decode JsonResponse failed");
					}
				}
				return jsonResponse;
			} else {
				String errMsg = String.format("invoke api failed, url=%s, errCode=%s, errText=%s", reqUrl,
						responseEntity.getStatusCodeValue(), responseEntity);
				if (logger.isWarnEnabled()) {
					logger.warn(errMsg);
				}
				throw new ApiException(errMsg);
			}
		} catch (Exception e) {
			logger.error("api error", e);
			throw new ApiException(e);
		} finally {
			long usedTime = System.currentTimeMillis() - startTime;
			log.info("module={}, url={}, id={}, httpCode={}, bizCode={}, usedTime={}",
					request.getServiceContext().getServiceName(), request.getServiceContext().getUrl(), request.getId(),
					httpCode, bizCode, usedTime);
		}
	}

	private String buildReqUrl(JsonRequest request) {
		ServiceContext serviceContext = request.getServiceContext();
		String serviceName = serviceContext.getServiceName();
		String contextUrl = serviceContext.getUrl();

		StringBuilder stringBuilder = new StringBuilder(apiWebServerAddress);
		if (!apiWebServerAddress.endsWith("/")) {
			stringBuilder.append("/");
		}
		stringBuilder.append(serviceName);
		stringBuilder.append(contextUrl);

		stringBuilder.append("?token=test_token_haha");

		return stringBuilder.toString();
	}

}
