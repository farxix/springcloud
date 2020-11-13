package com.common.api;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.apache.commons.lang3.builder.ToStringBuilder;

/**
 * $Id: JsonRequest.java
 * <p>
 * Copyright(c) 1995-2017 by Asiainfo.com(China)
 * All rights reserved.
 *
 * @author Jacob Liu <Liuxy8@asiainfo.com>
 * 2018/1/10 15:10
 */
public class JsonRequest extends ApiRequest implements Cloneable {
    // 数据
    private Object data;

    private Page page;

    @JsonIgnore
    private ServiceContext serviceContext;

    private JsonRequest() {
    }

    private JsonRequest(String id, ServiceContext serviceContext, Client client) {
        this.id = id;
        this.serviceContext = serviceContext;
        this.client = client;
    }

    private JsonRequest(JsonRequest original) {
        this.id = original.id;
        this.data = original.data;
        this.serviceContext = original.serviceContext;
        this.client = original.client;
        this.page = original.getPage();
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }

    public ServiceContext getServiceContext() {
        return serviceContext;
    }

    public void setServiceContext(ServiceContext serviceContext) {
        this.serviceContext = serviceContext;
    }

    public Page getPage() {
        return page;
    }

    public void setPage(Page page) {
        this.page = page;
    }

    public static class Builder {
        private JsonRequest request;

        public Builder(String id, ServiceContext sc, Client client) {
            request = new JsonRequest(id, sc, client);
        }

        public Builder data(Object data) {
            request.setData(data);
            return this;
        }

        public Builder page(Page page) {
            request.setPage(page);
            return this;
        }

        public JsonRequest build() {
            return new JsonRequest(request);
        }
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("data", data)
                .append("page", page)
                .append("serviceContext", serviceContext)
                .append("id", id)
                .append("client", client)
                .append("option", option)
                .toString();
    }
}
