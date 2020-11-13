$().ready(function(){
    task.init();
});

var orgId=$("#orgId",parent.document).attr("data-id");
var userId= $("#orgId",parent.document).attr("data-user");
var pageSize = 9;
var task = {
    curTab: 'todo',
    todoPageNum: 1,
    hisPageNum: 1,

    init:function(){
        $('#taskTypeSelector').selectpicker({ width: '120px'});

        $('#taskCloseBtn').off('click').on('click',function(){
            $('#mainPanel').show();
            $('#detailPanel').hide();
        });

        $('#queryHisTaskBtn').off('click').on('click',function(){
            task.getHisTaskList();
        });

        $('#taskSubmitBtn').off('click').on('click',function(){
            task.submitTask($(this).attr('data-taskId'));
        });

        $('#taskRejectBtn,#taskApproveBtn').off('click').on('click',function(){
            var type = $(this).attr('data-type');
            $('label[for="dialogApproveMessage"]').text((type == 2 ? '*' : '') + "审批意见：");
            $('#dialogTaskRejectBtn')[type == 2 ? 'show':'hide']();
            $('#dialogTaskApproveBtn')[type == 3 ? 'show':'hide']();
            $('#approvalDialog').modal('show');
        });

        $('#myTab li a').off('click').on('click', function () {
            if ($(this).attr('href') === "#todo") {
                task.curTab = "todo";
                task.todoPageNum = 1;
                $('#todoTaskList').html('');
                task.getTodoTaskList();
            } else {
                task.curTab = "his";
                task.hisPageNum = 1;
                $('#hisTaskList').html('');
                task.getHisTaskList();
            }
        });
        $('#myTab li:eq(0) a').click();

        $('.showMore').off('click').on('click', function () {
            if($(this).hasClass('disabled')){
                return false;
            }

            if (task.curTab === "todo") {
                task.todoPageNum++;
                task.getTodoTaskList();
            } else {
                task.hisPageNum++;
                task.getHisTaskList();
            }
        });
    },

    // 待办任务列表
    getTodoTaskList:function(pSize){
        var params = {
            owner:userId,
            orgId:orgId,
            page: {
                pageSize: pSize || pageSize,
                pageNum: task.todoPageNum
            }
        };
        ajaxData("main-api","/api/taskInstance/pending",params,function (res) {
            if(res.status !== 0  || res.data.data.length == 0){
                $('#todoTaskList').html('<div class="text-center" style="padding: 50px 0 ">暂无任务</div>');
                return false;
            }
            task.refreshTaskList('todoTaskList', res.data.data,res.data.total,1);
        });

    },

    getHisTaskList:function(){
        var params = {
            owner:userId,
            orgId:orgId,
            page: {
                pageSize: pageSize,
                pageNum: task.hisPageNum
            }
        };
        ajaxData("main-api","/api/taskInstance/history",params,function (res) {
            if(res.status !== 0  || res.data.data.length == 0){
                $('#hisTaskList').html('<div class="text-center" style="padding: 50px 0 ">暂无任务</div>');
                return false;
            }
            task.refreshTaskList('hisTaskList',res.data.data,res.data.total,2);
        });
    },

    submitTask:function(taskId){
        var params = {
            id:taskId,
            orgId:orgId,
            ccIdList:[],
            taskWorkDetails:[]
        };
        var errMsg = "";
        $('#taskContentTable tr').each(function () {
            if($(this).find('input[name="workload"]').length){
                if(isNaN(parseInt($(this).find('input[name="workload"]').val())) || $(this).find('input[name="workload"]').val() < 0){
                    errMsg = "工作量只能为非负实数！";
                }
                if($(this).find('input[name="title"]').val().trim().length == 0
                    || $(this).find('input[name="workload"]').val().trim().length == 0
                        || $(this).find('input[name="workContent"]').val().trim().length == 0 ){
                    errMsg = "工作标题、工作内容、工作量都不允许为空！";
                }
                params.taskWorkDetails.push({
                    title:$(this).find('input[name="title"]').val().trim(),
                    workload:$(this).find('input[name="workload"]').val(),
                    workContent:$(this).find('input[name="workContent"]').val().trim()
                })
            }
        });
        if(errMsg.length > 0){
            sweetAlert({
                title: "信息",
                text: errMsg,
                type: 'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
            return false;
        }
        ajaxData("main-api","/api/taskInstance/submit",params,function (res) {
            sweetAlert({
                title: "信息",
                text: res.message || (res.status !== 0 ? '提交失败，请联系管理员' : '提交成功'),
                type: res.status !== 0 ? 'warning' : 'success',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            },function () {
                if (res.status === 0) {
                    $('#taskCloseBtn').click();
                }
            });
            $('#todoTaskList').html('');
            task.getTodoTaskList(task.todoPageNum * pageSize);
        });
    },

    refreshTaskList:function(taskListId,data,total,type){
        (data || []).forEach(function (item, index) {
            $('#' + taskListId).append(
                '<div class="panel-border taskItem">' +
                '   <div class="taskTitle">'+ (item.taskName ||'') + task.overTimeSpan(item.overtimeSign,item.overtime) +
                '   </div>' +
                '   <div class="common-div">任务类型：'+ (item.taskType || '') +'</div>' +
                '   <div class="common-div">创建时间：'+ (item.createTime || '') +'</div>' +
                '   <div class="common-div">完成期限：'+ (item.deadline || '') +'</div>' +
                '   <div class="common-div">状态：'+ (item.taskStatusName || '') +'</div>' +
                '   <div class="common-div">任务所属人：'+(item.ownerName || '')+'</div>' +
                '   <div class="bottomBtnGroup">' +
                '       <button type="button" class="handleBtn btn_default active" data-id="'+item.id+'" data-type="'+type+'" data-taskName="'+ item.taskName +'">'+(type == 1 ? '处理':'查看')+'</button>' +
                '   </div>' +
                '</div>')
        });

        if($('#' + taskListId).find('.taskItem').length === total){
            $('.showMore').text('没有更多了！').addClass('disabled');
        }else{
            $('.showMore').text('加载更多…').removeClass('disabled').show();
        }

        $('#' + taskListId).find('.handleBtn').off('click').on('click',function(){
            var taskId = $(this).attr('data-id');
            var type = $(this).attr('data-type');
            var taskName = $(this).attr('data-taskName');
            task.getTaskDetail(taskId,type);
            $('#mainPanel').hide();
            $('#detailPanel').show();
            $('a[href="#taskDetail"]').click();
            $('#taskSubmitBtn,#taskRejectBtn,#taskApproveBtn')[type == 1 ? 'show' : "hide"]().attr('data-taskId',taskId);
            $('#detailTaskHead').text(taskName);
        });
    },

    // overTimeSpan:function(deadline){
    //     var currDate = new Date();
    //     var deadlineDate = new Date(deadline);
    //     var timeCnt = currDate.valueOf() - deadlineDate.valueOf();
    //     if(timeCnt < 0 && timeCnt < -1000 * 60 * 60 * 24 ){
    //         return '<span class="overtimeHint">1天后超时</span>';
    //     }else if(timeCnt > 0){
    //         return '<span class="timeoutHint">已超时' +
    //             Math.max(parseInt(timeCnt/(1000 * 60 * 60 * 24)),1)
    //          +'天</span>';
    //     }
    //     return '';
    // },

    overTimeSpan:function(overtimeSign,overtime){
        if(!overtimeSign){
            return '';
        }else if(overtimeSign == 1){
            return '<span class="overtimeHint">'+ overtime +'</span>';
        }else if(overtimeSign  == 2){
            return '<span class="timeoutHint">' + overtime +'</span>';
        }
        return '';
    },

    getTaskDetail:function(taskId,type){
        var params = {id:taskId,orgId:orgId};
        ajaxData("main-api","/api/taskInstance/detail",params,function (res) {
            $('#taskContentTable')
                .bootstrapTable('destroy')
                .bootstrapTable(type == 1  ? task.taskContentTableOption : task.taskContentHisTableOption);

            if(res.status !== 0 ){
                sweetAlert({
                    title: "信息",
                    text: "任务详情查询失败。" + res.message,
                    type: 'warning',
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定"
                });
                return false;
            }else if(res.data && res.data.data){
                if(type == 1){
                    if(res.data.data.taskStatus != 1){
                        $('#taskContentTable').bootstrapTable('destroy').bootstrapTable(task.taskContentHisTableOption);
                        $('#taskRejectBtn,#taskApproveBtn').show();
                        $('#taskSubmitBtn').hide();
                    }else{
                        $('#taskSubmitBtn').show();
                        $('#taskRejectBtn,#taskApproveBtn').hide();
                    }
                }
                $('input[name="taskBaseInfo"]').each(function(){
                    $(this).val(res.data.data[$(this).attr('id').replace('2','')]);
                });
                $('input[name="ownerInfo"]').each(function(){
                    $(this).val(res.data.data.ownerInfo[$(this).attr('id')]);
                });
                task.supplyRecordId = res.data.data.id || null;
                task.approveRecordId = res.data.data.approveRecordId || null;
                if(res.data.data.approveInfo){
                    $('#approveRemarks').val(res.data.data.approveInfo.approveRemarks || '');
                    $('input[name="approveInfo"]').each(function(){
                        $(this).val(res.data.data.approveInfo[$(this).attr('id')]);
                        if($(this).attr('id') === "approveStatus"){
                            $(this).val({"2":"通过","3":"拒绝"}[res.data.data.approveInfo["approveStatus"]]);
                        }
                    });
                }
                if(res.data.data.overtimeSign != "2"){
                    $('#overtime,#overtime2').val(res.data.data.overtime || "未超时");
                }

                $('#taskCreatorTime').text('('+ res.data.data.createTime +')');
                $('#taskCreatorName').text('发起人：'+ res.data.data.taskCreatorInfo.taskCreatorName );

                var taskApproverName = (res.data.data.approveInfo && res.data.data.approveInfo.approverName) ?
                    ('审批人：'+ res.data.data.approveInfo.approverName) : '主管不存在';
                $('#taskApproverName').text(taskApproverName);

                $('#taskContentTable').bootstrapTable('load',res.data.data.taskWorkDetails);
                task.createFlowChart( res.data.data.flowNodeList || []);

                var totalWorkload = 0;
                res.data.data.taskWorkDetails.forEach(function (item) {
                    totalWorkload += (parseFloat(item.workload) || 0);
                });
                $('#totalWorkload').text(totalWorkload || 0);
            }
        });
    },

    createFlowChart:function(flowNodeList){
        $('#flowChart').html('');
        // flowNodeList = (flowNodeList || []).sort(function (a,b) {
        //     return new Date(a.operateTime).valueOf() - new Date(b.operateTime).valueOf()
        // });
        flowNodeList.forEach(function(item,index){
            var personLabel = ['','创建人：','提交人：','审批人：'][item.nodeType] || '';
            var totalLength = flowNodeList.length;
            var done = "done";
            if(index == totalLength - 2 && flowNodeList[totalLength -1].nodeType != 4){
                done = "";
            }else if(index == totalLength - 1 && flowNodeList[totalLength -1].nodeType != 4){
                done = "undo";
            }
            var itemHtml = '<div class="hFlowBarStep '+done+'">' +
                '    <img class="hFlowBarStepImg" src="assets/images/task/flowItemBg.png">' +
                '    <span class="hFlowBarStepImgText">'+ item.nodeName +'</span>' +
                '    <div class="hFlowPoint"></div>' +
                '    <span class="hFlowBarDatetime">'+ (item.operateTime || '') +'</span>' +
                '    <span class="hFlowBarPerson">'+ personLabel + (item.operatorName || '') +'</span>';
            if(item.nodeType == 3){
                itemHtml +='<div class="hFlowBarResult">审批结果：'+ ({"3":"拒绝","2":"通过"}[item.operateResult] || '') +'</div>' +
                    '<div class="hFlowBarRemarks">审批意见：<span class="operateRemarks">'+ (item.operateRemarks || '') +'</span></div>' ;
            }
            itemHtml +=  '</div>';
            $('#flowChart').append(itemHtml);
        });

    },

    resetFlowChartHeight:function(){
        var maxHeight = 0;
        $('#flowChart .hFlowBarRemarks').each(function(){
            maxHeight = Math.max(maxHeight,$(this).height());
        });
        $('#flowChart .hFlowBarStep').css('height',200 + maxHeight);
    },

    taskContentTableOption:{
        data:[],
        columns:[
            {field:'title',title:'工作标题',formatter:function(val){
                return '<input class="form-control" name="title" maxlength="30" value="'+(val || '')+'">'
            }},
            {field:'workContent',title:'工作内容',formatter:function(val){
                return '<input class="form-control" name="workContent" maxlength="500" value="'+(val || '')+'">'
            }},
            {field:'workload',title:'工作量',formatter:function(val){
                return '<input class="form-control" name="workload"  value="'+(val || '')+'">'
            }},
            {field:'opera',title:'操作',formatter:function(val,row,index){
                return '<a class="delWorkContent" data-id="'+row.id+'">删除</a>'
            }}
        ],
        formatNoMatches: function () {
            return '点击添加工作记录';
        },
        onPostBody:function(){
            $('#taskContentTable .delWorkContent').off('click').on('click',function(){
                var data = task.curWorkloadData();
                $('#taskContentTable').bootstrapTable("load",data);

                var delId = $(this).attr('data-id');
                $('#taskContentTable').bootstrapTable("remove",{field:'id',values:[delId]});
                task.calcTotalPoint();
            });
            $('#taskContentTable tbody').append(
                '<tr><td colspan="4" class="text-center">' +
                '   <a onclick="task.appendWorkload()">增加一行</a>' +
                '</td></tr>'
            );
            $('#taskContentTable input[name="workload"]').off('blur').on('blur',function(event){
                task.calcTotalPoint();
            }).off('keydown').on('keydown', function (event) {
                if (event.keyCode === 8 || (event.keyCode >= 37 && event.keyCode <= 40)) {
                    return true;
                }
                if (!(/^[0-9]*$/.test(event.key))) {
                    return false;
                }
            })
        }
    },

    curWorkloadData:function(){
        var data = [];
        $('#taskContentTable tr').each(function () {
            if($(this).find('input[name="workload"]').length){
                var id = $(this).find('.delWorkContent').attr('data-id');
                data.push({
                    id: id || randomChar(),
                    title:$(this).find('input[name="title"]').val(),
                    workload:$(this).find('input[name="workload"]').val(),
                    workContent:$(this).find('input[name="workContent"]').val()
                })
            }
        });
        return data;
    },

    appendWorkload:function(){
        var data = task.curWorkloadData();
        data.push({id:randomChar()});
        $('#taskContentTable').bootstrapTable("load",data);
    },

    calcTotalPoint:function(){
        var total = 0;
        $('#taskContentTable input[name="workload"]').each(function () {
            total += (parseFloat($(this).val()) || 0);
        });
        $('#totalWorkload').text(total || 0);
    },

    taskContentHisTableOption:{
        data:[],
        columns:[
            {field:'id',title:'ID',width:250},
            {field:'title',title:'工作标题',width:300,formatter:function(val){
                return '<div class="table-inner" title="'+ val +'">'+ val +'</div>';
            }},
            {field:'workContent',title:'工作内容',width:400,formatter:function(val){
                return '<div class="table-inner" title="'+ val +'">'+ val +'</div>';
            }},
            {field:'workload',title:'工作量'}
        ]
    },

    supplyRecordId:null,
    approveRecordId:null,
    submitApprove:function(type){
        if(type == 3 && $('#dialogApproveMessage').val().trim().length == 0){
            sweetAlert({
                title: "信息",
                text: '提交失败，请输入审批意见',
                type:  'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
            return false;
        }
        if(task.supplyRecordId == null || task.approveRecordId == null){
            sweetAlert({
                title: "信息",
                text: '提交失败，审批ID或审批申请单ID不存在',
                type:  'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
            return false;
        }
        var params = {
            "orgId": orgId,
            "applyId": userId,
            "applyMainType": "9",
            "approveRecordId": task.approveRecordId,
            "approveMessage": $('#dialogApproveMessage').val().trim(),
            "supplyRecordId": task.supplyRecordId,
            "approveStatus": type.toString()
        };
        ajaxData("main-api","/api/approve/approve",params,function (res) {
            sweetAlert({
                title: "信息",
                text: res.message || (res.status !== 0 ? '提交审批失败，请联系管理员' : '提交审批成功'),
                type: res.status !== 0 ? 'warning' : 'success',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            },function () {
                if (res.status === 0) {
                    $('#taskCloseBtn').click();
                    $('#approvalDialog').modal('hide');
                }
            });
            $('#todoTaskList').html('');
            task.getTodoTaskList(task.todoPageNum * pageSize);
        })
    }
};

function randomChar (len) {
    len = len || 36;
    var x = "qwertyuioplkjhgfdsazxcvbnm0123456789";
    var tmp = "";
    var timestamp = new Date().getTime();
    for (var i = 0; i < len; i++) {
        tmp += x.charAt((Math.ceil(Math.random() * 100000000) + timestamp) % x.length);
    }
    return tmp;
}