package com.web.security;

import com.web.service.UserService;
import org.apache.commons.lang.StringUtils;
import org.apache.shiro.authc.*;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ShiroSecurityRealm extends AuthorizingRealm {

    private static final Logger log = LoggerFactory.getLogger(ShiroSecurityRealm.class);


    @Autowired
    private UserService userService;

    /**
     * super()和this()类似,区别是，super()从子类中调用父类的构造方法，this()在同一类内调用其它方法。
     * super()和this()均需放在构造方法内第一行。
     */
    public ShiroSecurityRealm() {
        super();
        setName("ShiroSecurityRealm");
        // 根据不同环境进行密码加密
        setCredentialsMatcher(new PasswordMatcher());
    }

    /**
     * 登录
     * @param authenticationToken
     * @return
     * @throws AuthenticationException
     */
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken authenticationToken) throws AuthenticationException {
        UsernamePasswordToken token = (UsernamePasswordToken) authenticationToken;
        String currentLoginCode = token.getUsername();
        if (StringUtils.isBlank(currentLoginCode)) {
            throw new UnknownAccountException("登录名不能为空");
        }
        log.debug("current login user is: {}", currentLoginCode);
        User user = userService.getUser(currentLoginCode);
        System.out.println("user.getPassword()=============="+user.getPassword());
//        user.setCurrentUser(user);
//        Client tmpClient = new Client(user.getUserId(), user.getUserName(), IdGenerator.generate(), IdGenerator.generate());
//        SpringSecurityUtils.setCurrentClient(tmpClient);
        return new SimpleAuthenticationInfo(user.getUserId(),user.getPassword(), getName());
    }

    /**
     * 授权
     * @param principalCollection
     * @return
     */
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principalCollection) {
        return null;
    }
}
