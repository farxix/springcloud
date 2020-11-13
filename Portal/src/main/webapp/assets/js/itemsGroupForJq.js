/**
 * Description: itsm工作组，人员选择
 * 分为：工作组--人员、组织--人员、工作组--工作组、组织--组织
 *      选择人员又可分为单选或多选，
 *      工作组和组织又可分为单选或多选
 **/
var api  = getApiUrl();
var tools = new toolUtil();
var userid = tools.getQueryString('userId')||tools.getUser();
var shareGroupName = '';

function buildGroupTreeOptionForJq(groupName,regexId) {
    var url = api+'/v1/organization/organizationTreeQuery';
    if(groupName === 'group'){
       url = api+'/v1/group/getGroupTreeQuery';

    }else if(groupName === 'organization'){
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
        url: url,
        queryParams: function (params){
            if(params.index === null || params.index === undefined){
                if(groupName === 'group'){
                    return {
                        includeAll: true,
                        node: '-1',
                        userId:userid,
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
                });
                return result.data;
            }else{
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
var itsmGroupDialogOptionForJq = {
    showHeader: false,
    // width: '1140px',
    width: '1000px',
    message: $('<div class="person-main"></div>').load(tools.getRootPath() + '/page/common/itsmPerson.html?r='+new Date().getTime()),
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
        {field: "id", width: 100, title: "ID"},
        {field: "text", width: 150, title: "名称"},
        {field: "mobile", width: 120, title: "手机"},
        {field: "email", width: 150,title: "邮箱"},
        {field: "gname", width: 80,title: "所属组"},
        {field: "job", width: 60,title: "职务"}
    ],
    responseHandler: function (result) {
        if(result.status === 0){
            return result.data.lgs;
        }else{
            return [];
        }
    },
    onDblClickRow: function (row) {
        var list =  $('#checkPersonTable').bootstrapTable('getData');
        var flag = false;
        $.each(list,function (i,item) {
            if(item.id == row.id && item.text == row.text){
                flag  = true;
            }
        });
        if(flag){ return ;}
        var count = list.length||-1;
        $('#checkPersonTable').bootstrapTable('insertRow', {
            index: count+1,
            row: row
        });
    }
};

var checkPersonTableOption = {
    data:[],
    sidePagination: "client",  //因为后太的人员接口是不分页的，因此这里通过前台client自己分页
    clickToSelect: true,
    pagination:false,
    columns: [
        {field: "id", title: "ID"},
        {field: "text", title: "名称"},
        {field: "gname",title: "所属组"},
        {field: "",title: "操作",formatter: function (value, row, index) {
            return [
                '<span data-id='+row.id+' onclick="delRow(this)" class="operate"><i class="fa fa-remove" aria-hidden="true" name="removeRecord"   ></i>删除</span>'
            ].join('');
        }},
    ],
};


function delRow(dom){
    $('#checkPersonTable').bootstrapTable('remove', {
        field:'id',
        values: [$(dom).attr('data-id')]
    });
}


function queryGroupUserHandler() {
    $('#itsmPersonTable').bootstrapTable('refresh');
}
/**
 * @param inputId 人员输入框
 * @param groupName group类型
 * @param regexId 正则Id
 * @param isRadio 是否单选(不传则默认为true=单选)
 * */
function openItsmGroupDialog_(inputId,groupName,regexId,isRadio,callback) {
    shareGroupName = groupName;
    var isRadioVar = isRadio===undefined ? true : isRadio ;
    itsmGroupDialogOptionForJq.onshown = function () {
        if(groupName === 'group'){
            $('#Grouping').text("工作组");
            itsmPersonTableOption.url = api+'/v1/person/groupUserQuery';
        }else if(groupName === 'organization'){
            $('#Grouping').text("组织");
            itsmPersonTableOption.url = api+'/v1/person/organizationUserQuery';
        }
        groupTree.initTree('groupTree', buildGroupTreeOptionForJq(groupName,regexId));
        itsmPersonTableOption.singleSelect = isRadioVar;
        tools.createTable2("itsmPersonTable", itsmPersonTableOption);
        tools.createTable2("checkPersonTable", checkPersonTableOption);

    };
    itsmGroupDialogOptionForJq.buttons[1].action = function (dialogSelf) {

        var personArray = $('#checkPersonTable').bootstrapTable('getData');
        if(personArray.length === 0){
           tools.showtoast("warning",'尚未选择记录');
            return;
        }
        var titleArray=[];
        var valueArray=[];
        var valueArray1=[];
        var valueArray2=[];
        $.each(personArray,function (idx,item) {
            titleArray.push(item.gname+'|'+item.text);
            valueArray.push(item.gid+'|'+item.id);
            valueArray1.push(item.text);
            valueArray2.push(item.id);
        });


        $('#'+inputId).attr('title',titleArray.join(","));
        $('#'+inputId).attr("data-send",valueArray2.join(','));
        $('#'+inputId).attr("data-value",valueArray.join(','));
        $('#'+inputId).val(valueArray1.join(","));
        if(typeof callback == "function"){
            callback();
        }

        //有值显示可以删除的符号
        $('#'+inputId).closest('div').find('.glyphicon-menu-down').hide();
        $('#'+inputId).closest('div').find('.glyphicon-remove').show().unbind().bind('click', function (e) {
            e.stopPropagation();
            $('#'+inputId).removeAttr('title');
            $('#'+inputId).removeAttr("data-send");
            $('#'+inputId).removeAttr("data-value");
            $('#'+inputId).val('请选择...');

            $('#'+inputId).closest('div').find('.glyphicon-remove').hide();
            $('#'+inputId).closest('div').find('.glyphicon-menu-down').show();

        });

        $("#checkPersonTable").bootstrapTable('removeAll');
        $("#checkPersonTable").empty();
        dialogSelf.close();





    };

    tools.SimpleDialog(itsmGroupDialogOptionForJq).open();


}

function cleanUserInput(inputId) {
    $('#'+inputId+' .btn-text').text('请选择...');
    $('#'+inputId).attr('title','');
    $('#'+inputId).attr("data-value",'');
    $('#'+inputId).val('');
}

/*人员查询组件结束*/


