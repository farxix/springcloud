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
      'settlementName': {
          required: true,
          name: '结算名称',
          validate:function(val){
              if(val.length >30){
                  return "结算名称不能超过30个字"
              }
          }
      },
      'status': {
          required: true,
          name: '状态',
      },
      'statCycle':{
          required: true,
          name: '统计周期',
      },
      'statStartTime': {
          required: true,
          name: '统计开始日期',
          validate:function(value){
             var day = value.split('-')[2];
             if(day>28){
                return '统计开始日期不能超过28号'
             }

          }

      },
      'statTime':{
          required: true,
          name: '结算生成时间',
          positiveInteger:true,
      },
      'workLate':{
          required: true,
          name: '迟到扣减',
          floatNumber:true,
          validate:function(value){
             if(value > 999.9){
                return "迟到扣减不能超过999.9"
             }

          }
      },
      "workLeave":{
          required: true,
          name: '早退扣减',
          floatNumber:true,
          validate:function(value){
             if(value > 999.9){
                return "早退扣减不能超过999.9"
             }

          }
      },
      "workLack":{
          required: true,
          name: '缺卡扣减',
          floatNumber:true,
          validate:function(value){
             if(value > 999.9){
                return "缺卡扣减不能超过999.9"
             }

          }
      },
      "taskFactor":{
          required: true,
          name: '任务超时扣减',
          floatNumber:true,
          validate:function(value){
             if(value > 999.9){
                return "任务超时扣减不能超过999.9"
             }

          }
      },
      "achiPass":{
          required: true,
          name: '绩效评分及格线',
          floatNumber:true,
          validate:function(value){
             if(value > 999.9){
                return "绩效评分及格线不能超过999.9"
             }

          }
      },
      "achiUnPass":{
          required: true,
          name: '绩效评分不及格扣减',
          floatNumber:true,
          validate:function(value){
             if(value > 999.9){
                return "绩效评分不及格扣减不能超过999.9"
             }

          }
      },
};


$(document).ready(function () {
    init();
});

function init() {
    // 绩效列表
    getsList();
    //新增结算
    $('body').undelegate().delegate('#addTask','click',function(){
          createForm({id:'',settlementName:'',statStartTime:'',statTime:'',
                  settlementStat:{
                    workLate:'',workLeave:'',workLack:'',taskFactor:'',
                    achiPass:'',achiUnPass:''
                  }
            });
            $("#memberType").prop("checked", true);
          save();
    });

    //关闭按钮
    $("#goback").unbind().bind('click',function () {
        $('.form-wrap').addClass('fn-hide');
        $('.list-wrap').removeClass('fn-hide');
    })
}

//保存
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

          var url = '/api/settlement/add';
          var object = $('#selectPlace').attr('data-source')?JSON.parse($('#selectPlace').attr('data-source')):[];
          var handlers = [],depId =[];
          $.each(object,function(i,val){
              handlers.push({"handlerId":val.handlerId||val.auditorId,"orgId":val.orgId})
              depId.push(val.handlerId);
          });

          var object2 = $('#selectsPeople').attr('data-source')?JSON.parse($('#selectsPeople').attr('data-source')):[];
          var auditors = [],emailList =[];
          $.each(object2,function(i,val){
              auditors.push({"auditorId":val.auditorId,"orgId":val.orgId})
              emailList.push(val.auditorId);
          })

          var now = new Date();
          var hour = now.getHours();//得到小时
          var minu = now.getMinutes();//得到分钟
          if (hour < 10) hour = "0" + hour;
          if (minu < 10) minu = "0" + minu;

          var param = {
              "orgId":orgId,
              "settlementName":$('#settlementName').val(),
              "settlementTemp":"工作结算",
              "memberType":$('#memberType').is(':checked')?0:1,
              "status":$('#status').val(),
              "statCycle":$('#statCycle').val(),
              "statStartTime":$('#statStartTime').val(),

              "statTime":$('#statTime').val(),
              "createBy":userId,
              "settlementStat":{
                   "workLate":$('#workLate').val(),
                   "workLeave":$('#workLeave').val(),
                   "workLack":$('#workLack').val(),
                   "taskFactor":$('#taskFactor').val(),
                   "achiPass":$('#achiPass').val(),
                   "achiUnPass":$('#achiUnPass').val()
              },
              "emailList":emailList,
              "depId":depId.join(',')
          }
           // console.log(param);


          var id = $('#id').val();

          if(id){
              param.settlementId = id;
              param.updateBy = userId;
              url = '/api/settlement/update';
          }

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
                        getsList();
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


//绩效列表
function getsList(){
    ajaxData('main-api','/api/settlement/list',{orgId:orgId},function(res){
        // console.log(res);
        $('#list-template').tmpl(res.data).appendTo($('#settlementList').empty());
        $('.list_items_edit').unbind().bind('click',function(){
             var id = $(this).attr('id');
             settlementDetail(id);
        })

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

                ajaxData('main-api','/api/settlement/delete',
                {"updateBy":userId,"idList":[id]},function(res){
                  // console.log(res);
                    if(res.status == 0){
                      //请求成功时处理
                      sweetAlert({
                          title: "信息",
                          text: "操作成功!",
                          type: "success",
                          confirmButtonColor: "#3197FA",
                          confirmButtonText: "确定"
                      },function(){
                          getsList();
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

//新增编辑
function createForm(data){
    $('.list-wrap').addClass('fn-hide');
    $('.form-wrap').removeClass('fn-hide');

    // 模版加载
    $('#common-template').tmpl(data).appendTo($('#common').empty());
    $('#statistics-template').tmpl(data).appendTo($('#statistics').empty());
    $('#settlement-template').tmpl(data.settlementStat).appendTo($('#settlement').empty());
    $('#mail-template').tmpl(data).appendTo($('#mail').empty());


     // 初始化
     var _cfg = {
              isNull:1,
              id:'status',
              value:'value',
              text:'text'
    };
     tools.renderSelect([{text:'禁用',value:2},{text:'启用',value:1}],_cfg);

     var _cfg2 = {
              isNull:1,
              id:'statCycle',
              value:'value',
              text:'text'
    };
     tools.renderSelect([{text:'每月',value:4},{text:'每季度',value:5},{text:'每年',value:6}],_cfg2);

     $('#statStartTime').datetimepicker({
        format: 'yyyy-mm-dd',
        weekStart: 1,
        autoclose: true,
        startView: 2,
        minView: 2,
        forceParse: false,
        language: 'zh-CN',
    })


      // 选择范围
      $('#setting2').unbind().bind('click',function(){
            $('#org_modal').modal('show');
            selectOrg('selectPlace');
      })

      //选择成员
      $('#setting3').unbind().bind('click',function(){
            var callback = function(arr){
                var selectObject = [],dataObject=[];

                $.each(arr,function(i,val){
                    selectObject.push(val.userName);
                    dataObject.push({auditorId:val.userId,name:val.userName,orgId:val.orgId});
                });

                $('#selectsPeople').css('display',selectObject.length==0?'none':'inline-block');
                $('#selectsPeople').html(selectObject.join(', '));
                $('#selectsPeople').attr('data-source',JSON.stringify(dataObject));

            }
            var _dataObject = $('#selectsPeople').attr('data-source')?JSON.parse($('#selectsPeople').attr('data-source')):[],
                dataObject = [],_dataObject1 = [];

            $.each(_dataObject,function(i,val){
                dataObject.push({userId:val.handlerId||val.auditorId,userName:val.userName||val.auditorName||val.name});
            });
            openDialog(false,callback,dataObject);
      })



}

//详情
function settlementDetail(id){
  ajaxData('main-api','/api/settlement/findById',{'settlementId':id},function(res){
        var record = res.data.data;

        // console.log(record);


        var handlers = [],_perfHandlerConfigItems =[];

        record.depName && handlers.push(record.depName);
        _perfHandlerConfigItems.push({"handlerId":record.depId,"orgId":record.orgId,"handlerName":record.depName})


        record.handlers = handlers.join(',');
        record._perfHandlerConfigItems = JSON.stringify(_perfHandlerConfigItems);

        var auditors = [],_emailInfo=[];
        $.each(record.emailInfo,function(i,val){
            val.userName && auditors.push(val.userName);
            _emailInfo.push({"auditorId":val.auditorId||val.userId,"orgId":val.orgId,auditorName:val.auditorName||val.userName});
        })
        record.auditors = auditors.join(',');
        record._emailInfo = JSON.stringify(_emailInfo);


        createForm(record);
        renderSelect('status',record.status);
        renderSelect('statCycle',record.statCycle);

        $("#memberType").prop("checked", record.memberType==0?true:false);


        save();
  });
}

//选择组织范围
function selectOrg(id){
  var nodeId_temp = null;
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
          var selectNodes = $('#selectedDepTree').treeview('getChecked'); //获取所有子节点
          $.each(selectNodes,function(i,val){
              if($("#"+id).attr('data-source')){
                  if(val.depId == JSON.parse($("#"+id).attr('data-source'))[0].handlerId){
                        nodeId_temp = val.nodeId;
                  }
              }
          });

          if (nodeId_temp != null) {
              $('#selectedDepTree').treeview('uncheckNode', [nodeId_temp, {slient: true}]);
          }
          nodeId_temp = node.nodeId;
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
      $('#selectPlace').css('display',show.length==0?'none':'inline-block');
      $('#selectPlace').html(show.join(', '));
      $('#selectPlace').attr('data-source',JSON.stringify(exportDepSelected));
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
    var data=$("#"+id).attr('data-source');



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
                  if(data && JSON.parse(data)[0].handlerId == tmp_obj.id){
                     tmp_obj.state.checked= true;
                  }


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

//实例化下拉框
function renderSelect(id,value){
    //多选默认赋值需转换为数组
    $('#'+id).selectpicker({ width: '100%',noneSelectedText:'请选择...' }).selectpicker('val',value);
}
