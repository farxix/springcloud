/**
 * Created by apple on 17/10/12.
 */

function getRootPath () {
    var curWwwPath = window.document.location.href;
    var pathName = window.document.location.pathname;
    var pos = curWwwPath.indexOf(pathName);
    var localhostPaht = curWwwPath.substring(0, pos);
    var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);

    return (localhostPaht + projectName);
}

//基础路径
var apiUrl = getRootPath();
//旧地址，不用管
var oldWebUrl = "http://10.1.192.175/itsm3";

(function(root, factory1,factory2){
    root.getApiUrl = factory1();
    root.getOldWebUrl = factory2();
    if (typeof define === 'function' && define.amd) {
        define(function(){
            return {
                getApiUrl:root.getApiUrl,
                getOldWebUrl :root.getOldWebUrl
            }
        });
    }
})(window, function () {
    function getApiUrl() {
        return apiUrl;
    }
    return getApiUrl;
},function(){
    function getOldWebUrl() {
        return oldWebUrl;
    }
    return getOldWebUrl;
});

/**
 * list 结构转树形结构
 * @param sNodes         原始数据
 * @param key            主键字段
 * @param parentKey      父主键字段
 * @param childKey       子集字段
 * @returns {[]|Array|*[]}
 */
function simpleDataTypeToNormalDataType(sNodes, key, parentKey, childKey) {
    var i, l,
        key = key || 'index',
        parentKey = parentKey || 'pIndex',
        childKey = childKey || 'children';
    if (!key || key == "" || !sNodes) return [];

    if (Array.isArray(sNodes) && sNodes.length) {
        var r = [];
        var tmpMap = {};
        for (i = 0, l = sNodes.length; i < l; i++) {
            tmpMap[sNodes[i][key]] = sNodes[i];
        }
        for (i = 0, l = sNodes.length; i < l; i++) {
            if (tmpMap[sNodes[i][parentKey]] && sNodes[i][key] != sNodes[i][parentKey]) {
                if (!tmpMap[sNodes[i][parentKey]][childKey])
                    tmpMap[sNodes[i][parentKey]][childKey] = [];
                tmpMap[sNodes[i][parentKey]][childKey].push(sNodes[i]);
            } else {
                r.push(sNodes[i]);
            }
        }
        return r;
    } else {
        return [sNodes];
    }
}


/**
 * @description 表格数据导出为excel
 * @param headers 表头
 * @param data 表格数据
 * @param fileName 文件名称
 * @param sheetName 表格sheet名
 * */
function exportExcel(headers, data, fileName, sheetName) {
    var params = {data: data, headers: headers, fileName: fileName, sheetName: sheetName};
    var exportUrl = getApiUrl() + "/common/excel/export";
    postForFile(exportUrl,params,fileName);
}

function postForFile(url,params,fileName){
    var login = {userTel:localStorage.getItem("userTel"),tokenId:localStorage.getItem("tokenId")};
    var xhr = new XMLHttpRequest();
    xhr.open('post', url, true);
    xhr.responseType = "blob";
    xhr.setRequestHeader("Content-Type","application/json");
    xhr.setRequestHeader("userTel",login.userTel);
    xhr.setRequestHeader("Authorization",login.tokenId);
    xhr.onload = function () {
        // 请求完成
        if (this.status === 200) {
            downloadFile(this.response,fileName)
        }else{
            if(typeof sweetAlert === "function"){
                sweetAlert({
                    title: "提示",
                    text: "文件下载失败,请检查后台日志",
                    type: 'warning',
                    confirmButtonColor: "#3197FA",
                    confirmButtonText: "确定"
                });
            }
        }
    };
    xhr.send(JSON.stringify(params));
    // xhr.send(encrypt(JSON.stringify(params),getPass()));
}

// function getUrlParam(name) {
//     var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
//     var r = window.location.search.substr(1).match(reg); //匹配目标参数
//     if (r != null) return unescape(r[2]);
//     return null; //返回参数值
// }
function getUrlParam(name) {
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

function ajaxData(module,url,params,cb){
    params = Object.assign({},params);
    var login = {userTel:localStorage.getItem("userTel"),tokenId:localStorage.getItem("tokenId")};
    var param={
        "id": new Date().getTime(),
        "client": {},
        "data": {
            "module": module,
            "url": url,
            "param":params
        }
    };
    if(params.page){
        param.page = params.page;
    }
    delete params.page;
    $.ajax({
        url: getApiUrl()  + "/data/getData",    //请求的url地址
        dataType: "html",   //返回格式为json
        async: true,//请求是否异步，默认为异步，这也是ajax重要特性
        // data: JSON.stringify(param),    //参数值
        data: encrypt(JSON.stringify(param),getPass()),    //参数值
        type: "POST",   //请求方式
        contentType: 'application/json;charset=UTF-8',
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", login.tokenId);
            request.setRequestHeader("userTel", login.userTel);
        },
        success: function (res) {
            res = JSON.parse(decrypt(res,getPass()));
            console.log(url,res);
            cb && cb(res);
        }
    });
}

function postFormData(module,url,params,cb){
    var param={
        "id": new Date().getTime(),
        "client": {},
        "data": {
            "module": module,
            "url": url,
            "param":params
        }
    };
    $.ajax({
        url: getApiUrl() + "/data/postForm", 
        dataType: "html", 
        async: true,
        data: encrypt(JSON.stringify(param),getPass()),
        type: "POST",
        contentType: 'application/json;charset=UTF-8',
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", localStorage.getItem("tokenId"));
            request.setRequestHeader("userTel", localStorage.getItem("userTel"));
            request.setRequestHeader("userId", localStorage.getItem("userId"));
        },
        success: function (res) {
            res = JSON.parse(decrypt(res,getPass()));
            cb && cb(res);
        }
    });
}

function downloadFile(data, fileName) {
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(data, fileName);
    } else {
        var a = document.createElement('a');
        var url = URL.createObjectURL(data);
        a.href = url;
        a.download = fileName;
        if (navigator.userAgent.indexOf("Firefox") > 0) {
            var evt = document.createEvent("MouseEvents");
            evt.initEvent("click", true, true);
            a.dispatchEvent(evt);
        } else a.click();
        URL.revokeObjectURL(url);
    }
}
/*****************************************************
 * AES加密
 * @param content 加密内容
 * @param key 加密密码，由字母或数字组成
 　　　　　　此方法使用AES-128-ECB加密模式，key需要为16位
 　　　　　　加密解密key必须相同，如：abcd1234abcd1234
 * @return 加密密文
 ****************************************************/

function encrypt(content, key){
    var sKey = CryptoJS.enc.Utf8.parse(key);
    var sContent = CryptoJS.enc.Utf8.parse(content);
    var encrypted = CryptoJS.AES.encrypt(sContent, sKey, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
    return encrypted.toString();
}

/*****************************************************
 * AES解密
 * @param content 加密密文
 * @param key 加密密码，由字母或数字组成
 　　　　　　此方法使用AES-128-ECB加密模式，key需要为16位
 　　　　　　加密解密key必须相同，如：abcd1234abcd1234
 * @return 解密明文
 ****************************************************/

function decrypt(content, key){
    var sKey = CryptoJS.enc.Utf8.parse(key);
    var decrypt = CryptoJS.AES.decrypt(content, sKey, {mode:CryptoJS.mode.ECB,padding: CryptoJS.pad.Pkcs7});
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}

function aesKeyBytes() {
    var key_Int = new Int8Array([65, 144, 48, 53, 18, 52, 86, 120, 131, 116, 124, 139, 237, 203, 169, 135]);
    return int8parse(key_Int);
}

// 构建WordArray对象
function int8parse(u8arr) {
    var len = u8arr.length;
    var words = [];
    for (var i = 0; i < len; i++) {
        words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
    }
    return CryptoJS.lib.WordArray.create(words, len);
}

//获取密钥
function getPass() {
    var encryptKey = null;
    $.ajax({
        url: getApiUrl()  + "/data/getEncryptKey",    //请求的url地址
        dataType: "html",   //返回格式为json
        async: false,//请求是否异步，默认为异步，这也是ajax重要特性
        // data: JSON.stringify(param),    //参数值
        type: "POST",   //请求方式
        contentType: 'application/json;charset=UTF-8',
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", localStorage.getItem("tokenId"));
            request.setRequestHeader("userTel", localStorage.getItem("userTel"));
            request.setRequestHeader("userId", localStorage.getItem("userId"));
        },
        success: function(res){
            encryptKey = res;
        }
    });
    return encryptKey;
}

/**
 * 检查企业图标文件是否合法，若合法则返回转化过后的byte[]
 * @param file  待检查文件
 * @param cb    callback
 * 响应示例:(status：0-成功，其他-失败)
 *     失败：{"status":1,"message":"失败原因","success":false,"data":null}
 *     成功：{"status":0,"message":"success","success":true,"data":"转化后的bytes[]"}
 */
function checkLogoFile(file, cb) {
    var formFile = new FormData();
    formFile.append("file", file);

    $.ajax({
        url: getApiUrl() + "/logo/check",
        type: 'POST',
        cache: false,
        data: formFile,
        processData: false,
        contentType: false,
        dataType: "json",
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", localStorage.getItem("tokenId"));
            request.setRequestHeader("userTel", localStorage.getItem("userTel"));
            request.setRequestHeader("userId", localStorage.getItem("userId"));
        },
        success: function (res) {
            cb && cb(res);
        }
    });
}

/**
 * 获取当前登录用户信息
 * 响应示例：
 * {
 *     "status":0,
 *     "message":"success",
 *     "total":null,
 *     "success":true,
 *     "data":{
 *         "userId":"b0a7b018617a4c18b940e3f576f2350f",
 *         "userEmail":"139@163.com",
 *         "userTel":"13988811111",
 *         "userName":"bbc总",
 *         "userOrgId":"9f3ff336f6f84bc582a5a5d830192ac7",
 *         "orgUserId":"b0a7b018617a4c18b940e3f576f2350f",
 *         "tokenId":"264353c9-eaa7-450f-87f1-465935154c77"
 *     }
 * }
 * @param cb callback
 */
function getUserInfo(cb){
    $.ajax({
        url: getApiUrl()  + "/user/info",
        beforeSend: function (request) {
            request.setRequestHeader("Authorization", login.tokenId);
            request.setRequestHeader("userTel", login.userTel);
        },
        success: function (res) {
            res = JSON.parse(decrypt(res,getPass()));
            cb && cb(res);
        }
    });
}