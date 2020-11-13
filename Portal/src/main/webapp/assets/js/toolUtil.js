(function (root, factory) {
    "use strict";
    // AMD module is defined
    if (typeof define === "function" && define.amd) {
        define(['jquery'],function ($) {
            return {
                toolUtil: factory(root.jQuery)
            }
        });
    }else{
        root.toolUtil = new factory(root.jQuery);
    }
}(this, function ($) {
    $.support.cors = true;
    function Common() {
    }
    Common.prototype = {
        /**
         *  获取当前登陆用户
         */
        getUser:function(){
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
        },
        /**
         * loading样式
         */
        loading: function () {
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
        },
        unloading: function () {
            // $('.spiner-example').remove();
            $('.yidongload').remove();
        },
        /**
         * 表单验证常用方法
         */
        isNumber: function (val) {
            var reg = /^[\d|\.|,]+$/;
            return reg.test(val);
        },
        isInt: function (val) {
            if (val === "") {
                return false;
            }
            var reg = /\D+/;
            return !reg.test(val);
        },
        isEmail: function (email) {
            var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return reg.test(email);
        },
        isMobile: function (mobile) {
            var reg = /1[34578]{1}\d{9}$/;
            return reg.test(mobile);
        },
        isTel: function (tel) {
            var reg = /^\d{3}-\d{8}|\d{4}-\d{7}$/; //只允许使用数字-空格等
            return reg.test(tel);
        },
        isJson: function (obj) { //是否是json
            var isjson = obj && typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]";
            return isjson;
        },
        /**
         * 数组判断
         * @param data
         * @returns {boolean}
         */
        isArray: function (data) {
            return (data && Array.isArray(data) && data.length && JSON.stringify(data) != '[]');
        },
        /* 数组最大值*/
        arrMax: function (array) {
            return Math.max.apply(Math, array);
        },
        /* 数组最小值 */
        arrMin: function (array) {
            return Math.min.apply(Math, array);
        },
        /* 数组求和 */
        arrSum: function (array) {
            var sum = 0,
                num;
            for (var i = 0; i < array.length; i++) {
                num = parseInt(array[i]) || 0;
                sum += num;
            }
            return sum;
        },
        isIP: function (ip) {
            var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
            return reg.test(ip);
        },
        /**
         * title: 对javascript、html标签实体转义
         * data:数据源字符串
         **/
        xss: function (data) { //防止<script  type="text/javascript">与html标签执行
            if (this.isEmpty(data) || typeof (data) != "string") {
                return data;
            }
            var reg = /<[A-Za-z]+>/g,
                str = data.toLowerCase().replace(/\s+|\//g, '');
            if (str.indexOf('<#if') != -1 || str.indexOf('<graph') != -1) { //sql代码、拓扑图
                data = data.replace(/<script/ig, '&lt;script');
                return data;
            }
            if (str.indexOf('<script') != -1 || reg.test(str) || str.indexOf('onload') != -1 || str.indexOf('src=') != -1) {
                data = data.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }
            return data;
        },

        /*数据是否为空*/
        isEmpty: function (data) {
            if ($) {
                var data2 = $.trim(data);
            }
            if (this.isArray(data) && data.length == 0) {
                return true;
            } else if (this.isJson(data) && isEmptyObject(data)) {
                return true;
            } else if (!data2 && data2 !== 0) {
                return true;
            } else {
                return false;
            }

            //json是否空对象
            function isEmptyObject(obj) {
                for (var n in obj) {
                    return false;
                }
                return true;
            }
        },
        isBlank: function (obj) {
            return !isNotBlank(obj);
        },
        isNotBlank: function (obj) {
            return (obj && obj.toString().trim().length > 0);
        },
        /* 从url获取参数**/
        getQueryString: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var reg_rewrite = new RegExp("(^|/)" + name + "/([^/]*)(/|$)", "i");
            var r = window.location.search.substr(1).match(reg);
            var q = window.location.pathname.substr(1).match(reg_rewrite);
            if (r != null) {
                return unescape(r[2]);
            } else if (q != null) {
                return unescape(q[2]);
            } else {
                return null;
            }
        },
        ajaxSubmit: function (cfg) {
            var login = {userTel:localStorage.getItem("userTel"),tokenId:localStorage.getItem("tokenId")};
            var that = this;
            $.ajax({
                url: cfg.url,// 跳转到 action
                data: cfg.parameter,
                type: 'post',
                cache: false,
                async: cfg.async == false ? cfg.async : true,
                dataType: 'html',
                //headers:{'Content-Type':'application/x-www-form-urlencoded'},
                beforeSend: function (XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("Authorization", login.tokenId);
                    XMLHttpRequest.setRequestHeader("userTel", login.userTel);
                    XMLHttpRequest.setRequestHeader("Content-Type", "application/json;charsets=utf-8");
                    if(!cfg.unloading){
                        that.loading();
                    }

                },
                success: function (msg) {
                    msg= JSON.parse(decrypt(msg,getPass()));
                    // if (msg.status == 0) {
                        if (typeof cfg.successCallback == "function") {
                            cfg.successCallback(msg);
                        }
                    // }
                    // else{
                    //     if(typeof cfg.failCallback == "function"){
                    //         cfg.failCallback(msg);
                    //     }
                    // }
                },
                error: function () {

                },
                complete: function(){
                    that.unloading();
                }
            });
        },
        loadSelect: function (cfg) {
            var defult = {
                url: "",
                parameter: null,
                successCallback: function (res) {
                    var obj = res.data;
                    if (null != res) {
                        if(cfg.dataField){
                            obj = obj[cfg.dataField];
                        }
                        if(null != obj){
                            var html = '';
                            if(cfg.isNull){//存在显示请选择
                                html="<option>请选择...</option>";
                            }
                            for (var i = 0, len = obj.length; i < len; i++) {
                                html += '<option value="' + obj[i][cfg.value] + '" data-tokens="' + obj[i][cfg.text] + '">' + obj[i][cfg.text] + '</option>';
                            }
                            $('#' + cfg.id).empty().html(html);
                            //必须加，刷新select
                            $('#' + cfg.id).selectpicker('refresh');
                        }

                    }
                }
            };
            var opt = $.extend({}, defult, cfg);
            this.ajaxSubmit(opt);
        },
        createTable:function(id,cfg){
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
                                'color': '#757575',
                                'font-size':'12px'
                            }
                        }
                    },
                    onExpandRow: function(index, row, $detail) {
                        oTableInit.InitSubTable(index, row, $detail);
                    },
                    onCheck:function(row){
                        oTableInit.checkRowTable(row);
                    },

                });
            };
            //得到查询的参数
            oTableInit.queryParams = function (params) {
                var opt ;
                if(cfg.pagination){
                    opt= {
                        // "pageNum":parseInt(params.offset) / parseInt(params.limit) + 1,
                        // "pageSize" : params.limit,
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
                    res = res.data.data;
                    $('#'+id).bootstrapTable("load", res);

                }else{
                    var coutParams = $.extend({},cfg.params,cfg.totalParams);
                    // console.log(coutParams);
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
            //点击勾选框时绑定事件
            oTableInit.checkRowTable = function(row){
                if(typeof(cfg.checkRowTable)== 'function'){
                    cfg.checkRowTable(row);
                }
            }
            return oTableInit;
        },
        renderSelect:function(data,cfg){
            if(null != data){
                var html = '';
                if(cfg.isNull){//存在显示请选择
                    if(cfg.defultText){
                        html="<option value=''>"+cfg.defultText+"</option>";
                    }else{
                       html="<option  value=''>请选择...</option>";
                    }

                }
                if(cfg.value){
                  for (var i = 0, len = data.length; i < len; i++) {
                      html += '<option value="' + data[i][cfg.value] + '" data-tokens="' + data[i][cfg.text] + '">' + data[i][cfg.text] + '</option>';
                  }
                }else{
                  for (var i = 0, len = data.length; i < len; i++) {
                      html += '<option value="' + data[i] + '" data-tokens="' + data[i] + '">' + data[i] + '</option>';
                  }
                }
              

                $('#' + cfg.id).empty().html(html);
                //必须加，刷新select
                $('#' + cfg.id).selectpicker('refresh');
                if(typeof cfg.callback == "function"){
                    cfg.callback();
                }
            }
        },
        // 用于代码配置的下拉框的实现
        loadSelect:function(cfg){
        var defult ={
            url : "",
            parameter:null,
            successCallback:function(res){
                var obj = res.data.data;
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

        this.ajaxSubmit(opt);
    },
        // 用于工作组配置的下拉框的实现
        loadSelect1:function(cfg){
        var defult ={
            url : "",
            parameter:null,
            successCallback:function(res){
                var obj = res.data.data;
                if (obj!=[]&&res.status==0) {
                    var html = '';
                    for(var i = 0,len = obj.length;i<len;i++){
                        // html += '<option value="' + obj[i].oid + '" data-tokens="'+ obj[i].name+'">' + obj[i].name+ '</option>';
                        html += '<option>' + obj[i]+ '</option>';
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

        this.ajaxSubmit(opt);
    },
        // 用于流程的下拉框的实现
        loadSelect2:function(cfg){
            var defult ={
                url : "",
                parameter:null,
                successCallback:function(res){
                    var obj = res.data.data;
                    if (obj!=[]&&res.status==0) {
                        var html = '<option value=" ">请选择...</option>';
                        var id = null;
                        for(var i = 0,len = obj.length;i<len;i++){
                            // html += '<option value="' + obj[i].id + '" data-tokens="'+ obj[i].name+'">' + obj[i].name+ '</option>';
                            html += '<option value="'+obj[i]+'">' + obj[i]+ '</option>';
                            if(obj[i]== cfg.default){
                                id = obj[i];
                            }
                        }
                        /*onsole.log(html);*/
                        $('#'+cfg.id).html(html);
                        if(id)
                            $('#'+cfg.id).selectpicker('val',id);
                        //必须加，刷新select
                        // $('#'+cfg.id).selectpicker('refresh');
                        // $('#'+cfg.id).selectpicker('render');
                    }
                    else{
                        var html=[];
                        $('#'+cfg.id).html(html);
                        //必须加，刷新select
                        // $('#'+cfg.id).selectpicker('refresh');
                        // $('#'+cfg.id).selectpicker('render');
                    }
                    $('#'+cfg.id).selectpicker("destroy");
                    $('#'+cfg.id).selectpicker('refresh');
                    $('#'+cfg.id).selectpicker('render');
                }
            };

            var opt =$.extend({},defult,cfg);

            this.ajaxSubmit(opt);
    },
        // 用于流程的下拉框的实现---考情管理下拉框
        loadSelect2_:function(cfg){
            var defult ={
                url : "",
                parameter:null,
                successCallback:function(res){
                    var obj = res.data.data;
                    if (obj!=[]&&res.status==0) {
                        var html = '<option value=" ">请选择...</option>';
                        var id = null;
                        for(var i = 0,len = obj.length;i<len;i++){
                            // html += '<option value="' + obj[i].id + '" data-tokens="'+ obj[i].name+'">' + obj[i].name+ '</option>';
                            html += '<option value="'+obj[i].wtId+'">' + obj[i].wtName+ '</option>';
                            if(obj[i].wtId== cfg.default){
                                id = obj[i].wtId;
                            }
                        }

                        /*onsole.log(html);*/
                        $('#'+cfg.id).html(html);
                        if(id)
                            $('#'+cfg.id).selectpicker('val',id);
                        //必须加，刷新select
                        // $('#'+cfg.id).selectpicker('refresh');
                        // $('#'+cfg.id).selectpicker('render');
                    }
                    else{
                        var html=[];
                        $('#'+cfg.id).html(html);
                        //必须加，刷新select
                        // $('#'+cfg.id).selectpicker('refresh');
                        // $('#'+cfg.id).selectpicker('render');
                    }
                    $('#'+cfg.id).selectpicker("destroy");
                    $('#'+cfg.id).selectpicker('refresh');
                    $('#'+cfg.id).selectpicker('render');
                }
            };

            var opt =$.extend({},defult,cfg);

            this.ajaxSubmit(opt);
        },
        //用于固定枚举值下拉框
        loadSelect3:function(cfg){
            var obj = cfg.data;
            if (obj!=[]) {
                var html = '<option value=" ">请选择...</option>';
                var id = null;
                for(var i = 0,len = obj.length;i<len;i++){
                    // html += '<option value="' + obj[i].id + '" data-tokens="'+ obj[i].name+'">' + obj[i].name+ '</option>';
                    html += '<option value="'+obj[i]+'">' + obj[i]+ '</option>';
                    if(obj[i]== cfg.default){
                        id = obj[i];
                    }
                }
                /*onsole.log(html);*/
                $('#'+cfg.id).html(html);
                if(id)
                    $('#'+cfg.id).selectpicker('val',id);
                //必须加，刷新select
                // $('#'+cfg.id).selectpicker('refresh');
                // $('#'+cfg.id).selectpicker('render');
            }
            else{
                var html=[];
                $('#'+cfg.id).html(html);
                //必须加，刷新select
                // $('#'+cfg.id).selectpicker('refresh');
                // $('#'+cfg.id).selectpicker('render');
            }
            $('#'+cfg.id).selectpicker("destroy");
            $('#'+cfg.id).selectpicker('refresh');
            $('#'+cfg.id).selectpicker('render');

        },
        /**
         * 产生长度为len的随机不重复字符串
         * @param len
         * @returns {string}
         */
       randomChar : function (len) {
            len = len || 36;
            var x = "qwertyuioplkjhgfdsazxcvbnm0123456789";
            var tmp = "";
            var timestamp = new Date().getTime();
            for (var i = 0; i < len; i++) {
                tmp += x.charAt((Math.ceil(Math.random() * 100000000) + timestamp) % x.length);
            }
            return tmp;
        },
        /**
         * 资源树
         * @returns {resoTree}
         */
        ResoTree:function () {
            var that = this;
            var treeObj = null;
            var options = null;
            var DEFAULT = {
                activeIndex: '-1',         //默认展开位置
                loadType: 'local|server',  //加载菜单时的方法，‘local’本地，‘server’远程,'local|server'先加载本地，后加载远程
                contentType: 'application/x-www-form-urlencoded',
                url: '#',                  //菜单数据加载地址，loadType 为‘server’时必填
                ajaxType: 'GET',           //请求方式
                onChange: null,            //树选择事件
                onAddNew: null,
                onEdit: null,
                onRemove: null,
                onRemoveAllSon: null,
                queryParams: function (params) {      //在这里修改查询参数或追加参数,记得return
                    return params;
                },
                responseHandler: function (data) {     // 修改响应
                    return data;
                },
                simpleDataType: false,
                initTreeWithPath: {
                    enable: false,
                    pathField: 'path',
                    split: '/'
                },
                items: [],
                showRightMenuOnLeftClick: false,
                rightClickable: false,       //鼠标右键事件
                defineRightMenu: false,      //自定义邮件菜单
                onRightMenuItemClick: null,
                beforeRightMenuShow: null,
                rmenuItems: [],
                enabledInAnyCase: [],
                checkable: false,            //是否为选择模式
                onCheck: null,
                multiple: true,               //多选预留参数
                checkRelated: true,
                onDblclick: null,
                showWarnSign: false,
                indexField: 'index',
                pIndexField: 'pIndex',
                titleField: 'title',

                alarmFlash: {
                    show: false,
                    levelField: 'alarmLevel',
                    timeout: 4000,
                    level: 1,
                    countField: 'count'
                },

                hoverShowTip: {
                    enable: false,
                    formatter: null
                },

                iconClass: {
                    whole: ['fa fa-folder', 'fa fa-folder-open'],   // 定义展开/收起节点时的图标样式,
                    leafClass: 'fa fa-wpforms',
                    alignKey: '',                                  // 根据某一字段来设置展开/收起节点时的图标样式
                    classMap: {}
                }
            };
            var resoTree = null;
            var activeIndex = -1;
            var items = [];
            var rmenu = null;
            var timeout = null;

            var treeItems = [];
            var checkedItems = [];
            var nodeMap = {};

            /**
             * get tree option
             * @returns {*}
             */
            that.getOptions = function () {
                return options;
            };

            /**
             * set tree options
             * @param option
             */
            that.resetOptions = function (option) {
                return $.extend(options, option);
            };

            /**
             * get tree Obj
             * @returns {*}
             */
            that.getTreeObj = function () {
                return treeObj;
            };

            /**
             * 生成树
             * @param target
             * @param option
             */
            that.initTree = function (target, option) {
                that.destroy();
                options = $.extend({}, DEFAULT, option);
                options.alarmFlash = $.extend({}, DEFAULT.alarmFlash, option.alarmFlash);
                options.iconClass = $.extend({}, DEFAULT.iconClass, option.iconClass);
                options.initTreeWithPath = $.extend({}, DEFAULT.initTreeWithPath, option.initTreeWithPath);
                treeObj = $('#' + target);

                treeObj.html('');
                treeObj.html('<div style="width: 100%;text-align: center"><div class="loading" style="margin:auto"></div></div>');
                resoTree = 'resoTree_' + target;
                var html = '<ul id="' + resoTree + '" class="menu"></ul>';
                treeObj.append(html);

                createTreeView();
                initRightClickMenu();

                function initRightClickMenu() {
                    if (rmenu != null) {
                        rmenu.html('');
                    }
                    var rmenuId = target + '_rmenu';
                    var content = '<div id="' + rmenuId + '" class="rmenu"><ul>';
                    if (options.defineRightMenu) {
                        for (var i in options.rmenuItems) {
                            var liClass = (that.isArray(options.enabledInAnyCase) && options.enabledInAnyCase.indexOf(parseInt(i)) >= 0)
                                ? "enabled-in-any-case" : 'forbid-in-disabled';
                            content += '<li class="' + liClass + '">' + options.rmenuItems[i] + '</li>'
                        }
                    } else {
                        content +=
                            '<li id="' + rmenuId + '_editBtn">编辑节点</li>' +
                            '<li id="' + rmenuId + '_delBtn">删除本节点</li>' +
                            '<li id="' + rmenuId + '_removeAllSonBtn">删除所有子节点</li>' +
                            '<li id="' + rmenuId + '_addNewBtn">新增子节点</li>' +
                            '<li id="' + rmenuId + '_addNewBroBtn">新增兄弟节点</li>';
                    }
                    treeObj.append(content);
                    rmenu = $('#' + target + '_rmenu');
                }
            };

            /**
             * 刷新树
             * @returns {boolean}
             */
            that.refresh = function (option) {
                if (resoTree == null) {
                    // console.log('请先调用 initTree 方法生成树');
                    return false;
                }
                treeItems = [];
                checkedItems = [];
                options.activeIndex = activeIndex;
                options.items = options.loadType === 'local' ? items : [];

                if (typeof option == 'object') {
                    $.extend(options, option);
                }
                $('#' + resoTree).html('');
                treeObj.append('<div style="width: 100%;text-align: center"><div class="loading" style="margin:auto"></div></div>');
                createTreeView();
            };

            /**
             * 刷新单个节点
             * @param index
             */
            that.refreshNode = function (index) {
                that.removeAllSon(index);
                that.resetNode(index, {isParent: true});
                that.openNodes(index);
            };

            /**
             * create 树视图
             */
            function createTreeView() {
                var target = treeObj.attr('id');
                if (options.loadType == 'server') {
                    var params = options.queryParams({});
                    // console.log(params);
                    // console.log(options);
                    that.ajaxData(options.url, options.ajaxType, params, function (result) {
                        result = typeof options.responseHandler == 'function' ? options.responseHandler(result, params) : result;
                        options.items = checkDataType(JSON.parse(JSON.stringify(result)));
                        x();
                    }, null, null, null, options.contentType);
                } else {
                    options.items = checkDataType(JSON.parse(JSON.stringify(options.items)));
                    x();
                }

                function x() {
                    treeObj.find('.loading').remove();
                    if (that.isArray(options.items)) {
                        items = normLDataToSimpleData(JSON.parse(JSON.stringify(options.items)));
                        for (var i in options.items) {
                            if(that.isInt(i))
                            initTreeItem(resoTree, options.items[i], parseInt(i) + 1, target + '_menu_item', options.items[i][options.pIndexField], 1);
                        }
                        treeObj.find(".menu ul").css("display", "none");
                    }
                    initToggleEvent();
                }
            }

            /**
             * 重新加载资源树数据
             * @param data   :重新加载的数据
             * @param activeIndex  :树的展示初始位置
             * @param simpleDataType :是否使用简单数据格式，默认true
             */
            that.load = function (data, activeIndex, simpleDataType) {
                if (resoTree == null) {
                    return;
                }

                treeItems = [];
                checkedItems = [];
                $('#' + resoTree).html(' ');

                options.simpleDataType = simpleDataType || options.simpleDataType;
                options.activeIndex = activeIndex || options.activeIndex;
                if (that.isArray(data)) {
                    options.items = checkDataType(JSON.parse(JSON.stringify(data)));
                    for (var i in options.items) {
                        if(that.isInt(i))
                        initTreeItem(resoTree, options.items[i], parseInt(i) + 1, treeObj.attr('id') + '_menu_item', options.items[i][options.pIndexField], 1);
                    }
                    treeObj.find(".menu ul").css("display", "none");
                }
                initToggleEvent();
            };

            /**
             * 资源树节点点击事件
             * @param item
             * @param state
             */
            that.onChange = function (item, state, trigget) {
                var treeNode = treeObj.find('li .reso-tree-menu[data-index="' + item[options.indexField] + '"]');
                if (!state) {
                    clearTimeout(timeout);
                    treeNode.find('.loading').remove();
                }

                // 远程加载数据
                if (options.loadType.indexOf('server') >= 0 && that.isParentNodes(item[options.indexField]) && !that.isLoadData(item[options.indexField]) && state) {
                    if (treeNode.find('.loading').length <= 0) {
                        treeNode.append('<div class="loading" style="width: 25px;height: 25px;margin:10px 60px"></div>');
                    }
                    clearTimeout(timeout);
                    timeout = setTimeout(function () {
                        var params = JSON.parse(JSON.stringify(item));
                        var formatParams = options.queryParams(params);
                        that.ajaxData(options.url, options.ajaxType, formatParams, function (result) {
                            treeNode.find('.loading').remove();
                            result = typeof options.responseHandler == 'function' ? options.responseHandler(result, formatParams) : result;
                            result = checkDataType(JSON.parse(JSON.stringify(result)));
                            that.appendNodes(item[options.indexField], result);
                        }, null, null, null, options.contentType);
                    }, 500);
                }

                trigget = trigget === false ? false : true;
                if (typeof options.onChange == 'function' && trigget) {
                    options.onChange(item, state);
                }
            };

            /**
             * 增加子节点
             */
            that.appendNodes = function (index, items) {
                if (that.isEmpty(items)) {
                    // console.log('Could not append empty nodes!');
                    return false;
                }
                if (index == '-1') {
                    append(resoTree, items, options.items.length, resoTree.substr(10) + '_menu_item', index, 1);
                    initToggleEvent();
                } else {
                    // 事先无子项，追加
                    var treeNode = treeObj.find('.reso-tree-menu[data-index="' + index + '"]');
                    if (!treeNode.find('.collapse-icon').hasClass('glyphicon-plus-sign')
                        && !treeNode.find('.collapse-icon').hasClass('glyphicon-minus-sign')) {
                        treeNode.find('.collapse-icon').addClass('glyphicon glyphicon-minus-sign');
                    }

                    if (treeNode.parent().find('#son_menu_' + treeNode.attr('id')).length <= 0) {
                        treeNode.parent().append('<ul id="son_menu_' + treeNode.attr('id') + '" class="son-menu"></ul>')
                    }

                    var _count = $('#son_menu_' + treeNode.attr('id')).find('li').length + 1;
                    append('son_menu_' + treeNode.attr('id'), items, _count, treeNode.attr('id'), index, parseInt(treeNode.attr('data-level')) + 1);


                    appendToggleEvent(treeNode.parent());
                    if (options.checkable) {
                        var checkedList = [];
                        items.forEach(function (item) {
                            if ((typeof item['checked'] !== 'undefined')
                                && (item['checked'] || (item['checked']).toString().toUpperCase() === 'TRUE')) {
                                checkedList.push(item);
                            }
                        });
                        checkNodes(checkedList);
                    }
                }

                if(typeof options.onAppendNodes === 'function'){
                    options.onAppendNodes(that.getNode(index),items);
                }

                /**
                 * @param treeId  节点所在ul的id
                 * @param items   待添加节点
                 * @param _count  下标基值
                 * @param itemId  父节点的id
                 * @param pIndex  父节点的index
                 * @param level   父节点的level
                 */
                function append(treeId, items, _count, itemId, pIndex, level) {
                    if (that.isArray(items)) {
                        items = checkDataType(items);
                        for (var i in items) {
                            if(that.isInt(i))
                            initTreeItem(treeId, items[i], parseInt(i) + _count, itemId, pIndex, level);
                        }
                    } else {
                        items = checkPathMode(items, index);
                        initTreeItem(treeId, items, _count, itemId, pIndex, level);
                    }

                    function checkPathMode(item, pIndex) {
                        if (!that.isArray(item) && typeof item === 'object' && options.initTreeWithPath.enable) {
                            item.pathIndex = item[options.initTreeWithPath.pathField];
                            item.pPathIndex = pIndex;
                        }
                        return item;
                    }
                }

                return that;
            };

            /** 删除子节点
             *
             * @param index
             */
            that.removeNodes = function (index) {
                that.removeAllSon(index);
                treeObj.find('.reso-tree-menu[data-index="' + index + '"]').parent().remove();
                var item = getItem(index);
                treeItems.splice($.inArray(item, treeItems), 1);
            };

            /** 删除所有子节点
             *
             * @param index
             */
            that.removeAllSon = function (index) {
                var treeNode = treeObj.find('.reso-tree-menu[data-index="' + index + '"]');
                treeNode.parent().find('ul.son-menu').each(function () {
                    $(this).remove();
                });
                treeNode.find('.collapse-icon').removeClass('glyphicon-plus-sign').removeClass('glyphicon-minus-sign');
                that.getSonNodes(index).forEach(function (item, index) {
                    if (that.isArray(that.getSonNodes(item[options.indexField]))) {
                        that.removeAllSon(item[options.indexField]);
                    }
                    treeItems.splice($.inArray(item, treeItems), 1)
                });
            };

            /** 修改子节点
             *
             * @param index
             * @param oldTitle
             * @param newTitle
             */
            that.editNodes = function (index, oldTitle, newTitle) {
                var _that = treeObj.find('.reso-tree-menu[data-index="' + index + '"]');
                _that.find('.item-span').hide();
                _that.find('.item-input').show();
                _that.find('.item-input').focus();
                _that.find('.item-input').off('blur').on('blur', function () {
                    e(this);
                });

                _that.find('.item-input').off('keydown').on('keydown', function (e) {
                    if (e.keyCode == 13) {
                        oldTitle = $(this).prev().text();
                        newTitle = $(this).val();
                        $(this).hide();
                        $(this).prev().show();
                        $(this).prev().text(newTitle);

                        if (typeof options.onEdit == 'function') {
                            options.onEdit(getItem(index), oldTitle, newTitle);
                        }
                    }
                });

                function e(_this) {
                    oldTitle = $(_this).prev().text();
                    newTitle = $(_this).val();
                    $(_this).hide();
                    $(_this).prev().show();
                    $(_this).prev().text(newTitle);

                    if (typeof options.onEdit == 'function') {
                        options.onEdit(getItem(index), oldTitle, newTitle);
                    }
                }
            };

            /** 回调打开某一子节点
             *
             * @param index
             */
            that.openNodes = function (index) {
                var treeNode = treeObj.find('.reso-tree-menu[data-index="' + index + '"]');
                openParent(treeNode);
                treeNode.click();

                function openParent(sonItem) {
                    var pItem = sonItem.parent().parent();
                    if (pItem == undefined || pItem.prop("tagName") != 'UL') {
                        return;
                    }
                    pItem.show();
                    pItem.prev().find('.collapse-icon').removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                    var itemIcon = pItem.prev().find('.icon');
                    // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-open-cls'));
                    changeItemIcon(itemIcon, true);
                    openParent(pItem);
                }
            };

            /** 获得active index
             *
             */
            that.getActiveItem = function () {
                return getItem(options.activeIndex);
            };

            /**
             * 是否是父节点
             *
             * @param index
             * @returns {*}
             */
            that.isParentNodes = function (index) {
                var treeNode = treeObj.find('.reso-tree-menu[data-index="' + index + '"]');
                return treeNode.find('.collapse-icon').hasClass('glyphicon-plus-sign') || treeNode.find('.collapse-icon').hasClass('glyphicon-minus-sign')
            };

            /**
             * 节点是否已经加载数据
             * @param index
             * @returns {boolean}
             */
            that.isLoadData = function (index) {
                var treeNode = treeObj.find('.reso-tree-menu[data-index="' + index + '"]');
                return treeNode.parent().find('.son-menu').length > 0;
            };

            /** 获得所选
             *
             * @returns {Array}
             */
            that.getSelected = function () {
                var nodes = [];
                if (treeObj !== null) {
                    treeObj.find('.checked-icon').each(function () {
                        var _this = $(this).parent();
                        var item = getItem(_this.attr('data-index'));
                        item.checked = true;
                        nodes.push(item);
                    });
                }
                return nodes;
            };

            /**
             * 选中某一节点，单选时只选中index，
             * 复选时选中某一节点下的节点，满足params信息,
             * @param index
             * @param params
             * @returns {boolean}
             */
            that.check = function (index, params) {
                if (!options.checkable) {
                    // console.log('Tree is not in selectable mode currently!');
                    return false;
                }

                if (options.multiple) {
                    var checkedList = that.getSelected();
                    var checkedIndex = [];
                    checkedList.forEach(function (item) {
                        checkedIndex.push(item[options.indexField]);
                    });
                    var generations = that.getGenerations(index);
                    generations.forEach(function (item) {
                        if ($.inArray(item[params.field], params.values) !== -1
                            && ($.inArray(item[options.indexField], checkedIndex) === -1)) {
                            checkedList.push(item)
                        }
                    });
                    that.unCheckAll();
                    checkNodes(checkedList);
                } else {
                    that.unCheckAll();
                    checked(treeObj.find('.reso-tree-menu[data-index="' + index + '"]'));
                }

                return that;
            };

            that.setCheckedStyle = function(items){
                if(that.isArray(items)){
                    items.forEach(function(index){
                        treeObj.find('.reso-tree-menu[data-index="' + index + '"]').addClass('checked');
                    })
                }else{
                    treeObj.find('.reso-tree-menu[data-index="' + items + '"]').addClass('checked');
                }
            };

            /**
             * 选中所有结点
             * @returns {*}
             */
            that.checkAll = function () {
                if (!options.checkable) {
                    // console.log('Tree is not in selectable mode currently!');
                    return false;
                }
                that.unCheckAll();
                treeObj.find('.reso-tree-menu[data-level="1"]').each(function () {
                    checked($(this));
                    checkAllSon($(this));
                });
                return that;
            };

            /**
             * 取消选中所有
             * @returns {*}
             */
            that.unCheckAll = function () {
                if (!options.checkable) {
                    // console.log('Tree is not in selectable mode currently!');
                    return false;
                }
                treeObj.find('.checked-icon').each(function () {
                    var _this = $(this).parent();
                    unchecked(_this);
                    uncheckAllSon(_this);
                    allParentsRemoveCheckedClass(_this);
                });
                return that;
            };

            /**
             * 获得树所有节点信息
             * @returns {Array}
             */
            that.getAllNodes = function () {
                var checkedArr = that.getSelected();
                var cIndexs = [];
                checkedArr.forEach(function (c) {
                    cIndexs.push(c[options.indexField])
                });
                treeItems.forEach(function (t, i) {
                    treeItems[i].checked = (cIndexs.indexOf(t[options.indexField]) >= 0 )
                });
                return treeItems;
            };

            /**
             * 获得节点路径
             * @param index
             * @param split
             * @returns {*}
             */
            that.getPath = function (index, split) {
                split = split || '/';
                var item = getItem(index);
                if (item == null) {
                    return '-1';
                }
                var path = split + item[options.titleField];
                if (item[options.pIndexField] && item[options.pIndexField] != '-1') {
                    path = that.getPath(item[options.pIndexField], split) + path;
                }
                return path;
            };

            /**
             * 获取节点的index路径
             * @param index
             * @param split
             * @returns {*}
             */
            that.getIndexPath = function (index, split) {
                split = split || '/';
                var item = getItem(index);
                if (item == null) {
                    return '-1';
                }

                var path = split + item[options.indexField];
                if (that.isNotBlank(item[options.pIndexField]) && item[options.pIndexField] != '-1') {
                    path = that.getIndexPath(item[options.pIndexField], split) + path;
                }

                return path;
            };

            /**
             * 获取根节点
             * @returns {Array}
             */
            that.getRootNodes = function () {
                var res = [];
                treeItems.forEach(function (item, index) {
                    if (that.isBlank(item[options.pIndexField]) || item[options.pIndexField] == '-1') {
                        res.push(item);
                    }
                });
                return res;
            };

            /**
             * 展开所有节点
             */
            that.openAllNodes = function () {
                treeObj.find('ul.menu').show();
                treeObj.find('ul.son-menu').show();
                treeObj.find('.reso-tree-menu').each(function () {
                    if (($(this).find('.collapse-icon').hasClass('glyphicon-plus-sign')
                        || $(this).find('.collapse-icon').hasClass('glyphicon-minus-sign'))
                        && $(this).parent().find('.son-menu').length > 0) {
                        $(this).find('.collapse-icon').removeClass('glyphicon glyphicon-plus-sign').addClass('glyphicon glyphicon-minus-sign');
                        var itemIcon = $(this).find('.icon');
                        // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-open-cls'));
                        changeItemIcon(itemIcon, true);
                    }
                })
            };

            /**
             * 收起所有节点
             */
            that.collapseAllNodes = function () {
                treeObj.find('ul.son-menu').hide();
                treeObj.find('.reso-tree-menu').each(function () {
                    if (($(this).find('.collapse-icon').hasClass('glyphicon-plus-sign')
                        || $(this).find('.collapse-icon').hasClass('glyphicon-minus-sign'))
                        && $(this).parent().find('.son-menu').length > 0) {
                        $(this).find('.collapse-icon').removeClass('glyphicon glyphicon-minus-sign').addClass('glyphicon glyphicon-plus-sign');
                        var itemIcon = $(this).find('.icon');
                        // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-close-cls'));
                        changeItemIcon(itemIcon, false);
                    }
                });
                activeIndex = -1;
            };

            /**
             * 获取节点
             * @param index
             */
            that.getNode = function (index) {
                return getItem(index);
            };

            /**
             * 获取所有子节点集合
             *
             * @param index
             * @returns {Array}
             */
            that.getSonNodes = function (index) {
                var result = [];
                for (var i in treeItems) {
                    if (treeItems[i][options.pIndexField] == index) {
                        result.push(treeItems[i]);
                    }
                }
                return result;
            };

            that.destroy = function () {
                if (treeObj) {
                    treeObj.html('');
                }
                treeObj = null;
                options = null;
                DEFAULT = {
                    activeIndex: '-1',         //默认展开位置
                    loadType: 'local|server',  //加载菜单时的方法，‘local’本地，‘server’远程,'local|server'先加载本地，后加载远程
                    url: '#',                  //菜单数据加载地址，loadType 为‘server’时必填
                    ajaxType: 'GET',           //请求方式
                    onChange: null,            //树选择事件
                    onAddNew: null,
                    onEdit: null,
                    onRemove: null,
                    onRemoveAllSon: null,
                    queryParams: function (params) {      //在这里修改查询参数或追加参数,记得return
                        return params;
                    },
                    responseHandler: function (data) {     // 修改响应
                        return data;
                    },
                    simpleDataType: false,
                    initTreeWithPath: {
                        enable: false,
                        pathField: 'path',
                        split: '/'
                    },
                    items: [],

                    showRightMenuOnLeftClick: false,
                    rightClickable: false,       //鼠标右键事件
                    defineRightMenu: false,      //自定义邮件菜单
                    onRightMenuItemClick: null,
                    rmenuItems: [],
                    enabledInAnyCase: [],

                    checkable: false,            //是否为选择模式
                    onCheck: null,
                    multiple: true,               //多选预留参数
                    checkRelated: true,

                    onDblclick: null,
                    showWarnSign: false,

                    indexField: 'index',
                    pIndexField: 'pIndex',
                    titleField: 'title',

                    alarmFlash: {
                        show: false,
                        levelField: 'level',
                        timeout: 4000,
                        level: 1,
                        countField: 'count'
                    },
                    hoverShowTip: {
                        enable: false,
                        formatter: null
                    },
                    iconClass: {
                        whole: ['fa fa-folder', 'fa fa-folder-open'],   // 定义展开/收起节点时的图标样式,
                        leafClass: 'fa fa-wpforms',
                        alignKey: '',                                  // 根据某一字段来设置展开/收起节点时的图标样式
                        classMap: {
                            key1: ['', ''],
                            key2: ['', '']
                        }
                    }
                };
                resoTree = null;
                activeIndex = -1;
                items = [];
                rmenu = null;
                timeout = null;

                treeItems = [];
                checkedItems = [];
            };

            /**
             * 修改节点信息
             * @param index     :待修改的节点
             * @param params    :要修改的参数
             * @returns {boolean}   :修改结果
             */
            that.resetNode = function (index, params) {
                var item = null;
                treeItems.forEach(function (itm, i) {
                    if (itm[options.indexField] == index && typeof params == 'object') {
                        item = $.extend(treeItems[i], params);
                    }
                });

                if (item !== null) {
                    var leafItem = treeObj.find('.reso-tree-menu[data-index="' + item[options.indexField] + '"]');
                    leafItem.find('.item-span').text(item[options.titleField]);
                    leafItem.find('.icon').removeClass().addClass('icon').addClass(item.disable ? 'glyphicon glyphicon-leaf' : item.iconClass);
                    item.disable ? leafItem.addClass('disable') : leafItem.removeClass('disable');

                    var gen = that.getGenerations(index);
                    if (gen.length - 1 === 0 && !item.isParent) {
                        treeObj.find('.reso-tree-menu[data-index="' + item[options.indexField] + '"] .collapse-icon').removeClass().addClass('collapse-icon');
                    }

                    if (item.isParent) {
                        treeObj.find('.reso-tree-menu[data-index="' + item[options.indexField] + '"] .collapse-icon').removeClass().addClass('collapse-icon glyphicon glyphicon-plus-sign');
                    }
                }
                return item;
            };

            /**
             * 获得所有子孙节点
             * @param index
             * @returns {Array}
             */
            that.getGenerations = function (index) {
                var items = [];
                treeObj.find('.reso-tree-menu[data-index="' + index + '"]').parent().find(".reso-tree-menu").each(function () {
                    items.push(getItem($(this).attr('data-index')));
                });
                return items;
            };

            /**
             * 获得所有祖宗节点
             * @param index
             */
            that.getAncestor = function (index) {
                return getAncestor(index, treeItems);
            };

            /**
             * 递归绘画树节点
             * @param treeId
             * @param item
             * @param index
             * @param itemId
             * @param pIndex
             */
            function initTreeItem(treeId, item, index, itemId, pIndex, level) {
                var ITEM_DEFAULR = {
                    iconClass: '',
                    index: parseInt(Math.random() * 9999 + 1),
                    title: 'title',
                    isParent: false,
                    children: [],
                    checked: false,
                    disable: false,
                    count: 0
                };
                ITEM_DEFAULR[options.indexField] = ITEM_DEFAULR.index;
                item = $.extend({}, ITEM_DEFAULR, item);

                var itemTemp = JSON.parse(JSON.stringify(item));
                itemTemp.children = '';
                itemTemp.index = itemTemp[options.indexField];
                itemTemp[options.pIndexField] = pIndex;
                treeItems.push(itemTemp);
                nodeMap[itemTemp.index] = itemTemp;

                if (itemTemp.checked || (itemTemp.checked).toString().toUpperCase() === 'TRUE') {
                    checkedItems.push(itemTemp);
                }

                itemId += '_' + index;
                var treeItem =
                    '<li id="li_' + itemId + '" class=""><div id="' + itemId + '" class="reso-tree-menu ' + (item.disable ? 'disable' : 'undisable') + '" data-index="' + item[options.indexField] + '" data-level="' + level + '">' +
                    '       <i class="collapse-icon"></i>' +
                    '       <div class="horizon_line"></div>' +
                    // '       <i class="icon ' + (item.disable ? 'glyphicon glyphicon-leaf' : getIconClass(item, 0)) + '" data-open-cls="' + getIconClass(item, 1) + '" data-close-cls="' + getIconClass(item, 0) + '"></i>' +
                    initItemIcon(item) +
                    alarmFlash(item) +
                    // '       <span class="item-span" title="'+item[options.titleField] +'">' + item[options.titleField] +
                    '       <span class="item-span" title="'+item.text +'">' + item.text +
                    (options.alarmFlash.show ? ('(' + item[options.alarmFlash.countField] + ')') : '' ) +
                    '</span>' +
                    // '       <input class="item-input" type="text" value="' + item[options.titleField] + ' " style="display: none" >' +
                    '       <input class="item-input" type="text" value="' + item.id + ' " style="display: none" >' +
                    '</div></li>';
                $('#' + treeId).append(treeItem);

                if (options.hoverShowTip.enable) {
                    $('#li_' + itemId).find('.reso-tree-menu').off('mouseover').on('mouseover', function (e) {
                        $('body').append('<span class="hover-tip-content" ' +
                            'style="left:' + (parseInt($(this).offset().left) + 40) + 'px;top:'+(parseInt($(this).offset().top) + 25)+'px;">' +
                            ((typeof options.hoverShowTip.formatter === 'function') ? options.hoverShowTip.formatter(item) : item[options.titleField])
                            + '</span>')
                    }).off('mouseout').on('mouseout', function () {
                        $('.hover-tip-content').remove();
                    });
                }

                // 渲染子项
                if (item.isParent || that.isArray(item.children || (item.isParent).toString().toUpperCase() === 'TRUE')) {
                    $('#' + itemId).find('.collapse-icon').addClass('glyphicon glyphicon-plus-sign');
                }

                if (that.isArray(item.children)) {
                    $('#li_' + itemId).append('<ul id="son_menu_' + itemId + '" class="son-menu"></ul>');
                    for (var i in item.children) {
                        if(that.isInt(i))
                        initTreeItem('son_menu_' + itemId, item.children[i], parseInt(i) + 1, itemId, item[options.indexField], level + 1);
                    }
                    $('#son_menu_' + itemId).css('display', 'none');
                }

                function alarmFlash(item) {
                    if (options.alarmFlash.show) {
                        var level = parseInt(item[options.alarmFlash.levelField]);
                        var levelClass = 'alarm-level-' + level;
                        if (level >= options.alarmFlash.level && item['hasNewAlarm'] === 1) {     //=1表示有新告警，modify By luocb 2018-04-08
                            levelClass += ' alarm-flash-level-' + level;
                            var audio = document.getElementById('treeNewAlarmRingAudio');
                            audio.currentTime = 0;
                            audio.play();
                        }
                        return '<div class="radiusPoint ' + levelClass + '"></div>'
                    }
                    return '';
                }

                function initItemIcon(item) {
                    var openIcon = getIconClass(item, 1),
                        closeIcon = getIconClass(item, 0);
                    openIcon = getIconClass(item, 0).indexOf("url") !== -1 ? openIcon.substring(4, openIcon.length -1) : openIcon;
                    closeIcon = getIconClass(item, 0).indexOf("url") !== -1 ? closeIcon.substring(4, closeIcon.length -1) : closeIcon;

                    return getIconClass(item, 0).indexOf("url") !== -1 ?
                        '<img data-type="img" class="icon" src="' + closeIcon + '" width="14px" height="14px" data-open-cls="' + openIcon + '" data-close-cls="' + closeIcon + '">'
                        : '<i data-type="i" class="icon ' + (item.disable ? 'glyphicon glyphicon-leaf' : closeIcon) + '" data-open-cls="' + openIcon + '" data-close-cls="' + closeIcon + '"></i>';
                }

                function getIconClass(item, type) {
                    if (that.isNotBlank(item.iconClass)) {
                        return that.isArray(item.iconClass) ? item.iconClass[type] : item.iconClass;
                    }

                    var key = item[options.iconClass.alignKey];
                    if (key && that.isArray(options.iconClass.classMap[key])) {
                        return options.iconClass.classMap[key][type];
                    } else if (key && that.isNotBlank(options.iconClass.classMap[key])) {
                        return options.iconClass.classMap[key];
                    }

                    return (item.isParent || that.isArray(item.children || (item.isParent).toString().toUpperCase() === 'TRUE')) ? options.iconClass.whole[type] : options.iconClass.leafClass;
                }
            }

            /**
             * 树节点点击事件
             */
            function initToggleEvent() {
                // 正常模式
                treeObj.find(".reso-tree-menu").off("click").on("click", function (e) {
                    treeObj.find('.reso-tree-menu').removeClass('active');
                    $(this).addClass('active');
                    var opened = null;
                    $(this).next().slideToggle('fast');
                    var collapseIcon = $(this).find('.collapse-icon');
                    var itemIcon = $(this).find('.icon');
                    if (collapseIcon.hasClass('glyphicon-plus-sign')) {
                        collapseIcon.removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                        // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-open-cls'));
                        opened = true;
                        changeItemIcon(itemIcon, true);
                    } else if (collapseIcon.hasClass('glyphicon-minus-sign')) {
                        collapseIcon.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                        // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-close-cls'));
                        opened = false;
                        changeItemIcon(itemIcon, false);
                    }

                    var aIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');
                    options.activeIndex = aIndex;
                    that.onChange(getItem(options.activeIndex), opened);
                });

                treeObj.find('.reso-tree-menu .collapse-icon').off('click').on('click', function (e) {
                    $(this).parent().next().slideToggle('fast');
                    var opened = null;
                    var itemIcon = $(this).parent().find('.icon');
                    if ($(this).hasClass('glyphicon-plus-sign')) {
                        $(this).removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                        // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-open-cls'));
                        opened = true;
                        changeItemIcon(itemIcon, true);
                    } else if ($(this).hasClass('glyphicon-minus-sign')) {
                        $(this).removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                        // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-close-cls'));
                        opened = false;
                        changeItemIcon(itemIcon, false);
                    }
                    that.onChange(getItem($(this).parent().attr('data-index')), opened, false);
                    e.stopPropagation();
                });

                // 选择模式
                if (options.checkable) {
                    treeObj.find('.reso-tree-menu').addClass('checkable');
                    treeObj.find('.reso-tree-menu .item-span').off('click').on('click', function (e) {
                        var _this_item_div = $(this).parent();
                        if (!options.multiple) {
                            treeObj.find('.reso-tree-menu').removeClass('checked').find('.checked-icon').remove();
                            _this_item_div.hasClass('checked') ? unchecked(_this_item_div) : checked(_this_item_div);
                        } else {
                            var bool = false;
                            if (_this_item_div.hasClass('checked')) {
                                unchecked(_this_item_div);
                                if (options.checkRelated) {
                                    uncheckAllSon(_this_item_div);
                                    allParentsRemoveCheckedClass(_this_item_div);
                                    parentsAddcheckedClass(_this_item_div);
                                }
                                bool = false;
                            } else {
                                checked(_this_item_div);
                                if (options.checkRelated) {
                                    checkAllSon(_this_item_div);
                                    allParentsAddCheckedClass(_this_item_div);
                                    if (isSiblingsAllChecked(_this_item_div.parent())) {
                                        parentsAddCheckedIcon(_this_item_div);
                                    }
                                }
                                bool = true;
                            }
                        }
                        nodeMap[_this_item_div.attr('data-index')].checked = bool;
                        if (typeof options.onCheck == 'function') {
                            options.onCheck(getItem(_this_item_div.attr('data-index')), bool);
                        }

                        e.stopPropagation();
                    });

                    that.unCheckAll();
                    checkNodes(checkedItems)
                }

                // 左键点击出现菜单
                if (options.showRightMenuOnLeftClick) {
                    treeObj.find('.reso-tree-menu .item-span').off('click').on('click', function (e) {
                        treeObj.find('.reso-tree-menu').removeClass('active');
                        $(this).parent().addClass('active');
                        options.activeIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');
                        onRightClick($(this).parent());
                        e.stopPropagation();
                    })
                }

                // 双击事件
                if (typeof options.onDblclick == 'function') {
                    treeObj.find(".reso-tree-menu .item-span").off('click').on('click', function (e) {
                        treeObj.find('.reso-tree-menu').removeClass('active');
                        $(this).parent().addClass('active');
                        options.activeIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');
                        that.onChange(getItem(options.activeIndex));
                        e.stopPropagation();
                    });

                    treeObj.find(".reso-tree-menu .item-span").dblclick(function (e) {
                        options.onDblclick(getItem(options.activeIndex));
                    });
                }

                if (options.rightClickable) {
                    document.oncontextmenu = function (e) {
                        e.preventDefault();
                    };
                }
                // 右键事件
                treeObj.find(".reso-tree-menu").off('mousedown').on('mousedown', function (e) {
                    if (e.button == 2) {
                        treeObj.find('.reso-tree-menu').removeClass('active');
                        $(this).addClass('active');
                        options.activeIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');
                        onRightClick($(this));
                    }
                });

                // 默认展开位置
                if (options.activeIndex != '-1') {
                    activeIndex = options.activeIndex;
                    (options.activeIndex).toUpperCase() == 'ALL' ? that.openAllNodes()
                        : that.openNodes(options.activeIndex);
                }

                // load success
                if (typeof options.onLoadSuccess == 'function') {
                    options.onLoadSuccess(that);
                }

                if (options.alarmFlash.show) {
                    if (parseInt(options.alarmFlash.timeout) > 0) {
                        setTimeout(function () {
                            for (var i = parseInt(options.alarmFlash.level); i <= 5; i++) {
                                treeObj.find('.radiusPoint').removeClass('alarm-flash-level-' + i);
                            }
                        }, options.alarmFlash.timeout);
                    }
                }
            }

            /**
             * 追加节点后，需要给新节点追加事件
             * @param target
             */
            function appendToggleEvent(target) {
                target.find(".reso-tree-menu").off("click").on("click", function () {
                    treeObj.find('.reso-tree-menu').removeClass('active');
                    $(this).addClass('active');

                    var opened = null;
                    $(this).next().slideToggle('fast');
                    var collapseIcon = $(this).find('.collapse-icon');
                    var itemIcon = $(this).find('.icon');
                    if (collapseIcon.hasClass('glyphicon-plus-sign')) {
                        collapseIcon.removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                        // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-open-cls'));
                        changeItemIcon(itemIcon, true);
                        opened = true;
                    } else if (collapseIcon.hasClass('glyphicon-minus-sign')) {
                        collapseIcon.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                        // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-close-cls'));
                        changeItemIcon(itemIcon, false);
                        opened = false;
                    }

                    var aIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');
                    options.activeIndex = aIndex;
                    that.onChange(getItem(options.activeIndex), opened);
                });

                target.find('.reso-tree-menu .collapse-icon').off('click').on('click', function (e) {
                    $(this).parent().next().slideToggle('fast');
                    var opened = null;
                    var itemIcon = $(this).parent().find('.icon');
                    if ($(this).hasClass('glyphicon-plus-sign')) {
                        $(this).removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                        // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-open-cls'));
                        opened = true;
                        changeItemIcon(itemIcon, true);
                    } else if ($(this).hasClass('glyphicon-minus-sign')) {
                        $(this).removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                        // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-close-cls'));
                        opened = false;
                        changeItemIcon(itemIcon, false);
                    }
                    that.onChange(getItem($(this).parent().attr('data-index')), opened, false);
                    e.stopPropagation();
                });

                if (options.checkable) {
                    target.find('.reso-tree-menu').addClass('checkable');
                    target.find('.reso-tree-menu .item-span').off('click').on('click', function (e) {
                        var _this_item_div = $(this).parent();
                        if (!options.multiple) {
                            treeObj.find('.reso-tree-menu').removeClass('checked').find('.checked-icon').remove();
                            _this_item_div.hasClass('checked') ? unchecked(_this_item_div) : checked(_this_item_div);
                        } else {
                            var bool = false;
                            if (_this_item_div.hasClass('checked')) {
                                unchecked(_this_item_div);
                                if (options.checkRelated) {
                                    uncheckAllSon(_this_item_div);
                                    allParentsRemoveCheckedClass(_this_item_div);
                                    parentsAddcheckedClass(_this_item_div);
                                }

                                bool = false;
                            } else {
                                checked(_this_item_div);
                                if (options.checkRelated) {
                                    checkAllSon(_this_item_div);
                                    allParentsAddCheckedClass(_this_item_div);
                                    if (isSiblingsAllChecked(_this_item_div.parent())) {
                                        parentsAddCheckedIcon(_this_item_div);
                                    }
                                }
                                bool = true;
                            }
                        }

                        nodeMap[_this_item_div.attr('data-index')].checked = bool;
                        if (typeof options.onCheck == 'function') {
                            options.onCheck(getItem(_this_item_div.attr('data-index')), bool);
                        }

                        e.stopPropagation();
                    });

                    // that.unCheckAll();
                    // checkNodes(checkedItems)
                }

                target.find(".reso-tree-menu").off('mousedown').on('mousedown', function (e) {
                    if (e.button == 2) {
                        treeObj.find('.reso-tree-menu').removeClass('active');
                        $(this).addClass('active');
                        options.activeIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');
                        onRightClick($(this));
                    }
                });

                if (typeof options.onDblclick == 'function') {
                    target.find(".reso-tree-menu .item-span").off('click').on('click', function (e) {
                        treeObj.find('.reso-tree-menu').removeClass('active');
                        $(this).parent().addClass('active');
                        options.activeIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');

                        that.onChange(getItem(options.activeIndex));
                        e.stopPropagation();
                    });

                    target.find(".reso-tree-menu .item-span").dblclick(function (e) {
                        options.onDblclick(getItem(options.activeIndex));
                    });
                }

                if (options.showRightMenuOnLeftClick) {
                    target.find('.reso-tree-menu .item-span').off('click').on('click', function (e) {
                        treeObj.find('.reso-tree-menu').removeClass('active');
                        $(this).parent().addClass('active');
                        options.activeIndex = target.find(".reso-tree-menu.active").attr('data-index');
                        onRightClick($(this).parent());
                        e.stopPropagation();
                    })
                }

                if (options.alarmFlash.show) {
                    if (parseInt(options.alarmFlash.timeout) > 0) {
                        setTimeout(function () {
                            for (var i = parseInt(options.alarmFlash.level); i <= 5; i++) {
                                treeObj.find('.radiusPoint').removeClass('alarm-flash-level-' + i);
                            }
                        }, options.alarmFlash.timeout);
                    }
                }

                if (options.rightClickable) {
                    // 右键事件
                    document.oncontextmenu = function (e) {
                        e.preventDefault();
                    };
                }
                treeObj.find(".reso-tree-menu").off('mousedown').on('mousedown', function (e) {
                    if (e.button == 2) {
                        treeObj.find('.reso-tree-menu').removeClass('active');
                        $(this).addClass('active');
                        options.activeIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');
                        onRightClick($(this));
                    }
                });
            }


            function changeItemIcon(iconObj, opened) {
                var iconType = iconObj.attr('data-type');
                var newIconAttr = opened ? 'data-open-cls' : 'data-close-cls';
                iconType === 'img' ? iconObj.attr('src', iconObj.attr(newIconAttr))
                    : iconObj.removeClass().addClass('icon ' + iconObj.attr(newIconAttr));
            }

            /**
             * 右键点击事件
             * @param _that
             */
            function onRightClick(_that) {
                if (!options.rightClickable) {
                    return;
                }

                var index = _that.attr('data-index');
                if (typeof options.beforeRightMenuShow == 'function') {
                    options.beforeRightMenuShow(getItem(index));
                }

                rmenu.removeClass('disable');
                if (_that.hasClass('disable')) {
                    rmenu.addClass('disable');
                }

                rmenu.css({
                    top: (parseInt(_that.position().top) + 10) + 'px',
                    left: (parseInt(_that.position().left) + 70) + 'px',
                    visibility: 'visible'
                });
                rmenu.show();

                rmenu.find('ul li').each(function (i) {
                    $(this).addClass('forbid-in-disabled');
                    if (that.isArray(options.enabledInAnyCase) && options.enabledInAnyCase.indexOf(parseInt(i)) >= 0) {
                        $(this).removeClass('forbid-in-disabled').addClass('enabled-in-any-case');
                    }
                });

                //编辑节点
                $('#' + rmenu.attr('id') + '_editBtn').off('click').on('click', function () {
                    // that.editNodes(index);
                    if (typeof (options.onEdit == 'function') && !rmenu.hasClass('disable')) {
                        options.onEdit(getItem(index));
                    }
                    rmenu.hide();
                });

                //删除本节点
                $('#' + rmenu.attr('id') + '_delBtn').off('click').on('click', function () {
                    if (typeof options.onRemove == 'function' && !rmenu.hasClass('disable')) {
                        options.onRemove(getItem(index));
                    }
                    rmenu.hide();
                });

                //删除本节点
                $('#' + rmenu.attr('id') + '_removeAllSonBtn').off('click').on('click', function () {
                    if (typeof options.onRemoveAllSon == 'function' && !rmenu.hasClass('disable')) {
                        options.onRemoveAllSon(getItem(index));
                    }
                    rmenu.hide();
                });

                //新增子节点
                $('#' + rmenu.attr('id') + '_addNewBtn').off('click').on('click', function () {
                    if (typeof options.onAddNew == 'function' && !rmenu.hasClass('disable')) {
                        options.onAddNew(getItem(index))
                    }
                    rmenu.hide();
                });

                //新增兄弟节点
                $('#' + rmenu.attr('id') + '_addNewBroBtn').off('click').on('click', function () {
                    var pIndex = _that.parent().parent().prev().attr('data-index');
                    pIndex = pIndex != undefined ? pIndex : '-1';
                    if (typeof options.onAddNew == 'function' && !rmenu.hasClass('disable')) {
                        options.onAddNew(getItem(pIndex))
                    }
                    rmenu.hide();
                });

                //下方新增节点
                $('#' + rmenu.attr('id') + '_addNewDownBtn').off('click').on('click', function () {
                    rmenu.hide();
                });


                // 上移
                $('#' + rmenu.attr('id') + '_UpBtn').off('click').on('click', function () {
                    rmenu.hide();
                });

                // 下移
                $('#' + rmenu.attr('id') + '_DownBtn').off('click').on('click', function () {
                    rmenu.hide();
                });

                if (options.defineRightMenu) {
                    rmenu.find('ul li').each(function (i) {
                        $(this).off('click').on('click', function () {
                            var forbid = !(rmenu.hasClass('disable') &&
                                !(that.isArray(options.enabledInAnyCase) && options.enabledInAnyCase.indexOf(parseInt(i)) >= 0));
                            if (typeof options.onRightMenuItemClick == 'function' && forbid) {
                                options.onRightMenuItemClick(i, getItem(index));
                            }
                            rmenu.hide();
                        })
                    })
                }
            }

            /**
             * 获取节点信息
             * @param index
             * @param items
             * @returns {*}
             */
            function getItem(index) {
                // for (var i in treeItems) {
                //     if (treeItems[i].index == index) {
                //         return treeItems[i];
                //     }
                // }
                // return null;
                return nodeMap[index];
            }

            /**
             * 是否使用简单数据格式
             * @param items
             * @returns {*}
             */
            function checkDataType(items) {
                if (!options.simpleDataType) {
                    // normLDataToSimpleData(JSON.parse(JSON.stringify(items))).forEach(function(node){
                    //     nodeMap[node[options.indexField]] = node;
                    // });
                    return items;
                }
                return simpleDataTypeToNormalDataType(items, options.indexField, options.pIndexField);
            }

            /**
             * 简单关系型数据转树形数据
             * @param sNodes
             * @returns {*}
             */
            function simpleDataTypeToNormalDataType(sNodes, key, parentKey) {
                var i, l,
                    key = key || 'index',
                    parentKey = parentKey || 'pIndex',
                    childKey = 'children';
                if (!key || key == "" || !sNodes) return [];

                if (options.initTreeWithPath.enable) {
                    key = options.indexField = 'pathIndex';
                    parentKey = options.pIndexField = 'pPathIndex';
                }

                if (Array.isArray(sNodes) && sNodes.length) {
                    var r = [];
                    var tmpMap = {};
                    for (i = 0, l = sNodes.length; i < l; i++) {
                        if (options.initTreeWithPath.enable) {
                            sNodes[i][key] = (sNodes[i][options.initTreeWithPath.pathField]);
                            sNodes[i][parentKey] = (getpIndex2(sNodes[i][options.initTreeWithPath.pathField]));
                        }
                        // nodeMap[sNodes[i][key]] = sNodes[i];
                        tmpMap[sNodes[i][key]] = sNodes[i];
                    }
                    for (i = 0, l = sNodes.length; i < l; i++) {
                        if (tmpMap[sNodes[i][parentKey]] && sNodes[i][key] != sNodes[i][parentKey]) {
                            if (!tmpMap[sNodes[i][parentKey]][childKey])
                                tmpMap[sNodes[i][parentKey]][childKey] = [];
                            tmpMap[sNodes[i][parentKey]][childKey].push(sNodes[i]);
                        } else {
                            r.push(sNodes[i]);
                        }
                    }
                    return r;
                } else {
                    return sNodes;
                }

                function getpIndex2(item) {
                    var tempArray = item.split(options.initTreeWithPath.split);
                    tempArray.splice(tempArray.length - 1, 1);
                    return tempArray.join(options.initTreeWithPath.split);
                }

                // function replaceAll(str){
                //     re = new RegExp("/", "g");
                //     return str.replace(re, '@');
                // }
            }

            /**
             * 树形数据转关系型数据
             * @param items
             * @returns {Array}
             */
            function normLDataToSimpleData(items) {
                var tempArray = [];

                function toSimpleDataType(items, rootIndex) {
                    for (var i in items) {
                        if (that.isArray(items[i].children)) {
                            toSimpleDataType(items[i].children, items[i][options.indexField]);
                        }
                        items[i][options.pIndexField] = rootIndex ? rootIndex : '-1';
                        items[i].children = '';
                        tempArray.push(items[i]);
                    }
                }

                toSimpleDataType(items);
                return tempArray;
            }

            function checkNodes(items) {
                var temp = [];
                items.forEach(function (item) {
                    var subNodes = that.getGenerations(item[options.indexField]);
                    var itemSubNodes = getGenerations(item[options.indexField], items);

                    // 判断结点的祖先节点是否被选中
                    var ancestorIndex = [], tempAncestorIndex = [];
                    that.getAncestor(item[options.indexField]).forEach(function (_item, index) {
                        ancestorIndex.push(_item[options.indexField]);
                    });
                    getAncestor(item[options.indexField], temp).forEach(function (_item, index) {
                        tempAncestorIndex.push(_item[options.indexField]);
                    });

                    // if ((subNodes.length - 1 == itemSubNodes.length || itemSubNodes.length - 1 === 0 ) && !hasSameElement(tempAncestorIndex, ancestorIndex)) {
                    //     temp.push(item);
                    // }
                    if (itemSubNodes.length - 1 === 0) {
                        temp.push(item);
                    }
                });
                temp.forEach(function (item, index) {
                    treeObj.find('.reso-tree-menu[data-index="' + item[options.indexField] + '"] .item-span').click();
                });

                // 检查两个数组是否有相同元素
                function hasSameElement(array1, array2) {
                    for (var i in array1) {
                        if ($.inArray(array1[i].toString(), array2) !== -1) {
                            return true;
                        }
                    }
                    return false;
                }
            }

            /**
             * 选中节点
             * @param dom
             */
            function checked(dom) {
                dom.addClass('checked');
                if (!dom.find('.checked-icon').length) {
                    dom.append('<span class="checked-icon glyphicon glyphicon-ok "></span>');
                }
                if(nodeMap[dom.attr('data-index')]) nodeMap[dom.attr('data-index')].checked = true;
            }

            /**
             * 取消选中
             * @param dom
             */
            function unchecked(dom) {
                dom.removeClass('checked');
                dom.find('.checked-icon').remove();
                if(nodeMap[dom.attr('data-index')]) nodeMap[dom.attr('data-index')].checked = false;
            }

            /**
             * 选中所有子节点
             * @param dom
             */
            function checkAllSon(dom) {
                dom.next().children().each(function () {
                    checked($(this).find('.reso-tree-menu'));
                })
            }

            /**
             * 取消选中所有子节点
             * @param dom
             */
            function uncheckAllSon(dom) {
                dom.next().children().each(function () {
                    unchecked($(this).find('.reso-tree-menu'));
                })
            }

            /**
             * allParentsRemoveCheckedClass
             * @param dom
             */
            function allParentsRemoveCheckedClass(dom) {
                if (dom.parent().parent().prev().hasClass('reso-tree-menu')) {
                    var pDom = dom.parent().parent().prev();
                    unchecked(pDom);
                    allParentsRemoveCheckedClass(pDom);
                }
            }

            /**
             * allParentsAddCheckedClass
             * @param dom
             */
            function allParentsAddCheckedClass(dom) {
                if (dom.parent().parent().prev().hasClass('reso-tree-menu')) {
                    dom.parent().parent().prev().addClass('checked');
                    allParentsAddCheckedClass(dom.parent().parent().prev());
                }
            }

            /**
             * parentsAddCheckedIcon
             * @param dom
             */
            function parentsAddCheckedIcon(dom) {
                var pDom = dom.parent().parent().prev();
                if (pDom.hasClass('reso-tree-menu')) {
                    checked(pDom);
                    if (isSiblingsAllChecked(pDom.parent())) {
                        parentsAddCheckedIcon(pDom);
                    }
                }
            }

            /**
             * parentsAddcheckedClass
             * @param dom
             */
            function parentsAddcheckedClass(dom) {
                var pDom = dom.parent().parent().prev();
                if (isSibingsHasChecked(dom.parent())) {
                    if (pDom.hasClass('reso-tree-menu')) {
                        pDom.addClass('checked');
                        allParentsAddCheckedClass(pDom);
                        return;
                    }
                }

                if (pDom.parent().parent().hasClass('son-menu')) {
                    parentsAddcheckedClass(pDom);
                }
            }

            /**
             * isSiblingsAllChecked
             * @param dom
             * @returns {boolean}
             */
            function isSiblingsAllChecked(dom) {
                var bool = true;
                dom.siblings().each(function () {
                    var _that = $(this);
                    if ($('#' + _that.attr('id').substr(3)).find('.checked-icon').length <= 0) {
                        bool = false;
                    }
                });
                return bool;
            }

            /**
             * isSibingsHasChecked
             * @param dom
             * @returns {boolean}
             */
            function isSibingsHasChecked(dom) {
                var bool = false;
                dom.siblings().each(function () {
                    var _that = $(this);
                    if ($('#' + _that.attr('id').substr(3)).find('.checked-icon').length) {
                        bool = true;
                    }
                });
                return bool;
            }

            that.getParentNode = function (index) {
                return getParentNode(getItem(index), treeItems, options.pIndexField, options.indexField);
            };

            function getParentNode(item, items, pIndexField, indexField) {
                var bool = null;
                items.forEach(function (itm) {
                    if (itm[indexField] == item[pIndexField]) {
                        bool = itm;
                    }
                });
                return bool;
            }

            /**
             * 取子节点，方法内自用
             * @param index
             * @param items
             * @param pIndexField
             * @returns {Array}
             */
            function getSonNodes(index, items, pIndexField) {
                var result = [];
                items.forEach(function (itm) {
                    if (itm[pIndexField] == index) {
                        result.push(itm);
                    }
                });
                return result;
            }

            function getGenerations(index, items) {
                var generations = that.getGenerations(index);
                var indexArray = [], results = [];
                generations.forEach(function (_item) {
                    indexArray.push(_item[options.indexField]);
                });
                items.forEach(function (_item, _index) {
                    if ($.inArray(_item[options.indexField], indexArray) !== -1) {
                        results.push(_item);
                    }
                });
                return results;
            }

            function getAncestor(index, items) {
                var item = getItem(index);
                if (item == null) {
                    return [];
                }
                var results = [];
                var pNode = getParentNode(item, items, options.pIndexField, options.indexField);
                if (pNode == null) {
                    return [];
                }
                results.push(pNode);
                if (that.isNotBlank(pNode[options.pIndexField]) && pNode[options.pIndexField] != '-1') {
                    var temps = getAncestor(pNode[options.indexField], items);
                    if (that.isArray((temps))) {
                        temps.forEach(function (_item, _index) {
                            results.push(_item);
                        })
                    }
                }
                return results;
            }

            /**
             * 获得兄弟节点，方法内自用
             * @param item
             * @param items
             * @param pIndexField
             * @returns {Array}
             */
            function getBroNodes(item, items, pIndexField) {
                var result = [];
                items.forEach(function (itm) {
                    if (item[pIndexField] == itm[pIndexField]) {
                        result.push(itm);
                    }
                });
                return result;
            }

            return that;
    },
        /**
         * 获得跟路径
         * @returns {string}
         */
        getRootPath : function () {
            if (typeof GC !== 'undefined' && GC.basePath) {
                return GC.basePath;
            }

            var curWwwPath = window.document.location.href;
            var pathName = window.document.location.pathname;
            var pos = curWwwPath.indexOf(pathName);
            var localhostPaht = curWwwPath.substring(0, pos);
            var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);

            return (localhostPaht + projectName);
        },
        /**
         * 提示框
         * @param title 提示框标题
         * @param message 提示框内容
         * @param icon 提示框图标
         */
        tips : function (title, message, icon) {
            var top = 16;
            $('.notification').each(function () {
                top += $(this).height() + 35;
            });

            if (!$('.notify-list').length) {
                $('body').append('<div class="notify-list"></div>');
            }

            icon = icon == 'success' ? 'fa fa-check-circle notify-success'
                : icon == 'warning' ? 'fa fa-exclamation-circle notify-warning'
                    : icon == 'error' ? 'fa fa-times-circle notify-error'
                        : icon == 'message' ? 'fa fa-info-circle notify-message' : icon;

            var DIV = $('<div class="notification" style="top:' + top + 'px;">').append(
                '<i class="glyphicon glyphicon-remove notification-remove-icon"/>' +
                '    <i class="' + (icon != undefined && icon != null ? ('notification-icon ' + icon) : '') + '"></i>' +
                '    <div class="notification-group ' + (icon != undefined && icon != null ? 'with-icon-left' : '') + '">' +
                '        <h2 class="notification-title">' + title + '</h2>' +
                '        <div class="notification-content">' +
                '            <p>' + message + '</p>' +
                '        </div>' +
                '    </div>' +
                '</div>');

            $('.notify-list').append(DIV);
            DIV.animate({'right': '16px'}, 'fast');
            DIV.find('.notification-remove-icon').off('click').on('click', function () {
                DIV.remove();
            });
            setTimeout(function () {
                DIV.remove();
                var top = 16;
                $('.notification').each(function (index) {
                    if (index == 0) {
                        $(this).css('top', '16px');
                    } else {
                        top += $(this).height() + 35;
                        $(this).css('top', top + 'px');
                    }
                });
            }, 3500);
        },
        /**
         * 弹出框,(基于bootstrapDialog的二次封装)
         * @param options
         * @returns {SimpleDialog}
         */
        SimpleDialog: function (options) {
            var that = this;
            var DEFAULT = {
                type: BootstrapDialog.TYPE_DEFAULT,
                size: BootstrapDialog.SIZE_NORMAL,
                backdrop: 'false',
                closable: true,
                closeByBackdrop: false,
                closeByKeyboard: true,
                draggable: true,
                closeIcon: '&#215;',
                spinicon: BootstrapDialog.ICON_SPINNER,
                autodestroy: true,
                animate: true,

                cssClass: '',
                title: 'Title',
                message: 'Message',
                buttons: [],
                onshow: null,
                onshown: null,

                showHeader: true,
                width: null,
                hideBackDrop: false
            };

            options = $.extend({}, DEFAULT, options);
            if (Array.isArray(options.buttons) && options.buttons.length) {
                for (var i in options.buttons) {
                    var BUTTON_DEFAULT = {
                        autospin: '',
                        icon: '',
                        label: '',
                        cssClass: '',
                        action: null
                    };
                    options.buttons[i] = $.extend({}, BUTTON_DEFAULT, options.buttons[i]);
                    options.buttons[i].cssClass = 'dialog-btn ' + options.buttons[i].cssClass;
                }
            }
            options.onshown = that.mergeFunc(options.onshown, function () {
                $('input').attr('autocomplete','off');
                that.refreshInputEvent();
            }, 'merge');

            var dialogObj = new BootstrapDialog(options);
            return dialogObj;
        },
        /***
         * 合并函数
         * @param oldFunc   旧函数
         * @param newFunc   新函数
         * @param type      合并类型：merge-合并执行；append-返回结果追加
         * @param args0
         * @param args1
         * @param args2
         * @param args3
         * @param args4
         */
        mergeFunc : function (oldFunc, newFunc, type) {
            var temp = oldFunc;
            return function (args0, args1, args2, args3, args4) {
                if (type == 'merge') {
                    if (typeof temp == 'function') {
                        temp(args0, args1, args2, args3, args4);
                    }
                    if (typeof newFunc == 'function') {
                        newFunc(args0, args1, args2, args3, args4);
                    }
                } else if (type == 'append') {
                    if (typeof temp == 'function') {
                        args0 = temp(args0, args1, args2, args3, args4);
                        return (typeof newFunc == 'function') ? newFunc(args0, args1, args2, args3, args4) : args0;
                    }
                }
            };
        },
        refreshInputEvent :function(){
            var that = this;
            $('.input').each(function(){
                if($(this).next('.fa-times').length === 0
                    && !$(this).hasClass('date-picker')
                    && !$(this).hasClass('refInput')
                    && !$(this).hasClass('fileNameInput')
                    && !$(this).prop('readonly')
                    && !$(this).prop('disabled')
                    && !$(this).hasClass('no-deletion')){
                    $(this).after('<i class="fa fa-times" style="width: 20px;margin-left: -20px;color: #ccc;font-size:12px;display: none;cursor: pointer;z-index: 10"></i>');

                    var $input = $(this);
                    var clearBtn = $(this).next('.fa-times');
                    var timeout = null;
                    $input.on('mouseover',function(){
                        clearTimeout(timeout);
                        if(that.isNotBlank($(this).val())){
                            clearBtn.show();
                        }
                    }).on('mouseleave',function(){
                        timeout = setTimeout(function(){
                            clearBtn.hide();
                        },100);
                    });
                    clearBtn.on('mouseover',function(){
                        clearTimeout(timeout);
                    }).on('mouseleave',function(){
                        timeout = setTimeout(function(){
                            clearBtn.hide();
                        },100);
                    }).on('click',function(){
                        $input.val('');
                        clearBtn.hide();
                    })
                }
            })
        },
        ajaxData : function (url, type, params, callback, $btn, dataType, flag, contentType, loading) {
            var that = this;
            params = params || '';
            type = type || 'GET';
            dataType = dataType || 'json';
            flag = flag || false;
            contentType = contentType || "application/x-www-form-urlencoded";
            loading = loading === false ? false : true;

            //防止xss攻击
            if (params) {
                for (var i in params) {
                    params[i] = this.xss(params[i]);
                }
            }

            // if (loading) this.loading();
            if($btn) $btn.prop('disabled','disabled');
            $.ajax({
                url: url,
                data: contentType.indexOf('json') > 0 ? JSON.stringify(params) : params,
                dataType: dataType,
                type: type,
                async: true,
                cache: false,
                contentType: contentType,
                success: function (result) {
                    that.unloading();
                    if($btn) $btn.prop('disabled','');
                    if(typeof callback === 'function') callback(result, url, params);
                },
                error: function (e) {
                    that.unloading();
                    if($btn) $btn.prop('disabled','');
                    if (flag) {
                        if(typeof callback === 'function') callback('error', url, params);
                        that.tips('error!', '请求失败！', 'error');
                        // console.log(e);
                    }
                },
                complete:function(e){
                    if(that.isNotBlank(e.responseText) && e.responseText.indexOf('__login_page__') !== -1){
                        that.LoginTimeout();
                    }
                }
            });
        },
        // unloading : function () {
        //     $(parent.document).find('.loading-flash').hide();
        //     // {top: '-100px'}, 'fast', function () {
        //     //     $(this).hide()
        //     // }
        // },

        // loading : function () {
        //     $(parent.document).find('.loading-flash').show();//.animate({top: '60px'}, 'fast')
        // },
        /**
         * 刷新tip事件
         */
        refreshTipsEvent : function () {
            var that = this;
            $('.hover-show-tip').off('mouseover').on('mouseover', function (e) {
                var offset =$(this).offset();
                if (this.offsetWidth < this.scrollWidth && $(this).find('.hover-tip-content').length <= 0) {
                    var text = $(this).text();
                    var sign = that.randomChar() + '_tips';
                    $(this).attr('data-sign',sign);
                    $('body').append('<span class="hover-tip-content"  data-sign="'+ sign +'"' +
                        'style="left:' + (parseInt(offset.left) + 15) + 'px;top:'+(parseInt(offset.top) + 25) +'px">' + text + '</span>')
                }
            }).off('mouseout').on('mouseout', function () {
                $('.hover-tip-content[data-sign="'+$(this).attr('data-sign')+'"]').remove();
            });
        },
        createTable2:function(target, options) {
        var that = this;
        var tableObj = null;
        var DEFAULT = {
            // 基本
            url: '',
            method: '',
            dataField: "",
            sidePagination: "client",
            onLoadSuccess: function () {
            },
            onPostBody: function () {
            },
            onLoadError: function () {
            },
            columns: [],
            escape: true,
            // 分页
            smartDisplay: false,
            pagination: true,
            pageSizeEditable: true,
            paginationLoop: false,
            showPaginationSwitch: false,
            pageSize: 25,
            pageNumber: 1,
            pageList: [15, 30, 50, 100],
            paginationHAlign: 'right',
            paginationDetailHAlign: 'right',
            showPaginationPage: true,
            // 其他
            classes: 'table table-no-bordered table-striped table-hover-row',
            locale: "zh-CN",
            contentType: 'application/json',
            dataType: 'json',
            undefinedText: ' ',
            cache: false,
            striped: true,
            search: false,
            showRefresh: false,
            clickToSelect: false,
            showHeader: true,
            showFooter: false,
            //行样式
            rowStyle: function (row, index) {
                return {
                    css: {
                        'font-size': '12px',
                        'height': '30px',
                        'color': '#757575'
                    }
                }
            },
            formatNoMatches: function () {
                return '无符合条件的记录';
            },
            onClickRow: function (item, $element) {
                return false;
            },
            queryParams: function (params) {
                return params;
            },
            responseHandler: function (data) {
                return data;
            },

            //行展开
            rowsCanOpen: false,
            rowsOpenUseParentDom: true,
            rowsOpenDefineOpenDom: null,
            rowsOpenUrl: '',
            rowsOpenDataField: "",
            rowsOpenQueryParams: function (params) {
                return params
            },
            rowsOpenResponseHandler: function (res) {
                return res
            }
        };

        //合并默认配置
        tableObj = $('#' + target);
        options = $.extend({}, DEFAULT, options);
        options.queryParams = that.mergeFunc(function (params) {
            // Com.ajaxData(Com.getRootPath() + '/userInfo');
            var page = {
                pageSize: params.limit,
                pageNum: (parseInt(params.offset) / parseInt(params.limit) ) + 1,
                order: {}
            };
            if (typeof params.sort !== 'undefined') {
                page.order[params.sort] = params.order;
            }
            return {page: page};
        }, options.queryParams, 'append');

        options.onPostBody = that.mergeFunc(options.onPostBody, function (e) {
            that.refreshTipsEvent();
            if(options.striped){
                $('#' + target).parent('.fixed-table-body').addClass('striped');
            }
        }, 'merge');

        if (options.rowsCanOpen) {
            options.onClickRow = that.mergeFunc(options.onClickRow, openRow, 'merge');
        }

        for (var i in options.columns) {
            if (that.isArray(options.columns[i])) {
                options.columns[i].forEach(function (item, index) {
                    options.columns[i][index] = $.extend({}, buildColumn(item), item);
                })
            } else {
                options.columns[i] = $.extend({}, buildColumn(options.columns[i]), options.columns[i]);
            }
        }

        create(target, options);

        function create(id, option) {
            $('#'+id).bootstrapTable('destroy').empty();
            $('#' + id).bootstrapTable(option);
        }

        function buildColumn(item) {
            if (item.checkbox || item.radio) {
                return {
                    align: "left",
                    valign: "middle"
                }
            }

            var _formatter = formatter;
            if (typeof item.formatter == 'function') {
                var funcTemp = item.formatter;
                _formatter = function (value, row, field) {
                    return '<div class="hover-show-tip">' + funcTemp(value, row, field) + '</div>';
                };
            }

            return {
                align: "left",
                valign: "middle",
                formatter: _formatter
            };

            function formatter(value, row, index) {
                var _w = '';
                if (that.isNotBlank(item.width)) {
                    var width = item.width.toString();
                    width = width.indexOf('px') !== -1 ? width.substr(0, width.indexOf('px')) : width;
                    _w = (parseInt(width) - 16) + 'px';
                }
                // var w = Com.isBlank(item.width) ? '' :
                //     (item.width.toString().indexOf('px') > 0 ) ? item.width : (item.width + 'px');
                return '<div class="hover-show-tip " style="width: ' + _w + ';">' + (that.isNotBlank(value) || value == '0' ? value : options.undefinedText) + '</div>';
            }
        }

        that.openRow = function (row, $element, field) {
            openRow(row, $element, field);
        };

        function openRow(row, $element, field) {
            tableObj = $('#' + $element.parents('table').attr('id'));
            var willOpenTableOption = tableObj.bootstrapTable('getOptions');
            // /*若设置options = willOpenTableOption第二次则无法展开，故新建1个变量，部分赋旧值*/
            options.rowsOpenUrl = willOpenTableOption.rowsOpenUrl;
            options.method = willOpenTableOption.method;
            options.rowsOpenDataField = willOpenTableOption.rowsOpenDataField;
            options.rowsOpenUseParentDom = willOpenTableOption.rowsOpenUseParentDom;
            options.columns = willOpenTableOption.columns;
            options.rowsOpenQueryParams = willOpenTableOption.rowsOpenQueryParams;
            options.onLoadSuccess = willOpenTableOption.onLoadSuccess;
            options.onPostBody = willOpenTableOption.onPostBody;
            var hasSubTable = tableObj.find('tr[data-index=' + $element.attr('data-index') + ']').next().hasClass('sub-table-panel');

            tableObj.find('.sub-table-panel').remove();
            if (hasSubTable) {
                return false;
            }

            $element.after('<div class="sub-table-panel" style="width: ' + tableObj.width() + 'px;position: absolute;left: 0"></div>');

            if (options.rowsOpenUrl && options.rowsOpenUrl.length) {
                that.ajaxData(options.rowsOpenUrl, options.method, options.rowsOpenQueryParams(row), function (data) {
                    data = options.rowsOpenResponseHandler(data);
                    if (options.rowsOpenDataField != "" && options.rowsOpenDataField != undefined && options.rowsOpenDataField) {
                        data = data[options.rowsOpenDataField];
                    }
                    options.rowsOpenUseParentDom ? initSubTable(data)
                        : tableObj.find('.sub-table-panel').append(options.rowsOpenDefineOpenDom(row, $element, field, data));
                }, null, options.dataType, null, options.contentType);
            } else {
                options.rowsOpenUseParentDom ? initSubTable(row.children)
                    : tableObj.find('.sub-table-panel').append(options.rowsOpenDefineOpenDom(row, $element, field));
            }

            function initSubTable(data) {
                if (that.isArray(data)) {
                    tableObj.find('.sub-table-panel').append('<table id="tempTable"></table>');
                    $('#tempTable').css({width: tableObj.width(), 'table-layout': 'auto'});
                    var newColumns = [];
                    options.columns[0].forEach(function (item) {
                        var c = $.extend({}, buildColumn(item), item);
                        if (c.checkbox || c.radio) {
                            c.width = 45;
                            c.checkbox = false;
                            c.radio = false;
                        }
                        newColumns.push(c);
                    });
                    var opt = {
                        url: '',
                        data: data,
                        columns: newColumns,
                        showHeader: false,
                        pagination: false,
                        height: (data.length * 40 > 250 ? 250 : ''),
                        onLoadSuccess: options.onLoadSuccess,
                        onPostBody: options.onLoadSuccess
                    };
                    opt = $.extend({}, options, opt);
                    opt.onClickRow = function () {
                        return false;
                    };
                    opt.queryParams = null;
                    create('tempTable', opt);
                }
            }
        }
            return that;
    },
        cascader:function(cfg){
            var that = this;
            var timer = null;
            var template = '<div class="cascader-menus" style="display:none;"><div></div></div>';
            $(cfg.target).find('.cascader-menus').remove();
            $(cfg.target).append(template);
            bindEvents();
            //初始化值
            if(typeof cfg.setValueCallback == "function"){
                cfg.setValueCallback ();
                //有值显示可以删除的符号
                if( $(cfg.target).find('.cascader-selecter-title').text()== -1 ){
                    return;
                }
                $(cfg.target).find('.glyphicon-menu-down').hide();
                $(cfg.target).find('.glyphicon-remove').show().unbind().bind('click', function (e) {
                    e.stopPropagation();
                    $(cfg.target).find('li').removeClass('active');
                    $(cfg.target).find('.cascader-selecter-btn').prop('title', '请选择...');
                    $(cfg.target).find('.cascader-selecter-title').text('-1');
                    $(cfg.target).find('.cascader-selecter-btn').attr('data-id','-1');
                    $(cfg.target).find('.cascader-menus').hide();

                    $(cfg.target).find('.glyphicon-remove').hide();
                    $(cfg.target).find('.glyphicon-menu-down').show();
                    if(typeof  cfg.removeCallBack == "function"){
                        cfg.removeCallBack();
                    }

                });
            }

            function createElement(param,target){
                var array = getTreeContents(param);
                if(array.length == 0){
                    return;
                }
                //指定流程要多选
                // 下拉框要多选的时候
               /* if(param.userId == "root"){
                    var html = '<ul style="width: 250px;">';
                    for (var i in array) {
                        html += '<li class="' + (array[i].leaf==true ? ' hadChildren' : ' ') + '" data-value="' + array[i].oid + '" title="' + array[i].text + '"><div><input style="vertical-align: middle; margin-left:10px;" type="checkbox">&nbsp;&nbsp;<span style="vertical-align:middle;">' + array[i].text + '</span></div>' +
                            '</li>'
                    }
                    html += "</ul>";
                    $('.cascader-menus > div').append(html);
                    bindCheckBoxEvents();
                }else{*/
                    var html = '<ul>';
                    // for (var i in array) {
                    //     html += '<li class="' + (array[i].leaf==true ? ' ' : 'hadChildren') + '" data-value="' + array[i].oid + '" title="' + array[i].text + '"><a><span>' + array[i].text + '</span></a>' +
                    //         (array[i].leaf ==true ? '':'<i class="glyphicon glyphicon-menu-right right-arrow"></i>') +
                    //         '</li>'
                    // }
                    for (var i in array) {
                        html += '<li class="' + (array[i].count==0 ? ' ' : 'hadChildren') + '" data-value="' + array[i].id + '" title="' + array[i].text + '"><a><span>' + array[i].text + '</span></a>' +
                            (array[i].leaf ==true ? '':'<i class="glyphicon glyphicon-menu-right right-arrow"></i>') +
                            '</li>'
                    }
                    html += "</ul>";
                    $(target).find('.cascader-menus > div').append(html);
                    bindLiEvents();
                }

           /* }*/
            function getTreeContents(param) {
                var _tree=[];
                that.ajaxSubmit({
                    url:cfg.url,
                    async:false,
                    parameter:JSON.stringify(param),
                    successCallback:function(res){
                        var list=res.data;
                        if(typeof cfg.renderTreeContents =="function"){
                            _tree = cfg.renderTreeContents (list);
                        }
                    }
                });
                return _tree;
            }
            function bindEvents(){
                $(cfg.target).find('button').unbind().bind('click',function(){
                    if($(cfg.target).find('.cascader-menus').is(':hidden')){
                        $(cfg.target).find('.cascader-menus').show();
                        $(cfg.target).find('.cascader-menus > div').empty();
                        createElement(cfg.params,cfg.target);
                    }else{
                        $(cfg.target).find('.cascader-menus').hide();
                        /*当点击框以外的空白地，让下拉选择框消失*/
                        $(document).unbind('mouseup').bind('mouseup',function (e) {
                            if (e.target) {
                                $(cfg.target).find('.cascader-menus').hide();
                            }
                        })
                    }
                });
                /*当点击框以外的空白地，让下拉选择框消失*/
                $(document).unbind('mouseup').bind('mouseup',function (e) {
                    if (e.target) {
                        $(cfg.target).find('.cascader-menus').hide();
                    }
                })
            }
            function bindLiEvents(){
                $(cfg.target).find('li').each(function(){
                    var $li = $(this);
                    $li.unbind().bind('mouseover',function(){
                        clearTimeout(timer);
                        var $this = $(this);
                        if ($this.hasClass('active')) {
                            return;
                        }
                        timer = setTimeout(function () {
                            // 有子项继续展开
                            if ($this.hasClass('hadChildren')) {
                                $this.addClass('active').siblings().removeClass('active');
                                var activeIndex = $this.attr('data-value');
                                //仅仅限于只有一项的参数的

                                //获取子项组织列表liuhf
                                var param = {};
                                for(var key in cfg.params){
                                    param[key]= activeIndex;
                                }
                                //删除当前级之后的数据
                                var index = $this.closest('ul').index();
                                $(cfg.target).find('.cascader-menus ul:gt('+index+')').each(function(){
                                    $(this).remove();
                                });
                                createElement(param,cfg.target);
                            }else{
                                //没有子项删除之前展开的子项
                                $this.removeClass('active').siblings().removeClass('active');
                                var index = $this.closest('ul').index();
                                $(cfg.target).find('.cascader-menus ul:gt('+index+')').each(function(){
                                    $(this).remove();
                                });
                            }
                        }, 300);
                    })
                }).bind('click',function () { //选中记录
                    var $this = $(this);
                    var activeIndex = $this.attr('data-value');
                    var text = $this.text();
                    $(cfg.target).find('.cascader-selecter-btn').prop('title', text);
                    $(cfg.target).find('.cascader-selecter-btn').attr('data-id', activeIndex);
                    $(cfg.target).find('.cascader-selecter-title').text(text);
                    $(cfg.target).find(".cascader-menus").hide();
                    if(typeof cfg.clickCallBack == "function"){
                        cfg.clickCallBack();
                    }
                    //有值显示可以删除的符号
                    $(cfg.target).find('.glyphicon-menu-down').hide();
                        $(cfg.target).find('.glyphicon-remove').show().unbind().bind('click', function (e) {
                        e.stopPropagation();
                        $(cfg.target).find('li').removeClass('active');
                        $(cfg.target).find('.cascader-selecter-btn').prop('title', '请选择...');
                        $(cfg.target).find('.cascader-selecter-title').text('请选择...');
                        $(cfg.target).find('.cascader-selecter-btn').removeAttr('data-id');
                        $(cfg.target).find('.cascader-menus').hide();

                        $(cfg.target).find('.glyphicon-remove').hide();
                        $(cfg.target).find('.glyphicon-menu-down').show();
                        if(typeof  cfg.removeCallBack == "function"){
                            cfg.removeCallBack();
                        }

                    });

                    if(typeof cfg.callback == "function"){
                        cfg.callback();
                    }
                })
            }
            //指定流程多选
            function bindCheckBoxEvents(){
                var titleArray = [];
                var indexArray = [];
                $(cfg.target).find('li').each(function(){
                    var $this = $(this);
                    $this.find('input[type=checkbox]').bind('click',function (event) {
                        var checkbox_val = $(this).prop('checked'); //获取input的值
                        if( checkbox_val === true ){
                            var $this =$(this);
                            var activeIndex = $this.closest('li').attr('data-value');
                            var text = $this.closest('li').attr('title');
                            titleArray.push(text);
                            indexArray .push(activeIndex);
                            $(cfg.target).find('.cascader-selecter-btn').prop('title',titleArray.join(","));
                            $(cfg.target).find('.cascader-selecter-btn').attr('data-id',indexArray.join(","));
                            $(cfg.target).find('.cascader-selecter-title').text(titleArray.join(","));
                            event.stopPropagation();
                            //关闭下拉框
                            // $("#myTabContent").click(function(event) {
                            //     $(cfg.target).find(".cascader-menus").remove();
                            // });
                            //有值显示可以删除的符号
                            $(cfg.target).find('.glyphicon-menu-down').hide();
                            $(cfg.target).find('.glyphicon-remove').show().unbind().bind('click', function (e) {
                                e.stopPropagation();
                                $(cfg.target).find('li').removeClass('active');
                                $(cfg.target).find('.cascader-selecter-btn').prop('title', '请选择...');
                                $(cfg.target).find('.cascader-selecter-title').text('请选择...');
                                $(cfg.target).find('.cascader-selecter-btn').removeAttr('data-id');
                                $(cfg.target).find('.cascader-menus').hide();

                                $(cfg.target).find('.glyphicon-remove').hide();
                                $(cfg.target).find('.glyphicon-menu-down').show();

                                if(typeof  cfg.removeCallBack == "function"){
                                    cfg.removeCallBack();
                                }
                            });
                            if(typeof cfg.callback == "function"){
                                cfg.callback();
                            }
                        }else if(checkbox_val === false){
                            var $this =$(this);
                            var activeIndex = $this.closest('li').attr('data-value');
                            var text = $this.closest('li').attr('title');
                            titleArray.splice($.inArray(text,titleArray),1);
                            indexArray.splice($.inArray(activeIndex,indexArray),1);
                            $(cfg.target).find('.cascader-selecter-btn').prop('title',titleArray.join(","));
                            $(cfg.target).find('.cascader-selecter-btn').attr('data-id',indexArray.join(","));
                            $(cfg.target).find('.cascader-selecter-title').text(titleArray.join(","));
                            event.stopPropagation();
                            //关闭下拉框
                            // $("#myTabContent").click(function(event) {
                            //     $(cfg.target).find(".cascader-menus").remove();
                            // });
                            //有值显示可以删除的符号
                            $(cfg.target).find('.glyphicon-menu-down').hide();
                            $(cfg.target).find('.glyphicon-remove').show().unbind().bind('click', function (e) {
                                e.stopPropagation();
                                $(cfg.target).find('li').removeClass('active');
                                $(cfg.target).find('.cascader-selecter-btn').prop('title', '请选择...');
                                $(cfg.target).find('.cascader-selecter-title').text('请选择...');
                                $(cfg.target).find('.cascader-selecter-btn').removeAttr('data-id');
                                $(cfg.target).find('.cascader-menus').hide();

                                $(cfg.target).find('.glyphicon-remove').hide();
                                $(cfg.target).find('.glyphicon-menu-down').show();

                                if(typeof  cfg.removeCallBack == "function"){
                                    cfg.removeCallBack();
                                }
                            });
                            if(typeof cfg.callback == "function"){
                                cfg.callback();
                            }
                        }
                    });
                });
            }
        },
        // 父代码的下拉选择框（区别于上面cascader-menus不同，leaf不同，两项参数）
        cascader1:function(cfg){
            var that = this;
            var timer = null;
            var template = '<div class="cascader-menus1" style="display:none;"><div></div></div>';
            $(cfg.target).find('.cascader-menus1').remove();
            $(cfg.target).append(template);
            bindEvents();
            function createElement(param,target){
                var array = getTreeContents(param);
                if(array.length == 0){
                    return;
                }
                //指定流程要多选
                /*if(param.userId == "root"){
                    var html = '<ul style="width: 250px;">';
                    for (var i in array) {
                        html += '<li class="' + (array[i].leaf==false ? ' hadChildren' : ' ') + '" data-value="' + array[i].id + '" title="' + array[i].text + '"><div><input style="vertical-align: middle; margin-left:10px;" type="checkbox">&nbsp;&nbsp;<span style="vertical-align:middle;">' + array[i].text + '</span></div>' +
                            '</li>'
                    }
                    html += "</ul>";
                    $('.cascader-menus1 > div').append(html);
                    bindCheckBoxEvents();
                }else{*/
                    var html = '<ul>';
                    for (var i in array) {
                        html += '<li class="' + (array[i].leaf=='false' ? ' hadChildren' : ' ') + '" data-value="' + array[i].id + '" title="' + array[i].text + '"><a><span>' + array[i].text + '</span></a>' +
                            (array[i].leaf=='false' ? '<i class="glyphicon glyphicon-menu-right right-arrow"></i>' : '') +
                            '</li>'
                    }
                    html += "</ul>";
                    $(target).find('.cascader-menus1 > div').append(html);
                    bindLiEvents();
                }

            /*}*/
            function getTreeContents(param) {
                var _tree=[];
                that.ajaxSubmit({
                    url:cfg.url,
                    async:false,
                    parameter:JSON.stringify(param),
                    successCallback:function(res){
                        var list=res.data;
                        if(typeof cfg.renderTreeContents =="function"){
                            _tree = cfg.renderTreeContents (list);
                        }
                    }
                });
                return _tree;
            }
            function bindEvents(){
                $(cfg.target).find('button').unbind().bind('click',function(){
                    if($(cfg.target).find('.cascader-menus1').is(':hidden')){
                        $(cfg.target).find('.cascader-menus1').show();
                        $(cfg.target).find('.cascader-menus1 > div').empty();
                        createElement(cfg.params,cfg.target);
                    }else{
                        $(cfg.target).find('.cascader-menus1').hide();
                        /*当点击框以外的空白地，让下拉选择框消失*/
                        $(document).mouseup(function (e) {
                            if (e.target) {
                                $(cfg.target).find('.cascader-menus1').hide();
                            }
                        })
                    }
                });
            }
            function bindLiEvents(){
                $(cfg.target).find('li').each(function(){
                    var $li = $(this);
                    $li.unbind().bind('mouseover',function(){
                        clearTimeout(timer);
                        var $this = $(this);
                        if ($this.hasClass('active')) {
                            return;
                        }
                        timer = setTimeout(function () {
                            // 有子项继续展开
                            if ($this.hasClass('hadChildren')) {
                                $this.addClass('active').siblings().removeClass('active');
                                var activeIndex = $this.attr('data-value');
                                //仅仅限于只有一项的参数的
                                var param = {};
                                for(var key in cfg.params){
                                    param[key]= activeIndex;
                                }
                                //删除当前级之后的数据
                                var index = $this.closest('ul').index();
                                $(cfg.target).find('.cascader-menus1 ul:gt('+index+')').each(function(){
                                    $(this).remove();
                                });
                                createElement(param,cfg.target);
                            }else{
                                //没有子项删除之前展开的子项
                                $this.removeClass('active').siblings().removeClass('active');
                                var index = $this.closest('ul').index();
                                $(cfg.target).find('.cascader-menus1 ul:gt('+index+')').each(function(){
                                    $(this).remove();
                                });
                            }
                        }, 300);
                    })
                }).bind('click',function () { //选中记录
                    var $this = $(this);
                    var activeIndex = $this.attr('data-value');
                    var text = $this.text();
                    $(cfg.target).find('.cascader-selecter-btn').prop('title', text);
                    $(cfg.target).find('.cascader-selecter-btn').attr('data-id', activeIndex);
                    $(cfg.target).find('.cascader-selecter-title1').text(text);
                    $(cfg.target).find(".cascader-menus1").hide();
                    //有值显示可以删除的符号
                    $(cfg.target).find('.glyphicon-menu-down').hide();
                    $(cfg.target).find('.glyphicon-remove').show().unbind().bind('click', function (e) {
                        e.stopPropagation();
                        $(cfg.target).find('li').removeClass('active');
                        $(cfg.target).find('.cascader-selecter-btn').prop('title', '-1');
                        $(cfg.target).find('.cascader-selecter-title1').text('-1');
                        $(cfg.target).find('.cascader-selecter-btn').removeAttr('data-id','-1');
                        $(cfg.target).find('.cascader-menus1').hide();

                        $(cfg.target).find('.glyphicon-remove').hide();
                        $(cfg.target).find('.glyphicon-menu-down').show();
                        if(typeof  cfg.removeCallBack == "function"){
                            cfg.removeCallBack();
                        }

                    });

                    if(typeof cfg.callback == "function"){
                        cfg.callback();
                    }
                })
            }
            //指定流程多选
            function bindCheckBoxEvents() {
                var titleArray = [];
                var indexArray = [];
                $(cfg.target).find('li').each(function () {
                    var $this = $(this);
                    $this.find('input[type=checkbox]').bind('click', function (event) {
                        var checkbox_val = $(this).prop('checked'); //获取input的值
                        if (checkbox_val === true) {
                            var $this = $(this);
                            var activeIndex = $this.closest('li').attr('data-value');
                            var text = $this.closest('li').attr('title');
                            titleArray.push(text);
                            indexArray.push(activeIndex);
                            $(cfg.target).find('.cascader-selecter-btn').prop('title', titleArray.join(","));
                            $(cfg.target).find('.cascader-selecter-btn').attr('data-id', indexArray.join(","));
                            $(cfg.target).find('.cascader-selecter-title1').text(titleArray.join(","));
                            event.stopPropagation();
                            //关闭下拉框
                            // $("#myTabContent").click(function (event) {
                            //     $(cfg.target).find(".cascader-menus1").hide();
                            // });
                            //有值显示可以删除的符号
                            $(cfg.target).find('.glyphicon-menu-down').hide();
                            $(cfg.target).find('.glyphicon-remove').show().unbind().bind('click', function (e) {
                                e.stopPropagation();
                                $(cfg.target).find('li').removeClass('active');
                                $(cfg.target).find('.cascader-selecter-btn').prop('title', '请选择...');
                                $(cfg.target).find('.cascader-selecter-title1').text('请选择...');
                                $(cfg.target).find('.cascader-selecter-btn').removeAttr('data-id');
                                $(cfg.target).find('.cascader-menus1').hide();

                                $(cfg.target).find('.glyphicon-remove').hide();
                                $(cfg.target).find('.glyphicon-menu-down').show();

                                if (typeof cfg.removeCallBack == "function") {
                                    cfg.removeCallBack();
                                }
                            });
                            if (typeof cfg.callback == "function") {
                                cfg.callback();
                            }
                        } else if (checkbox_val === false) {
                            var $this = $(this);
                            var activeIndex = $this.closest('li').attr('data-value');
                            var text = $this.closest('li').attr('title');
                            titleArray.splice($.inArray(text, titleArray), 1);
                            indexArray.splice($.inArray(activeIndex, indexArray), 1);
                            $(cfg.target).find('.cascader-selecter-btn').prop('title', titleArray.join(","));
                            $(cfg.target).find('.cascader-selecter-btn').attr('data-id', indexArray.join(","));
                            $(cfg.target).find('.cascader-selecter-title').text(titleArray.join(","));
                            event.stopPropagation();
                            //关闭下拉框
                            // $("#myTabContent").click(function (event) {
                            //     $(cfg.target).find(".cascader-menus1").hide();
                            // });
                            //有值显示可以删除的符号
                            $(cfg.target).find('.glyphicon-menu-down').hide();
                            $(cfg.target).find('.glyphicon-remove').show().unbind().bind('click', function (e) {
                                e.stopPropagation();
                                $(cfg.target).find('li').removeClass('active');
                                $(cfg.target).find('.cascader-selecter-btn').prop('title', '请选择...');
                                $(cfg.target).find('.cascader-selecter-title1').text('请选择...');
                                $(cfg.target).find('.cascader-selecter-btn').removeAttr('data-id');
                                $(cfg.target).find('.cascader-menus1').hide();
                                $(cfg.target).find('.glyphicon-remove').hide();
                                $(cfg.target).find('.glyphicon-menu-down').show();

                                if (typeof cfg.removeCallBack == "function") {
                                    cfg.removeCallBack();
                                }
                            });
                            if (typeof cfg.callback == "function") {
                                cfg.callback();
                            }
                        }
                    });
                });
            }
        },
        showtoast:function(shortCutFunction,msg,title){
            toastr.options = {
                closeButton: true,
                debug: false,
                extendedTimeOut: "1000", //加长展示时间
                hideDuration: "800",//消失的动画时间
                hideEasing: "linear",
                hideMethod: "fadeOut",
                onclick: null,
                positionClass: "toast-top-right",
                preventDuplicates: false,
                progressBar: true,
                showDuration: "400",//显示的动画时间
                showEasing: "swing",
                showMethod: "fadeIn",
                timeOut: "800",//展现时间
            };
            toastr[shortCutFunction](msg, title);
        },
        //视图配置-标准视图配置-指定流程多选
        cascader2:function(cfg){
            var that = this;
            var timer = null;
            var template = '<div class="cascader-menus" style="display:none;"><div></div></div>';
            $(cfg.target).find('.cascader-menus').remove();
            $(cfg.target).append(template);
            bindEvents();
            createElement(cfg.params,cfg.target);
            function createElement(param,target){
                var array = getTreeContents(param);
                if(array.length == 0){
                    return;
                }
                //指定流程要多选
                // 下拉框要多选的时候
                var html = '<ul style="width: 310px;">';
                html+='<li class="li_list" data-value="-1" title="所有"><div><label style="vertical-align:middle;"><input style="text-align: center; margin:0 10px 0 20px;" type="checkbox">所有</label></div></li>';
                for (var i in array) {
                    html += '<li class="li_list" data-value="' + array[i].oid + '" title="' + array[i].text + '"><div><label style="vertical-align:middle;"><input style="text-align: center; margin:0 10px 0 20px;" type="checkbox">' + array[i].text + '</label></div>' +
                        '</li>'
                }
                html += "</ul>";
                $(target).find('.cascader-menus > div').append(html);
                bindCheckBoxEvents();

            }
            function getTreeContents(param) {
                var _tree=[];
                that.ajaxSubmit({
                    url:cfg.url,
                    async:false,
                    parameter:JSON.stringify(param),
                    successCallback:function(res){
                        var list=res.data;
                        if(typeof cfg.renderTreeContents =="function"){
                            _tree = cfg.renderTreeContents (list);
                        }
                    }
                });
                return _tree;
            }
            function bindEvents(){
                $(cfg.target).find('button').unbind().bind('click',function(){
                    if($(cfg.target).find('.cascader-menus').is(':hidden')){
                        $(cfg.target).find('.cascader-menus').show();
                        // $(cfg.target).find('.cascader-menus > div').empty();
                        // createElement(cfg.params,cfg.target);
                    }else{
                        $(cfg.target).find('.cascader-menus').hide();
                    }

                });
                /*当点击框以外的空白地，让下拉选择框消失*/
                $(document).unbind('mouseup').bind('mouseup',function (e) {
                    if($(e.target).parents('li').hasClass("li_list")==false){
                        $(cfg.target).find('.cascader-menus').hide();
                    }
                })
            }
            //指定流程多选
            function bindCheckBoxEvents(){
                var titleArray = [];
                var indexArray = [];
                $(cfg.target).find('li').each(function(){
                    var $this = $(this);
                    $this.find('input[type=checkbox]').bind('click',function (event) {
                        var checkbox_val = $(this).prop('checked'); //获取input的值
                        if( checkbox_val === true ){
                            var $this =$(this);
                            var activeIndex = $this.closest('li').attr('data-value');
                            var text = $this.closest('li').attr('title');
                            titleArray.push(text);
                            indexArray .push(activeIndex);
                            $(cfg.target).find('.cascader-selecter-btn').prop('title',titleArray.join(","));
                            $(cfg.target).find('.cascader-selecter-btn').attr('data-id',indexArray.join(","));
                            $(cfg.target).find('.cascader-selecter-title').text(titleArray.join(","));
                            event.stopPropagation();
                            //有值显示可以删除的符号
                            $(cfg.target).find('.glyphicon-menu-down').hide();
                            $(cfg.target).find('.glyphicon-remove').show().unbind().bind('click', function () {
                                titleArray = [];
                                indexArray = [];
                                $(cfg.target).find('li').each(function () {
                                    var $this=$(this).find('input:checkbox');
                                    $this.prop("checked",false);
                                    // console.log($this.prop("checked"));

                                });
                                $(cfg.target).find('.cascader-selecter-btn').prop('title', '请选择...');
                                $(cfg.target).find('.cascader-selecter-title').text('请选择...');
                                $(cfg.target).find('.cascader-selecter-btn').removeAttr('data-id');
                                // $(cfg.target).find('.cascader-menus').hide();

                                $(cfg.target).find('.glyphicon-remove').hide();
                                $(cfg.target).find('.glyphicon-menu-down').show();

                                if(typeof  cfg.removeCallBack == "function"){
                                    cfg.removeCallBack();
                                }
                            });
                            if(typeof cfg.callback == "function"){
                                cfg.callback();
                            }
                        }else if(checkbox_val === false){
                            var $this =$(this);
                            var activeIndex = $this.closest('li').attr('data-value');
                            var text = $this.closest('li').attr('title');
                            titleArray.splice($.inArray(text,titleArray),1);
                            indexArray.splice($.inArray(activeIndex,indexArray),1);
                            $(cfg.target).find('.cascader-selecter-btn').prop('title',titleArray.join(","));
                            $(cfg.target).find('.cascader-selecter-btn').attr('data-id',indexArray.join(","));
                            $(cfg.target).find('.cascader-selecter-title').text(titleArray.join(","));
                            event.stopPropagation();

                            //有值显示可以删除的符号
                            $(cfg.target).find('.glyphicon-menu-down').hide();
                            $(cfg.target).find('.glyphicon-remove').show().unbind().bind('click', function () {
                                titleArray = [];
                                indexArray = [];
                                $(cfg.target).find('li').each(function () {
                                    var $this=$(this).find('input:checkbox');
                                    $this.prop("checked",false);
                                    // console.log($this.prop("checked"))
                                });
                                $(cfg.target).find('.cascader-selecter-btn').prop('title', '请选择...');
                                $(cfg.target).find('.cascader-selecter-title').text('请选择...');
                                $(cfg.target).find('.cascader-selecter-btn').removeAttr('data-id');
                                // $(cfg.target).find('.cascader-menus').hide();

                                $(cfg.target).find('.glyphicon-remove').hide();
                                $(cfg.target).find('.glyphicon-menu-down').show();

                                if(typeof  cfg.removeCallBack == "function"){
                                    cfg.removeCallBack();
                                }
                            });
                            if(typeof cfg.callback == "function"){
                                cfg.callback();
                            }
                        }
                    });
                });
            }
        }

};
    return Common;
}));
