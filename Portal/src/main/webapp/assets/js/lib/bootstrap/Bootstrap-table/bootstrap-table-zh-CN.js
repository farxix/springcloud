/**
 * Bootstrap Table Chinese translation
 * Author: zhangzx6@asiainfo.com
 */
(function ($) {
    'use strict';

    $.fn.bootstrapTable.locales['zh-CN'] = {
        total: 0,
        formatLoadingMessage: function () {
            //return '<div><div class="loading" style="width:60px;height: 60px;margin: auto"></div>正在努力地加载数据中，请稍候……</div>';
            // return '正在努力地加载数据中，请稍候……';
        },
        formatRecordsPerPage: function (pageNumber, pageFrom, pageTo, totalRows) {
            return pageNumber + '<span style="color: #666;font-size: 12px"> 条/每页  </span> ' +
                '<span style="margin-left: 10px;color: #666;font-size: 12px">共' + (this.total || 0) + '条</span>' +
                '<span style="margin: 0 10px;color: #666;font-size: 12px">跳至 ' +
                '<input class="jumpPage" min="1" type="number" step="1" style="width: 40px;border: 1px solid #C5CCD4;border-radius: 2px;height: 24px;font-size: 12px"' +
                'onkeyup="(this.v=function(){this.value=this.value.replace(/D|^0/g,\'\');}).call(this)" onblur="this.v();"' +
                'onafterpaste="(this.v=function(){this.value=this.value.replace(/D|^0/g,\'\');}).call(this)"' +
                '>页</span>';
        },
        formatShowingRows: function (pageFrom, pageTo, totalRows) {
            // return '共' + totalRows + '条';
            this.total = totalRows;
            return '';
        },
        formatterSimpleInfoPagination:function(pageSize,pageNumber, totalPages){
            return '<span style="color: #666;font-size: 12px">第'+ pageNumber+'页  '+ pageSize+ '条/每页  共' + totalPages + '页</span>';
        },
        formatSearch: function () {
            return '搜索';
        },
        formatNoMatches: function () {
            return '没有找到匹配的记录';
        },
        formatPaginationSwitch: function () {
            return '隐藏/显示分页';
        },
        formatRefresh: function () {
            return '刷新';
        },
        formatToggle: function () {
            return '切换';
        },
        formatColumns: function () {
            return '列';
        },
        formatExport: function () {
            return '导出数据';
        },
        formatClearFilters: function () {
            return '清空过滤';
        }
    };

    $.extend($.fn.bootstrapTable.defaults, $.fn.bootstrapTable.locales['zh-CN']);

})(jQuery);
