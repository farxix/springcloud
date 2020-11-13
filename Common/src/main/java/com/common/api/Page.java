package com.common.api;

import java.io.Serializable;
import java.util.LinkedHashMap;


public class Page implements Serializable {
    private static final long serialVersionUID = 4333019690903946141L;
    private final static int DEFAULT_PAGE_SIZE = 10;
    /**
     * 当前页。
     */
    private int pageNum = 1;

    /**
     * 每页显示记录数。
     */
    private int pageSize = DEFAULT_PAGE_SIZE;

    /**
     * 排序字段，key=columnId,value=DESC 或者ASC
     */
    private LinkedHashMap<String, String> order = new LinkedHashMap<>();

    public Page() {
        this.pageNum = 1;
        this.pageSize = DEFAULT_PAGE_SIZE;
    }

    public Page(int page, int pageSize) {
        this.pageNum = page;
        this.pageSize = pageSize;
    }

    @Override
    public String toString() {
        return "Page{" + "pageNum=" + pageNum + ", pageSize=" + pageSize + ", order='" + order + '\'' + '}';
    }

    public LinkedHashMap<String, String> getOrder() {
        return order;
    }

    public void addOrder(String columnName, String orderName) {
        order.put(columnName, orderName);
    }

    public int getPageNum() {
        return pageNum;
    }

    public void setPageNum(int pageNum) {
        this.pageNum = pageNum;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public int getOffset() {
        return (pageNum - 1) * pageSize;
    }
}
