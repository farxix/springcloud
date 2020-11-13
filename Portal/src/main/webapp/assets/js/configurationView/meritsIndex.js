$().ready(function () {
    merits.init();
});

var orgId = $("#orgId", parent.document).attr("data-id");
var userId = $("#orgId", parent.document).attr("data-user");
var pageSize = 9;
var merits = {
    curTab: 'todo',
    todoPageNum: 1,
    hisPageNum: 1,

    init: function () {
        merits.initBtnEvent();
    },

    initBtnEvent: function () {
        $('#returnBtn').off('click').on('click', function () {
            $('#mainPanel').show();
            $('#detailPanel').hide();
        });

        $('#submitBtn').off('click').on('click', function () {
            var meritsId = $('#submitBtn').attr('data-meritsId');
            if ($('#perfGrade').val().trim().length == 0) {
                sweetAlert({
                    title: "错误",
                    text: '提交失败,请输入考勤分数。',
                    type: 'warning',
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定"
                });
                return false;
            }
            if ($('#perfGrade').val() < 1 || $('#perfGrade').val() > 100) {
                sweetAlert({
                    title: "信息",
                    text: '考评分数必须是1-100的正整数！',
                    type: 'warning',
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定"
                });
                return false;
            }
            if ($('#perfMessage').val().trim().length == 0) {
                sweetAlert({
                    title: "错误",
                    text: '提交失败,请输入考勤意见。',
                    type: 'warning',
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定"
                });
                return false;
            }
            merits.submitMerits(meritsId);
        });

        $('#perfGrade').off('keydown').on('keydown', function (event) {
            if (event.keyCode === 8 || (event.keyCode >= 37 && event.keyCode <= 40)) {
                return true;
            }
            if (!(/^[0-9]*$/.test(event.key))) {
                return false;
            }
        });

        $('#myTab li a').off('click').on('click', function () {
            if ($(this).attr('href') === "#myMerits") {
                merits.curTab = "todo";
                merits.todoPageNum = 1;
                $('#todoMeritsList').html('');
                merits.getTodoMeritsList();
            } else {
                merits.curTab = "his";
                merits.hisPageNum = 1;
                $('#hisMeritsList').html('');
                merits.getHisMeritsList()
            }
        });
        $('#myTab li:eq(0) a').click();

        $('.showMore').off('click').on('click', function () {
            if($(this).hasClass('disabled')){
                return false;
            }

            if (merits.curTab === "todo") {
                merits.todoPageNum++;
                merits.getTodoMeritsList();
            } else {
                merits.hisPageNum++;
                merits.getHisMeritsList()
            }
        });
    },

    setDateTimePicker: function () {
        $('#startTime,#endTime').datetimepicker({
            language: 'zh-CN',
            autoclose: true,
            format: 'yyyy-mm',
            startView: 3,
            minView: 3
        });

        var curDate = new Date();
        $('#startTime').val(formatDate(curDate, 'yyyy-01'));
        $('#endTime').val(formatDate(curDate, 'yyyy-MM'));
    },

    getTodoMeritsList: function (pSize) {
        var params = {
            auditorId: userId,
            orgId: orgId,
            page: {
                pageSize: pSize || pageSize,
                pageNum: merits.todoPageNum
            }
        };
        ajaxData("main-api", "/api/perfInstance/pending", params, function (res) {
            if (res.status !== 0 || res.data.data.length == 0) {
                $('.showMore').hide();
                $('#todoMeritsList').html('<div class="text-center" style="padding: 50px 0 ">暂无绩效</div>');
                return false;
            }
            merits.refreshMeritsList('todoMeritsList', res.data.data, res.data.total,1);
        });
    },

    getHisMeritsList: function () {
        var params = {
            auditorId: userId,
            orgId: orgId,
            page: {
                pageSize: pageSize,
                pageNum: merits.hisPageNum
            }
        };
        ajaxData("main-api", "/api/perfInstance/history", params, function (res) {
            if (res.status !== 0 || res.data.data.length == 0) {
                $('.showMore').hide();
                $('#hisMeritsList').html('<div class="text-center" style="padding: 50px 0 ">暂无历史绩效</div>');
                return false;
            }
            merits.refreshMeritsList('hisMeritsList', res.data.data, res.data.total,2);
        });
    },

    submitMerits: function (meritsId) {
        var params = {
            id: meritsId,
            orgId: orgId,
            perfGrade: $('#perfGrade').val(),
            perfMessage: $('#perfMessage').val()
        };
        ajaxData("main-api", "/api/perfInstance/submit", params, function (res) {
            sweetAlert({
                title: "信息",
                text: res.message || (res.status !== 0 ? '提交失败，请联系管理员' : '提交成功'),
                type: res.status !== 0 ? 'warning' : 'success',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            }, function () {
                if (res.status === 0) {
                    $('#returnBtn').click();
                }
            });
            $('#todoMeritsList').html('');
            merits.getTodoMeritsList(merits.todoPageNum * pageSize);
        });
    },

    /**
     * 生成绩效列表，type: 1-待办绩效，2-历史绩效
     */
    refreshMeritsList: function (meritsListId, data,total, type) {
        (data || [{}, {}, {}]).forEach(function (item, index) {
            $('#' + meritsListId).append(
                '<div class="panel-border meritsItem">' +
                '   <div class="meritsTitle">' + item.perfName + merits.overTimeSpan(item.overtimeSign, item.overtime) + '</div>' +
                '   <div class="common-div">绩效类型：' + (item.perfType || '') + '</div>' +
                '   <div class="common-div">创建时间：' + (item.createTime || '') + '</div>' +
                '   <div class="common-div">完成期限：' + (item.deadline || '') + '</div>' +
                '   <div class="common-div">状态：' + (['处理中', '经理评分'][item.perfStatus] || '') + '</div>' +
                '   <div class="common-div">绩效所属人：' + (item.ownerName || '') + '</div>' +
                (type != 1 ? ('<div class="common-div">绩效分数：' + (item.perfGrade || '') + '</div>') : '') +
                '   <div class="bottomBtnGroup">' +
                '       <button type="button" class="handleBtn btn_default active" data-type="' + type + '" data-id="' + item.id + '" data-perfName="' + item.perfName + '">' + (type == 1 ? '处理' : '查看') + '</button>' +
                '   </div>' +
                '</div>')
        });

        if($('#' + meritsListId).find('.meritsItem').length === total){
            $('.showMore').text('没有更多了！').addClass('disabled');
        }else{
            $('.showMore').text('加载更多…').removeClass('disabled').show();
        }

        $('#' + meritsListId).find('.handleBtn').off('click').on('click', function () {
            var type = $(this).attr('data-type');
            var perfName = $(this).attr('data-perfName');
            var meritsId = $(this).attr('data-id');
            $('#detailMeritsName').text(perfName);
            $('#mainPanel').hide();
            $('#detailPanel').show();
            $('#submitBtn')[type == 1 ? 'show' : "hide"]();
            $('#perfGrade,#perfMessage').prop('readonly', type != 1);
            $('#submitBtn').attr('data-meritsId', meritsId);
            merits.getMeritsDetail(meritsId);
        });
    },

    getMeritsDetail: function (meritsId) {
        var params = {
            id: meritsId,
            orgId: orgId,
            auditorId: userId
        };
        ajaxData("main-api", "/api/perfInstance/detail", params, function (res) {
            if (res.status !== 0) {
                sweetAlert({
                    title: "信息",
                    text: "绩效详情查询失败。" + res.message,
                    type: 'warning',
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定"
                });
                return false;
            } else if (res.data && res.data.data) {
                $('input[name="meritsBaseInfo"]').each(function () {
                    $(this).val(res.data.data[$(this).attr('id').replace('2', '')]);
                });
                $('input[name="ownerInfo"]').each(function () {
                    $(this).val(res.data.data.ownerInfo[$(this).attr('id')]);
                });
                $('input[name="auditorInfo"]').each(function () {
                    $(this).val(res.data.data.auditorInfo[$(this).attr('id').replace("_auditor", "")]);
                });
                $('#overtime').val(res.data.data.overtime || '未超时');
                $('#perfGrade').val(res.data.data.perfGrade);
                $('#perfMessage').val(res.data.data.perfMessage);
                $('#meritsOrderTable').bootstrapTable(merits.meritsOrderTableOption);

                merits.meritsTaskTableOption.data = res.data.data.taskWorkGatherList;
                $('#meritsTaskTable').bootstrapTable("destroy").bootstrapTable(merits.meritsTaskTableOption);
                $('#taskWorkloadTotal').text(res.data.data.taskWorkloadTotal || 0);
            }
        });
    },

    // overTimeSpan: function (deadline) {
    //     var deadlineDate = new Date(deadline);
    //     var currDate = new Date();
    //     var timeCnt = currDate.valueOf() - deadlineDate.valueOf();
    //     if (timeCnt < -1000 * 60 * 60 * 24 && timeCnt < 0) {
    //         return '<span class="overtimeHint">1天后超时</span>';
    //     } else if (timeCnt > 0) {
    //         return '<span class="timeoutHint">已超时' + Math.max(parseInt(timeCnt / 86400000), 1) + '天</span>';
    //     }
    //     return '';
    // },

    overTimeSpan: function (overtimeSign, overtime) {
        if (!overtimeSign) {
            return '';
        } else if (overtimeSign == 1) {
            return '<span class="overtimeHint">' + overtime + '</span>';
        } else if (overtimeSign == 2) {
            return '<span class="timeoutHint">' + overtime + '</span>';
        }
        return '';
    },

    meritsOrderTableOption: {
        data: [],
        formatNoMatches: function () {
            return '暂无工单信息';
        },
        columns: [
            {field: 'orderId', title: '工单ID'},
            {field: 'orderTitle', title: '工单标题'},
            {field: 'orderType', title: '工单类型'},
            {field: 'workload', title: '工作量'}
        ]
    },

    meritsTaskTableOption: {
        data: [],
        formatNoMatches: function () {
            return '暂无工作任务信息';
        },
        columns: [
            {field: 'taskId', title: '工作任务ID',formatter:function(row,row,index){
                var _index = index + 1;
                return ('000' + _index).substring(_index.length);
            }},
            {field: 'taskName', title: '工作任务标题'},
            {field: 'taskWorkload', title: '工作量'}
        ]
    }
};