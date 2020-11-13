package com.common.api;

import org.apache.commons.lang3.builder.ToStringBuilder;

/**
 * $Id: ServiceContext.java
 * <p>
 * Copyright(c) 1995-2017 by Asiainfo.com(China)
 * All rights reserved.
 *
 * @author Jacob Liu <Liuxy8@asiainfo.com>
 * 2018/1/10 15:44
 */
public class ServiceContext {
    /* 连接超时时间 */
    private final static int DEFAULT_CONNECT_TIMEOUT = 3;
    /* 读超时时间，一般也就是接口调用超时时间 */
    private final static int DEFAULT_READ_TIMEOUT = 30;
    /* 服务所属模块的名称，即serviceId */
    private String serviceName;
    /* 远程api服务的调用接口地址 */
    private String url;

    private int connectTimeout = DEFAULT_CONNECT_TIMEOUT;
    private int readTimeout = DEFAULT_READ_TIMEOUT;

    public ServiceContext(String serviceName, String url) {
        this(serviceName, url, DEFAULT_CONNECT_TIMEOUT, DEFAULT_READ_TIMEOUT);
    }

    public ServiceContext(String serviceName, String url, int connectTimeout, int readTimeout) {

        this.serviceName = serviceName;
        this.url = url;
        this.connectTimeout = connectTimeout;
        this.readTimeout = readTimeout;
    }

    public String getServiceName() {
        return serviceName;
    }

    public String getUrl() {
        return url;
    }

    public int getConnectTimeout() {
        return connectTimeout;
    }

    public int getReadTimeout() {
        return readTimeout;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("serviceName", serviceName)
                .append("url", url)
                .append("connectTimeout", connectTimeout)
                .append("readTimeout", readTimeout)
                .toString();
    }
}
