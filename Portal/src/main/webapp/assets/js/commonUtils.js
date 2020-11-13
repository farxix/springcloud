// define(['jquery','toastr','bootstrap','bootstrap-table','bootstrap-table-zh','bootstrap-treeview','treegrid','bootstrap-editable','bootstrap-table-editable','bootstrap-select'],function($,toastr){
// define(['jquery','toastr','bootstrap-show-password','bootstrap-table','bootstrap-table-zh','bootstrap-treeview','treegrid','bootstrap-select'],function($, toastr){
define(['jquery','toastr','bootstrap-table','bootstrap-table-zh','bootstrap-treeview','treegrid','bootstrap-select'],function($, toastr){
    $.support.cors = true;
    /**
     *  获取当前登陆用户
     */
    function  getUser(){
        var  userId = $('body').attr('data-data');
        if(!userId){
            userId = $('body',parent.document).attr('data-data');
            if(!userId){
                $.ajax({
                    async: false,
                    type : "get",
                    url : '../page/getCurrUser.jsp',
                    datatype : 'text',
                    success : function(data) {
                        userId = data.replace(/\n/g,"");
                    }
                });
            }
        }
        // userId = "root";
        return userId;
    }


    /**
     *  参数加密
     */
    function encodParams(params){
        return encodeURIComponent(params);
    }
    /**
     *  解密返回结果
     */
    function decodeJSON(json){
        return decodeURIComponent(json)
    }
    /**
     * bootstrap Table
     * @param target    : 目标dom ID
     * @param options   : options
     * @returns {buildTable}
     */
    function createTable(id,cfg){
        var oTableInit = {};
        //初始化Table
        oTableInit.Init = function () {
            $table = $('#'+id).bootstrapTable('destroy').bootstrapTable({
                 data:cfg.data?cfg.data:[],
                 url: cfg.data?"":cfg.url,
                 method: 'post',
                 contentType:"application/json;charsets=utf-8",
                 dataField: cfg.dataField||'data',
                 dataField2: cfg.dataField2||null,
                 totalField: cfg.totalField||'totalCount',
                 detailView:cfg.detailView||false,
                 sidePagination: cfg.sidePagination||"server",

                // sortName : 'replyTime',
                // sortOrder : 'asc',
                // editable:cfg.editable||false,
                dataType:'json',
                classes: cfg.classes?cfg.classes:'table table-no-bordered table-striped',
                cache: false,               //是否使用缓存，默认为true
                striped: true,              //是否显示行间隔色
                pagination: cfg.pagination,   //是否显示分页
                pageSize: 15,               //每页的记录行数
                pageNumber: 1,              //初始化加载第一页，默认第一页
                pageList: [15,20,30,50,100],  //可供选择的每页的行数
                pageSizeEditable: true,
                search: false,               //是否显示表格搜索
                showRefresh: false,          //是否显示刷新按钮
                clickToSelect: cfg.clickToSelect||false,        //是否启用点击选中行
                toolbar: "#toolbar_screen", //工具按钮用哪个容器
                sidePagination: "server",   //分页方式：client客户端分页，server服务端分页
                showHeader: true, //是否显示列头
                showFooter: false, //是否显示列脚
                showPaginationSwitch: false,
                paginationLoop: false,
                paginationDetailHAlign: 'left',
                height:cfg.height?cfg.height:undefined,
                queryParams: oTableInit.queryParams,
                responseHandler: oTableInit.formResponseHandler,
                columns: cfg.columns,
                formatLoadingMessage: function(){
                    return "正在努力地加载数据中，请稍候……";
                },
                formatNoMatches: function () {
                    return '无符合条件的记录';
                },
                rowStyle: function (row, index) {
                    return {
                        css: {
                            'font-size':'12px',
                            'color': '#757575'
                        }
                    }
                },
                onExpandRow: function(index, row, $detail) {
                    oTableInit.InitSubTable(index, row, $detail);
                },

            });
        };
        //得到查询的参数
        oTableInit.queryParams = function (params) {
            var opt ;
            if(cfg.pagination){
                opt= {
                    "pageNum":parseInt(params.offset) / parseInt(params.limit) + 1,
                    "pageSize" : params.limit,
                    // sortOrder: params.order,//排序
                    // sortName:params.sort//排序字段

                };
            }
            var temp;
            if(typeof cfg.params == "function"){
                temp = $.extend(true,{},cfg.params() ,opt);
            }else{
                temp = $.extend(true,{},cfg.params ,opt);
            }

            var par = JSON.stringify(temp);
            return par;

        };
        //加载服务器数据之前的处理程序，可以用来格式化数据
        oTableInit.formResponseHandler = function(res){

            if(typeof cfg.callback == "function"){
                res =  cfg.callback(res);
            }
            if(typeof cfg.totalParams == "undefined"){
                return res;
            }
            if(!cfg.countApi){
                res = res.data;
                $('#'+id).bootstrapTable("load", res);

            }else{
                var coutParams = $.extend({},cfg.params,cfg.totalParams);
                var opt ={
                    url:cfg.countApi,
                    parameter:JSON.stringify(coutParams),
                    successCallback:function(msg){
                        res.total = parseInt(msg);
                        $('#'+id).bootstrapTable("load", res);
                    }
                };
                ajaxSubmit(opt);
            }

            return res;
        };
        //点击行展开
        oTableInit.InitSubTable = function(index, row, $detail){
            if(typeof(cfg.initSubTable)== 'function' ){
                cfg.initSubTable(index,row,$detail);
            }

        };
        return oTableInit;
    }


    /**
     * bootstrap-Tree-Table
     * @param target    : 目标dom ID
     * @param options   : options
     * @returns {buildTable}
     */
    function createTreeTable(id,cfg,res){

        var oTableInit = {};
        //初始化Table
        oTableInit.Init = function () {
            $table = $('#'+id).bootstrapTable('destroy').bootstrapTable(
                {
                    url: cfg.url,
                    method: cfg.method,
                    contentType:"application/json;charsets=utf-8",
                    dataField: "data",
                    idField: cfg.idField,
                    dataType:'json',
                    queryParams: oTableInit.queryParams,
                    columns: cfg.columns,
                    // bootstrap-table-treegrid.js 插件配置 -- start
                    //在哪一列展开树形
                    treeShowField: cfg.treeShowField,
                    //指定父id列
                    parentIdField: cfg.parentIdField,
                    onResetView: function(data) {
                        $('#'+id).treegrid({
                            initialState: 'collapsed',// 所有节点都折叠
                            treeColumn: 0,
                            url:cfg.url,
                            onChange: function() {
                                $('#'+id).bootstrapTable('resetWidth');
                            },
                        });

                         $('#'+id).treegrid('onSelectNode',function(viewOid){
                             var arr = $('#'+id).treegrid('getAllNodes');
                            for(var i= 0,len = arr.length; i < len; i++  ){
                                 var $item  = $(arr[i]);
                                 if($item.treegrid('getNodeId') == viewOid){
                                   var getDepth = $item.treegrid('getDepth');
                                   while (getDepth>0){
                                       if(parentNode($item)){
                                           parentNode($item).treegrid('expand');
                                       }
                                       getDepth --;
                                       $item = parentNode($item);
                                   }
                                    $(arr[i]).treegrid('expand');
                                }
                            }
                        })

                        function  parentNode($item){
                            if($item.treegrid('getParentNode')){
                                return $item.treegrid('getParentNode')
                            }
                        }

                        //只展开树形的第一级节点
                        //  $('#'+id).treegrid('getAllNodes').treegrid('expand');

                    },
                    onCheck:function(row){
                        var datas = $('#'+id).bootstrapTable('getData');
                        // 勾选子类
                        selectChilds(datas,row,"id","pid",true);

                        // 勾选父类
                        selectParentChecked(datas,row,"id","pid");

                        // 刷新数据
                        $('#'+id).bootstrapTable('load', datas);
                    },

                    onUncheck:function(row){
                        var datas = $('#'+id).bootstrapTable('getData');
                        selectChilds(datas,row,"id","pid",false);
                        $('#'+id).bootstrapTable('load', datas);
                    },
                    // bootstrap-table-treetreegrid.js 插件配置 -- end
                    formatLoadingMessage: function(){
                        return "正在努力地加载数据中，请稍候……";
                    },
                    formatNoMatches: function () {
                        return '无符合条件的记录';
                    },
                }
            );
        };

        //得到查询的参数
        oTableInit.queryParams = function (params) {
            var opt ;
            if(cfg.pagination){
                opt= {
                    "pageNum":parseInt(params.offset) / parseInt(params.limit) + 1,
                    "pageSize" : params.limit,
                    // sortOrder: params.order,//排序
                    // sortName:params.sort//排序字段

                };
            }
            var temp;
            if(typeof cfg.params == "function"){
                temp = $.extend(true,{},cfg.params() ,opt);
            }else{
                temp = $.extend(true,{},cfg.params ,opt);
            }

            var par = JSON.stringify(temp);
            return par;

        };


        //加载服务器数据之前的处理程序，可以用来格式化数据
        oTableInit.formResponseHandler = function(res){

            if(typeof cfg.callback == "function"){
                res =  cfg.callback(res);
            }
            if(typeof cfg.totalParams == "undefined"){
                return res;
            }
            if(!cfg.countApi){
                res = res.data;
                $('#'+id).bootstrapTable("load", res);

            }else{
                var coutParams = $.extend({},cfg.params,cfg.totalParams);
                var opt ={
                    url:cfg.countApi,
                    parameter:JSON.stringify(coutParams),
                    successCallback:function(msg){
                        res.total = parseInt(msg);
                        $('#'+id).bootstrapTable("load", res);
                    }
                };
                ajaxSubmit(opt);
            }

            return res;
        };

        return oTableInit;
    }

    /**
     * 选中父项时，同时选中子项
     * @param datas 所有的数据
     * @param row 当前数据
     * @param id id 字段名
     * @param pid 父id字段名
     */
    function selectChilds(datas,row,id,parentOid,checked) {
        for(var i in datas){
            if(datas[i][parentOid] == row[id]){
                datas[i].check=checked;
                selectChilds(datas,datas[i],id,parentOid,checked);
            }
        }
    }

    function selectParentChecked(datas,row,id,pid){
        for(var i in datas){
            if(datas[i][id] == row[pid]){
                datas[i].check=true;
                selectParentChecked(datas,datas[i],id,pid);
            }
        }
    }



    /**
     * Ajax
     * @param target    : 目标dom ID
     * @param options   : options
     * @returns {buildTable}
     */
    function ajaxSubmit(cfg){
        $.ajax({
            url:cfg.url,// 跳转到 action
            data:cfg.parameter,
            type:'post',
            cache:false,
            async:cfg.async==false?cfg.async:true,
            dataType:'json',
            //headers:{'Content-Type':'application/x-www-form-urlencoded'},
            beforeSend: function (XMLHttpRequest) {
                XMLHttpRequest.setRequestHeader("Content-Type", "application/json;charsets=utf-8");

            },
            success:function(msg) {
                // if(msg.status==0){
                    if(typeof cfg.successCallback == "function"){
                        cfg.successCallback(msg);
                    }
                // }else{
                //     if(typeof cfg.failCallback == "function"){
                //         cfg.failCallback(msg);
                //     }
                // }
            },
            error : function() {

            }
        });
    }

    // 用于代码配置的下拉框的实现
    function loadSelect(cfg){
        var defult ={
            url : "",
            parameter:null,
            successCallback:function(res){
                var obj = res.data;
                if (obj!=[]&&res.message=='success') {
                    var html = '';
                    html += '<option value="-1" >-1</option>';

                    for(var i = 0,len = obj.length;i<len;i++){
                        html += '<option value="' + obj[i].id + '" data-tokens="'+ obj[i].text+'">' + obj[i].text+ '</option>';
                    }

                    $('#'+cfg.id).html(html);
                    //必须加，刷新select
                    $('#'+cfg.id).selectpicker('refresh');
                }
                else{
                    var html=[];
                    $('#'+cfg.id).html(html);
                    //必须加，刷新select
                    $('#'+cfg.id).selectpicker('refresh');
                }
            }
        };

        var opt =$.extend({},defult,cfg);

        ajaxSubmit(opt);
    }
    // 用于工作组配置的下拉框的实现
    function loadSelect1(cfg){
        var defult ={
            url : "",
            parameter:null,
            successCallback:function(res){
                var obj = res.data;
                if (obj!=[]&&res.message=='success') {
                    var html = '';
                    for(var i = 0,len = obj.length;i<len;i++){
                        html += '<option value="' + obj[i].oid + '" data-tokens="'+ obj[i].name+'">' + obj[i].name+ '</option>';
                    }
                    /*onsole.log(html);*/
                    $('#'+cfg.id).html(html);
                    //必须加，刷新select
                    $('#'+cfg.id).selectpicker('refresh');
                }
                else{
                    var html=[];
                    $('#'+cfg.id).html(html);
                    //必须加，刷新select
                    $('#'+cfg.id).selectpicker('refresh');
                }
            }
        };

        var opt =$.extend({},defult,cfg);

        ajaxSubmit(opt);
    }
    // 用于流程的下拉框的实现
    function loadSelect2(cfg){
        var defult ={
            url : "",
            parameter:null,
            successCallback:function(res){
                var obj = res.data;
                if (obj!=[]&&res.message=='success') {
                    var html = '<option value=" ">请选择...</option>';
                    var id = null;
                    for(var i = 0,len = obj.length;i<len;i++){
                        html += '<option value="' + obj[i].id + '" data-tokens="'+ obj[i].name+'">' + obj[i].name+ '</option>';
                        if(obj[i].name== cfg.default){
                            id = obj[i].id;
                        }
                    }
                    /*onsole.log(html);*/
                    $('#'+cfg.id).html(html);
                    if(id)
                        $('#'+cfg.id).selectpicker('val',id);
                    //必须加，刷新select
                    $('#'+cfg.id).selectpicker('refresh');
                }
                else{
                    var html=[];
                    $('#'+cfg.id).html(html);
                    //必须加，刷新select
                    $('#'+cfg.id).selectpicker('refresh');
                }
            }
        };

        var opt =$.extend({},defult,cfg);

        ajaxSubmit(opt);
    }

    /**
     * 消息提示
     * @param
     * @param
     * @returns
     */
    function showtoast(shortCutFunction,msg,title){
        toastr.options = {
            closeButton: true,
            debug: false,
            extendedTimeOut: "1000",
            hideDuration: "1000",
            hideEasing: "linear",
            hideMethod: "fadeOut",
            onclick: null,
            positionClass: "toast-top-right",
            preventDuplicates: false,
            progressBar: true,
            showDuration: "400",
            showEasing: "swing",
            showMethod: "fadeIn",
            timeOut: "2000",
        };
        toastr[shortCutFunction](msg, title);
    }


    /**
     * load
     *
     */

    function loadSpiner(){
           // var html = '<div class="spiner-example">\n' +
           //     ' <div class="sk-spinner sk-spinner-fading-circle">\n' +
           //     ' <div class="sk-circle1 sk-circle"></div>\n' +
           //     ' <div class="sk-circle2 sk-circle"></div>\n' +
           //     ' <div class="sk-circle3 sk-circle"></div>\n' +
           //     ' <div class="sk-circle4 sk-circle"></div>\n' +
           //     ' <div class="sk-circle5 sk-circle"></div>\n' +
           //     '<div class="sk-circle6 sk-circle"></div>\n' +
           //     '<div class="sk-circle7 sk-circle"></div>\n' +
           //     '<div class="sk-circle8 sk-circle"></div>\n' +
           //     '<div class="sk-circle9 sk-circle"></div>\n' +
           //     '<div class="sk-circle10 sk-circle"></div>\n' +
           //     '<div class="sk-circle11 sk-circle"></div>\n' +
           //     ' <div class="sk-circle12 sk-circle"></div>\n' +
           //     '</div>\n' +
           //     '</div>';
           // $('body').append(html);

            var html= '<div class="loading yidongload"></div>';
            $('body').append(html);
    }


    function removeSpiner(){
        // $('.spiner-example').remove();
        $('.yidongload').remove();
    }


    return {
        createTable:createTable,
        ajaxSubmit:ajaxSubmit,
        createTreeTable:createTreeTable,
        loadSelect:loadSelect,
        loadSelect1:loadSelect1,
        loadSelect2:loadSelect2,
        showtoast:showtoast,
        loadSpiner:loadSpiner,
        removeSpiner:removeSpiner,
        getUser:getUser,
        encodParams:encodParams,
        decodeJSON:decodeJSON
    }

});

function padLeftZero(str) {
    return ('00' + str).substr(str.toString().length)
}

function formatDate(date, fmt) {
    fmt = fmt || 'yyyy-MM-dd';
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    var o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    };
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            var str = o[k] + '';
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
        }
    }
    return fmt;
}
