$().ready(function () {
    settlement.init();
});

var orgId = $("#orgId", parent.document).attr("data-id");
var userId = $("#orgId", parent.document).attr("data-user");
// var userId = "b0a7b018617a4c18b940e3f576f2350f";
var settlement = {
    init: function () {
        settlement.getReportList();

        $('#exportBtn').off('click').on('click',function(){
            sweetAlert({
                title: "提示",
                text: "确定要导出当前报表数据?",
                type: 'warning',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            },function(){
                var params = {
                    orgId:orgId,
                    // reportId:"11",
                    reportId: $('#reportSelector').val()
                };
                var fileName = $('#statisticPersonRange').text() + '-' + $('#statisticTime').text() + "结算报表.xlsx";
                postForFile(getApiUrl() + "/data/settlement/export",{data:params},fileName);
            });
        });

        $('#goBackBtn').off('click').on('click', function () {
            $('#mainPanel').show();
            $('#detailPanel').hide();
        });

        window.onresize = function () {
            $('.chartDom').each(function () {
                var tempChart = echarts.getInstanceByDom(document.getElementById($(this).attr('id')));
                if (tempChart) tempChart.resize();
            });
        };
    },

    getReportList: function () {
        var params = {
            orgId: orgId,
            userId: userId
        };
        ajaxData("main-api", "/api/settlement/report/list", params, function (res) {
            if (res.status !== 0 ) {
                $('#settlementList').html('<div class="text-center" style="padding: 50px 0 ">'+ res.message +'</div>');
                return false;
            }
            if(res.data && res.data.data.length == 0){
                $('#settlementList').html('<div class="text-center" style="padding: 50px 0 ">暂无结算数据</div>');
                return false;
            }
            $('#settlementList').html('');
            res.data.data.forEach(function (item) {
                $('#settlementList').append(
                    '<div class="staticItem" title="'+ item['settlementName'] +'" onclick="settlement.getCycleList(\'' + item['settlementId'] + "','" + item['settlementName']  + "','" + item['depName']  +'\')">' +
                    '    <img src="assets/images/settlement/month.png">' +
                    '    <div>' + item['settlementName'] + '</div>' +
                    '</div>'
                );
            });
        })
    },

    getCycleList: function (settlementId, settlementName , depName) {
        $('#mainPanel').hide();
        $('#detailPanel').show();
        $('#detailPanel .panel-heading #panelDetailHead').text(settlementName);
        $('#statisticPersonRange').text(depName);
        var params = {
            settlementId: settlementId
        };
        ajaxData("main-api", "/api/settlement/report/cycleList", params, function (res) {
            if (res.status != 0 || !res.data.data) {
                sweetAlert({
                    title: "信息",
                    text: res.message || '周期查询失败，请联系管理员',
                    type: 'warning',
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定"
                });
                return false;
            }
            settlement.setCycleList(res.data.data)
        })
    },

    reportMap:{},
    setCycleList: function (data) {
        $('#reportSelector').html('');
        $('#reportDetail').hide();
        $('#reportDetailNoneData').show();
        if (data.length > 0) {
            $('#reportDetail').show();
            $('#reportDetailNoneData').hide();
            data.forEach(function (item) {
                settlement.reportMap[item.reportId] = item['statCycle'];
                $('#reportSelector').append(
                    '<option value="' + item['reportId'] + '">' + item['statCycle'] + '</option>'
                )
            });
            // $('#reportSelector').off('change').on('change', function () {
            //     settlement.getReportDetail($(this).val());
            //     $('#statisticTime').text(settlement.reportMap[$(this).val()]);
            // });
            settlement.getReportDetail(data[0].reportId);
            $('#statisticTime').text(data[0].statCycle);
        }
        $('#queryBtn').off('click').on('click',function () {
            settlement.getReportDetail($('#reportSelector').val());
            $('#statisticTime').text(settlement.reportMap[$('#reportSelector').val()]);
        });
        $('#reportSelector').selectpicker({width: '150px'});
    },

    getReportDetail: function (reportId) {
        for (var i = 1; i <= 4; i++) {
            (function(type){
                var params = {reportId: reportId, type: type};
                ajaxData("main-api", "/api/settlement/report/detail", params, function (res) {
                    var data = [];
                    if (res.data) {
                        data =  res.data.data;
                    }
                    var funName = ['','setPersonChartAndTable','setCheckChartAndTable','setCheckWorkChartAndTable','setWorkloadChartAndTable'][type];
                    settlement[funName](data);
                })
            })(i);
        }
    },

    // 人员统计
    setPersonChartAndTable: function (data) {
        var chartOption = {
            chartLabel: '人员统计',
            yAxisName: "人数",
            legend: ['在岗人数', '离职人数'],
            xAxisData: [],
            data: {"在岗人数":[],"离职人数":[]}
        };
        data.forEach(function (item) {
            chartOption.xAxisData.push(item.company);
            chartOption.data["在岗人数"].push(item['jobTotal']);
            chartOption.data["离职人数"].push(item['leaveToal']);
        });

        settlement.createChart('personChart', chartOption);
        settlement.createTable('personTable', data,[
            {field: 'company', title: '分类'},
            {field: 'jobTotal', title: '在岗人数'},
            {field: 'leaveToal', title: '离职人员数(离职率)',formatter:function (val,row) {
                return val + "("+ row.rate +")"
            }}
        ]);
    },

    // 考核统计
    setCheckChartAndTable:function(data){
        var chartOption1 = {
            chartLabel: '任务统计',
            yAxisName:"数量",
            legend: ['任务数量', '完成数量','超时数量'],
            xAxisData: [],
            data: {"任务数量":[],"完成数量":[],"超时数量":[]}
        };
        (data.task || []).forEach(function (item) {
            chartOption1.xAxisData.push(item.company);
            chartOption1.data["任务数量"].push(item['allTotal']);
            chartOption1.data["完成数量"].push(item['finishTotal']);
            chartOption1.data["超时数量"].push(item['timeoutTotal']);
        });
        settlement.createChart('checkChart1', chartOption1);
        settlement.createTable('checkTable1', data.task || [],[
            {field: 'company', title: '分类'},
            {field: 'allTotal', title: '任务数量'},
            {field: 'finishTotal', title: '完成数量（完成率%）',formatter:function (val,row) {
                return val + "("+ (row['finishRate'] || '0%') +")"
            }},
            {field: 'timeoutTotal', title: '超时数量（超时率%）',formatter:function (val,row) {
                return val + "("+ (row['timeOutRate'] || '0%') +")"
            }}
        ]);

        var chartOption2 = {
            chartLabel: '绩效统计',
            yAxisName:"数量",
            legend: ['绩效数量', '未评绩效数','平均分数','及格数量'],
            xAxisData: [],
            data: {"绩效数量":[],"未评绩效数":[],"平均分数":[],"及格数量":[]}
        };
        (data.kh || []).forEach(function (item) {
            chartOption2.xAxisData.push(item.company);
            chartOption2.data["绩效数量"].push(item['allTotal']);
            chartOption2.data["未评绩效数"].push(item['notReviewTotal']);
            chartOption2.data["平均分数"].push(item['avgCount']);
            chartOption2.data["及格数量"].push(item['passTotal']);
        });
        settlement.createChart('checkChart2', chartOption2);
        settlement.createTable('checkTable2', data.kh || [],[
            {field: 'company', title: '分类'},
            {field: 'allTotal', title: '绩效数量'},
            {field: 'notReviewTotal', title: '未评绩效数'},
            {field: 'avgCount', title: '平均分数'},
            {field: 'passTotal', title: '及格数量（及格率%）',formatter:function (val,row) {
                return val + "("+ (row['passRate'] || '0%') +")"
            }}
        ]);
    },

    // 考勤统计
    setCheckWorkChartAndTable:function(data){
        var chartOption1 = {
            chartLabel: '出勤统计',
            yAxisName:"次数",
            legend: ['打卡次数','缺卡次数', '迟到次数','早退次数'],
            xAxisData: [],
            data: {"打卡次数":[],"缺卡次数":[],"迟到次数":[],'早退次数':[]}
        };
        (data.card || []).forEach(function (item) {
            chartOption1.xAxisData.push(item.company);
            chartOption1.data["打卡次数"].push(item['cardTotal']);
            chartOption1.data["缺卡次数"].push(item['defectTotal']);
            chartOption1.data["迟到次数"].push(item['lateTotal']);
            chartOption1.data["早退次数"].push(item['earlyTotal']);
        });

        settlement.createChart('checkWorkChart1', chartOption1);
        settlement.createTable('checkWorkTable1', data.card || [],[
            {field: 'company', title: '分类'},
            {field: 'cardTotal', title: '打卡次数'},
            {field: 'defectTotal', title: '缺卡次数'},
            {field: 'lateTotal', title: '迟到次数'},
            {field: 'earlyTotal', title: '早退次数'}
        ]);

        var chartOption2 = {
            chartLabel: '请假加班统计',
            yAxisName:"数量",
            legend: ['人数','加班次数','请假次数'],
            xAxisData: [],
            data: {"人数":[],"加班次数":[],"请假次数":[]}
        };
        (data.person || []).forEach(function (item) {
            chartOption2.xAxisData.push(item.company);
            chartOption2.data["人数"].push(item['personNum']);
            chartOption2.data["加班次数"].push(item['overtimeNum']);
            chartOption2.data["请假次数"].push(item['leaveNum']);
        });
        settlement.createChart('checkWorkChart2', chartOption2);
        settlement.createTable('checkWorkTable2', data.person || [],[
            {field: 'company', title: '分类'},
            {field: 'personNum', title: '人数'},
            {field: 'overtimeNum', title: '加班次数'},
            {field: 'leaveNum', title: '请假次数'}
        ]);
    },

    // 工作量统计
    setWorkloadChartAndTable:function(data){
        var chartOption = {
            chartLabel: '工作量统计',
            yAxisName:"工作量",
            legend: ['应结工作量', '考核扣减','考勤扣减','实结工作量'],
            xAxisData: [],
            data: {"应结工作量":[],"考核扣减":[],'考勤扣减':[],'实结工作量':[]}
        };
        data.forEach(function (item) {
            chartOption.xAxisData.push(item.company);
            chartOption.data["应结工作量"].push(item['allTotal']);
            chartOption.data["考核扣减"].push(item['khTotal']);
            chartOption.data["考勤扣减"].push(item['kqTotal']);
            chartOption.data["实结工作量"].push(item['realTotal']);
        });

        settlement.createChart('workloadChart', chartOption);
        settlement.createTable('workloadTable', data,[
            {field: 'company', title: '分类'},
            {field: 'allTotal', title: '应结工作量'},
            {field: 'khTotal', title: '考核扣减'},
            {field: 'kqTotal', title: '考勤扣减'},
            {field: 'realTotal', title: '实结工作量'}
        ]);
    },

    createChart: function (domId, opt) {
        opt = $.extend({
            chartLabel: '人员统计图',
            yAxisName:"数量",
            legend: ['在岗人数', '离职人数'],
            xAxisData: ['一级BOMC', '一级SMP'],
            data: {}
        }, opt);

        var option = {
            backgroundColor: "#ffffff",
            color: ['#2ED7B7', '#FF7474', '#7793F3', '#FBBE5E'],
            title: {
                text: opt.chartLabel,
                left: -5,
                textStyle: {
                    fontWeight: "normal",
                    color: '#333',
                    fontSize: 14
                }
            },
            dataZoom : [{
                type: 'inside',
                start:25,
                end:75
            }],
            grid: {
                top: 60,
                left: 20,
                right: 20,
                bottom: 10,
                containLabel: true
            },
            tooltip: {
                trigger: "axis"
            },
            legend: {
                type: "scroll",
                right: 20,
                top: 0,
                data: opt.legend,
                pageIconColor: "#00a3fd"
            },
            xAxis: {
                type: "category",
                boundaryGap: true,
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#A4AAAE'
                    }
                },
                axisLabel: {
                    formatter: "{value}",
                    color: '#7f7f7f'
                },
                data: opt.xAxisData
            },
            yAxis: {
                name:opt.yAxisName,
                type: "value",
                splitNumber:6,
                axisTick: {show: false},
                axisLine: {
                    show: true,
                    lineStyle:{
                        color:'#A4AAAE'
                    }
                },
                splitLine: {
                    lineStyle: {
                        type: "solid"
                    }
                },
                nameTextStyle:{
                    color:'#A4AAAE',
                    padding: [0,0,0,-30]
                }
            },
            series: []
        };

        var isNoneData = true;
        $.each(opt.data,function(key,dataArr){
            option.series.push(
                {
                    name: key, type: "bar",
                    barWidth: 30, data: dataArr,
                    label:{
                        normal: {
                            show: true,
                            position:'top',
                            color:'#333'
                        }
                    }
                }
            );
            if(Array.isArray(dataArr) && Math.max.apply(null, dataArr) > 0){
                isNoneData = false;
            }
        });

        if (isNoneData) {
            option.yAxis.max = 100;
        }

        initChart(domId, option);
    },

    createTable: function (tableId, data, columns) {
        columns = columns || [{field: 'company', title: '分类'}];
        var tHeight = tableId === "workloadTable" ?
            (data.length > 4 ? 280 : '') : (data.length > 8 ? 370 : '');
        $("#" + tableId).bootstrapTable('destroy')
            .bootstrapTable({
                formatNoMatches: function () {
                    return '暂无数据';
                },
                rowStyle: function (row, index) {
                    return {
                        css: {
                            'font-size': '13px',
                            'height': '30px',
                            'color': '#757575'
                        }
                    }
                },
                data: data,
                columns: columns,
                height: tHeight
            });
    }
};

function initChart(domId, option) {
    var tempChart = echarts.getInstanceByDom(document.getElementById(domId));
    if (!tempChart) tempChart = echarts.init(document.getElementById(domId));
    tempChart.clear();
    tempChart.resize();
    tempChart.setOption(option);
}