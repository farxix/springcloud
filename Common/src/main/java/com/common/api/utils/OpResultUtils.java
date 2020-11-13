package com.common.api.utils;

import com.common.api.OperationResult;
import com.common.api.WebResult;
import com.github.pagehelper.PageInfo;

/**
 * $Id: OpResultUtils.java
 * <p>
 * Copyright(c) 1995-2017 by Asiainfo.com(China)
 * All rights reserved.
 *
 * @author Jacob Liu <Liuxy8@asiainfo.com>
 * 2018/1/15 20:07
 */
@SuppressWarnings("unchecked")
public class OpResultUtils {

    public static OperationResult fromPageInfo(PageInfo pageInfo) {
        OperationResult result = new OperationResult();
        result.setData(pageInfo.getList());
        result.setTotal(pageInfo.getTotal());

        result.setStatus(0);
        result.setMessage("OK");

        return result;
    }

    public static WebResult toWebResult(OperationResult result) {
        WebResult webResult = new WebResult();
        if (null != result) {
            webResult.setStatus(result.getStatus());
            webResult.setMessage(result.getMessage());
            webResult.setData(result.getData());
            webResult.setTotal(result.getTotal());
        }
        return webResult;
    }
}
