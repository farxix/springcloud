/**
 *
 */
package com.common.api;

import java.io.Serializable;
import java.util.LinkedHashMap;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;


/**
 * 页面查询参数类
 *
 * @version 2016年6月21日
 */
public class PageQuery implements Serializable {

    public static final String ORDER_DESC = "desc";//倒序
    public static final String ORDER_ASC = "asc";//正序

    /**
     * 当前页码,从1开始
     */
    private int pageNum;

    /**
     * 页面大小
     */
    private int pageSize;

    /**
     * 查询参数，key=columnId,value=匹配的值
     */
    private LinkedHashMap<String, String> queryParams = null;

    /**
     * 排序字段，key=columnId,value=PageQuery.ORDER_*
     */
    private LinkedHashMap<String, String> sortParams = null;


    /**
     * @return the pageNum
     */
    public int getPageNum() {
        return pageNum;
    }

    /**
     * @param pageNum the pageNum to set
     */
    public void setPageNum(int pageNum) {
        this.pageNum = pageNum;
    }

    /**
     * @return the pageSize
     */
    public int getPageSize() {
        return pageSize;
    }

    /**
     * @param pageSize the pageSize to set
     */
    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }


    /**
     * @return the queryParams
     */
    public LinkedHashMap<String, String> getQueryParams() {
        if (queryParams == null)
            return null;

        Set<String> keys = queryParams.keySet();
        for (String key : keys) {
            if (StringUtils.isNotBlank(key)) {
                queryParams.remove(key);
            }
        }
        return queryParams;
    }

    /**
     * @param queryParams the queryParams to set
     */
    public void setQueryParams(LinkedHashMap<String, String> queryParams) {
        this.queryParams = queryParams;
    }

    /**
     * 添加查询参数
     *
     * @param columnId   字段标识
     * @param matchValue 匹配的值
     */
    public void addQueryParam(String columnId, String matchValue) {
        if (StringUtils.isNotBlank(columnId))
            return;

        if (this.queryParams == null)
            this.queryParams = new LinkedHashMap<String, String>();

        this.queryParams.put(columnId, matchValue);
    }

    /**
     * @return the sortParams
     */
    public LinkedHashMap<String, String> getSortParams() {
        if (sortParams == null)
            return null;

        Set<String> keys = sortParams.keySet();
        for (String key : keys) {
            if (StringUtils.isBlank(key)) {
                sortParams.remove(key);
                continue;
            }

            String sortType = sortParams.get(key);
            if (!PageQuery.ORDER_DESC.equals(sortType) && !PageQuery.ORDER_ASC.equals(sortType)) {
                sortParams.remove(key);
            }
        }

        return sortParams;
    }

    /**
     * @param sortParams the sortParams to set
     */
    public void setSortParams(LinkedHashMap<String, String> sortParams) {
        this.sortParams = sortParams;

    }

    /**
     * 添加排序字段
     *
     * @param columnId  字段标识
     * @param orderType 排序类型，只能为ORDER_DESC或者ORDER_ASC
     */
    public void addSortParam(String columnId, String orderType) {
        if (StringUtils.isBlank(columnId))
            return;

        if (!ORDER_DESC.equals(orderType) && !ORDER_ASC.equals(orderType))
            return;

        if (this.sortParams == null)
            this.sortParams = new LinkedHashMap<String, String>();

        this.sortParams.put(columnId, orderType);
    }


}
