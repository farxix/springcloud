$().ready(function(){
    DATE.init();
});

var orgId=$("#orgId",parent.document).attr("data-id");
var DATE = {
    init:function(){
        DATE.initSelector();
        DATE.initCalendarPanel(formatDate(new Date(),'yyyy-MM'));
        $('#dateLabel').text(formatDate(new Date(),'yyyy年MM月'));
    },

    initSelector:function(){
        var curDate = new Date();
        var curYear = curDate.getFullYear();
        for(var i = 0; i < 10; i++){
            $('#yearSelector').append('<option value="'+(curYear + i)+'">'+(curYear + i)+'年</option>')
        }

        var curMonth = curDate.getMonth() + 1;
        for(var i = 1; i <= 12; i++){
            var selected = i == curMonth ? 'selected' : '';
            i = padLeftZero(i);
            $('#monthSelector').append('<option value="'+i+'" '+ selected +'>'+i+'月</option>')
        }

        $('#yearSelector,#monthSelector').off('change').on('change',function () {
            var targetMonth = $('#yearSelector').val() + '-' +  $('#monthSelector').val();
            $('#dateLabel').text($('#yearSelector').val() + '年' +  $('#monthSelector').val() + '月');
            DATE.initCalendarPanel(targetMonth);
        });
        $('#yearSelector,#monthSelector').selectpicker({ width: '100px'});

        $('#saveBtn').off('click').on('click',function(){
            var dayList = [];
            $('#weekBody .dateItem').not(".past").each(function(){
                dayList.push({
                    day:$(this).attr('data-datestr'),
                    flag:$(this).find('.dateSign').attr('class').replace('dateSign','').replace('flag','').trim()
                })
            });
            DATE.setHoliday(dayList);
        });
    },

    initCalendarPanel:function(dateStr){
        var curDate = new Date();
        var today = formatDate(curDate,'yyyy-MM-dd');

        var targetDate = new Date(dateStr + '-01 00:00:00');
        var nextMonth = new Date(targetDate.valueOf());
        nextMonth.setMonth(targetDate.getMonth()+1,1);

        var dayArray =new Array(targetDate.getDay()+1).join('0').split('');
        while (formatDate(targetDate) < formatDate(nextMonth)){
            dayArray.push(formatDate(targetDate,'yyyy-MM-dd'));
            targetDate = new Date(targetDate.valueOf() + 1000 * 60 * 60 * 24)
        }
        if(dayArray%7 !== 0 ){
            dayArray = dayArray.concat(new Array(8 - dayArray.length%7).join('0').split(''))
        }

        $('#weekBody').html('');
        dayArray.forEach(function (d,index) {
            if(d == 0){
                $('#weekBody').append('<div class="dateItem past"></div>');
            }else{
                var isToday = d == today ? " isToday past" : d < today ? ' past' : '';
                var flag = [1,0].indexOf((index + 1)%7) > -1 ? 'flag2':'flag1';
                var title = d <= today ? '已过日期不可调整' : (d + '\n' + '点击切换工作模式');
                $('#weekBody').append(
                    '<div class="dateItem '+ isToday +'" data-dateStr="'+d+'" title="'+title+'">'
                    + parseInt(d.substring(d.lastIndexOf('-')+1))
                    + '<span class="dateSign '+flag+'">'+(flag == 'flag1' ? '上班':'休息')+'</span>'
                    +'</div>')
            }
        });

        $('#weekBody .dateItem').not(".past").off('click').on('click',function () {
            var $dateSign = $(this).find('.dateSign');
            $dateSign.toggleClass('flag1').toggleClass('flag2');
            $dateSign.text($dateSign.hasClass('flag1') ? '上班' : '休息');
        });

        DATE.getHoliday(dateStr);
    },

    getHoliday:function (queryDate) {
        var cDate = new Date(queryDate + "-01");
        cDate.setMonth(cDate.getMonth() + 1 );
        var params = {
            "orgId": orgId,
            "startTime": queryDate + "-01",
            "endTime": formatDate(cDate)
        };
        ajaxData("main-api","/api/holiday/dayList",params,function (res) {
            if(res.status !== 0 ){
                return false;
            }
            (res.data.data || []).forEach(function (item) {
                var $sign = $('#weekBody .dateItem[data-dateStr="'+ item.day +'"] .dateSign');
                $sign.removeClass("flag1").removeClass("flag2").addClass('flag' + item.flag);
                $sign.text(item.flag == 1? '上班':"休息");
            })
        })
    },

    setHoliday:function(dayList){
        var params = {
            orgId: orgId,
            dayList:dayList
        };
        ajaxData("main-api","/api/holiday/save",params,function (res) {
            sweetAlert({
                title: "信息",
                text: res.message,
                type: res.status !== 0 ? 'warning' : 'success',
                confirmButtonColor: "#3197FA",
                confirmButtonText: "确定"
            });
        })
    }
};

function padLeftZero(str) {
    return ('00' + str).substr(str.toString().length)
}

function formatDate(date, fmt) {
    fmt = fmt || 'yyyy-MM-dd';
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    var o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    };
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            var str = o[k] + '';
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
        }
    }
    return fmt;
}