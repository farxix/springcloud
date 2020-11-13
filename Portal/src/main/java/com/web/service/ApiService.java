//package com.web.service;
//
//
//import com.asiainfo.omp.common.api.utils.CommonUtils;
//import com.asiainfo.omp.common.api.utils.JacksonUtil;
//import com.asiainfo.omp.portal.core.CommonInputStreamResource;
//import com.asiainfo.omp.portal.domain.DataParam;
//import com.asiainfo.omp.portal.security.SpringSecurityUtils;
//import com.asiainfo.omp.portal.utils.AesUtil;
//import com.asiainfo.omp.portal.utils.JsonUtils;
//import com.common.api.*;
//import com.google.gson.Gson;
//import lombok.extern.slf4j.Slf4j;
//import net.sf.json.JSONObject;
//import org.apache.commons.collections.MapUtils;
//import org.apache.commons.lang3.StringUtils;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.PropertySource;
//import org.springframework.core.io.Resource;
//import org.springframework.http.*;
//import org.springframework.stereotype.Service;
//import org.springframework.util.LinkedMultiValueMap;
//import org.springframework.util.MultiValueMap;
//import org.springframework.web.client.HttpServerErrorException;
//import org.springframework.web.client.RestTemplate;
//import org.springframework.web.multipart.MultipartFile;
//
//import javax.annotation.Nullable;
//import java.net.SocketTimeoutException;
//import java.util.LinkedHashMap;
//import java.util.List;
//import java.util.Map;
//
///**
// * $Id: ApiInvokeService.java
// * <p>
// * Copyright(c) 1995-2017 by Asiainfo.com(China)
// * All rights reserved.
// *
// * @author Jacob Liu <Liuxy8@asiainfo.com>
// * 2018/1/11 15:27
// */
//@Service
//@Slf4j
//@PropertySource("classpath:application.properties")
//public class ApiService {
//    private final static Logger logger = LoggerFactory.getLogger(ApiService.class);
//    private final static Client user_client = new Client("userId", "userName", "token", "ticket");
//
//    @Autowired
//    private RestTemplate restTemplate;
//
//    @Value("${api.gateway.server.address}")
//    private String apiWebServerAddress;
//    @Value("${api.gateway.connect.timeout}")
//    private String conTimeout;
//    @Value("${api.gateway.read.timeout}")
//    private String readTimeout;
//
//    @Value("${spring.encrypt.key}")
//    private String encryptKey;
//
//    public String getDataCommon(String request) throws Exception {
//        String decodeRequest = AesUtil.deCode(request, encryptKey);
//        JsonRequest params = JacksonUtil.decode(decodeRequest, JsonRequest.class);
//
//        OperationResult<Object> msg = new OperationResult<>();
//        DataParam data = CommonUtils.getData(params, DataParam.class);
//        WebResult reg = operate(new ServiceContext(data.getModule(), data.getUrl()), params.getPage(), data.getParam());
//        msg.setStatus(reg.getStatus());
//        msg.setData(reg.getData());
//        msg.setTotal(reg.getTotal());
//        msg.setMessage(reg.getMessage());
//        JsonResponse response = JsonResponse.newJsonResponse(msg, params.getId());
//        return AesUtil.enCode(JsonUtils.toString(response), encryptKey);
//    }
//
//    public WebResult module(String moduleName,String url,Map<String,Object> param){
//        log.info(">>>>>>>conTimeout {}",conTimeout);
//        log.info(">>>>>>>readTimeout {}",readTimeout);
//    	ServiceContext serviceContext = new ServiceContext(moduleName,url,Integer.parseInt(conTimeout),Integer.parseInt(readTimeout));
//    	if(MapUtils.isEmpty(param)) {
//    		return operate(serviceContext,"{}");
//    	}
//    	return operate(serviceContext,param);
//    }
//
//    @SuppressWarnings("unchecked")
//    public List<LinkedHashMap<String, List<String>>> roleAlarmList(ServiceContext serviceContext, Object reqParam) {
//        Page reqPage = new Page();
//
//        JsonRequest request = new JsonRequest.Builder(String.valueOf(System.currentTimeMillis()),
//                serviceContext, SpringSecurityUtils.getCurrentClient())
//                .data(reqParam).page(reqPage)
//                .build();
//
//        JsonResponse jsonResponse = execute(request);
//        Object obj = jsonResponse.getData();
//        if(obj==null) {
//        	return null;
//        }
//        return (List<LinkedHashMap<String, List<String>>>)obj;
//    }
//    public WebResult operate(ServiceContext serviceContext, Object reqParam) {
//        return this.operate(serviceContext, null, reqParam);
//    }
//
//
//    @SuppressWarnings("unchecked")
//    public WebResult operate(ServiceContext serviceContext, Page page, Object reqParam) {
//        Page reqPage = page;
//        if (reqPage == null) {
//            reqPage = new Page();
//        }
//        JsonRequest request = new JsonRequest.Builder(String.valueOf(System.currentTimeMillis()),
//                serviceContext, SpringSecurityUtils.getCurrentClient())
//                .data(reqParam).page(reqPage)
//                .build();
//
//        JsonResponse jsonResponse = execute(request);
//        return jsonResponse2WebResult(jsonResponse);
//    }
//
//    public WebResult operateNoPage(ServiceContext serviceContext, Object reqParam) {
//        JsonRequest request = new JsonRequest.Builder(String.valueOf(System.currentTimeMillis()),
//                serviceContext, SpringSecurityUtils.getCurrentClient())
//                .data(reqParam).build();
//
//        JsonResponse jsonResponse = execute(request);
//        return jsonResponse2WebResult(jsonResponse);
//    }
//
//
//    public JsonResponse execute(JsonRequest request) {
//        try {
//            return post(request);
//        } catch (Exception e) {
//            return handleExcepton(request, e);
//        }
//    }
//
//
//    private JsonResponse handleExcepton(JsonRequest request, Exception e) {
//        logger.error("invoke failed, reqUrl: {}, errMsg: {}", request.getServiceContext().getUrl(), e.getMessage());
//        String detailERRMsg = "调用后台接口失败: %s";
//        String errMsg = e.getMessage(); // 错误原因未知
//        if (e instanceof HttpServerErrorException) {
//            errMsg = "API服务状态异常";
//        }
//
//        Throwable cause = e.getCause();
//        if (cause instanceof SocketTimeoutException) {
//            if (cause.getMessage().contains("connect timed out")) {
//                errMsg = "连接超时";
//            }
//        }
//
//        return JsonResponse.newError(request.getId(), StatusCodeConstants.INVOKE_ERROR, String.format(detailERRMsg, errMsg));
//    }
//
//
//    private JsonResponse post(JsonRequest request) {
//        long startTime = System.currentTimeMillis();
//        int httpCode = -1;
//        int bizCode = -1;
//        try {
//            String reqUrl = buildReqUrl(request);
//            logger.debug("reqId={}, request url: {}", request.getId(), reqUrl);
//            if (logger.isDebugEnabled()) {
//                try {
//                    log.debug("reqId={}, json content={}", request.getId(), JacksonUtil.encode(request));
//                } catch (Exception e) {
//                    logger.error("JacksonUtil decode JsonRequest failed");
//                }
//            }
//            ResponseEntity<JsonResponse> responseEntity = restTemplate.postForEntity(reqUrl, request, JsonResponse.class);
//            httpCode = responseEntity.getStatusCodeValue();
//            if (httpCode == HttpStatus.OK.value()) {
//                JsonResponse jsonResponse = responseEntity.getBody();
//                bizCode = jsonResponse.getStatus();
//                if (logger.isDebugEnabled()) {
//                    try {
//                    	log.debug("resId={}, json content={}", jsonResponse.getId(), JacksonUtil.encode(jsonResponse));
//                    } catch (Exception e) {
//                        logger.error("JacksonUtil decode JsonResponse failed");
//                    }
//                }
//                return jsonResponse;
//            } else {
//                String errMsg = String.format("invoke api failed, url=%s, errCode=%s, errText=%s", reqUrl,
//                        responseEntity.getStatusCodeValue(), responseEntity);
//                if (logger.isWarnEnabled()) {
//                    logger.warn(errMsg);
//                }
//                throw new ApiException(errMsg);
//            }
//        } catch(Exception e){
//        	logger.error("api error",e);
//        	throw new ApiException(e);
//        }finally {
//            long usedTime = System.currentTimeMillis() - startTime;
//            log.info("module={}, url={}, id={}, httpCode={}, bizCode={}, usedTime={}",
//                    request.getServiceContext().getServiceName(), request.getServiceContext().getUrl(),
//                    request.getId(), httpCode, bizCode, usedTime);
//        }
//    }
//
//
//
//    private String buildReqUrl(JsonRequest request) {
//        ServiceContext serviceContext = request.getServiceContext();
//        String serviceName = serviceContext.getServiceName();
//        String contextUrl = serviceContext.getUrl();
//
//        StringBuilder stringBuilder = new StringBuilder(apiWebServerAddress);
//        if (!apiWebServerAddress.endsWith("/")) {
//            stringBuilder.append("/");
//        }
//        stringBuilder.append(serviceName);
//        stringBuilder.append(contextUrl);
//
//        stringBuilder.append("?token=test_token_haha");
//
//        return stringBuilder.toString();
//    }
//
//    /**
//     * 发送文件
//     * create on 2020/01/13
//     * add by zhangzx6@asiainfo.com
//     *
//     * @param serviceContext : serviceContext
//     * @param reqParam：请求参数
//     * @param fileField : 上传文件字段
//     * @param file : 待上传文件
//     */
//    public WebResult postFile(ServiceContext serviceContext, Object reqParam, String fileField, MultipartFile file) {
//        JsonRequest request = new JsonRequest.Builder(String.valueOf(System.currentTimeMillis()),
//                serviceContext, SpringSecurityUtils.getCurrentClient())
//                .data(reqParam)
//                .build();
//
//        JsonResponse jsonResponse = this.postFile(request,fileField,file);
//        return jsonResponse2WebResult(jsonResponse);
//    }
//
//    /**
//     * 发送文件
//     * create on 2020/01/13
//     * add by zhangzx6@asiainfo.com
//     *
//     * @param request：请求信息
//     * @param fileField : 上传文件字段
//     * @param file : 待上传文件
//     */
//    private JsonResponse postFile(JsonRequest request, String fileField, MultipartFile file) {
//        long startTime = System.currentTimeMillis();
//        int httpCode = -1;
//        int bizCode = -1;
//        String serviceName = request.getServiceContext().getServiceName();
//        String url = request.getServiceContext().getUrl();
//        try {
//            String reqUrl = buildReqUrl(request);
//            logger.debug("reqId={}, module={}, request url: {}", request.getId(), serviceName, reqUrl);
//            if (logger.isDebugEnabled()) {
//                try {
//                    logger.debug("reqId={}, module={}, reqUrl={}, json content={}", request.getId(), serviceName, url, JacksonUtil.encode(request));
//                } catch (Exception e) {
//                    logger.error("JacksonUtil decode JsonRequest failed");
//                }
//            }
//
//            MultiValueMap<String, Object> param =  new LinkedMultiValueMap<>();
//            JSONObject reqData = (JSONObject) request.getData();
//            for(Object key : reqData.keySet()){
//                param.add(key.toString(),reqData.get(key));
//            }
//
//            if(file != null){
//                fileField = StringUtils.isBlank(fileField) ? "file" : fileField;
//                CommonInputStreamResource resource = new CommonInputStreamResource(file.getInputStream(), file.getOriginalFilename(), file.getSize());
//                param.add(fileField, resource);
//            }
//
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
//            headers.setConnection("Keep-Alive");
//            headers.setCacheControl("no-cache");
//
//            HttpEntity<MultiValueMap<String, Object>> httpEntity = new HttpEntity<>(param, headers);
//            RestTemplate restTemplate = new RestTemplate();
//            ResponseEntity<JsonResponse> responseEntity = restTemplate.postForEntity(reqUrl, httpEntity, JsonResponse.class);
//            httpCode = responseEntity.getStatusCodeValue();
//            if (responseEntity.getStatusCode().is2xxSuccessful()) { // httpCode == HttpStatus.CREATED.value()
//                if (logger.isDebugEnabled()) {
//                    try {
//                        logger.debug("resId={}, response headers={}", request.getId(), JacksonUtil.encode(responseEntity.getHeaders()));
//                    } catch (Exception e) {
//                        logger.error("JacksonUtil decode JsonResponse failed");
//                    }
//                }
//                return responseEntity.getBody();
//            } else {
//                String errMsg = String.format("invoke api failed, url=%s, errCode=%s, errText=%s", reqUrl,
//                        responseEntity.getStatusCodeValue(), responseEntity);
//                if (logger.isWarnEnabled()) {
//                    logger.warn(errMsg);
//                }
//                throw new ApiException(errMsg);
//            }
//        } catch (Exception e) {
//            throw new ApiException(e.getMessage());
//        } finally {
//            long usedTime = System.currentTimeMillis() - startTime;
//            logger.info("module={}, url={}, id={}, httpCode={}, bizCode={}, usedTime={}",
//                    serviceName, url, request.getId(), httpCode, bizCode, usedTime);
//        }
//    }
//
//    /**
//     * 接收文件
//     * create on 2020/01/13
//     * add by zhangzx6@asiainfo.com
//     */
//    @Nullable
//    public ResponseEntity<Resource> operateForFile(ServiceContext serviceContext, Object reqParam) {
//        JsonRequest request = new JsonRequest.Builder(String.valueOf(System.currentTimeMillis()),
//                serviceContext, SpringSecurityUtils.getCurrentClient())
//                .data(reqParam).page(new Page())
//                .build();
//        return postForFile(request);
//    }
//
//    /**
//     * 接收文件
//     * create on 2020/01/13
//     * add by zhangzx6@asiainfo.com
//     */
//    private ResponseEntity<Resource> postForFile(JsonRequest request) {
//        long startTime = System.currentTimeMillis();
//        int httpCode = -1;
//        try {
//            String reqUrl = buildReqUrl(request);
//            logger.debug("reqId={}, request url: {}", request.getId(), reqUrl);
//
//            if (logger.isDebugEnabled()) {
//                try {
//                    logger.debug("reqId={}, json content={}", request.getId(), JacksonUtil.encode(request));
//                } catch (Exception e) {
//                    logger.error("JacksonUtil decode JsonRequest failed");
//                }
//            }
//
//            ResponseEntity<Resource> responseEntity = restTemplate.postForEntity(reqUrl, request, Resource.class);
//            httpCode = responseEntity.getStatusCodeValue();
//            if (responseEntity.getStatusCode().is2xxSuccessful()) { // httpCode == HttpStatus.CREATED.value()
//
//                if (logger.isDebugEnabled()) {
//                    try {
//                        logger.debug("resId={}, response headers={}", request.getId(), JacksonUtil.encode(responseEntity.getHeaders()));
//                    } catch (Exception e) {
//                        logger.error("JacksonUtil decode JsonResponse failed");
//                    }
//                }
//
//                return responseEntity;
//            } else {
//                String errMsg = String.format("invoke api failed, url=%s, errCode=%s, errText=%s", reqUrl,
//                        responseEntity.getStatusCodeValue(), responseEntity);
//                if (logger.isWarnEnabled()) {
//                    logger.warn(errMsg);
//                }
//                throw new ApiException(errMsg);
//            }
//        } finally {
//            long usedTime = System.currentTimeMillis() - startTime;
//            logger.info("module={}, url={}, id={}, httpCode={}, usedTime={}",
//                    request.getServiceContext().getServiceName(), request.getServiceContext().getUrl(),
//                    request.getId(), httpCode, usedTime);
//        }
//    }
//
//
//    /**
//     * 发送表单请求
//     */
//    public WebResult postForm(ServiceContext serviceContext, Object reqParam) {
//        JsonRequest request = new JsonRequest.Builder(String.valueOf(System.currentTimeMillis()),
//                serviceContext, SpringSecurityUtils.getCurrentClient())
//                .data(reqParam)
//                .build();
//
//        JsonResponse response = this.postForm(request);
//        return jsonResponse2WebResult(response);
//    }
//
//    /**
//     * post 表单请求
//     */
//    private JsonResponse postForm(JsonRequest request) {
//        long startTime = System.currentTimeMillis();
//        int httpCode = -1;
//        int bizCode = -1;
//        try {
//            String reqUrl = buildReqUrl(request);
//            logger.debug("reqId={}, request url: {}", request.getId(), reqUrl);
//
//            // json参数转换表单参数
//            MultiValueMap<String, Object> params = new LinkedMultiValueMap<>();
//            params.add("params",new Gson().toJson(request));
//
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
//            HttpEntity<MultiValueMap> httpRequest = new HttpEntity<>(params, headers);
//            ResponseEntity<JsonResponse> responseEntity  = restTemplate.postForEntity(reqUrl ,httpRequest,JsonResponse.class);
//            httpCode = responseEntity.getStatusCodeValue();
//            if (httpCode == HttpStatus.OK.value()) {
//                if (logger.isTraceEnabled()) {
//                    logger.trace(new Gson().toJson(responseEntity.getBody()));
//                }
//                return responseEntity.getBody();
//            } else {
//                String errMsg = String.format("invoke api failed, url=%s, errCode=%s, errText=%s", reqUrl, responseEntity.getStatusCodeValue(), responseEntity);
//                if (logger.isWarnEnabled()) {
//                    logger.warn(errMsg);
//                }
//                throw new ApiException(errMsg);
//            }
//        } finally {
//            long usedTime = System.currentTimeMillis() - startTime;
//            log.info("module={}, url={}, id={}, httpCode={}, bizCode={}, usedTime={}",
//                    request.getServiceContext().getServiceName(), request.getServiceContext().getUrl(),
//                    request.getId(), httpCode, bizCode, usedTime);
//        }
//    }
//
//
//    /**
//     * 发送表单请求
//     */
//    public WebResult postEncryptForm(ServiceContext serviceContext, Object reqParam,String encryptKey) {
//        JsonRequest request = new JsonRequest.Builder(String.valueOf(System.currentTimeMillis()),
//                serviceContext, SpringSecurityUtils.getCurrentClient())
//                .data(reqParam)
//                .build();
//
//        JsonResponse response = this.postEncryptForm(request,encryptKey);
//        log.info("postEncryptForm response :{}",response.toString());
//        return jsonResponse2WebResult(response);
//    }
//
//    /**
//     * post 表单请求
//     */
//    private JsonResponse postEncryptForm(JsonRequest request,String encryptKey) {
//        long startTime = System.currentTimeMillis();
//        int httpCode = -1;
//        int bizCode = -1;
//        try {
//            String reqUrl = buildReqUrl(request);
//            logger.debug("reqId={}, request url: {}", request.getId(), reqUrl);
//
//            // json参数转换表单参数
//            MultiValueMap<String, Object> params = new LinkedMultiValueMap<>();
//            params.add("params",AesUtil.enCode(new Gson().toJson(request),encryptKey));
//
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
//            HttpEntity<MultiValueMap> httpRequest = new HttpEntity<>(params, headers);
//            log.info("HttpRequest:{}",httpRequest.toString());
//            ResponseEntity<String> responseEntity  = restTemplate.postForEntity(reqUrl ,httpRequest,String.class);
//            httpCode = responseEntity.getStatusCodeValue();
//            if (httpCode == HttpStatus.OK.value()) {
//                if (logger.isTraceEnabled()) {
//                    logger.trace(new Gson().toJson(responseEntity.getBody()));
//                }
//                log.info(responseEntity.getBody());
//                String body = AesUtil.deCode(responseEntity.getBody(), encryptKey);
//                return JacksonUtil.decode(body, JsonResponse.class);
//            } else {
//                String errMsg = String.format("invoke api failed, url=%s, errCode=%s, errText=%s", reqUrl, responseEntity.getStatusCodeValue(), responseEntity);
//                if (logger.isWarnEnabled()) {
//                    logger.warn(errMsg);
//                }
//                throw new ApiException(errMsg);
//            }
//        } catch (Exception e) {
//            log.error("throws exception:{}",e.getMessage());
//        } finally {
//            long usedTime = System.currentTimeMillis() - startTime;
//            log.info("module={}, url={}, id={}, httpCode={}, bizCode={}, usedTime={}",
//                    request.getServiceContext().getServiceName(), request.getServiceContext().getUrl(),
//                    request.getId(), httpCode, bizCode, usedTime);
//        }
//        return null;
//    }
//
//
//    private WebResult jsonResponse2WebResult(JsonResponse response){
//        WebResult webResult = new WebResult(response.getStatus(), response.getMessage());
//        Object opResult = response.getData();
//
//        if (null != opResult) {
//            OperationResult object = CommonUtils.getData(response, OperationResult.class);
//            webResult.setTotal(object.getTotal());
//            webResult.setData(object.getData());
//        }
//
//        return webResult;
//    }
//}
