//package com.web.service;
//
//import com.common.api.Page;
//import com.common.api.ServiceContext;
//import com.common.api.WebResult;
//import com.google.gson.Gson;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
///**
// * Created with IDEA.
// *
// * @author : yangzhenyu
// * @Description:
// * @Date : 2019/12/27 11:51
// */
//@Slf4j
//@Service
//public class ForwardService {
//    @Autowired
//    private ApiService invokeService;
//
//    public WebResult forward(String module, String url, Object data) {
//
//        WebResult webResult = invokeService.operate(new ServiceContext(module, url), data);
//        if (log.isDebugEnabled()) {
//            log.debug(new Gson().toJson(webResult));
//        }
//        return webResult;
//    }
//
//    public WebResult forward(String module, String url, Page page, Object data) {
//        WebResult webResult = invokeService.operate(new ServiceContext(module, url), page, data);
//        if (log.isDebugEnabled()) {
//            log.debug(new Gson().toJson(webResult));
//        }
//        return webResult;
//    }
//
//    public WebResult forwardWithResource(String module, String url, Object data, String fileField, MultipartFile file) {
//        return invokeService.postFile(new ServiceContext(module, url), data, fileField, file);
//    }
//}
