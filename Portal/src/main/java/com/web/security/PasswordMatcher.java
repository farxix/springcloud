package com.web.security;

import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.credential.SimpleCredentialsMatcher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PasswordMatcher extends SimpleCredentialsMatcher {
    private static final Logger log = LoggerFactory.getLogger(PasswordMatcher.class);

    @Override
    protected Object getCredentials(AuthenticationToken token) {
        Object credentials = token.getCredentials();
        String plainTextPassword = new String((byte[]) credentials);
        log.debug(">>>input plain_text: {}", plainTextPassword);
        return AESUtils.encryptWithAES(plainTextPassword);
    }

    @Override
    protected Object getCredentials(AuthenticationInfo info) {
        return super.getCredentials(info);
    }

    @Override
    protected boolean equals(Object tokenCredentials, Object accountCredentials) {
        return super.equals(tokenCredentials, accountCredentials);
    }

    @Override
    public boolean doCredentialsMatch(AuthenticationToken token, AuthenticationInfo info) {
        Object tokenCredentials = token.getCredentials();
        Object accountCredentials = info.getCredentials();
        log.info(">>>user_login_credentials={}, credentials_in_system={}", tokenCredentials, accountCredentials);
        return equals(tokenCredentials, accountCredentials);
    }
}
