package com.web.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component
public class CurrentUserInterceptor extends HandlerInterceptorAdapter {
    private final static Logger logger = LoggerFactory.getLogger(CurrentUserInterceptor.class);

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        return super.preHandle(request, response, handler);
    }

    @Override
    public void postHandle(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Object o, ModelAndView modelAndView) {
        //User currentUser = SpringSecurityUtils.getCurrentUser();
        //if (currentUser != null) {
        //    httpServletRequest.setAttribute("currentUser", currentUser);
        //} else {
        //    logger.info("postHandle: current user is null.........");
        //}
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
//        String url = request.getServletPath();
//        String ip = HttpUtils.getIpAdrress(request);
//
//        //logger.debug("request user: url={}, ip={}, ctx={}", url, ip, HttpUtils.getContextPath(request));
//
//        super.afterCompletion(request, response, handler, ex);
    }


}
