package com.web.controller;

import com.common.api.JsonRequest;
import com.common.api.WebResult;
import com.common.api.utils.CommonUtils;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.ExpiredCredentialsException;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.subject.Subject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@Controller
public class LoginController {
    private static final Logger log = LoggerFactory.getLogger(LoginController.class);

    public static void main(String[] args) {
        Map<Integer,String> g = new HashMap<>();
        g.put(1,"a");
        g.put(2,"b");
        System.out.println(g.entrySet());
        for(Map.Entry entry : g.entrySet()){
            System.out.println(entry.getKey());
            System.out.println(entry.getValue());
        }
    }

    @RequestMapping(value = "/login", method = RequestMethod.GET)
    public String loginPage(HttpServletRequest request, Model model) {
        log.debug(">>>>>>>>>>>>>>>>>>>>>>>>getting login page........");
        Subject currentUser = SecurityUtils.getSubject();
        if (null != currentUser && currentUser.isAuthenticated()) {
            log.info("user has logined, current user={}", currentUser.getPrincipal());

            //Object current_user = currentUser.getSession().getAttribute("current_user");
            //model.addAttribute("currentUser", current_user);

            //return "main";
            currentUser.logout();
        }

        //进入登录页面的时候，将系统名称一并返回
//        model.addAttribute("sysWebName",portalService.getSysWebName());
        return "login";
    }
    
    // 登录
    @RequestMapping(value = "/login", method = RequestMethod.POST)
    @ResponseBody
    public WebResult login(@RequestBody JsonRequest request) {
//        String decodeRequest = AesUtil.deCode(request, encryptKey);
        log.info("用户登录请求decode：{}", request);
        Map user = CommonUtils.getData(request, Map.class);

        log.debug(">>>>>>>>>>>>>>>>>>>>>>>>posting login page........");
        WebResult webResult = new WebResult(0, "login OK");
        // 从当前线程获取主体信息，主体信息为空时，则创建新的主体信息。
        Subject currentUserSubject = SecurityUtils.getSubject();

        if (null == currentUserSubject) {
            webResult.setStatus(1);
            return webResult;
        }

//        String captchaCode = request.getParameter("verifyCode");
//        String verifyCode = getValidateCodeFromSession(request);
//
//        boolean isVerifyCodeWrong = StringUtils.isBlank(captchaCode)
//                || StringUtils.isBlank(verifyCode)
//                || !captchaCode.equalsIgnoreCase(verifyCode);
//
//        if (isProdMode && isVerifyCodeWrong) {
//            // 验证码不能为空或者不正确
//            webResult.setStatus(1);
//            webResult.setMessage("验证码不正确");
//            return webResult;
//        }

        UsernamePasswordToken token = null;
        try {
            token = new UsernamePasswordToken((String) user.get("loginCode"), (String) user.get("password"), false);
            currentUserSubject.login(token);
        } catch (IncorrectCredentialsException ice) {
            log.error("login failed, err: {}", ice.getMessage(), ice);

            webResult.setStatus(1);
            webResult.setMessage("用户名或密码不正确");
            return webResult;
        } catch (ExpiredCredentialsException ece) {
            log.error("login failed, err: {}", ece.getMessage(), ece);

            webResult.setStatus(1);
            webResult.setMessage("用户的密码已过期");
            return webResult;
        } catch (AuthenticationException e) {
            log.error("login failed, err: {}", e.getMessage(), e);

            webResult.setStatus(1);
            webResult.setMessage(e.getMessage());
            return webResult;
        }

        if (currentUserSubject.isAuthenticated()) {
            log.info("登录成功！");
//            userLoginService.afterLogin(username);
        } else {
            token.clear();
            currentUserSubject.getSession().stop();
        }

        return webResult;
    }
}
