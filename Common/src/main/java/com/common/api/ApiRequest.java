package com.common.api;

import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

/**
 * $Id: ApiRequest.java
 * <p>
 * Copyright(c) 1995-2017 by Asiainfo.com(China)
 * All rights reserved.
 *
 * @author Jacob Liu <Liuxy8@asiainfo.com>
 * 2018/1/10 15:05
 */
public class ApiRequest implements Serializable {
    public String id;
    // 客户端公共参数
    public Client client;
    /* 可选的参数 */
    public Map<String, Object> option = new HashMap<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public Map<String, Object> getOption() {
        return option;
    }

    public void setOption(Map<String, Object> option) {
        this.option = option;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("id", id)
                .append("client", client)
                .append("option", option)
                .toString();
    }
}
