var api = getApiUrl();
var oldWebUrl = getOldWebUrl();
var tools = new toolUtil();
var userId=$("#orgId",parent.document).attr("data-user");
var userType=$("#orgId",parent.document).attr("data-userType");
var orgId=$("#orgId",parent.document).attr("data-id");
var FormValidate = new FormValidate();
var isLoadSearch = 0;
// var login=getUrlParam();
var login = {userTel:localStorage.getItem("userTel"),tokenId:localStorage.getItem("tokenId")};
var treeNode_ = [];       //存放树节点信息-树形结构
var exportDepSelected = []; //选中的部门

//校验规则
var validateConfig = {
    'autoWfoid': {
        required: true,
        name: '成员',
    },
};


$(document).ready(function () {
    initTable();
    initBtn();
});
function initTable() {
    var cfg = {
        pagination:false,
        smartDisplay:false,
        columns: [
            { field: 'userName',  title: '成员',width: "25%px" },
            {field: 'roleName', title: '开通权限',width: "25%px" },
            {   field: 'roleRange',
                title: '权限范围',
                width: "25%px",
                cellStyle:formatTableUnit,
                formatter :paramsMatter
            },
            { field: 'userId', title: '操作',width: "25%px",
                formatter: function (value, row, index) {
                        var depId_list=[],depName_list=[];
                        if(row.roleRange==3){
                            for(var i=0;i<row.depList.length;i++){
                                depId_list.push(row.depList[i].depId);
                                depName_list.push(row.depList[i].depName)
                            }
                        }
                        return [
                            '<button type="button" title="" class=" btn-small  btn-self-blue" onclick="editor(\''+row.orgId+'\',\''+row.userId+'\',\''+row.roleId+'\',\''+row.roleName+'\',\''+row.roleRange+'\',\''+row.userName+'\',\''+depId_list.join(",")+'\',\''+depName_list.join(",")+'\')" style="margin-right: 10px;">调整</button><button type="button" onclick="delete_list(\''+row.orgId+'\',\''+row.userId+'\',\''+row.roleId+'\',\''+row.roleName+'\',\''+row.roleRange+'\')" class=" btn-small  btn-self-blue" >删除</button>',
                        ].join('');

                }
            }
        ],
        url: api+'/data/getData',
        params: queryParam(),
        method:'post',
        dataField: "data",
        dataField2:"data",
        height:'422',
        dataType:'html',
    };
    //表格超出宽度鼠标悬停显示td内容
    function paramsMatter(value,row,index, field) {
        if(row.roleRange==1){
            value="全组织";
        }else if(row.roleRange==2){
            value="所属层级及以下"
        }else {
            var depId_list=[];
            (row.depList || []).forEach(function (item) {
                depId_list.push(item.depName);
            })
            value = depId_list.join(",");
        }
        if(['Web_set_task','Web_set_merit','Web_set_settlement','Web_set_timecard','Web_set_enterprise','Web_set_date'].indexOf(row.roleId) !== -1){
            value = "全组织";
        }
        var span=document.createElement('span');
        span.setAttribute('title',value);
        span.innerHTML = value;
        return span.outerHTML;
    }
    //td宽度以及内容超过宽度隐藏
    function formatTableUnit(value, row, index) {
        return {
            css: {
                "white-space": "nowrap",
                "text-overflow": "ellipsis",
                "overflow": "hidden",
                "max-width":"100px",
                "font-size": "12px",
                "color": "#757575"
            }
        }
    }
    //加载更多，超过10条显示
    // var oTable = tools.createTable('timeSettings',cfg);
    var oTable = createTable('timeSettings', cfg);
    oTable.Init();
    $('#timeSettings').on('load-success.bs.table',function(data){
        $('#table-wrap .fixed-table-container').css('height','422px');
        $('#table-wrap .fixed-table-body').css('height','380px');
        $('#table-wrap .fixed-table-body').css('overflow','auto');
    })


}

//按钮
function initBtn(){
    $('#addBtn').mouseover(function () {
        $('#addBtn').addClass('active');
    })
    $('#addBtn').mouseout(function () {
        $('#addBtn').removeClass('active');
    })
    //新增
    $('#addBtn').unbind().bind('click',function() {
        // tools.loading();
        $('.list-wrap').addClass('fn-hide');
        $('.form-wrap').removeClass('fn-hide');
        $('#cfg-template').tmpl({"type":"add"}).appendTo($('.ibox-content').empty());
        //绑定校验
        FormValidate.validateForOnly(validateConfig);


        $('.panel-body').undelegate().delegate('.collapse-link', 'click', function () {
            var $this = $(this);
            var ibox = $this.closest('div.ibox');
            var button = $this.find('i');
            var content = ibox.find('div.ibox-content');
            content.slideToggle(200);
            button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
            ibox.toggleClass('').toggleClass('border-bottom');
            setTimeout(function () {
                ibox.resize();
                ibox.find('[id^=map-]').resize();
            }, 50);
        });
        //选择特定层级
        $("#only_select").unbind().bind('click',function () {
            var params={
                "id": new Date().getTime(),
                "client": {},
                "data": {
                    "module": "main-api",
                    "url": "/api/dep/depTree",
                    "param":{
                        "orgId": orgId,
                        "parentDepId": "-1",
                        "userType":userType,
                        "userId":userId
                    }

                }
            }
            treeNode_=getTreeContent(params);
            $("#batchExportDepDialog").modal('show');
            var mTreeNodes = JSON.parse(JSON.stringify(treeNode_));
            (function parseChecked(nodes){
                if(Array.isArray(exportDepSelected) && exportDepSelected.length > 0){
                    nodes.forEach(function(item){
                        item.state = {checked:exportDepSelected.indexOf(item.depId) !== -1};
                        if(Array.isArray(item.nodes) && item.nodes.length > 0){
                            parseChecked(item.nodes)
                        }
                    });
                }
            })(mTreeNodes);

            $('#selectedDepTree').treeview({
                data: mTreeNodes,
                multiSelect:true,
                selectable: true,
                showCheckbox:true,
                collapseIcon: 'glyphicon glyphicon-triangle-bottom', // 折叠图标，默认 min
                expandIcon: 'glyphicon glyphicon-triangle-right',
                showBorder: false,
                selectedColor: '#878787',
                selectedBackColor: '#bae7ff',
                onNodeChecked: function(event, node) { //选中节点
                    var selectNodes = getChildNodeIdArr(node); //获取所有子节点
                    if (Array.isArray(selectNodes) && selectNodes.length > 0) { //子节点不为空，则选中所有子节点
                        $('#selectedDepTree').treeview('checkNode', [selectNodes, { silent: true }]);
                    }
                    setParentNodeCheck(node);
                },
                onNodeUnchecked: function(event, node) { //取消选中节点
                    // 取消父节点 子节点取消
                    var selectNodes = setChildNodeUncheck(node); //获取未被选中的子节点
                    var childNodes = getChildNodeIdArr(node);    //获取所有子节点
                    if (Array.isArray(selectNodes) && selectNodes.length==0) { //有子节点且未被选中的子节点数目为0，则取消选中所有子节点
                        $('#selectedDepTree').treeview('uncheckNode', [childNodes, { silent: true }]);
                    }
                    // 取消节点 父节点取消
                    $('#selectedDepTree').treeview('uncheckNode', [node.parentId, { silent: true }]);
                }
            });

            $('#batchExportDepSelectedBtn').off('click').on('click',function(){
                var selected = $('#selectedDepTree').treeview('getChecked');
                var exportDepSelected_name=[];
                if(Array.isArray(selected) && selected.length > 0){
                    exportDepSelected = selected.map(function(item){
                        return item.depId;
                    });
                    exportDepSelected_name = selected.map(function(item){
                        return item.depName;
                    });
                    $("#only_select").attr('data-id',exportDepSelected.join(","));
                    $("#only_select").text(exportDepSelected_name.join(","));
                }else{
                    exportDepSelected = [];
                    $("#only_select").attr('data-id',exportDepSelected.join(","));
                    $("#only_select").text("选择特定层级");
                }

                $("#batchExportDepDialog").modal('hide');
            });

        })
        //选择人员
        $("#autoWfoid").unbind().bind('click', function () {
            $('#memberSelectDialog').modal('show');
            $("#memberTable").bootstrapTable('refresh');
            initTree_user('orgTree', 'memberTable');
            createUserTable('memberTable', 'orgTree');
            if ($("#autoWfoid").attr('data-selected')) {
                var list = [];
                var id = $("#autoWfoid").attr('data-selected').split(",");
                var name = $("#autoWfoid").val().split(",");
                for (var i = 0; i < id.length; i++) {
                    var obj = {};
                    obj.userId = id[i];
                    obj.userName = name[i]
                    list.push(obj);
                }
                init_sure_user('memberTable_sure', list);
            } else {
                init_sure_user('memberTable_sure', []);
            }

            //保存主管
            $('#memberSelectDialogConfirmBtn').off('click').on('click', function () {
                var data = $('#memberTable_sure').bootstrapTable("getData");
                if (!Array.isArray(data) && data.length === 0) {
                    sweetalert({
                        title: "信息",
                        text: "请选择审批人",
                        type: "warning",
                        confirmButtonColor: "#3197FA",
                        confirmButtonText: "确定"
                    });
                    return false;
                }
                var listName = [], listId = [];
                for (var i = 0; i < data.length; i++) {
                    listId.push(data[i].userId);
                    listName.push(data[i].userName);
                }
                $("#autoWfoid").text(listName.join(','));
                $("#autoWfoid").val(listName.join(','));
                $("#autoWfoid").attr('data-selected', listId.join(","));
                $('#memberSelectDialog').modal('hide');
            });

        })
        //权限范围
        $("input[type=radio][name='optionsRadiosinline']").click(function () {
            if ($(this).val() != 3) {
                $("#only_select").attr('data-id', "");
                $("#only_select").text("选择特定层级");
                $("#only_select").css('display','none');

            }else {
                $("#only_select").attr('data-id', "");
                $("#only_select").text("选择特定层级");
                $("#only_select").css('display','inline-block');
                exportDepSelected=[];
            }
        })
        //权限全选
        $("#check_all,#check_all2").click(function () {
            var type = $(this).attr('id') === "check_all" ? "manager" : "config";
            $('.permissionList[data-type="'+type+'"]')
                .find("input[type=checkbox][name='rule_list']")
                .prop("checked", $(this).is(":checked"));
        });
        //权限反选
        $("input[type=checkbox][name='rule_list']").click(function () {
            var pUl = $(this).parent().parent().parent();
            var checkAllId = pUl.attr('data-type') === "manager" ? "check_all" : "check_all2";
            if (pUl.find("input[type=checkbox][name='rule_list']:checked").length
                === pUl.find("input[type=checkbox][name='rule_list']").length) {
                $("#" + checkAllId).prop("checked", true);
            } else {
                $("#" + checkAllId).prop("checked", false);
            }
        })

    });

    //返回
    $('#goback').unbind().bind('click', function () {
        $('.list-wrap').removeClass('fn-hide');
        $('.form-wrap').addClass('fn-hide');
        $('#assignment').addClass('fn-hide');
        $('#copy').addClass('fn-hide');

    });

    //保存
    var $save = $('#save').ladda();
    $save.unbind().bind('click', function () {
        // e.preventDefault();
        var flag = FormValidate.validate($('#form')[0], validateConfig);
        if($("input[type=radio][name='optionsRadiosinline']:checked").val()==3){//判断权限范围是否勾选特定层级
            var only_selec=$("#only_select").attr("data-id") //获取特定层级值
            if(only_selec==undefined||only_selec==""){
                sweetAlert({
                    title: "信息",
                    text: "请选择特定层级!",
                    type: "error",
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定",
                });
                return
            }
        }
        var permissRange = $("input[type=radio][name='optionsRadiosinline']:checked").length > 0;
        var hasGroupPermiss = $('input[name="rule_list"][value="Web_set_group"]').prop('checked')
        if((permissRange && !hasGroupPermiss) || (!permissRange && hasGroupPermiss)){
            sweetAlert({
                title: "信息",
                text: "若选择权限范围，权限范围和组织管理权限均需勾选！",
                type: "error",
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定",
            });
            return false;
        }
        if(flag){
            $save.ladda('start');
            setTimeout(function () {
                var cfg = {
                    url: api + '/data/getData',
                    parameter: encrypt(JSON.stringify(getParams()),getPass()),
                    successCallback: function (json) {
                        $save.ladda('stop');
                        if (json.status == 0) {
                            sweetAlert({
                                title: "信息",
                                text: "保存成功！",
                                type: "success",
                                confirmButtonColor: "#3197FA",
                                confirmButtonText: "确定",
                            });
                            $('.list-wrap').removeClass('fn-hide');
                            $('.form-wrap').addClass('fn-hide');
                            // $('#assignment').addClass('fn-hide');
                            // $('#copy').addClass('fn-hide');
                            initTable();//更新table

                        } else {
                            sweetAlert({
                                title: "信息",
                                text: json.message,
                                type: "error",
                                confirmButtonColor: "#3197FA",
                                confirmButtonText: "确定",
                            });
                        }
                    }
                }
                tools.ajaxSubmit(cfg);
            }, 10);
        }
    });
}

//修改
window.editor = function (orgId, userId_, roleId, roleName, roleRange, userName,depId,depName) {
    tools.loading();
    tools.unloading();
    //渲染页面结构
    $('.list-wrap').addClass('fn-hide');
    $('.form-wrap').removeClass('fn-hide');
    $('#cfg-template').tmpl({"type": 'modify'}).appendTo($('.ibox-content').empty());

    //初始化默认值
    exportDepSelected = depId.split(",");
    //成员
    $("#autoWfoid").val(userName);
    $("#autoWfoid").attr('data-selected',userId_);
    //权限范围
    $("input[type=radio][name='optionsRadiosinline'][value=" + roleRange + "]").prop("checked", true);
    if(roleRange==3){
        $("#only_select").css('display','inline-block');
        $("#only_select").attr('data-id',depId);
        $("#only_select").text(depName);
    }
    //配置类权限
    if(Array.isArray(userRoleMap[userId_])){
        var hasGroupPermiss = false;
        userRoleMap[userId_].forEach(function(_roleId){
            $("input[type=checkbox][name='rule_list'][Value=" + _roleId + "]").prop("checked", true);
            if(_roleId === "Web_set_group"){
                $('#check_all2').prop('checked',true);
                hasGroupPermiss = true
            }
        })
        if(userRoleMap[userId_].length === 7
           || (userRoleMap[userId_].length === 6 && !hasGroupPermiss)){
            $('#check_all').prop('checked',true);
        }
    }else{
        $("input[type=checkbox][name='rule_list'][Value=" + roleId + "]").prop("checked", true);
    }

    //选择特定层级
    $("#only_select").unbind().bind('click',function () {
        var params={
            "id": new Date().getTime(),
            "client": {},
            "data": {
                "module": "main-api",
                "url": "/api/dep/depTree",
                "param":{
                    "orgId": orgId,
                    "parentDepId": "-1",
                    "userType":userType,
                    "userId":userId
                }

            }
        }
        treeNode_=getTreeContent(params);
        $("#batchExportDepDialog").modal('show');
        var mTreeNodes = JSON.parse(JSON.stringify(treeNode_));
        (function parseChecked(nodes){
            if(Array.isArray(exportDepSelected) && exportDepSelected.length > 0){
                nodes.forEach(function(item){
                    item.state = {checked:exportDepSelected.indexOf(item.depId) !== -1};
                    if(Array.isArray(item.nodes) && item.nodes.length > 0){
                        parseChecked(item.nodes)
                    }
                });
            }
        })(mTreeNodes);

        $('#selectedDepTree').treeview({
            data: mTreeNodes,
            multiSelect:true,
            selectable: true,
            showCheckbox:true,
            collapseIcon: 'glyphicon glyphicon-triangle-bottom', // 折叠图标，默认 min
            expandIcon: 'glyphicon glyphicon-triangle-right',
            showBorder: false,
            selectedColor: '#878787',
            selectedBackColor: '#bae7ff',
            onNodeChecked: function(event, node) { //选中节点
                var selectNodes = getChildNodeIdArr(node); //获取所有子节点
                if (Array.isArray(selectNodes) && selectNodes.length > 0) { //子节点不为空，则选中所有子节点
                    $('#selectedDepTree').treeview('checkNode', [selectNodes, { silent: true }]);
                }
                setParentNodeCheck(node);
            },
            onNodeUnchecked: function(event, node) { //取消选中节点
                // 取消父节点 子节点取消
                var selectNodes = setChildNodeUncheck(node); //获取未被选中的子节点
                var childNodes = getChildNodeIdArr(node);    //获取所有子节点
                if (Array.isArray(selectNodes) && selectNodes.length==0) { //有子节点且未被选中的子节点数目为0，则取消选中所有子节点
                    $('#selectedDepTree').treeview('uncheckNode', [childNodes, { silent: true }]);
                }
                // 取消节点 父节点取消
                $('#selectedDepTree').treeview('uncheckNode', [node.parentId, { silent: true }]);
            }
        });

        $('#batchExportDepSelectedBtn').off('click').on('click',function(){
            var selected = $('#selectedDepTree').treeview('getChecked');
            var exportDepSelected_name=[];
            if(Array.isArray(selected) && selected.length > 0){
                exportDepSelected = selected.map(function(item){
                    return item.depId;
                });
                exportDepSelected_name = selected.map(function(item){
                    return item.depName;
                });
                $("#only_select").attr('data-id',exportDepSelected.join(","));
                $("#only_select").text(exportDepSelected_name.join(","));
            }else{
                exportDepSelected = [];
                $("#only_select").attr('data-id',exportDepSelected.join(","));
                $("#only_select").text("选择特定层级");
            }
            $("#batchExportDepDialog").modal('hide');
        });

    })
    //选择人员
    $("#autoWfoid").unbind().bind('click', function () {
        $('#memberSelectDialog').modal('show');
        $("#memberTable").bootstrapTable('refresh');
        initTree_user('orgTree', 'memberTable');
        createUserTable('memberTable', 'orgTree');
        if ($("#autoWfoid").attr('data-selected')) {
            var list = [];
            var id = $("#autoWfoid").attr('data-selected').split(",");
            var name = $("#autoWfoid").val().split(",");
            for (var i = 0; i < id.length; i++) {
                var obj = {};
                obj.userId = id[i];
                obj.userName = name[i]
                list.push(obj);
            }
            init_sure_user('memberTable_sure', list);
        } else {
            init_sure_user('memberTable_sure', []);
        }

        //保存主管
        $('#memberSelectDialogConfirmBtn').off('click').on('click', function () {
            var data = $('#memberTable_sure').bootstrapTable("getData");
            if (!Array.isArray(data) && data.length === 0) {
                sweetalert({
                    title: "信息",
                    text: "请选择审批人",
                    type: "warning",
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定"
                });
                return false;
            }
            var listName = [], listId = [];
            for (var i = 0; i < data.length; i++) {
                listId.push(data[i].userId);
                listName.push(data[i].userName);
            }
            $("#autoWfoid").text(listName.join(','));
            $("#autoWfoid").val(listName.join(','));
            $("#autoWfoid").attr('data-selected', listId.join(","));
            $('#memberSelectDialog').modal('hide');
        });

    })
    //权限范围
    $("input[type=radio][name='optionsRadiosinline']").click(function () {
        if ($(this).val() != 3) {
            $("#only_select").attr('data-id', "");
            $("#only_select").text("选择特定层级");
            $("#only_select").css('display','none');
        }else {
            $("#only_select").attr('data-id', "");
            $("#only_select").text("选择特定层级");
            $("#only_select").css('display','inline-block');
            exportDepSelected = [];
        }
    })
    //权限全选
    $("#check_all,#check_all2").click(function () {
        var type = $(this).attr('id') === "check_all" ? "manager" : "config";
        $('.permissionList[data-type="'+type+'"]')
            .find("input[type=checkbox][name='rule_list']")
            .prop("checked", $(this).is(":checked"));
    });
    //权限反选
    $("input[type=checkbox][name='rule_list']").click(function () {
        var pUl = $(this).parent().parent().parent();
        var checkAllId = pUl.attr('data-type') === "manager" ? "check_all" : "check_all2";
        if (pUl.find("input[type=checkbox][name='rule_list']:checked").length
            === pUl.find("input[type=checkbox][name='rule_list']").length) {
            $("#" + checkAllId).prop("checked", true);
        } else {
            $("#" + checkAllId).prop("checked", false);
        }
    })
};
//删除
window.delete_list = function (orgId, userId_, roleId, roleName, roleRange) {
    sweetAlert({
        title: "确认信息",
        text: "确定要删除吗?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3197FA",
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        closeOnConfirm: false
    }, function () {
        var params = {
            "id": new Date().getTime(),
            "client": {},
            "data": {
                "module": "main-api",
                "url": "/api/role/delete",
                "param": {
                    "orgId": orgId,
                    "userId":userId_,
                    "roleId":roleId,
                    "createBy":userId
                }

            }

        };
        $.ajax({
            url: api + "/data/getData",   //请求的url地址
            dataType: "html",   //返回格式为json
            async: false,//请求是否异步，默认为异步，这也是ajax重要特性
            data: encrypt(JSON.stringify(params),getPass()),    //参数值
            type: "POST",   //请求方式
            contentType: 'application/json;charset=UTF-8',
            beforeSend: function (request) {
                //请求前的处理
                request.setRequestHeader("userTel", login.userTel);
                request.setRequestHeader("Authorization", login.tokenId);
            },
            success: function (req) {
                req = JSON.parse(decrypt(req,getPass()));
                if (req.status == 0) {
                    sweetAlert({
                        title: "信息",
                        text: "删除成功！",
                        type: "success",
                        confirmButtonColor: "#3197FA",
                        confirmButtonText: "确定",
                    });
                    initTable();//更新table

                } else {
                    sweetAlert({
                        title: "信息",
                        text: req.message,
                        type: "error",
                        confirmButtonColor: "#3197FA",
                        confirmButtonText: "确定",
                    });
                }
            },
            complete: function () {
                //请求完成的处理
            },
            error: function () {
                //请求出错处理
            }
        });
    })


}

//实例化下拉框
function renderSelect(id, value) {
    $('#' + id).selectpicker({width: '100%', noneSelectedText: '请选择...'}).selectpicker('val', value);
}


//初始化已选人员，已选部门表格
function init_sure_user($id, data) {
    var org_cfg = {
        height:140,
        smartDisplay:false,
        pagination: false,
        columns: [
            {
                field: "userName",
                title: "名称",
                align: "left",
                valign: "middle",
                width:'50%px'
            }, {
                field: "userId",
                title: "操作",
                align: "left",
                valign: "middle",
                width:'50%px',
                formatter: function (value, row, index) {
                    return '<a href="javascript:void(0)" type="button" style="color: #4F9FFF;" class="change" onclick="delete_user(\'' + row.userId + '\',\'' + row.userName + '\',\'' + index + '\')" data-id="' + row.userId + '">删除</a>';
                }

            }
        ],
        method: 'post',
        data: data,
        dataField: "data",
        dataField2: "data",
        sidePagination: 'client',
        onCheck: function (row) {

        },
    }
    var oTable = tools.createTable($id, org_cfg);
    oTable.Init();
    // $("#"+$id).on('load-success.bs.table',function(data){
    $('#'+$id+'_content .fixed-table-container').css('height','140px');
    $('#'+$id+'_content .fixed-table-body').css('height','110px');
    $('#'+$id+'_content .fixed-table-body').css('overflow','auto');
    // })
    window.delete_user = function (userId, userName) {
        $("#" + $id).bootstrapTable('remove', {field: "userName", values: [userName]});
        var data=$('#memberTable').bootstrapTable('getData');
        for(var i=0;i<data.length;i++){
          if(data[i].userId==userId){
              data[i].selected=false;
          }
        }
        $('#memberTable').bootstrapTable("load",data);
        // $("#memberTable").on('load-success.bs.table',function(data){
            $('#memberTable_content .fixed-table-container').css('height','211px');
            $('#memberTable_content .fixed-table-body').css('height','170px');
            $('#memberTable_content .fixed-table-body').css('overflow','auto');
        // })
    }
}

var obj = {};
//新增修改选中部门
window.next_org = function (depId, depName, index) {
    var data = $("#org_list").bootstrapTable('getData');
    for (var i = 0; i < data.length; i++) {
        if (data[i].checked == true) {
            data[i].checked = false;
        }

    }
    for (var i = 0; i < data[index].nodes.length; i++) {
        if (data[index].nodes[i].checked == true) {
            data[index].nodes[i].checked = false;
        }
    }
    obj[depId] = data[index].nodes;
    $("#choose2").find('li.breadcrumb-item').removeClass('active');
    var html = "";
    html += '<li style="color: #151515;" disabled class="breadcrumb-item active" data-id="' + depId + '">' + depName + '</li>';
    $(html).appendTo("#choose2");
    if (data[index].nodes) {
        Init_org_table(data[index].nodes)
    } else {
        Init_org_table([])
    }

    $(".breadcrumb-item").unbind().bind('click', function () {
        var $this = $(this);
        $this.nextAll().remove();
        var _depId = $this.attr('data-id');
        var dataList = obj[_depId];
        Init_org_table(dataList);

    })
}

//查询字段
function queryParam() {
    var params = {
        "id": new Date().getTime(),
        "client": {},
        "data": {
            "module": "main-api",
            "url": "/api/role/list",
            "param": {
                "orgId": orgId
            }
        }

    };
    return params;
}

//获取提交参数
function getParams() {
    var params = {
        "id": new Date().getTime(),
        "client": {},
        "data": {
            "module": "main-api",
            "url": "/api/role/add",
            "param": {
                "orgId": orgId,
                "userIdList": $("#autoWfoid").attr('data-selected').split(','),
                "roleRange": $("input[type=radio][name='optionsRadiosinline']:checked").val() || null,
                "depList": $("input[type=radio][name='optionsRadiosinline']:checked").val() == 3 ? $("#only_select").attr("data-id").split(",") : [],//权限范围为3 时为必输项 部门ID列表
                // "roleIdList":$("input[type=radio][name='check_all']:checked")?['Web_set_group','Web_set_timecard'],
                "createBy": userId
            }

        }

    };
    var checkList = [];
    // if ($("input[type=checkbox][name='check_all']").is(":checked")) {
    //     var select = $("input[type=checkbox][name='rule_list']");
    //     for (var i = 0; i < select.length; i++) {
    //         checkList.push(select[i].value);
    //     }
    // } else {
    //     var select = $("input[type=checkbox][name='rule_list']:checked");
    //     for (var i = 0; i < select.length; i++) {
    //         checkList.push(select[i].value);
    //     }
    // }
    var select = $("input[type=checkbox][name='rule_list']:checked");
    for (var i = 0; i < select.length; i++) {
        checkList.push(select[i].value);
    }
    params.data.param.roleIdList = checkList;
    console.log("add params",params);
    return params;
}

//获取后台tree数据
function getTreeContent(params) {
    var _tree = [];
    $.ajax({
        url: api + "/data/getData",   //请求的url地址
        dataType: "html",   //返回格式为json
        async: false,//请求是否异步，默认为异步，这也是ajax重要特性
        data: encrypt(JSON.stringify(params),getPass()),    //参数值
        type: "POST",   //请求方式
        contentType: 'application/json;charset=UTF-8',
        beforeSend: function (request) {
            //请求前的处理
            request.setRequestHeader("userTel", login.userTel);
            request.setRequestHeader("Authorization", login.tokenId);
        },
        success: function (req) {
            req = JSON.parse(decrypt(req,getPass()));
            (req.data.data || []).forEach(function (tmp_obj) {
                tmp_obj.text = tmp_obj.depName;
                tmp_obj.id = tmp_obj.depId;
                tmp_obj.parentId = tmp_obj.parentDepId;
                tmp_obj.parentOid = tmp_obj.parentDepId;
                tmp_obj.color = "#878787";
                tmp_obj.icon = 'fa fa-folder';
                _tree.push(tmp_obj);
            });
        },
        complete: function () {
            //请求完成的处理
        },
        error: function () {
            //请求出错处理
        }
    });
    function compare(property,desc) {
        return function (a, b) {
            var value1 = a[property];
            var value2 = b[property];
            if(desc==true){
                // 升序排列
                return value1 - value2;
            }else{
                // 降序排列
                return value2 - value1;
            }
        }
    }
    var list= _tree.sort(compare("sortNo",true));
    return simpleDataTypeToNormalDataType(list, 'depId', 'parentDepId', 'nodes');
}

/**
 * 绘制组织部门树
 * @param treeId  treeId
 * @param tableId 与树关联的表格Id
 */
function initTree_user(treeId, tableId) {
    var params = {
        "orgId": orgId,
        "userType": userType,
        "userId": userId
    };
    ajaxData('main-api', '/api/dep/userDepTree', params, function (res) {
        var treeNode = [];
        if (res.data) {
            (res.data.data || []).forEach(function (item) {
                item.id = item.depId;
                item.text = item.depName;
                item.parentId = item.parentDepId;
                item.parentOid = item.parentDepId;
                item.color = "#878787";
                item.icon = 'fa fa-folder';
                treeNode.push(item);
            });
            function compare(property,desc) {
                return function (a, b) {
                    var value1 = a[property];
                    var value2 = b[property];
                    if(desc==true){
                        // 升序排列
                        return value1 - value2;
                    }else{
                        // 降序排列
                        return value2 - value1;
                    }
                }
            }
            var list= treeNode.sort(compare("sortNo",true));
            treeNode = simpleDataTypeToNormalDataType(list, 'id', 'parentId', 'nodes');
        }
        $('#' + treeId).treeview({
            data: treeNode,
            collapseIcon: 'glyphicon glyphicon-triangle-bottom', // 折叠图标，默认 min
            expandIcon: 'glyphicon glyphicon-triangle-right',
            showBorder: false,
            selectedColor: '#878787',
            selectedBackColor: '#bae7ff'
        });
        $('#' + treeId).on('nodeUnselected', function(event, data) {
            $('#' + treeId).treeview('toggleNodeSelected', [ data.nodeId, { silent:true } ]);
        })
        $('#' + treeId).on('nodeSelected', function(event, data) {
            var selectArr = $('#' + treeId).treeview('getSelected');
            for (i = 0; i < selectArr.length; i++) {
                if (selectArr[i].nodeId != data.nodeId) {
                    $('#' + treeId).treeview('unselectNode', [selectArr[i].nodeId, {silent: true}]);
                }
            }
        });
        if (treeNode !=undefined && treeNode.length > 0) {
            var nodeId = 0;
            $('#' + treeId).treeview('selectNode', [nodeId, { silent: true }]);
            $('#' + tableId).bootstrapTable("refresh");
        }
        $('#' + treeId).on('nodeSelected', function(event, data) {
            $('#' + tableId).bootstrapTable("refresh");
        });
    })
}

/**
 * 生成用户表格
 * @param tableId 表格Id
 * @param treeId  与表格关联的treeId
 */
function createUserTable(tableId, treeId) {
    var option = {
        height:'211',
        smartDisplay:false,
        clickToSelect:false,
        singleSelect:false,
        url:api + "/data/getData",
        method:'post',
        contentType:'application/json',
        dataType:'html',
        pagination:true,
        totalField:'total',
        dataField:'data',
        sidePagination:'server',
        ajaxOptions: {
            headers: {"Authorization": login.tokenId, "userTel": login.userTel},
        },
        queryParams:function(params){
            var page = {
                pageSize: params.limit,
                pageNum: (parseInt(params.offset) / parseInt(params.limit)) + 1,
                order: {}
            };
            if (typeof params.sort !== 'undefined') {
                page.order[params.sort] = params.order;
            }
            var data = {
                "orgId": orgId,
                "userId": userId,
                status:1,
                "depId": $('#' + treeId).treeview("getSelected").length > 0
                    ? $('#' + treeId).treeview("getSelected")[0].depId : ''
            };
            params = {
                id: new Date().getTime(),
                client: {},
                data: {
                    "module": "main-api",
                    "url": "/api/user/findByDep",
                    "param":data
                },
                page:page
            };
            return encrypt(JSON.stringify(params),getPass());
        },
        onPostBody:function(){
            var data = $('#memberTable').bootstrapTable("getData");
            if(Array.isArray(data)){
                var userIds = $('#memberTable_sure').bootstrapTable("getData").map(function(item){
                    return item.userId;
                });
                data.forEach(function(item,index){
                    $('#memberTable tbody').find('tr[data-index="'+ index +'"] input[type="checkbox"]').prop('checked',userIds.indexOf(item.userId) !== -1);
                });
            }
        },
        columns: [
            {
                field: "selected", title: "", align: "center", checkbox: true,width:'10%px',
                formatter: function (value, row, index) {
                    if (row.userType === 1) {
                        return {
                            disabled: true,
                        }
                    } else {
                        return {
                            disabled: false,
                        }
                    }
                }
            },
            {field: "userName", title: "姓名", align: "left", valign: "middle",width:'20%px'},
            {field: "positionName", title: "职位", align: "left", valign: "middle",width:'20%px'},
            {field: "rankName", title: "职级", align: "left", valign: "middle",width:'25%px'},
            {field: "memberType", title: "成员类型", align: "left", valign: "middle",width:'25%px'}
        ],
        rowStyle: function (row, index) {
            return {
                css: {
                    'font-size':'12px',
                    'color': '#757575'
                }
            }
        },
        classes:'table table-no-bordered table-striped',
        onCheck: function (row) {
            var data = $("#memberTable_sure").bootstrapTable('getData');
            //重复判断
            var flag = true;
            if (data.length == 0) {
                data.push(row);
            } else {
                for (var i = 0; i < data.length; i++) {
                    if (row.userId == data[i].userId) {
                        flag = false
                    }
                }
                if (flag == true) {
                    data.push(row);
                }
            }
            init_sure_user("memberTable_sure", data);
        },//点击
        onUncheck:function(row){//取消点击
            var data = $("#memberTable_sure").bootstrapTable('getData').filter(function(item){
                return row.userId !== item.userId;
            });
            init_sure_user("memberTable_sure", data);
        },
        //点击全选框时触发的操作
        onCheckAll:function(rows){
            var data = $("#memberTable_sure").bootstrapTable('getData');
            var allData = $('#memberTable').bootstrapTable("getData");
            var berforeUsers = data.map(function (item) {
                return item.userId;
            })
            allData.forEach(function(item){
                if(berforeUsers.indexOf(item.userId) === -1){
                    berforeUsers.push(item.userId);
                    data.push(item);
                }
            })
            init_sure_user("memberTable_sure", data);
        },
        onUncheckAll: function (rows) {//取消全选
            var data=$("#memberTable_sure").bootstrapTable('getData');
            for(var i=0;i<rows.length;i++){
                for (var j=0;j<data.length;j++){
                    if (data[j].userId === rows[i].userId){
                        data.splice(j,1); //利用splice函数删除元素，从第i个位置，截取长度为1的元素
                    }
                }
            }
            console.log(data);
            init_sure_user("memberTable_sure", data);
        },
        // onLoadSuccess: function (data) {
        //     data = JSON.parse(decrypt(data,getPass()));
        //     var _data = [];
        //     if (data.data == null) {
        //
        //     } else {
        //         for (var i = 0; i < data.data.data.length; i++) {
        //             if (data.data.data[i].userStatus == 1) {
        //                 _data.push(data.data.data[i])
        //             }
        //         }
        //     }
        //
        //     $("#" + tableId).bootstrapTable("load", _data)
        // },
        responseHandler:function(res){
            res = JSON.parse(decrypt(res,getPass()));
            res.total = res.data.total;
            res.data = res.data.data;
            console.log(res);
            return res;
        }
    };
    $('#' + tableId).bootstrapTable(option);
    $("#"+tableId).on('load-success.bs.table',function(data){
        $('#'+tableId+'_content .fixed-table-container').css('height','211px');
        $('#'+tableId+'_content .fixed-table-body').css('height','170px');
        $('#'+tableId+'_content .fixed-table-body').css('overflow','auto');
    })
}

function getUrlParam() {
    // var url = location.search; //获取url中"?"符后的字串
    var url = window.parent.location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

function formateField(value) {
    if (value == "请选择...") {
        return ""
    }
    return value;
}

//点击加载更多
$("#loadMore").click(function () {
    $table = $("#timeSettings");
    var curLength = $table.bootstrapTable('getOptions').data.length;
    var total = tableRes.data.total;
    var page = curLength / 10;
    var size = (page + 1) * 10;
    var temp = JSON.parse(JSON.stringify(tableRes));
    if (total < size){
        $table.bootstrapTable("load", tableRes);
        //$("#loadMore").hide();
        $("#loadMore").text('已加载全部');

    }else{
        temp.data.data = tableRes.data.data.slice(0,size);
        $table.bootstrapTable("load", temp);
        //$("#loadMore").show();
        $("#loadMore").text('加载更多');
    }
    // $('#timeSettings').on('load-success.bs.table',function(data){
        $('#table-wrap .fixed-table-container').css('height','422px');
        $('#table-wrap .fixed-table-body').css('height','380px');
        $('#table-wrap .fixed-table-body').css('overflow','auto');
    // })


});

var userRoleMap = {};
function createTable(id, cfg) {
    var oTableInit = {};
    //初始化Table
    oTableInit.Init = function () {
        $table = $('#' + id).bootstrapTable('destroy').bootstrapTable({
            data: cfg.data ? cfg.data : [],
            url: cfg.data ? "" : cfg.url,
            method: 'post',
            contentType: "application/json;charsets=utf-8",
            dataField: cfg.dataField || 'data',
            dataField2: cfg.dataField2 || null,
            totalField: cfg.totalField || 'totalCount',
            detailView: cfg.detailView || false,
            sidePagination: cfg.sidePagination || "server",

            // sortName : 'replyTime',
            // sortOrder : 'asc',
            // editable:cfg.editable||false,
            dataType: 'html',
            classes: cfg.classes ? cfg.classes : 'table table-no-bordered table-striped',
            cache: false,               //是否使用缓存，默认为true
            striped: true,              //是否显示行间隔色
            pagination: cfg.pagination,   //是否显示分页
            pageSize: 10,               //每页的记录行数
            pageNumber: 1,              //初始化加载第一页，默认第一页
            pageList: [15, 20, 30, 50, 100],  //可供选择的每页的行数
            pageSizeEditable: true,
            search: false,               //是否显示表格搜索
            showRefresh: false,          //是否显示刷新按钮
            clickToSelect: cfg.clickToSelect || false,        //是否启用点击选中行
            toolbar: "#toolbar_screen", //工具按钮用哪个容器

            showHeader: true, //是否显示列头
            showFooter: false, //是否显示列脚
            showPaginationSwitch: false,
            paginationLoop: false,
            paginationDetailHAlign: 'left',
            height: cfg.height ? cfg.height : undefined,
            queryParams: oTableInit.queryParams,
            ajaxOptions: {
                headers: {"Authorization": login.tokenId, "userTel": login.userTel},
            },
            // responseHandler: oTableInit.formResponseHandler,
            columns: cfg.columns,
            formatLoadingMessage: function () {
                return "正在努力地加载数据中，请稍候……";
            },
            formatNoMatches: function () {
                return '无符合条件的记录';
            },
            rowStyle: function (row, index) {
                return {
                    css: {
                        'color': '#757575',
                        'font-size': '12px'
                    }
                }
            },
            onExpandRow: function (index, row, $detail) {
                oTableInit.InitSubTable(index, row, $detail);
            },
            onCheck: function (row) {
                oTableInit.checkRowTable(row);
            },
            // 在对表格体进行渲染前触发
            responseHandler: function (res) {
                tableRes = JSON.parse(decrypt(res,getPass()));
                res = JSON.parse(decrypt(res,getPass()));
                console.log('/rule/list',res);
                if (res.data) {
                    var total = res.data.total;
                    if(id === "timeSettings"){
                        userRoleMap = {};
                        (res.data.data || []).forEach(function(item){
                            if(!Array.isArray(userRoleMap[item.userId]))  userRoleMap[item.userId] = [];
                            userRoleMap[item.userId].push(item.roleId);
                        })
                    }
                    if (total > 10) {
                        $("#loadMore").show();
                        $("#loadMore").text('加载更多');
                        res.data.data = res.data.data.slice(0, 10);
                    } else {
                        //隐藏加载更多
                        $("#loadMore").hide();
                        // $("#loadMore").text('已加载全部');
                    }
                }
                return res;
            }

        });
        $('#'+id).on('load-success.bs.table',function(data){
            $('#'+id+' .fixed-table-body').css('height',cfg.height);
            $('#'+id+' .fixed-table-body').css('overflow-y','auto');
        })
    };
    //得到查询的参数
    oTableInit.queryParams = function (params) {
        var opt;
        if (cfg.pagination) {
            opt = {
                // "pageNum":parseInt(params.offset) / parseInt(params.limit) + 1,
                // "pageSize" : params.limit,
                // sortOrder: params.order,//排序
                // sortName:params.sort//排序字段

            };
        }
        var temp;
        if (typeof cfg.params == "function") {
            temp = $.extend(true, {}, cfg.params(), opt);
        } else {
            temp = $.extend(true, {}, cfg.params, opt);
        }

        var par = JSON.stringify(temp);
        return encrypt(par,getPass());

    };
    //加载服务器数据之前的处理程序，可以用来格式化数据
    oTableInit.formResponseHandler = function (res) {
        res = JSON.parse(decrypt(res,getPass()));

        if (typeof cfg.callback == "function") {
            res = cfg.callback(res);
        }
        if (typeof cfg.totalParams == "undefined") {
            return res;
        }
        if (!cfg.countApi) {
            res = res.data.data;
            $('#' + id).bootstrapTable("load", res);

        } else {
            var coutParams = $.extend({}, cfg.params, cfg.totalParams);
            var opt = {
                url: cfg.countApi,
                parameter: JSON.stringify(coutParams),
                successCallback: function (msg) {
                    res.total = parseInt(msg);
                    $('#' + id).bootstrapTable("load", res);
                }
            };
            ajaxSubmit(opt);
        }

        return res;
    };
    //点击行展开
    oTableInit.InitSubTable = function (index, row, $detail) {
        if (typeof(cfg.initSubTable) == 'function') {
            cfg.initSubTable(index, row, $detail);
        }

    };
    //点击勾选框时绑定事件
    oTableInit.checkRowTable = function (row) {
        if (typeof(cfg.checkRowTable) == 'function') {
            cfg.checkRowTable(row);
        }
    }
    return oTableInit;
}

// 选中父节点时，选中所有子节点
function getChildNodeIdArr(node) {
    var ts = [];
    if (Array.isArray(node.nodes) && node.nodes.length > 0) {
        node.nodes.forEach(function(n){
            ts.push(n.nodeId);
            if (Array.isArray(n.nodes) && n.nodes.length > 0) {
                var temp = getChildNodeIdArr(n);
                ts = ts.concat(temp);
            }
        });
    } else {
        ts.push(node.nodeId);
    }
    return ts;
}

// 选中所有子节点时，选中父节点 取消子节点时取消父节点
function setParentNodeCheck(node) {
    var parentNode = $("#selectedDepTree").treeview("getNode", node.parentId);
    if (Array.isArray(parentNode.nodes) && parentNode.nodes.length > 0) {
        var checkedCount = 0;
        for (var x in parentNode.nodes) {
            if (parentNode.nodes[x].state.checked) {
                checkedCount ++;
            } else {
                break;
            }
        }
        if (checkedCount == parentNode.nodes.length) {  //如果子节点全部被选 父全选
            $("#selectedDepTree").treeview("checkNode", parentNode.nodeId);
            setParentNodeCheck(parentNode);
        }else {   //如果子节点未全部被选 父未全选
            $('#selectedDepTree').treeview('uncheckNode', parentNode.nodeId);
            setParentNodeCheck(parentNode);
        }
    }
}

// 取消父节点时 取消所有子节点
function setChildNodeUncheck(node) {
    var ts = [];    //当前节点子集中未被选中的集合
    if (Array.isArray(node.nodes) && node.nodes.label > 0) {
        (node.nodes || []).forEach(function(n){
            if (!n.state.checked) {
                ts.push(n.nodeId);
            }
            if(Array.isArray(n.nodes) && n.nodes.length > 0){
                (n.nodes || []).forEach(function(_n){
                    if (!_n.state.checked) {
                        ts.push(_n.nodeId);
                    }
                });
            }
        });
    }
    return ts;
}