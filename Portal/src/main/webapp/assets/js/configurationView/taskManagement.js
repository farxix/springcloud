var api = getApiUrl();
var tools = new toolUtil();
var FormValidate = new FormValidate();
var userType=$("#orgId",parent.document).attr("data-userType");
var orgId=$("#orgId",parent.document).attr("data-id");
var userId=$("#orgId",parent.document).attr("data-user");
var login = {userTel:localStorage.getItem("userTel"),tokenId:localStorage.getItem("tokenId")};
var treeNode = [];       //存放树节点信息-树形结构
var _depList = null;



var  validateConfig = {
      'taskPrototypeName': {
          required: true,
          name: '任务名称',
          validate:function(val){
              if(val.length >30){
                  return "任务名称不能超过30个字"
              }
          }
      },
      'taskPrototypeStatus': {
          required: true,
          name: '状态',
      },
      'taskTriggerPeriod':{
          required: true,
          name: '派发周期',
      },
      'taskStartDate': {
          required: true,
          name: '开始日期',
      },
      'deadFinishDays':{
          required: true,
          name: '完成期限',
          positiveInteger:true,
      }
};



$(document).ready(function () {
    init();
});

function init() {
    //任务列表
    getTaskList();
    //新增任务
    $('body').undelegate().delegate('#addTask','click',function(){
          createTask({id:'',taskPrototypeName:'',taskStartDate:'',deadFinishDays:'',
             taskHandlerConfigStyle:1,taskAuditorConfigStyle:1,handlers:'',auditors:'',
             whetherDistributePartyA:false,whetherInsteadAudit:false,taskTriggerPeriod:2
          });
          renderSelect('taskTriggerPeriod',2);

          $("#whetherTriggerRestdays").prop("checked", true);
          $("#whetherRestdaysCalculated").prop("checked", true);
          save();
    });
    //关闭按钮
    $("#goback").unbind().bind('click',function () {
        $('.form-wrap').addClass('fn-hide');
        $('.list-wrap').removeClass('fn-hide');
    })
}

function save(){
    //新增模版
    $('#save').unbind().bind('click',function(){
          var flag = FormValidate.validate($('#taskForm')[0], validateConfig);
          if($('#selectPlace').text().length == 0){
                $('#selectPlace').closest('div.form-group').addClass('has-error');
                $('#selectPlace').closest('div.form-group').find('span.error').removeClass('fn-hide');
                flag = false;
          }else{
                $('#selectPlace').closest('div.form-group').removeClass('has-error');
                $('#selectPlace').closest('div.form-group').find('span.error').addClass('fn-hide');
                flag = flag;
          }

          if($('#selectsPeople').text().length == 0){
                $('#selectsPeople').closest('div.form-group').addClass('has-error');
                $('#selectsPeople').closest('div.form-group').find('span.error').removeClass('fn-hide');
                flag = false;
          }else{
                $('#selectsPeople').closest('div.form-group').removeClass('has-error');
                $('#selectsPeople').closest('div.form-group').find('span.error').addClass('fn-hide');
                flag = flag;
          }

          if (!flag) {
              return;
          }

          var url = '/api/taskPrototype/create';
          var object = $('#selectPlace').attr('data-source')?JSON.parse($('#selectPlace').attr('data-source')):[];
          var handlers = [];
          $.each(object,function(i,val){
              handlers.push({"handlerId":val.handlerId||val.auditorId,"orgId":val.orgId})
          });

          var object2 = $('#selectsPeople').attr('data-source')?JSON.parse($('#selectsPeople').attr('data-source')):[];
          var auditors = [];
          $.each(object2,function(i,val){
              auditors.push({"auditorId":val.auditorId,"orgId":val.orgId})
          })

          // var now = new Date();
          // var hour = now.getHours();//得到小时
          // var minu = now.getMinutes();//得到分钟
          // if (hour < 10) hour = "0" + hour;
          // if (minu < 10) minu = "0" + minu;

          var param = {
                "orgId":orgId,
                "taskPrototypeName":$('#taskPrototypeName').val(),
                "taskTemplateId":$('.list-wrap').attr('data-tasktemplate'),
                "taskPrototypeStatus":$('#taskPrototypeStatus').val(),
                "taskTriggerPeriod":$('#taskTriggerPeriod').val(),
                "taskStartDate":$('#taskStartDate').val(),
                "whetherTriggerRestdays":$('#whetherTriggerRestdays').is(':checked')?"false":"true",
                "deadFinishDays":$('#deadFinishDays').val(),
                "whetherRestdaysCalculated":$('#whetherRestdaysCalculated').is(':checked')?"false":"true",
                "whetherDistributePartyA":$('#taskHandlerConfigStyle').attr('data-whetherDistributePartyA'),
                "whetherInsteadAudit":  $('#taskAuditorConfigStyle').attr('data-whetherInsteadAudit'),
                "taskHandlerConfigStyle":$('#taskHandlerConfigStyle').attr('data-taskHandlerConfigStyle'),
                "taskAuditorConfigStyle":$('#taskAuditorConfigStyle').attr('data-taskAuditorConfigStyle'),
                "taskHandlerConfigItems":handlers,
                "taskAuditorConfigItems":auditors
          }



          var id = $('#id').val();

          if(id){
              param.id = id;
              url = '/api/taskPrototype/update';
          }

         // console.log(param);
          // console.log(JSON.stringify(param));

          ajaxData('main-api',url,param,function(res){
                // console.log(res);
                if(res.status == 0){
                    //请求成功时处理
                    sweetAlert({
                        title: "信息",
                        text: "操作成功！",
                        type: "success",
                        confirmButtonColor: "#3197FA",
                        confirmButtonText: "确定"
                    },function(){
                        $('.list-wrap').removeClass('fn-hide');
                        $('.form-wrap').addClass('fn-hide');
                        getTaskList();
                    });
                }else if(res.status == 1){
                      //请求成功时处理
                      sweetAlert({
                          title: "信息",
                          text: res.message,
                          type: "error",
                          confirmButtonColor: "#3197FA",
                          confirmButtonText: "确定"
                      });
                }else{
                      //请求成功时处理
                      sweetAlert({
                          title: "信息",
                          text: "系统错误，请联系管理员！",
                          type: "error",
                          confirmButtonColor: "#3197FA",
                          confirmButtonText: "确定"
                      });
                }

          });

    })
}

//任务列表
function getTaskList(){
    ajaxData('main-api','/api/taskPrototype/list',{createBy:userId},function(res){
        $('#task-template').tmpl(res.data).appendTo($('#taskList').empty());
        $('.list_items_edit').find('.edit').unbind().bind('click',function(){
             var id = $(this).closest('div.list_items_edit').attr('id');
             taskDetail(id);
        });
        $('.del').unbind().bind('click',function(event){
             event.stopPropagation( )
             var id = $(this).closest('div.list_items_edit').attr('id');
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
                ajaxData('main-api','/api/taskPrototype/delete',{id:id},function(res){
                    if(res.status == 0){
                      //请求成功时处理
                      sweetAlert({
                          title: "信息",
                          text: "操作成功!",
                          type: "success",
                          confirmButtonColor: "#3197FA",
                          confirmButtonText: "确定"
                      },function(){
                          getTaskList();
                      });
                    }else{
                      //请求成功时处理
                      sweetAlert({
                          title: "信息",
                          text: "系统错误，请联系管理员！",
                          type: "error",
                          confirmButtonColor: "#3197FA",
                          confirmButtonText: "确定"
                      });
                    }
              })
             });
        });

    });
}

// 任务模版
function taskTemplate(){
    ajaxData('main-api','/api/taskTemplate/all',{},function(res){
         if(res.status == 0){
            $('.list-wrap').attr('data-taskTemplate',res.data.data[0].id);
         }
    });
}

// 任务详情
function taskDetail(id){
  ajaxData('main-api','/api/taskPrototype/detail',{'id':id},function(res){
        var record = res.data.data;
        console.log(record);

        var handlers = [],_taskHandlerConfigItems =[];
        $.each(record.taskHandlerConfigItems,function(i,val){
            val.handlerName && handlers.push(val.handlerName);
            _taskHandlerConfigItems.push({"handlerId":val.handlerId,"orgId":val.orgId,"handlerName":val.handlerName})
        });

        record.handlers = handlers.join(',');
        record._taskHandlerConfigItems = JSON.stringify(_taskHandlerConfigItems);

        var auditors = [],_taskAuditorConfigItems=[];
        $.each(record.taskAuditorConfigItems,function(i,val){
            val.auditorName && auditors.push(val.auditorName);
            _taskAuditorConfigItems.push({"auditorId":val.auditorId,"orgId":val.orgId,auditorName:val.auditorName});
        })
        record.auditors = auditors.length == 0?"直接主管":auditors.join(',');
        record._taskAuditorConfigItems = JSON.stringify(_taskAuditorConfigItems);


        createTask(record);
        renderSelect('taskPrototypeStatus',record.taskPrototypeStatus);
        renderSelect('taskTriggerPeriod',record.taskTriggerPeriod);

        $("#whetherTriggerRestdays").prop("checked", !record.whetherTriggerRestdays);
        $("#whetherRestdaysCalculated").prop("checked", !record.whetherRestdaysCalculated);

        $('#taskStartDate').val(record.taskStartDate);

        // console.log(!record.whetherRestdaysCalculated);

        save();
  });
}

// 创建任务
function createTask(data){
    $('.list-wrap').addClass('fn-hide');
    $('.form-wrap').removeClass('fn-hide');

    // 获取模版id
    taskTemplate();
    // 模版加载
    $('#common-template').tmpl(data).appendTo($('#common').empty());
    $('#deploy-template').tmpl(data).appendTo($('#deploy').empty());


    // 初始化
    var _cfg = {
              isNull:1,
              id:'taskPrototypeStatus',
              value:'value',
              text:'text'
    };
    tools.renderSelect([{text:'禁用',value:0},{text:'启用',value:1}],_cfg);

    var _cfg2 = {
              isNull:1,
              id:'taskTriggerPeriod',
              value:'value',
              text:'text'
    };
    tools.renderSelect([{text:'每天',value:1},{text:'每周',value:2},
    {text:'每两周',value:3},{text:'每月',value:4},{text:'每季度',value:5},{text:'每年',value:6}],_cfg2);

     $('#taskStartDate').datetimepicker({
        format: 'yyyy-mm-dd hh:ii:00',
        weekStart: 1,
        autoclose: true,
        // startView: 0,
        // minView: 0,
        forceParse: false,
        language: 'zh-CN',
        startDate: new Date(),
        minuteStep:30
    });

     //选择任务派发对象
     $('#setting2').unbind().bind('click',function(){
        $('#distribute_modal').modal('show');
        $('#distribute_modal').on('hide.bs.modal', function () {
              $('#selectMember').removeAttr('data-source');
              $('#selectMember').empty();
              $('#selectObject').removeAttr('data-source');
              $('#selectObject').empty();
        });

        var taskhandlerconfigstyle= $('#taskHandlerConfigStyle').attr('data-taskhandlerconfigstyle'),
            whetherdistributepartya= $('#taskHandlerConfigStyle').attr('data-whetherdistributepartya'),
            selectObject= $('#selectPlace').attr('data-source');

          if(taskhandlerconfigstyle == 1){
              $('.selectMembers').addClass('fn-hide');
              $('.selectScope').removeClass('fn-hide');
              $("input[name='checkgroup'][value=1]").prop("checked",true);
              $('#selectMember').removeAttr('data-source');
              //是否
              if(whetherdistributepartya == "true"){
                  $("#whetherDistributePartyA").prop("checked",false);
              }else{
                $("#whetherDistributePartyA").prop("checked",true);
              }
              if(selectObject){
                  var _selectObject = JSON.parse(selectObject);

                  var show = [];
                  $.each(_selectObject,function(i,val){
                      show.push(val.depName||val.handlerName);
                  })

                  $('#selectObject').css('display',show.length==0?'none':'inline-block');
                  $('#selectObject').html(show.join(', '));
                  $('#selectObject').attr('data-source',selectObject);

              }
          }else{
              $('.selectMembers').removeClass('fn-hide');
              $('.selectScope').addClass('fn-hide');
              $("input[name='checkgroup'][value=2]").prop("checked",true);
              $('#selectObject').removeAttr('data-source');

              if(selectObject){
                  var _selectObject = JSON.parse(selectObject);

                  var show = [];
                  $.each(_selectObject,function(i,val){
                      show.push(val.name||val.handlerName);
                  });

                  $('#selectMember').css('display',show.length==0?'none':'inline-block');
                  $('#selectMember').html(show.join(', '));
                  $('#selectMember').attr('data-source',selectObject);

              }

          }


        //切换选择范围
        $('input[name="checkgroup"]').unbind().bind('change',function(){
             var value = this.value;
             if(value == 1){
                 $('.selectMembers').addClass('fn-hide');
                 $('.selectScope').removeClass('fn-hide');
                 $('#taskHandlerConfigStyle').attr('tmp-taskHandlerConfigStyle',1)
                 $('#selectMember').removeAttr('data-source');
                 $('#selectMember').empty();
                  $("#whetherDistributePartyA").prop("checked",true);
             }else if(value == 2){
                 $('.selectMembers').removeClass('fn-hide');
                 $('.selectScope').addClass('fn-hide');
                 $('#taskHandlerConfigStyle').attr('tmp-taskHandlerConfigStyle',2)
                 $('#selectObject').removeAttr('data-source');
                 $('#selectObject').empty();

             }
        })
    });

    //确定任务派发对象
    $('#distributeSelectedBtn').unbind().bind('click',function(){
          var dataObject = $('#selectObject').attr('data-source')||$('#selectMember').attr('data-source');
          var arr = dataObject?JSON.parse(dataObject):[];
          var selectObject = [];


          $.each(arr,function(i,val){
              selectObject.push(val.handlerName||val.depName||val.name)
          });

          if($("input[name='checkgroup']:checked").val() == 1){
               if($('#whetherDistributePartyA').is(':checked')){
                  $('#taskHandlerConfigStyle').attr('data-whetherDistributePartyA',false)
               }else{
                  $('#taskHandlerConfigStyle').attr('data-whetherDistributePartyA',true)
               }
          }

          if($("input[name='checkgroup1']:checked").val() == 1){
               if($('#whetherInsteadAudit').is(':checked')){
                  $('#taskAuditorConfigStyle').attr('data-whetherInsteadAudit',true)
               }else{
                  $('#taskAuditorConfigStyle').attr('data-whetherInsteadAudit',false)
               }
          }

          $('#selectPlace').css('display',selectObject.length==0?'none':'inline-block');
          $('#selectPlace').html(selectObject.join(', '));
          $('#selectPlace').attr('data-source',dataObject);
          $('#taskHandlerConfigStyle').attr('data-taskHandlerConfigStyle',$('#taskHandlerConfigStyle').attr('tmp-taskHandlerConfigStyle'))
          $('#distribute_modal').modal('hide');

    });

    //选择范围
    $('#setting4').unbind().bind('click',function(){
          $('#org_modal').modal('show');
          selectOrg('selectObject');
    });

    //选择成员
    $('#setting5').unbind().bind('click',function(){
          var callback = function(arr){
              var selectObject = [],dataObject=[];

              $.each(arr,function(i,val){
                  selectObject.push(val.userName);
                  dataObject.push({auditorId:val.userId,name:val.userName,orgId:val.orgId});
              });

              $('#selectMember').css('display',selectObject.length==0?'none':'inline-block');
              $('#selectMember').html(selectObject.join(', '));
              $('#selectMember').attr('data-source',JSON.stringify(dataObject));

          }
          var _dataObject = $('#selectMember').attr('data-source')?JSON.parse($('#selectMember').attr('data-source')):[],
              dataObject = [];
          $.each(_dataObject,function(i,val){
              dataObject.push({userId:val.handlerId||val.auditorId,userName:val.name||val.handlerName,orgId:val.orgId});
          });
          openDialog(false,callback,dataObject);
    })

    //选择任务审批对象
    $('#setting3').unbind().bind('click',function(){
          $('#approval_modal').modal('show');
          $('#approval_modal').on('hide.bs.modal', function () {
              $('#approvalMember').removeAttr('data-source');
              $('#approvalMember').empty();
          });

          var taskAuditorConfigStyle= $('#taskAuditorConfigStyle').attr('data-taskAuditorConfigStyle'),
              whetherInsteadAudit= $('#taskAuditorConfigStyle').attr('data-whetherInsteadAudit'),
              selectObject= $('#selectsPeople').attr('data-source');

            if(taskAuditorConfigStyle == 1){
                $('.approval2').addClass('fn-hide');
                $('.approval1').removeClass('fn-hide');
                $("input[name='checkgroup1'][value=1]").prop("checked",true);
                if(selectObject){
                    var _selectObject = JSON.parse(selectObject);

                    var show = [];
                    $.each(_selectObject,function(i,val){
                        show.push(val.auditorName||val.name);
                    });

                    $('#approvalMember').css('display',show.length==0?'none':'inline-block');
                    $('#approvalMember').html(show.join(', '));
                    $('#approvalMember').attr('data-source',selectObject);

                }

            }else{
                $('.approval2').removeClass('fn-hide');
                $('.approval1').addClass('fn-hide');
                $("input[name='checkgroup1'][value=2]").prop("checked", true);

                //是否
                if(whetherInsteadAudit == "true"){
                    $("#whetherInsteadAudit").prop("checked",true);
                }else{
                    $("#whetherInsteadAudit").prop("checked",false);
                }

                $('#approvalManger').css('display','inline-block');
                $('#approvalManger').html('直接主管');
                $('#approvalManger').removeAttr('data-source');



            }

          //切换选择范围
          $('input[name="checkgroup1"]').unbind().bind('change',function(){
               var value = this.value;
               if(value == 1){
                   $('.approval2').addClass('fn-hide');
                   $('.approval1').removeClass('fn-hide');
                   $('#taskAuditorConfigStyle').attr('tmp-taskAuditorConfigStyle',1)
               }else if(value == 2){
                   $('.approval2').removeClass('fn-hide');
                   $('.approval1').addClass('fn-hide');
                   $('#taskAuditorConfigStyle').attr('tmp-taskAuditorConfigStyle',2)
                   $('#approvalMember').removeAttr('data-source');
                   $('#approvalMember').empty();
               }
          })
    });

    //选择成员
    $('#setting6').unbind().bind('click',function(){
          var callback = function(arr){
              var selectObject = [],dataObject=[];
              $.each(arr,function(i,val){
                  selectObject.push(val.userName);
                  dataObject.push({auditorId:val.userId,name:val.userName,orgId:val.orgId});
              });

              $('#approvalMember').css('display',selectObject.length==0?'none':'inline-block');
              $('#approvalMember').html(selectObject.join(', '));
              $('#approvalMember').attr('data-source',JSON.stringify(dataObject));

          }
          var _dataObject = $('#approvalMember').attr('data-source')?JSON.parse($('#approvalMember').attr('data-source')):[],
              dataObject = [];
          $.each(_dataObject,function(i,val){
              dataObject.push({userId:val.handlerId||val.auditorId,userName:val.name||val.auditorName,orgId:val.orgId});
          });
          openDialog(true,callback,dataObject);

    })
    // 确定所选成员
    $('#memberSubmit').unbind().bind('click',function(){
          if($("input[name='checkgroup1']:checked").val() == 1){
              var dataObject = $('#approvalMember').attr('data-source');
              var arr = dataObject?JSON.parse(dataObject):[];
              var selectObject = [];
              $.each(arr,function(i,val){
                  selectObject.push(val.name)
              });

              $('#selectsPeople').css('display',selectObject.length==0?'none':'inline-block');
              $('#selectsPeople').html(selectObject.join(', '));
              $('#selectsPeople').attr('data-source',dataObject);
              $('#approval_modal').modal('hide');
        }else{
              $('#selectsPeople').css('display','inline-block');
              $('#selectsPeople').removeAttr('data-source');
              $('#selectsPeople').html('直接主管');
              $('#taskAuditorConfigStyle').attr('data-whetherInsteadAudit',$('#whetherInsteadAudit').is(':checked')?true:false)
              $('#approval_modal').modal('hide');
        }
        $('#taskAuditorConfigStyle').attr('data-taskAuditorConfigStyle',$('#taskAuditorConfigStyle').attr('tmp-taskAuditorConfigStyle'))
    });

}

//实例化下拉框
function renderSelect(id,value){
    //多选默认赋值需转换为数组
    $('#'+id).selectpicker({ width: '100%',noneSelectedText:'请选择...' }).selectpicker('val',value);
}

//选择组织范围
function selectOrg(id){
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
          var selectNodes = getChildNodeIdArr(node); //获取所有子节点
          var _selectNodes = getChildNode(node);

          // if (Array.isArray(selectNodes) && selectNodes.length > 0) { //子节点不为空，则选中所有子节点
          //     var checkedNode = [];
          //     for(var i =0;i< _selectNodes.length;i++){
          //        if(!_selectNodes[i].state.disabled){
          //          checkedNode.push(_selectNodes[i].nodeId)
          //        }
          //     }
          //
          //     $('#selectedDepTree').treeview('checkNode', [checkedNode, { silent: true }]);
          //
          // }
          // setParentNodeCheck(node);


      },
      onNodeUnchecked: function(event, node) { //取消选中节点
            // 取消父节点 子节点取消
           var selectNodes = setChildNodeUncheck(node); //获取未被选中的子节点
           var childNodes = getChildNodeIdArr(node);    //获取所有子节点
           // if (Array.isArray(selectNodes) && selectNodes.length==0) { //有子节点且未被选中的子节点数目为0，则取消选中所有子节点
           //     $('#selectedDepTree').treeview('uncheckNode', [childNodes, { silent: true }]);
           // }
           // // 取消节点 父节点取消
           // $('#selectedDepTree').treeview('uncheckNode', [node.parentId, { silent: true }]);
      }
  });

  $('#orgSubmit').unbind().bind('click',function(){
      var selected = $('#selectedDepTree').treeview('getChecked');
      exportDepSelected = [];
      if(Array.isArray(selected) && selected.length > 0){
          for(var i=0;i<selected.length;i++){

              var obj={};
              obj.handlerId=selected[i].depId;
              obj.depName=selected[i].depName;
              obj.orgId = selected[i].orgId;
              exportDepSelected.push(obj);
          }
      }

      var obj = {};
         exportDepSelected = exportDepSelected.reduce(function(item, next) {
         obj[next.handlerId] ? '' : obj[next.handlerId] = true && item.push(next);
          return item;
      }, []);

      var show = [];
      $.each(exportDepSelected,function(i,val){
          show.push(val.depName);
      })

      $("#org_modal").modal('hide');
      $('#selectObject').css('display',show.length==0?'none':'inline-block');
      $('#selectObject').html(show.join(', '));
      $('#selectObject').attr('data-source',JSON.stringify(exportDepSelected));
  });

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
                  "queryType":2
              }

          }
      };
      treeNode = getTreeContent(params);
      return treeNode;
  }
  //获取后台tree数据
  function getTreeContent(params) {
    var depList=[],depList1 =[],depList2=[],depList4=[];
    var data=$("#"+id).attr('data-source')?JSON.parse($("#"+id).attr('data-source')):[];




    // 当前页面选择
    for(var i=0;i<data.length;i++){
        depList2.push(data[i].depId||data[i].handlerId);
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
                  }
                  // else if(depList4.indexOf(tmp_obj.id) > -1){
                  //    tmp_obj.state.checked= false;
                  //    tmp_obj.state.disabled = false;
                  // }else{
                  //    tmp_obj.state.disabled= (tmp_obj.show == 1?true:false);
                  //    tmp_obj.state.checked= false;
                  // }

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
}
