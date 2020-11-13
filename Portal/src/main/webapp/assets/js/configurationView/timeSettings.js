$(document).ready(function () {
    initTable();
});
function initTable() {
    $('#todo-template').tmpl({}).appendTo($('#todo'));
    $('#history-template').tmpl({}).appendTo($('#history'));
    $('#datetimepicker1').datetimepicker();
    $('#datetimepicker2').datetimepicker();
    $('#datetimepicker3').datetimepicker();
    $('#datetimepicker4').datetimepicker();
    /*点击处理跳转页面*/
    $('.deplay').unbind().bind('click',function(){
        $('.list-wrap').addClass('fn-hide');
        $('.form-wrap').removeClass('fn-hide');
        $('#todoDetail-template').tmpl({"type":"add"}).appendTo($('.ibox-content').empty());
    })
    /*点击返回返回到上一页面*/

    $('#goback').unbind().bind('click',function(){
        $('.list-wrap').removeClass('fn-hide');
        $('.form-wrap').addClass('fn-hide');
    });
    /*点击查看跳转页面*/
    $('.check').unbind().bind('click',function(){
        $('.list-wrap').addClass('fn-hide');
        $('.form-wrap').removeClass('fn-hide');
        $('#historyCheck-template').tmpl({"type":"add"}).appendTo($('.ibox-content').empty());
        $('#todo-template').tmpl({}).appendTo($('#flow'));
        $('#todo-template').tmpl({}).appendTo($('#taskDetail'));
    })
}





