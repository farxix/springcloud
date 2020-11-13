(function (root, factory) {
    "use strict";
    // AMD module is defined
    if (typeof define === "function" && define.amd) {
        define(['jquery'],function ($) {
            return {
                FormValidate: factory(root.jQuery)
            }
        });
    }else{
        root.FormValidate = new factory(root.jQuery);
    }

}(this, function ($) {
    function FormValidate() {

    }
    FormValidate.prototype = {
        validate:function (form, validateItems) {
        var list = $('input, textarea, select, div', form);
        var flag=true;
        $(list).each(function (index, item) {

            var validateItem = validateItems[item.id];
            if (!validateItem) {
                return;
            }
            var value = getValue(item);
            var msg = '';

            if (isRequired(validateItem) || value) {
                msg = doValidateItem(validateItem, value);
            }

            if (msg && flag) {
                flag = false;
            }
            if (validateItem.handler) {
                validateItem.handler(item, !msg, msg);
            }
            else {
                var itemId = $(item)[0].id;
                if (msg) {
                    addErrorStyle(itemId,msg);
                } else {
                    removeErrorStyle(itemId);
                }

            }
        });
        return flag;
        },
        validateForOnly:function (validateItems) {
        for(var _itemId in validateItems){
            (function(itemId){

                $('#'+itemId).unbind().bind('change',function(){
                    var validateItem = validateItems[itemId];
                    if (!validateItem) {
                        return;
                    }
                    var value = getValue($('#'+itemId)[0]);
                    var msg = '';

                    if (isRequired(validateItem) || value) {
                        msg = doValidateItem(validateItem, value);
                    }
                    if(msg){
                        addErrorStyle(itemId,msg);
                    }else{
                        removeErrorStyle(itemId);
                    }
                })
            })(_itemId);
        }
        },
        removeErrorStyle:removeErrorStyle
    };



    function isItemSelect(item) {
        var isSelect = item.nodeName.toLowerCase() == 'select';
        return isSelect;
    }

    function isItemCascaderSelect(item) {
        var isCascaderSelect = $(item).children("button[type=\"button\"]").hasClass('cascader-selecter-btn');
        return isCascaderSelect;
    }

    function isItemSimilarSelect(item) {
        var isSimilarSelect = $(item).attr("role")== 'combobox';
        return isSimilarSelect;
    }

    function getValue(item) {
        var value = '';
        var isSelect = isItemSelect(item);
        var isSimilarSelect = isItemSimilarSelect(item);
        var isCascaderSelect = isItemCascaderSelect(item);


        if (!isSelect && !isSimilarSelect) {
            if(isCascaderSelect){
                if($(item).children("button[type=\"button\"]").find('.cascader-selecter-title').text()=="请选择..."){
                    value = '';
                }else{
                    value= $(item).children("button[type=\"button\"]").find('.cascader-selecter-title').text();
                }
            }else{
                value = $(item).val();
            }
        } else if(isSimilarSelect){
            value = $(item).val();
            if($(item).val() == "请选择..."){
                value = '';
            }
        } else if(isCascaderSelect){
            if($(item).children('.cascader-selecter-title').text()=="请选择..."){
                value = '';
            }

        } else {
            if (!$(item).val()) {
                value = '';
            }
            else {
                value = $(item).val();
                if(typeof value == "object"){
                    value = value.join(",")
                }
                //过滤‘请选择...’
                if (typeof(value) != undefined
                    && ('请选择...'==value || ''==value)) {
                    value='';
                }
            }
        }

        return value;
    }

    function doValidateItem(validateItem, value) {
        var msg = '';
        if (!(value.replace(/(^\s*)|(\s*$)/g, ""))) {
            msg = validateItem.name + '不能为空！';
        }
        if (validateItem.name === '数据源' || validateItem.name === '数据范围') {
            if (validateItem.name === '数据源') {
                if (value != "所有" && value != "当前" && value != "历史") {
                    if (!msg && validateItem.integer && !/^\d+$/.test(value)) {
                        msg = validateItem.name + '必须为大于等于0的整数';
                    }
                }
            }
            if (validateItem.name === '数据范围') {
                if (value != "当天" && value != "昨天" && value != "本周" && value != "上周" && value != "本月" && value != "上月") {
                    if (!msg && validateItem.integer && !/^\d+$/.test(value)) {
                        msg = validateItem.name + '必须为大于等于0的整数';
                    }
                }
            }
        } else {
            if (!msg && validateItem.integer && !/^\d+$/.test(value)) {
                msg = validateItem.name + '必须为大于等于0的整数';
            }
            if (!msg && validateItem.positiveInteger && !/^[1-9]\d*$/.test(value)) {
                msg = validateItem.name + '必须为大于0的整数';
            }
            if (!msg && validateItem.number && !/^(-?\d+)(\.\d+)?$/.test(value)) {
                msg = validateItem.name + '必须为合理的数字';
            }
            if(!msg && validateItem.floatNumber && !/^(([1-9]{1}\d*)|([0]{1}))(\.(\d){0,1})?$/.test(value)){
                    msg = validateItem.name + '必须为合理的数字,且小数最多精确到1位';
            }
            if (!msg && validateItem.maxNum && validateItem.dot) {
                msg = validateNum(value, validateItem.maxNum, validateItem.dot);
            }
            if(!msg && validateItem.minLength && validateItem.maxLength){
                msg = validateLength(value, validateItem.minLength, validateItem.maxLength);
            }
            if (!msg && validateItem.ip && !/^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(value)) {
                msg = 'IP格式错误';
            }
            if (!msg && validateItem.date && !/^\d{4}-(0?\d|1[012])-(0?\d|[12]\d|3[01])?/.test(value)) {
                msg = '日期格式错误';
            }
            if (!msg && validateItem.tel && !/^0?1[34578][0-9]{9}$/.test(value)) {
                msg = '手机号格式错误';
            }
            if (!msg && validateItem.mail && !/^[a-zA-Z0-9_\-]+(\.[_a-zA-Z0-9\-]+)*@([_a-zA-Z0-9\-]+\.)+([a-zA-Z]{2,4})$/.test(value)) {
                msg = '邮箱格式错误';
            }
            if (!msg && validateItem.regexp && !validateItem.regexp.test(value)) {
                msg = validateItem.name + '格式错误';
            }

            if (!msg && validateItem.validate) {
                msg = validateItem.validate(value);
            }

        }
        return msg;

    }

    /**
     * 检查数字格式:
     * limitNum:最多数字
     * dot:小数位
     */
    function validateNum(num,limitNum,dot){
        var msg = "";
        if(!isNaN(num) && num>=0 && num<=limitNum){
            var intdot = num.indexOf(".");
            if(intdot != -1){
                var dotCnt = num.substring(intdot+1,num.length);
                if(dotCnt.length > 2){
                    msg="小数位不能超过两位！";
                }
            }
        }else{
            msg = "请选择0到"+limitNum+"之间的数字！";
        }
        return msg;
    }

    /**
     * 字符串长度做限制
     */
    function validateLength(val,min,max) {
        var msg = "";
        if(val.length<min){
            msg="长度必须大于"+min+',小于'+max;
        }else if(val.length>max){
            msg="长度必须大于"+min+',小于'+max;
        }
        return msg;
    }

    function isRequired(validateItem) {
        if(validateItem.required) {
            return true;
        }

        if (validateItem.requiredPreCondition) {
            var requiredPreCondition = getValue($('#'+validateItem.requiredPreCondition)[0]);
            if (requiredPreCondition) {
                return true;
            }
        }

        return false;
    }
    /**
     * 添加错误信息
     */
    function addErrorStyle(itemId,msg) {
         removeErrorStyle(itemId);
         $('#'+itemId).closest('div.form-group').addClass('has-error');
         // $('#'+itemId).closest('div').append('<span class="error fa fa-exclamation-circle" title="'+msg+'"></span>');
         $('#'+itemId).closest('div').append('<span class="error fa fa-exclamation-circle" title="">'+msg+'</span>');
    }
    /**
     * 清除错误信息
     */
    function removeErrorStyle(itemId){
        $('#'+itemId).closest('div.form-group').removeClass('has-error');
        $('#'+itemId).closest('div').find('span.error').remove();
    }

    return FormValidate;
}));
