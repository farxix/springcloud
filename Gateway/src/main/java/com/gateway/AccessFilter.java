package com.gateway;

import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.apache.commons.lang.StringUtils;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;


/** 服务过滤
 *
 * @component （把普通pojo实例化到spring容器中，相当于配置文件中的）
 * 泛指各种组件，就是说当我们的类不属于各种归类的时候（不属于@Controller、@Services等的时候），我们就可以使用@Component来标注这个类。
 * @Services 用于标注服务层，主要用来进行业务的逻辑处理
 */
@Component
public class AccessFilter extends ZuulFilter {
    private static Logger log = LoggerFactory.getLogger(AccessFilter.class);

    /**
     * filterType：返回一个字符串代表过滤器的类型，在zuul中定义了四种不同生命周期的过滤器类型，具体如下：
     * pre：路由之前
     * routing：路由之时
     * post： 路由之后
     * error：发送错误调用
     * @return
     */
    @Override
    public String filterType() {
        return "pre";
    }

    /**
     * filterOrder：过滤的顺序
     * @return
     */
    @Override
    public int filterOrder() {
        return 0;
    }

    /**
     * shouldFilter：这里可以写逻辑判断，是否要过滤，本文true,永远过滤。
     * @return
     */
    @Override
    public boolean shouldFilter() {
        return true;
    }

    /**
     * run：过滤器的具体逻辑。可用很复杂，包括查sql，nosql去判断该请求到底有没有权限访问。
     * @return
     */
    @Override
    public Object run() {
        RequestContext ctx = RequestContext.getCurrentContext();
        HttpServletRequest request = ctx.getRequest();
        log.debug("{} http request to {}",request.getMethod(),request.getRequestURL().toString());
        String accessToken = getTokenFromRequest(request);
        if (StringUtils.isBlank(accessToken)) {
            log.warn("access token is empty from ip:{}",request.getRemoteAddr());
            ctx.setSendZuulResponse(false);
            ctx.setResponseStatusCode(401);
            try {
                ctx.getResponse().getWriter().write("token is empty");
            } catch (IOException e) {
                e.printStackTrace();
            }
            return null;
        }
        log.info("ok");
        return null;
    }

    /**
     * 从请求中获取 accessToken
     * @param request
     * @return
     */
    private String getTokenFromRequest(HttpServletRequest request) {
        // 1.get from url
        String accessToken = request.getParameter("token");
        if (StringUtils.isNotBlank(accessToken)) {
            return accessToken;
        }

        // 2.get from http header
        accessToken = request.getHeader("token");
        if (StringUtils.isNotBlank(accessToken)) {
            return accessToken;
        }

        // 3.get from cookies
        Cookie[] cookies = request.getCookies();
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("token")) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
