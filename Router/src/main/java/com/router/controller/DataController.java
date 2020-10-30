package com.router.controller;

import com.router.api.*;
import com.router.api.utils.CommonUtils;
import com.router.util.json.JsonUtils;
import com.router.util.restful.ApiInvokeService;
import com.router.util.url.RouterConstants;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

@Slf4j
@RestController
@RequestMapping(value = "/data")
public class DataController {

    @Autowired
    private ApiInvokeService apiService;

    @RequestMapping(value = "/getData", method = RequestMethod.POST)
    public JsonResponse getData(HttpServletRequest request) {
        String params = request.getParameter("params")
        log.info("数据接口请求 /getData："+params);

        JsonRequest req = null;
        OperationResult<Object> result = new OperationResult<>();
        try {
            req = JsonUtils.toBean(params,JsonRequest.class);
        } catch (Exception e) {
            log.debug("请求格式不正确");
            result.setStatus(1);
            result.setMessage("请求格式不正确");
            JsonResponse response = JsonResponse.newJsonResponse(result,"123");
            return response;
        }

        DataParam data = CommonUtils.getData(req,DataParam.class);
        String phone = data.getUserTel();
        if (StringUtils.isBlank(phone)) {
            result.setStatus(1);
            result.setMessage("手机号码不能为空");
            return JsonResponse.newJsonResponse(result, req.getId());

        }

        String tokenId = data.getTokenId();
        if (StringUtils.isBlank(tokenId)) {
            result.setStatus(1);
            result.setMessage("tokenId不能为空");
            return JsonResponse.newJsonResponse(result, req.getId());
        }

//        Object tokenObj = redisService.get(RouterConstants.USER_TOKENID + phone);
        Object tokenObj = null;
        if (tokenObj == null || !StringUtils.equals(tokenId, tokenObj.toString())) {
            result.setStatus(99);
            result.setMessage("tokenId不正确，请重新登录");
            return JsonResponse.newJsonResponse(result, req.getId());
        }

        WebResult wr = apiService.module(data.getModule(),data.getUrl(),data.getParam(),req.getPage())
        result.setStatus(wr.getStatus());
        result.setMessage(wr.getMessage());
        result.setTotal(wr.getTotal());
        result.setData(wr.getData());
        JsonResponse response = JsonResponse.newJsonResponse(result, req.getId());
        log.info("请求URL：{} 返回结果：{}",data.getUrl(),response);
        return response;
    }
}
