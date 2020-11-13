var api  = getApiUrl();
var tools = new toolUtil();
var userType=$("#orgId",parent.document).attr("data-userType");
var orgId=$("#orgId",parent.document).attr("data-id");
var userId=$("#orgId",parent.document).attr("data-user");
var FormValidate_group = new FormValidate();
var FormValidate_person = new FormValidate();
var FormValidate_leave = new FormValidate();
// var login=getUrlParam();
var login = {userTel:localStorage.getItem("userTel"),tokenId:localStorage.getItem("tokenId")};
var treeNode = [];       //存放树节点信息-树形结构
var exportDepSelected = []; //导出时选中的部门

//校验规则--部门新增编辑
var validateConfig_group = {
    'text': {
        required: true,
        name: '名称',
        minLength:2,
        maxLength:30
    }
};
//校验规则--人员
var validateConfig_person = {
    'user': {
        required: true,
        name: '姓名',
        minLength:2,
        maxLength:10
    },
    // 'copy': {
    //     required: true,
    //     name: '部门',
    // },
    'connect_position': {
        required: true,
        name: '职位',
    },
    'user_type': {
        required: true,
        name: '成员类型',
    },
    'bussiness': {
        required: true,
        name: '厂商',
    },
    'autoBeginDate': {
        required: true,
        name: '入职时间',
    }
};
//离职原因-时间校验
var validateConfig_leave = {
    'reason': {
        required: true,
        name: '离职原因',
    },
    'time': {
        required: true,
        name: '离职时间',
    }
};
$(document).ready(function () {
    init()
});

function init() {
    middleHeight();
    queryDepOther();
    var selected;//被选中的节点
    initTree();
    if (getTree() !=undefined && getTree().length > 0) {
        var nodeId = 0;
        $('#tree').treeview('selectNode', [nodeId, { silent: true }]);
        selected=$('#tree').treeview('getSelected')[0];
        refreshBreadcrumb(nodeId);
        queryDepOther(selected.depId);
    }
    //初始化person_table
    $("#person_table").bootstrapTable('destroy').bootstrapTable({
        height:'470',
        url:api + "/data/getData",
        method:'post',
        contentType:'application/json',
        pagination:true,
        sidePagination:'server',
        smartDisplay:false,
        dataField:'data',
        totalField:'total',
        dataType:'html',
        ajaxOptions: {
            headers: {"Authorization": login.tokenId, "userTel": login.userTel},
        },
        queryParams:function(params){
            var treeSelected = $('#tree').treeview('getSelected');
            var page = {
                pageSize: params.limit,
                pageNum: (parseInt(params.offset) / parseInt(params.limit) ) + 1,
                order: {}
            };
            if (typeof params.sort !== 'undefined') {
                page.order[params.sort] = params.order;
            }
            var data = {
                orgId: orgId,
                userId:userId,
                // status:1,
                // depId:treeSelected.length > 0 ? treeSelected[0].depId : ''
                depId:treeSelected.length > 0 ? treeSelected[0].depId : getTree()[0].depId,
                queryType:1
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
        responseHandler:function(res){
            // return res.data ? res.data: [];
            res = JSON.parse(decrypt(res,getPass()));
            return res.data
        },
        // locale: "zh-CN",
        // classes: 'table table-no-bordered  table-hover-row',
        singleSelect:false,
        //行样式
        rowStyle: function (row, index) {
            return {
                css: {
                    'font-size': '13px',
                    'height': '30px',
                    'color': '#757575'
                }
            }
        },
        // striped: true,
        data:[],
        columns:[
            {
                checkbox:true,
                valign: "middle",
                width:'5%px',
                formatter: function(value, row, index) {
                    if(row.userType === 1){//如果为企业用户，则禁止勾选删除操作
                        return {
                            disabled : true,
                        }
                    }else{
                        return { disabled : false,}
                    }
                }
            },
            {field: "userName", title: "姓名",width:'15%px', align: "left", valign: "middle",formatter:function(val,row,index){
                    return val + ( row.director == 1 ? '<span class="userMarker marker-master">主管</span>'
                        : row.userStatus == 2 ? '<span class="userMarker marker-reject">已拒绝</span>'
                            : row.userStatus == 3 ? '<span class="userMarker marker-unregistered">未注册</span>'
                                : row.userStatus == 4 ? '<span class="userMarker marker-disagree">待同意</span>'
                                    : '' );
                }},
            {field: "positionName", title: "职位", width:'10%px',align: "left",valign: "middle"},
            // {field: "depName", title: "部门", align: "left",valign: "middle",visible:false},
            {field: "rankName", title: "职级", width:'10%px',align: "left", valign: "middle"},
            {field: "memberType", title: "成员类型", width:'10%px',align: "left", valign: "middle"},
            {field: "company", title: "厂商", width:'10%px',align: "left", valign: "middle"},
            {field: "entryTime", title: "入职时间", width:'10%px',align: "left", valign: "middle"},
            {field: "userTel", title: "手机号", width:'10%px',align: "left", valign: "middle"},
            {field: "userEmail", title: "邮箱",align: "left", valign: "middle",
                cellStyle:formatTableUnit,
                formatter :paramsMatter
            },
            {field: "remarks", title: "备注",align: "left", valign: "middle",
                cellStyle:formatTableUnit,
                formatter :paramsMatter
            }
        ],

        /*  * @param {点击列的 field 名称} field
          * @param {点击列的 value 值} value
          * @param {点击列的整行数据} row
          * @param {td 元素} $element*/

        onClickCell: function(field, value, row, $element) {
        },
        onDblClickRow: function (row) {
            editorUser(row,1);
        }
    });
    //表格超出宽度鼠标悬停显示td内容
    function paramsMatter(value,row,index, field) {
        value = value || '';
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
                "font-size": "13px",
                "color": "#757575"
            }
        }
    }
    $('#person_table').on('load-success.bs.table',function(data){
        // var  height = null;
        // if($('iframe',parent.document).height()){
        //     // height = $('iframe',parent.document).height()-56-30-$("#tab-four").height();
        //     // $('#personList .fixed-table-body').css('height',height);
        //     // $('#personList .fixed-table-body').css('overflow-y','auto');
        // }else{
        //     // height = $(window).height()-56-30-$("#tab-four").height();
        //     // $('#personList .fixed-table-body').css('height',height);
        //     // $('#personList .fixed-table-body').css('overflow-y','auto');
        // }
        $('#personList .fixed-table-body').css('height','470px');
        $('#personList .fixed-table-body').css('overflow','auto');
    })

    //编辑人员
    function editorUser(row,userType) {
        //绑定校验
        FormValidate_person.validateForOnly(validateConfig_person);
        var data=selected;
        $('#right_modal').modal('show');
        $("#myModalLabel1").text("编辑人员");
        //已注册且非企业用户展示快速离职按钮
        if(row.userStatus==1 && row.userType !=1){
            $("#quick_go").css('display','inline-block');
            $("#quick_go").attr('data-id',row.userId);
        }else {
            $("#quick_go").css('display','none');
        }
        //除了1-已同意的正式员工不展示删除按钮，其他都要展示删除按钮
        if(row.userStatus==1){
            $("#deleteUser").css('display','none');
        }else {
            $("#deleteUser").css('display','inline-block');
        }
        if(row.userStatus==3){//用户状态 1-已同意 2--已拒绝 3-未注册 4-已注册 5--已退出6 --已删除
            // 只有状态是3 的才允许修改手机号码
            $("#phone_title").css('display','none');
            $("#phone").attr("disabled",false);
        }else {
            $("#phone_title").css('display','inline-block');
            $("#phone").attr("disabled",true);
        }
        // 调用职务的下拉选择框
        position(row.positionName,row.rankName,row.company,row.memberType);

        $("#user").val(row.userName);
        $("#userName").attr('data-id',row.userId);

        // $("#copy").val(selected.depName);
        // $("#copy").attr('data-id',selected.depId);
        //bug 2172
        $("#copy").val(row.depName);
        $("#copy").attr('data-id',row.depId);

        $("#autoBeginDate").datetimepicker('remove');

        //渲染时间
        if(row.userStatus<=4 && row.userStatus >=2){
            $('#autoBeginDate').datetimepicker({
                format: 'yyyy-mm-dd',
                weekStart: 1,
                autoclose: true,
                startView: 2,
                minView: 2,
                forceParse: false,
                language: 'zh-CN'
            })
        }else{
            $('#autoBeginDate').prop('readonly',true);
        }
        $("#autoBeginDate").val(row.entryTime);

        $("#email").val(row.userEmail);

        $("#phone").val(row.userTel);

        $("#textArea").val(row.remarks);

        // 点击编辑人员的保存按钮调用方法
        var $gotoSubmit=$("#gotoSubmit").ladda();
        $("#gotoSubmit").unbind().bind('click',function () {
            var flag = FormValidate_person.validate($('#person_model')[0], validateConfig_person);
            if(flag==false){
                return '';
            }else{
                $gotoSubmit.ladda('start');
                setTimeout(function () {
                    var param={
                        "id": new Date().getTime(),
                        "client": {},
                        "data": {
                            "module": "main-api",
                            "url": "/api/user/updateUser",
                            "param":{
                                "userId":row.userId,
                                "type":userType,
                                "positionName":$("#connect_position").val(),
                                "rankName":$("#connect_level").val(),
                                "memberType":$("#user_type").val(),
                                "company":$("#bussiness").val(),
                                "entryTime":$("#autoBeginDate").val(),
                                "userTel":$("#phone").val(),
                                "userEmail":$("#email").val(),
                                "remarks":$("#textArea").val(),
                                "userName":$("#user").val(),
                                "createBy":userId,
                                "orgId":orgId,
                                "depId":$("#copy").attr('data-id')
                            }
                        }
                    }
                    $.ajax({
                        url: api+'/data/getData',    //请求的url地址
                        dataType: "html",   //返回格式为json
                        async: false,//请求是否异步，默认为异步，这也是ajax重要特性
                        data: encrypt(JSON.stringify(param),getPass()),    //参数值
                        type: "POST",   //请求方式
                        contentType: 'application/json;charset=UTF-8',
                        beforeSend: function (request) {
                            //请求前的处理
                            request.setRequestHeader("Authorization", login.tokenId);
                            request.setRequestHeader("userTel", login.userTel);
                        },
                        success: function (req) {
                            req = JSON.parse(decrypt(req,getPass()));
                            $gotoSubmit.ladda('stop');
                            if (req.status === 0) {
                                //请求成功时处理
                                $('#right_modal').modal('hide');
                                selected = data;
                                $("#person_table").bootstrapTable('refresh');
                                //编辑人员后更新组织外总数
                                queryDepOther($("#copy").attr('data-id'));
                                queryDepOther(selected.depId);
                                initOrgOutPerson(selected.depId);
                                sweetAlert({
                                    title: "信息",
                                    text: "提交成功！",
                                    type: "success",
                                    confirmButtonColor: "#3197FA",
                                    confirmButtonText: "确定",
                                }, function () {
                                    $("#myTab button").removeClass('active');
                                });
                            } else {
                                sweetAlert({
                                    title: "信息",
                                    text: req.message,
                                    type: 'warning',
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
                },100)
            }
        })


        //点击快速离职按钮
        $("#quick_go").unbind().bind('click',function () {
            //入职时间在未来，不给离职
            if(new Date(row.entryTime).valueOf() > new Date().valueOf()){
                sweetAlert({
                    title: "信息",
                    text: '用户还未入职，不可进行离职操作',
                    type: 'warning',
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定"
                });
                return false;
            }
            $("#quick_modal").modal('show');
            $('#time').val('');
            $('#remark').val('');
            for (var Key in validateConfig_leave){
                FormValidate_leave.removeErrorStyle(Key);
            }
            //绑定校验
            // FormValidate_leave.validateForOnly(validateConfig_leave);
            //渲染时间
            $('#time').datetimepicker('remove');
            $('#time').datetimepicker({
                format: 'yyyy-mm-dd',
                weekStart: 1,
                autoclose: true,
                startView: 2,
                minView: 2,
                forceParse: false,
                language: 'zh-CN',
                startDate:row.entryTime,
                endDate:formatDate(new Date(),'yyyy-MM-dd')
            })
            //初始化离职原因
            var html = '';
            html += '<option value="家庭原因">家庭原因</option><option value="个人原因">个人原因</option><option value="发展原因">发展原因</option><option value="无法胜任工作">无法胜任工作</option><option value="严重违法违纪">严重违法违纪</option><option value="组织人员调整">组织人员调整</option><option value="其他">其他</option>';
            $('#reason').html(html);
            $('#reason').selectpicker("destroy");
            $('#reason').selectpicker('refresh');
            $('#reason').selectpicker('render');
            // $('#reason').selectpicker({ width: '100%',noneSelectedText:'请选择...'  });

            //点击确认离职
            var $gotoSubmit1=$("#gotoSubmit1").ladda();
            $("#gotoSubmit1").unbind().bind('click',function () {
                var flag = FormValidate_leave.validate($('#leaval_model')[0], validateConfig_leave);
                if(flag==false){
                    return '';
                }else {
                    $gotoSubmit.ladda('start');
                    var param={
                        "id": new Date().getTime(),
                        "client": {},
                        "data": {
                            "module": "main-api",
                            "url": "/api/user/userQuit",
                            "param":{
                                "createBy":userId,
                                "idList":[row.userId],
                                "quitDay":$('#time').val(),
                                "quitReason":$('#reason').val().join(","),
                                "orgId":orgId
                            }
                        }
                    }
                    $.ajax({
                        url: api+'/data/getData',    //请求的url地址
                        dataType: "html",   //返回格式为json
                        async: false,//请求是否异步，默认为异步，这也是ajax重要特性
                        data: encrypt(JSON.stringify(param),getPass()),    //参数值
                        type: "POST",   //请求方式
                        contentType: 'application/json;charset=UTF-8',
                        beforeSend: function (request) {
                            //请求前的处理
                            request.setRequestHeader("Authorization", login.tokenId);
                            request.setRequestHeader("userTel", login.userTel);
                        },
                        success: function (req) {
                            req = JSON.parse(decrypt(req,getPass()));
                            $gotoSubmit.ladda('stop');
                            if (req.status === 0) {
                                //请求成功时处理
                                $("#right_modal").modal('hide');
                                $("#quick_modal").modal('hide');
                                $("#person_table").bootstrapTable('refresh');
                                sweetAlert({
                                    title: "信息",
                                    text: "提交成功！",
                                    type: "success",
                                    confirmButtonColor: "#3197FA",
                                    confirmButtonText: "确定",
                                }, function () {
                                    $("#myTab button").removeClass('active');
                                });
                            } else {
                                sweetAlert({
                                    title: "信息",
                                    text: req.message,
                                    type: 'warning',
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
                }
            })
        })

        //点击删除按钮
        var $deleteUser=$("#deleteUser").ladda();
        $deleteUser.unbind().bind('click',function () {
            sweetAlert({
                title: "确认信息",
                text: "确认删除该成员？删除仅用于清理错误数据，请谨慎操作！",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3197FA",
                cancelButtonColor: "#FFFFFF",
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                closeOnConfirm: false
            }, function () {
                $deleteUser.ladda('start');
                var data=[];
                data[0]=row.userId;
                var param={
                    "id": new Date().getTime(),
                    "client": {},
                    "data": {
                        "module": "main-api",
                        "url": "/api/user/deleteUser",
                        "param":{
                            "idList":data
                        }
                    }
                }
                $.ajax({
                    url:api+"/data/getData",    //请求的url地址
                    dataType:"html",   //返回格式为json
                    async:true,//请求是否异步，默认为异步，这也是ajax重要特性
                    data:encrypt(JSON.stringify(param),getPass()),    //参数值
                    type:"POST",   //请求方式
                    contentType: 'application/json;charset=UTF-8',
                    beforeSend:function(request){
                        //请求前的处理
                        request.setRequestHeader("Authorization", login.tokenId);
                        request.setRequestHeader("userTel", login.userTel);
                    },
                    success:function(req){
                        req = JSON.parse(decrypt(req,getPass()));
                        $deleteUser.ladda('stop');
                        $('#right_modal').modal('hide');
                        if (req.status === 0) {
                            //请求成功时处理
                            $("#person_table").bootstrapTable('refresh');
                            //更新组织外总数
                            queryDepOther(selected.depId);
                            sweetAlert({
                                title: "信息",
                                text: "提交成功！",
                                type: "success",
                                confirmButtonColor: "#3197FA",
                                confirmButtonText: "确定",
                            }, function () {
                                $("#myTab button").removeClass('active');

                            });

                        } else {
                            sweetAlert({
                                title: "信息",
                                text: req.message,
                                type: 'warning',
                                confirmButtonColor: "#3197FA",
                                confirmButtonText: "确定",
                            });
                        }
                    },
                    complete:function(){
                        //请求完成的处理
                    },
                    error:function(){
                        //请求出错处理
                    }
                });

            })
        })

    }
    //组织外编辑人员
    window.editorUser_=function(index){
        var data=$("#no_reg_table").bootstrapTable('getData');
        var row=data[index];
        editorUser(row,2);
        //更新表格
        //initOrgOutPerson(selected.depId);
    }
    $('#tree').on('nodeSelected', function(event, data) {
        //再添加节点前，需要清空展开节点下的子节点，否则会累计很多节点。
        selected=data;
        refreshBreadcrumb(data.nodeId);
        queryDepOther(data.depId);
        $("#person_table").bootstrapTable('refresh',{pageNumber:1});
    });
    // 新增，编辑职级，职位的下拉选择框
    function position(position,level,bussiness,userType){
        var param={
            "id": new Date().getTime(),
            "client": {},
            "data": {
                "module": "main-api",
                "url": '/api/setting/search',
                "param":{
                    "orgId": orgId,
                    "keyword":""
                }
            }
        }
        $('.dropdown-toggle').dropdown();

        //职位
        var param_position=param;
        param_position.data.param.enumType=1;
        var _cfg = {
            url:api+'/data/getData',
            id:'connect_position',
            parameter:encrypt(JSON.stringify(param_position),getPass()),
            default:position
        };
        tools.loadSelect2(_cfg);
        $('#connect_position').selectpicker({ width: '100%',noneSelectedText:'请选择...'  });

        //职级
        var param_level=param;
        param_level.data.param.enumType=2;
        var _cfg1 = {
            url:api+'/data/getData',
            id:'connect_level',
            parameter:encrypt(JSON.stringify(param_level),getPass()),
            default:level
        };
        tools.loadSelect2(_cfg1);
        $('#connect_level').selectpicker({ width: '100%' ,noneSelectedText:'请选择...' });


        //成员类型
        // var param_type=param;
        // param_type.data.param.enumType=3;
        // var _cfg2 = {
        //     url:api+'/data/getData',
        //     id:'user_type',
        //     parameter:JSON.stringify(param_type),
        // };
        // tools.loadSelect2(_cfg2);
        var html = '<option value=" ">请选择...</option>';
        html += '<option value="甲方">甲方</option><option value="乙方">乙方</option>';
        $('#user_type').html(html);
        $('#user_type').selectpicker("destroy");
        $('#user_type').selectpicker('refresh');
        $('#user_type').selectpicker('render');
        $('#user_type').selectpicker({ width: '100%',noneSelectedText:'请选择...'  });
        if(userType && userType!="请选择..."){
            $('#user_type').selectpicker('val',userType);
        }


        //厂商
        var param_bussiness=param;
        param_bussiness.data.param.enumType=4;
        var _cfg3 = {
            url:api+'/data/getData',
            id:'bussiness',
            parameter:encrypt(JSON.stringify(param_bussiness),getPass()),
            default:bussiness
        };
        tools.loadSelect2(_cfg3);
        $('#bussiness').selectpicker({ width: '100%',noneSelectedText:'请选择...'  });
    }
    //新增部门
    $("#add").unbind().bind('click',function () {
        //选中状态
        var $this=$(this);
        $this.siblings().removeClass('active');
        $this.addClass('active');

        //初始化数据
        $("#text").val("");
        $("#please1").val(selected.depName);
        $('#please1').attr("disabled",false);
        $("#please1").attr("data-id",selected.depId);
        $("input[type=radio][name='optionsRadiosinline'][value='1']").prop("checked", true);//默认选中否
        var $this=$(this);
        $('#left_modal').modal('show');
        $("#delete_org").css('display','none');
        $("#myModalLabel").text($this.text());
        //选择部门主管
        $("#user-content").css('display','none');
        for (var Key in validateConfig_group){
            FormValidate_group.removeErrorStyle(Key);
        }
        //绑定校验
        FormValidate_group.validateForOnly(validateConfig_group);


        // 编辑的时候点击保存提交数据
        var $toSubmit =$("#toSubmit");
        $("#toSubmit").unbind().bind('click',function () {
            $toSubmit.ladda();
            var flag = FormValidate_group.validate($('#grpup_model')[0], validateConfig_group);
            // 判断是否选中节点，选中的话父对象填选中的值，没有选中的话父对象选-1
            if(flag==false){
                return '';
            }else{
                $toSubmit.ladda('start');
                setTimeout(function() {
                    var param={
                        "id": new Date().getTime(),
                        "client": {},
                        "data": {
                            "module": "main-api",
                            "url": "/api/dep/add",
                            "param":{
                                "orgId": orgId,
                                "parentDepId": $("#please1").attr('data-id')?$("#please1").attr('data-id'):'',
                                "createBy":userId,
                                "userType":userType,
                                "depName":$("#text").val(),
                                "visibility":$('input[name="optionsRadiosinline"]:checked').val()
                            }
                        }
                    }
                    $.ajax({
                        url: api+'/data/getData',    //请求的url地址
                        dataType: "html",   //返回格式为json
                        async: false,//请求是否异步，默认为异步，这也是ajax重要特性
                        data: encrypt(JSON.stringify(param),getPass()),    //参数值
                        type: "POST",   //请求方式
                        contentType: 'application/json;charset=UTF-8',
                        beforeSend:function(request){
                            //请求前的处理
                            request.setRequestHeader("Authorization", login.tokenId);
                            request.setRequestHeader("userTel", login.userTel);
                        },
                        success: function (req) {
                            req = JSON.parse(decrypt(req,getPass()));
                            $toSubmit.ladda('stop');
                            if (req.status === 0) {
                                $('#left_modal').modal('hide');
                                $('#tree').treeview('destroy');
                                init();
                                //请求成功时处理
                                sweetAlert({
                                    title: "信息",
                                    text: "提交成功！",
                                    type: "success",
                                    confirmButtonColor: "#3197FA",
                                    confirmButtonText: "确定",
                                }, function () {
                                    $("#myTab button").removeClass('active');
                                });
                            } else {
                                sweetAlert({
                                    title: "信息",
                                    text: req.message,
                                    type: 'warning',
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
                },10);
            }
        })
    });
    // 点击上级部门
    $("#please1").unbind().bind('click',function () {
        $("#orginzation").modal('show');
        $("#choose").empty();
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
                    "userId":userId,
                    queryType:3
                }

            }
        };
        var data=getTreeContent(params)
        getOrganization(data);
        //关闭
        $(".close").unbind().bind('click',function () {
            $("#orginzation").modal('hide');
            $("#myTab button").removeClass('active');
        })
        $("#guanbi_org").unbind().bind('click',function () {
            $("#orginzation").modal('hide');
            $("#myTab button").removeClass('active');
        })


    })
    //编辑部门
    $("#save").unbind().bind('click',function () {
        //选中状态
        var $this=$(this);
        $this.siblings().removeClass('active');
        $this.addClass('active');
        if (selected === undefined) {
            sweetAlert({
                title: "信息",
                text: "请选择要编辑的数据!",
                type:'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定",
            });
        } else {
            $('#please1').attr("disabled",true);
            if(selected.parentDepId=='-1'){//判断是否为根节点
                $("#please1").attr('data-id',selected.parentDepId);
                $("#please1").val("");
            }else {
                var parentId=$('#tree').treeview('getParent', selected.nodeId);
                $("#please1").attr('data-id',parentId.depId);
                $("#please1").val(parentId.depName);
            }

            //查询是否已有部门主管
            var param_manger={
                "id": new Date().getTime(),
                "client": {},
                "data": {
                    "module": "main-api",
                    "url": "/api/dep/findByDepId",
                    "param":{
                        "depId":selected.depId
                    }
                }
            }
            $.ajax({
                url: api+'/data/getData',    //请求的url地址
                dataType: "html",   //返回格式为json
                async: false,//请求是否异步，默认为异步，这也是ajax重要特性
                data: encrypt(JSON.stringify(param_manger),getPass()),    //参数值
                type: "POST",   //请求方式
                contentType: 'application/json;charset=UTF-8',
                beforeSend:function(request){
                    //请求前的处理
                    request.setRequestHeader("Authorization", login.tokenId);
                    request.setRequestHeader("userTel", login.userTel);
                },
                success: function (req) {
                    req = JSON.parse(decrypt(req,getPass()));
                    if (req.status === 0) {
                        //请求成功时处理
                        var data=req.data.data;
                        if(data.userId != "" && data.userName != "" ){
                            $("#username").val(data.userName);
                            $("#username").attr("data-selected",data.userId);
                        }else {
                            $("#username").val("");
                            $("#username").attr("data-selected",'');
                        }
                    } else {

                    }
                },
                complete: function () {
                    //请求完成的处理
                },
                error: function () {
                    //请求出错处理
                }
            });

            $('#left_modal').modal('show');
            $('#text').css('disabled','disabled');
            $("#myModalLabel").text($this.text());
            $("#toSubmit").text('确定');
            $("#delete_org").css('display','inline-block');
            //选择部门主管
            $("#user-content").css('display','block');
            if(selected.visibility==0){
                $("input[type=radio][name='optionsRadiosinline'][value='0']").prop("checked", true);//默认选中否
            }else if(selected.visibility==1){
                $("input[type=radio][name='optionsRadiosinline'][value='1']").prop("checked", true);//默认选中否
            }

            //部门主管
            $("#username").unbind().bind('click',function () {
                $("#org_serarch").val("");
                $('#memberSelectDialog').modal('show');
                createUserTable('memberTable',selected.depId,"");
                //点击查询按钮
                $("#search_org").unbind().bind('click',function () {
                    createUserTable('memberTable',selected.depId,$("#org_serarch").val());
                })

                //保存主管
                $('#memberSelectDialogConfirmBtn').off('click').on('click',function(){
                    var data = $('#memberTable').bootstrapTable("getSelections");
                    if(!Array.isArray(data) && data.length === 0){
                        sweetalert({
                            title: "信息",
                            text: "请选择审批人",
                            type: "warning",
                            confirmButtonColor: "#3197FA",
                            confirmButtonText: "确定"
                        });
                        return false;
                    }
                    $("#username").text(data[0].userName);
                    $("#username").val(data[0].userName);
                    $("#username").attr('data-selected',data[0].userId);
                    $('#memberSelectDialog').modal('hide');
                });

            })
            for (var Key in validateConfig_group){
                FormValidate_group.removeErrorStyle(Key);
            }
            //绑定校验
            FormValidate_group.validateForOnly(validateConfig_group);
            var data = selected;
            // 获取所选节点的父节点
            var parentNode = $('#tree').treeview('getParent', data.nodeId);
            selected.parent=parentNode.id;

            $('#text').val(data.depName);
            $('#text').attr('data-id',data.depId);
            var $toSubmit=$("#toSubmit").ladda();
            // 编辑的时候点击保存提交数据
            $("#toSubmit").unbind().bind('click', function () {
                var flag = FormValidate_group.validate($('#grpup_model')[0], validateConfig_group);
                if(flag==false){
                    return '';
                }else{
                    var param={
                        "id": new Date().getTime(),
                        "client": {},
                        "data": {
                            "module": "main-api",
                            "url": "/api/dep/modify",
                            "param":{
                                "orgId": orgId,
                                "parentDepId": $("#please1").attr('data-id')?$("#please1").attr('data-id'):'',
                                "createBy":userId,
                                "userType":userType,
                                "depName":$("#text").val(),
                                "depId":$("#text").attr("data-id"),
                                "visibility":$('input[name="optionsRadiosinline"]:checked').val(),
                                "userId":$("#username").attr('data-selected')?$("#username").attr('data-selected'):''
                            }
                        }
                    }
                    $toSubmit.ladda('start');
                    setTimeout(function() {
                        $.ajax({
                            url: api+'/data/getData',    //请求的url地址
                            dataType: "html",   //返回格式为json
                            async: false,//请求是否异步，默认为异步，这也是ajax重要特性
                            data: encrypt(JSON.stringify(param),getPass()),    //参数值
                            type: "POST",   //请求方式
                            contentType: 'application/json;charset=UTF-8',
                            beforeSend:function(request){
                                //请求前的处理
                                request.setRequestHeader("Authorization", login.tokenId);
                                request.setRequestHeader("userTel", login.userTel);
                            },
                            success: function (req) {
                                req = JSON.parse(decrypt(req,getPass()));
                                $toSubmit.ladda('stop');
                                if (req.status === 0) {
                                    //请求成功时处理
                                    $('#left_modal').modal('hide');
                                    $('#tree').treeview('destroy');
                                    init();
                                    sweetAlert({
                                        title: "信息",
                                        text: "提交成功！",
                                        type: "success",
                                        confirmButtonColor: "#3197FA",
                                        confirmButtonText: "确定",
                                    }, function () {
                                        $("#myTab button").removeClass('active');

                                    });

                                } else {
                                    sweetAlert({
                                        title: "信息",
                                        text: req.message,
                                        type: 'warning',
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
                    },100)
                }
            })
            //删除部门
            $("#delete_org").unbind().bind('click',function () {
                sweetAlert({
                    title: "确认信息",
                    text: "确定要删除吗?",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3197FA",
                    cancelButtonColor: "#FFFFFF",
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    closeOnConfirm: false
                }, function () {
                    var param={
                        "id": new Date().getTime(),
                        "client": {},
                        "data": {
                            "module": "main-api",
                            "url": "/api/dep/delete",
                            "param":{
                                "orgId": orgId,
                                "depId":selected.id,
                                "updateBy":userId
                            }
                        }
                    }
                    $.ajax({
                        url: api+'/data/getData',    //请求的url地址
                        dataType: "html",   //返回格式为json
                        async: true,//请求是否异步，默认为异步，这也是ajax重要特性
                        data: encrypt(JSON.stringify(param),getPass()),
                        type: "POST",   //请求方式
                        contentType: 'application/json;charset=UTF-8',
                        beforeSend:function(request){
                            //请求前的处理
                            request.setRequestHeader("Authorization", login.tokenId);
                            request.setRequestHeader("userTel", login.userTel);
                        },
                        success: function (res) {
                            res = JSON.parse(decrypt(res,getPass()));
                            if(res.status == 0){
                                $('#left_modal').modal('hide');
                                sweetAlert({
                                    title: "信息",
                                    text: "删除成功！",
                                    type: "success",
                                    confirmButtonColor: "#3197FA",
                                    confirmButtonText: "确定",
                                }, function () {
                                    $('#tree').treeview('destroy');
                                    init();

                                });


                            }else {
                                sweetAlert({
                                    title: "信息",
                                    text: res.message,
                                    type: 'warning',
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
            })

        }
    });
    //部门排序
    $("#sort").unbind().bind('click',function () {
        //选中状态
        var $this=$(this);
        $this.siblings().removeClass('active');
        $this.addClass('active');

        $("#orginzation_sort").modal('show');
        $("#choose1").empty();
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
                    "userId":userId,
                    queryType:3
                }
            }
        };
        var data=getTreeContent(params);
        sortOrganizaton(data);
        //关闭
        $(".close").unbind().bind('click',function () {
            $("#orginzation_sort").modal('hide');
            $("#myTab button").removeClass('active');
        })
        $("#guanbi_sort").unbind().bind('click',function () {
            $("#orginzation_sort").modal('hide');
            $("#myTab button").removeClass('active');
        })
        var $gotoSubmit_sort=$("#gotoSubmit_sort").ladda();
        //保存
        $("#gotoSubmit_sort").unbind().bind('click',function () {
            $gotoSubmit_sort.ladda('start');
            var list= $("#sort_list").bootstrapTable('getData');
            var _list=[];
            for(var i=0;i<list.length;i++){
                _list.push(list[i].depId)
            };
            var param={
                "id": new Date().getTime(),
                "client": {},
                "data": {
                    "module": "main-api",
                    "url": "/api/dep/updateSort",
                    "param":{
                        "idList": _list,
                        "updateBy":userId,
                    }
                }
            }
            $.ajax({
                url:api+"/data/getData",    //请求的url地址
                dataType:"html",   //返回格式为json
                async:true,//请求是否异步，默认为异步，这也是ajax重要特性
                data:encrypt(JSON.stringify(param),getPass()),    //参数值
                type:"POST",   //请求方式
                contentType: 'application/json;charset=UTF-8',
                beforeSend:function(request){
                    //请求前的处理
                    request.setRequestHeader("Authorization", login.tokenId);
                    request.setRequestHeader("userTel", login.userTel);
                },
                success:function(req){
                    req = JSON.parse(decrypt(req,getPass()));
                    $gotoSubmit_sort.ladda('stop');
                    if (req.status === 0) {
                        //请求成功时处理
                        $('#orginzation_sort').modal('hide');
                        $('#tree').treeview('destroy');
                        init();
                        sweetAlert({
                            title: "信息",
                            text: "提交成功！",
                            type: "success",
                            confirmButtonColor: "#3197FA",
                            confirmButtonText: "确定",
                        }, function () {
                            $("#myTab button").removeClass('active');
                        });

                    } else {
                        sweetAlert({
                            title: "信息",
                            text: req.message,
                            type: 'warning',
                            confirmButtonColor: "#3197FA",
                            confirmButtonText: "确定",
                        });
                    }
                },
                complete:function(){
                    //请求完成的处理
                },
                error:function(){
                    //请求出错处理
                }
            });

        })
    })
    //批量删除
    var $deleteBtn=$("#deleteBtn").ladda();
    $("#deleteBtn").unbind().bind('click',function () {
        //选中状态
        var $this=$(this);
        $this.siblings().removeClass('active');
        $this.addClass('active');
        var list=$("#person_table").bootstrapTable("getSelections");
        if(list.length==0){
            sweetAlert({
                title: "信息",
                text: "请选择删除人员",
                type: 'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            },function(){
                $("#deleteBtn").removeClass('active');
            });
            return;
        }else {
            sweetAlert({
                title: "确认信息",
                text: "确认删除"+list.length+"位成员?删除仅用于清理错误数据,请谨慎操作!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3197FA",
                cancelButtonColor: "#FFFFFF",
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                closeOnConfirm:false,
                closeOnCancel:true
            }, function (isConfirm) {
                if(isConfirm){
                    var data=[];
                    var flag=false;
                    for(var i=0;i<list.length;i++){
                        if(list[i].userStatus==1){
                            flag=true;
                        }else {
                            data.push(list[i].userId);
                        }
                    }
                    if(flag){
                        sweetAlert({
                            title: "信息",
                            text: "禁止删除正式成员，请排除相关条目后再行操作。",
                            type: 'warning',
                            confirmButtonColor: "#3197FA",
                            confirmButtonText: "确定",
                        });
                    }else {
                        $deleteBtn.ladda('start');
                        var param={
                            "id": new Date().getTime(),
                            "client": {},
                            "data": {
                                "module": "main-api",
                                "url": "/api/user/deleteUser",
                                "param":{
                                    "idList":data
                                }
                            }
                        }
                        $.ajax({
                            url:api+"/data/getData",    //请求的url地址
                            dataType:"html",   //返回格式为json
                            async:true,//请求是否异步，默认为异步，这也是ajax重要特性
                            data:encrypt(JSON.stringify(param),getPass()),    //参数值
                            type:"POST",   //请求方式
                            contentType: 'application/json;charset=UTF-8',
                            beforeSend:function(request){
                                //请求前的处理
                                request.setRequestHeader("Authorization", login.tokenId);
                                request.setRequestHeader("userTel", login.userTel);
                            },
                            success:function(req){
                                req = JSON.parse(decrypt(req,getPass()));
                                $deleteBtn.ladda('stop');
                                if (req.status === 0) {
                                    //请求成功时处理
                                    $("#person_table").bootstrapTable('refresh');
                                    //更新组织外总数
                                    queryDepOther(selected.depId);
                                    sweetAlert({
                                        title: "信息",
                                        text: "提交成功！",
                                        type: "success",
                                        confirmButtonColor: "#3197FA",
                                        confirmButtonText: "确定",
                                    }, function () {
                                        $("#myTab button").removeClass('active');

                                    });

                                } else {
                                    sweetAlert({
                                        title: "信息",
                                        text: req.message,
                                        type: 'warning',
                                        confirmButtonColor: "#3197FA",
                                        confirmButtonText: "确定",
                                    });
                                }
                            },
                            complete:function(){
                                //请求完成的处理
                            },
                            error:function(){
                                //请求出错处理
                            }
                        });
                    }

                }else {
                    $("#person_table").bootstrapTable('refresh');
                    $("#myTab button").removeClass('active');

                }


            })

        }
    })
    //组织外
    $("#org_out").unbind().bind('click',function () {
        if(selected===undefined){
            sweetAlert({
                title: "信息",
                text: "请选择一个部门!",
                type:'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定",
            });
        }else {
            //选中状态
            var $this=$(this);
            $this.siblings().removeClass('active');
            $this.addClass('active');

            $('.list-wrap').addClass('fn-hide');
            $('#outOfOrg').removeClass('fn-hide');
            initOrgOutPerson(selected.depId);
            // var noRegTableOption = createOutOfOrgTableOption(3,selected.depId);       //组织外-未注册-tableOption
            // var cfgWaitTrueTableOption = createOutOfOrgTableOption(4,selected.depId); //组织外-待同意-tableOption
            // var cfgRejectTableOption = createOutOfOrgTableOption(2,selected.depId);   //组织外-已拒绝-tableOption
            //
            // // 组织外-未注册-tableOption 追加一列操作项
            // noRegTableOption.columns.push(
            //     {field:'',title:'操作',formatter:function(val,row,index){
            //         if(row.againMsg==1){
            //             return '<button class="btn btn-cancel" style="margin-right: 10px;color: #BAC3CA;background: #EEEEEE;">再次发送</button>' +
            //                 '<button class="btn btn-cancel" onclick="editorUser_('+index+');">编辑成员</button>'
            //         }else {
            //             return '<button class="btn btn-cancel" style="margin-right: 10px;" onclick="send(\''+row.userId+'\',\''+row.userName+'\',\''+row.userTel+'\',1'+')">再次发送</button>' +
            //                 '<button class="btn btn-cancel" onclick="editorUser_('+index+');">编辑成员</button>'
            //         }
            //
            //         }}
            // )
            // //组织外-已拒绝-tableOption 追加一列操作项
            // cfgRejectTableOption.columns.push(
            //     {field:'',title:'操作',formatter:function(val,row,index){
            //             return '<button class="btn btn-cancel" style="margin-right: 10px;" onclick="send(\''+row.userId+'\',\''+row.userName+'\',\''+row.userTel+'\',2'+')">再次发送</button>' +
            //                 '<button class="btn btn-cancel" onclick="delete_user(\''+row.userId+'\');">删除成员</button>'
            //
            //         }}
            // )
            //
            // $('#no_reg_table').bootstrapTable("destroy").bootstrapTable(noRegTableOption);
            // $('#wait_true_table').bootstrapTable("destroy").bootstrapTable(cfgWaitTrueTableOption);
            // $('#reject_table').bootstrapTable("destroy").bootstrapTable(cfgRejectTableOption);

            // 下面的是注释掉的，可删
            // //获取组织外总数
            // var param={
            //     "id":new Date().getTime(),
            //     "client":{ },
            //     "data":{
            //         "module": "main-api",
            //         "url": "/api/dep/queryDepOther",
            //         "param":{
            //             "orgId":orgId,
            //         }
            //     }
            // };
            // $.ajax({
            //     url: api+'/data/getData',    //请求的url地址
            //     dataType: "json",   //返回格式为json
            //     async: true,//请求是否异步，默认为异步，这也是ajax重要特性
            //     data: JSON.stringify(param),
            //     type: "POST",   //请求方式
            //     contentType: 'application/json;charset=UTF-8',
            //     beforeSend:function(request){
            //         //请求前的处理
            //         request.setRequestHeader("Authorization", login.tokenId);
            //     },
            //     success: function (res) {
            //         if(res.status == 0){
            //
            //
            //         }
            //     },
            //     complete: function () {
            //         //请求完成的处理
            //     },
            //     error: function () {
            //         //请求出错处理
            //     }
            // });
            // //未注册
            // var param_no={
            //     "id":new Date().getTime(),
            //     "client":{ },
            //     "data":{
            //         "module": "main-api",
            //         "url": "/api/user/findByStatus",
            //         "param":{
            //             "orgId":orgId,
            //             "status":3,
            //         },
            //         "page": {
            //             "pageNum": 1,
            //             "pageSize": 15,
            //             "order": {
            //                 "col1": "asc",
            //                 "col2": "desc"
            //             }
            //         }
            //     }
            // }
            // var cfg_no_reg = {
            //     columns:[{
            //         field: "id",
            //         title: "ID",
            //         align: "left",
            //         valign: "middle"
            //     },{
            //         field: "name",
            //         title: "名称",
            //         align: "left",
            //         valign: "middle",
            //     },{
            //         field: "type",
            //         title: "类型",
            //         align: "left",
            //         valign: "middle"
            //     },{
            //         align: "center",
            //         width: '100',
            //         title: "操作",
            //         formatter: function (value, row) {
            //             return '<a href="javascript:void(0)" type="button" class="change btn-self-blue" onclick="change()" data-id="'+row.id+'">编辑</a>';
            //         }
            //     }
            //     ],
            //     url: api+"/data/getData",   //请求的url地址
            //     params: function(){
            //         return JSON.stringify(param_no)
            //     },
            //     method:'post',
            //     dataField: "data",
            //     pagination:false,
            //     rowStyle: function (row, index) {
            //         return {
            //             css: {
            //                 'font-size':'12px',
            //                 'height': '30px',
            //                 'color': '#757575'
            //             }
            //         }
            //     },
            // };
            // var oTable = tools.createTable('no_reg_table',cfg_no_reg);
            // oTable.Init();
            // //待同意
            // var param_wait_true={
            //     "id":new Date().getTime(),
            //     "client":{ },
            //     "data":{
            //         "module": "main-api",
            //         "url": "/api/user/findByStatus",
            //         "param":{
            //             "orgId":orgId,
            //             "status":1,
            //         },
            //         "page": {
            //             "pageNum": 1,
            //             "pageSize": 15,
            //             "order": {
            //                 "col1": "asc",
            //                 "col2": "desc"
            //             }
            //         }
            //     }
            // }
            // var cfg_wait_true = {
            //     columns:[{
            //         field: "id",
            //         title: "ID",
            //         align: "left",
            //         valign: "middle"
            //     },{
            //         field: "name",
            //         title: "名称",
            //         align: "left",
            //         valign: "middle",
            //     },{
            //         field: "type",
            //         title: "类型",
            //         align: "left",
            //         valign: "middle"
            //     },{
            //         align: "center",
            //         width: '100',
            //         title: "操作",
            //         formatter: function (value, row) {
            //             return '<a href="javascript:void(0)" type="button" class="change btn-self-blue" onclick="change()" data-id="'+row.id+'">编辑</a>';
            //         }
            //     }
            //     ],
            //     url: api+"/data/getData",   //请求的url地址
            //     params: function(){
            //         return JSON.stringify(param_wait_true)
            //     },
            //     method:'post',
            //     dataField: "data",
            //     pagination:false,
            //     rowStyle: function (row, index) {
            //         return {
            //             css: {
            //                 'font-size':'12px',
            //                 'height': '30px',
            //                 'color': '#757575'
            //             }
            //         }
            //     },
            // };
            // var oTable_wait_true = tools.createTable('wait_true_table',cfg_wait_true);
            // oTable_wait_true.Init();
            // //已拒绝
            // var param_reject={
            //     "id":new Date().getTime(),
            //     "client":{ },
            //     "data":{
            //         "module": "main-api",
            //         "url": "/api/user/findByStatus",
            //         "param":{
            //             "orgId":orgId,
            //             "status":2,
            //         },
            //         "page": {
            //             "pageNum": 1,
            //             "pageSize": 15,
            //             "order": {
            //                 "col1": "asc",
            //                 "col2": "desc"
            //             }
            //         }
            //     }
            // }
            // var cfg_reject = {
            //     columns:[{
            //         field: "id",
            //         title: "ID",
            //         align: "left",
            //         valign: "middle"
            //     },{
            //         field: "name",
            //         title: "名称",
            //         align: "left",
            //         valign: "middle",
            //     },{
            //         field: "type",
            //         title: "类型",
            //         align: "left",
            //         valign: "middle"
            //     },{
            //         align: "center",
            //         width: '100',
            //         title: "操作",
            //         formatter: function (value, row) {
            //             return '<a href="javascript:void(0)" type="button" class="change btn-self-blue" onclick="change()" data-id="'+row.id+'">编辑</a>';
            //         }
            //     }
            //     ],
            //     url: api+"/data/getData",   //请求的url地址
            //     params: function(){
            //         return JSON.stringify(param_reject)
            //     },
            //     beforeSend:function(request){
            //         //请求前的处理
            //         request.setRequestHeader("Authorization", login.tokenId);
            //     },
            //     method:'post',
            //     dataField: "data",
            //     pagination:false,
            //     rowStyle: function (row, index) {
            //         return {
            //             css: {
            //                 'font-size':'12px',
            //                 'height': '30px',
            //                 'color': '#757575'
            //             }
            //         }
            //     },
            // };
            // var oTable_reject = tools.createTable('reject_table',cfg_reject);
            // oTable_reject.Init();

            $("#goback").unbind().bind('click',function () {
                $('.form-wrap').addClass('fn-hide');
                $('.list-wrap').removeClass('fn-hide');
                $("#myTab button").removeClass('active');
            })
        }

    })
    //设置
    $("#set_btn").unbind().bind('click',function () {
        //选中状态
        var $this=$(this);
        $this.siblings().removeClass('active');
        $this.addClass('active');

        $("#settingDialog").modal("show");
        onSettingDialogOpen();
        //关闭
        $(".btn-cancel").unbind().bind('click',function () {
            $("#myTab button").removeClass('active');
        })
    });

    //批量导出
    $("#checkoutBtn").unbind().bind('click',function () {
        //选中状态
        var $this=$(this);
        $this.siblings().removeClass('active');
        $this.addClass('active');

        $("#checkout").modal('show');
        exportDepSelected = [];
        $('#inlineCheckbox').prop('checked',false);

        $('#checkoutExport').off('click').on('click',function(){
            if(!Array.isArray(exportDepSelected) || exportDepSelected.length == 0){
                sweetAlert({
                    title: "信息",
                    text: "请选择需要导出的部门数据！",
                    type: 'warning',
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定"
                });
                return false;
            }
            var params = {
                orgId:orgId,
                depList:exportDepSelected,
                onlyAgree:$('#inlineCheckbox').prop('checked') ? 0 : 1
            };
            postForFile(api+'/data/user/batchExport',{data:params},'批量导出-部门-用户.xls');
        });
        $('#selectDepBtn').off('click').on('click',function(){
            $("#batchExportDepDialog").modal('show');
            var mTreeNodes = JSON.parse(JSON.stringify(treeNode));
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
                if(Array.isArray(selected) && selected.length > 0){
                    exportDepSelected = selected.map(function(item){
                        return item.depId;
                    });
                }else{
                    exportDepSelected = [];
                }
                $("#batchExportDepDialog").modal('hide');
            });
        });
        //关闭
        $('#guanbi_checkOut').unbind().bind('click',function () {
            $("#myTab button").removeClass('active');
        })
    });
    //批量导入
    $("#checkinBtn").unbind().bind('click',function () {
        //选中状态
        var $this=$(this);
        $this.siblings().removeClass('active');
        $this.addClass('active');

        $("#checkIn").modal("show");
        $("#fileName").val('');
        //关闭
        $("#right_close1").unbind().bind('click',function () {
            $("#myTab button").removeClass('active');
        });
        //保存
        var $gotoSubmit=$("#batchImportSubmitBtn").ladda();
        $("#batchImportSubmitBtn").unbind().bind('click',function () {
            if($("#fileName")[0].files.length == 0){
                sweetAlert({
                    title: "信息",
                    text: "请选择需要上传的文件",
                    type: 'warning',
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定"
                });
                return false;
            }
            if($("#fileName")[0].files[0].name.substring($("#fileName")[0].files[0].name.lastIndexOf('.') + 1) !== "xls"){
                sweetAlert({
                    title: "信息",
                    text: "导入文件类型须为.xls文件!",
                    type: 'warning',
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定"
                });
                return false;
            }
            $gotoSubmit.ladda('start');
            var formFile = new FormData();
            formFile.append("file", $("#fileName")[0].files[0]);
            formFile.append("params", JSON.stringify({orgId: orgId,createBy:userId}));

            $.ajax({
                url: api+'/data/user/batchImport',
                type: 'POST',
                cache: false,
                data: formFile,
                processData: false,
                contentType: false,
                beforeSend: function (request) {
                    //请求前的处理
                    request.setRequestHeader("Authorization", login.tokenId);
                    request.setRequestHeader("userTel", login.userTel);
                },
                success: function (res) {
                    $gotoSubmit.ladda('stop');
                    if(res.status !== 0){
                        sweetAlert({
                            title: "信息",
                            text: res.message,
                            type: 'warning',
                            confirmButtonColor: "#3197FA",
                            confirmButtonText: "确定"
                        });
                        return false;
                    }
                    $("#checkIn").modal("hide");
                    $('#checkinBtn').removeClass('active');
                    $("#batchImportResultDialog").modal("show");
                    $('#succCount').html("导入成功：" + res.data.succCount + "人");
                    $('#failCount').html("导入失败：" + res.data.failCount + "人");
                    $('#exportImportResult').hide();
                    if(Array.isArray(res.data.failList) && res.data.failList.length > 0){
                        var tableOption = {
                            data:res.data.failList,
                            pagination:false,
                            height:'300',
                            columns:[
                                {field:'rowNo',title:'行数',align:'left',width:68},
                                {field:'userName',title:'姓名',align:'left',width:150},
                                {field:'userTel',title:'手机号',align:'left',width:150},
                                {field:'depName',title:'部门',align:'left',width:150},
                                {field:'errorMsg',title:'错误详情',align:'left',width:250,formatter:function(val){
                                    return '<div title="'+val+'" style="overflow: hidden;white-space: nowrap;text-overflow: ellipsis;width:234px">'+val+'</div>'
                                }}
                            ],
                            onPostBody:function(){
                                $('#batchImportResultTable').parent().css('overflow','auto');
                            }
                        };
                        $('#batchImportResultTable').bootstrapTable('destroy').bootstrapTable(tableOption);
                        $('#exportImportResult').off('click').on('click',function(){
                            exportExcel(tableOption.columns,tableOption.data,"批量导入报告.xls","sheet0")
                        }).show();
                    }
                    $('#batchImportResultDialogCloseBtn').off('click').on('click',function(){
                        $('#person_table').bootstrapTable("refresh",{pageNumber:1});
                    });
                },
                error:function(e){
                    $gotoSubmit.ladda('stop');
                    sweetAlert({
                        title: "信息",
                        text: "上传失败，请联系管理员",
                        type: 'warning',
                        confirmButtonColor: "#3197FA",
                        confirmButtonText: "确定"
                    });
                }
            });
        })
    });

    //新增修改选中部门
    var obj={};
    window.next_org = function(depId,depName,index){
        var data=$("#organization_list").bootstrapTable('getData');
        for(var i=0;i<data.length;i++){
            if(data[i].checked==true){
                data[i].checked=false
            }
        }
        for(var i=0;i<data[index].nodes.length;i++){
            if(data[index].nodes[i].checked==true){
                data[index].nodes[i].checked=false;
            }
        }
        obj[depId]=data[index].nodes;
        $("#choose").find('li.breadcrumb-item').removeClass('active');
        var html="";
        html+='<li style="color: #151515;" disabled class="breadcrumb-item active" data-id="'+depId+'">'+depName+'</li>';
        $(html).appendTo("#choose");
        if(data[index].nodes){
            getOrganization(data[index].nodes)
        }else {
            getOrganization([])
        }

        $(".breadcrumb-item").unbind().bind('click',function () {
            var $this=$(this);
            $this.nextAll().remove();
            var _depId=$this.attr('data-id');
            var dataList=obj[_depId];
            getOrganization(dataList);
            $("input[type=checkbox][name='btSelectItem']:checked").prop("checked",false);

        })
    }
    //部门排序
    var obj_sort={};
    window.next_sort=function(depId,depName,index){
        var data=$("#sort_list").bootstrapTable('getData');
        for(var i=0;i<data.length;i++){
            if(data[i].checked==true){
                data[i].checked=false
            }
        }
        if(data[index].nodes!=undefined){
            for(var i=0;i<data[index].nodes.length;i++){
                if(data[index].nodes[i].checked==true){
                    data[index].nodes[i].checked=false;
                }
            }
        }

        obj_sort[depId]=data[index].nodes;
        $("#choose1").find('li.breadcrumb-item').removeClass('active');
        var html="";
        html+='<li style="color: #151515;" disabled class="breadcrumb-item active" data-id="'+depId+'">'+depName+'</li>';
        $(html).appendTo("#choose1");
        if(data[index].nodes){
            sortOrganizaton(data[index].nodes)
        }else {
            sortOrganizaton([])
        }

        $(".breadcrumb-item").unbind().bind('click',function () {
            var $this=$(this);
            $this.nextAll().remove();
            var _depId=$this.attr('data-id');
            var dataList=obj_sort[_depId];
            sortOrganizaton(dataList);
            $("input[type=checkbox][name='btSelectItem']:checked").prop("checked",false);

        })
    }
    //未注册批量发送按钮
    $("#resend").unbind().bind('click',function () {
        //选中状态
        var $this=$(this);
        $this.siblings().removeClass('active');
        $this.addClass('active');
        var list=$("#no_reg_table").bootstrapTable("getData");
        var data=[];
        for(var i=0;i<list.length;i++){
            var obj={};
            if(list[i].againMsg==2){
                obj.userId=list[i].userId;
                obj.userName=list[i].userName;
                obj.userTel=list[i].userTel;
                data.push(obj);
            }

        }
        if(data.length==0){
            sweetAlert({
                title: "信息",
                text: "没有可发送短信通知人员",
                type: 'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
            return;
        }else {
            var param={
                "id": new Date().getTime(),
                "client": {},
                "data": {
                    "module": "main-api",
                    "url": "/api/user/againMsg",
                    "param":{
                        "orgId": selected.depId,
                        "type":1,
                        "userId":userId,
                        "userList":data
                    }
                }
            }
            send_all(param,1);

        }
    })
    //已拒绝批量发送按钮
    $("#send_all").unbind().bind('click',function () {
        //选中状态
        var $this=$(this);
        $this.siblings().removeClass('active');
        $this.addClass('active');
        var list=$("#reject_table").bootstrapTable("getData");
        var data=[];
        for(var i=0;i<list.length;i++){
            var obj={};
            obj.userId=list[i].userId;
            obj.userName=list[i].userName;
            obj.userTel=list[i].userTel;
            data.push(obj);
        }
        if(data.length==0){
            sweetAlert({
                title: "信息",
                text: "没有可邀请人员",
                type: 'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
            return;
        }else {
            var param={
                "id": new Date().getTime(),
                "client": {},
                "data": {
                    "module": "main-api",
                    "url": "/api/user/againMsg",
                    "param":{
                        "orgId": selected.depId,
                        "type":2,
                        "userId":userId,
                        "userList":data
                    }
                }
            }
            send_all(param,2);

        }
    })
    //已拒绝删除成员
    window.delete_user=function(user){
        var param={
            "id": new Date().getTime(),
            "client": {},
            "data": {
                "module": "main-api",
                "url": "/api/user/deleteUser",
                "param":{
                    "orgId": orgId,
                    "idList":[user],
                    "depId":selected.depId,
                    "userId":userId,
                    "status":1
                }
            }
        }
        sweetAlert({
            title: "确认信息",
            text: "确认删除该成员?删除仅用于清理错误数据，请谨慎操作!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3197FA",
            cancelButtonColor: "#FFFFFF",
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            closeOnConfirm: false
        }, function () {
            delete_user_list(param);
        })
    }
    //点击已拒绝批量删除按钮
    $('#send_del').unbind().bind('click',function () {
        //选中状态
        var $this=$(this);
        $this.siblings().removeClass('active');
        $this.addClass('active');

        var list=$("#reject_table").bootstrapTable("getData");
        if(list.length==0){
            sweetAlert({
                title: "信息",
                text: "没有可删除人员",
                type: 'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
            return;
        }else {
            var data=[];
            for(var i=0;i<list.length;i++){
                data.push(list[i].userId);
            }
            sweetAlert({
                title: "确认信息",
                text: "确认删除"+data.length+"位成员?删除仅用于清理错误数据,请谨慎操作!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3197FA",
                cancelButtonColor: "#FFFFFF",
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                closeOnConfirm: false
            }, function () {
                var param={
                    "id": new Date().getTime(),
                    "client": {},
                    "data": {
                        "module": "main-api",
                        "url": "/api/user/deleteUser",
                        "param":{
                            "orgId": orgId,
                            "idList":data,
                            "depId":selected.depId,
                            "userId":userId,
                            "status":1
                        }
                    }
                }
                delete_user_list(param);
            })


        }
    })
    //已拒绝批量删除
    function delete_user_list(param){//type:1,单个删除  2,批量删除
        $.ajax({
            url:api+"/data/getData",    //请求的url地址
            dataType:"html",   //返回格式为json
            async:true,//请求是否异步，默认为异步，这也是ajax重要特性
            data:encrypt(JSON.stringify(param),getPass()),    //参数值
            type:"POST",   //请求方式
            contentType: 'application/json;charset=UTF-8',
            beforeSend:function(request){
                //请求前的处理
                request.setRequestHeader("Authorization", login.tokenId);
                request.setRequestHeader("userTel", login.userTel);
            },
            success:function(req){
                req = JSON.parse(decrypt(req,getPass()));
                $deleteBtn.ladda('stop');
                if (req.status === 0) {
                    //请求成功时处理
                    initOrgOutPerson(selected.depId);
                    sweetAlert({
                        title: "信息",
                        text: "提交成功！",
                        type: "success",
                        confirmButtonColor: "#3197FA",
                        confirmButtonText: "确定",
                    }, function () {

                    });

                } else {
                    sweetAlert({
                        title: "信息",
                        text: req.message,
                        type: 'warning',
                        confirmButtonColor: "#3197FA",
                        confirmButtonText: "确定",
                    });
                }
            },
            complete:function(){
                //请求完成的处理
            },
            error:function(){
                //请求出错处理
            }
        });
    }
    //再次发送单点
    window.send=function(userId_,userName,userTel,type){
        var param={
            "id": new Date().getTime(),
            "client": {},
            "data": {
                "module": "main-api",
                "url": "/api/user/againMsg",
                "param":{
                    "orgId": selected.depId,
                    "type":type,
                    "userId":userId,
                    "userList":[{
                        "userId":userId_,
                        "userName":userName,
                        "userTel":userTel

                    }]
                }
            }
        }
        send_all(param,type);
    }
    //批量发送
    function send_all(param,type){
        $.ajax({
            url:api+"/data/getData",    //请求的url地址
            dataType:"html",   //返回格式为json
            async:true,//请求是否异步，默认为异步，这也是ajax重要特性
            data:encrypt(JSON.stringify(param),getPass()),    //参数值
            type:"POST",   //请求方式
            contentType: 'application/json;charset=UTF-8',
            beforeSend:function(request){
                //请求前的处理
                request.setRequestHeader("Authorization", login.tokenId);
                request.setRequestHeader("userTel", login.userTel);
            },
            success:function(req){
                req = JSON.parse(decrypt(req,getPass()));
                if (req.status === 0) {
                    //请求成功时处理
                    initOrgOutPerson(selected.depId);
                    sweetAlert({
                        title: "信息",
                        text: "提交成功！",
                        type: "success",
                        confirmButtonColor: "#3197FA",
                        confirmButtonText: "确定",
                    }, function () {

                    });

                } else {
                    sweetAlert({
                        title: "信息",
                        text: req.message,
                        type: 'warning',
                        confirmButtonColor: "#3197FA",
                        confirmButtonText: "确定",
                    });
                }
            },
            complete:function(){
                //请求完成的处理
            },
            error:function(){
                //请求出错处理
            }
        });

    }
    //选择上级部门后保存按钮
    $("#gotoSubmit_org").unbind().bind('click',function () {
        var list=$("#organization_list").bootstrapTable('getSelections')[0];
        var depId=list.depId;
        var depName=list.depName;
        $("#please1").attr('data-id',depId);
        $("#please1").val(depName);
        $("#orginzation").modal('hide');
    })
    //新增人员
    $("#add1").unbind().bind('click',function () {
        if(selected===undefined){
            sweetAlert({
                title: "信息",
                text: "请选择一个部门!",
                type:'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定",
            });
        }else{
            var $this=$(this);
            $this.siblings().removeClass('active');
            $this.addClass('active');

            for (var Key in validateConfig_person){
                FormValidate_person.removeErrorStyle(Key);
            }
            //绑定校验
            FormValidate_person.validateForOnly(validateConfig_person);
            var data=selected;
            $('#right_modal').modal('show');
            //快速离职按钮隐藏
            $("#quick_go").css('display','none');
            //删除按钮隐藏
            $("#deleteUser").css('display','none');
            //新增成员时手机号可填写
            $("#phone_title").css('display','none');
            $("#phone").attr("disabled",false);

            $("#myModalLabel1").text($this.text());

            $("#user").val("");
            $("#userName").attr('data-id',"");

            $("#copy").val(selected.depName);
            $("#copy").attr('data-id',selected.depId);

            //渲染时间
            $("#autoBeginDate").datetimepicker('remove');
            setTimeout(function(){
                $('#autoBeginDate').datetimepicker({
                    format: 'yyyy-mm-dd',
                    weekStart: 1,
                    autoclose: true,
                    startView: 2,
                    minView: 2,
                    forceParse: false,
                    language: 'zh-CN',
                })
            },500)

            $("#autoBeginDate").val("");

            $("#email").val("");

            $("#phone").val("");

            $("#textArea").val("");

            // 调用职务的下拉选择框
            position('请选择...','请选择...','请选择...','请选择...');


        }
        // 点击新增人员的保存按钮调用方法
        var $gotoSubmit=$("#gotoSubmit").ladda();
        $("#gotoSubmit").unbind().bind('click',function () {
            var flag = FormValidate_person.validate($('#person_model')[0], validateConfig_person);
            if(flag==false){
                return '';
            }else{
                $gotoSubmit.ladda('start');
                setTimeout(function () {
                    var param={
                        "id": new Date().getTime(),
                        "client": {},
                        "data": {
                            "module": "main-api",
                            "url": "/api/user/addUser",
                            "param":{
                                "orgId": orgId,
                                "depId": $("#copy").attr('data-id'),
                                "userName":$("#user").val(),
                                "positionName":$("#connect_position").val(),
                                "rankName":$("#connect_level").val(),
                                "memberType":$("#user_type").val(),
                                "company":$("#bussiness").val(),
                                "entryTime":$("#autoBeginDate").val(),
                                "userTel":$("#phone").val(),
                                "userEmail":$("#email").val(),
                                "remarks":$("#textArea").val(),
                                "createBy":userId
                            }
                        }
                    }
                    $.ajax({
                        url: api+'/data/getData',    //请求的url地址
                        dataType: "html",   //返回格式为json
                        async: false,//请求是否异步，默认为异步，这也是ajax重要特性
                        data: encrypt(JSON.stringify(param),getPass()),    //参数值
                        type: "POST",   //请求方式
                        contentType: 'application/json;charset=UTF-8',
                        beforeSend: function (request) {
                            //请求前的处理
                            request.setRequestHeader("Authorization", login.tokenId);
                            request.setRequestHeader("userTel", login.userTel);
                        },
                        success: function (req) {
                            req = JSON.parse(decrypt(req,getPass()));
                            $gotoSubmit.ladda('stop');
                            if (req.status === 0) {
                                //请求成功时处理
                                $('#right_modal').modal('hide');
                                selected = data;
                                $("#person_table").bootstrapTable('refresh');
                                //新增人员后更新组织外总数
                                queryDepOther($("#copy").attr('data-id'));
                                queryDepOther(selected.depId);
                                var alertText="";
                                if(req.message=="填写的手机号码未注册"){//手机号填写时未注册账户
                                    alertText="添加成功，已下发短信通知其完成账户注册，注册完毕后成员将在App端完成是否同意加入组织的操作。";

                                }else if(req.message=="填写的手机号码已注册") {//手机号填写时已注册账户
                                    alertText="添加成功，成员将在App端完成是否同意加入组织的操作。";
                                }else if(req.message=="未填写手机号码"){//手机号未填写时
                                    alertText="添加成功";
                                }
                                sweetAlert({
                                    title: "信息",
                                    // text: "提交成功！",
                                    text: alertText,
                                    type: "success",
                                    confirmButtonColor: "#3197FA",
                                    confirmButtonText: "确定",
                                }, function () {
                                    $("#myTab button").removeClass('active');
                                });
                            } else {
                                sweetAlert({
                                    title: "信息",
                                    text: req.message,
                                    type: 'warning',
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
                },100)
            }
        })
    });
    //点击选择部门
    $("#copy").unbind().bind('click',function () {
        $("#orginzation").modal('show');
        $("#choose").empty();
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
                    "userId":userId,
                    queryType:3
                }

            }
        };
        var data=getTreeContent(params)
        getOrganization(data);
        // //关闭
        // $(".close").unbind().bind('click',function () {
        //     $("#orginzation").modal('hide');
        //     // $("#myTab button").removeClass('active');
        // })
        // $("#guanbi_org").unbind().bind('click',function () {
        //     $("#orginzation").modal('hide');
        //     // $("#myTab button").removeClass('active');
        // })
        //选择部门后保存按钮
        $("#gotoSubmit_org").unbind().bind('click',function () {
            var list=$("#organization_list").bootstrapTable('getSelections')[0];
            var depId=list.depId;
            var depName=list.depName;
            $("#copy").attr('data-id',depId);
            $("#copy").val(depName);
            $("#orginzation").modal('hide');
        })

    })

    // 关闭模态框的时候清除form表单的数据
    $("#guanbi").unbind().bind('click',function () {
        $('#position_id').val('');
        $('#position_id').prop("disabled", false);
        $('#position_text').val('');
        $('#level').val('');
        $('#status').selectpicker('val', '0');
        $("#myTab button").removeClass('active');
    });
    $("#right_close").unbind().bind('click',function () {
        $('#connect_id').val('');
        $('#username').val('');
        $('#username').prop("disabled", false);
        // $('#connect_position').selectpicker('val', '');
        $("#myTab button").removeClass('active');
    });
    $(".clear").unbind().bind('click',function () {
        $('#connect_id').val('');
        $('#username').val('');
        $('#username').prop("disabled", false);
        // $('#connect_position').selectpicker('val', '');
        $("#myTab button").removeClass('active');
    });
    $(".clear1").unbind().bind('click',function () {
        $('#position_id').val('');
        $('#position_text').val('');
        $('#level').val('');
        $('#status').selectpicker('val', '0');
        $("#myTab button").removeClass('active');
    });
    $("#left_close").unbind().bind('click',function () {
        $('#ID').val('');
        $('#ID').prop("disabled", false);
        // $('#text').val('');
        // $('#groupType').val('');
        $('#resourceSelector').val('');
        $('#please1').text('请选择...');
        // $('#workflowOSelect').selectpicker('val','0');
        $('#regionSelect').selectpicker('val', '0');
        $("#myTab button").removeClass('active');
    })
    //收缩
    $('.move').unbind().bind(
        'click',function () {
            if($('.tree').css('display')==='none'){
                $('.tree').css('display','block');
                $(".grid").removeClass("col-xs-12").addClass('col-xs-8')
            }else {
                $('.tree').css('display','none');
                $(".grid").removeClass("col-xs-8").addClass('col-xs-12')
            }

        }
    )
}
//获取部门列表
function getOrganization(data){
    $("#organization_list").bootstrapTable('destroy');
    $("#organization_list").bootstrapTable({
        height:'512',
        clickToSelect:false,
        singleSelect: true,//单行选择单行,设置为true将禁止多选
        pagination: false,
        // pageSize: 15,
        // pageList: [15,20,30,50,100],  //可供选择的每页的行数
        // locale: "zh-CN",
        // classes: 'table table-no-bordered  table-hover-row',
        singleSelect:true,
        //行样式
        rowStyle: function (row, index) {
            return {
                css: {
                    'font-size': '13px',
                    'height': '30px',
                    'color': '#757575'
                }
            }
        },
        // striped: true,
        data:data,
        columns:[
            {
                field : 'checked',
                checkbox : true,
                width:'10%px'
            },{
                field: "depName",
                title: "名称",
                align: "left",
                valign: "middle",
                width:'45%px'
            },{
                field: "ID",
                title: "操作",
                align: "left",
                valign: "middle",
                width:'45%px',
                formatter: function (value, row,index) {
                    if(row.nodes){
                        return '<a href="javascript:void(0)" type="button" class="change" onclick="next_org(\''+row.depId+'\',\''+row.depName+'\',\''+index+'\')" data-id="'+row.depId+'">下一级</a>';

                    }else {
                        return ''
                    }
                }

            }
        ],

        /* * @param {点击列的 field 名称} field
         * @param {点击列的 value 值} value
         * @param {点击列的整行数据} row
         * @param {td 元素} $element*/

        onClickCell: function(field, value, row, $element) {
        },
    });
    // $('#organization_list').on('load-success.bs.table',function(data){
        $('#organization .fixed-table-body').css('height','470px');
        $('#organization .fixed-table-body').css('overflow','auto');
    // })

}
//部门排序
function sortOrganizaton(data) {
    $("#sort_list").bootstrapTable('destroy');
    $("#sort_list").bootstrapTable({
        height:'480',
        singleSelect: true,//单行选择单行,设置为true将禁止多选
        pagination: false,
        // pageSize: 15,
        // pageList: [15,20,30,50,100],  //可供选择的每页的行数
        // locale: "zh-CN",
        // classes: 'table table-no-bordered  table-hover-row',
        smartDisplay:false,
        singleSelect:true,
        //行样式
        rowStyle: function (row, index) {
            return {
                css: {
                    'font-size': '13px',
                    'height': '30px',
                    'color': '#757575'
                }
            }
        },
        // striped: true,
        data:data,
        columns:[{
            field: "depName",
            title: "名称",
            align: "left",
            valign: "middle",
            width:'40%px'
        },{
            field: "ID",
            title: "操作",
            align: "left",
            valign: "middle",
            width:'40%px',
            formatter: function (value, row,index) {
                if(row.nodes){
                    return '<a href="javascript:void(0)" type="button" class="change" onclick="next_sort(\''+row.depId+'\',\''+row.depName+'\',\''+index+'\')" data-id="'+row.depId+'">下一级</a>';

                }else {
                    return ''
                }

            }

        },{
            field: "ID",
            align: "left",
            valign: "middle",
            width:'20%px',
            formatter: function (value, row,index) {
                return '<i class="fa  fa-align-justify fa-2x" style="margin-left: 10px;color: #CCCFD4;"></i>';

            }
        }
        ],

        /* * @param {点击列的 field 名称} field
         * @param {点击列的 value 值} value
         * @param {点击列的整行数据} row
         * @param {td 元素} $element*/

        onClickCell: function(field, value, row, $element) {
        },
        reorderableRows: true, //设置拖动排序
        useRowAttrFunc: true, //设置拖动排序
        //当选中行，拖拽时的哪行数据，并且可以获取这行数据的上一行数据和下一行数据
        onReorderRowsDrag: function(table, row) {

        },
        //拖拽完成后的这条数据，并且可以获取这行数据的上一行数据和下一行数据
        onReorderRowsDrop: function(table, row) {

        },
        //当拖拽结束后，整个表格的数据
        onReorderRow: function(newData) {
            //这里的newData是整个表格数据，数组形式

        }
    });
    // $("#sort_list").on('load-success.bs.table',function(data){
        $('#sortTable .fixed-table-container').css('height','522px');
        $('#sortTable .fixed-table-body').css('height','480px');
        $('#sortTable .fixed-table-body').css('overflow','auto');
    // })
}
//格式化后台返回tree数据
function getTree(){
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
                "userId":userId,
                queryType:3
            }

        }
    };
    treeNode = getTreeContent(params);
    return treeNode;
}
//获取后台tree数据
function getTreeContent(params) {
    var _tree=[];
    $.ajax({
        url:api+"/data/getData",   //请求的url地址
        dataType:"html",   //返回格式为json
        async:false,//请求是否异步，默认为异步，这也是ajax重要特性
        data:encrypt(JSON.stringify(params),getPass()),    //参数值
        type:"POST",   //请求方式
        contentType: 'application/json;charset=UTF-8',
        beforeSend:function(request){
            //请求前的处理
            request.setRequestHeader("Authorization", login.tokenId);
            request.setRequestHeader("userTel", login.userTel);
        },
        success:function(req){
            req = JSON.parse(decrypt(req,getPass()));
            (req.data.data || []).forEach(function(tmp_obj){
                tmp_obj.id= tmp_obj.depId;
                tmp_obj.nodeId=tmp_obj.depId;
                tmp_obj.text= tmp_obj.depName + (isNaN(parseInt(tmp_obj.count)) ? "" : ("(" + tmp_obj.count + ")"));
                tmp_obj.parentId=tmp_obj.parentDepId;
                tmp_obj.parentOid=tmp_obj.parentDepId;
                tmp_obj.color="#878787";
                tmp_obj.icon = 'fa fa-folder';
                _tree.push(tmp_obj);
            });
        },
        complete:function(){
            //请求完成的处理
        },
        error:function(){
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
    return simpleDataTypeToNormalDataType(list,'depId','parentDepId','nodes');
}
//初始化 #person
function getPerson(params){
    $.ajax({
        url:api+"/data/getData",    //请求的url地址
        dataType:"html",   //返回格式为json
        async:true,//请求是否异步，默认为异步，这也是ajax重要特性
        data:encrypt(JSON.stringify(params),getPass()),    //参数值
        type:"POST",   //请求方式
        contentType: 'application/json;charset=UTF-8',
        beforeSend:function(request){
            //请求前的处理
            request.setRequestHeader("Authorization", login.tokenId);
            request.setRequestHeader("userTel", login.userTel);
        },
        success:function(req){
            req = JSON.parse(decrypt(req,getPass()));
            $("#person_table").bootstrapTable('load',req.data.data);
        },
        complete:function(){
            //请求完成的处理
        },
        error:function(){
            //请求出错处理
        }
    });
}
function initTree(){
    $('#tree').treeview({
        data: getTree(),
        collapseIcon: 'glyphicon glyphicon-triangle-bottom', // 折叠图标，默认 min
        expandIcon: 'glyphicon glyphicon-triangle-right',
        showBorder:false,
        selectedColor: '#878787',
        selectedBackColor: '#bae7ff',
    });
    $('#tree').on('nodeUnselected', function(event, data) {
        $('#tree').treeview('toggleNodeSelected', [ data.nodeId, { silent:true } ]);
    })
    $('#tree').on('nodeSelected', function(event, data) {
        var selectArr = $('#tree').treeview('getSelected');
        for (i = 0; i < selectArr.length; i++) {
            if (selectArr[i].nodeId != data.nodeId) {
                $('#tree').treeview('unselectNode', [selectArr[i].nodeId, { silent: true }]);
            }
        }
    });
}
function middleHeight(){
    var height=$(window).height()-48;
    $('#tree').css({height :height});
}
function getUrlParam() {
    // var url = location.search; //获取url中"?"符后的字串
    var url = window.parent.location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}


/**
 * 生成用户表格
 * @param tableId 表格Id
 * @param treeId  与表格关联的treeId
 */
function createUserTable(tableId,depId,keyWord){
    var option = {
        dataType:'html',
        height:'512',
        url:api + "/data/user/findByDep",
        method:'post',
        contentType:'application/json',
        ajaxOptions: {
            headers: {"Authorization": login.tokenId, "userTel": login.userTel},
        },
        queryParams:function(params){
            // var page = {
            //     pageSize: params.limit,
            //     pageNum: (parseInt(params.offset) / parseInt(params.limit) ) + 1,
            //     order: {}
            // };
            // if (typeof params.sort !== 'undefined') {
            //     page.order[params.sort] = params.order;
            // }
            var data = {
                "orgId": orgId,
                "userId":userId,
                "keyword":keyWord,
                "depId":depId
            };
            return encrypt(JSON.stringify({data:data}),getPass());
        },
        columns:[
            {field: "", title: "", align: "center", radio:true},
            {field: "userName", title: "姓名", align: "left", valign: "middle"},
            // {field: "positionName", title: "职位", align: "left",valign: "middle"},
            // {field: "rankName", title: "职级", align: "left", valign: "middle"},
            // {field: "memberType", title: "成员类型", align: "left", valign: "middle"}
        ],
        smartDisplay:false,
        onLoadSuccess: function(data){
            data = JSON.parse(decrypt(data,getPass()));
            var _data=[];
            if(data.data==null){

            }else {
                for(var i=0;i<data.data.length;i++){
                    if(data.data[i].userStatus==1){
                        _data.push(data.data[i])
                    }
                }
            }

            $("#"+tableId).bootstrapTable("load",_data)
        }
    };
    $('#' + tableId).bootstrapTable('destroy').bootstrapTable(option);
    $('#'+tableId).on('load-success.bs.table',function(data){
        $('#memberTable_content .fixed-table-container').css('height','512px');
        $('#memberTable_content .fixed-table-body').css('height','470px');
        $('#memberTable_content .fixed-table-body').css('overflow','auto');
    })
}

/**
 * 刷线面包屑导航栏
 * @param nodeId
 */
function refreshBreadcrumb(nodeId){
    var liHtml = '';
    var nodePath = getTreeNodePath(nodeId);
    nodePath.forEach(function(item,index){
        liHtml += '<li class="breadcrumb-item '+
            ((index == nodePath.length -1) ? 'active' : '')
            +'">'+item+'</li>';
    });
    $('.breadcrumb').html(liHtml);
}

/**
 * 获取当前树选中节点路径
 * @param nodeId
 * @returns {[]}
 */
function getTreeNodePath(nodeId){
    var nodePath = [];
    (function x(nodeId){
        var node = $("#tree").treeview("getNode", nodeId);
        nodePath.unshift(node.depName);
        if(node.parentId == 0 || node.parentId){
            x(node.parentId);
        }
    })(nodeId);
    return nodePath;
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

// 设置按钮-弹窗打开事件
function onSettingDialogOpen(){
    var titleArr = ['','职位名称','职级名称','','厂商名称'];
    var idArr = ['','positionTable','levelTable','','businessTable'];
    var dataMap = {};      // 存放职位、职级、厂商信息，搜索时使用
    $('#settingDialogQueryInput').val('');
    queryTableHeader();
    [1,2,4].forEach(function(enumType){
        initSubTableInfo(enumType);
    })

    // 设置-菜单切换
    $("#settingMenuUl li").unbind().bind('click',function () {
        $("#settingMenuUl li").removeClass('active');
        $(this).addClass('active');
        $('#settingAddBtn').popover('hide');

        $("#settingDialogContent").find('div.tab-pane').removeClass("active in");
        $("#settingDialogContent").find('div.tab-pane').eq($(this).index()).addClass('active in');

        $('#settingDialogQueryForm')[$(this).index() === 3 ? 'hide':'show']();
    });
    $("#settingMenuUl li:eq(0)").click();

    // 设置-点击搜索
    $('#settingDialogQueryBtn').unbind().bind('click',function(){
        var queryInput = $('#settingDialogQueryInput').val();
        var enumType = $("#settingMenuUl li.active").attr('data-value');
        var tableId = $('#settingMenuUl li.active').attr('data-target');
        var data = dataMap[tableId] || [];
        if(queryInput.length > 0){
            data = data.filter(function (item) {
                return (item.value.indexOf(queryInput) > -1)
            })
        }
        $('#' +tableId).bootstrapTable("load",data);
    })

    // 设置-点击保存
    $('#settingSubmitBtn').off('click').on('click',function(){
        var target = $("#settingMenuUl li.active").attr('data-target');
        if(target !== "filedContent"){
            var enumType = $("#settingMenuUl li.active").attr('data-value');
            var data = $('#' + idArr[enumType]).bootstrapTable('getData').map(function(item){
                return item.value;
            });
            addEnum(data,function(res){
                if(res.status === 0){
                    $("#settingDialog").modal("hide");
                    $('#set_btn').removeClass('active');
                }
                sweetAlert({
                    title: "信息",
                    text: res.message,
                    type: res.status !== 0 ? 'warning' : 'success',
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定"
                });
            });
        }else{
            addOrUpdateTableHeader();
        }
    });

    // 设置-添加
    $('#settingAddBtn').popover({
        trigger: 'click',
        placement: 'left',
        title: function(){
            return "添加" + titleArr[$("#settingMenuUl li.active").attr('data-value')]
        },
        html: 'true',
        content: '<div>' +
            '<input id="settingAddInput" class="form-control" style="width: 230px" maxlength="50" autocomplete="off">' +
            '<div style="text-align: right;margin-top: 10px">' +
            '<button class="btn btn-cancel" onclick="$(\'#settingAddBtn\').popover(\'hide\')">取消</button>' +
            '<button class="btn btn-confirm" id="settingAddSubmitBtn" style="margin-left: 10px">添加</button></div>' +
            '</div>'
    });

    // 设置-批量添加
    $('#settingBatchAddBtn').popover({
        trigger: 'click',
        placement: 'bottom',
        title: function(){
            return "批量添加" + titleArr[$("#settingMenuUl li.active").attr('data-value')]
        },
        html: 'true',
        content: '<div>' +
            '<textarea id="settingBatchAddInput" class="textarea" style="width: 250px" rows="4" placeholder="输入选项值（每行一个）" autocomplete="off"></textarea>' +
            '<div style="text-align: right;margin-top: 10px">' +
            '<button class="btn btn-cancel" onclick="$(\'#settingBatchAddBtn\').popover(\'hide\')">取消</button>' +
            '<button class="btn btn-confirm" id="settingBatchAddSubmitBtn" style="margin-left: 10px">添加</button></div>' +
            '</div>'
    });

    // 设置-添加-确定按钮事件
    $('#settingAddBtn').on('shown.bs.popover', function () {
        $('#settingAddInput').val('');
        $('#settingAddSubmitBtn').off('click').on('click',function(){
            var val = $('#settingAddInput').val().trim();
            var enumType = $("#settingMenuUl li.active").attr('data-value');
            if(val.length > 0){
                appendTableData(enumType,[val]);
            }else{
                layer.msg(titleArr[$("#settingMenuUl li.active").attr('data-value')] + "不能为空", {icon: 2});
            }
        });
    }).on('click',function(){
        $('#settingBatchAddBtn').popover('hide');
    });

    // 设置-批量添加-确定按钮事件
    $('#settingBatchAddBtn').on('shown.bs.popover', function () {
        $('#settingBatchAddInput').val('');
        $('#settingBatchAddSubmitBtn').off('click').on('click',function(){
            var val = $('#settingBatchAddInput').val().split('\n');
            var enumType = $("#settingMenuUl li.active").attr('data-value');
            appendTableData(enumType,val);
        });
    }).on('click',function(){
        $('#settingAddBtn').popover('hide');
    })

    // 删除按钮事件
    $('#settingDelBtn').unbind().bind('click',function(){
        var enumType = $("#settingMenuUl li.active").attr('data-value');
        var targetTableId = $("#settingMenuUl li.active").attr('data-target');
        var selected = $('#' + targetTableId).bootstrapTable("getSelections").map(function(item){
            return item.value;
        });
        if(selected.length == 0){
            sweetAlert({
                title: "信息",
                text: "请选择需要删除的" + titleArr[enumType],
                type: 'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
            return false;
        }
        sweetAlert({
            title: "确认信息",
            text: "确认删除选项：" + selected.join('、'),
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3197FA",
            cancelButtonColor: "#FFFFFF",
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            closeOnConfirm:true,
            closeOnCancel:true
        }, function (isConfirm) {
            if(isConfirm){
                checkEnumUsed(selected,function(){
                    $('#' + targetTableId).bootstrapTable('remove',{field: 'value', values: selected})
                })

            }
        });
    });

    // 添加职位、职级、厂商
    function addEnum(enumList,successCb){
        var params  = {
            orgId:orgId,
            enumType:$("#settingMenuUl li.active").attr('data-value'),
            enumList: enumList
        };
        ajaxData("main-api","/api/setting/addEnum",params,function(res){
            sweetAlert({
                title: "信息",
                text: res.message,
                type: res.status === 0 ? 'success' : 'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
            if(res.status === 0){
                successCb && successCb(res)
            }
        });
    }

    // 获取职位、职级、厂商信息
    function initSubTableInfo(enumType){
        var params = {
            orgId:orgId,
            enumType:enumType
        };
        ajaxData("main-api","/api/setting/search",params,function(res){
            var data = [];
            if(res.data && Array.isArray(res.data.data) && res.data.data.length > 0){
                data = res.data.data.map(function(item){
                    return {value:item};
                })
            }
            createSettingTable(data,enumType);
        });
    }

    // 创建职位、职级、厂商表格
    function createSettingTable(data,enumType){
        var options = {
            data:data || [],
            height:'500',
            clickToSelect:false,
            rowStyle: function (row, index) {
                return {
                    css: {
                        'font-size': '13px',
                        'height': '30px',
                        'color': '#757575'
                    }
                }
            },
            onDblClickCell:function(field, value, row, $element){
                checkEnumUsed(value,function(){
                    $element.find('input').show().focus();
                    $element.find('div').hide();
                    $element.find('input').off('blur').on('blur',function(){
                        if(value !== $(this).val()){
                            modifyTableData(enumType,$(this).attr('data-index'),$(this).val())
                        }else{
                            $element.find('input').hide();
                            $element.find('div').show();
                        }
                    });
                    $element.find('input').off('keyup').on('keyup',function(e){
                        if(e.keyCode === 13){
                            if(value !== $(this).val()){
                                modifyTableData(enumType,$(this).attr('data-index'),$(this).val())
                            }else{
                                $element.find('input').hide();
                                $element.find('div').show();
                            }
                        }
                    })
                });
            },
            onPostBody:function(){
                $('#' + idArr[enumType]).parent().css('overflow-y','auto');
            },
            columns:[
                {field:'',title:'',checkbox:true,align:'center',width:'80px'},
                {field:'value',title:titleArr[enumType],align:'center',formatter:function (val,row,index) {
                    return '<div>'+val+'</div>' +
                        '<input class="input" data-index="'+index+'" value="'+val+'" style="width: 100%;display: none">';
                }}
            ]
        };
        dataMap[idArr[enumType]] = data;
        $('#' + idArr[enumType]).bootstrapTable('destroy').bootstrapTable(options);
    }

    // 获取字段显示信息
    function queryTableHeader(){
        var params = {
            orgId:orgId
        };
        ajaxData("main-api","/api/setting/queryTableHeader",params,function(res){
            if(res.status == 0){
                $.each(res.data.data,function(key,value){
                    var state = value != 1 ? '0' : '1';
                    $('#filedContent .switchBtn[data-target="'+key+'"]').attr('data-state',state);
                    $('#filedContent .switchBtn[data-target="'+key+'"]').removeClass('on off').addClass(state === "1" ? 'on' : 'off')
                })
            }
        });
        $('#filedContent .switchBtn').each(function () {
            var switchObj = $(this);
            switchObj.attr('title', switchObj.hasClass('on') ? switchObj.attr('data-off-title') : switchObj.attr('data-on-title'));
            $(this).off('click').on('click', function () {
                var isOn = $(this).hasClass('on');
                $(this).removeClass(isOn ? 'on' : 'off')
                    .addClass(isOn ? 'off' : 'on')
                    .attr('data-state', isOn ? 0 : 1)
                    .attr('title', isOn ? $(this).attr('data-on-title') : $(this).attr('data-off-title'));
                var fun = $(this).attr('onchange');
                if (typeof eval(fun) === 'function') {
                    eval(fun)(switchObj, !isOn);
                }
            });
        });
    }

    // 更新字段显示信息
    function addOrUpdateTableHeader(){
        var params = {
            orgId:orgId,
            userName:0,
            positionName:0,
            depName:0
        }
        $('#filedContent .switchBtn').each(function(){
            params[$(this).attr('data-target')] = $(this).attr('data-state') === "1" ? 1 : 2;
        });
        ajaxData("main-api","/api/setting/addOrUpdateTableHeader",params,function(res){
            if(res.status === 0){
                $("#settingDialog").modal("hide");
                $('#set_btn').removeClass('active');
            }
            sweetAlert({
                title: "信息",
                text: res.message,
                type: res.status !== 0 ? 'warning' : 'success',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
        });
    }

    // 添加表格信息，判断输入选项长度是否超过50及含有重复输入项、以及判断表中是否已有重复项
    function appendTableData(enumType,appendData){
        var isOverLength = false,
            inputRepeat  = [],
            sameItems = [],
            formatData = [];
        appendData.forEach(function(v){
            v = v.trim();
            if(v.length > 50) isOverLength = true;
            if(v.length > 0) formatData.push(v);
        });
        if(isOverLength){
            sweetAlert({
                title: "信息",
                text: "单个" + titleArr[$("#settingMenuUl li.active").attr('data-value')] +  "长度不能超过50！",
                type: 'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
            return false;
        }

        var beforeData = $('#' + idArr[enumType]).bootstrapTable('getData').map(function(item){
            return item.value;
        });
        formatData.forEach(function(item,index){
            if(index !== formatData.lastIndexOf(item)){
                inputRepeat.indexOf(item) === -1 ? inputRepeat.push(item) : "";
            }
            if(beforeData.indexOf(item) !== -1){
                sameItems.push(item);
            }
        });
        if(sameItems.length > 0 || inputRepeat > 0){
            sweetAlert({
                title: "信息",
                text: "单个" + titleArr[$("#settingMenuUl li.active").attr('data-value')] +  "不能重复！\n"
                    + (inputRepeat.length > 0 ? ( "重复输入：" + inputRepeat.join('、')):
                        ("已有重复项：" + sameItems.join('、'))),
                type: 'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
        }else{
            $('#' + idArr[enumType]).bootstrapTable('prepend',formatData.map(function (item) {
                return {value:item};
            }));
            $('#settingAddBtn,#settingBatchAddBtn').popover('hide');
        }
    }

    function modifyTableData(enumType,rowIndex,value){
        var beforeData = $('#' + idArr[enumType]).bootstrapTable('getData').map(function(item){
            return item.value;
        });
        if(beforeData.indexOf(value)!==-1){
            sweetAlert({
                title: "信息",
                text: "单个" + titleArr[$("#settingMenuUl li.active").attr('data-value')] +  "不能重复！\n" + "已有重复项：" + value,
                type: 'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
            return false;
        }
        $('#' + idArr[enumType]).bootstrapTable("updateRow",
            {index:rowIndex,row:{value:value}}
        )
    }

    function checkEnumUsed(value,cb){
        var params = {
            orgId:orgId,
            enumList:Array.isArray(value) ? value : [value],
            enumType: $("#settingMenuUl li.active").attr('data-value')
        };
        ajaxData("main-api","/api/setting/useEnum",params,function(res){
            if(res.status !== 0){
                sweetAlert({
                    title: "信息",
                    text: res.message + ',禁止修改删除！',
                    type: 'warning',
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定"
                });
                return false;
            }
            cb && cb();
        });
    }
}

//实例化下拉框
function renderSelect(id,value){
    $('#'+id).selectpicker({ width: '100%',noneSelectedText:'请选择...' }).selectpicker('val',value);
}
function initOrgOutPerson(depId) {
    var noRegTableOption = createOutOfOrgTableOption(3,depId);       //组织外-未注册-tableOption
    var cfgWaitTrueTableOption = createOutOfOrgTableOption(4,depId); //组织外-待同意-tableOption
    var cfgRejectTableOption = createOutOfOrgTableOption(2,depId);   //组织外-已拒绝-tableOption

    // 组织外-未注册-tableOption 追加一列操作项
    noRegTableOption.columns.push(
        {field:'',title:'操作',width:'20%px',formatter:function(val,row,index){
                if(row.againMsg==1 || row.userTel==""){
                    return '<button class="btn btn-cancel" style="margin-right: 10px;color: #BAC3CA;background: #EEEEEE;">再次发送</button>' +
                        '<button class="btn btn-cancel" onclick="editorUser_('+index+');">编辑成员</button>'
                }else {
                    return '<button class="btn btn-cancel" style="margin-right: 10px;" onclick="send(\''+row.userId+'\',\''+row.userName+'\',\''+row.userTel+'\',1'+')">再次发送</button>' +
                        '<button class="btn btn-cancel" onclick="editorUser_('+index+');">编辑成员</button>'
                }

            }}
    )
    //组织外-已拒绝-tableOption 追加一列操作项
    cfgRejectTableOption.columns.push(
        {field:'',title:'操作',width:'20%px',formatter:function(val,row,index){
                return '<button class="btn btn-cancel" style="margin-right: 10px;" onclick="send(\''+row.userId+'\',\''+row.userName+'\',\''+row.userTel+'\',2'+')">再次发送</button>' +
                    '<button class="btn btn-cancel" onclick="delete_user(\''+row.userId+'\');">删除成员</button>'

            }}
    )

    $('#no_reg_table').bootstrapTable("destroy").bootstrapTable(noRegTableOption);
    $('#no_reg_table').on('load-success.bs.table',function(data){
        $('#no_reg .fixed-table-body').css('height','480px');
        $('#no_reg .fixed-table-body').css('overflow','auto');
    })

    $('#wait_true_table').bootstrapTable("destroy").bootstrapTable(cfgWaitTrueTableOption);
    $('#wait_true_table').on('load-success.bs.table',function(data){
        $('#wait_true .fixed-table-body').css('height','480px');
        $('#wait_true .fixed-table-body').css('overflow','auto');
    })

    $('#reject_table').bootstrapTable("destroy").bootstrapTable(cfgRejectTableOption);
    $('#reject_table').on('load-success.bs.table',function(data){
        $('#reject .fixed-table-body').css('height','480px');
        $('#reject .fixed-table-body').css('overflow','auto');
    })
}
/**
 * 获取组织外成员表格 option
 * @param status 用户状态 1-已同意 2--已拒绝 3-未注册 4-已注册 5--已删除
 */
function createOutOfOrgTableOption(status,id){
    findByStatus(status,id);
    var option={
        url:api + "/data/getData",
        method:'post',
        contentType:'application/json',
        pagination:true,
        sidePagination:'server',
        dataType:'html',
        dataField:'data',
        totalField:'total',
        clickToSelect:false,
        smartDisplay:false,
        ajaxOptions: {
            headers: {"Authorization": login.tokenId, "userTel": login.userTel},
        },
        queryParams:function(params){
            var page = {
                pageSize: params.limit,
                pageNum: (parseInt(params.offset) / parseInt(params.limit) ) + 1,
                order: {}
            };
            if (typeof params.sort !== 'undefined') {
                page.order[params.sort] = params.order;
            }
            var data = {
                orgId: orgId,
                status:status,
                depId:id
            };
            params = {
                id: new Date().getTime(),
                client: {},
                data: {
                    "module": "main-api",
                    "url": "/api/user/findByStatus",
                    "param":data
                },
                page:page
            };
            return encrypt(JSON.stringify(params),getPass());
        },
        height:'480',
        columns:[
            // {checkbox:true,valign: "middle",},
            {field: "userName", title: "姓名", align: "left", valign: "middle",width:'15%px'},
            {field: "depName", title: "部门", align: "left",valign: "middle",width:'15%px'},
            {field: "positionName", title: "职位", align: "left",valign: "middle",width:'15%px'},
            {field: "company", title: "厂商", align: "left", valign: "middle",width:'15%px'},
            {field: "userTel", title: "手机号", align: "left", valign: "middle",width:'20%px'}
        ],
        responseHandler:function(res){
            res = JSON.parse(decrypt(res,getPass()));
            return res.data;
        },
        singleSelect:false,//是否单选，false表示多选;true标识只能单选
        //行样式
        rowStyle: function (row, index) {
            return {
                css: {
                    'font-size': '13px',
                    'height': '30px',
                    'color': '#757575'
                }
            }
        },
    }
    return option
}

/**
 * 获取组织外人员总数
 */
function queryDepOther(depId){
    var params = {
        orgId:orgId,
        depId:depId || ''
    }
    ajaxData("main-api","/api/dep/queryDepOther",params,function(res){
        var total = 0;
        if(res.status === 0){
            total = res.data.total;
        }
        $('#org_out').text('组织外(' + total + ')' );
    });
}
/**
 * 获取组织外各个模块人员总数
 * @param status 用户状态 1-已同意 2--已拒绝 3-未注册 4-已注册 5--已删除
 */
function findByStatus(status,id) {
    var page= {
        pageSize: 10,
        pageNum: 1,
        order: {}
    }
    var params = {
        orgId: orgId,
        status:status,
        depId:id
    };
    ajaxData("main-api","/api/user/findByStatus",params,function(res){
        var total = 0;
        if(res.status === 0){
            total = res.data.total;
        }
        if(status==2){//2--已拒绝 3-未注册 4-待同意
            $('#reject_title').text('已拒绝(' + total + ')' );
        }else if(status==3){
            $('#no_reg_title').text('未注册(' + total + ')' );
        }else if(status==4){
            $('#wait_true_title').text('待同意(' + total + ')' );
        }
    });
}

// 校验移动号
function phone(val) {
    var reg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
    return reg.test(val);
    /*
     * 移动号码包括的号段：134/135/136/137,138,139；
    *                     147/148(物联卡号)；
    *                     150/151/152/157/158/159；
    *                     165（虚拟运营商）；
    *                     1703/1705/1706（虚拟运营商）、178；
    *                     182/183/184/187/188
    *                     198
     */

}
//校验邮箱
function mail(val) {
    var re = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
    return re.test(val)
}
//浏览器改变时重新加载表格样式，防止内容错位
$(window).resize(function () {
    $('#person_table').bootstrapTable('resetView');
});
