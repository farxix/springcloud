package com.router.api;

import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;


public class StateCode implements Serializable {
    // 定义私有变量
    private int status;
    private String message;

    public StateCode() {
        this.status = StatusCodeConstants.SUCCESS;
        this.message = "OK";
    }

    private StateCode(int status, String message) {
        this.status = status;
        this.message = message;
    }

    public static StateCode newOK(String msg) {
        return new StateCode(StatusCodeConstants.SUCCESS, msg);
    }

    public static StateCode newState(int code, String msg) {
        return new StateCode(code, msg);
    }

    public boolean isSuccess() {
        return status == StatusCodeConstants.SUCCESS;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("status", status)
                .append("message", message)
                .toString();
    }
}
