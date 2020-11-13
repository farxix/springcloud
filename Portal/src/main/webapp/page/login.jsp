<%--
  Created by IntelliJ IDEA.
  User: 禅永
  Date: 2020/1/15
  Time: 10:39
  To change this template use File | Settings | File Templates.
--%>
<%@ page pageEncoding="UTF-8" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>外包管理系统一期</title>
    <script src="../assets/js/lib/jquery.min.js"></script>
    <script src="../assets/js/lib/bootstrap/bootstrap.min.js"></script>
    <link rel="stylesheet" href="../assets/css/lib/bootstrap.min.css">
    <link rel="stylesheet" href="../assets/js/lib/layui/css/layui.css">
    <!--<link rel="shortcut icon" href="../assets/images/favicon.ico">-->
    <style>
        a{
            text-decoration:none;
        }
        body {
            font-family: "Microsoft YaHei UI", serif;
        }

        * {
            margin: 0;
            padding: 0;
            list-style-type: none;
        }

        a, img {
            border: 0;
        }

        input {
            width: 354px;
            height: 45px;
            padding-left: 20px;
            font-size: 14px;
            background: #FFFFFF;
            border: 1px solid #DADCE3;
            border-radius: 3px;
            border-radius: 3px;
        }

        input:focus {
            background: #FFFFFF;
            border: 1px solid #8BD4FD;
        }

        input::-webkit-input-placeholder {
            font-size: 14px;
            color: #DDDDDD;
        }
        button {
            outline: none;
            cursor: pointer;
        }
        .myTab{
            height: 78px;
            line-height: 78px;
            font-size: 16px;
            color: #999999;
            background: #FFFFFF;
            margin-bottom: 46px;
            border-top-right-radius: 4px;
            border-top-left-radius: 4px;
            border-bottom: 1px solid #DADCE2;
        }
        .myTab>li{
            height: 78px;
            line-height: 78px;
            margin: 0 auto;
            text-align: center;
        }
        .myTab>li.active{
            border-bottom: 3px solid #07A5FD;
        }
        .myTab>li>a {
            border-radius: 0;
            background-color: #FFFFFF;
            text-align: center;
            font-size: 16px;
            color: #999999;
            text-decoration:none !important;
        }
        .myTab>li.active>a{
            color: white;
            color: #4F9FFF;
            text-decoration:none !important;
        }
        button.click_btn{
            width:354px;
            height:45px;
            background: #4F9FFF;
            border-radius: 3px;
            border-radius: 3px;
            font-size: 16px;
            color: #FFFFFF;
        }
        span.register,span.clone,span.forget_pass,span.backToLogin{
            font-size: 14px;
            color: #4F9FFF;
            cursor: pointer;
        }
        span.clone,span.forget_pass{
            margin-right: 15px;
        }
        button.send_mgs{
            font-size: 14px;
            width: 115px;
            height: 44px;
            cursor: pointer;
            padding: 0px 0px 0px 0;
            border: 0px;
            border-top: 1px solid #DADCE3;
            border-left: 1px solid #DADCE3;
            border-top-right-radius: 3px;
            border-bottom-right-radius: 3px;
            color: #00a2fd;
            position: absolute;
            right: 1px;
            top:0;
        }
        .glyphicon{
            width:22px;
            height:22px;
            position: absolute;
            right: 15px;top:15px;
            color: #DDDDDD;
        }

        .showPwdIcon{
            cursor: pointer;
        }
    </style>
</head>
<body data-data="root" style="background-image:url('../assets/images/omp_login.png')">
<div style="width: 422px;height: 383px;position: fixed;top:30%;right: 15%;background: #FFFFFF;box-shadow: 0 0 15px 0 rgba(38,142,200,0.60);border-radius: 8px;">
    <!--登陆-->
    <div style="padding:0 34px 40px 34px;" id="login_tab">
        <ul id="myTab" class="myTab">
            <li class="active col-md-6 col-xs-6"><a href="#vCode" data-toggle="tab" onclick="$('.forget_pass').hide()">验证码登录</a></li>
            <li class="col-md-6 col-xs-6"><a href="#pwdCode" data-toggle="tab" onclick="$('.forget_pass').show()">密码登录</a></li>

        </ul>
        <div id="myTabContent" class="tab-content">
            <div class="tab-pane fade" id="pwdCode">
                <div class="item">
                    <input id="telphone" type="text" placeholder="请输入手机号" autocomplete="off" maxlength="11">
                </div>
                <div class="item" style="margin-top: 20px;">
                    <input id="password" type="password" placeholder="请输入密码" autocomplete="off" maxlength="15">
                </div>
            </div>
            <div class="tab-pane fade in active" id="vCode">
                <div class="item" style="position: relative;">
                    <input type="text" id="tel_msg" placeholder="请输入手机号" autocomplete="off" maxlength="11">
                    <button class="send_mgs" id="send_mgs1" onclick="getVerificationCode('send_mgs1',2)">获取验证码</button>
                </div>
                <div class="item" style="margin-top: 20px;">
                    <input type="text" placeholder="请输入验证码" id="verificationCode" autocomplete="off" maxlength="4">
                </div>
            </div>
        </div>
        <div style="margin-top: 20px; text-align: center">
            <button class="click_btn" id="login1">
                登录
            </button>
        </div>
        <div style="text-align: right;margin-top: 19px;">
            <span class="forget_pass" style="padding-right: 20px;border-right: 2px solid #b9b6ff;display: none">忘记密码</span>
            <span class="register">注册</span>&nbsp;
        </div>
    </div>

    <!--忘记密码-->
    <div style="padding:0 34px 40px 34px;display: none;" id="forget_tab1">
        <ul class="myTab">
            <li class="col-md-12"><a>忘记密码</a></li>
        </ul>
        <div id="pass_myTabContent" class="tab-content">
            <div class="tab-pane fade in active" id="passWord1_content">
                <div class="item" style="position: relative;">
                    <input type="text" id="tel_msg2" placeholder="请输入手机号" maxlength="11">
                    <button class="send_mgs" id="send_mgs2">获取验证码</button>
                </div>
                <div class="item" style="margin-top: 20px;">
                    <input type="text" placeholder="请输入验证码" id="verificationCode1" maxlength="4">
                </div>
                <div style="margin-top: 20px;text-align: center">
                    <button id="forget_next" class="click_btn">
                        下一步
                    </button>
                </div>
            </div>
            <div class="tab-pane fade in" id="passWord2_content">
                <div class="item" style="width: 354px;position: relative;">
                    <i class="glyphicon glyphicon-eye-close showPwdIcon"></i>
                    <input id="password2" type="password" placeholder="登录密码(8～15位密码，需包含字母和数字)" maxlength="15">
                </div>
                <div class="item" style="margin-top: 20px;width: 354px;position: relative;">
                    <i class="glyphicon glyphicon-eye-close showPwdIcon"></i>
                    <input id="password3"  type="password" placeholder="请再次输入登录密码" maxlength="15">
                </div>
                <div style="margin-top: 20px; text-align: center">
                    <button class="click_btn" id="login2">重置密码</button>
                </div>
            </div>
            <div style="text-align: right;margin-top: 19px;">
                <span class="backToLogin">返回登录</span>&nbsp;
            </div>
        </div>
    </div>

    <!--注册-->
    <div style="padding:0 34px 40px 34px;display: none;" id="register_tab1">
        <ul  class="myTab">
            <li class="col-md-12"><a>注册账户</a></li>
        </ul>
        <div id="register_myTabContent" class="tab-content">
            <div class="tab-pane fade in active" id="registerWord1">
                <div class="item" style="position: relative;">
                    <input type="text" id="tel_msg3" placeholder="请输入手机号" autocomplete="off" maxlength="11">
                    <button class="send_mgs" id="send_mgs3" onclick="getVerificationCode('send_mgs3',1)">获取验证码</button>
                </div>
                <div class="item" style="margin-top: 20px;">
                    <input type="text" placeholder="请输入验证码" id="register" autocomplete="off" maxlength="4">
                </div>
                <div style="margin-top: 20px;text-align: center">
                    <button id="register_next" class="click_btn">
                        下一步
                    </button>
                </div>
            </div>
            <div class="tab-pane fade in" id="registerWord2">
                <div class="item" style="width: 354px;position: relative;">
                    <i class="glyphicon glyphicon-eye-close showPwdIcon"></i>
                    <input id="password4" type="password" placeholder="登录密码(8～15位密码，需包含字母和数字)" autocomplete="off" maxlength="15">
                </div>
                <div class="item" style="margin-top: 20px;width: 354px;position: relative;">
                    <i class="glyphicon glyphicon-eye-close showPwdIcon"></i>
                    <input id="password5"  type="password" placeholder="请再次输入登录密码" autocomplete="off" maxlength="15">
                </div>
                <div style="margin-top: 20px; text-align: center">
                    <button class="click_btn"  id="login3">完成注册</button>
                </div>
            </div>
        </div>
        <div style="text-align: right;margin-top: 19px;">
            <span class="backToLogin">返回登录</span>&nbsp;
        </div>
    </div>
</div>

<script src="../assets/js/lib/jquery.min.js"></script>
<script src="../assets/js/apiConfig.js"></script>
<script src="../assets/js/lib/CryptoJS/rollups/aes.js"></script>
<script src="../assets/js/lib/CryptoJS/components/mode-ecb.js"></script>
<script src="../assets/js/lib/CryptoJS/components/pad-nopadding.js"></script>
<script src="../assets/js/lib/layui/layui.all.js"></script>
<script src="../assets/js/login.js"></script>
<script type="text/javascript">

    var countDown = null;
    // 移动号段校验
    var telReg = /(1(3[4-9]|4[7]|5[0-27-9]|7[8]|8[2-478]|9[8])\d{8})|(^1705\d{7})/;

    /**
     * 获取验证码
     * @param id         按钮id
     * @param type       1-注册，2-登录，默认登录
     * @returns {boolean}
     */
    function getVerificationCode(id,type) {
        $('#' + id).parent().next().find('input').val('');
        var tel = $('#' + id).prev().val();
        if(!tel || !(/^\d{11}$/).test(tel)){
            layer.msg('请输入合法手机号码', {icon: 2});
            return false;
        }
        // else if(!telReg.test(tel)){
        //     layer.msg('手机号非移动号段，产品后续将开放其他运营商注册功能，敬请期待!', {icon: 2});
        //     return false;
        // }
        var params = {userTel:tel,type:type || 2};
        postFormData("router/router","/user/manager/sendMsgCode",params,function(res){
            if(res.status !== 0){
                layer.msg(res.message, {icon: 2});
                return false;
            }
            layer.msg('短信验证码已发送，请注意查收！', {icon: 1});
            $('#' + id).parent().next().find('input').val(res.data);
            var count = 60;
            var $codeFlag = $('#'+id);
            if(countDown) clearInterval(countDown);
            countDown = setInterval(function(){
                if (count === 0) {
                    $codeFlag.prop('disabled', false);
                    $codeFlag.css('cursor', 'pointer');
                    $codeFlag.text('重新发送');
                    clearInterval(countDown);
                } else {
                    $codeFlag.prop('disabled', true);
                    $codeFlag.css('cursor', 'not-allowed');
                    $codeFlag.text(count + '秒后重发');
                }
                count--;
            }, 1000);
        });


    }

</script>

</body>

</html>
