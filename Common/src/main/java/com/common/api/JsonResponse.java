package com.common.api;

import com.common.api.utils.OpResultUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.github.pagehelper.PageInfo;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

/**
 * $Id: JsonResponse.java
 * <p>
 * Copyright(c) 1995-2017 by Asiainfo.com(China)
 * All rights reserved.
 *
 * @author Jacob Liu <Liuxy8@asiainfo.com>
 * 2018/1/10 15:47
 */
public class JsonResponse implements Serializable, Cloneable {
    private String id;

    private int status;
    private String message;
    private Object data;

    private JsonResponse() {
    }

    private JsonResponse(String id) {
        this.id = id;
    }

    public static JsonResponse newJsonResponse(OperationResult result, String id) {
        JsonResponse response = new JsonResponse(id);

        if (result.getData() != null) {
            response.setData(result);
        }

        if (result.isSuccess()) {
            response.setState(StateCode.newOK(result.getMessage()));
        } else {
            response.setState(StateCode.newState(result.getStatus(), result.getMessage()));
        }

        return response;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }

    public static JsonResponse newJsonResponse(Object data, String id, int status, String message) {
        JsonResponse response = new JsonResponse(id);
        if (data != null) {
            response.setData(data);
        }
        if (status == 0) {
            response.setState(StateCode.newOK(message));
        } else {
            response.setState(StateCode.newState(status, message));
        }
        return response;
    }

    public static JsonResponse newJsonResponse(PageInfo pageInfo, String id) {
        OperationResult operationResult = OpResultUtils.fromPageInfo(pageInfo);

        return newJsonResponse(operationResult, id);
    }

    public static JsonResponse newOk(String id) {
        JsonResponse response = new JsonResponse(id);
        response.setState(StateCode.newOK("success"));

        return response;
    }

    public static JsonResponse newParamsInvalid(String id, String msg) {
        JsonResponse response = new JsonResponse(id);
        response.setState(StateCode.newState(StatusCodeConstants.PARAM_INVALID, msg));

        return response;
    }

    public static JsonResponse newAuthenticationFailed(String id) {
        JsonResponse response = new JsonResponse(id);
        response.setState(StateCode.newState(StatusCodeConstants.AUTHENTICATION_FAILED, "认证失败"));

        return response;
    }

    public static JsonResponse ClientNotFound(String id) {
        JsonResponse response = new JsonResponse(id);
        response.setState(StateCode.newState(StatusCodeConstants.CLIENT_NOT_FOUND, "client not found"));

        return response;
    }

    public static JsonResponse newError(String id, int stateCode, String msg) {
        JsonResponse response = new JsonResponse(id);
        response.setState(StateCode.newState(stateCode, msg));

        return response;
    }

    public static JsonResponse newError(String id, String msg) {
        JsonResponse response = new JsonResponse(id);
        response.setState(StateCode.newState(StatusCodeConstants.SYSTEM_ERROR, msg));

        return response;
    }

    @JsonIgnore
    public boolean isSuccess() {
        return status == StatusCodeConstants.SUCCESS;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setState(StateCode state) {
        this.status = state.getStatus();
        this.message = state.getMessage();
    }

    public int getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("id", id)
                .append("status", status)
                .append("message", message)
                .append("data", data)
                .toString();
    }
}
