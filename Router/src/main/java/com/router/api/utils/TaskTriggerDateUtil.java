package com.router.api.utils;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

/**
 * @program OMPSpringBootCloudParent
 * @description:
 * @author: chencs
 * @create: 2020/08/28 09:47
 */


public class TaskTriggerDateUtil {

    public static final String DF_YYYY_MM_DD = "yyyy-MM-dd";
    public static final String DF_YYYY_MM_DD_1 = "yyyy/MM/dd";
    public static final String DF_YYYYMMDD = "yyyyMMdd";



    //任务触发周期：每天
    public static final String XXL_JOB_TRIGGER_PERIOD_DAY = "1";

    //任务触发周期：每周
    public static final String XXL_JOB_TRIGGER_PERIOD_WEEK = "2";

    //任务触发周期：每两周
    public static final String XXL_JOB_TRIGGER_PERIOD_2WEEK = "3";

    //任务触发周期：每月
    public static final String XXL_JOB_TRIGGER_PERIOD_MONTH = "4";

    //任务触发周期：每季
    public static final String XXL_JOB_TRIGGER_PERIOD_QUARTER = "5";

    //任务触发周期：每年
    public static final String XXL_JOB_TRIGGER_PERIOD_YEAR = "6";



    //最大计算多少年 计算2年内的好
    public static final int delayYear = 1;


    public static boolean isTriggerDay(String beginDate, String dateStyle, String trggerType) {
        List<String> triggerDayList = new ArrayList<>();
        Calendar maxCalendar = Calendar.getInstance();
        Calendar tmpCalendar = getBginCalendar(beginDate, dateStyle);
        //等于nULL 日期格式化失败
        if(tmpCalendar == null) {
            return false;
        }
        //当前时间加上3年， 以此类推
        maxCalendar.add(Calendar.YEAR, delayYear);
        while(tmpCalendar.compareTo(maxCalendar) <= 0) {
            triggerDayList.add(getDateStringByCalendar(tmpCalendar));
            if(trggerType.equals(XXL_JOB_TRIGGER_PERIOD_DAY)) {
                return Calendar.getInstance().after(tmpCalendar);
            }
            if(trggerType.equals(XXL_JOB_TRIGGER_PERIOD_WEEK)) {
                tmpCalendar.add(Calendar.DATE, 7);
            } else if(trggerType.equals(XXL_JOB_TRIGGER_PERIOD_2WEEK)) {
                tmpCalendar.add(Calendar.DATE, 14);
            } else if(trggerType.equals(XXL_JOB_TRIGGER_PERIOD_MONTH)) {
                tmpCalendar.add(Calendar.MONTH, 1);
            } else if(trggerType.equals(XXL_JOB_TRIGGER_PERIOD_QUARTER)) {
                tmpCalendar.add(Calendar.MONTH, 3);
            } else if(trggerType.equals(XXL_JOB_TRIGGER_PERIOD_YEAR)) {
                tmpCalendar.add(Calendar.YEAR, 1);
            } else {
                return false;
            }
        }
        return todayIsTriggerDay(triggerDayList);
    }


    private static Calendar getBginCalendar(String beginDate, String dateStyle) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat(dateStyle);
            Date date = sdf.parse(beginDate);
            Calendar calendar = Calendar.getInstance();
            calendar.setTime(date);
            return calendar;
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return null;
    }

    private static String getDateStringByCalendar(Calendar calendar) {
        Date date = calendar.getTime();
        SimpleDateFormat sdf = new SimpleDateFormat(DF_YYYY_MM_DD);
        return sdf.format(date);
    }

    private static boolean todayIsTriggerDay(List<String> triggerDayList) {
        for(String day : triggerDayList) {
            System.out.println(day);
        }
        Date todayDate = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat(DF_YYYY_MM_DD);
        String todayStr = sdf.format(todayDate);
        return triggerDayList.contains(todayStr);
    }

    public static void main(String[] args) {
        boolean isTriger = false;
        System.out.println("===========================每年触发========================");
        isTriger = isTriggerDay("2020-08-28", TaskTriggerDateUtil.DF_YYYY_MM_DD, TaskTriggerDateUtil.XXL_JOB_TRIGGER_PERIOD_YEAR);
        System.out.println("isTriger == " + isTriger);
        System.out.println("===========================每两周触发========================");
        isTriger = isTriggerDay("2020-08-28", TaskTriggerDateUtil.DF_YYYY_MM_DD, TaskTriggerDateUtil.XXL_JOB_TRIGGER_PERIOD_2WEEK);
        System.out.println("isTriger == " + isTriger);
        System.out.println("===========================每月触发========================");
        isTriger = isTriggerDay("2020-08-28", TaskTriggerDateUtil.DF_YYYY_MM_DD, TaskTriggerDateUtil.XXL_JOB_TRIGGER_PERIOD_MONTH);
        System.out.println("isTriger == " + isTriger);
    }

}
