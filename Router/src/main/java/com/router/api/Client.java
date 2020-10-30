package com.router.api;

import org.apache.commons.lang3.builder.ToStringBuilder;

import java.io.Serializable;

/**
 * $Id: Client.java
 * <p>
 * Copyright(c) 1995-2017 by Asiainfo.com(China)
 * All rights reserved.
 *
 * @author Jacob Liu <Liuxy8@asiainfo.com>
 * 2018/1/10 15:06
 */
public class Client implements Serializable, Cloneable {
    private static final long serialVersionUID = -1501757826607201368L;
    private String userId;
    private String userName;

    private String token;

    private String ticket;

    public Client() {
    }

    public Client(String userId, String userName) {
        this.userId = userId;
        this.userName = userName;
    }

    public Client(String userId, String userName, String token, String ticket) {
        this.userId = userId;
        this.userName = userName;
        this.token = token;
        this.ticket = ticket;
    }

    @Override
    protected Object clone() throws CloneNotSupportedException {
        return super.clone();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTicket() {
        return ticket;
    }

    public void setTicket(String ticket) {
        this.ticket = ticket;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this)
                .append("userId", userId)
                .append("userName", userName)
                .append("token", token)
                .append("ticket", ticket)
                .toString();
    }
}
