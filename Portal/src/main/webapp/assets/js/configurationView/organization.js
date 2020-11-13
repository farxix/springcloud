define(['jquery', 'apiConfig', '../../../assets/js/lib/sweetalert/sweetalert.min', 'commonUtils', 'commonModule', 'bootstrap-modal', '../../../assets/js/toolUtil', '../../../assets/js/formValidate', 'spin', 'ladda', 'bootstrap', 'bootstrap-select', 'bootstrap-treeview', 'bootstrap-datetimepicker', 'bootstrap-datetimepicker.zh-CN', 'jquery.tablednd.min'], function ($, apiConfig, sweetalert, commonUtils, commonModule, modal, toolUtil, formValidate, spin, ladda) {
    var api = apiConfig.getApiUrl();
    var tools = new toolUtil.toolUtil();
    var user = commonUtils.getUser();
    var userType = $("#orgId", parent.document).attr("data-userType");
    var orgId = $("#orgId", parent.document).attr("data-id");
    var userId = $("#orgId", parent.document).attr("data-user");
    // var login=getUrlParam();
    var login = {userTel:localStorage.getItem("userTel"),tokenId:localStorage.getItem("tokenId")};

    function init() {
        middleHeight();
        var selected;//被选中的节点
        initTree();
        if (getTree() != undefined && getTree().length > 0) {
            var nodeId = 0;
            $('#tree').treeview('selectNode', [nodeId, {silent: true}]);
            selected = $('#tree').treeview('getSelected')[0];
            refreshBreadcrumb(nodeId);
        }
        //初始化person_table
        $("#person_table").bootstrapTable('destroy').bootstrapTable({
            height: '350',
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
                var treeSelected = $('#tree').treeview('getSelected');
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
                res = JSON.parse(decrypt(res, getPass()));
                console.log(res);
                return res.data ? res.data : [];
            },
            // locale: "zh-CN",
            // classes: 'table table-no-bordered table-hover-row',
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
            columns: [
                {field: "userName", title: "姓名",width:'15%px', align: "left", valign: "middle",formatter:function(val,row,index){
                        return val + ( row.director == 1 ? '<span class="userMarker marker-master">主管</span>'
                            : row.userStatus == 2 ? '<span class="userMarker marker-reject">已拒绝</span>'
                                : row.userStatus == 3 ? '<span class="userMarker marker-unregistered">未注册</span>'
                                    : row.userStatus == 4 ? '<span class="userMarker marker-disagree">待同意</span>'
                                        : '' );
                    }},
                {field: "positionName", title: "职位", align: "left", valign: "middle", width: '10%px'},
                // {field: "depName", title: "部门", align: "left",valign: "middle"},
                {field: "rankName", title: "职级", align: "left", valign: "middle", width: '10%px'},
                {field: "memberType", title: "成员类型", align: "left", valign: "middle", width: '10%px'},
                {field: "company", title: "厂商", align: "left", valign: "middle", width: '10%px'},
                {field: "entryTime", title: "入职时间", align: "left", valign: "middle", width: '15%px'},
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
            ]
        });

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

        $('#person_table').on('load-success.bs.table', function (data) {
            // var  height = null;
            // if($('iframe',parent.document).height()){
            //     // height = $('iframe',parent.document).height()- 108;
            //     // height = $('iframe',parent.document).height()-56-30-$("#tab-four").height();
            //     // $('#personList .fixed-table-body').css('height',height);
            //     // $('#personList .fixed-table-body').css('overflow-y','auto');
            // }else{
            //     // height = $('iframe',parent.document).height()-56-30-$("#tab-four").height();
            //     // $('#personList .fixed-table-body').css('height',height);
            //     // $('#personList .fixed-table-body').css('overflow-y','auto');
            // }
            $('#personList .fixed-table-body').css('height', '350px');
            $('#personList .fixed-table-body').css('overflow', 'auto');
        })

        $('#tree').on('nodeSelected', function (event, data) {
            //再添加节点前，需要清空展开节点下的子节点，否则会累计很多节点。
            selected = data;
            refreshBreadcrumb(data.nodeId);
            $("#person_table").bootstrapTable('refresh', {pageNumber: 1})
        });
    }

    //格式化后台返回tree数据
    function getTree() {
        var params = {
            "id": new Date().getTime(),
            "client": {},
            "data": {
                "module": "main-api",
                "url": "/api/dep/userDepTree",
                "param": {
                    "orgId": orgId,
                    // "parentDepId": "-1",
                    "userType": userType,
                    "userId": userId
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

    function initTree() {
        $('#tree').treeview({
            data: getTree(),
            collapseIcon: 'glyphicon glyphicon-triangle-bottom', // 折叠图标，默认 min
            expandIcon: 'glyphicon glyphicon-triangle-right',
            showBorder: false,
            selectedColor: '#878787',
            selectedBackColor: '#bae7ff',
        });
        $('#tree').on('nodeUnselected', function (event, data) {
            $('#tree').treeview('toggleNodeSelected', [data.nodeId, {silent: true}]);
        })
        $('#tree').on('nodeSelected', function (event, data) {
            var selectArr = $('#tree').treeview('getSelected');
            for (i = 0; i < selectArr.length; i++) {
                if (selectArr[i].nodeId != data.nodeId) {
                    $('#tree').treeview('unselectNode', [selectArr[i].nodeId, {silent: true}]);
                }
            }
        });
    }

    function middleHeight() {
        var height = $(window).height() - 48;
        $('#tree').css({height: height});
    }

    function getUrlParam() {
        var url = window.parent.location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    }

    //浏览器改变时重新加载表格样式，防止内容错位
    $(window).resize(function () {
        $('#person_table').bootstrapTable('resetView');
    });
    return {
        init: init
    }
});

/**
 * 刷线面包屑导航栏
 * @param nodeId
 */
function refreshBreadcrumb(nodeId) {
    var liHtml = '';
    var nodePath = getTreeNodePath(nodeId);
    nodePath.forEach(function (item, index) {
        liHtml += '<li class="breadcrumb-item ' +
            ((index == nodePath.length - 1) ? 'active' : '')
            + '">' + item + '</li>';
    });
    $('.breadcrumb').html(liHtml);
}

/**
 * 获取当前树选中节点路径
 * @param nodeId
 * @returns {[]}
 */
function getTreeNodePath(nodeId) {
    var nodePath = [];
    (function x(nodeId) {
        var node = $("#tree").treeview("getNode", nodeId);
        nodePath.unshift(node.depName);
        if (node.parentId == 0 || node.parentId) {
            x(node.parentId);
        }
    })(nodeId);
    return nodePath;
}
