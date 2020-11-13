var api = getApiUrl();
var tools = new toolUtil();
var userType=$("#orgId",parent.document).attr("data-userType");
var orgId=$("#orgId",parent.document).attr("data-id");
var userId=$("#orgId",parent.document).attr("data-user");
var FormValidate = new FormValidate();
var isLoadSearch = 0;
// var login=getUrlParam();
var login = {userTel:localStorage.getItem("userTel"),tokenId:localStorage.getItem("tokenId")};
var treeNode = [];       //存放树节点信息-树形结构

var _depList = null;

var exportDepSelected = []; //导出时选中的部门

var  validateConfig_attendance = {
            'ID': {
                required: true,
                name: '考勤时间名称',
                validate:function(val){
                    if(val.length >20){
                        return "考勤时间名称不能超过20个字"
                    }
                }
            },
            'datetimepicker1': {
                required: true,
                name: '办公起始时间',
                // validate:function(val){
                //         var val2 = $('#datetimepicker2').val();
                //         var t11=val.split(":");
                //         var t21=val2.split(":");
                //          var sj1 = parseInt(t11[0])*12 + parseInt( t11[1]);
                //          var sj2 = parseInt(t21[0])*12 + parseInt(t21[1]);
                //          if (sj1 > sj2)
                //              {
                //                  return "开始时间大于结束时间";
                //              }
                // }
            },
            'datetimepicker2':{
                required: true,
                name: '办公结束时间',
               // validate:function(val2){
               //         var val = $('#datetimepicker1').val();
               //         var t11=val.split(":");
               //         var t21=val2.split(":");
               //          var sj1 = parseInt(t11[0])*12 + parseInt( t11[1]);
               //          var sj2 = parseInt(t21[0])*12 + parseInt(t21[1]);
               //          if (sj1 > sj2)
               //              {
               //                  return "开始时间大于结束时间";
               //              }
               // }
            }
        };

var  validateConfig_place = {
            'placeName': {
                required: true,
                name: '考勤地点名称',
                validate:function(val){
                    if(val.length >20){
                        return "考勤地点名称不能超过20个字"
                    }
                }
            },
            'waType':{
                required: true,
                name: '办公地点类型',
            },
            'waCompany':{
                required: true,
                name: '所属厂商',
            },
            'address1': {
                required: true,
                name: '考勤地点地址',
                validate:function(val){
                    if(val.length >20){
                        return "考勤地点地址不能超过20个字"
                    }
                }
            },
            'lnglat':{
                required: true,
                name: '考勤地址坐标',
            },
            'across':{
                required: true,
                name: '打卡范围半径',
                integer:true,
                validate:function(val){
                    if(val >2000||val<100){
                        return "打卡范围半径在100-2000之内"
                    }
                }
            }
        };

var  validateConfig_rule= {
            'ruleName': {
                required: true,
                name: '考勤规则名称',
                validate:function(val){
                    if(val.length >20){
                        return "考勤规则名称不能超过20个字"
                    }
                }
            },
            'datetimepicker5': {
                required: true,
                name: '考勤时间',
                validate:function(val){
                 }
            },
            'selectPlace':{
                required: true,
                name: '考勤地点',
               validate:function(val2){
               }
            },
            'workTime':{
                required: true,
                name: '弹性上下班时间',
                integer:true,
               validate:function(val){
                   if(val>240){
                       return  '弹性上下班时间在0-240之内';
                   }
               }
            },
            'lateTime':{
                required: true,
                name: '迟到时限',
                 integer:true,
                validate:function(val){
                    if(val>240){
                        return  '迟到时限在0-240之内';
                    }
                }
            }
        };

var treeNode = [];

function bindDate(){
    $('#datetimepicker1').closest('div.date').unbind().bind('click',function(){
         $('#datetimepicker1').dateSelect();
    })
    $('#datetimepicker2').closest('div.date').unbind().bind('click',function(){
      $('#datetimepicker2').dateSelect();
    });
    $('#wtAcrossSign').hide();
    $('#datetimepicker2,#datetimepicker2').on('change',function () {
        $('#wtAcrossSign').hide();
        if($('#datetimepicker1').val() && $('#datetimepicker2').val()){
            if( new Date('2020/01/01 ' + $('#datetimepicker1').val()).valueOf() >
                new Date('2020/01/01 ' + $('#datetimepicker2').val()).valueOf() ){
                $('#wtAcrossSign').show();
            }
        }
    });

    $('input[type="checkbox"][name="wtStartMin"]').off('change').on('change',function(){
        $('#wtStartMin').prop('readonly',!$(this).prop('checked'));
        if(!$(this).prop('checked')){
            $('#wtStartMin').val('');
        }
    });
    $('input[type="checkbox"][name="wtEndMin"]').off('change').on('change',function(){
        $('#wtEndMin').prop('readonly',!$(this).prop('checked'));
        if(!$(this).prop('checked')){
            $('#wtEndMin').val('');
        }
    });
    $('input[type="radio"][name="workDateType"]').off('change').on('change',function(){
        $('input[name="weekday"]').prop('disabled',$('input[type="radio"][name="workDateType"]:checked').val() !=2);
        if($('input[type="radio"][name="workDateType"]:checked').val() == 1){
            $('input[name="weekday"]').prop('checked',false);
        }
    })
}

/**
 * 检查日期范围合法性
 * @param wtAcross 是否跨日，1-跨日，2-不夸日
 * @returns {boolean}
 */
function checkDateLegal(wtAcross){
    var startDate = new Date('2020/01/01 ' + $('#datetimepicker1').val()).valueOf();
    startDate -= parseInt($('#wtStartMin').val() || 0) * 1000 *60;

    var endDate = new Date(['2020/01/01 ','2020/01/02 '][wtAcross-1] + $('#datetimepicker2').val()).valueOf();
    endDate += parseInt($('#wtEndMin').val() || 0) * 1000 *60;

    if(endDate - startDate > 1000 * 60 * 60 * 24){
        return false
    }
    return true;
}

$(document).ready(function () {
    initTable();
});
function initTable() {
     $('#tree').treeview({
        data: getTree(),
        collapseIcon: 'glyphicon glyphicon-triangle-bottom', // 折叠图标，默认 min
        expandIcon: 'glyphicon glyphicon-triangle-right',
        showBorder:false,
        selectedColor: '#878787',
        selectedBackColor: '#bae7ff',
    });



    // $('#time-template').tmpl({}).appendTo($('#time'));
    // $('#address-template').tmpl({}).appendTo($('#place'));
    // $('#rule-template').tmpl({}).appendTo($('#rule'));
    // 考勤时间配置
    timeSystem();
    // // 考勤地点配置
    // placeSystem();
    // //规则设置
    // ruleSystem();
}

var ruleTimeMap = {};
function initTime_list(wtId){
    var param = {
        "orgId": orgId,
        "userId":userId
    };
    $('#datetimepicker5').html('<option value=" ">请选择...</option>');
    $('.dropdown-toggle').dropdown();
    ajaxData("main-api","/api/time/list",param,function(res){
        if(res.status === 0 && res.data && Array.isArray(res.data.data)){
            ruleTimeMap = {};
            res.data.data.forEach(function (item) {
                ruleTimeMap[item.wtId] = item;
                var selected = wtId == item.wtId ? 'selected' : '';
                $('#datetimepicker5').append(
                    '<option value="'+ item.wtId +'" '+ selected +'>'+ item.wtName +'</option>'
                )
            });
            $('#datetimepicker5').selectpicker({ width: '100%',noneSelectedText:'请选择...'  });
        }
    });

    // var _cfg = {
    //     url:api+'/data/getData',
    //     id:'datetimepicker5',
    //     parameter:encrypt(JSON.stringify(param),getPass()),
    //     default:text
    // };
    // tools.loadSelect2_(_cfg);
}


// 新增考勤时间
$('body').undelegate().delegate('#addTime','click',function () {
    $('#attendanceForm2').empty()
    $('#addTime_modal').modal('show');
    $("#addAttendancel").tmpl({}).appendTo($('#attendanceForm').empty());
    bindDate();
    // 点击确定新增考勤时间
    $("#timeSubmit").unbind().bind('click', function () {
        var flag = FormValidate.validate($('#addTime_form')[0], validateConfig_attendance);
        if (!flag) {
            return;
        }
        var params = {
            "id": new Date().getTime(),
            "client": {},
            "data": {
                "module": "main-api",
                "url": "/api/time/add",
                "param": {
                    "orgId": orgId,
                    "wtType": $('input[type="radio"][name="workDateType"]:checked').val(),
                    "wtName": $('#ID').val(),
                    "wtStart": $('#datetimepicker1').val(),
                    "wtEnd": $('#datetimepicker2').val(),
                    "wtStartMin":"",
                    "wtEndMin":"",
                    "wtAcross": 1,
                    "createBy": userId
                }
            }
        };
        if(new Date('2020/01/01 ' + $('#datetimepicker1').val()).valueOf() >=
            new Date('2020/01/01 ' + $('#datetimepicker2').val()).valueOf() ){
            params.data.param.wtAcross = 2;
        }
        if($('input[type="checkbox"][name="wtStartMin"]').prop("checked")){
            if(isNaN(parseInt($('#wtStartMin').val()))){
                layer.msg("请设置上班前多少分钟可以打卡，或输入正确的打卡时间", {icon: 2});
                return false;
            }
            if($('#wtStartMin').val() < 0){
                layer.msg("打卡时间不能为负数！", {icon: 2});
                return false;
            }
            params.data.param['wtStartMin'] = $('#wtStartMin').val();
        }
        if($('input[type="checkbox"][name="wtEndMin"]').prop("checked")){
            if(isNaN(parseInt($('#wtEndMin').val()))){
                layer.msg("请设置下班后多少分钟不可以打卡，或输入正确的打卡时间", {icon: 2});
                return false;
            }
            if($('#wtEndMin').val() < 0){
                layer.msg("打卡时间不能为负数！", {icon: 2});
                return false;
            }
            params.data.param['wtEndMin'] = $('#wtEndMin').val();
        }
        if( params.data.param.wtAcross === 2
            && (!params.data.param['wtEndMin'] || !params.data.param['wtStartMin'])){
            layer.msg("跨天办公时间必须设置最早打卡时间和最晚打卡时间！", {icon: 2});
            return false;
        }
        if(!checkDateLegal(params.data.param.wtAcross)){
            layer.msg("与下班时间冲突，无法设置", {icon: 2});
            return false;
        }
        if(params.data.param.wtType === "2"){
            params.data.param.week = {};
            $('input[type="checkbox"][name="weekday"]').each(function(){
                params.data.param.week[$(this).val()] = $(this).prop('checked') ? 0 : 1
            });
        }

        $.ajax({
            url: api + "/data/getData",   //请求的url地址
            dataType: "html",   //返回格式为json
            async: false,//请求是否异步，默认为异步，这也是ajax重要特性
            data: encrypt(JSON.stringify(params), getPass()),    //参数值
            type: "POST",   //请求方式
            contentType: 'application/json;charset=UTF-8',
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", login.tokenId);
                request.setRequestHeader("userTel", login.userTel);
            },
            success: function (req) {
                req = JSON.parse(decrypt(req, getPass()));
                if (req.status === 0) {
                    //请求成功时处理
                    sweetAlert({
                        title: "信息",
                        text: "添加成功！",
                        type: "success",
                        confirmButtonColor: "#3197FA",
                        confirmButtonText: "确定"
                    });
                    $('#addTime_modal').modal('hide');
                    timeSystem();
                } else {
                    sweetAlert({
                        title: "信息",
                        text: req.message,
                        type: 'warning',
                        confirmButtonColor: "#3197FA",
                        confirmButtonText: "确定"
                    });
                }
            }
        });
    })

})
// 新增考勤地点
 .delegate('#addPlace','click',function () {
     $('#addPlace_modal').modal('show');
     $('#addPLaceModal').html('新增考勤地点');
     $("#addPlaceTmpl").tmpl({}).appendTo($('#placeForm').empty());
     initMap();
     onChangeWaCompany();
     $('#waType').selectpicker("destroy").selectpicker('refresh').selectpicker('render');
     $('#waType').selectpicker({ width: '100%',noneSelectedText:'请选择...'  });

     // 点击确定新增考勤地点
     $("#placeSubmit").unbind().bind('click', function () {
            var flag = FormValidate.validate($('#placeForm')[0],validateConfig_place);
             if(!flag) {
                    return;
             }
            var params={
                "id": new Date().getTime(),
                "client": {},
                "data": {
                    "module": "main-api",
                    "url": "/api/address/add",
                    "param":{
                        "orgId": orgId,
                        "waType":$('#waType').val(),
                        "waName":$('#placeName').val(),
                        "waCompany":$('#waCompany').val(),
                        "waAddress":$('#address1').val(),
                        "waCoordinateY":$('#lnglat').val().match(/(\S*),/)[1],
                        "waCoordinateX":$('#lnglat').val().match(/,(\S*)/)[1],
                        "waRadius":$('#across').val(),
                        "createBy":userId
                    }

                }
            };
            $.ajax({
                url:api+"/data/getData",   //请求的url地址
                dataType:"html",   //返回格式为json
                async:false,//请求是否异步，默认为异步，这也是ajax重要特性
                data:encrypt(JSON.stringify(params),getPass()),    //参数值
                type:"POST",   //请求方式
                contentType: 'application/json;charset=UTF-8',
                beforeSend:function(request){
                    request.setRequestHeader("Authorization", login.tokenId);
                    request.setRequestHeader("userTel", login.userTel);
                },
                success:function(req){
                    req = JSON.parse(decrypt(req,getPass()));
                    if(req.status===0){
                        //请求成功时处理
                        sweetAlert({
                            title: "信息",
                            text: "添加成功！",
                            type: "success",
                            confirmButtonColor: "#3197FA",
                            confirmButtonText: "确定",
                        });
                        $('#addPlace_modal').modal('hide');
                        placeSystem();
                    }else{
                        sweetAlert({
                            title: "信息",
                            text: req.message,
                            type:'warning',
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
 // 新增考勤规则
 .delegate('#addRule','click',function () {
        $('#addRule_modal').modal('show');
        $('#addRuleTmpl').tmpl({}).appendTo($('#addRuleForm').empty());
        $('#addRuleTitle').html('新增考勤规则');
        exportDepSelected = [];
        setSetting();
        $("#ruleSubmit").attr('data-type',1);
        $("#ruleName").val("");
        $("#ruleName").attr("data-id","");
        $("#selectPlace").val("");
        $("#selectPlace").attr("data-id","");
        $("#selectPlace").css("display","none");
        $("#workTime").val("");
        $("#lateTime").val("");
        $("#selectsPeople1").bootstrapTable('destroy');
        $("#selectsPeople").css("display","none");
        //初始考勤时间
        initTime_list('请选择...')

        // 点击确定新增考勤规则
        $("#ruleSubmit").unbind().bind('click', function () {
            var flag = FormValidate.validate($('#addRuleForm')[0],validateConfig_rule);
            if(!$('#selectPlace').attr("data-id")){
                  $('#ruleShezhi').closest('div.form-group').addClass('has-error');
                  $('#ruleShezhi').closest('div.form-group').find('span.error').removeClass('fn-hide');
                  flag = false;
            }else{
                  $('#ruleShezhi').closest('div.form-group').removeClass('has-error');
                  $('#ruleShezhi').closest('div.form-group').find('span.error').addClass('fn-hide');
                  flag = flag;
            }
            if($('#selectsPeople1').html().replace(/\s+/g,"").length == 0){
                  $('#ruleShezhi1').closest('div.form-group').addClass('has-error');
                  $('#ruleShezhi1').closest('div.form-group').find('span.error').removeClass('fn-hide');
                  flag = false;
            }else{
                  $('#ruleShezhi1').closest('div.form-group').removeClass('has-error');
                  $('#ruleShezhi1').closest('div.form-group').find('span.error').addClass('fn-hide');
                  flag = flag;
            }

            if(!flag) {
                    return;
            }

            var depList=[];
            var data=$("#selectsPeople1").bootstrapTable('getData');
            if(data.length==0){
                sweetAlert({
                    title: "信息",
                    text: "请选择一个部门!",
                    type:'warning',
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定",
                });
                return
            }else {
                for(var i=0;i<data.length;i++){
                    depList.push(data[i].depId);
                }
                var params={
                    "id": new Date().getTime(),
                    "client": {},
                    "data": {
                        "module": "main-api",
                        "url": "/api/rule/add",
                        "param":{
                            "orgId": orgId,
                            "wrName":$("#ruleName").val(),//考勤规则名称
                            "wtId":$("#datetimepicker5").val(),//考勤时间ID
                            "wrTime":parseInt($("#workTime").val()),//弹性上下班时间
                            "wrLateTime":parseInt($("#lateTime").val()),//迟到时限
                            "createBy":userId,
                            "addrList":$("#selectPlace").attr("data-id").split(','),//地址列表
                            // "waId":$("#selectPlace").attr("data-id"),//考勤地点ID
                            "depList":depList//部门列表
                        }

                    }
                };


                if(!checkRuleTimeRange($("#datetimepicker5").val(),$("#workTime").val())){
                    return false;
                }
                $.ajax({
                    url:api+"/data/getData",   //请求的url地址
                    dataType:"html",   //返回格式为json
                    async:false,//请求是否异步，默认为异步，这也是ajax重要特性
                    data:encrypt(JSON.stringify(params),getPass()),    //参数值
                    type:"POST",   //请求方式
                    contentType: 'application/json;charset=UTF-8',
                    beforeSend:function(request){
                        request.setRequestHeader("Authorization", login.tokenId);
                        request.setRequestHeader("userTel", login.userTel);
                    },
                    success:function(req){
                        req = JSON.parse(decrypt(req,getPass()));
                        if(req.status===0){
                            //请求成功时处理
                            sweetAlert({
                                title: "信息",
                                text: "添加成功！",
                                type: "success",
                                confirmButtonColor: "#3197FA",
                                confirmButtonText: "确定",
                            },function () {
                                  ruleSystem();
                                $('#addRule_modal').modal('hide');
                                // initTable();
                            });

                        }else{
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

        })
})
    //点击编辑获取考勤规则
    // 修改考勤时间
    .delegate('#edittimeSubmit', 'click', function () {
        var flag = FormValidate.validate($('#addTime_form2')[0], validateConfig_attendance);
        if (!flag) return;
        var params = {
            "id": new Date().getTime(),
            "client": {},
            "data": {
                "module": "main-api",
                "url": "/api/time/update",
                "param": {
                    "orgId": orgId,
                    "wtType": $('input[type="radio"][name="workDateType"]:checked').val(),
                    "wtId": $('#edittimeSubmit').attr('data-value'),
                    "wtName": $('#ID').val(),
                    "wtStart": $('#datetimepicker1').val(),
                    "wtEnd": $('#datetimepicker2').val(),
                    "wtStartMin":"",
                    "wtEndMin":"",
                    "wtAcross": 1,
                    "updateBy": userId
                }
            }
        };
        if(new Date('2020/01/01 ' + $('#datetimepicker1').val()).valueOf() >=
            new Date('2020/01/01 ' + $('#datetimepicker2').val()).valueOf() ){
            params.data.param.wtAcross = 2;
        }
        if($('input[type="checkbox"][name="wtStartMin"]').prop("checked")){
            if(isNaN(parseInt($('#wtStartMin').val()))){
                layer.msg("请设置上班前多少分钟可以打卡，或输入正确的打卡时间", {icon: 2});
                return false;
            }
            if($('#wtStartMin').val() < 0){
                layer.msg("打卡时间不能为负数！", {icon: 2});
                return false;
            }
            params.data.param['wtStartMin'] = $('#wtStartMin').val();
        }
        if($('input[type="checkbox"][name="wtEndMin"]').prop("checked")){
            if(isNaN(parseInt($('#wtEndMin').val()))){
                layer.msg("请设置下班后多少分钟后不可以打卡,或输入正确的打卡时间", {icon: 2});
                return false;
            }
            if($('#wtEndMin').val() < 0){
                layer.msg("打卡时间不能为负数！", {icon: 2});
                return false;
            }
            params.data.param['wtEndMin'] = $('#wtEndMin').val();
        }
        if( params.data.param.wtAcross === 2
            && (!params.data.param['wtEndMin'] || !params.data.param['wtStartMin'])){
            layer.msg("跨天办公时间必须设置最早打卡时间和最晚打卡时间！", {icon: 2});
            return false;
        }
        if(!checkDateLegal(params.data.param.wtAcross)){
            layer.msg("与下班时间冲突，无法设置", {icon: 2});
            return false;
        }
        if(params.data.param.wtType === "2"){
            params.data.param.week = {};
            $('input[type="checkbox"][name="weekday"]').each(function(){
                params.data.param.week[$(this).val()] = $(this).prop('checked') ? 0 : 1
            });
        }
        $.ajax({
            url: api + "/data/getData",   //请求的url地址
            dataType: "html",   //返回格式为json
            async: false,//请求是否异步，默认为异步，这也是ajax重要特性
            data: encrypt(JSON.stringify(params), getPass()),    //参数值
            type: "POST",   //请求方式
            contentType: 'application/json;charset=UTF-8',
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", login.tokenId);
                request.setRequestHeader("userTel", login.userTel);
            },
            success: function (req) {
                req = JSON.parse(decrypt(req, getPass()));
                if (req.status === 0) {
                    //请求成功时处理
                    sweetAlert({
                        title: "信息",
                        text: "修改成功！",
                        type: "success",
                        confirmButtonColor: "#3197FA",
                        confirmButtonText: "确定"
                    }, function () {
                        $('#editTime_modal').modal('hide');
                        timeSystem();
                        // initTable();
                    });
                } else {
                    sweetAlert({
                        title: "信息",
                        text: req.message,
                        type: 'warning',
                        confirmButtonColor: "#3197FA",
                        confirmButtonText: "确定"
                    });
                }
            }
        });
    });




  // 考勤时间列表
function timeSystem(){
   var params={
       "id": new Date().getTime(),
       "client": {},
       "data": {
           "module": "main-api",
           "url": "/api/time/list",
           "param":{
               "orgId":orgId,
               "userId":userId
           }
       }
   };
   $.ajax({
       url:api+"/data/getData",    //请求的url地址
       dataType: "html",   //返回格式为json
       async: true,//请求是否异步，默认为异步，这也是ajax重要特性
       data: encrypt(JSON.stringify(params),getPass()),
       type: "POST",   //请求方式
       contentType: 'application/json;charset=UTF-8',
       beforeSend: function (request) {
           //请求前的处理
           request.setRequestHeader("Authorization", login.tokenId);
           request.setRequestHeader("userTel", login.userTel);
       },
       success: function (res) {
           res = JSON.parse(decrypt(res,getPass()));
           $('#timeNoneDataHint').remove();
           if(res.status === 0){
               if(res.data && res.data.data){
                   var data=res.data.data.reverse();
                   $('#time-template').tmpl(data).appendTo($('#time').empty());
                   $('#addTimeTeml').tmpl({}).appendTo($('#time'));
               }
           }else{
               $('#time').append(
                   '<div id="timeNoneDataHint" style="padding: 50px;text-align: center">'+ res.message +'</div>'
               )
           }

           setTimeSystemBtnEvent();
       }
   });
}

function setTimeSystemBtnEvent() {
    // 编辑
    $('.edit').each(function (i, val) {
        var $this = $(val);
        $this.unbind().bind('click', function () {
            $('#attendanceForm').empty();
            $('#editTime_modal').modal('show');
            $("#addAttendancel").tmpl({}).appendTo($('#attendanceForm2').empty());
            bindDate();
            var wtId = $this.attr("data-value")
            var params = {
                "id": new Date().getTime(),
                "client": {},
                "data": {
                    "module": "main-api",
                    "url": "/api/time/findById",
                    "param": {
                        "orgId": orgId,
                        "wtId": wtId
                    }

                }
            };
            $.ajax({
                url: api + "/data/getData",   //请求的url地址
                dataType: "html",   //返回格式为json
                async: false,//请求是否异步，默认为异步，这也是ajax重要特性
                data: encrypt(JSON.stringify(params), getPass()),    //参数值
                type: "POST",   //请求方式
                contentType: 'application/json;charset=UTF-8',
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", login.tokenId);
                    request.setRequestHeader("userTel", login.userTel);
                },
                success: function (req) {
                    req = JSON.parse(decrypt(req, getPass()));
                    $('#ID').val(req.data.data.wtName);
                    $('#datetimepicker1').val(req.data.data.wtStart);
                    $('#datetimepicker2').val(req.data.data.wtEnd);
                    $('#wtAcrossSign')[req.data.data.wtAcross == 1 ? 'hide' : 'show']();
                    $('#edittimeSubmit').attr('data-value', req.data.data.wtId);

                    if (!isNaN(parseInt(req.data.data.wtStartMin))) {
                        $('input[type="checkbox"][name="wtStartMin"]').prop("checked", true);
                        $('#wtStartMin').val(req.data.data.wtStartMin);
                        $('#wtStartMin').prop('readonly',false);
                    }
                    if (!isNaN(parseInt(req.data.data.wtEndMin))) {
                        $('input[type="checkbox"][name="wtEndMin"]').prop("checked", true);
                        $('#wtEndMin').val(req.data.data.wtEndMin);
                        $('#wtEndMin').prop('readonly',false);
                    }
                    $('input[type="radio"][name="workDateType"][value="' + req.data.data.wtType + '"]').prop('checked', true);
                    if (req.data.data.wtType == 2) {
                        $('input[type="checkbox"][name="weekday"]').prop('disabled',false);
                        $.each(req.data.data.week, function (key, val) {
                            $('input[type="checkbox"][name="weekday"][value="' + key + '"]').prop('checked', val == 0);
                        })
                    }
                }
            });
        });
    });

    // 删除
    $('.remove').each(function (i, val) {
        var $this = $(val);
        $this.unbind().bind('click', function () {
            var _$this = $(this);
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
                        "url": "/api/time/delete",
                        "param": {
                            "orgId": orgId,
                            "wtId": _$this.attr("data-value")
                        }

                    }
                };
                $.ajax({
                    url: api + "/data/getData",   //请求的url地址
                    dataType: "html",   //返回格式为json
                    async: false,//请求是否异步，默认为异步，这也是ajax重要特性
                    data: encrypt(JSON.stringify(params), getPass()),    //参数值
                    type: "POST",   //请求方式
                    contentType: 'application/json;charset=UTF-8',
                    beforeSend: function (request) {
                        request.setRequestHeader("Authorization", login.tokenId);
                        request.setRequestHeader("userTel", login.userTel);
                    },
                    success: function (req) {
                        req = JSON.parse(decrypt(req, getPass()));
                        if (req.status === 0) {
                            //请求成功时处理
                            sweetAlert({
                                title: "信息",
                                text: "删除成功！",
                                type: "success",
                                confirmButtonColor: "#3197FA",
                                confirmButtonText: "确定",
                            });
                            // initTable();
                            timeSystem();
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
            });
        })
    });
}
 // 考勤地点配置
 function placeSystem(){
       var params={
           "id": new Date().getTime(),
           "client": {},
           "data": {
               "module": "main-api",
               "url": "/api/address/list",
               "param":{
                   "orgId":orgId,
                   "userId":userId
               }
           }
       }
       $.ajax({
           url:api+"/data/getData",    //请求的url地址
           dataType: "html",   //返回格式为json
           async: true,//请求是否异步，默认为异步，这也是ajax重要特性
           data: encrypt(JSON.stringify(params),getPass()),
           type: "POST",   //请求方式
           contentType: 'application/json;charset=UTF-8',
           beforeSend: function (request) {
               //请求前的处理
               request.setRequestHeader("Authorization", login.tokenId);
               request.setRequestHeader("userTel", login.userTel);
           },
           success: function (res) {
               res = JSON.parse(decrypt(res,getPass()));
               $('#addressNoneDataHint').remove();
               if (res.status === 0) {
                   if (res.data && res.data.data) {
                       var data = res.data.data.reverse();
                       $('#address-template').tmpl(data).appendTo($('#address').empty());
                       $('#addPlaceTeml').tmpl({}).appendTo($('#address'));
                   }
               } else {
                   $('#address').append(
                       '<div id="addressNoneDataHint" style="padding: 50px;text-align: center">' + res.message + '</div>'
                   )
               }

               $('.removePlace').each(function(i,val){
                   var _$this = $(val);
                   _$this.unbind().bind('click',function(){
                       var  $this = $(this);
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
                           var params={
                               "id": new Date().getTime(),
                               "client": {},
                               "data": {
                                   "module": "main-api",
                                   "url": "/api/address/delete",
                                   "param":{
                                       "orgId": orgId,
                                       "waId":$this.attr("data-send")
                                   }

                               }
                           };
                           $.ajax({
                               url:api+"/data/getData",   //请求的url地址
                               dataType:"html",   //返回格式为json
                               async:false,//请求是否异步，默认为异步，这也是ajax重要特性
                               data:encrypt(JSON.stringify(params),getPass()),    //参数值
                               type:"POST",   //请求方式
                               contentType: 'application/json;charset=UTF-8',
                               beforeSend:function(request){
                                   request.setRequestHeader("Authorization", login.tokenId);
                                   request.setRequestHeader("userTel", login.userTel);
                               },
                               success:function(req){
                                   req = JSON.parse(decrypt(req,getPass()));
                                   if(req.status===0){
                                       //请求成功时处理
                                       sweetAlert({
                                           title: "信息",
                                           text: "删除成功！",
                                           type: "success",
                                           confirmButtonColor: "#3197FA",
                                           confirmButtonText: "确定",
                                       });
                                       placeSystem();
                                   }else{
                                       sweetAlert({
                                           title: "信息",
                                           text: req.message,
                                           type:'warning',
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
                       });
                   })
               });

               $('.editPlace').each(function(i,val){
                    var _$this = $(val);
                    _$this.unbind().bind('click',function(){
                        var  $this = $(this);
                       $('#addPlace_modal').modal('show');
                       $('#addPLaceModal').html('编辑考勤地点');
                        $("#addPlaceTmpl").tmpl({}).appendTo($('#placeForm').empty());
                         initMap();
                         $('#waType').selectpicker("destroy").selectpicker('refresh').selectpicker('render');
                         $('#waType').selectpicker({ width: '100%',noneSelectedText:'请选择...'  });

                       var waId=$this.attr("data-send")
                       var params={
                           "id": new Date().getTime(),
                           "client": {},
                           "data": {
                               "module": "main-api",
                               "url": "/api/address/findById",
                               "param":{
                                   "orgId": orgId,
                                   "waId":waId
                               }

                           }
                       };
                       $.ajax({
                           url:api+"/data/getData",   //请求的url地址
                           dataType:"html",   //返回格式为json
                           async:false,//请求是否异步，默认为异步，这也是ajax重要特性
                           data:encrypt(JSON.stringify(params),getPass()),    //参数值
                           type:"POST",   //请求方式
                           contentType: 'application/json;charset=UTF-8',
                           beforeSend:function(request){
                               request.setRequestHeader("Authorization", login.tokenId);
                               request.setRequestHeader("userTel", login.userTel);
                           },
                           success:function(req){
                               req = JSON.parse(decrypt(req,getPass()));
                               $('#placeName').val(req.data.data.waName);
                               $('#address1').val(req.data.data.waAddress);
                               $('#lnglat').val(req.data.data.waCoordinateY+','+req.data.data.waCoordinateX);
                               $('#across').val(req.data.data.waRadius);
                               $('#waType').selectpicker('val',req.data.data.waType);
                               var callback = function(){
                                 $('#waCompany').selectpicker('val',req.data.data.waCompany);
                               }
                               onChangeWaCompany(callback);

                               $('#placeSubmit').attr('data-value',req.data.data.waId)
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

                $("#placeSubmit").unbind().bind('click', function () {
                    var flag = FormValidate.validate($('#placeForm')[0],validateConfig_place);
                     if(!flag) {
                            return;
                     }
                   var params={
                       "id": new Date().getTime(),
                       "client": {},
                       "data": {
                           "module": "main-api",
                           "url": "/api/address/update",
                           "param":{
                               "orgId": orgId,
                               "waId":  $('#placeSubmit').attr('data-value'),
                               "waType":$('#waType').val(),
                               "waName":$('#placeName').val(),
                               "waCompany":$('#waCompany').val(),
                               "waAddress":$('#address1').val(),
                               "waCoordinateY":$('#lnglat').val().match(/(\S*),/)[1],
                               "waCoordinateX":$('#lnglat').val().match(/,(\S*)/)[1],
                               "waRadius":$('#across').val(),
                               "updateBy":userId
                           }

                       }
                   };
                   $.ajax({
                       url:api+"/data/getData",   //请求的url地址
                       dataType:"html",   //返回格式为json
                       async:false,//请求是否异步，默认为异步，这也是ajax重要特性
                       data:encrypt(JSON.stringify(params),getPass()),    //参数值
                       type:"POST",   //请求方式
                       contentType: 'application/json;charset=UTF-8',
                       beforeSend:function(request){
                           request.setRequestHeader("Authorization", login.tokenId);
                           request.setRequestHeader("userTel", login.userTel);
                       },
                       success:function(req){
                           req = JSON.parse(decrypt(req,getPass()));
                           if(req.status===0){
                               //请求成功时处理
                               sweetAlert({
                                   title: "信息",
                                   text: "修改成功！",
                                   type: "success",
                                   confirmButtonColor: "#3197FA",
                                   confirmButtonText: "确定",
                               });
                              $('#addPlace_modal').modal('hide');
                               placeSystem();
                           }else{
                               sweetAlert({
                                   title: "信息",
                                   text: req.message,
                                   type:'warning',
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
           },
           complete: function () {
               //请求完成的处理
           },
           error: function () {
               //请求出错处理
           }
       });

   }
  //规则设置
 function ruleSystem(){
        var params={
            "id": new Date().getTime(),
            "client": {},
            "data": {
                "module": "main-api",
                "url": "/api/rule/list",
                "param":{
                    "orgId":orgId,
                    "userId":userId
                }
            }
        }
        $.ajax({
            url:api+"/data/getData",  //请求的url地址
            dataType: "html",   //返回格式为json
            async: true,//请求是否异步，默认为异步，这也是ajax重要特性
            data: encrypt(JSON.stringify(params),getPass()),
            type: "POST",   //请求方式
            contentType: 'application/json;charset=UTF-8',
            beforeSend: function (request) {
                //请求前的处理
                request.setRequestHeader("Authorization", login.tokenId);
                request.setRequestHeader("userTel", login.userTel);
            },
            success: function (res) {
                res = JSON.parse(decrypt(res,getPass()));
                $('#ruleNoneDataHint').remove();
                if(res.status === 0){
                    if(res.data && res.data.data){
                        var data=res.data.data.reverse();
                        $('#rule-template').tmpl(data).appendTo($('#rule').empty());
                        $('#addRuleTeml').tmpl({}).appendTo($('#rule'));
                    }
                }else{
                    $('#rule').append(
                        '<div id="ruleNoneDataHint" style="padding: 50px;text-align: center">'+ res.message +'</div>'
                    )
                }

                $('.removeRule').each(function(i,val){
                    var _$this = $(val);
                    _$this.unbind().bind('click',function(){
                        var $this = $(this);
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
                            var params={
                                "id": new Date().getTime(),
                                "client": {},
                                "data": {
                                    "module": "main-api",
                                    "url": "/api/rule/delete",
                                    "param":{
                                        "orgId": orgId,
                                        "wrId":$this.attr("data-send")
                                    }

                                }
                            };
                            $.ajax({
                                url:api+"/data/getData",   //请求的url地址
                                dataType:"html",   //返回格式为json
                                async:false,//请求是否异步，默认为异步，这也是ajax重要特性
                                data:encrypt(JSON.stringify(params),getPass()),    //参数值
                                type:"POST",   //请求方式
                                contentType: 'application/json;charset=UTF-8',
                                beforeSend:function(request){
                                    request.setRequestHeader("Authorization", login.tokenId);
                                    request.setRequestHeader("userTel", login.userTel);
                                },
                                success:function(req){
                                    req = JSON.parse(decrypt(req,getPass()));
                                    if(req.status===0){
                                        //请求成功时处理
                                        ruleSystem();
                                        sweetAlert({
                                            title: "信息",
                                            text: "删除成功！",
                                            type: "success",
                                            confirmButtonColor: "#3197FA",
                                            confirmButtonText: "确定",
                                        });
                                        // initTable();
                                    }else{
                                        sweetAlert({
                                            title: "信息",
                                            text: req.message,
                                            type:'warning',
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
                        });
                    })
                });

                $('.editRule').each(function(i,val){
                    var _$this = $(val);
                    _$this.unbind().bind('click',function(){
                        var  $this = $(this);
                           $('#addRule_modal').modal('show');
                           $('#addRuleTmpl').tmpl({}).appendTo($('#addRuleForm').empty());
                           $('#addRuleTitle').html('编辑考勤规则');
                           exportDepSelected = [];


                            $("#ruleSubmit").attr('data-type',2);
                            var wrId=$this.attr("data-send")
                            var params={
                                "id": new Date().getTime(),
                                "client": {},
                                "data": {
                                    "module": "main-api",
                                    "url": "/api/rule/findById",
                                    "param":{
                                        "orgId": orgId,
                                        "wrId":wrId,
                                        "userId":userId
                                    }

                                }
                            };
                            $.ajax({
                                url:api+"/data/getData",   //请求的url地址
                                dataType:"html",   //返回格式为json
                                async:false,//请求是否异步，默认为异步，这也是ajax重要特性
                                data:encrypt(JSON.stringify(params),getPass()),    //参数值
                                type:"POST",   //请求方式
                                contentType: 'application/json;charset=UTF-8',
                                beforeSend:function(request){
                                    request.setRequestHeader("Authorization", login.tokenId);
                                    request.setRequestHeader("userTel", login.userTel);
                                },
                                success:function(req){
                                    req = JSON.parse(decrypt(req,getPass()));
                                    var data=req.data.data;

                                    var addrList_name=[],addrList_id=[],addrList=data.addrList;
                                    if(addrList.length==0){

                                    }else {
                                        exportDepSelected = [].concat(data.depList);
                                        for(var i=0;i<addrList.length;i++){
                                            addrList_id.push(addrList[i].waId);
                                            addrList_name.push(addrList[i].waAddress);
                                        }
                                        $("#selectPlace").show().html(addrList_name.join(","));
                                        $("#selectPlace").attr('data-id',addrList_id.join(","));
                                    }

                                    $('#ruleName').val(data.wrName);
                                    $("#ruleName").attr('data-id',data.wrId);

                                    initTime_list(data.wtId);


                                    $('#workTime').val(data.wrTime);
                                    $("#lateTime").val(data.wrLateTime);
                                    // $("#selectsPeople").show();
                                    $("#selectsPeople").css("display",'block');
                                    //初始化selectsPeople
                                    $("#selectsPeople1").bootstrapTable('destroy').bootstrapTable({
                                        pagination: false,
                                        locale: "zh-CN",
                                        classes: 'table table-no-bordered  table-hover-row',
                                        // singleSelect:true,
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
                                        data:data.depList,
                                        columns:[
                                            {field: "depName", title: "部门名称", align: "left", valign: "middle"},
                                            {field: "depId", title: "ID", align: "left", valign: "middle",visible:false},
                                        ],
                                        onClickCell: function(field, value, row, $element) {
                                        }
                                    });
                                    $('#ruleSubmit').attr('data-value',req.data.data.waId)

                                     _depList = data.depList;
                                     setSetting();
                                },
                                complete:function(){
                                    //请求完成的处理
                                },
                                error:function(){
                                    //请求出错处理
                                }
                            });
                            // 点击确定新增考勤规则
                            $("#ruleSubmit").unbind().bind('click', function () {
                                var flag = FormValidate.validate($('#addRuleForm')[0],validateConfig_rule);
                                if(!$('#selectPlace').attr("data-id")){
                                        $('#ruleShezhi').closest('div.form-group').addClass('has-error');
                                        $('#ruleShezhi').closest('div.form-group').find('span.error').removeClass('fn-hide');
                                        flag = false;
                                }else{
                                      $('#ruleShezhi').closest('div.form-group').removeClass('has-error');
                                      $('#ruleShezhi').closest('div.form-group').find('span.error').addClass('fn-hide');
                                      flag = flag;
                                }
                                if($('#selectsPeople1').html().replace(/\s+/g,"").length == 0){
                                        $('#ruleShezhi1').closest('div.form-group').addClass('has-error');
                                        $('#ruleShezhi1').closest('div.form-group').find('span.error').removeClass('fn-hide');
                                        flag = false;
                                }else{
                                      $('#ruleShezhi1').closest('div.form-group').removeClass('has-error');
                                      $('#ruleShezhi1').closest('div.form-group').find('span.error').addClass('fn-hide');
                                      flag = flag;
                                }
                                 if(!flag) {
                                        return;
                                 }

                                var depList=[];
                                var data=$("#selectsPeople1").bootstrapTable('getData');
                                if(data.length==0){
                                sweetAlert({
                                    title: "信息",
                                    text: "请选择一个部门!",
                                    type:'warning',
                                    confirmButtonColor: "#3197FA",
                                    confirmButtonText: "确定",
                                });
                                return
                            }else {
                                for(var i=0;i<data.length;i++){
                                    depList.push(data[i].depId);
                                }
                                var params={
                                    "id": new Date().getTime(),
                                    "client": {},
                                    "data": {
                                        "module": "main-api",
                                        "url": "/api/rule/update",
                                        "param":{
                                            "orgId": orgId,
                                            "wrId":wrId,
                                            "wrName":$("#ruleName").val(),//考勤规则名称
                                            "wtId":$("#datetimepicker5").val(),//考勤时间ID
                                            "wrTime":parseInt($("#workTime").val()),//弹性上下班时间
                                            "wrLateTime":parseInt($("#lateTime").val()),//迟到时限
                                            "createBy":userId,
                                            "updateBy":userId,
                                            "addrList":$("#selectPlace").attr("data-id").split(','),//地址列表
                                            // "waId":$("#selectPlace").attr("data-id"),//考勤地点ID
                                            "depList":depList//部门列表

                                        }

                                    }
                                };

                                if(!checkRuleTimeRange($("#datetimepicker5").val(),$("#workTime").val())){
                                    return false;
                                }
                                $.ajax({
                                    url:api+"/data/getData",   //请求的url地址
                                    dataType:"html",   //返回格式为json
                                    async:false,//请求是否异步，默认为异步，这也是ajax重要特性
                                    data:encrypt(JSON.stringify(params),getPass()),    //参数值
                                    type:"POST",   //请求方式
                                    contentType: 'application/json;charset=UTF-8',
                                    beforeSend:function(request){
                                        request.setRequestHeader("Authorization", login.tokenId);
                                        request.setRequestHeader("userTel", login.userTel);
                                    },
                                    success:function(req){
                                        req = JSON.parse(decrypt(req,getPass()));
                                        if(req.status===0){
                                            //请求成功时处理
                                            sweetAlert({
                                                title: "信息",
                                                text: "修改成功！",
                                                type: "success",
                                                confirmButtonColor: "#3197FA",
                                                confirmButtonText: "确定",
                                            },function () {
                                                // initTable();
                                                ruleSystem();
                                                $('#addRule_modal').modal('hide');
                                                _depList = null;
                                            });

                                        }else{
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

                        })
                    })
                });
            },
            complete: function () {
                //请求完成的处理
            },
            error: function () {
                //请求出错处理
            }
        });
    }

  $('input[name="optionsRadios"]').change(function () {
    if ($('input[name="optionsRadios"][value="option"]').prop("checked")) {
        $('#shezhi').hide();
    } else if ($('input[name="optionsRadios"][value="option1"]').prop("checked")) {
        $('#shezhi').show();

    }
});


/**
 * 检查考勤规则的日期合法性
 * @param ruleTimeId   考勤时间id
 * @param workTime     弹性工作时间
 */
function checkRuleTimeRange(ruleTimeId,workTime){
    var ruleTimeObj = ruleTimeMap[ruleTimeId];
    if($("#workTime").val() - getTimeInterval(ruleTimeObj) > 0){
        layer.msg("弹性上下班时间不能大于上下班时间间隔！", {icon: 2});
        return false;
    }
    if((parseInt(ruleTimeObj.wtEndMin) || 0) > 0){
        if($("#workTime").val() - ruleTimeObj.wtEndMin > 0){
            layer.msg("弹性上下班时间不能大于最晚下班时间！", {icon: 2});
            return false;
        }
    }else{
        var startDate = new Date("2020/01/01 " + ruleTimeObj.wtStart + ":00").valueOf();
        startDate -= parseInt(ruleTimeObj.wtStartMin || 0) * 1000 *60;

        var endDate = new Date(['2020/01/01 ','2020/01/02 '][ruleTimeObj.wtAcross-1] + ruleTimeObj.wtEnd).valueOf();
        endDate += workTime * 1000 *60;

        if(endDate - startDate > 1000 * 60 * 60 * 24){
            layer.msg("考勤时间跨度不能超过24小时！", {icon: 2});
            return false
        }
    }
    return true;
}

/**
 * 获取考勤时间的绝对时间间隔
 * @param ruleTime
 * @returns {number}
 */
function getTimeInterval(ruleTime){
    var startDate = new Date("2020/01/01 " + ruleTime.wtStart + ":00").valueOf();
    startDate -= parseInt(ruleTime.wtStartMin || 0) * 1000 *60;

    var endDate =  new Date("2020/01/01 " + ruleTime.wtEnd + ":00").valueOf();
    endDate += parseInt(ruleTime.wtEndMin || 0) * 1000 *60;

    return Math.abs(startDate - endDate)/60000;
}

// 设置
function setSetting(){
    // 点击规则里面的设置-选择考勤部门弹出模态框
    $("#ruleShezhi").unbind().bind('click', function () {
        var address = $('#ruleShezhi').closest('div').find('#selectPlace').text();
        $('#addDepart_modal').modal('show');
        //初始化person_table
        $("#depart").bootstrapTable('destroy').bootstrapTable({
            pagination: false,
            locale: "zh-CN",
            classes: 'table table-no-bordered  table-hover-row',
            // singleSelect:true,
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
            columns:[{
                checkbox: true,//checkbox
                align: 'center',//对其方式
                valign: 'middle'//对其方式
            },
                {field: "waAddress", title: "考勤地点", align: "left", valign: "middle"},
                {field: "waType", title: "类型", align: "left",valign: "middle"},
                {field: "waCompany", title: "所属厂商", align: "left",valign: "middle"},

            ],

            onClickCell: function(field, value, row, $element) {
            }
        });
        getDepart(address);
    })
     // 点击规则里面的设置-选择人员弹出模态框
     $('#ruleShezhi1').off('click').on('click',function(){
         $("#addPeople_modal").modal('show');
         // (function parseChecked(nodes){
         //     if(Array.isArray(exportDepSelected) && exportDepSelected.length > 0){
         //         nodes.forEach(function(item){
         //             item.state = {checked:exportDepSelected.indexOf(item.depId) !== -1};
         //             if(Array.isArray(item.nodes) && item.nodes.length > 0){
         //                 parseChecked(item.nodes)
         //             }
         //         });
         //     }
         // })(treeNode);

         $('#selectedDepTree').treeview({
             data: getTree(),
             multiSelect:true,
             selectable: true,
             showCheckbox:true,
             collapseIcon: 'glyphicon glyphicon-triangle-bottom', // 折叠图标，默认 min
             expandIcon: 'glyphicon glyphicon-triangle-right',
             showBorder: false,
             selectedColor: '#878787',
             selectedBackColor: '#bae7ff',
             onNodeChecked: function(event, node) { //选中节点

                 // if(node.show == 1){
                 //  $('#selectedDepTree').treeview("toggleNodeChecked", [node.nodeId, { silent: true }]);
                 //
                 //
                 // }else{
                 var selectNodes = getChildNodeIdArr(node); //获取所有子节点
                 var _selectNodes = getChildNode(node);
                 console.log(_selectNodes)
                 if (Array.isArray(selectNodes) && selectNodes.length > 0) { //子节点不为空，则选中所有子节点
                     var checkedNode = [];
                     for(var i =0;i< _selectNodes.length;i++){
                        if(!_selectNodes[i].state.disabled){
                          checkedNode.push(_selectNodes[i].nodeId)
                        }
                     }
                     console.log(selectNodes);

                     $('#selectedDepTree').treeview('checkNode', [checkedNode, { silent: true }]);
                     // $('#selectedDepTree').treeview('checkNode', [selectNodes, { silent: true }]);
                 }
                 setParentNodeCheck(node);
                 // }

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

         $('#peopleSubmit').off('click').on('click',function(){
             var selected = $('#selectedDepTree').treeview('getChecked');
             exportDepSelected = [];
             if(Array.isArray(selected) && selected.length > 0){
                 // exportDepSelected = selected.map(function(item){
                 //     return item.depId;
                 // });
                 for(var i=0;i<selected.length;i++){
                     var obj={};
                     obj.depId=selected[i].depId;
                     obj.depName=selected[i].depName;
                     exportDepSelected.push(obj);
                 }
             }

             var obj = {};
                exportDepSelected = exportDepSelected.reduce(function(item, next) {
                obj[next.depId] ? '' : obj[next.depId] = true && item.push(next);
                 return item;
             }, []);

             $("#addPeople_modal").modal('hide');
             $('#selectsPeople').css('display','block');
             //初始化selectsPeople
             $("#selectsPeople1").bootstrapTable('destroy').bootstrapTable({
                 pagination: false,
                 locale: "zh-CN",
                 classes: 'table table-no-bordered  table-hover-row',
                 // singleSelect:true,
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
                 data:exportDepSelected,
                 columns:[
                   {field: "depName", title: "部门名称", align: "left", valign: "middle"},
                   {field: "depId", title: "ID", align: "left", valign: "middle",visible:false},
                 ],

                 onClickCell: function(field, value, row, $element) {
                 }
             });
         });
     });
}
// 获取考勤部门内容
function getDepart(address){
    var params={
        "id": new Date().getTime(),
        "client": {},
        "data": {
            "module": "main-api",
            "url": "/api/address/list",
            "param":{
                "orgId":orgId,
                "userId":userId
            }
        }
    }
    $.ajax({
        url:api+"/data/getData",    //请求的url地址
        dataType: "html",   //返回格式为json
        async: true,//请求是否异步，默认为异步，这也是ajax重要特性
        data: encrypt(JSON.stringify(params),getPass()),
        type: "POST",   //请求方式
        contentType: 'application/json;charset=UTF-8',
        beforeSend: function (request) {
            //请求前的处理
            request.setRequestHeader("Authorization", login.tokenId);
            request.setRequestHeader("userTel", login.userTel);
        },
        success: function (req) {
            req = JSON.parse(decrypt(req,getPass()));
            $("#depart").bootstrapTable('load',req.data.data);
            $('#depart').bootstrapTable('checkBy', {field: 'waAddress', values:address.split(',')});
        },
        complete: function () {
            //请求完成的处理
        },
        error: function () {
            //请求出错处理
        }
    });
}
// 点击选择考勤部门内容的确定按钮把选择的值拿到
$("#departSubmit").unbind().bind('click', function () {
    var list = [],departName =[],waId =[];
    var select = $('#depart').bootstrapTable('getSelections');
    for (var i = 0; i < select.length; i++) {
        list.push(select[i]['waAddress']);
        departName.push(select[i].waAddress);
        waId.push(select[i].waId);
    }
    if (list.length < 1) {
        sweetAlert({
            title: "信息",
            text: "请至少勾选一条有效数据",
            type:'warning',
            confirmButtonColor: "#3197FA",
            confirmButtonText: "确定",
        });
    }else{
        $('#addDepart_modal').modal('hide');
        $('#selectPlace').show().html(departName.join(","));
        $('#selectPlace').attr('data-id',waId.join(","));
    }
})

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
                "queryType":1
            }

        }
    };
    treeNode = getTreeContent(params);
    return treeNode;
}
//获取后台tree数据
function getTreeContent(params) {
  var depList=[],depList1 =[],depList2=[],depList4=[];
  var data=$("#selectsPeople1").bootstrapTable('getData');

  // 当前规则是否包含
  if(_depList && Array.isArray(data) && data.length > 0){
    for(var j=0;j<_depList.length;j++){
          depList1.push(data[j].depId);
    }
    // data = data.concat(_depList);
  }
  // 当前页面选择
  for(var i=0;i<data.length;i++){
      depList2.push(data[i].depId);
  }

  var depList3 = depList.concat(depList1);
  for(var l = 0;l< depList3.length;l++){
      //  在规则中存在，在表格中不存在
      if(depList1.indexOf(depList3[l])>-1 &&  depList2.indexOf(depList3[l]) == -1){
          depList4.push(depList3[l]);
      }
  }


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
            request.setRequestHeader("userTel", login.userTel);
            request.setRequestHeader("Authorization", login.tokenId);
        },
        success:function(req){
            req = JSON.parse(decrypt(req,getPass()));
            if(req.data && req.data.data){
                (req.data.data || []).forEach(function(tmp_obj){
                    tmp_obj.id= tmp_obj.depId;
                    tmp_obj.text= tmp_obj.depName ;
                    tmp_obj.parentId=tmp_obj.parentDepId;
                    tmp_obj.parentOid=tmp_obj.parentDepId;
                    tmp_obj.color="#878787";
                    tmp_obj.icon = 'fa fa-folder';
                    tmp_obj.state = {};
                    if(depList2.indexOf(tmp_obj.id) > -1){
                        tmp_obj.state.checked= true;
                    }else if(depList4.indexOf(tmp_obj.id) > -1){
                        tmp_obj.state.checked= false;
                        tmp_obj.state.disabled = false;
                    }else{
                        tmp_obj.state.disabled= (tmp_obj.show == 1?true:false);
                        tmp_obj.state.checked= false;
                    }

                    _tree.push(tmp_obj);
                });
            }
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

// 选中父节点时，选中所有子节点
function getChildNode(node) {
    var ts = [];
    if (Array.isArray(node.nodes) && node.nodes.length > 0) {
        node.nodes.forEach(function(n){
            ts.push(n);
            if (Array.isArray(n.nodes) && n.nodes.length > 0) {
                var temp = getChildNode(n);
                ts = ts.concat(temp);
            }
        });
    } else {
        ts.push(node);
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
        // if (checkedCount == parentNode.nodes.length) {  //如果子节点全部被选 父全选
        //     $("#selectedDepTree").treeview("checkNode", parentNode.nodeId);
        //     setParentNodeCheck(parentNode);
        // }else {   //如果子节点未全部被选 父未全选
        //     $('#selectedDepTree').treeview('uncheckNode', parentNode.nodeId);
        //     setParentNodeCheck(parentNode);
        // }
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
// 地图
function initMap(){
    //地图加载
    var map = new AMap.Map("container", {
        resizeEnable: true
    });
    //输入提示
    var autoOptions = {
        input: "tipinput"
    };
    var auto = new AMap.Autocomplete(autoOptions);
    var placeSearch = new AMap.PlaceSearch({
        map: map
    });  //构造地点查询类
    AMap.event.addListener(auto, "select", select);//注册监听，当选中某条记录时会触发
    function select(e) {
        placeSearch.setCity(e.poi.adcode);
        placeSearch.search(e.poi.name);  //关键字查询查询
    }

    //为地图注册click事件获取鼠标点击出的经纬度坐标
    map.on('click', function(e) {
        document.getElementById("lnglat").value = e.lnglat.getLng() + ',' + e.lnglat.getLat()
    });
    //地图加载
    var map = new AMap.Map("container1", {
        resizeEnable: true
    });

}

//根据办公地点类型判断厂商
function onChangeWaCompany(callback){
  var waType = $('#waType').val();
  var url = "/api/dep/findCompany";
  var param = {};
  if(waType.indexOf('公共考勤地点')>-1){
      url = "/api/dep/findCompany";
      param = {
          "orgId": orgId,
      };
  }else{
    url = "/api/setting/search";
    param = {
        "orgId": orgId,
        "enumType":4,
    };
  }
  var params={
      "id": new Date().getTime(),
      "client": {},
      "data": {
          "module": "main-api",
          "url": url,
          "param":param
      }
  };
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
          if(req.status===0){
            var html = '';
            var obj = req.data.data;
            if(typeof obj == "string"){
              html += '<option value="' + obj + '" data-tokens="' + obj + '">' + obj + '</option>';
            }else{
              for (var i = 0, len = obj.length; i < len; i++) {
                   html += '<option value="' + obj[i] + '" data-tokens="' + obj[i] + '">' + obj[i] + '</option>';
               }
            }
            $('#waCompany').empty().html(html);
            $('#waCompany').selectpicker("destroy");
            $('#waCompany').selectpicker('refresh');
            $('#waCompany').selectpicker('render');
            $('#waCompany').selectpicker({ width: '100%',noneSelectedText:'请选择...'  });
            if(typeof callback == "function"){
              callback();
            }
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
