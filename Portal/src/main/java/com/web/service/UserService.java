package com.web.service;

import com.common.api.ApiException;
import com.common.api.WebResult;
import com.common.api.utils.ModuleConstants;
import com.web.security.User;
import net.sf.json.JSONObject;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserService {

//    @Autowired
//    private ForwardService forwardService;

    public User getUser(String currentLoginCode){

        User user = new User("id","code","罗嘉俊","qwer1234");
        if (currentLoginCode.equals(user.getLoginCode())){
            return user;
        }

//        Map<String, Object> params = new HashMap<>();
//        params.put("userTel", userTel);
//        WebResult result = forwardService.forward(ModuleConstants.USER_MODULE.getName(),"/user/manager/getUser",params);
//
//        if (!result.isSuccess()) {
//            if (result.getStatus() == 1) {
//                result.setStatus(0);
//            } else if (result.getStatus() == 500) {
//                throw new ApiException("查询用户信息失败，后台系统异常！");
//            }
//            return null;
//        }
        return null;
    }


//    public WebResult accountLogin(String userTel,String userPwd){
//        Map<String, Object> param = new HashMap<>();
//        param.put("userTel", userTel);
//        param.put("userPwd", userPwd);
//        return forwardService.forward(ModuleConstants.USER_MODULE.getName(), "/user/manager/accountLogin", param);
//    }
}
