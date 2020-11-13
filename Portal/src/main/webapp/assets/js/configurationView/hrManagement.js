var tools = new toolUtil();
var api  = getApiUrl();
var userType=$("#orgId",parent.document).attr("data-userType");
var orgId = $("#orgId", parent.document).attr("data-id");
var userId = $("#orgId", parent.document).attr("data-user");
var login = {userTel:localStorage.getItem("userTel"),tokenId:localStorage.getItem("tokenId")};
var treeNode = [];       //存放树节点信息-树形结构
var exportDepSelected = []; //导出时选中的部门

$(document).ready(function () {
    init();
    getTree();
});

function init(){
    //获取厂商
    var params1={
          "orgId": orgId,
          "enumType":4
    }
    ajaxData('main-api','/api/setting/search',params1,function(res){
         var companyId=['company1','company2','company3','company4'];
         $.each(companyId,function(i,val){
             var _cfg = {
                   isNull:1,
                   id:val,
                   defultText:'全部厂商',
             };
             tools.renderSelect(res.data.data,_cfg);
         });
    });

    //获取职位
    var params2 ={
          "orgId": orgId,
          "keyword":"",
          "enumType":1,
    }
    ajaxData('main-api','/api/setting/search',params2,function(res){
         var positionId=['position1','position3','position4'];
         $.each(positionId,function(i,val){
             var _cfg = {
                       isNull:1,
                       id:val,
                       defultText:'全部职位'
                 };
             tools.renderSelect(res.data.data,_cfg);
         });
    });

    //获取职级
    var params3 ={
          "orgId": orgId,
          "keyword":"",
          "enumType":2,
    }
    ajaxData('main-api','/api/setting/search',params3,function(res){
         var positionId=['rank1','rank3','rank4'];
         $.each(positionId,function(i,val){
             var _cfg = {
                       isNull:1,
                       id:val,
                       defultText:'全部职级'
                 };
             tools.renderSelect(res.data.data,_cfg);
         });
    });

    //获取成员类型
     var typeId=['memberType1','memberType2','memberType3','memberType4'];
     $.each(typeId,function(i,val){
         var _cfg = {
                   isNull:1,
                   id:val,
                   defultText:'全部类型'
             };
         tools.renderSelect(["甲方","乙方"],_cfg);
     });

     //获取部门
      var departmentId=['department1','department2','department3','department4'];
      $.each(departmentId,function(i,val){
          $('#'+val).unbind().bind('click',function(){
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
                          "queryType":2
                      }

                  }
              };
              var data=getTreeContent(params)
              getOrganization(data);

              //选择部门后保存按钮
              $("#gotoSubmit_org").unbind().bind('click',function () {
                  var list=$("#organization_list").bootstrapTable('getSelections')[0];
                  var depId=list.depId;
                  var depName=list.depName;
                  $("#"+val).attr('data-id',depId);
                  $("#"+val).val(depName);
                  $("#orginzation").modal('hide');
              })

              // $("#batchExportDepDialog").modal('show');
              // var mTreeNodes = JSON.parse(JSON.stringify(treeNode));
              // (function parseChecked(nodes){
              //     if(Array.isArray(exportDepSelected) && exportDepSelected.length > 0){
              //         nodes.forEach(function(item){
              //             item.state = {checked:exportDepSelected.indexOf(item.depId) !== -1};
              //             if(Array.isArray(item.nodes) && item.nodes.length > 0){
              //                 parseChecked(item.nodes)
              //             }
              //         });
              //     }
              // })(mTreeNodes);
              //
              // $('#selectedDepTree').treeview({
              //     data: mTreeNodes,
              //     selectable: true,
              //     collapseIcon: 'glyphicon glyphicon-triangle-bottom', // 折叠图标，默认 min
              //     expandIcon: 'glyphicon glyphicon-triangle-right',
              //     showBorder: false,
              //     selectedColor: '#878787',
              //     selectedBackColor: '#bae7ff',
              // });
              //
              // $('#batchExportDepSelectedBtn').off('click').on('click',function(){
              //     var selected = $('#selectedDepTree').treeview('getChecked');
              //     if(Array.isArray(selected) && selected.length > 0){
              //         exportDepSelected = selected.map(function(item){
              //             return item.depId;
              //         });
              //     }else{
              //         exportDepSelected = [];
              //     }
              //     $("#batchExportDepDialog").modal('hide');
              // });
          })
      })


     //渲染时间
      var beginDate=['beginDate1','beginDate2','beginDate3','beginDate4'];
      $.each(beginDate,function(i,val){
          $('#'+val).datetimepicker({
              format: 'yyyy-mm-dd',
              weekStart: 1,
              autoclose: true,
              startView: 2,
              minView: 2,
              forceParse: false,
              language: 'zh-CN',
          }).on('changeDate',function(e){
              $("#endDate"+(i+1)).datetimepicker("setStartDate", $("#"+val).val());
          });
      });

      var endDate=['endDate1','endDate2','endDate3','endDate4'];
      $.each(endDate,function(i,val){
            $('#'+val).datetimepicker({
                format: 'yyyy-mm-dd',
                weekStart: 1,
                autoclose: true,
                startView: 2,
                minView: 2,
                forceParse: false,
                language: 'zh-CN',
            }).on('changeDate',function(e){
                $("#beginDate"+(i+1)).datetimepicker("setEndDate", $("#"+val).val());

            });
      })


      //查询
      var search=['search1','search2','search3','search4'];
      $.each(search,function(i,val){
          $('#'+val).unbind().bind('click',function(){
                initTable(i);
          });
      });

      //重置
      var reset=['reset1','reset2','reset3','reset4'];
      $.each(reset,function(i,val){
          $('#'+val).unbind().bind('click',function(){
              $('#position'+(i+1)).selectpicker('val','')//回到初始状态
              $('#position'+(i+1)).selectpicker('refresh');//刷新
              $('#rank'+(i+1)).selectpicker('val','')//回到初始状态
              $('#rank'+(i+1)).selectpicker('refresh');//刷新
              $('#memberType'+(i+1)).selectpicker('val','')//回到初始状态
              $('#memberType'+(i+1)).selectpicker('refresh');//刷新
              $('#company'+(i+1)).selectpicker('val','')//回到初始状态
              $('#company'+(i+1)).selectpicker('refresh');//刷新
              $('#userName'+(i+1)).val('');
              $('#beginDate'+(i+1)).val('');
              $('#endDate'+(i+1)).val('');
              $('#department'+(i+1)).val('');
              $('#department'+(i+1)).removeAttr('data-id');
          });
      })


      // 导出
      var exportId = ['export1','export2','export3','export4'];
      var downloadInfo = ['在职记录.xlsx','岗位调整记录.xlsx','职级调整记录.xlsx','离职记录.xlsx'];

      $.each(exportId,function(i,val){
          $('#'+val).unbind().bind('click',function(){
                var param = {
                    orgId: orgId,
                    userId:userId,
                    userName: $('#userName'+(i+1)).val(),
                    positionName: $('#position'+(i+1)).val(),
                    rankName:$('#rank'+(i+1)).val(),
                    memberType:$('#memberType'+(i+1)).val(),
                    company:$('#company'+(i+1)).val(),
                    startTime:$('#beginDate'+(i+1)).val(),
                    endTime:$('#endDate'+(i+1)).val(),
                    type:(i+1),
                    depId: $('#department'+(i+1)).attr('data-id'),
                };
                ajaxData('main-api','/api/personnel/report',param,function(res){
                     if(res.status == 0){
                       var exportDataSource = res.data && res.data.data;
                        if(exportDataSource.length == 0 ){
                              //请求成功时处理
                              sweetAlert({
                                  title: "信息",
                                  text: "没有符合条件的数据！",
                                  type: "info",
                                  confirmButtonColor: "#3197FA",
                                  confirmButtonText: "确定"
                              },function(){
                                  $("#save").attr("disabled",true);
                              });
                              return;
                        }

                        var excelItems = [];
                        for (var index = 0; index < exportDataSource.length; index++) {
                          switch (i) {
                            case 0:
                                excelItems.push({
                                  "姓名":exportDataSource[index]["userName"],
                                  "部门":exportDataSource[index]["depName"],
                                  "职位": exportDataSource[index]["positionName"],
                                  "职级":exportDataSource[index]["rankName"],
                                  "成员类型":exportDataSource[index]["memberType"],
                                  "厂商":exportDataSource[index]["company"],
                                  "入职时间":exportDataSource[index]["entryTime"],
                                  "办公地点":exportDataSource[index]["addrName"],
                                  "手机号":exportDataSource[index]["userTel"],
                                  "邮箱": exportDataSource[index]["userEmail"],
                                  "备注": exportDataSource[index]["remarks"],
                                }); //属性
                              break;
                            case 1:
                                excelItems.push({
                                   "姓名": exportDataSource[index]["userName"],
                                   "成员类型": exportDataSource[index]["memberType"],
                                   "入职时间": exportDataSource[index]["entryTime"],
                                   "调岗时间": exportDataSource[index]["effectTime"],
                                   "调岗前部门": exportDataSource[index]["depName"],
                                   "调岗前职位": exportDataSource[index]["positionName"],
                                   "调岗后部门": exportDataSource[index]["newDepName"],
                                   "调岗后职位": exportDataSource[index]["newPositionName"],
                                   "调整原因": exportDataSource[index]["remarks"],
                                  }); //属性
                              break;
                            case 2:
                                  excelItems.push({
                                    "姓名": exportDataSource[index]["userName"],
                                    "部门": exportDataSource[index]["depName"],
                                    "职位": exportDataSource[index]["positionName"],
                                    "成员类型": exportDataSource[index]["memberType"],
                                    "厂商": exportDataSource[index]["company"],
                                    "入职时间": exportDataSource[index]["entryTime"],
                                    "调整时间": exportDataSource[index]["effectTime"],
                                    "调整前职级": exportDataSource[index]["rankName"],
                                    "调整后职级": exportDataSource[index]["newRankName"],
                                    "备注": exportDataSource[index]["remarks"],
                                  }); //属性
                                break;
                            case 3:
                                excelItems.push({
                                  "姓名": exportDataSource[index]["userName"],
                                  "部门": exportDataSource[index]["depName"],
                                  "职位": exportDataSource[index]["positionName"],
                                  "成员类型": exportDataSource[index]["memberType"],
                                  "厂商": exportDataSource[index]["company"],
                                  "入职时间": exportDataSource[index]["entryTime"],
                                  "离职时间": exportDataSource[index]["effectTime"],
                                  "离职原因": exportDataSource[index]["quitReason"],
                                  "备注": exportDataSource[index]["remarks"],
                                }); //属性
                              break;
                            default:
                                break;
                          }
                         }
                        var sheet = XLSX.utils.json_to_sheet(excelItems);
                        openDownloadDialog(sheet2blob(sheet), downloadInfo[i]);
                     }
                });
          });
      })

      //加载表格
      initTable();

}

function initTable(index){
    //表格超出宽度鼠标悬停显示td内容
    function paramsMatter(value, row, index, field) {
        var span = document.createElement('span');
        span.setAttribute('title', value);
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
                "max-width": "100px",
                "font-size": "13px",
                "color": "#757575"
            }
        }
    }

    var _tableId = ['onJob_table','postAdjust_table','rankAdjust_table','quit_table'];
    var tableId = [];

    if(undefined !== index){
      tableId.push(_tableId[index]);
    }else{
      tableId= [].concat(_tableId)
    }

    var coloumns = {
      'onJob_table':[
          {field: "userName", title: "姓名", align: "left", valign: "middle", width: '10%px'},
          {field: "depName", title: "部门", align: "left",valign: "middle"},
          {field: "positionName", title: "职位", align: "left", valign: "middle", width: '10%px'},
          {field: "rankName", title: "职级", align: "left", valign: "middle", width: '10%px'},
          {field: "memberType", title: "成员类型", align: "left", valign: "middle", width: '10%px'},
          {field: "company", title: "厂商", align: "left", valign: "middle", width: '10%px'},
          {field: "entryTime", title: "入职时间", align: "left", valign: "middle", width: '15%px'},
          {field: "addrName", title: "办公地点", align: "left",valign: "middle"},
          {field: "userTel", title: "手机号", align: "left", valign: "middle", width: '15%px'},
          {
              field: "userEmail", title: "邮箱", align: "left", valign: "middle",
              cellStyle: formatTableUnit,
              formatter: paramsMatter
          },
          {
              field: "remarks", title: "备注", align: "left", valign: "middle",
              cellStyle: formatTableUnit,
              formatter: paramsMatter
          }
      ],
      'postAdjust_table':[
          {field: "userName", title: "姓名", align: "left", valign: "middle", width: '10%px'},
          {field: "memberType", title: "成员类型", align: "left", valign: "middle", width: '10%px'},
          {field: "entryTime", title: "入职时间", align: "left", valign: "middle", width: '15%px'},
          {field: "effectTime", title: "调岗时间", align: "left", valign: "middle", width: '10%px'},
          {field: "depName", title: "调岗前部门", align: "left", valign: "middle", width: '10%px'},
          {field: "positionName", title: "调岗前职位", align: "left", valign: "middle", width: '15%px'},
          {field: "newDepName", title: "调岗后部门", align: "left",valign: "middle"},
          {field: "newPositionName", title: "调岗后职位", align: "left",valign: "middle"},
          {
              field: "remarks", title: "调整原因", align: "left", valign: "middle",
              cellStyle: formatTableUnit,
              formatter: paramsMatter
          }
      ],
      'rankAdjust_table':[
          {field: "userName", title: "姓名", align: "left", valign: "middle", width: '10%px'},
          {field: "depName", title: "部门", align: "left",valign: "middle"},
          {field: "positionName", title: "职位", align: "left", valign: "middle", width: '10%px'},
          {field: "memberType", title: "成员类型", align: "left", valign: "middle", width: '10%px'},
          {field: "company", title: "厂商", align: "left", valign: "middle", width: '10%px'},
          {field: "entryTime", title: "入职时间", align: "left", valign: "middle", width: '15%px'},
          {field: "effectTime", title: "调整时间", align: "left",valign: "middle"},
          {field: "rankName", title: "调整前职级", align: "left", valign: "middle", width: '10%px'},
          {field: "newRankName", title: "调整后职级", align: "left", valign: "middle", width: '10%px'},
          {
              field: "remarks", title: "备注", align: "left", valign: "middle",
              cellStyle: formatTableUnit,
              formatter: paramsMatter
          }
      ],
      'quit_table':[
          {field: "userName", title: "姓名", align: "left", valign: "middle", width: '10%px'},
          {field: "depName", title: "部门", align: "left",valign: "middle"},
          {field: "positionName", title: "职位", align: "left", valign: "middle", width: '10%px'},
          {field: "memberType", title: "成员类型", align: "left", valign: "middle", width: '10%px'},
          {field: "company", title: "厂商", align: "left", valign: "middle", width: '10%px'},
          {field: "entryTime", title: "入职时间", align: "left", valign: "middle", width: '15%px'},
          {field: "effectTime", title: "离职时间", align: "left",valign: "middle"},
          {
              field: "quitReason", title: "离职原因", align: "left", valign: "middle",
              cellStyle: formatTableUnit,
              formatter: paramsMatter
          },
          {
              field: "remarks", title: "备注", align: "left", valign: "middle",
              cellStyle: formatTableUnit,
              formatter: paramsMatter
          }
      ]

    }

    $.each(tableId,function(i, val){
      $("#"+val).bootstrapTable('destroy').bootstrapTable({
          height: '320',
          url: api + "/data/getData",
          method: 'post',
          contentType: 'application/json',
          dataType: 'html',
          pagination: true,
          sidePagination: 'server',
          smartDisplay: false,
          dataField: 'data',
          totalField: 'total',
          ajaxOptions: {
              headers: {"Authorization": login.tokenId, "userTel": login.userTel},
          },
          queryParams: function (params) {

              var page = {
                  pageSize: params.limit,
                  pageNum: (parseInt(params.offset) / parseInt(params.limit)) + 1,
                  order: {}
              };
              if (typeof params.sort !== 'undefined') {
                  page.order[params.sort] = params.order;
              }
              var data = {
                  orgId: orgId,
                  userId:userId,
                  userName: undefined !== index?$('#userName'+(index+1)).val():$('#userName'+(i+1)).val(),
                  positionName: undefined !== index?$('#position'+(index+1)).val():$('#position'+(i+1)).val(),
                  rankName:undefined !== index?$('#rank'+(index+1)).val():$('#rank'+(i+1)).val(),
                  memberType:undefined !== index?$('#memberType'+(index+1)).val():$('#memberType'+(i+1)).val(),
                  company:undefined !== index?$('#company'+(index+1)).val():$('#company'+(i+1)).val(),
                  startTime:undefined !== index?$('#beginDate'+(index+1)).val():$('#beginDate'+(i+1)).val(),
                  endTime:undefined !== index?$('#endDate'+(index+1)).val():$('#endDate'+(i+1)).val(),
                  type:undefined !== index?(index+1):(i+1),
                  depId: undefined !== index?$('#department'+(index+1)).attr('data-id'):$('#department'+(i+1)).attr('data-id'),
              };
              params = {
                  id: new Date().getTime(),
                  client: {},
                  data: {
                      "module": "main-api",
                      "url": "/api/personnel/report",
                      "param": data
                  },
                  page: page
              };
              return encrypt(JSON.stringify(params), getPass());
          },
          responseHandler: function (res) {
              res = JSON.parse(decrypt(res, getPass()));
              return res.data ? res.data : [];
          },

          singleSelect: true,
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
          columns: coloumns[val]
      });
    })

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
                "queryType":2

            }

        }
    };
    treeNode = getTreeContent(params);
    return treeNode;
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
                    'font-size': '14px',
                    'line-height':'0px',
                    'padding':'0px',
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
    html+='<li style="font-size:14px;color: #151515;" disabled class="breadcrumb-item active" data-id="'+depId+'">'+depName+'</li>';
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




/**
 * 通用的打开下载对话框方法
 * @param url 下载地址，也可以是一个blob对象，必选
 * @param saveName 保存文件名，可选
 */
function openDownloadDialog(url, saveName) {
    if (typeof url == 'object' && url instanceof Blob) {
        url = URL.createObjectURL(url); // 创建blob地址
    }
    var aLink = document.createElement('a');
    aLink.href = url;
    aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
    var event;
    if (window.MouseEvent) event = new MouseEvent('click');
    else {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
}
// 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
function sheet2blob(sheet, sheetName) {
    sheetName = sheetName || 'sheet1';
    var workbook = {
        SheetNames: [sheetName],
        Sheets: {}
    };
    workbook.Sheets[sheetName] = sheet;
    // 生成excel的配置项
    var wopts = {
        bookType: 'xlsx', // 要生成的文件类型
        bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
        type: 'binary'
    };
    var wbout = XLSX.write(workbook, wopts);
    var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
    // 字符串转ArrayBuffer
    function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
    return blob;
}
