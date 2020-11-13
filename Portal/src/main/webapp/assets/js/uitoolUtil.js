var api  = getApiUrl();
var PAGE_EDIT = true; //页面是否为编辑状态
var ITSM_HOME="/ITSM_war_exploded";

//***************
//***auth:suzs***
//***已改好接口***
//***************
var GROUP_URL = api+"/v1/group/getGroupsByParentId1";//工作组树结构
var GRID_DATA = api + '/v1/field/gridFieldQueryMiniui?wfOid=';//表格数据获取接口
var CODE_TREE_COMBO = api + '/v1/code/codeQuery?type=';//树下拉数据源配置接口
var CODE_DATASOURCE = api + '/v1/code/codeQueryForSelect?type=';//选择数据源接口
var CODE_TREE_COMBO_FORGRID = api + '/v1/code/codeQueryForGrid?type=';//选择表格数据源接口

var QUERY_USERNAME = ITSM_HOME+"/configure/workflow/interface/queryUsernameById.jsp";//根据人员ID获取人员名称接口
var PERSON_URL = ITSM_HOME+"/configure/workflow/interface/queryUserList.jsp";//选人页面人员表格接口*
var ORG_URL = ITSM_HOME+"/configure/workflow/interface/queryOrgList.jsp";//组织树结构*
var SELECT_PERSON =  ITSM_HOME+"/page/field/gridUserSelect/selectPerson.jsp";//选人界面接口
// var SELECT_PERSON = ITSM_HOME + "/configure/workflow/interface/selectPerson.jsp";//选人界面接口
var FIELD_DATA = ITSM_HOME + '/configure/workflow/interface/getFieldsFromWorkflow.jsp';//通过表单获取表单所有字段接口
//var FIELD_DATA_TASK = ITSM_HOME + '/configure/workflow/formconfig/getFieldsFromTask.jsp';//通过工单获取字段接口
var FIELD_DATA_TASK = ITSM_HOME + '/configure/workflow/interface/getFieldsFromForm.jsp';//通过工单获取字段接口
var CFG_LINK_URL = ITSM_HOME + '/configure/workflow/interface/configLink.jsp';//配置超链接的地址URL

/**
 * 多行文本
 * @param config
 */
function Text(config){
    if(PAGE_EDIT){
        var obj = mini.get(config.id);
        if (obj){
            if(config.autoFill){
                if(config.value) obj.setValue(config.value);
            }
            obj.setReadOnly(config.readOnly);
            if(!config.nullable) obj.setRequired(true);
            if(config.rowNum!="") obj.setHeight((config.rowNum)*24);//设置多行文本的行数
            if (config.autoTrim){//绑定自动去空的操作
                $(obj.el).find(".mini-textbox-input").on("blur", function (event) {
                    this.value = $.trim(this.value);
                });
            }
        }
    }else{
        $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}

/**
 * 单行文本
 * @param config json
 */
function Input(config){
    if(PAGE_EDIT){
        var obj = mini.get(config.id);
        if (obj){
            if(config.autoFill){
                if(config.value) obj.setValue(config.value);
            }
            obj.setReadOnly(config.readOnly);
            if(!config.nullable) obj.setRequired(true);
            if (config.autoTrim){//绑定自动去空的操作
                $(obj.el).find(".mini-textbox-input").on("blur", function (event) {
                    this.value = $.trim(this.value);
                });
            }
        }
    }else{
        $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}

/**
 * 密码框
 * @param config json
 */
function Password(config){
    if(PAGE_EDIT){
        var obj = mini.get(config.id);
        if (obj){
            if(config.autoFill){
                if(config.value) obj.setValue(config.value);
            }
            obj.setReadOnly(config.readOnly);
            if(!config.nullable) obj.setRequired(true);
        }
    }else{
        $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}

/**
 * 数字框
 * @param config json
 */
function Figure(config){
    if(PAGE_EDIT){
        var obj = mini.get(config.id);
        if (obj){
            if(config.autoFill){
                if(config.value) obj.setValue(config.value);
            }
            obj.setReadOnly(config.readOnly);
            if(!config.nullable) obj.setRequired(true);
            if($.trim(config.formatStr)!="") obj.setFormat(config.formatStr);
        }
    }else{
        $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}

/**
 * 人员框
 * @param config json
 */
function Person(config){
    if(PAGE_EDIT){
        var obj = mini.get(config.id);
        if (obj){


            if(config.autoFill){
                var name = $('#'+config.id+"_hidden").attr("text");
                var id =$('#'+config.id+"_hidden").val();
                obj.setValue(id);
                obj.setText(name);

                // if(config.value){
                //    obj.setValue(config.value);

                // $.ajax({
                //     url : QUERY_USERNAME,
                //     type : 'POST',
                //     data : {userIds:config.value},
                //     //dataType:'JSON',
                //     success : function(data,textStatus,jqXHR){
                //         obj.setValue(config.value);
                //         obj.setText(data);
                //     },
                //     error : function(xhr,textStatus){
                //         mini.alert("请求失败");
                //     }
                // });
                // }
            }



            obj.setReadOnly(config.readOnly);
            if(!config.nullable) obj.setRequired(true);
            obj.on("closeclick",function(){//关闭按钮
                obj.setValue("");
                obj.setText("");
            });
            obj.on("buttonclick",function(){
                var btnEdit = this;
                var TREE_URL = "";

                var callback = function(data){
                    data = mini.clone(data);    //必须
                    if (data) {
                        btnEdit.setValue(data.id);
                        btnEdit.setText(data.name);
                        $('#'+config.id).find('input').trigger('focus').trigger('blur');
                    }
                    btnEdit.doValueChanged();
                };

                if(config.groupBy==3){
                    // TREE_URL = ORG_URL;
                    TREE_URL = api + '/v1/organization/organizationTreeQuery';
                    PERSON_URL = api + '/v1/person/organizationUserQuery';
                    openItsmGroupDialog(config.id,'organization',config.filter,config.singleMode, config.allowSelectGroup,callback);
                }else if (config.groupBy==1){
                    //  TREE_URL = GROUP_URL;
                    TREE_URL = api + '/v1/group/getGroupsByParentId';
                    PERSON_URL = api + "/v1/person/groupUserQuery";
                    openItsmGroupDialog(config.id,'group',config.filter,config.singleMode, config.allowSelectGroup,callback);
                }

                // mini.open({
                //     url: SELECT_PERSON,
                //     title: "选择人员",
                //     width: 900,
                //     height: 600,
                //     allowResize : false,
                //     onload:function(){
                //         var iframe = this.getIFrameEl();
                //         var data = {
                //             singleMode : config.singleMode,
                //             syncMode : config.syncMode,
                //             personUrl : PERSON_URL,
                //             treeUrl : TREE_URL,
                //             groupBy : config.groupBy,
                //             filter : config.filter
                //         };
                //         iframe.contentWindow.SetData(data); //这里调用了新打开页面的SetData方法，将这个页面的data数据传递到了弹出页面中。
                //     },
                //     ondestroy: function (action) {
                //         if (action == "ok") {
                //             var iframe = this.getIFrameEl();
                //             var data = iframe.contentWindow.GetData();
                //             data = mini.clone(data);    //必须
                //             if (data) {
                //                 btnEdit.setValue(data.id);
                //                 btnEdit.setText(data.name);
                //             }
                //         }
                //
                //     }
                // });
            });
        }
    }else{
        $('.box_'+config.id+' .itsm-show').html(config.value);
        var obj = mini.get(config.id);
        var name = $('#'+config.id+"_hidden").attr("text");
        var id =$('#'+config.id+"_hidden").val();
        obj.setValue(id);
        obj.setText(name);
        $('#'+config.id).find('input').trigger('focus').trigger('blur');
    }
}

/**
 * 日期选择框
 * @param config json
 */
function Calendar(config){
    if(PAGE_EDIT){
        var obj = mini.get(config.id);
        if (obj){
            if(config.autoFill){
                if(config.value) obj.setValue(config.value);
            }
            obj.setReadOnly(config.readOnly);
            // if(config.formatStr!=""){
            //      obj.setFormat(config.formatStr);
            //     obj.setShowTime(false);
            // }else{
                if (config.precision=="y"){
                    obj.setFormat("yyyy");
                    obj.setShowTime(false);
                }else if (config.precision=="m"){
                    obj.setFormat("yyyy-MM");
                    obj.setShowTime(false);
                }else if (config.precision=="d"){
                    obj.setFormat("yyyy-MM-dd");
                    obj.setShowTime(false);
                }else if (config.precision=="t"){
                    obj.setFormat("yyyy-MM-dd HH:mm:ss");
                }
            // }
            if(!config.nullable) obj.setRequired(true);
        }
    }else{
        $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}

/**
 * 超文本框
 * @param config json
 */
function Html(config){
    if(PAGE_EDIT){
        //var obj = mini.get(config.id);
        var obj = CKEDITOR.document.getById(config.id);
        if (obj){
            //alert(obj);
            //var editor = CKEDITOR.replace(config.id);
            //if(config.value) editor.setData(config.value);
            if(config.autoFill){
                if(config.value) obj.setHtml(config.value);
            }
            obj.setReadOnly(config.readOnly);
            if(!config.nullable) obj.setRequired(true);
            if (config.autoTrim){//绑定自动去空的操作
                $(obj.el).find(".mini-textbox-input").on("blur", function (event) {
                    this.value = $.trim(this.value);
                });
            }
        }
    }else{
        $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}

/**
 * 单/多选下拉
 * @param config json
 */
function Combo(config){
    if(PAGE_EDIT){
        var obj = mini.get(config.id);
        if (obj){
            if(!config.singleMode){
                obj.setMultiSelect(true);
            }
            if(config.dataSourceType == 'TextDataSource'){
                if(config.data){
                    var dataArr = config.data.split('|');
                    var dataJson = [];
                    for(var i =0;i < dataArr.length; i++){
                        var item = dataArr[i];
                        var dataObj = item.split('=');
                        var key = dataObj[0];
                        var value = dataObj[0];
                        if(dataObj.length==2){
                            value = dataObj[1];
                        }else if(dataObj.length>2){
                            mini.alert("下拉数据源配置错误");
                        }
                        dataJson.push({id:key,text:value});
                    }
                    obj.setData(dataJson);
                }
            }else if(config.dataSourceType == 'RemoteDataSource'){
                if(config.url){
                    obj.setTextField('text');
                    obj.setValueField('id');
                    obj.load(url);
                }
            }else if(config.dataSourceType == 'CodeDataSource'){
                var url = CODE_DATASOURCE + config.data;
                obj.setTextField('text');
                obj.setValueField('id');
                obj.load(url);
            }
            if(config.autoFill){
                if(config.value) obj.setValue(config.value);
            }
            obj.setReadOnly(config.readOnly);
            if(!config.nullable) obj.setRequired(true);
        }
    }else{
        $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}

/**
 * 单选框
 * @param config json
 */
function Radio(config){
    if(PAGE_EDIT){
        var obj = mini.get(config.id);
        if (obj){
            if(config.dataSourceType == 'TextDataSource'){
                if(config.data){
                    var dataArr = config.data.split('|');
                    var dataJson = [];
                    for(var i =0;i < dataArr.length; i++){
                        var item = dataArr[i];
                        var dataObj = item.split('=');
                        dataJson.push({id:dataObj[0],text:dataObj[1]});
                    }
                    obj.setData(dataJson);
                }
            }else if(config.dataSourceType == 'RemoteDataSource'){
                if(config.url){
                    obj.setTextField('text');
                    obj.setValueField('id');
                    obj.load(url);
                }
            }else if(config.dataSourceType == 'CodeDataSource'){
                var url = CODE_DATASOURCE + config.data;
                obj.setTextField('text');
                obj.setValueField('id');
                obj.load(url);
            }
            if(config.autoFill){
                if(config.value) obj.setValue(config.value);
            }
            obj.setReadOnly(config.readOnly);
            obj.setRepeatItems(config.columns);//设置选项排列列数
            if(!config.nullable) obj.setRequired(true);
        }
    }else{
        $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}

/**
 * 多选框
 * @param config json
 */
function Checkbox(config){
    if(PAGE_EDIT){
        var obj = mini.get(config.id);
        if (obj){
            if(config.dataSourceType == 'TextDataSource'){
                if(config.data){
                    var dataArr = config.data.split('|');
                    var dataJson = [];
                    for(var i =0;i < dataArr.length; i++){
                        var item = dataArr[i];
                        var dataObj = item.split('=');
                        dataJson.push({id:dataObj[0],text:dataObj[1]});
                    }
                    obj.setData(dataJson);
                }
            }else if(config.dataSourceType == 'RemoteDataSource'){
                if(config.url){
                    obj.setTextField('text');
                    obj.setValueField('id');
                    obj.load(url);
                }
            }else if(config.dataSourceType == 'CodeDataSource'){
                var url = CODE_DATASOURCE + config.data;
                obj.setTextField('text');
                obj.setValueField('id');
                obj.load(url);
            }
            if(config.autoFill){
                if(config.value) obj.setValue(config.value);
            }
            obj.setReadOnly(config.readOnly);
            obj.setRepeatItems(config.columns);//设置选项排列列数
            if(!config.nullable) obj.setRequired(true);
        }
    }else{
        $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}

/**
 * 树下拉
 * @param config json
 */
function Tree(config){
    if(PAGE_EDIT){
        var obj = mini.get(config.id);
        if (obj){
            if(!config.singleMode){
                obj.setMultiSelect(true);
            }
            if(config.dataSourceType == 'TextDataSource'){
                if(config.data){
                    var dataArr = config.data.split('|');
                    var dataJson = [];
                    for(var i =0;i < dataArr.length; i++){
                        var item = dataArr[i];
                        var dataObj = item.split('=');
                        dataJson.push({id:dataObj[0],text:dataObj[1]});
                    }
                    obj.setData(dataJson);
                }
            }else if(config.dataSourceType == 'RemoteDataSource'){
                if(config.url){
                    obj.setTextField('text');
                    obj.setValueField('id');
                    obj.load(url);
                }
            }else if(config.dataSourceType == 'CodeDataSource'){
                var url = CODE_TREE_COMBO + config.data;
                obj.setTextField('text');
                obj.setValueField('id');
                obj.setParentField('parentId');
                obj.load(url);
            }
            if(config.autoFill){
                if(config.value) obj.setValue(config.value);
            }
            obj.setReadOnly(config.readOnly);
            if(!config.nullable) obj.setRequired(true);
        }
    }else{
        $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}

//链接字段
function Link(config){
    if(PAGE_EDIT){
        //var obj = mini.get(config.id);
        var obj = $("#" + config.id);
        if (obj){
            if(config.autoFill){
                if(config.value) {
                    var text = config.value.split("|_|")[0];
                    var href = config.value.split("|_|")[1];
                    obj.text(text);
                    obj.attr("href",href);
                }
            }
            var _clickObj = mini.get("config-link");
            _clickObj.on("click",function(){
                mini.open({
                    url: CFG_LINK_URL,
                    title: "超链接",
                    width: 300,
                    height: 132,
                    allowResize : false,
                    allowDrag : false,
                    onload:function(){
                        var iframe = this.getIFrameEl();
                        var data = {};
                        iframe.contentWindow.SetData(data); //这里调用了新打开页面的SetData方法，将这个页面的data数据传递到了弹出页面中。
                    },
                    ondestroy: function (action) {
                        if (action == "ok") {
                            var iframe = this.getIFrameEl();
                            var data = iframe.contentWindow.GetData();
                            data = mini.clone(data);    //必须
                            if (data) {
                                obj.text(data.linkName);
                                obj.attr("href",data.linkUrl);
                            }
                        }

                    }
                });
            });
        }
    }else{
        $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}

//CI配置字段
function CI(config){
    if(PAGE_EDIT){
        var obj = mini.get(config.id);
        if (obj){
            if(config.autoFill){
                if(config.value){
                    obj.setValue(config.value);
                }
            }
            obj.setReadOnly(config.readOnly);
            if(!config.nullable) obj.setRequired(true);
            obj.on("closeclick",function(){//关闭按钮
                obj.setValue("");
                obj.setText("");
            });
            obj.on("buttonclick",function(){
                var btnEdit = this;
                var valueParam = config.valueParam;
                mini.open({
                    //url: '../../page/citest.html',//config.selectPage,
                    url:config.selectPage,
                    // url:'http://10.1.192.186/resm/interface/resourceListLocale_NGITSM.jsp?muti=1&searchcode=&hiddenName=ext-comp-1023',
                    title: "弹出页面",
                    width: 900,
                    height: 600,
                    allowResize : true,
                    onload:function(){
                        var iframe = this.getIFrameEl();
                        var data = {
                            singleMode : config.singleMode,
                            valueParam : obj.getValue()
                        };
                       iframe.contentWindow.SetData(data); //这里调用了新打开页面的SetData方法，将这个页面的data数据传递到了弹出页面中。
                    },
                    ondestroy: function (action) {
                        if (action == "ok") {
                            var iframe = this.getIFrameEl();
                            var data = iframe.contentWindow.GetData();
                            var data = mini.clone(data);    //必须
                            if (data) {
                                btnEdit.setValue(data.id);
                                btnEdit.setText(data.name);
                            }
                        }
                    }
                });
            });
        }
    }else{
        $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}

//弹出框字段
function Dialog(config){
    if(PAGE_EDIT){
        var obj = mini.get(config.id);
        if (obj){
            if(config.autoFill){
                if(config.value){
                    obj.setValue(config.value);
                }
            }
            obj.setReadOnly(config.readOnly);
            if(!config.nullable) obj.setRequired(true);
            obj.on("closeclick",function(){//关闭按钮
                obj.setValue("");
                obj.setText("");
            });
            obj.on("buttonclick",function(){
                var btnEdit = this;
                var valueParam = config.valueParam;
                mini.open({
                    url: config.selectPage,
                    title: "弹出页面",
                    width: 900,
                    height: 600,
                    allowResize : false,
                    onload:function(){
                        var iframe = this.getIFrameEl();
                        var data = {
                            singleMode : config.singleMode,
                            valueParam : obj.getValue()
                        };
                        iframe.contentWindow.SetData(data); //这里调用了新打开页面的SetData方法，将这个页面的data数据传递到了弹出页面中。
                    },
                    ondestroy: function (action) {
                        if (action == "ok") {
                            var iframe = this.getIFrameEl();
                            var data = iframe.contentWindow.GetData();
                            data = mini.clone(data);    //必须
                            if (data) {
                                btnEdit.setValue(data.id);
                                btnEdit.setText(data.name);
                            }
                        }

                    }
                });
            });
        }
    }else{
        $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}

/**
 * 表格
 * @param config json
 */
function Grid(config){
    if(PAGE_EDIT){
        var obj = mini.get(config.id);
        if (obj){
            var headColumns = config.headColumns;
            var dataJson = [];
            //	dataJson.push({ type: "indexcolumn" });
            for(var i = 0;i < headColumns.length; i++){
                var item = headColumns[i];
                var columnData = item.columnData;
                var readOnly = columnData.readOnly;//列字段是否只读
                var headJson = {field: item.dataIndex, headerAlign: "center", header: item.name, width: 100,readOnly : readOnly};
                if(columnData.fieldType=='Text'){//多行文本列
                    headJson.editor = { type : 'textarea'};
                }else if (columnData.fieldType=='Input'){//单行输入框列
                    headJson.editor = { type : 'textbox'};
                }else if (columnData.fieldType=='Password'){//密码输入框列
                    headJson.editor = { type : 'password'};
                }else if (columnData.fieldType=='Number'){//数字输入框列
                    headJson.editor = { type : 'spinner'};
                }else if (columnData.fieldType=='Person'){//人员选择框列
                    headJson.type = 'buttoneditcolumn';
                    headJson.displayField = item.dataIndex;
                    var groupBy = columnData.groupBy;
                    var singleMode = columnData.singleMode;
                    var syncMode = columnData.syncMode;
                    var filter = columnData.filter;
                    headJson.editor = { type : 'buttonedit',showClose : "false" };
                    if(!columnData.nullable) headJson.editor.required = true;
                    // headJson.editor.oncloseclick = function(){//关闭按钮
                    //     headJson.editor.value = "";
                    //     headJson.editor.text = "";
                    // };
                    headJson.editor.onbuttonclick = function(){
                        var btnEdit = this;
                        var $tr = $('.mini-grid-cell-selected').find('div');
                        var callback = function(data){
                            data = mini.clone(data);    //必须
                            if (data) {
                                btnEdit.setValue(data.id);
                                btnEdit.setText(data.name);
                                $tr.html(data.name);
                            }
                        };

                        if(groupBy==3){
                            openItsmGroupDialog(callback,'organization',filter,singleMode, syncMode);
                        }else if (groupBy==1){
                            openItsmGroupDialog(callback,'group',filter,singleMode, syncMode);
                        }
                    };


                }else if (columnData.fieldType=='Calendar'){//日期选择框列
                    headJson.editor = { type : 'datepicker', timeFormat : "HH:mm:ss",showTime : 'true'};
                    // if(columnData.formatStr!=""){
                    //     headJson.dateFormat = columnData.formatStr;
                    // }else{
                        if (columnData.precision=="y"){
                            headJson.dateFormat = 'yyyy';
                        }else if (columnData.precision=="m"){
                            headJson.dateFormat = 'yyyy-MM';
                        }else if (columnData.precision=="d"){
                            headJson.dateFormat = 'yyyy-MM-dd';
                        }else if (columnData.precision=="t"){
                            headJson.dateFormat = 'yyyy-MM-dd HH:mm:ss';
                        }
                    // }
                }else if (columnData.fieldType=='Html'){//超文本编辑器列
                    mini.alert("不支持超文本作为表格列，请用单、多行字段代替");
                }else if (columnData.fieldType=='Combo'){//下拉选择框列
                    headJson.type = 'comboboxcolumn';
                    headJson.editor = { type : 'combobox'};
                    if(!columnData.singleMode){
                        headJson.editor.multiSelect = true;//是否多选
                    }
                    if(columnData.dataSourceType == 'TextDataSource'){
                        if(columnData.data){
                            var dataArr = columnData.data.split('|');
                            var dataCombo = [];
                            $.each(dataArr, function (index, dataObj) {
                                var dataA = dataObj.split('=');
                                var key = dataA[0];
                                var value = dataA[0];
                                if(dataA.length==2){
                                    value = dataA[1];
                                }else if(dataA.length>2){
                                    mini.alert("下拉数据源配置错误");
                                }
                                dataCombo.push({id:key,text:value});
                            });
                            headJson.editor.data = dataCombo;
                        }
                    }else if(columnData.dataSourceType == 'RemoteDataSource'){
                        if(columnData.url){
                            headJson.editor.textField = 'text';
                            headJson.editor.valueField = 'id';
                            headJson.editor.url = columnData.url;
                        }
                    }else if(columnData.dataSourceType == 'CodeDataSource'){
                        var url = CODE_DATASOURCE + columnData.data;
                        headJson.editor.textField = 'text';
                        headJson.editor.valueField = 'id';
                        headJson.editor.url = url;
                    }
                }else if (columnData.fieldType=='Radio'){//单选框列
                    mini.alert("单选框组暂不支持作为表格列，请使用单选下拉代替");
                }else if (columnData.fieldType=='Checkbox'){//多选框列
                    mini.alert("多选框组暂不支持作为表格列，请使用多选下拉代替");
                }else if (columnData.fieldType=='Tree'){//树下拉列
                    headJson.type = 'treeselectcolumn';
                    headJson.editor = { type : 'treeselect' };
                    if(!columnData.singleMode){
                        headJson.editor.multiSelect = true;
                    }
                    if(columnData.dataSourceType == 'TextDataSource'){
                        if(columnData.data){
                            var dataArr = columnData.data.split('|');
                            var dataJ = [];
                            for(var i =0;i < dataArr.length; i++){
                                var it = dataArr[i];
                                var dataObj = it.split('=');
                                dataJ.push({id:dataObj[0],text:dataObj[1]});
                            }
                            headJson.editor.data = dataJ;
                        }
                    }else if(columnData.dataSourceType == 'RemoteDataSource'){
                        if(columnData.url){
                            headJson.editor.textField = 'text';
                            headJson.editor.valueField = 'id';
                            headJson.editor.url = columnData.url;
                        }
                    }else if(columnData.dataSourceType == 'CodeDataSource'){
                        var url = CODE_TREE_COMBO_FORGRID + columnData.data;
                        headJson.editor.textField = 'text';
                        headJson.editor.valueField = 'id';
                        headJson.editor.parentField = 'pid';
                        headJson.editor.url = url;
                    }
                    if(!columnData.nullable) headJson.editor.required = true;
                }else if (columnData.fieldType=='File'){//附件选择框列
                    mini.alert("不支持附件上传作为表格列");
                }
                dataJson.push(headJson);
            }


            obj.set({
                columns: dataJson,
                allowAlternating: true, //显示间行色
                multiSelect: true,
                fitColumns: true, //使用过滤行必须设定这个全充满，否则会有列对齐问题。
                allowCellEdit: true,
                allowCellSelect: true,

            });
            // obj.setColumns(dataJson);

            // var addRow = mini.get("add-row");//绑定增加事件
            // addRow.on("click",function(){
            //     var newRow = {};
            //     obj.addRow(newRow, 0);
            // });
            //
            // //绑定删除事件
            // var removeRow = mini.get("remove-row");
            // removeRow.on("click",function(){
            //     var rows = obj.getSelecteds();
            //     if (rows.length > 0) {
            //         obj.removeRows(rows, true);
            //     }
            // });

            //设置点击单元格进入编辑状态次数，单次是cellclick
           // obj.setCellEditAction("celldblclick");
            var wfOid = config.urlParams.wfOid;
            var fieldId = config.urlParams.fieldId;
             var taskOid = (typeof(Global.taskOid)=='undefined')?-1:Global.taskOid;
            obj.setUrl(GRID_DATA + wfOid+'&fieldId='+fieldId+'&taskOid='+taskOid);
            obj.load();
            $('.mini-grid-viewport').css({'height':'273px'});
        }

    }else{
        // $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}


/**
 * 附件上传
 * @param config json
 */
function File(config){

    if(PAGE_EDIT){
        if (config.id){
            if(!config.readOnly){
                //服务器上传
                var uploader=$('#'+config.id).swfupUpload({pick:"#uploaderBtn",auto: true,showType:'text',jsonValField:true, callback:callback,formData:{},showDown:true});

                function callback(status, file, response){
                }

                //判断有没有附件，有附件渲染
                var fo = $('#' + config.id);
                var fileInfo = JSON.parse(fo.attr('file_info'));

                if(fileInfo &&fileInfo[0]&& fileInfo[0].oid!=""){
                    var html =[];
                    if($("div.uploader-list").length == 0){
                        html.push('<div class="uploader-list">');
                    }
                    for(var j = 0;j<fileInfo.length;j++){
                        html.push('<div  class="upload-file-item">');
                        html.push('<span class="web-span webuploadinfo"><span class="web-text">'+fileInfo[j].name+'</span></span>');
                        html.push('<span class="icon-file-down" data-id="'+fileInfo[j].oid+'" title="下载">下载</span>');
                        html.push('</div>');
                    }
                    if($("div.uploader-list").length == 0){
                        html.push('</div>');
                        fo.append(html.join(''));
                    }else{
                        $("div.uploader-list").append(html.join(''));
                    }
                }


                //下载文件
                $('#'+config.id).on('click','.icon-file-down',function(){
                    var id=$(this).attr('data-id');
                    var downFile= api +'/v1/file/download?oid=' + id; //公共模块的下载需要登录的用户id
                    window.location.href= downFile;
                });
                //	obj.setReadOnly(config.readOnly);
                //	if(!config.nullable) obj.setRequired(true);
            }

        }
    }else{
        // $('.box_'+config.id+' .itsm-show').html(config.value);
    }
}

/**
 * 自定义字段
 */
function Custom(){
    $('.url-edit').each(function(){
        var o = $(this);
        $.ajax({
            type: "get",
            url: $(this).html(),
            dataType:'html',
            success: function(html) {
                o.html(html);
                o.show();
            }
        });
    });
}

/**
 * 加载控件
 * @param fs
 */
function loadComponent(fs){

    mini.parse();//将控件解析为miniui，否则miniui方法不能使用

    if(fs) {
        var len = fs.length;
        for (var i = 0; i < len; i++) {
            var o = fs[i];
            var fo = $('#' + o.id);
            if(o.fieldType.id == "Person"){
                o.fieldType = "Person";
            }
            if(o.fieldType.id == "Grid"){
                o.fieldType = "Grid";
            }

            if (fo.length <= 0) continue;
            if (o.fieldType == 'Input') {
                Input(o);
            } else if (o.fieldType == 'Text') {
                Text(o);
            } else if (o.fieldType == 'Link') {
                Link(o);
            } else if (o.fieldType == 'Password') {
                Password(o);
            } else if (o.fieldType == 'Number') {
                Figure(o);
            } else if (o.fieldType == 'Person') {
                Person(o);
            } else if (o.fieldType == 'Calendar') {
                Calendar(o);
            } else if (o.fieldType == 'Html') {
                Html(o);
            } else if (o.fieldType == 'Combo') {
                Combo(o);
            } else if (o.fieldType == 'Radio') {
                Radio(o);
            } else if (o.fieldType == 'Checkbox') {
                Checkbox(o);
            } else if (o.fieldType == 'Tree') {
                Tree(o);
            } else if (o.fieldType == 'File') {
                File(o);
            } else if (o.fieldType == 'Grid') {
                Grid(o);
            } else if (o.fieldType == 'CI') {
                CI(o);
            } else if (o.fieldType == 'Dialog') {
                Dialog(o);
            }
        }
    }

    Custom();
    loadFieldAfter();
}

/**
 * 通过表单加载字段
 * @param wfId
 * @param formid
 */
function ajaxFieldByFormId(wfId,formid){
    $.getJSON(FIELD_DATA,{wfOid:wfId,fromId:formid},function(json){
        loadComponent(json);
    });
}

/**
 *  通过流程加载字段
 * @param {} taskId
 * @param {} dataId
 * @param {} actionId
 */
function ajaxFieldByTaskId(wfOid,taskOid,taskDataId,templateId){
    $.ajax({
        url : FIELD_DATA_TASK,
        async : false,
        type : 'POST',
        data : {wfOid:wfOid,taskOid:taskOid,taskDataId:taskDataId,templateId:templateId},
        dataType:'json',
        success : function(json,textStatus,jqXHR){
            loadComponent(json);
        },
        error : function(xhr,textStatus){
            //mini.alert("请求失败");
            alert("请求失败");
        }
    });
}
/**
 * 在什么之后
 */
function loadFieldAfter(){
    //gridJson(1);
}

function gridJson(id) {
    var jsonArr =[];
    $('.mini-grid-custom').each(function(){
        //alert($(this).attr('id'));
        var grid = mini.get($(this).attr('id'));//此处针对表格组件  id
        var data = grid.getData();
        var json = mini.encode(data);
        jsonArr.push({id:$(this).attr('id'),data:json});
    });
    $('#'+id).val(JSON.stringify(jsonArr));
}

function createGridWeb() {
    $('.mini-grid-custom').each(function(){
        var grid = mini.get($(this).attr('id'));
        var $gridDiv = $("<textarea style='display:none;'></textarea>");
        $gridDiv.attr("id",$(this).attr('id'));
        $gridDiv.attr("name",$(this).attr('id'));
        var $formDiv = $("form");
        $formDiv.append($gridDiv);
        var data = grid.getData();
        var json = mini.encode(data);
        $gridDiv.val(json);
    });
}