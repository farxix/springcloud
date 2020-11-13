package com.common.api;

import org.apache.commons.lang3.builder.ToStringBuilder;

/**
 * $Id: StatusCodeConstants.java
 * <p>
 * Copyright(c) 1995-2017 by Asiainfo.com(China)
 * All rights reserved.
 *
 * @author Jacob Liu <Liuxy8@asiainfo.com>
 * 2018/1/11 20:13
 */
public interface StatusCodeConstants {
    ErrorCodeDefine SYSTEM_ERROR_CODE_DEFINE = new ErrorCodeDefine(0, 100);
    ErrorCodeDefine RESOURCE_ERROR_CODE_DEFINE = new ErrorCodeDefine(101, 200);
    ErrorCodeDefine MONITOR_ERROR_CODE_DEFINE = new ErrorCodeDefine(201, 300);
    ErrorCodeDefine COLLECTOR_ERROR_CODE_DEFINE = new ErrorCodeDefine(301, 400);

    int SUCCESS = 0;
    int PARAM_INVALID = 1;
    int PARAM_MISSING = 2;
    int AUTHENTICATION_FAILED = 5;
    int CLIENT_NOT_FOUND = 3;
    int SYSTEM_ERROR = 10;
    int INVOKE_ERROR = 11;
    int INVALID_RESPONSE = 97;
    int BAD_REQUEST = 98;
    int OTHER_ERROR = 99;


    class ErrorCodeDefine {
        private int start;
        private int end;

        public ErrorCodeDefine(int start, int end) {
            this.start = start;
            this.end = end;
        }

        public int getStart() {
            return start;
        }

        public int getEnd() {
            return end;
        }

        public boolean isInRange(int errorCode) {
            return errorCode >= start && errorCode <= end;
        }

        @Override
        public String toString() {
            return new ToStringBuilder(this)
                    .append("start", start)
                    .append("end", end)
                    .toString();
        }
    }
}
