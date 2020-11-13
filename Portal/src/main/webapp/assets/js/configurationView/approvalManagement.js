define(['jquery','apiConfig','../../../assets/js/lib/sweetalert/sweetalert.min','commonUtils','commonModule','bootstrap-modal','../../../assets/js/toolUtil','../../../assets/js/formValidate','spin','ladda','bootstrap','bootstrap-select','bootstrap-treeview','bootstrap-datetimepicker','bootstrap-datetimepicker.zh-CN','jquery.tablednd.min'],function($,apiConfig,sweetalert,commonUtils,commonModule,modal,toolUtil,formValidate,spin,ladda) {
    var tools = new toolUtil.toolUtil();
    var api  = getApiUrl();
    var userId=$("#orgId",parent.document).attr("data-user");
    var orgId=$("#orgId",parent.document).attr("data-id");
    var userType=$("#orgId",parent.document).attr("data-userType");

    $(document).ready(function () {
        initTable();
    });

    function initTable() {
        $('.list_items').not('#buCard').off('click').on('click',function(){
            sweetalert({
                title: "信息",
                text: "程序员正在加班加点开发中……",
                type: "warning",
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
        });
        /*点击补卡跳转页面*/
        $('#buCard').unbind().bind('click', function () {
            $('.list-wrap').addClass('fn-hide');
            $('#approveBukaForm').removeClass('fn-hide');
            //初始化【发起人的】
            var html = ' <option value="1">直接主管</option>\n' +
                '                        <option value="2">2级主管</option>\n' +
                '                        <option value="3">3级主管</option>\n' +
                '                        <option value="4">4级主管</option>\n' +
                '                        <option value="5">5级主管</option>\n' +
                '                        <option value="6">6级主管</option>\n' +
                '                        <option value="7">7级主管</option>\n' +
                '                        <option value="8">8级主管</option>\n' +
                '                        <option value="9">9级主管</option>\n' +
                '                        <option value="10">10级主管</option>\n' +
                '                        <option value="11">11级主管</option>\n' +
                '                        <option value="12">12级主管</option>\n' +
                '                        <option value="13">13级主管</option>\n' +
                '                        <option value="14">14级主管</option>\n' +
                '                        <option value="15">15级主管</option>\n' +
                '                        <option value="16">16级主管</option>\n' +
                '                        <option value="17">17级主管</option>\n' +
                '                        <option value="18">18级主管</option>\n' +
                '                        <option value="19">19级主管</option>\n' +
                '                        <option value="20">20级主管</option>';
            $('#adminLevelSelector').html(html);
            $('#adminLevelSelector').selectpicker("destroy");
            $('#adminLevelSelector').selectpicker('refresh');
            $('#adminLevelSelector').selectpicker('render');

            $('#selectedUserBtn').text('请选择');
            $('#selectedUserBtn').attr('data-selected','');
            getBuKaInfo();

            $('#selectedUserBtn').off('click').on('click',function(){
                $('#memberSelectDialog').modal('show');

                initTree('orgTree','memberTable');
                createUserTable('memberTable','orgTree');
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
                    $('#selectedUserBtn').text(data[0].userName);
                    $('#selectedUserBtn').attr('data-selected',data[0].userId);
                    $('#memberSelectDialog').modal('hide');
                });
            });
        });

        /*点击返回返回到上一页面*/
        $('#backToMain').unbind().bind('click', function () {
            $('.list-wrap').removeClass('fn-hide');
            $('#approveBukaForm').addClass('fn-hide');
        });

        $('#approveBukaForm').find('input[type="radio"][name="apprUserType"]').off('click').on('click',function(){
            var apprUserType = $(this).val();
            $('.apprUserType').hide();
            $('.apprUserType[data-value="'+apprUserType+'"]').show();
        });

        $('#saveBukaInfoBtn').off('click').on('click',function(){
            saveBukaInfo();
        });

        $('input[name="optionsRadios"]').change(function () {
            if ($('input[name="optionsRadios"][value="option"]').prop("checked")) {
                $('#applyFrom').show();
                $('#member').hide();
            } else if ($('input[name="optionsRadios"][value="option1"]').prop("checked")) {
                $('#applyFrom').hide();
                $('#member').show();

            }
        });
        // 点击选择成员弹出页面
        $('#selectMember').unbind().bind('click', function () {
            $('#right_modal').modal('show');
            /*初始化左侧右侧表格*/
            initTable();
        })
        function initTable() {
         /*   $.ajax({
                url: 'http://10.1.192.175/v1/code/codeQuery',    //请求的url地址
                dataType: "json",   //返回格式为json
                async: true,//请求是否异步，默认为异步，这也是ajax重要特性
                data: JSON.stringify({
                    "type":211,
                    "userId":"root"
                }),
                type: "POST",   //请求方式
                contentType: 'application/json;charset=UTF-8',
                beforeSend: function () {
                    //请求前的处理
                },
                success: function (Response) {
                    //请求成功时处理
                    if(Response.message=='查询数据为空'){
                        var data=[];
                    }
                    else{
                        var data=Response.data;
                    }
                    $('#person_leftTable').bootstrapTable('destroy').bootstrapTable({
                        pagination: false,
                        editable:false,//开启编辑模式
                        clickToSelect: true,
                        pageSize: 15,
                        pageList: [15,20,30,50,100],  //可供选择的每页的行数
                        locale: "zh-CN",
                        classes: 'table table-no-bordered  table-hover-row',
                        singleSelect: true,//单选框
                        fixedColumns: true,//表头固定
                        //行样式
                        rowStyle: function (row, index) {
                            return {
                                css: {
                                    'font-size': '14px',
                                    'height': '30px',
                                    'color': '#757575'
                                }
                            }
                        },
                        data: data,
                        columns: [{
                            checkbox: true,//checkbox
                            align: 'center',//对其方式
                            valign: 'middle'//对其方式
                        }, {
                            field: "codeName",
                            title: "名称",
                            align: "left",
                            valign: "middle",
                        }, {
                            align: "center",
                            width: '100',
                            title: "操作",
                            formatter: function (value, row) {
                                return '下一级';
                            }
                        }
                        ],

                    });
                },
                complete: function () {
                    //请求完成的处理
                },
                error: function () {
                    //请求出错处理
                }
            });

            $('#person_rightTable').bootstrapTable('destroy').bootstrapTable({
                pagination: false,
                editable:false,//开启编辑模式
                clickToSelect: true,
                pageSize: 15,
                pageList: [15,20,30,50,100],  //可供选择的每页的行数
                locale: "zh-CN",
                classes: 'table table-no-bordered  table-hover-row',
                singleSelect: true,//单选框
                fixedColumns: true,//表头固定
                //行样式
                rowStyle: function (row, index) {
                    return {
                        css: {
                            'font-size': '14px',
                            'height': '30px',
                            'color': '#757575'
                        }
                    }
                },
                data: [],
                columns: [{
                    checkbox: true,//checkbox
                    align: 'center',//对其方式
                    valign: 'middle'//对其方式
                }, {
                    field: "codeName",
                    title: "名称",
                    align: "left",
                    valign: "middle",
                }, {
                    align: "center",
                    width: '100',
                    title: "操作",
                    formatter: function (value, row) {
                        return '下一级';
                    }
                }
                ],

            });*/
          /*  $('#person_leftTable').undelegate().delegate('tbody tr','onCheck',function(){
                alert('123');
                var list = [];
                var arr = [];
                var select = $('#person_leftTable').bootstrapTable('getSelections');
                for (var i = 0; i < select.length; i++) {
                    list.push(select[i]['codeName']);
                }
                var checkPerson = $("#person_rightTable tbody").find('tr').length;
                var x = $("<tr><td>" + list + "</td><i class='fa fa-remove'>删除</i></span></td></tr>");
                if (checkPerson === 0) {
                    $("#person_rightTable tbody").append(x);
                } else {
                    $("#person_rightTable tbody").find('tr').each(function () {
                        var arr_id = $(this).children("td:eq(0)").text();
                        arr.push(arr_id);
                    });
                }
            })*/

        }
    }

    //获取设置的补卡配置信息，反填
    var bukaSetting = null;
    function getBuKaInfo(){
        var params = {
            orgId:orgId,
            approveType:1
        };
        ajaxData('main-api','/api/approve/setting/findById',params,function(res){
            var setting = {
                apprUserType:1,
                adminLevel:1
            };
            if(res.data && res.data.data){
                setting = $.extend({},setting,res.data.data);
                bukaSetting  = setting;
            }
            $('#approveBukaForm').find('input[name="apprUserType"][value="'+setting.apprUserType+'"]').click();
            // $('#adminLevelSelector').val(setting.adminLevel);
            $('#adminLevelSelector').selectpicker('val',setting.adminLevel);
            if(setting.apprUserType == 2){
                var user = setting.userList[0];
                $('#selectedUserBtn').text(user.userName);
                $('#selectedUserBtn').attr('data-selected',user.userId);
            }
        })
    }

    // 设置补卡信息
    function saveBukaInfo(){
        var apprUserType = $('#approveBukaForm').find('input[name="apprUserType"]:checked').val();
        var params = {
            createBy:userId,
            updateBy:userId,
            orgId:orgId,
            approveType:1,
            apprUserType:apprUserType,
            adminLevel : $('#adminLevelSelector').val()
        };
        if(apprUserType != 1){
            params.userIdList = [$('#selectedUserBtn').attr('data-selected')];
        }

        if(bukaSetting){
            params.approveId = bukaSetting.approveId
        }

        ajaxData('main-api','/api/approve/setting/' + (bukaSetting ? 'update' : 'add'),params,function(res){
            sweetAlert({
                title: "信息",
                text: res.message,
                type: res.status !== 0 ? "warning" : "success",
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
        })
    }

    /**
     * 绘制组织部门树
     * @param treeId  treeId
     * @param tableId 与树关联的表格Id
     */
    function initTree(treeId,tableId){
        var params = {
            "orgId": orgId,
            "userType":userType,
            "userId":userId
        };
        ajaxData('main-api','/api/dep/userDepTree',params,function(res){
            var treeNode = [];
            if(res.data){
                (res.data.data || []).forEach(function(item){
                    item.id = item.depId;
                    item.text = item.depName;
                    item.parentId = item.parentDepId;
                    item.parentOid = item.parentDepId;
                    item.color = "#878787";
                    item.icon = 'fa fa-folder';
                    treeNode.push(item);
                });
                treeNode = simpleDataTypeToNormalDataType(treeNode,'id','parentId','nodes');
            }
            $('#' + treeId).treeview({
                data: treeNode,
                collapseIcon: 'glyphicon glyphicon-triangle-bottom', // 折叠图标，默认 min
                expandIcon: 'glyphicon glyphicon-triangle-right',
                showBorder:false,
                selectedColor: '#878787',
                selectedBackColor: '#bae7ff'
            });
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
    function createUserTable(tableId,treeId){
        var option = {
            url:api + "/data/user/findByDep",
            method:'post',
            contentType:'application/json',
            pagination:true,
            sidePagination:'server',
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
                    "orgId": orgId,
                    "userId":userId,
                    "depId":$('#' + treeId).treeview("getSelected").length > 0
                        ? $('#' + treeId).treeview("getSelected")[0].depId : ''
                };
                return {page: page,data:data};
            },
            columns:[
                {field: "", title: "", align: "center", radio:true},
                {field: "userName", title: "姓名", align: "left", valign: "middle"},
                {field: "positionName", title: "职位", align: "left",valign: "middle"},
                {field: "rankName", title: "职级", align: "left", valign: "middle"},
                {field: "memberType", title: "成员类型", align: "left", valign: "middle"}
            ]
        };
        $('#' + tableId).bootstrapTable(option);
    }

    return {
        initTable:initTable
    }
});






