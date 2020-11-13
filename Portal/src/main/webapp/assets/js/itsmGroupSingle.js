/**
 * Description: itsm工作组，人员选择
 * 分为：工作组--人员、组织--人员、工作组--工作组、组织--组织
 *      选择人员又可分为单选或多选，
 *      工作组和组织又可分为单选或多选
 **/
var api= getApiUrl();
var tools = new toolUtil();
var shareGroupName = '';
var userid = tools.getQueryString('userId')||tools.getUser();

function buildGroupTreeOption(groupName,regexId) {
    var url = api+'/v1/organization/organizationTreeQuery';
    if(groupName ==='group'){
        // url = api+'/v1/group/getGroupTreeQuery';
        url = api + '/v1/group/getGroupsByParentId';
    }else if(groupName ==='organization'){
        url = api+'/v1/organization/organizationTreeQuery';
    }
    var groupTreeOption = {
        loadType: 'server',
        ajaxType: 'post',
        contentType: 'application/json',
        activeIndex: 'all',
        rightClickable: false,
        checkable: false,
        simpleDataType: true,
        indexField: 'id',                    // 自定义index的key,默认index
        pIndexField: 'pIndex',                  // 自定义pIndex的字段,默认pIndex
        titleField: 'text',
        //url: commonModule.Com.getRootPath()+'/itsm3/group/queryGroupTree',
        url: url,
        queryParams: function (params){
            if(params.index === null || params.index === undefined){
                if(groupName === 'group'){
                    return {
                        userId:userid,
                        parentId:"-1"
                    };
                }else if(groupName === 'organization'){
                    return {
                        includeAll: true,
                        node: '-1',
                        userId:userid,
                    };
                }

            }else{
                return {
                    groupName: groupName,
                    regexId: regexId,
                    includeAll: false,
                    viewGroupLeaf: false,
                    viewGroupChild: true,
                    nodePath: url,
                    node: params.id,
                    userId:userid,
                    parentId: params.id,
                };
            }
        },
        responseHandler: function(result){
            if(result.status ===0){
                $.each(result.data,function (idx,item) {
                    item.isParent = !JSON.parse(item.leaf);
                    // console.log( item.isParent);
                });
                // console.log(result.data);
                return result.data;
            }else{
               /* tools.showtoast("warning",'尚未选择记录');*/
                tools.tips('加载工作组树失败',result.message,'error');
                return [];
            }
        },
        onChange: function (item, state) {
            $('#usernameInputItsm').val(''); //清空搜索输入框
            $('#itsmPersonTable').bootstrapTable('refresh');
        },
        onLoadSuccess: function (treeSelf) {
            if (treeSelf.getAllNodes()[0]) {
                treeSelf.openNodes(treeSelf.getAllNodes()[0].index);
            }
        }
    };
    return groupTreeOption;
}
// var groupTree = new ResoTree();
var groupTree = tools.ResoTree();
var itsmGroupDialogOption = {
    showHeader: false,
    // width: '1140px',
    width: '1000px',
    message: $('<div class="person-main"></div>').load(tools.getRootPath() + '/page/common/itsmGroup.html?r='+new Date().getTime()),
    onhide:function () {
        $('#itsmPersonTable').bootstrapTable('destroy');
    },
    buttons: [
          {
            label: '取消',
            action: function (dialogSelf) {
                dialogSelf.close();
            }
        },
        {
            label: '确定',
            cssClass: 'dialog-confirm-btn',
            action: null
        }
    ]
};

var itsmPersonTableOption = {
    url: api+'/v1/person/groupUserQuery',
    method: 'post',
    dataField: "data",
    sidePagination: "client",  //因为后太的人员接口是不分页的，因此这里通过前台client自己分页
    clickToSelect: true,
    queryParams: function (params) {
        var objId = '';
        if(groupTree.getActiveItem() !== undefined && groupTree.getActiveItem() !== null){
            objId = groupTree.getActiveItem().index;
        }
        if(shareGroupName == "group"){
            return {
                // groupName: shareGroupName,
                groupId:objId,
                objFilter: '/-1/',
                viewGroupLeaf: false,
                jobFilter: '',
                filter: $('#usernameInputItsm').val(),
                userId:userid,
            };

        }else if(shareGroupName == "organization"){
            return {
                //groupName: shareGroupName,
                objId: objId,
                objFilter: '/-1/',
                viewGroupLeaf: false,
                jobFilter: '',
                filter: $('#usernameInputItsm').val(),
                userId:userid,
            };
        }

    },
    columns: [
        {align: "center", width: 30, checkbox: true, clickToSelect: false},
        {field: "id", width: 110, title: "ID"},
        {field: "text", width: 120, title: "名称"},
        {field: "mobile", width: 120, title: "手机"},
        {field: "email", width: 120,title: "邮箱"},
        {field: "gname", width: 100,title: "所属组"},
        {field: "job", width: 90,title: "职务"}
    ],
    responseHandler: function (result) {
        if(result.status === 0){
            return result.data.lgs;
        }else{
            return [];
        }
    }
};
/**
 * @param inputId 人员输入框
 * @param groupName group类型
 * @param regexId 正则Id
 * @param isRadio 是否单选(不传则默认为true=单选)
 **/
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
// 用于关联工单手动关联的流程下拉选择框
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
// 用于工单处理上面的几个弹窗的人员选择
function openItsmGroupDialog(inputId,groupName,regexId,isRadio,callback) {
    shareGroupName = groupName;
    var isRadioVar = isRadio===undefined ? true : isRadio ;
    itsmGroupDialogOption.onshown = function () {
        if(groupName === 'group'){
            $('#Grouping').text("工作组");
            itsmPersonTableOption.url = api+'/v1/person/groupUserQuery';
        }else if(groupName === 'organization'){
            $('#Grouping').text("组织");
            itsmPersonTableOption.url = api+'/v1/person/organizationUserQuery';
        }
        groupTree.initTree('groupTree', buildGroupTreeOption(groupName,regexId));
        itsmPersonTableOption.singleSelect = isRadioVar;
        tools.createTable2("itsmPersonTable", itsmPersonTableOption);
    };
    itsmGroupDialogOption.buttons[1].action = function (dialogSelf) {
        var personArray = $('#itsmPersonTable').bootstrapTable('getAllSelections');
        if(personArray.length === 0){
            tools.showtoast("warning",'尚未选择记录');
            return;
        }
        var titleArray=[];
        var valueArray=[];
        var valueArray1=[];
        $.each(personArray,function (idx,item) {
            titleArray.push(item.gname+'|'+item.text);
            valueArray.push(item.gid+'|'+item.id);
            valueArray1.push(item.text);
        });
        /*console.log(titleArray);
        console.log(valueArray);
        console.log(valueArray1);*/

        if(typeof inputId != "function"){
            $('#'+inputId+' .btn-text').text(titleArray.join(","));
            $('#'+inputId).attr('title',titleArray.join(","));
            $('#'+inputId).attr("data-value",valueArray.join(','));
            $('#'+inputId).val(valueArray1.join(","));
        }else{
            inputId(valueArray1.join(","));
        }

        if(typeof  callback == "function"){
            callback({
                id:valueArray.join(','),
                name:titleArray.join(",")
            });
        }
        dialogSelf.close();
    };

    // new SimpleDialog(itsmGroupDialogOption).open();
    tools.SimpleDialog(itsmGroupDialogOption).open();
}
function cleanUserInput(inputId) {
    $('#'+inputId+' .btn-text').text('请选择...');
    $('#'+inputId).attr('title','');
    $('#'+inputId).attr("data-value",'');
}



function initPersonInputClickAndRemove(inputId) {
    $('#'+inputId).parent().unbind().bind('mouseover', function () {
        if ('请选择...' !== $('#'+inputId+' .btn-text').text()) {
            $(this).find('.more-icon').hide();
            $(this).find('.remove-icon').show();
            $(this).find('.remove-icon').unbind().bind('click', function (e) {
                cleanUserInput(inputId);
            })
        }
    }).bind('mouseout', function () {
        $(this).find('.more-icon').show();
        $(this).find('.remove-icon').hide();
    });
}
/*人员查询组件结束*/


