/**
 *
 */
package com.common.api;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

/**
 * 操作返回对象
 *
 * @version 2016-4-11
 */
public class OperationResult<T> implements Serializable {
    private static final long serialVersionUID = 4573613428545769800L;
    /**
     * 操作结果状态
     */
    @JsonIgnore
    private int status;
    /**
     * 错误简短信息
     * 操作为STATUS_SUCCESS时，为空。
     */
    @JsonIgnore
    private String message;
    /**
     * 操作返回的可序列化对象
     */
    @JsonProperty("data")
    private T data;
    /**
     * 数据总量，用于分页查询时使用
     */
    private Long total;

    public OperationResult() {
        this.status = 0;
    }

    public OperationResult(int status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    public OperationResult(int status, String message, T data, long total) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.total = total;
    }

    /**
     * 错误
     *
     * @param msg error message
     * @return operation result
     */
    public static <T> OperationResult<T> failure(String msg) {
        OperationResult<T> result = new OperationResult<>();
        result.setStatus(1);
        result.setMessage(msg);
        return result;
    }

    /**
     * 成功
     *
     * @param msg error message
     * @param data data
     * @return operation result
     */
    public static <T> OperationResult<T> success(String msg, T data) {
        OperationResult<T> result = new OperationResult<>();
        result.setStatus(0);
        result.setMessage(msg);
        if (data != null) {
            result.setData(data);
        }
        return result;
    }

    public static <T> OperationResult<T> success(String msg) {
        OperationResult<T> result = new OperationResult<>();
        result.setStatus(0);
        result.setMessage(msg);
        return result;
    }

    /**
     * 判断是否成功
     *
     * @return true if success
     */
    @JsonIgnore
    public boolean isSuccess() {
        return status == 0;
    }


    /**
     * @return the status
     */
    public int getStatus() {
        return status;
    }

    /**
     * @param status the status to set
     */
    public void setStatus(int status) {
        this.status = status;
    }


    /**
     * @return the message
     */
    public String getMessage() {
        return message;
    }

    /**
     * @param message the message to set
     */
    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * @return the data
     */
    public T getData() {
        return data;
    }

    /**
     * @param data the data to set
     */
    public void setData(T data) {
        this.data = data;
    }

    /**
     * @return the total
     */
    public Long getTotal() {
        return total;
    }

    /**
     * @param total the total to set
     */
    public void setTotal(Long total) {
        this.total = total;
    }

    public void setTotal(int total) {
        this.total = Integer.toUnsignedLong(total);
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("status", status)
                .append("message", message)
                .append("data", data)
                .append("total", total)
                .toString();
    }
}
