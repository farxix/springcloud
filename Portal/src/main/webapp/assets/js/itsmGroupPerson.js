/**
 * Description: itsm工作组，人员选择
 * 分为：工作组--人员、组织--人员、工作组--工作组、组织--组织
 *      选择人员又可分为单选或多选，
 *      工作组和组织又可分为单选或多选
 **/
var api  = getApiUrl();
var tools = new toolUtil();
var shareGroupName = '';
var userid = tools.getQueryString('userId')||tools.getUser();
var _regexId="";
var selected;//被选中的节点


//初始化tree
function initTree() {
    $('#groupTree').treeview({
        data: getTree(),
        collapseIcon: 'glyphicon glyphicon-triangle-bottom', // 折叠图标，默认 min
        expandIcon: 'glyphicon glyphicon-triangle-right',
        showBorder: false,
        selectedColor: '#878787',
        selectedBackColor: '#bae7ff',
    });
    $('#groupTree').on('nodeUnselected', function (event, data) {
         $('#groupTree').treeview('toggleNodeSelected', [data.nodeId, {silent: true}]);
         // selected = data;
         // $("#personTable").bootstrapTable('refresh', {pageNumber: 1})
    })
    $('#groupTree').on('nodeSelected', function (event, data) {
        var selectArr = $('#groupTree').treeview('getSelected');
        for (i = 0; i < selectArr.length; i++) {
            if (selectArr[i].nodeId != data.nodeId) {
                $('#groupTree').treeview('unselectNode', [selectArr[i].nodeId, {silent: true}]);
            }
        }
    });
}

//格式化后台返回tree数据
function getTree() {
    var params = {
        "id": new Date().getTime(),
        "client": {},
        "data": {
            "module": "main-api",
            "url": "/api/dep/depTree",
            "param": {
                "orgId": orgId,
                "userType": userType,
                "userId": userId,
                "queryType":2
            }
        }
    };
    var tree = getTreeContent(params);
    return tree;
}

//获取后台tree数据
function getTreeContent(params) {
    var _tree = [];
    $.ajax({
        url: api + "/data/getData",   //请求的url地址
        dataType: "html",   //返回格式为json
        async: false,//请求是否异步，默认为异步，这也是ajax重要特性
        data: encrypt(JSON.stringify(params), getPass()),    //参数值
        type: "POST",   //请求方式
        contentType: 'application/json;charset=UTF-8',
        beforeSend: function (request) {
            //请求前的处理
            request.setRequestHeader("userTel", login.userTel);
            request.setRequestHeader("Authorization", login.tokenId);
        },
        success: function (req) {
            req = JSON.parse(decrypt(req, getPass()));
            if (req.data) {
                (req.data.data || []).forEach(function (tmp_obj) {
                    tmp_obj.text = tmp_obj.depName + (isNaN(parseInt(tmp_obj.count)) ? "" : ("(" + tmp_obj.count + ")"));
                    tmp_obj.id = tmp_obj.depId;
                    tmp_obj.parentId = tmp_obj.parentDepId;
                    tmp_obj.parentOid = tmp_obj.parentDepId;
                    tmp_obj.color = "#878787";
                    tmp_obj.icon = 'fa fa-folder';
                    _tree.push(tmp_obj);
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

    function compare(property, desc) {
        return function (a, b) {
            var value1 = a[property];
            var value2 = b[property];
            if (desc == true) {
                // 升序排列
                return value1 - value2;
            } else {
                // 降序排列
                return value2 - value1;
            }
        }
    }

    var list = _tree.sort(compare("sortNo", true));

    return simpleDataTypeToNormalDataType(list, 'id', 'parentId', 'nodes');
    // return _tree;
}

var _itsmGroupDialogOption = {
    showHeader: false,
    width: '800px',
    message: $('<div class="person-main"></div>').load(tools.getRootPath() + '/page/common/itsmGroupPerson.html?r='+new Date().getTime()),
    onhide:function () {
        $('#personTable').bootstrapTable('destroy');
        $('#checkPersonTable').bootstrapTable('destroy');
    },
    buttons: [
        {
            label: '取消',
            action: function (dialogSelf) {
                dialogSelf.close();
            }
        },
        {
            label: '确定',
            cssClass: 'dialog-confirm-btn',
            action: null

        }
    ]
};
/***
 * 待选人员
 * @type {{dataField: string, responseHandler: itsmPersonTableOption.responseHandler, method: string, queryParams: itsmPersonTableOption.queryParams, columns: *[], sidePagination: string, clickToSelect: boolean, url: string}}
 */

/**
 * 已选人员
 * @type {{pagination: boolean, data: Array, columns: *[], sidePagination: string, clickToSelect: boolean}}
 */
var checkPersonTableOption = {
    height:'200',
    data:[],
    sidePagination: "client",
    clickToSelect: true,
    pagination:false,
    columns: [
      {field: "userName", title: "姓名", align: "left", valign: "middle", },
      {field: "userId", title: "姓名", align: "left", valign: "middle", visible: false},
      // {field: "positionName", title: "职位", align: "left", valign: "middle", },
      // {field: "memberType", title: "成员类型", align: "left", valign: "middle",},
      // {field: "company", title: "厂商", align: "left", valign: "middle", },
      // {field: "userTel", title: "手机号", align: "left", valign: "middle",},
      {field: "",title: "操作",formatter: function (value, row, index) {
              return [
                  '<span data-userName='+row.userName+' onclick="delRow(this)" class="operate"><i class="fa fa-remove" aria-hidden="true" name="removeRecord"   ></i>删除</span>'
              ].join('');
          }},
    ],
    //行样式
    rowStyle: function (row, index) {
        return {
            css: {
                'font-size': '12px',
                'height': '30px',
                'color': '#757575'
            }
        }
    },
};

// 用于工单处理上面的几个弹窗的人员选择
function openDialog(isRadio,cb,selectObject) {
    var itsmGroupDialogOption =  $.extend({},_itsmGroupDialogOption,true);
    if(isRadio){
        itsmGroupDialogOption.message= $('<div class="person-main"></div>').load(tools.getRootPath() + '/page/common/itsmSinglePerson.html?r='+new Date().getTime());
        delete itsmGroupDialogOption.onDblClickRow;
    }
    itsmGroupDialogOption.onshown = function () {

        var columns = [];
        if(!isRadio){
            // 初始化checkPersonTable
            // $("#checkPersonTable").bootstrapTable('removeAll');
            // $("#checkPersonTable").empty();
            checkPersonTableOption.data = selectObject;
            // tools.createTable2("checkPersonTable", checkPersonTableOption);
            $("#checkPersonTable").bootstrapTable('destroy').bootstrapTable(checkPersonTableOption);
            $('.person-table').eq(1).find('.fixed-table-body').css('height', '210px');
            $('.person-table').eq(1).find('.fixed-table-body').css('overflow', 'auto');
              columns = [
                {field: "userName", title: "姓名", align: "left", valign: "middle", width: '10%'},
                {field: "userId", title: "姓名", align: "left", valign: "middle", visible: false},
              ]
        }else{
            columns = [
              {align: "center", width: '10%', checkbox: true, clickToSelect: false},
              {field: "userName", title: "姓名", align: "left", valign: "middle", width: '80%'},
              {field: "userId", title: "姓名", align: "left", valign: "middle", visible: false},
            ]
        }

        //初始化组织菜单
        initTree()

        if (getTree() != undefined && getTree().length > 0) {
              var nodeId = 0;
              $('#groupTree').treeview('selectNode', [nodeId, {silent: true}]);
              selected = $('#groupTree').treeview('getSelected')[0];
        }


        //初始化person_table
        $("#personTable").bootstrapTable('destroy').bootstrapTable({
            height: isRadio?'350':'100',
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
                var treeSelected = $('#groupTree').treeview('getSelected');
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
                    userId: userId,
                    status: 1,
                    depId: treeSelected.length > 0 ? treeSelected[0].depId : ''
                };
                params = {
                    id: new Date().getTime(),
                    client: {},
                    data: {
                        "module": "main-api",
                        "url": "/api/user/findByDep",
                        "param": data
                    },
                    page: page
                };
                return encrypt(JSON.stringify(params), getPass());
            },
            responseHandler: function (res) {
                res = JSON.parse(decrypt(res, getPass()));console.log(res)
                return res.data ? res.data : [];
            },
            // locale: "zh-CN",
            // classes: 'table table-no-bordered table-hover-row',
            singleSelect: true,
            //行样式
            rowStyle: function (row, index) {
                return {
                    css: {
                        'font-size': '12px',
                        'height': '30px',
                        'color': '#757575'
                    }
                }
            },
            columns: columns,
            onDblClickRow: function (row) {
                var list =  $('#checkPersonTable').bootstrapTable('getData');

                var flag = false;
                $.each(list,function (i,item) {

                    if(item.userName == row.userName && item.userId == row.userId){
                        flag  = true;
                    }
                });
                if(flag){ return ;}
                var count = list.length||-1;
                if(count == 20){
                    //请求成功时处理
                    sweetAlert({
                        title: "信息",
                        text: "最多可选20个人员",
                        type: "info",
                        confirmButtonColor: "#3197FA",
                        confirmButtonText: "确定"
                    });
                    return;
                }
                $('#checkPersonTable').bootstrapTable('insertRow', {
                    index: count+1,
                    row: row
                });
            }
        });

        if(isRadio){
          $('#personTable').on('load-success.bs.table', function (data) {
              $('.person-table .fixed-table-body').css('height', '350px');
              $('.person-table .fixed-table-body').css('overflow', 'auto');
          })

      }else{
          $('#personTable').on('load-success.bs.table', function (data) {
              $('.person-table').eq(0).find('.fixed-table-body').css('height', '100px');
              $('.person-table').eq(0).find('.fixed-table-body').css('overflow', 'auto');
         })
      }


        $('#groupTree').on('nodeSelected', function (event, data) {
            //再添加节点前，需要清空展开节点下的子节点，否则会累计很多节点。
            selected = data;
            $("#personTable").bootstrapTable('refresh', {pageNumber: 1})
        });

    };
    itsmGroupDialogOption.buttons[1].action = function (dialogSelf) {
           var personArray =[];

           if(!isRadio){
              personArray = $('#checkPersonTable').bootstrapTable('getData');
            }else{
                personArray = $('#personTable').bootstrapTable('getAllSelections');
            }

            cb && cb(personArray);

            dialogSelf.close();

    };

    tools.SimpleDialog(itsmGroupDialogOption).open();

}


/**
 * 删除已选的人员
 * @param dom
 */
function delRow(dom){
    $('#checkPersonTable').bootstrapTable('remove', {
        field:'userName',
        values: [$(dom).attr('data-userName')]
    });
}


/*人员查询组件结束*/
