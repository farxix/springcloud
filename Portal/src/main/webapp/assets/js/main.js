var api = getApiUrl();
var tools = new toolUtil();
// var userType=$("#orgId",document).attr("data-userType");
// var orgId=$("#orgId").attr("data-id");
// var userId=$("#orgId",document).attr("data-user");
// var login = getUrlParam();
var login = {userTel:localStorage.getItem("userTel"),tokenId:localStorage.getItem("tokenId")};
getPass();
//校验是否登录
// checkLogin();
var FormValidate_userword = new FormValidate();
//校验规则--部门新增编辑
var validateConfig_userWord = {
    'login': {
        required: true,
        name: '登录密码',
    },
    'reset_login': {
        required: true,
        name: '设置登录密码'
    },
    'reset_words': {
        required: true,
        name: '确认登录密码'
    }
};
//获取菜单
window.initMenu = function () {
    // var login=getUrlParam();
    var params = {
        "id": new Date().getTime(),
        "client": {},
        "data": {
            "module": "user",
            "url": "/user/manager/getUser",
            "param": {
                "userTel": login.userTel
            }


        }
    };
    $.ajax({
        url: api + '/data/getData',    //请求的url地址
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
            if (res.status == 0) {
                var params = {userId: res.data.data.userId};
                ajaxData("main-api", "/api/user/findByUserId", params, function (res) {
                    if (res.data != null) {
                        $("#orgId").attr('data-user', res.data.data.userId);
                        $("#orgId").text(res.data.data.userName);
                        $("#orgId").attr("data-id", res.data.data.orgId);
                        $("#orgId").attr("data-userType", res.data.data.userType);
                    }

                    //获取logo
                    getImg(res.data.data.orgId);

                    //获取企业名称
                    getApplyOrgInfo(res.data.data.orgId);

                    var orgParams = {
                        "id": new Date().getTime(),
                            "client": {},
                        "data": {
                            "userTel": login.userTel,
                                "userId": $("#orgId", document).attr("data-user"),
                                "orgId": $("#orgId", document).attr("data-id")

                        }
                    };
                    $.ajax({
                        url: api + '/user/getOrgnization',    //请求的url地址
                        dataType: "html",   //返回格式为json
                        async: true,//请求是否异步，默认为异步，这也是ajax重要特性
                        data: encrypt(JSON.stringify(orgParams),getPass()),
                        type: "POST",   //请求方式
                        contentType: 'application/json;charset=UTF-8',
                        beforeSend: function (request) {
                            //请求前的处理
                            request.setRequestHeader("Authorization", login.tokenId);
                            request.setRequestHeader("userTel", login.userTel);
                        },
                        success: function (res) {
                            res = JSON.parse(decrypt(res,getPass()));
                            if (res.status == 0) {
                                var tree = res.data.data.nodes;
                                // $("#orgId").attr("data-id","2");
                                $('#side-menu').treeview({
                                    data: tree
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

            }
        },
        complete: function () {
            //请求完成的处理
        },
        error: function () {
            //请求出错处理
        }
    });
}

function getUrlParam() {
    var url = location.search; //获取url中"?"符后的字串
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

//人员相关信息
function setAgent() {
    // 点击退出登录弹出页面
    $('#oldAgent').unbind().bind('click', function () {
        $.ajax({
            url: api + '/user/logout',//请求的url地址
            dataType: "html",   //返回格式为json
            async: false,//请求是否异步，默认为异步，这也是ajax重要特性
            // data: JSON.stringify(param),
            type: "GET", //请求方式
            contentType: 'application/json;charset=UTF-8',
            beforeSend: function (request) {
                //请求前的处理
                request.setRequestHeader("Authorization", login.tokenId);
                request.setRequestHeader("userTel", login.userTel);
            },
            success: function (Response, status) {
                window.location.href = getRootPath() + '/logout';
                sessionStorage.removeItem('key');

            },
            error: function (Response, status) {
            }
        });
    });
    /*点击人员信息弹出模态框*/
    $('#agentConfig').unbind().bind('click', function () {
        $('#right_modal').modal('show');
        var params = {
            "id": new Date().getTime(),
            "client": {},
            "data": {
                module: "main-api",
                url: "/api/user/findByUserId",
                "param": {
                    "userId": $("#orgId").attr('data-user'),
                }
            }
        };
        $.ajax({
            url: api + '/data/getData',//请求的url地址
            dataType: "html",   //返回格式为json
            async: false,//请求是否异步，默认为异步，这也是ajax重要特性
            data: encrypt(JSON.stringify(params),getPass()),
            type: "POST", //请求方式
            contentType: 'application/json;charset=UTF-8',
            beforeSend: function (request) {
                //请求前的处理
                request.setRequestHeader("Authorization", login.tokenId);
                request.setRequestHeader("userTel", login.userTel);
            },
            success: function (res, status) {
                res = JSON.parse(decrypt(res,getPass()));
                $.each(res.data.data.tableHeader, function (key, value) {
                    console.log(key,value);
                    if(value != null){
                      $("#" + key).text(res.data.data[key]);
                      $("#" + key).parent()[value != 2 ? 'show' : 'hide']();
                    }

                })
            }
        });
    });


    /*点击修改密码弹出模态框*/
    $('#informationConfig').unbind().bind('click', function () {
        $('#myModal').modal('show');
        for (var Key in validateConfig_userWord) {
            FormValidate_userword.removeErrorStyle(Key);
        }
        //绑定校验
        FormValidate_userword.validateForOnly(validateConfig_userWord);


        //设置登录密码
        $(".reset_login-r").blur(function () {
            var pwdReg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,15}$/;//8到16位数字与字母组合
            var value = $('#reset_login').val();
            if (!pwdReg.test(value)) {
                //密码不符合规则提示
                $("#reset_login_tips").html("密码不符合规则，请重新输入!");
                addErrorStyle('reset_login', '');
            } else {
                $("#reset_login_tips").html("");
                removeErrorStyle('reset_login');
                //新旧密码是否一致
                // var loginValue = $('#login').val();
                // if (value === loginValue) {
                //     $("#reset_login_tips").html("新密码不得同旧密码一致，请重新设定或取消!");
                //     addErrorStyle('reset_login', '');
                // } else {
                //     $("#reset_login_tips").html("");
                //     removeErrorStyle('reset_login');
                // }
            }
        });

        //确认登录密码
        $(".reset_words-r").blur(function () {
            var loginValue = $('#reset_login').val();
            var reValue = $('#reset_words').val();
            if (reValue !== loginValue) {
                $("#reset_words_tips").html("两次输入的密码不一致!");
                addErrorStyle('reset_words', '');
            } else {
                $("#reset_words_tips").html("");
                removeErrorStyle('reset_words');
            }
        });


        //点击取消按钮
        $("#right_close").unbind().bind('click', function () {
            //清空输入框
            $('.login-r').val('');
            $('.reset_login-r').val('');
            $('.reset_words-r').val('');
            $('#reset_login_tips').html('');
            $('#reset_words_tips').html('');
        });

        //点击重置按钮
        var $gotoSubmit = $("#gotoSubmit").ladda();
        $("#gotoSubmit").unbind().bind('click', function () {

            var newWords = $("#login").val();
            var newWords1 = $("#reset_login").val();
            var newWords2 = $("#reset_words").val();
            var flag = FormValidate_userword.validate($('#person_model')[0], validateConfig_userWord);

            if (flag == false) {
                return '';
            }

            //新密码校验
            var pwdReg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,15}$/;//8到16位数字与字母组合
            if (!pwdReg.test(newWords1)) {
                //密码不符合规则提示
                $("#reset_login_tips").html("密码不符合规则，请重新输入!");
                addErrorStyle('reset_login', '');
                return false;
            } else {
                $("#reset_login_tips").html("");
                removeErrorStyle('reset_login');
            }

            //二次密码校验
            if (newWords1 !== newWords2) {
                $("#reset_words_tips").html("两次输入的密码不一致!");
                addErrorStyle('reset_words', '');
                return false;
            }

            //校验通过，调用修改密码接口
            $gotoSubmit.ladda('start');
            var param = {
                "id": new Date().getTime(),
                "client": {},
                "data": {
                    "module": "user",
                    "url": "/user/manager/changePwd",
                    "param": {
                        "type": 2,
                        "userTel": login.userTel,
                        "userOldPwd": $("#login").val(),
                        "userPwd": $("#reset_words").val()
                    }
                }
            };
            $.ajax({
                url: api + '/data/getData',    //请求的url地址
                dataType: "html",   //返回格式为json
                async: false,//请求是否异步，默认为异步，这也是ajax重要特性
                data: encrypt(JSON.stringify(param),getPass()),    //参数值
                type: "POST",   //请求方式
                contentType: 'application/json;charset=UTF-8',
                beforeSend: function (request) {
                    //请求前的处理
                    request.setRequestHeader("Authorization", login.tokenId);
                    request.setRequestHeader("userTel", login.userTel);
                },
                success: function (req) {
                    req = JSON.parse(decrypt(req,getPass()));
                    $gotoSubmit.ladda('stop');
                    if (req.status === 0) {
                        //请求成功时处理
                        sweetAlert({
                            title: "信息",
                            text: "提交成功！",
                            type: "success",
                            confirmButtonColor: "#3197FA",
                            confirmButtonText: "确定",
                        }, function () {
                            $('#myModal').modal('hide');
                            //清空输入框
                            $('.login-r').val('');
                            $('.reset_login-r').val('');
                            $('.reset_words-r').val('');
                            $('#reset_login_tips').html('');
                            $('#reset_words_tips').html('');
                        });
                    } else {
                        sweetAlert({
                            title: "信息",
                            text: req.message,
                            type: 'warning',
                            confirmButtonColor: "#3197FA",
                            confirmButtonText: "确定",
                        });
                        //清空输入框
                        $('.login-r').val('');
                        $('.reset_login-r').val('');
                        $('.reset_words-r').val('');
                        $('#reset_login_tips').html('');
                        $('#reset_words_tips').html('');
                    }
                },
                complete: function () {
                    //请求完成的处理
                },
                error: function () {
                    //请求出错处理
                }
            });
        })
    });


}

$.fn.treeview = init;

function init(opt) {
    var tree = opt.data.nodes;
    var html = [];
    html.push(loadMenuList(tree));
    $('#side-menu').empty().append(html.join(''));
    //bug 2358 刷新时留着当前模块，初次登录时留着默认模块
    var sessionHistroy=sessionStorage.getItem('key');
    if(sessionHistroy==null){
        $('#side-menu').find('li:first').addClass('nav_li_back');
        $('#side-menu').find('li:first').trigger('click');
    }else {
        var $this=$("li[loadurl='"+sessionHistroy+"']");
        if($this.parent().hasClass('isParent')){
            // var parentClick=$this.parent().prev().find('a.sidebar-sub-toggle');
            var parentClick=$this.parent().parent();
            parentClick.trigger('click');
            parentClick.addClass('open');
            parentClick.css('display','block');
        }
        $this.addClass('nav_li_back');
        $this.trigger('click');
    }
    // $('#side-menu').find('li:first').addClass('nav_li_back');
    // $('#side-menu').find('li:first').trigger('click');
}

function loadMenuList(treeData) {
    treeData = treeData.sort(function (a,b) {
        return a.id-b.id
    });
    var $li = [];
    var imgList = ['&#xe60a;', '&#xe609;', '&#xe60b;', '&#xe60d;', '&#xe60c;', '&#xe608;'];
    // var imgList = ['&#xe60d;', '&#xe608;'];
    for (var i = 0; i < treeData.length; i++) {
        var node = treeData[i];
        if (node.parentId == "-1") {
            if (node.nodes) {
                $li.push('<li id="tree-' + node.id + '"  data-parent="tree-parent-' + node.parentId + '">');
                $li.push('<a class="sidebar-sub-toggle" title="' + node.name + '"><i class="iconfont" style="color: #07A5FD;">' + imgList[i] + '</i> ' + node.name + ' <span class="sidebar-collapse-icon ti-angle-down"></span></a>');
                $li.push('<ul class="isParent">');
                $li.push(loadMenuList(node.nodes));
                $li.push('</ul>');
            } else {
                $li.push('<li loadurl="' + node.url.substr(2,node.url.length) + '"  displayText="' + node.displayText + '"><a a href="javascript:void(0)" title="' + node.name + '"><i class="iconfont" style="color: #07A5FD;">' + imgList[i] + '</i> ' + node.name + '</a></li>');
            }

            $li.push('</li>');
        } else {
            $li.push('<li loadurl="' + node.url.substr(2,node.url.length) + '"  displayText="' + node.displayText + '"><a href="javascript:void(0)" title="' + node.name + '">' + node.name + '</a></li>');

        }
    }
    return $li.join('');
}

//获取高度
var middleHeight;

function middleHeight() {
    var height = $(window).height();
    middleHeight = height - 140;
    // $('#mainFrame').css({height: middleHeight});
    $('#mainFrame').attr('add-height', height);
    $('#mainFrame').attr('handle-height', middleHeight);
}

$(window).on('resize', function () {
    var height = $(window).height();
    middleHeight = height - 140;
    // $('#mainFrame').css({height: middleHeight});
    $('#mainFrame').attr('add-height', height);
    $('#mainFrame').attr('handle-height', middleHeight);
});
$(document).ready(function () {
    initMenu();
    middleHeight();

    //人员相关信息
    setAgent();

    $('#mainFrame').on('load', function (e) {
        var $pageContentIframe = $('#mainFrame');
        $pageContentIframe.contents().find('html').addClass('iframe-html');
        $pageContentIframe.contents().find('body').addClass('iframe-body');
    });
});

/**
 * 添加错误信息
 */
function addErrorStyle(itemId, msg) {
    $('#' + itemId).closest('div.form-group').addClass('has-error');
    $('#' + itemId).closest('div').append('<span class="error fa fa-exclamation-circle" title="' + msg + '"></span>');
}

/**
 * 清除错误信息
 */
function removeErrorStyle(itemId){
    $('#'+itemId).closest('div.form-group').removeClass('has-error');
    $('#'+itemId).closest('div').find('span.error').remove();
}

function checkLogin(){
    $.ajax({
        url: api+'/data/checkLogin',    //请求的url地址
        dataType: "html",   //返回格式为json
        async: true,//请求是否异步，默认为异步，这也是ajax重要特性
        type: "POST",   //请求方式
        contentType: 'application/json;charset=UTF-8',
        beforeSend: function (request) {
            //请求前的处理
            request.setRequestHeader("Authorization", login.tokenId);
            request.setRequestHeader("userTel", login.userTel);
        },
        success: function (res) {
            res = decrypt(res,getPass());
            if(res !== 'SUCCESS'){
                window.location.href = api + "/page/login.html";
            }
        }
    });

}


// 获取logo
function getImg(orgId){
  var params={
        "type":2,
        "uploadId":orgId
  }

  ajaxData('main-api','/api/file/getImg',params,function(res){

        if(res.status === 0){
            var file = res.data.data;
            var img = 'data:image/png;base64,'+file.img;

            if(file.img){
              $('#logoImg').attr('src',img);
            }

        }
  });
}


// 获取企业名称
function getApplyOrgInfo(orgId){
    var params={
          "orgId":orgId
    }
    ajaxData('user','/user/orgInfo/getApplyOrgInfo',params,function(res){
          if(res.status == 0){
              $('.logo').find('span').html(res.data.data.orgName);
              document.title = res.data.data.orgName
          }
    });
}
