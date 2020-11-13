$(function () {
    var api = getApiUrl();
    getPass();
    // 验证码登录，隐藏忘记密码，清空输入框
    $('a[href="#vCode"]').unbind().bind('click',function () {
        if(countDown) clearInterval(countDown);
        $('#send_mgs1').text('获取验证码').prop('disabled',false).css('cursor', 'pointer');
        $('.forget_pass').hide();
        $('#tel_msg,#verificationCode').val('');
    });

    // 密码登录，显示忘记密码，清空输入框
    $('a[href="#pwdCode"]').unbind().bind('click',function () {
        $('.forget_pass').show();
        $('#telphone,#password').val('');
    });

    //点击注册按钮
    $(".register").unbind().bind('click',function () {
        if(countDown) clearInterval(countDown);
        $('#send_mgs3').text('获取验证码').prop('disabled',false).css('cursor', 'pointer');
        $('#tel_msg3,#register').val('');

        $("#login_tab").hide();
        $("#register_tab1").show();

        $('#register_tab1 .tab-pane').removeClass('active');
        $('#registerWord1').addClass('active');

        //清楚登录框的手机号、验证码
        $('#tel_msg,#verificationCode,#telphone,#password').val('');
    });

    //点击忘记密码按钮
    $(".forget_pass").unbind().bind('click',function () {
        if(countDown) clearInterval(countDown);
        $('#send_mgs2').text('获取验证码').prop('disabled',false).css('cursor', 'pointer');
        $('#tel_msg2,#verificationCode1').val('');

        $("#login_tab").hide();
        $("#forget_tab1").show();

        $('#pass_myTabContent .tab-pane').removeClass('active');
        $('#passWord1_content').addClass('active');

        //清楚登录框的手机号、验证码
        $('#tel_msg,#verificationCode,#telphone,#password').val('');
    });

    // //点击忘记密码-获取验证码
    // $('#send_mgs2').off('click').on('click',function(){
    //     var tel = $('#tel_msg2').val();
    //     // if(!tel || !(/^\d{11}$/).test(tel)){
    //     //     // layer.msg('请输入合法手机号码', {icon: 2});
    //     //     return false;
    //     // }
    //     // else if(!telReg.test(tel)){
    //     //     layer.msg('手机号非移动号段，产品后续将开放其他运营商注册功能，敬请期待!', {icon: 2});
    //     //     return false;
    //     // }
    //     checkUserIsRegister(tel,function(res){
    //         if(res.data.data == 0){
    //             layer.msg('用户尚未注册!', {icon: 2});
    //             return false;
    //         }
    //         getVerificationCode('send_mgs2',3)
    //     });
    // });

    //点击忘记密码下一步按钮
    $("#forget_next").unbind().bind('click',function () {
        if($("#tel_msg2")==undefined||$("#tel_msg2")==""){
            layer.msg('手机号不能为空', {icon: 2});
        }else if($("#verificationCode1").val()==undefined||$("#verificationCode1").val()==""){
            layer.msg('验证码不能为空', {icon: 2});
        }else if ($("#tel_msg2").val().length !== 11) {//手机位数校验
            layer.msg('请检查手机号码', {icon: 2});
        }else {
            var params = {
                deviceId:'webLogin',
                userTel:$("#tel_msg2").val(),
                type:3,
                verifCode:$("#verificationCode1").val()
            };
            // 先检验验证码是否正确
            checkMsgCode(params,function () {
                $('#pass_myTabContent .tab-pane').removeClass('active');
                $('#passWord2_content').addClass('active');
            });
        }
    });

    //点击注册账户下一步按钮
    $("#register_next").unbind().bind('click',function () {
        if($("#tel_msg3").val()==undefined||$("#tel_msg3").val()==""){
            layer.msg('手机号不能为空', {icon: 2});
        }else if($("#register").val()==undefined||$("#register").val()==""){
            layer.msg('验证码不能为空', {icon: 2});
        }else if($("#tel_msg3").val().length !== 11) {//手机位数校验
            layer.msg('请检查手机号码', {icon: 2});
        }else{
            var params = {
                deviceId:'webLogin',
                userTel:$("#tel_msg3").val(),
                type:1,
                verifCode:$("#register").val()
            };

            // var params = {
            //     "id": new Date().getTime(),
            //     "client": {},
            //     "data": {
            //         "module": "user",
            //         "url": "/user/manager/userRegister",
            //         "param": {
            //             deviceId:'webLogin',
            //             userTel:$("#tel_msg3").val(),
            //             type:1,
            //             verifCode:$("#register").val()
            //         }
            //     }
            // }

            //先检验验证码是否正确
            checkMsgCode(params,function () {
                $('#register_tab1 .tab-pane').removeClass('active');
                $('#registerWord2').addClass('active');
            });
        }
    });

    $("#verificationCode,#password").keypress(function (e) {
        if (e && e.which === 13) {
            $("#login1").click();
            return false;
        }
    });

    //短信或密码登录
    $("#login1").unbind().bind('click',function () {
        var params={
            "id": "1",
            "client": {}
        };
        params.data={};
        if($("#pwdCode").hasClass('active')){
            //非空校验
            if(false){
                // layer.msg('请输入合法手机号码', {icon: 2});
            }else if($("#password").val().length === 0){
                layer.msg('密码不能为空', {icon: 2});
            }else {
                params.data.loginCode=$("#telphone").val();
                params.data.password=$("#password").val();
                login(params);
            }
        } else {
            if(false){
                // layer.msg('请输入合法手机号码', {icon: 2});
            }
            // else if(!telReg.test($("#tel_msg").val())){
            //     layer.msg('手机号非移动号段，产品后续将开放其他运营商注册功能，敬请期待!', {icon: 2});
            // }
            else if($("#verificationCode").val().length === 0){
                layer.msg('验证码不能为空', {icon: 2});
            }else {
                msgLogin();
            }
        }
    });

    //修改密码
    $("#login2").unbind().bind('click',function () {
        if($("#password3").val().length === 0){
            layer.msg('密码不能为空', {icon: 2});
        }else if($("#password2").val().length === 0){
            layer.msg('密码不能为空', {icon: 2});
        }else if($("#password3").val() != $("#password2").val()){
            layer.msg('两次输入密码不同', {icon: 2});
            $("#password2").val("");
            $("#password3").val("");
        } else if(!validPwd($("#password3").val())){
            layer.msg('密码长度8-15,且必须包含数字和字母！', {icon: 2});
            $("#password2").val("");
            $("#password3").val("");
        } else {
            var params = {
                type:1,
                userTel: $("#tel_msg2").val(),
                userPwd:$("#password3").val()
            };
            changePwd(params);
        }
    });

    //新注册用户登录
    $("#login3").unbind().bind('click',function () {
        var params={
            "id": "1",
            "client": {}
        };
        params.data={};
        //非空校验
        if($("#password4").val().length === 0){
            layer.msg('密码不能为空', {icon: 2});
        }else if($("#password5").val().length === 0){
            layer.msg('密码不能为空', {icon: 2});
        } else if($("#password4").val() != $("#password5").val()){
            layer.msg('两次输入密码不同', {icon: 2});
            $("#password4").val("");
            $("#password5").val("");
        } else if(!validPwd($("#password5").val())){
            layer.msg('密码长度8-15,且必须包含数字和字母！', {icon: 2});
            $("#password4").val("");
            $("#password5").val("");
        } else{
            params.data.userTel=$("#tel_msg3").val();
            params.data.userPwd=$("#password5").val();
            register(params);
        }

    });

    //返回登录
    $('.backToLogin').off('click').on('click',function(){
        $("#login_tab").show();
        $("#register_tab1,#forget_tab1").hide();

        if(countDown) clearInterval(countDown);
        $('#send_mgs1').text('获取验证码').prop('disabled',false).css('cursor', 'pointer');
        $('#tel_msg,#verificationCode,#telphone,#password,#password4,#password5').val('');
    });

    // 注册
    function register(params) {
        jQuery.support.cors = true;
        $.ajax({
            url: api+'/user/userRegister',    //请求的url地址
            dataType: "html",   //返回格式为json
            async: true,//请求是否异步，默认为异步，这也是ajax重要特性
            data: encrypt(JSON.stringify(params),getPass()),
            type: "POST",
            contentType: 'application/json;charset=UTF-8',
            success: function (res) {
                res = JSON.parse(decrypt(res,getPass()));
                if(res.status === 0){
                    login(params);
                }else {
                    layer.msg(res.message, {icon: 2});
                }
            }
        });
    }

    $('.showPwdIcon').off('click').on('click',function(){
        var $input = $(this).next();
        $input.attr('type',$input.attr('type') === "text" ? 'password' : 'text');
        $(this).toggleClass('glyphicon-eye-open').toggleClass('glyphicon-eye-close');
    });

    //登录
    function login(params) {
        jQuery.support.cors = true;
        $.ajax({
            url: api+'/login',    //请求的url地址
            dataType: "html",   //返回格式为json
            async: true,//请求是否异步，默认为异步，这也是ajax重要特性
            // data: encrypt(JSON.stringify(params),getPass()),
            data: JSON.stringify(params),
            type: "POST",   //请求方式
            contentType: 'application/json;charset=UTF-8',
            success: function (res) {
                console.info("api: "+api);
                // res = JSON.parse(decrypt(res,getPass()));
                res = JSON.parse(JSON.stringify(res));
                console.info("res: "+res);
                console.info("res.status: "+res.status);
                // if(res.status !== 0){
                //     layer.msg(res.message, {icon: 2});
                //     //清空密码登录输入框
                //     $('#telphone,#password').val('');
                //     return false;
                // }
                // localStorage.setItem("userId",res.data.data.userId);
                // localStorage.setItem("userTel",res.data.data.userTel);
                // localStorage.setItem("tokenId",res.data.data.tokenId);
                // window.location.href = api + "/index?userTel="+res.data.data.userTel+'&tokenId='+res.data.data.tokenId;
                console.info("api: "+api);
                window.location.href = api + "/index";
            }
        });
    }

    // 短信密码登录
    function msgLogin(){
        var params = {
            deviceId: 'webLogin',
            userTel: $("#tel_msg").val(),
            verifCode: $('#verificationCode').val(),
            type:2
        };

        // 先检验验证码是否正确
        checkMsgCode(params,function(){
            $.ajax({
                url: api+'/msgLogin',
                dataType: "html", 
                data: encrypt(JSON.stringify({data:params}),getPass()),
                type: "POST", 
                contentType: 'application/json;charset=UTF-8',
                success: function (res) {
                    res = JSON.parse(decrypt(res,getPass()));
                    if(res.status !== 0){
                        layer.msg(res.message, {icon: 2});
                        return false;
                    }
                    // window.location.href = api + "/index?userTel="+res.data.userTel+'&tokenId='+res.data.tokenId;
                    localStorage.setItem("userId",res.data.data.userId);
                    localStorage.setItem("userTel",res.data.data.userTel);
                    localStorage.setItem("tokenId",res.data.data.tokenId);
                    window.location.href = api + "/index";
                }
            });

            // postFormData("router/router","/user/manager/msgLogin",params,function(res){
            //     if(res.status !== 0){
            //         layer.msg(res.message, {icon: 2});
            //         return false;
            //     }
            //     // window.location.href = api + "/index?userTel="+res.data.userTel+'&tokenId='+res.data.tokenId;
            //     localStorage.setItem("userId",res.data.userId);
            //     localStorage.setItem("userTel",res.data.userTel);
            //     localStorage.setItem("tokenId",res.data.tokenId);
            //     window.location.href = api + "/index";
            // });
        })
    }

    // 修改密码
    function changePwd(params){
        var param={
            "id": new Date().getTime(),
            "client": {},
            "data": {
                "module": "user",
                "url": "/user/manager/changePwd",
                "param":params
            }
        };
        $.ajax({
            url: api + '/user/manager/changePwd',
            dataType: "html",   //返回格式为json
            async: true,//请求是否异步，默认为异步，这也是ajax重要特性
            data: encrypt(JSON.stringify(param),getPass()),
            type: "POST",
            contentType: 'application/json;charset=UTF-8',
            success: function (res) {
                res = JSON.parse(decrypt(res,getPass()));
                if(res.status !== 0){
                    layer.msg(res.message, {icon: 2});
                    return false;
                }
                layer.msg("密码修改成功！请重新登陆", {icon: 1});
                setTimeout(function(){
                    // window.location.reload();
                    $('.backToLogin').click();
                },2000);
            }
        });
    }

    // 检查校验码是否有效
    function checkMsgCode(params,cb){
        var param={
            "id": new Date().getTime(),
            "client": {},
            "data": {
                "module": "user",
                "url": "/user/manager/checkMsgCode",
                "param":params
            }
        };
        $.ajax({
            url: api + '/user/manager/checkMsgCode',
            dataType: "html",   //返回格式为json
            async: true,//请求是否异步，默认为异步，这也是ajax重要特性
            data: encrypt(JSON.stringify(param),getPass()),
            type: "POST",
            contentType: 'application/json;charset=UTF-8',
            success: function (res) {
                res = JSON.parse(decrypt(res,getPass()));
                if(res.status !== 0){
                    layer.msg(res.message, {icon: 2});
                    //清空验证码
                    $('#verificationCode,#register').val('');
                    return false;
                }
                cb && cb();
            }
        });
    }

    // 校验用户是否已注册
    function checkUserIsRegister(userTel,cb){
        var param={
            "id": new Date().getTime(),
            "client": {},
            "data": {
                "module": "user",
                "url": "/user/manager/regCheckUser",
                "param":{
                    "userTel":userTel
                }
            }
        };
        $.ajax({
            url: api + '/user/manager/regCheckUser',
            dataType: "html",   //返回格式为json
            async: true,//请求是否异步，默认为异步，这也是ajax重要特性
            data: encrypt(JSON.stringify(param),getPass()),
            type: "POST",
            contentType: 'application/json;charset=UTF-8',
            success: function (res) {
                res = JSON.parse(decrypt(res,getPass()));
                if(res.status !== 0){
                    layer.msg(res.message, {icon: 2});
                    return false;
                }
                cb && cb(res);
            }
        });
    }

    //ase加解密
    function encryptText() {
        var plain = document.getElementById("plain").value;
        // console.log("plain: " + plain);
        var encrypted = encrypt(plain);
        // console.log("encrypted: " + encrypted);
        document.getElementById("encrypted").value = encrypted;
    }

    function decryptText() {
        var encrypted = document.getElementById("todecrypt").value;
        // console.log("encrypted: " + encrypted);
        var decrypted = decrypt(encrypted);
        // console.log("decrypted: " + decrypted);
        document.getElementById("decrypted").value = decrypted;
    }

    // 加解密用到的密钥
    function aesKeyBytes() {
        var key_Int = new Int8Array([65, 144, 48, 53, 18, 52, 86, 120, 131, 116, 124, 139, 237, 203, 169, 135]);
        var keyBytes = int8parse(key_Int);
        return keyBytes;
    }

    // 十六进制字符串数组，个数如果不足16整数倍则补0
    function hexTo16Hex(str) {
        var diff = 16 - (str.length + 1) / 3 % 16;
        for(var i = 0; i < diff; i++) {
            str = str + " 00";
        }
        return str;
    }

    // AES加密
    // function encrypt(str) {
    //     var decArray = hexStrToDecArray(str);
    //     var wordArray = int8parse(decArray);
    //     var encrypted = CryptoJS.AES.encrypt(wordArray, aesKeyBytes(), {
    //         mode: CryptoJS.mode.ECB,
    //         padding: CryptoJS.pad.NoPadding
    //     });
    //     return wordArrayToHexStr(encrypted.ciphertext.words);
    // }
    //
    // // AES解密
    // function decrypt(str) {
    //     var decArray = hexStrToDecArray(str);
    //     var wordArray = int8parse(decArray);
    //     var base64Str = CryptoJS.enc.Base64.stringify(wordArray);
    //     var decrypted = CryptoJS.AES.decrypt(base64Str, aesKeyBytes(), {
    //         mode: CryptoJS.mode.ECB,
    //         padding: CryptoJS.pad.NoPadding
    //     });
    //     return wordArrayToHexStr(decrypted.words);
    // }

    // 构建WordArray对象
    function int8parse(u8arr) {
        var len = u8arr.length;
        var words = [];
        for (var i = 0; i < len; i++) {
            words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
        }
        return CryptoJS.lib.WordArray.create(words, len);
    }

    // 十六进制字符串(空格分割)转成十进制数字的数组
    function hexStrToDecArray(str) {
        var strArray = str.split(" ");
        var decArray = [];
        for(var i = 0; i < strArray.length; i++) {
            decArray.push(parseInt(strArray[i], 16));
        }
        return arrayTo16Array(decArray);
    }

    // 十进制数组转成十六进制字符串
    function decArrayToHexStr(array) {
        var hexStr = "";
        for(var i = 0; i < array.length; i++) {
            var str = array[i].toString(16).toUpperCase();
            if (str.length < 2) {
                str = "0" + str;
            }
            hexStr = hexStr + str + " ";
        }
        return hexStr.substr(0, hexStr.length - 1);
    }

    // word类型的十进制数组转成十六进制字符串
    function wordArrayToHexStr(array) {
        var hexStr = "";
        for(var i = 0; i < array.length; i++) {
            var num = array[i];
            if (num < 0) {
                num = array[i] + 0x100000000;
            }
            var str = num.toString(16).toUpperCase();
            var fullStr = str;
            if (str.length < 8) {
                for(var j = 0; j < 8 - str.length; j++) {
                    fullStr = "0" + fullStr;
                }
            }
            hexStr = hexStr + fullStr;
        }
        var ret = "";
        for(var i = 0; i < hexStr.length; i += 2) {
            ret = ret + hexStr.substr(i, 2) + " "
        }
        return ret.substr(0, ret.length - 1);
    }

    // 数组元素个数必须是16的整数倍，不足的在后面补0
    function arrayTo16Array(array) {
        var len = array.length;
        var distLen = parseInt((array.length - 1) / 16) * 16 + 16;
        for(var i = array.length; i < distLen; i++) {
            array[i] = 0;
        }
        return array;
    }
});

function validPwd(pwd){
    if(!pwd || pwd.length < 8 || pwd.length > 15 || !(/[A-Za-z]/.test(pwd) && /[0-9]/.test(pwd))){
        return false;
    }
    return true;
}