package com.web.security;

import java.io.Serializable;

public class User  implements Serializable {
    private String userId;
    private String loginCode;
    private String displayName;
    private String password;
    private String tokenId;

    public User(String userId, String loginCode, String displayName, String password) {
        this.userId = userId;
        this.loginCode = loginCode;
        this.displayName = displayName;
        this.password = password;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getLoginCode() {
        return loginCode;
    }

    public void setLoginCode(String loginCode) {
        this.loginCode = loginCode;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getTokenId() {
        return tokenId;
    }

    public void setTokenId(String tokenId) {
        this.tokenId = tokenId;
    }
}
