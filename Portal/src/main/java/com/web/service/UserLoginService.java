//package com.web.service;
//
//import com.asiainfo.omp.common.api.Client;
//import com.asiainfo.omp.portal.security.AESUtils;
//import com.asiainfo.omp.portal.security.SpringSecurityUtils;
//import com.asiainfo.omp.portal.security.User;
//import org.apache.commons.collections4.CollectionUtils;
//import org.apache.shiro.authc.AuthenticationException;
//import org.apache.shiro.authz.AuthorizationInfo;
//import org.apache.shiro.authz.SimpleAuthorizationInfo;
//import org.dom4j.Document;
//import org.dom4j.Element;
//import org.dom4j.io.SAXReader;
//import org.joda.time.DateTime;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.io.ByteArrayInputStream;
//import java.text.SimpleDateFormat;
//import java.util.*;
//
///**
// * $Id: UserLoginService.java
// * <p>
// * Copyright(c) 1995-2017 by Asiainfo.com(China)
// * All rights reserved.
// *
// * @author Jacob Liu <Liuxy8@asiainfo.com>
// * 2018/3/14 15:25
// */
//@Service
//public class UserLoginService {
//    private final static Logger LOGGER = LoggerFactory.getLogger(UserLoginService.class);
//    private final static String DEFAULT_PASSWORD_SALT = "";
//    private final static String VERIFY_4A_ACCOUNT_URL = "";
//
//    private String passwordSalt = DEFAULT_PASSWORD_SALT;
//
//    @Autowired
//    private UserService userService;
//
//    public String getPasswordSalt() {
//        return passwordSalt;
//    }
//
//    public void setPasswordSalt(String passwordSalt) {
//        this.passwordSalt = passwordSalt;
//    }
//
//    public String getEncryptedPassword(String password, String salt) {
//        /* 使用hash方式的密码加密 */
//        // return new Sha256Hash(password, salt).toHex();
//
//        /* 使用自定义的AES方式加密密码 */
//        return AESUtils.encryptWithAES(password);
//    }
//
//    public String getEncryptedPassword(String password) {
//        return getEncryptedPassword(password, getPasswordSalt());
//    }
//
//    public User getUser(String loginId) {
////        Map<String, Object> userInfo = userApiService.getUserInfo(loginId);
////        if (MapUtils.isEmpty(userInfo)) {
////            return null;
////        }
////
////        return userApiService.userInfo2user(userInfo);
//        return new User();
//    }
//
//    public LinkedHashMap afterLogin(String userTel,String tokenId) {
//        LinkedHashMap user = userService.getUser(userTel);
//        if (null == user) {
//            LOGGER.error("user [{}] not_exists ", userTel);
//            throw new AuthenticationException("user loginid=[" + userTel + "] not exists ");
//        }
//
//        //set user
//        User u = new User();
//        u.setCurrentUser(user);
//        u.setTokenId(tokenId);
//        SpringSecurityUtils.setCurrentUser(u);
//        LOGGER.info(">>>springsecurityutils_setcurrentuser_for userTel={}, userId={}", userTel, u.getUserId());
//
//        //update client
//        Client client = SpringSecurityUtils.getCurrentClient();
//        if (null != client) {
//            client.setUserName(u.getUserName());
//        }
//
//        LOGGER.info("用户[{}]登录认证通过成功！，登录时间：{}", u.getUserTel(), new DateTime().toString("yyyy-MM-dd HH:mm:ss"));
//        return user;
//    }
//
//    public AuthorizationInfo doGetAuthorizationInfo(String loginid) {
//        User user = getUser(loginid);
//        String userResId = user.getUserId();
//
////        List<String> userRoles = userApiService.getRoleList(userResId);
////        if (CollectionUtils.isEmpty(userRoles)) {
////            LOGGER.error("\n\nuser [{}] has no roles!!!", loginid);
////            return null;
////        }
//
//        SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
////        for (String roleId : userRoles) {
////            info.addRole(roleId);
////
////            List<SysMenuTree> roleMenuList = roleApiService.getRoleMenuList(roleId);
////
////            Set<String> menuCodeSet = getMenuCodeSet(roleMenuList);
////            info.addStringPermissions(menuCodeSet);
////        }
//
//        LOGGER.info("\n\nuser [{}] has role: {}, permissions.size: {}\n\n", loginid, info.getRoles(), CollectionUtils.size(info.getStringPermissions()));
//        return info;
//    }
//
////    public boolean call(String username, String encryptPwd) {
////        String RequestInfo = invoke4AService(username, encryptPwd);
////        Object[] objects = new Object[]{RequestInfo};
////        String ResponseInfo = WebServiceClient.callService(VERIFY_4A_ACCOUNT_URL, "MainAcctAuthenHQService", objects);
////
////        LOGGER.debug("ResponseInfo: {}", ResponseInfo);
////
////        return true;
////    }
//
//    public static void parse(String response) throws Exception {
//        SAXReader sReader = new SAXReader();
//        Document document = sReader.read(new ByteArrayInputStream(response.getBytes("UTF-8")));
//        Element root = document.getRootElement();
//
//        Element errElement = root.element("BODY").element("ERRDESC");
//        if (null != errElement) {
//            LOGGER.error("login failed use 4a account, err: {}", errElement.getText());
//        }
//
//        Element appAcctid = root.element("BODY").element("MAINACCT");
//        Element mainAcctid = root.element("BODY").element("MAINACCTID");
//        Element mobile = root.element("BODY").element("MOBILE");
//
//        Element element = root.element("BODY").element("SUBACCTS");
//        Iterator subacct = element.elementIterator("SUBACCT");
//
//        List<String> subAccouts = new ArrayList<>();
//        while (subacct.hasNext()) {
//            Element next = (Element) subacct.next();
//            subAccouts.add(next.getText());
//        }
//
//        System.out.println(subAccouts);
//    }
//
//    public static void main(String[] args) throws Exception {
//        UserLoginService userLoginService = new UserLoginService();
//
//        String encryptedPassword = userLoginService.getEncryptedPassword("123456", "0");
//        String encryptedPassword2 = userLoginService.getEncryptedPassword("123456", "156");
//        String encryptedPassword3 = userLoginService.getEncryptedPassword("123456", "");
//        System.out.println(encryptedPassword);
//        System.out.println(encryptedPassword2);
//        System.out.println(encryptedPassword3);
//    }
//
//    /**
//     * 发送给4A的请求报文
//     */
//    public String invoke4AService(String subacct, String loginpwd) {
//        StringBuilder xml = new StringBuilder();
//        xml.append("<?xml version='1.0' encoding= 'UTF-8'?>");
//        xml.append("<REQUEST>");
//        xml.append("<HEAD>");
//        xml.append("<CODE></CODE>");// 消息标志,暂不填，预留
//        xml.append("<SID></SID>");// 消息序列号,暂不填，预留
//        xml.append("<TIMESTAMP>" + new SimpleDateFormat("yyyyMMDDHHmmss").format(new Date()) + "</TIMESTAMP>");
//        xml.append("<SERVICEID>NGBOMC</SERVICEID>");
//        xml.append("</HEAD>");
//        xml.append("<BODY>");
//        xml.append("<MAINACCT>" + subacct + "</MAINACCT>");
//        xml.append("<LOGINPWD>" + loginpwd + "</LOGINPWD>");
//        xml.append("</BODY>");
//        xml.append("</REQUEST>");
//        LOGGER.debug("BOMC请求的XML：" + xml);
//        return xml.toString();
//    }
//}
