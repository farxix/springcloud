// define(['jquery','bootstrap-show-password','bootstrap-dialog','bootstrap-table','bootstrap-table-zh','bootstrap-treeview','treegrid','jqueryTmpl'],function($, bootstrap, BootstrapDialog){
define(['jquery','bootstrap-dialog','bootstrap-table','bootstrap-table-zh','bootstrap-treeview','treegrid','jqueryTmpl'],function($, bootstrap, BootstrapDialog){
    if(!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g,'');
        };
    }

    /**
     * 通用组件
     * @author zhangzx6@asainfo.com
     */

    var Com = new Common();

    /**
     * 通用方法
     * @returns {Common}
     */
    function Common() {
        var that = this;

        /**
         * 表单验证常用方法
         */
        that.isNumber = function (val) {
            var reg = /^[\d|\.|,]+$/;
            return reg.test(val);
        };
        that.isInt = function (val) {
            if (val === "") {
                return false;
            }
            var reg = /\D+/;
            return !reg.test(val);
        };
        that.isEmail = function (email) {
            var reg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            return reg.test(email);
        };
        that.isMobile = function (mobile) {
            var reg = /1[34578]{1}\d{9}$/;
            return reg.test(mobile);
        };
        that.isTel = function (tel) {
            var reg = /^\d{3}-\d{8}|\d{4}-\d{7}$/; //只允许使用数字-空格等
            return reg.test(tel);
        };
        that.isJson = function (obj) { //是否是json
            var isjson = obj && typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]";
            return isjson;
        };
        /**
         * 数组判断
         * @param data
         * @returns {boolean}
         */
        that.isArray = function (data) {
            return (data && Array.isArray(data) && data.length && JSON.stringify(data) != '[]');
        };
        /* 数组最大值*/
        that.arrMax = function (array) {
            return Math.max.apply(Math, array);
        };
        /* 数组最小值 */
        that.arrMin = function (array) {
            return Math.min.apply(Math, array);
        };
        /* 数组求和 */
        that.arrSum = function (array) {
            var sum = 0,
                num;
            for (var i = 0; i < array.length; i++) {
                num = parseInt(array[i]) || 0;
                sum += num;
            }
            return sum;
        };
        that.isIP = function(ip){
            var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
            return reg.test(ip);
        };

        /**
         * Ajax请求数据
         *
         * url：接口路径
         * callback：接口请求回调函数,参数(result, url, dataJson);
         * dataJson：传参数据，post方法时用
         * type：请求方式类型，默认get方式请求
         * async：请求类型，默认异步请求
         * dataType：返回数据类型，默认为json
         * flag: 是否返回接口报错信息，默认false不返回
         * contentType: 请求类型，默认表单请求
         **/
        that.ajaxData = function (url, type, params, callback, $btn, dataType, flag, contentType, loading) {

            params = params || '';
            type = type || 'GET';
            dataType = dataType || 'json';
            flag = flag || false;
            contentType = contentType || "application/x-www-form-urlencoded";
            loading = loading === false ? false : true;

            //防止xss攻击
            if (params) {
                for (var i in params) {
                    params[i] = Com.xss(params[i]);
                }
            }

            if (loading) Com.loading();
            if($btn) $btn.prop('disabled','disabled');
            $.ajax({
                url: url,
                data: contentType.indexOf('json') > 0 ? JSON.stringify(params) : params,
                dataType: dataType,
                type: type,
                async: true,
                cache: false,
                contentType: contentType,
                success: function (result) {
                    that.unloading();
                    if($btn) $btn.prop('disabled','');
                    if(typeof callback === 'function') callback(result, url, params);
                },
                error: function (e) {
                    that.unloading();
                    if($btn) $btn.prop('disabled','');
                    if (flag) {
                        if(typeof callback === 'function') callback('error', url, params);
                        Com.tips('error!', '请求失败！', 'error');
                        console.log(e);
                    }
                },
                complete:function(e){
                    if(Com.isNotBlank(e.responseText) && e.responseText.indexOf('__login_page__') !== -1){
                        Com.LoginTimeout();
                    }
                }
            });
        };

        that.LoginTimeout = function(){
            if(typeof SimpleDialog === 'function'){
                new SimpleDialog({
                    showHeader: false,
                    width: '350px',
                    onhide:function(){
                        window.top.location.href = Com.getRootPath();
                    },
                    message: function (dialog) {
                        return '<div style="text-align: center;">' +
                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                            '<span class="svg svg-failed svg-5xl" style="width: 60px;height: 60px"></span><br>' +
                            '<span class="confirms-dialog-message" style="font-size:12px;color: #687178;">登录超时！</span><br>' +
                            '<button class="btn-in-dialog" type="button" data-dismiss="modal">确认</button>' +
                            '</div>';
                    }
                }).open();
            }else {
                alert('登录超时!');
                window.top.location.href = Com.getRootPath();
            }
        };

        that.unloading = function () {
            $(parent.document).find('.loading-flash').hide();
            // {top: '-100px'}, 'fast', function () {
            //     $(this).hide()
            // }
        };

        that.loading = function () {
            $(parent.document).find('.loading-flash').show();//.animate({top: '60px'}, 'fast')
        };

        /**
         * 多个ajax请求，请求成功够返回数据(最多支持5个)，全部成功后才返回数据(数据顺序一一对应)
         * jsonArr: ajax请求的json数组[{url:url,dataType:"json"},{url:url,dataType:"json"}]
         * dataType: 类型要传否则容易报错（格式错误后也会成功返回）
         * callback：接口请求回调函数
         * flag: 是否返回接口报错信息，默认false不返回
         **/
        that.whenData = function (jsonArr, callback, flag) {
            flag = flag || false;
            var len = jsonArr.length;
            switch (len) {
                case 2:
                    $.when($.ajax(jsonArr[0]), $.ajax(jsonArr[1])).done(function (data1, data2) {
                        callback(data1[0], data2[0]);
                    }).fail(function () {
                        fnerror();
                    });
                    break;
                case 3:
                    $.when($.ajax(jsonArr[0]), $.ajax(jsonArr[1]), $.ajax(jsonArr[2])).done(function (data1, data2, data3) {
                        callback(data1[0], data2[0], data3[0]);
                    }).fail(function () {
                        fnerror();
                    });
                    break;
                case 4:
                    $.when($.ajax(jsonArr[0]), $.ajax(jsonArr[1]), $.ajax(jsonArr[2]), $.ajax(jsonArr[3])).done(function (data1, data2, data3, data4) {
                        callback(data1[0], data2[0], data3[0], data4[0]);
                    }).fail(function () {
                        fnerror();
                    });
                    break;
                case 5:
                    $.when($.ajax(jsonArr[0]), $.ajax(jsonArr[1]), $.ajax(jsonArr[2]), $.ajax(jsonArr[3]), $.ajax(jsonArr[4])).done(function (data1, data2, data3, data4, data5) {
                        callback(data1[0], data2[0], data3[0], data4[0], data5[0]);
                    }).fail(function () {
                        fnerror();
                    });
                    break;
            }

            function fnerror() {
                if (flag) {
                    callback('error');
                    Com.tips('error!', '请求失败！', 'glyphicon glyphicon-remove-circle');
                }
            }

        };

        /**
         * title: 对javascript、html标签实体转义
         * data:数据源字符串
         **/
        that.xss = function (data) { //防止<script  type="text/javascript">与html标签执行
            if (Com.isEmpty(data) || typeof(data) != "string") {
                return data;
            }
            var reg = /<[A-Za-z]+>/g,
                str = data.toLowerCase().replace(/\s+|\//g, '');
            if (str.indexOf('<#if') != -1 || str.indexOf('<graph') != -1) { //sql代码、拓扑图
                data = data.replace(/<script/ig, '&lt;script');
                return data;
            }
            if (str.indexOf('<script') != -1 || reg.test(str) || str.indexOf('onload') != -1 || str.indexOf('src=') != -1) {
                data = data.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            }
            return data;
        };

        /*数据是否为空*/
        that.isEmpty = function (data) {
            if ($) {
                var data2 = $.trim(data);
            }
            if (Com.isArray(data) && data.length == 0) {
                return true;
            } else if (Com.isJson(data) && isEmptyObject(data)) {
                return true;
            } else if (!data2 && data2 !== 0) {
                return true;
            } else {
                return false;
            }

            //json是否空对象
            function isEmptyObject(obj) {
                for (var n in obj) {
                    return false;
                }
                return true;
            }
        };

        that.isBlank = function (obj) {
            return !that.isNotBlank(obj);
        };

        that.isNotBlank = function (obj) {
            return (obj && obj.toString().trim().length > 0);
        };

        var rootPath = null;
        /**
         * 设置根路径
         * @param url
         */
        that.setRootPath = function (url) {
            rootPath = url;
        };
        /**
         * 获得跟路径
         * @returns {string}
         */
        that.getRootPath = function () {
            if (typeof GC !== 'undefined' && GC.basePath) {
                return GC.basePath;
            }

            var curWwwPath = window.document.location.href;
            var pathName = window.document.location.pathname;
            var pos = curWwwPath.indexOf(pathName);
            var localhostPaht = curWwwPath.substring(0, pos);
            var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);

            return (localhostPaht + projectName);
        };

        /**
         * 获得当前url中的参数
         * @param name
         * @returns {null}
         */
        that.getUrlParam = function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg); //匹配目标参数
            if (r != null) return unescape(r[2]);
            return null; //返回参数值
        };

        /**
         * 提示框
         * @param title 提示框标题
         * @param message 提示框内容
         * @param icon 提示框图标
         */
        that.tips = function (title, message, icon) {
            var top = 16;
            $('.notification').each(function () {
                top += $(this).height() + 35;
            });

            if (!$('.notify-list').length) {
                $('body').append('<div class="notify-list"></div>');
            }

            icon = icon == 'success' ? 'fa fa-check-circle notify-success'
                : icon == 'warning' ? 'fa fa-exclamation-circle notify-warning'
                    : icon == 'error' ? 'fa fa-times-circle notify-error'
                        : icon == 'message' ? 'fa fa-info-circle notify-message' : icon;

            var DIV = $('<div class="notification" style="top:' + top + 'px;">').append(
                '<i class="glyphicon glyphicon-remove notification-remove-icon"/>' +
                '    <i class="' + (icon != undefined && icon != null ? ('notification-icon ' + icon) : '') + '"></i>' +
                '    <div class="notification-group ' + (icon != undefined && icon != null ? 'with-icon-left' : '') + '">' +
                '        <h2 class="notification-title">' + title + '</h2>' +
                '        <div class="notification-content">' +
                '            <p>' + message + '</p>' +
                '        </div>' +
                '    </div>' +
                '</div>');

            $('.notify-list').append(DIV);
            DIV.animate({'right': '16px'}, 'fast');
            DIV.find('.notification-remove-icon').off('click').on('click', function () {
                DIV.remove();
            });
            setTimeout(function () {
                DIV.remove();
                var top = 16;
                $('.notification').each(function (index) {
                    if (index == 0) {
                        $(this).css('top', '16px');
                    } else {
                        top += $(this).height() + 35;
                        $(this).css('top', top + 'px');
                    }
                });
            }, 3500);
        };

        /**
         * 确认框
         * @param message
         * @param result
         */
        that.confirm = function (message, callback) {
            new SimpleDialog({
                width: '350px',
                title: '提示',
                message: '<div style="padding: 15px 10px;word-break: break-all"><i class="fa fa-exclamation-circle notify-error"></i> ' + message + '</div>',
                buttons: [
                    {
                        label: '取消',
                        cssClass: 'btn-in-table',
                        action: function (dialog) {
                            dialog.close();
                            if (typeof callback == 'function') {
                                callback(false);
                            }
                        }
                    },
                    {
                        label: '确定',
                        cssClass: 'dialog-confirm-btn btn-in-table',
                        action: function (dialog) {
                            dialog.close();
                            if (typeof callback == 'function') {
                                callback(true);
                            }
                        }
                    }
                ]
            }).open();
        };

        /**
         * 反馈确认框
         */
        that.confirms = {
            success: function (message, callback) {
                this.show(message, callback, 'svg svg-success svg-5xl');
            },
            failed: function (message, callback) {
                this.show(message, callback, 'svg svg-failed svg-5xl');
            },
            show: function (message, callback, iconClass) {
                iconClass = iconClass || 'svg svg-hint svg-5xl';
                new SimpleDialog({
                    showHeader: false,
                    width: '350px',
                    onshown: function (dialog) {
                        if (typeof callback == 'function') {
                            dialog.$modalContent.find('.btn-in-dialog').off('click').on('click', function () {
                                callback();
                            });
                        }
                    },
                    message: function (dialog) {
                        return '<div style="text-align: center;">' +
                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                            '<span class="' + iconClass + '" style="width: 60px;height: 60px"></span><br>' +
                            '<span class="confirms-dialog-message" style="font-size:12px;color: #687178;">' + message.replace(/,/g, ", ") + '</span><br>' +
                            '<button class="btn-in-dialog" type="button" data-dismiss="modal">确认</button>' +
                            '</div>';
                    }
                }).open();
            }
        };

        /**
         * 反馈提示框
         */
        that.dialogs = {
            success: function (message) {
                this.show(message, 'svg svg-correct svg-5xl');
            },
            failed: function (message) {
                this.show(message, 'svg svg-error svg-5xl');
            },
            show: function (message, iconClass) {
                iconClass = iconClass || 'svg svg-correct svg-5xl';
                new SimpleDialog({
                    showHeader: false,
                    width: '350px',
                    message: '<div style="text-align: center;"><span class="' + iconClass + '" style="width: 35px;height: 35px"></span><br>' +
                        '<span style="font-size:12px;color: #687178;" class="confirms-dialog-message" >' + message.replace(/,/g, ", ") + '</span></div>',
                    onshown: function (dialog) {
                        setTimeout(function () {
                            if (dialog.opened) {
                                dialog.close();
                            }
                        }, 2500);
                    }
                }).open();
            }
        };

        that.loadingDialog = {
            action: null,
            open: function (action) {
                this.action = action;
                if (this.dialog == null) {
                    this.dialog = new SimpleDialog({
                        title: '操作结果',
                        width: '350px',
                        showHeader: false,
                        message: function (dialog) {
                            return '<div style="text-align: center">' +
                                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                                '<div class="loading" style="margin: auto;width:60px;height: 60px"></div>' +
                                '<span class="loading-message-content">' +
                                '<span class="loading-dialog-hint-icon" style="width: 60px;height: 60px"></span><br>' +
                                '<span style="font-size:12px;color: #687178;" class="loading-dialog-message"></span><br>' +
                                '<button class="btn-in-dialog" type="button" data-dismiss="modal">确认</button>' +
                                '</span>' +
                                '</div>';
                        },
                        onshow: function (dialog) {
                            dialog.$modalBody.find('.loading').show();
                            dialog.$modalBody.find('.loading-message-content').hide();
                            if (typeof loadingDialog.action === 'function') {
                                loadingDialog.action(dialog);
                            }
                        }
                    });
                }
                this.dialog.open()
            },
            close: function () {
                this.dialog.close();
            },
            setMessage: function (message, type) {
                var that = this;
                setTimeout(function () {
                    that.dialog.$modalBody.find('.loading').hide();
                    that.dialog.$modalBody.find('.loading-message-content').show();
                    that.dialog.$modalBody.find('.loading-dialog-hint-icon').addClass(type ? 'svg svg-success svg-5xl' : 'svg svg-failed svg-5xl');
                    that.dialog.$modalBody.find('.loading-dialog-message').text(message.replace(/,/g, ", "));
                }, 500);
            },
            dialog: null
        };

        /**
         * 刷新tip事件
         */
        that.refreshTipsEvent = function () {
            $('.hover-show-tip').off('mouseover').on('mouseover', function (e) {
                var offset =$(this).offset();
                if (this.offsetWidth < this.scrollWidth && $(this).find('.hover-tip-content').length <= 0) {
                    var text = $(this).text();
                    var sign = Com.randomChar() + '_tips';
                    $(this).attr('data-sign',sign);
                    $('body').append('<span class="hover-tip-content"  data-sign="'+ sign +'"' +
                        'style="left:' + (parseInt(offset.left) + 15) + 'px;top:'+(parseInt(offset.top) + 25) +'px">' + text + '</span>')
                }
            }).off('mouseout').on('mouseout', function () {
                $('.hover-tip-content[data-sign="'+$(this).attr('data-sign')+'"]').remove();
            });
        };

        that.refreshDatePicker = function () {
            $(".date-picker").each(function () {
                $(this).addClass('input');
                $(this).attr('placeholder', '请选择...');
                if (!$(this).parent().hasClass('date-picker-wrap') && !$(this).next().hasClass('clock-icon')) {
                    $(this).wrap('<span class="date-picker-wrap"></span>');
                    $(this).parent().append('<span class="clock-icon date-picker-right-icon glyphicon glyphicon-time"></span>');
                    $(this).parent().append('<span class="remove-icon date-picker-right-icon glyphicon glyphicon-remove" style="display: none;"></span>');
                }
                $(this).parent().css('cursor', $(this).prop('readonly') ? 'not-allowed' : 'pointer');

                if (!$(this).prop('readonly')) {
                    $(this).css('cursor', 'pointer');
                    var lDate = $(this).attr('data-date-format').trim();
                    var sDate = $(this).attr('data-start-date') || '2010-01-01';
                    var eDate = $(this).attr('data-end-date') || '';

                    var val = $(this).val();
                    $(this).val('');
                    $(this).datetimepicker({
                        language: 'zh-CN',
                        autoclose: true,
                        todayBtn: 1,
                        todayHighlight: 0,
                        weekStart: 1,
                        format: lDate,
                        startView: getStartView(lDate),
                        minView: getMinView(lDate),
                        startDate: ((sDate != undefined && sDate != "") ? sDate : '2010-01-01'),
                        endDate: eDate
                    }).on('show',function(e){
                        if($(this).offset().top + 300 > Com.getFullHeight()){
                            $('.datetimepicker').not(':hidden').css('top',$(this).offset().top - 280 + 'px')
                                .removeClass('datetimepicker-dropdown-bottom-right')
                                .addClass('datetimepicker-dropdown-top-right')
                        }
                    });
                    $(this).val(val);
                } else {
                    $(this).removeClass('date-picker')
                }
            });
            $(".date-picker").parent().each(function () {
                $(this).off('mouseover').on('mouseover', function () {
                    if ($(this).find('.date-picker').prop('readonly')) return false;
                    if ($(this).find('.date-picker').val()) {
                        var that = this;
                        $(this).find('.remove-icon').show().off('click').on('click', function () {
                            $(that).find('.date-picker').val('');
                            $(that).find('.date-picker').change();
                        });
                        $(this).find('.clock-icon').hide();
                    }
                }).off('mouseout').on('mouseout', function () {
                    $(this).find('.remove-icon').hide();
                    $(this).find('.clock-icon').show();
                });
            });
            that.addScrollListener();
        };

        that.dateRangePicker = function (sDateDomId, eDateDomId, fmt, sDate, eDate, equalable) {
            var sDateObj = $('#' + sDateDomId);
            var eDateObj = $('#' + eDateDomId);

            wrapDom(sDateObj);
            wrapDom(eDateObj);

            function wrapDom(dom) {
                dom.removeClass('date-picker').addClass('input mdate-picker');
                sDateObj.attr('placeholder', '请选择开始时间');
                eDateObj.attr('placeholder', '请选择结束时间');
                if (!dom.parent().hasClass('date-range-picker-wrap') && !dom.next().hasClass('clock-icon')) {
                    dom.wrap('<span class="date-range-picker-wrap" style="margin-right: 10px;"></span>');
                    dom.parent().append('<span class="clock-icon date-picker-right-icon glyphicon glyphicon-time"></span>');
                    dom.parent().append('<span class="remove-icon date-picker-right-icon glyphicon glyphicon-remove" style="display: none;cursor: pointer"></span>');
                }
            }

            sDate = sDate || "";
            eDate = eDate || "";
            equalable = (equalable === false) ? false : true;
            fmt = fmt || 'yyyy-mm-dd hh:ii:ss';
            sDateObj.attr('data-date-format', fmt);
            eDateObj.attr('data-date-format', fmt);

            var option = {
                language: 'zh-CN',
                autoclose: true,
                todayBtn: 1,
                format: fmt,
                todayHighlight: 0,
                weekStart: 1,
                startView: getStartView(fmt),
                minView: getMinView(fmt)
            };
            sDateObj.datetimepicker(option).on('changeDate', function (ev) {
                eDateObj.datetimepicker('setStartDate', equalable ? $(this).val() : e($(this).val(), fmt));
                sDateObj.blur();
                eDateObj.focus();
            });
            eDateObj.datetimepicker(option).on('changeDate', function (ev) {
                sDateObj.datetimepicker('setEndDate', equalable ? $(this).val() : s($(this).val(), fmt));
                eDateObj.blur();
            });
            if (Com.isNotBlank(sDate) && Com.isNotBlank(eDate) && sDate > eDate) {
                var temp = sDate;
                sDate = eDate;
                eDate = temp;
            }
            sDateObj.val(sDate);
            eDateObj.val(eDate);
            sDateObj.datetimepicker('setEndDate', eDate);
            eDateObj.datetimepicker('setStartDate', sDate);

            $(".date-range-picker-wrap").each(function () {
                $(this).off('mouseover').on('mouseover', function () {
                    if ($(this).find('.mdate-picker').val()) {
                        var that = this;
                        $(this).find('.remove-icon').show().off('click').on('click', function () {
                            $(that).find('.mdate-picker').val('');
                            $(that).find('.mdate-picker').datetimepicker('setStartDate', '1111-01-01');
                            $(that).find('.mdate-picker').datetimepicker('setEndDate', '2222-01-01');
                            $(that).find('.mdate-picker').change();
                        });
                        $(this).find('.clock-icon').hide();
                    }
                }).off('mouseout').on('mouseout', function () {
                    $(this).find('.remove-icon').hide();
                    $(this).find('.clock-icon').show();
                });
            });


            function s(eDate, fmt) {
                if (fmt.indexOf('i') !== -1) {
                    var temp = (parseInt(eDate.substr(fmt.indexOf('i'))) - 5);
                    if (temp < 0) return s(eDate, fmt.substr(0, fmt.indexOf('i') - 1));
                    if (temp < 10) temp = '0' + temp;
                    return eDate.substr(0, fmt.indexOf('i')) + temp + ':00';
                } else if (fmt.indexOf('h') !== -1) {
                    var temp = (parseInt(eDate.substr(fmt.indexOf('h'))) - 1);
                    if (temp < 0) return s(eDate, fmt.substr(0, fmt.indexOf('h') - 1));
                    if (temp < 10) temp = '0' + temp;
                    return eDate.substr(0, fmt.indexOf('h')) + temp + ':00:00';
                } else if (fmt.indexOf('d') !== -1) {
                    var temp = (parseInt(eDate.substr(fmt.indexOf('d'))) - 1);
                    if (temp < 0) return s(eDate, fmt.substr(0, fmt.indexOf('d') - 1));
                    if (temp < 10) temp = '0' + temp;
                    return eDate.substr(0, fmt.indexOf('d')) + temp;
                } else if (fmt.indexOf('m') !== -1) {
                    var temp = (parseInt(eDate.substr(fmt.indexOf('m'))) - 1);
                    if (temp < 0) return s(eDate, fmt.substr(0, fmt.indexOf('m') - 1));
                    if (temp < 10) temp = '0' + temp;
                    return eDate.substr(0, fmt.indexOf('m')) + temp + (fmt.indexOf('-') !== -1 ? '-01' : '01')
                } else {
                    var temp = parseInt(eDate.substr(0, 4)) - 1;
                    return temp + '-01-01'
                }
            }

            function e(sDate, fmt) {
                if (fmt.indexOf('i') !== -1) {
                    var temp = (parseInt(sDate.substr(fmt.indexOf('i'))) + 5);
                    if (temp >= 60) return e(sDate, fmt.substr(0, fmt.indexOf('i') - 1));
                    if (temp < 10) temp = '0' + temp;
                    return sDate.substr(0, fmt.indexOf('i')) + temp + ':00';
                } else if (fmt.indexOf('h') !== -1) {
                    var temp = (parseInt(sDate.substr(fmt.indexOf('h'))) + 1);
                    if (temp >= 24) return e(sDate, fmt.substr(0, fmt.indexOf('h') - 1));
                    if (temp < 10) temp = '0' + temp;
                    return sDate.substr(0, fmt.indexOf('h')) + temp + ':00:00';
                } else if (fmt.indexOf('d') !== -1) {
                    var temp = (parseInt(sDate.substr(fmt.indexOf('d'))) + 1);
                    if (temp >= 30) return e(sDate, fmt.substr(0, fmt.indexOf('d') - 1));
                    if (temp < 10) temp = '0' + temp;
                    return sDate.substr(0, fmt.indexOf('d')) + temp;
                } else if (fmt.indexOf('m') !== -1) {
                    var temp = (parseInt(sDate.substr(fmt.indexOf('m'))) + 1);
                    if (temp >= 12) return e(sDate, fmt.substr(0, fmt.indexOf('m') - 1));
                    if (temp < 10) temp = '0' + temp;
                    return sDate.substr(0, fmt.indexOf('m')) + temp + (fmt.indexOf('-') !== -1 ? '-01' : '01')
                } else {
                    var temp = parseInt(sDate.substr(0, 4)) + 1;
                    return temp + '-01-01'
                }
            }

            that.addScrollListener();
        };

        that.addScrollListener = function () {
            var scrollFunc = function (e) {
                e = e || window.event;
                if (e.wheelDelta) {
                    scrollTimeout();
                } else if (e.detail) {
                    scrollTimeout();
                }
            };
            if (document.addEventListener) {
                document.addEventListener('DOMMouseScroll', scrollFunc, false);
            }
            window.onmousewheel = document.onmousewheel = scrollFunc;
        };
        var sTimer = null;

        function scrollTimeout() {
            if (sTimer) clearTimeout(sTimer);
            setTimeout(function () {
                $('.date-picker').each(function () {
                    if (!$(this).prop('readonly') && typeof  $('.date-picker').datetimepicker === 'function') {
                        $('.date-picker').datetimepicker('place');
                    }
                });

                $('.single-selector.reposition-able').each(function () {
                    $(this).singleSelecter('reposition');
                })
            }, 300);
        }

        function getStartView(fmt) {
            if (fmt.indexOf('d') !== -1 || fmt.indexOf('D') !== -1) {
                return 2;
            } else if (fmt.indexOf('m') !== -1 || fmt.indexOf('M') !== -1) {
                return 3;
            } else if (fmt.indexOf('y') !== -1 || fmt.indexOf('Y') !== -1) {
                return 4;
            } else if (fmt.indexOf('h') !== -1 || fmt.indexOf('H') !== -1) {
                return 1;
            } else if (fmt.indexOf('i') !== -1 || fmt.indexOf('I') !== -1) {
                return 0;
            }
        }

        function getMinView(fmt) {
            if (fmt.indexOf('i') !== -1 || fmt.indexOf('I') !== -1) {
                return 0;
            } else if (fmt.indexOf('h') !== -1 || fmt.indexOf('H') !== -1) {
                return 1;
            } else if (fmt.indexOf('d') !== -1 || fmt.indexOf('D') !== -1) {
                return 2;
            } else if (fmt.indexOf('m') !== -1 || fmt.indexOf('M') !== -1) {
                return 3;
            } else if (fmt.indexOf('y') !== -1 || fmt.indexOf('Y') !== -1) {
                return 4;
            }
        }

        /**
         * 格式化时间戳
         * @param value ：linux时间戳, 例 1505271601000
         * @param fmt  ：要展示的日期格式, 例 'yyyy-MM-dd hh:mm:ss'
         */
        that.formatTimestamp = function (value, fmt) {
            var date = new Date(parseInt(value));
            return Com.formatDate(date, fmt);
        };

        /**
         * 格式化展示当前时间
         * @param fmt :要展示的日期格式, 例 'yyyy-MM-dd hh:mm:ss'
         */
        that.currentDate = function (fmt) {
            var date = new Date();
            return Com.formatDate(date, fmt);
        };

        /**
         * 格式化时间
         * @param date Date型数据
         * @param fmt 要展示的日期格式, 例 'yyyy-MM-dd hh:mm:ss'
         */
        that.formatDate = function (date, fmt) {
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
            }
            var o = {
                'M+': date.getMonth() + 1,
                'd+': date.getDate(),
                'h+': date.getHours(),
                'm+': date.getMinutes(),
                's+': date.getSeconds()
            };
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    var str = o[k] + '';
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
                }
            }
            return fmt;
        };
        /**
         * 在原有日期基础上，增加days天数，不传days参数则默认为增加1天
         * @author luocb@asiainfo.com
         * @param currentDate 原日期，格式为 'yyyy-MM-dd hh:mm:ss', 例如2018-12-19 11:43:22
         * @param days 增加的天数
         * @param isOnlyDay 是否只展示到天
         */
        that.addDays = function (currentDate, days, isOnlyDay) {
            if(days === undefined){
                days = 1;
            }
            var dateArray = currentDate.split(" ");
            var dateTemp = dateArray[0].split("-");
            var nDate = new Date(dateTemp[1] + '-' + dateTemp[2] + '-' + dateTemp[0]); //转换为MM-DD-YYYY格式
            var millSeconds = Math.abs(nDate) + (days * 24 * 60 * 60 * 1000);
            var rDate = new Date(millSeconds);
            var year = rDate.getFullYear();
            var month = rDate.getMonth() + 1;
            if (month < 10) month = "0" + month;
            var date = rDate.getDate();
            if (date < 10) date = "0" + date;
            if(isOnlyDay){
                return year + "-" + month + "-" + date;
            }
            return (year + "-" + month + "-" + date) + " " + dateArray[1];
        };
        that.addHours = function (currentDate, hours) {
            if(hours === undefined){
                hours = 1;
            }
            var nDate = new Date(new Date(currentDate.replace("-", "/").replace("-", "/")).valueOf() + hours * 60 * 60 * 1000);
            return Com.formatDate(nDate, "yyyy-MM-dd hh:mm:ss");
        };
        /**
         * 在原有日期基础上，减去days天数，不传days参数则默认为减少1天
         * @author luocb@asiainfo.com
         * @param currentDate 原日期，格式为 'yyyy-MM-dd hh:mm:ss', 例如2018-12-19 11:43:22
         * @param days 增加的天数
         * @param isOnlyDay 是否只展示到天
         */
        that.reduceDays = function (currentDate, days, isOnlyDay) {
            if(days === undefined){
                days = 1;
            }
            return Com.addDays(currentDate, (-days), isOnlyDay);
        };


        /***
         * 合并函数
         * @param oldFunc   旧函数
         * @param newFunc   新函数
         * @param type      合并类型：merge-合并执行；append-返回结果追加
         * @param args0
         * @param args1
         * @param args2
         * @param args3
         * @param args4
         */
        that.mergeFunc = function (oldFunc, newFunc, type) {
            var temp = oldFunc;
            return function (args0, args1, args2, args3, args4) {
                if (type == 'merge') {
                    if (typeof temp == 'function') {
                        temp(args0, args1, args2, args3, args4);
                    }
                    if (typeof newFunc == 'function') {
                        newFunc(args0, args1, args2, args3, args4);
                    }
                } else if (type == 'append') {
                    if (typeof temp == 'function') {
                        args0 = temp(args0, args1, args2, args3, args4);
                        return (typeof newFunc == 'function') ? newFunc(args0, args1, args2, args3, args4) : args0;
                    }
                }
            };
        };

        function padLeftZero(str) {
            return ('00' + str).substr(str.length)
        }

        that.parseParams = function (params) {
            var result = '';
            for (var i in params) {
                result += (i + '=' + params[i] + '&');
            }
            return result;
        };

        that.refreshTagsGroupEvent = function () {
            $('.tag-remove-icon').off('click').on('click', function (e) {
                $(this).parent().remove();
                e.stopPropagation();
            });
        };


        that.warningBell = function (top, right) {
            top = (top || 0 ) + 'px';
            right = (right || 10) + 'px';
            $('.warning-bell-tips-panel').remove();
            $('body').append(
                '<div class="warning-bell-tips-panel" style="display: inline-block;position: fixed;top:' + top + ';right:' + right + '">' +
                '<div class="warning-bell">' +
                '    <span class="out-bracket-lg">(</span>' +
                '    <span class="in-bracket-sm">(</span>' +
                '    <i class="fa fa-bell bell-icon"></i>' +
                '    <span class="in-bracket-sm">)</span>' +
                '    <span class="out-bracket-lg">)</span>' +
                '</div></div>');

        };

        /**
         * 关系型数据转树形数据
         */
        that.simpleDataTypeToNormalDataType = function (sNodes, key, parentKey, childKey) {
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
        };

        that.normalDataToSimpleData = function (array, key, parentKey, childKey) {
            var arr = JSON.parse(JSON.stringify(array));
            var tempArray = [];
            key = key || 'index';
            parentKey = parentKey || 'pIndex';
            childKey = childKey || 'children';

            function toSimpleDataType(array, rootIndex) {
                for (var i in array) {
                    if (Com.isArray(array[i][childKey])) {
                        toSimpleDataType(array[i][childKey], array[i][key]);
                    }
                    array[i][parentKey] = rootIndex ? rootIndex : '-1';
                    array[i][childKey] = '';
                    tempArray.push(array[i]);
                }
            }

            toSimpleDataType(arr);
            return tempArray;
        };

        /**
         * 产生长度为len的随机不重复字符串
         * @param len
         * @returns {string}
         */
        that.randomChar = function (len) {
            len = len || 36;
            var x = "qwertyuioplkjhgfdsazxcvbnm0123456789";
            var tmp = "";
            var timestamp = new Date().getTime();
            for (var i = 0; i < len; i++) {
                tmp += x.charAt((Math.ceil(Math.random() * 100000000) + timestamp) % x.length);
            }
            return tmp;
        };

        /**
         * 获取满屏高度
         * @param offset :偏移量
         * @returns {number}
         */
        that.getFullHeight = function (offset) {
            offset = parseInt(offset) || 0;
            return parseInt($(document).height()) - parseInt(offset) - 35;
        };

        that.trimSpaceLine = function (src) {
            src = src || '';
            var resultStr = src.replace(/\ +/g, ""); //去掉空格
            resultStr = src.replace(/[ ]/g, "");    //去掉空格
            resultStr = src.replace(/[\r\n]/g, ""); //去掉回车换行
            return resultStr;
        };

        /**
         * 限制Bootstrap table选中项
         * @param tableObj  tableObj
         * @param limit 限制选择多少条
         * @returns {boolean}
         */
        that.checkBSTableSelections = function (tableObj, limit) {
            if (!Com.isArray(tableObj.bootstrapTable('getSelections'))) {
                Com.confirms.failed('至少选中一项');
                return false;
            }

            if ((Com.isNotBlank(limit) && limit > 0 ) && tableObj.bootstrapTable('getSelections').length > limit) {
                Com.confirms.failed('每次只能选择' + limit + '项');
                return false;
            }

            return true;
        };

        var uploading = false;
        that.uploadFile = function (file, cb) {
            var formFile = new FormData();
            formFile.append("fileName", "testFile");
            formFile.append("file", file);

            if (uploading) {
                Com.tips('error', '正在上传，请稍后……', 'error');
                return false;
            }

            $.ajax({
                url: Com.getRootPath() + '/file/upload',
                type: 'POST',
                cache: false,
                data: formFile,
                processData: false,
                contentType: false,
                dataType: "json",
                beforeSend: function () {
                    uploading = true;
                },
                success: function (res) {
                    Com.unloading();
                    uploading = false;
                    cb(res);
                }
            });
        };

        /**
         * 限制文件大小
         *
         * @param input ：input对象
         * @param limitSize ：限制大小
         * @param unit :单位 k/m/g/t
         * @returns {*}
         */
        that.checkFileSize = function (file, limitSize, unit) {
            var fileSize = file.size;
            unit = (unit || 'k').toUpperCase();
            switch (unit) {
                case 'K':
                    fileSize = fileSize / 1024;
                    break;
                case 'M':
                    fileSize = fileSize / 1024 / 1024;
                    break;
                case 'G':
                    fileSize = fileSize / 1024 / 1024 / 1024;
                    break;
                case 'T':
                    fileSize = fileSize / 1024 / 1024 / 1024 / 1024;
                    break;
            }
            //判断是否符合要求
            if (fileSize < limitSize) {
                return true;
            } else {
                Com.confirms.failed('单个文件大小不能超过' + limitSize + unit);
                return false;
            }
        };

        that.isIE = function () {
            return (!!window.ActiveXObject || "ActiveXObject" in window)
        };

        that.getMenuIndex = function (url) {
            var index = [];
            if (typeof parent.sideBarMenu != 'undefined') {
                var allNodes = parent.sideBarMenu.getAllNodes();
                allNodes.forEach(function (item) {
                    if (item.href == url) {
                        index.push(item.index);
                    }
                })
            }
            return index;
        };

        that.changeMenu = function (index, parmas) {
            if (typeof parent.sideBarMenu != 'undefined') {
                parmas = parmas || {};
                parent.sideBarMenu.setIframeParams(parmas);
                parent.sideBarMenu.openMenu(index);
            }
        };

        that.queryOption = function (array, field, value) {
            value = value || '';
            var res = {
                index: -1,
                item: ''
            };
            $.each(array, function (index, item) {
                if (item[field] == value.toString()) {
                    res.index = index;
                    res.item = item;
                }
            });
            return res;
        };

        that.getTableData = function ($table, field, allData) {
            var rows = $table.bootstrapTable(Com.isBlank(allData) ? 'getAllSelections' : 'getData');
            var data = [];
            rows.forEach(function (item) {
                data.push(item[field].toString());
            });
            return data;
        };

        that.offsetLeft = function (elem) {
            return elem.offsetParent ? elem.offsetLeft + offsetLeft(elem.offsetParent) : elem.offsetLeft;
        };

        that.offsetTop = function (elem) {
            return elem.offsetParent ? elem.offsetTop + offsetTop(elem.offsetParent) : elem.offsetTop;
        };

        /**
         * 检查页面按钮权限
         * @param btnGroup :
            *   {
         *      'permission1': 'btn1',
         *      'permission2': ['btnId2','btnId3']
         *   }
         * @param callbackFun: 回调方法
         */
        that.docheckPermissions = function (btnGroups, callbackFun) {
            var permissions = [];
            $.each(btnGroups, function (key, value) {
                permissions.push(key);
            });
            that.ajaxData(that.getRootPath() + "/permission/check", "post", permissions, function (res) {
                if (Com.isNotBlank(res)) {
                    $.each(res, function (key, value) {
                        if (Com.isArray(btnGroups[key])) {
                            $.each(btnGroups[key], function (k, v) {
                                // value ? $(v).show() : $(v).hide();
                                if (!value) $(v).remove();
                            });
                        } else {
                            // value ? $(btnGroups[key]).show() : $(btnGroups[key]).hide();
                            if (!value) $(btnGroups[key]).remove();
                        }
                    })
                }
                if(callbackFun !== undefined){
                    callbackFun(res);
                }
            }, null, null, null, 'application/json');
        };

        that.limitNumberInput = function () {
            $('.numberInput').off('keydown').on('keydown', function (event) {
                //上下左右、退格、tab、F12、Delete等功能键保持作用
                if ($.inArray(event.keyCode, [8, 9, 123, 46]) !== -1 || (event.keyCode >= 37 && event.keyCode <= 40)) {
                    return true;
                }

                // 输入 '-' 时的操作
                if ([173, 189, 229].indexOf(event.keyCode) !== -1){
                    // 当只能输入正整数时，返回false
                    if($(this).attr('data-min') >= 0) return false;
                    // 当且仅当输入字符串中只有一个负号时，返回true;
                    if($(this).val().indexOf('-') === -1) return true;
                }

                var fixedNum = $(this).attr('data-fixed') || 0;
                if (parseInt(fixedNum) == 0) {
                    //只能输入整数
                    return (/^[0-9]*$/.test(event.key))
                } else if (fixedNum == -1) {
                    //不限制小数个数的输入
                    return (event.keyCode === 190 && $(this).val().indexOf('.') === -1)
                        || (/^[0-9]*$/.test(event.key))
                } else {
                    //限制小数个数为fixedNum的输入
                    if (!(/^[0-9]*$/.test(event.key)) && event.keyCode !== 190) {
                        return false
                    }
                    var temp = $(this).val();
                    var reg = eval('/^(([1-9]{1}\\d*)|0)(\\.\\d{1,' + fixedNum + '})?$/');
                }
            });
        };

        /**
         * 验证ID相关输入是否合法：
         *  允许中间有空格、特殊字符(其中，模型id要限制不予许输入这几个特殊字符 : / \ ? * [ ] )，但是不允许全为空格或者两边空格
         * @param $input      :输入框对象
         * @param required    :是否必填，true-是，false-否，默认false
         * @param label       :提示主语，如【属性id】,即时验证非空时会提示【属性id不能为空】，验证合法时会提示【属性id不合法】,默认【ID输入】
         */
        that.validIdInput = function($input,required,label,showTips){
            showTips = showTips == false ? false:true;
            if(!$input) {
                Com.tips('失败','Com.validIdInput()首参数为输入框对象！','error');
                return false;
            }
            required  = required || false;
            label = label || "输入";
            var value = $input.val().trim();

            //去掉首位空格后方向复制
            $input.val(value);

            //非空判断
            if(required && Com.isBlank(value)){
                if(showTips) Com.tips('提示',label + '不能为空！','warning');
                $input.addClass('error');
                return false;
            }
            var bool = true,
                illegalChars = ['\\','?','*','[',']'];
            $.each(illegalChars,function(index,char){
                if(value.indexOf(char) !== -1){
                    bool = false;
                    if(showTips) Com.tips('提示',label + '不合法！不允许出现 \\ ? * [ ]等字符','warning');
                    $input.addClass('error');
                    return false;
                }
            });
            $input.on('focus',function(){
                $input.removeClass('error');
            });
            return bool;
        };

        that.refreshInputEvent = function(){
            $('.input').each(function(){
                if($(this).next('.fa-times').length === 0
                    && !$(this).hasClass('date-picker')
                    && !$(this).hasClass('refInput')
                    && !$(this).hasClass('fileNameInput')
                    && !$(this).prop('readonly')
                    && !$(this).prop('disabled')
                    && !$(this).hasClass('no-deletion')){
                    $(this).after('<i class="fa fa-times" style="width: 20px;margin-left: -20px;color: #ccc;font-size:12px;display: none;cursor: pointer;z-index: 10"></i>');

                    var $input = $(this);
                    var clearBtn = $(this).next('.fa-times');
                    var timeout = null;
                    $input.on('mouseover',function(){
                        clearTimeout(timeout);
                        if(Com.isNotBlank($(this).val())){
                            clearBtn.show();
                        }
                    }).on('mouseleave',function(){
                        timeout = setTimeout(function(){
                            clearBtn.hide();
                        },100);
                    });
                    clearBtn.on('mouseover',function(){
                        clearTimeout(timeout);
                    }).on('mouseleave',function(){
                        timeout = setTimeout(function(){
                            clearBtn.hide();
                        },100);
                    }).on('click',function(){
                        $input.val('');
                        clearBtn.hide();
                    })
                }
            })
        };

        /**
         * 绑定拖动事件
         * @param leftDom   左侧元素对象
         * @param rightDom  右侧元素对象
         * @param option.minWidth  允许左侧元素改变的最小宽度，默认为元素初始宽度
         * @param option.maxWidth  允许左侧元素改变的最大宽度，默认为整个视图宽度的一半
         * @param option.onDrap    拖动结束事件
         * 说明：拖动绑定事件是应该根据左右元素分布情况不同写拖动逻辑；
         *       本次方法只适用于BOMC项目里，模型树和右侧表格的拖动分布，其他项目可能需要修改此方法
         */
        that.bindDragEvent = function(leftDom,rightDom,option){
            option  = $.extend({},{
                minWidth : leftDom.width(),
                maxWidth : window.innerWidth/2,
                onDrap   : null
            },option);
            // minWidth = minWidth || leftDom.width();
            var dragBarId = Com.randomChar();
            var height = leftDom.css('height');
            var left = leftDom.offset().left+leftDom.width() - 3;
            leftDom.after('<div id="'+dragBarId+'" class="drag-bar" style="height: '+height+';left:'+left+'px"></div>');
            $('#' + dragBarId).data('dragTarget',leftDom);
            var dragTimeout = null;
            document.getElementById(dragBarId).onmousedown = function(event){
                var disX = event.clientX;
                var leftDomLeft = leftDom.offset().left;
                var leftDomWidth = leftDom.width();
                var rightDomPaddingLeft = parseInt(rightDom.css('padding-left').replace('px',''));
                var transX = 0;
                $('#' + dragBarId).addClass('moving');
                document.onmousemove = function (e) {
                    transX = e.clientX - disX;
                    if(leftDomWidth + transX <= option.maxWidth && leftDomWidth + transX >= option.minWidth){
                        $('#' + dragBarId).css({
                            left:(leftDomLeft + leftDomWidth +  transX - 3) +'px',
                            height: leftDom.css('height')
                        });
                    }
                    if(!Com.isIE()){
                        if(leftDomWidth + transX <= option.maxWidth && leftDomWidth + transX >= option.minWidth){
                            leftDom.css('width',(leftDomWidth + transX) + 'px');
                            rightDom.css('padding-left',(rightDomPaddingLeft + transX) + 'px');
                        }
                    }
                    window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                };

                document.onmouseup = function (e) {
                    $('#' + dragBarId).removeClass('moving');
                    if(Com.isIE()){
                        var leftDis = e.clientX;
                        var rightDis = e.clientX;
                        leftDis = leftDis > option.maxWidth ?  option.maxWidth : leftDis < option.minWidth ? option.minWidth  : leftDis;
                        rightDis = rightDis < option.minWidth ? option.minWidth: rightDis > option.maxWidth  ? option.maxWidth : rightDis ;
                        leftDom.css('width',leftDis+ 'px');
                        rightDom.css('padding-left',(rightDis  + 15 )+ 'px');
                        $('#' + dragBarId).css('left',(leftDomLeft + leftDis - 3) +'px');
                    }
                    window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                    document.onmousemove = null;
                    document.onmouseup = null;
                    if(typeof option.onDrap === 'function'){
                        option.onDrap();
                    }
                }
            };
        };

        that.repositionDragBar = function(){
            $('.drag-bar').each(function(){
                var leftDom = $(this).data('dragTarget');
                $(this).css('left',(leftDom.offset().left+leftDom.width() - 5) + 'px');
            })
        };

        that.appendJS = function(sUrl){
            var _script=document.createElement('script');
            _script.setAttribute('type','text/javascript');
            _script.setAttribute('src',sUrl);
            document.getElementsByTagName('head')[0].appendChild(_script);
        };

        that.refreshSwitchBtnEvent = function () {
            $('.switchBtn').each(function () {
                var switchObj = $(this);
                switchObj.attr('title', switchObj.hasClass('on') ? switchObj.attr('data-off-title') : switchObj.attr('data-on-title'));
                $(this).off('click').on('click', function () {
                    var isOn = $(this).hasClass('on');
                    $(this).removeClass(isOn ? 'on' : 'off')
                        .addClass(isOn ? 'off' : 'on')
                        .attr('data-state', isOn ? 0 : 1)
                        .attr('title', isOn ? $(this).attr('data-on-title') : $(this).attr('data-off-title'));
                    var fun = $(this).attr('onchange');
                    if (typeof eval(fun) === 'function') {
                        eval(fun)(switchObj, !isOn);
                    }
                });
            });
        };

        return that;
    }

    /**
     * 左侧伸缩菜单
     * @returns {SideBarMenu}
     */
    function SideBarMenu() {
        var that = this;
        var options = null;
        var menuObj = null;
        var activeIndex = '-1';
        var menuId = null;

        var menuNodes = [];

        /**
         * 生成侧栏菜单
         * @param target
         * @param option
         */
        that.initMenu = function (target, option) {
            var DEFAULT = {
                collapse: false,       //是否折叠展示,默认展开
                showCollapseBtn: true,  //头部悬浮折叠按钮
                activeIndex: '-1',     //展开位置,默认 -1
                activeClass: 'active', //activeClass,默认'active'
                onClose: null,         //折叠事件
                onOpen: null,          //展开事件
                items: [],             //菜单项
                iframeId: null,        //要绑定的iframe ID,
                iframeParams: {},
                simpleDataType: false,
                onLoadSuccess: null,
                onMouseLeave: null,
                width:'200px'
            };

            menuObj = $('#' + target);
            options = null;
            options = $.extend({}, DEFAULT, option);
            options.activeClass = options.activeClass == '' ? 'active' : options.activeClass;

            // 清除旧数据与渲染视图,顶部增加收起折叠按钮
            menuObj.html('');
            menuObj.removeClass('collapse');
            menuObj.find('.collapse-btn').addClass('open');
            menuObj.css({width: options.width});
            menuId = 'menu_' + target;
            var html = (options.showCollapseBtn ? '<div class="collapse-btn ' + (options.collapse ? '' : 'open') + '"><span class="glyphicon glyphicon-align-justify"></span></div>' : '') +
                '<ul id="' + menuId + '" class="menu">' +
                '</ul>';
            menuObj.append(html);
            if (!options.showCollapseBtn) {
                $('#' + menuId).css({
                    'margin-top': '0px'
                });
            }

            menuNodes = options.simpleDataType ? options.items : normLDataToSimpleData(JSON.parse(JSON.stringify(options.items)));
            if (options.simpleDataType) {
                options.items = simpleDataTypeToNormalDataType(JSON.parse(JSON.stringify(options.items)));
            }

            // 渲染子项
            if (Array.isArray(option.items) && option.items.length > 0) {
                for (var i in options.items) {
                    initSideBarItem(menuId, options.items[i], parseInt(i) + 1, 1, target + '_menu_item');
                }
            }

            // 始化菜单事件
            that.initToggleEvent();
            if (options.activeIndex != '-1') {
                that.openMenu(options.activeIndex);
            }

            if (options.collapse) {
                that.close();
            }

            if (typeof options.onLoadSuccess === 'function') {
                options.onLoadSuccess();
            }
        };


        /**
         * 重新加载菜单数据
         * @param data  待加载的数据
         * @param activeIndex  activeIndex
         */
        that.load = function (data, activeIndex, simpleDatatype) {
            if (menuId == null) {
                return;
            }

            simpleDatatype = (simpleDatatype != null && simpleDatatype != undefined) ? simpleDatatype : options.simpleDataType;
            menuNodes = simpleDatatype ? data : normLDataToSimpleData(JSON.parse(JSON.stringify(data)));
            options.items = simpleDatatype ? simpleDataTypeToNormalDataType(JSON.parse(JSON.stringify(data))) : data;

            menuObj.css({width: options.width});
            menuObj.removeClass('collapse');
            menuObj.find('.collapse-btn').css({width: options.width}).addClass('open');
            menuObj.find('.collapse-btn span').css('transform', 'rotate(0deg)');

            $('#' + menuId).html('');
            if (Com.isArray(options.items)) {
                for (var i in options.items) {
                    initSideBarItem(menuId, options.items[i], parseInt(i) + 1, 1, menuObj.attr('id') + '_menu_item');
                }
            }

            that.initToggleEvent();
            if (activeIndex) {
                options.activeIndex = activeIndex;
                that.openMenu(activeIndex);
            }

            if (typeof options.onLoadSuccess === 'function') {
                options.onLoadSuccess();
            }
        };

        that.setIframeParams = function (params) {
            options.iframeParams = $.extend({}, options.iframeParams, params);
        };

        that.initToggleEvent = function () {
            menuObj.find(".menu ul").css("display", "none");
            menuObj.find(".menu .side-bar-menu").off("click").on("click", function () {
                if (!(Com.isNotBlank(options.iframeId) && Com.isBlank(getItem($(this).attr('data-index')).href) )) {
                    menuObj.find(".menu .side-bar-menu").removeClass(options.activeClass);
                    $(this).addClass(options.activeClass);
                }

                var opened;
                if (!menuObj.hasClass('collapse')) {

                    $(this).next().slideToggle('fast');
                    if ($(this).find('span.collapse-icon.glyphicon-menu-left').length) {
                        $(this).find('span.collapse-icon').removeClass('glyphicon-menu-left').addClass('glyphicon-menu-down');
                        opened = true;
                    } else {
                        $(this).find('span.collapse-icon').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-left');
                        opened = false;
                    }
                }

                activeIndex = menuObj.find('.side-bar-menu.active').attr('data-index');
                that.onChange(activeIndex, menuObj.find('.side-bar-menu.active a').text(), opened);
            });

            menuObj.find('.collapse-btn').off('mousedown').on('mousedown', function () {
                $(this).hasClass('open') ? that.close() : that.open();
            });

            if (typeof options.onMouseLeave === 'function') {
                menuObj.off('mouseleave').on('mouseleave', options.onMouseLeave)
            }

            if (typeof options.onMouseEnter === 'function') {
                menuObj.off('mouseenter').on('mouseenter', options.onMouseEnter)
            }
        };

        /**
         * 收起菜单
         * @param target ：目标菜单Dom
         */
        that.close = function () {
            if (menuObj.hasClass('collapse')) {
                return;
            }

            if (options.collapse) {
                menuObj.find('.collapse-btn').animate({width: '50px'}, "normal", function () {
                    menuObj.find('.collapse-btn span').css('transform', 'rotate(90deg)');
                });

                menuObj.animate({width: '50px'}, "normal", function () {
                    // 收起菜单时的回调事件
                    if (typeof options.onClose == 'function') {
                        options.onClose();
                    }
                });
                initPopoverEvent(menuObj);
            }
            menuObj.addClass('collapse');
            activeIndex = menuObj.find('.side-bar-menu.active').attr('data-index');
            menuObj.find(".menu ul").css("display", "none");
            menuObj.find('.menu .side-bar-menu.level_1 a').hide();
            menuObj.find('.menu .side-bar-menu.level_1 span.collapse-icon').hide();
            menuObj.find('.menu .side-bar-menu.level_1').addClass('side-bar-menu-collapse');
            menuObj.find('.menu .side-bar-menu span.collapse-icon').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-right');
            menuObj.find('.menu .side-bar-menu span.collapse-icon').removeClass('glyphicon-menu-left').addClass('glyphicon-menu-right');
            menuObj.find('.menu .side-bar-menu').attr('data-toggle', 'popover');
            menuObj.find('.collapse-btn').removeClass('open');
            menuObj.find('.side-bar-menu.active').parents().each(function () {
                if ($(this).prop("tagName") == 'LI' && $(this).find('.side-bar-menu.level_1').length) {
                    $(this).find('.side-bar-menu.level_1').addClass('active');
                    return false;
                }
            });
        };

        /**
         * 展开菜单
         */
        that.open = function () {
            if (!menuObj.hasClass('collapse')) {
                return;
            }

            if (options.collapse) {
                menuObj.find('.collapse-btn').animate({width: options.width}, "normal", function () {
                    menuObj.find('.collapse-btn span').css('transform', 'rotate(0deg)');
                });
                menuObj.animate({width: options.width}, "normal", function () {
                    o();
                });
                return;
            }
            o();

            function o() {
                menuObj.removeClass('collapse');
                menuObj.find('a').show();
                menuObj.find('.menu .side-bar-menu.level_1').removeClass('side-bar-menu-collapse');
                menuObj.find('.menu .side-bar-menu span.collapse-icon').show();
                menuObj.find('.menu .side-bar-menu').removeAttr('data-toggle');
                menuObj.find('.menu .side-bar-menu span.collapse-icon').removeClass('glyphicon-menu-right').addClass('glyphicon-menu-left');
                menuObj.find('.collapse-btn').addClass('open');

                // 展开菜单后的回调事件
                if (typeof options.onOpen == 'function') {
                    options.onOpen();
                }

                // 打开后展开原先的菜单位置；
                if (activeIndex != '-1') {
                    that.openMenu(activeIndex);
                }
            }
        };

        /**
         * 打开指定菜单项
         */
        that.openMenu = function (index) {
            if (getItem(index) === null) {
                console.error('ERROR: Could not found menu index');
                return false;
            }

            if (that.isCollapse()) {
                activeIndex = index;
                that.onChange(index);

                var ancestor = that.getAncestorItem(index);
                menuObj.find(".side-bar-menu").removeClass('active');
                menuObj.find('.side-bar-menu[data-index="' + ancestor.index + '"]').addClass('active');
            } else {
                var menuItem = menuObj.find('.menu .side-bar-menu[data-index="' + index + '"]');

                openParent(menuItem);
                menuItem.click();

                function openParent(sonItem) {
                    var pItem = sonItem.parent().parent();
                    if (pItem == undefined || pItem.prop("tagName") != 'UL') {
                        return;
                    }
                    pItem.show();
                    pItem.prev().find('span.collapse-icon').removeClass('glyphicon-menu-left').addClass('glyphicon-menu-down');
                    openParent(pItem);
                }
            }
        };

        /**
         * 获取菜单状态/菜单是否折叠
         */
        that.isCollapse = function () {
            return menuObj.hasClass('collapse');
        };

        /**
         * 追加子项
         * @param index
         * @param items
         */
        that.appendChild = function (index, items) {
            if (!Array.isArray(items) || items.length <= 0) {
                return;
            }

            var menuItem = menuObj.find('.menu .side-bar-menu[data-index="' + index + '"]');
            if (menuItem.find('span.collapse-icon').length <= 0) {
                menuItem.append('<span class="collapse-icon glyphicon glyphicon-menu-left"></span>');
                menuItem.parent().append('<ul id="menu_' + menuItem.attr('id') + '"></ul>');
            }

            var level = parseInt(menuItem.prop('class').substr(menuItem.prop('class').indexOf('level_') + 6)) + 1;
            for (var i in items) {
                initSideBarItem('menu_' + menuItem.attr('id'), items[i], parseInt(i) + 1, level, menuItem.attr('id'));
            }
            appendToggleEvent(menuItem.parent());
        };

        //展开事件
        that.onChange = function (index, state) {
            var item = getItem(index);
            if (options.iframeId && Com.isNotBlank(item.href)) {
                var href = item.href.indexOf('http') !== -1 ? item.href
                    : (Com.getRootPath() + item.href + '?' + Com.parseParams(options.iframeParams));
                Com.ajaxData(Com.getRootPath() + '/userInfo');
                $('#' + options.iframeId).attr('src') != href ?
                    $('#' + options.iframeId).attr('src', href) : console.log('the same url');
            }

            if (typeof options.onChange == 'function') {
                options.onChange(item, state);
            }
        };

        //获得路径
        that.getPath = function (index, split) {
            split = split || '/';
            var item = getItem(index);
            var path = item.title;
            if (item.pIndex != '-1' && item.pIndex) {
                path = that.getPath(item.pIndex, split) + split + path;
            }
            return path;
        };

        //获得路径下标
        that.getIndexPath = function (index, split) {
            split = split || '/';
            var item = getItem(index);
            if (item == null) {
                return '-1';
            }
            var path = item['index'];
            if (item.pIndex != '-1' && item.pIndex) {
                path = that.getIndexPath(item.pIndex, split) + split + path;
            }
            return path;
        };

        // 获得当前菜单选中项
        that.getActiveItem = function () {
            return getItem(activeIndex);
        };

        // 获得菜单所有节点
        that.getAllNodes = function () {
            return menuNodes;
        };

        that.getNode = function (index) {
            return getItem(index);
        };

        function initPopoverEvent(_that) {
            _that.find('[data-toggle="popover"]').each(function () {
                var element = $(this);
                var content = '<ul style="width: 170px">';
                content = element.next().html() == undefined ? ('<span style="white-space: nowrap">' + element.find('a').text() + '</span>') : content + element.next().html() + '</ul>';
                element.popover({
                    trigger: 'manual',
                    placement: 'right',
                    title: '',
                    html: 'true',
                    content: content
                });

                element.on("mouseenter", function () {
                        if (_that.hasClass('collapse') || _that.parents('.collapse').length) {
                            var _this = this;
                            $(this).popover("show");
                            $(this).siblings(".popover").css({
                                top: (parseInt($(this).position().top) + 10) + 'px'
                            });
                            $(this).siblings(".popover").find('.arrow').css({
                                top: '20px'
                            });
                            $(this).siblings(".popover").find('.side-bar-menu span.icon').css({
                                padding: 0
                            });
                            $(this).siblings(".popover").on("mouseleave", function () {
                                $(_this).popover('hide');
                            });
                            $(this).siblings(".popover").find('.side-bar-menu').removeClass('active');
                            $(this).siblings(".popover").find('.side-bar-menu[data-index="' + activeIndex + '"]').addClass('active');
                            initPopoverEvent($(_this).next().find('.popover-content'));
                            appendPopoverClickEvent($(_this).next().find('.popover-content'));
                        }
                    }
                ).on("mouseleave", function () {
                    var _this = this;
                    setTimeout(function () {
                        if (!$(_this).next().find('.popover-content:hover').length) {
                            $(_this).popover("hide")
                        }
                    }, 100);
                });
            });
        }
        function initSideBarItem(menuId, item, index, level, itemId) {
            var DEFAULT = {
                index: parseInt(Math.random() * 9999 + 1),
                iconClass: '',
                href: '#',
                title: '',
                clickAble: false,
                onclick: null
            };

            item = $.extend({}, DEFAULT, item);

            itemId += '_' + index;
            var paddindLeft = 20 * (level - 1) + 'px';
            var iconClass = (item.iconClass == undefined || item.iconClass == '' ) ? 'glyphicon glyphicon-folder-open' : item.iconClass;
            var itemHtml = '<li id="li_' + itemId + '">' +
                '<div id="' + itemId + '" class="side-bar-menu level_' + level + '" data-index="' + item.index + '" >' +
                '    <span class="icon" style="padding-left: ' + paddindLeft + ';text-align: center"><i class="'+iconClass+'" style="width: 14px;height: 14px"></i></span>' +
                '    <a  data-href="' + (item.href == undefined ? '#' : item.href) + '" style="display: inline-block;">' + item.title + '</a>' +
                '</div></li>';

            $('#' + menuId).append(itemHtml);
            $('#' + itemId).find('a').off('click').on('click', function () {
                if (item.clickAble && typeof item.onclick == "function") {
                    item.onclick();
                }
            });

            //生成子项
            if (Array.isArray(item.children) && item.children.length > 0) {
                $('#' + itemId).append('<span class="collapse-icon glyphicon glyphicon-menu-left"></span>');
                for (var i in item.children) {
                    $('#li_' + itemId).append('<ul id="menu_' + itemId + '"></ul>');
                    initSideBarItem('menu_' + itemId, item.children[i], parseInt(i) + 1, level + 1, itemId);
                }
            }
        }

        function appendToggleEvent(target) {
            target.find(".side-bar-menu").off("click").on("click", function () {
                menuObj.find(".menu .side-bar-menu").removeClass(options.activeClass);
                $(this).addClass(options.activeClass);

                if (menuObj.hasClass('collapse')) {
                    return
                }

                var opened = null;
                $(this).next().slideToggle('fast');
                if ($(this).find('span.collapse-icon.glyphicon-menu-left').length) {
                    $(this).find('span.collapse-icon').removeClass('glyphicon-menu-left').addClass('glyphicon-menu-down');
                    opened = true;
                } else {
                    $(this).find('span.collapse-icon').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-left');
                    opened = false;
                }

                activeIndex = menuObj.find('.side-bar-menu.active').attr('data-index');
                that.onChange(activeIndex, menuObj.find('.side-bar-menu.active a').text(), opened);
            });
        }

        function appendPopoverClickEvent(target) {
            target.find(".side-bar-menu").off("click").on("click", function () {
                activeIndex = $(this).attr('data-index');
                that.onChange(activeIndex, $(this).find('a').text());

                var ancestor = that.getAncestorItem(activeIndex);
                menuObj.find(".side-bar-menu").removeClass('active');
                menuObj.find('.side-bar-menu[data-index="' + ancestor.index + '"]').addClass('active');

                target.find(".side-bar-menu").removeClass('active');
                $(this).addClass('active');
            });
        }

        that.getAncestorItem = function (index) {
            var item = getItem(index);
            if (item && Com.isNotBlank(item['pIndex']) && getItem(item['pIndex'])) {
                return that.getAncestorItem(item['pIndex']);
            }
            return item;
        };

        function getItem(index) {
            for (var i in menuNodes) {
                if (menuNodes[i].index == index) {
                    return menuNodes[i];
                }
            }
            return null;
        }

        function normLDataToSimpleData(items) {
            var tempArray = [];

            function toSimpleDataType(items, rootIndex) {
                for (var i in items) {
                    if (Com.isArray(items[i].children)) {
                        toSimpleDataType(items[i].children, items[i].index);
                    }
                    items[i].pIndex = rootIndex ? rootIndex : '-1';
                    items[i].children = '';
                    tempArray.push(items[i]);
                }
            }

            toSimpleDataType(items);
            return tempArray;
        }

        function simpleDataTypeToNormalDataType(sNodes) {
            var i, l,
                key = 'index',
                parentKey = 'pIndex',
                childKey = 'children';
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

        return that;
    }

    /**
     * 资源树
     * @returns {resoTree}
     */
    function ResoTree() {
        var that = this;
        var treeObj = null;
        var options = null;
        var DEFAULT = {
            activeIndex: '-1',         //默认展开位置
            loadType: 'local|server',  //加载菜单时的方法，‘local’本地，‘server’远程,'local|server'先加载本地，后加载远程
            contentType: 'application/x-www-form-urlencoded',
            url: '#',                  //菜单数据加载地址，loadType 为‘server’时必填
            ajaxType: 'GET',           //请求方式
            onChange: null,            //树选择事件
            onAddNew: null,
            onEdit: null,
            onRemove: null,
            onRemoveAllSon: null,
            queryParams: function (params) {      //在这里修改查询参数或追加参数,记得return
                return params;
            },
            responseHandler: function (data) {     // 修改响应
                return data;
            },
            simpleDataType: false,
            initTreeWithPath: {
                enable: false,
                pathField: 'path',
                split: '/'
            },
            items: [],

            showRightMenuOnLeftClick: false,
            rightClickable: false,       //鼠标右键事件
            defineRightMenu: false,      //自定义邮件菜单
            onRightMenuItemClick: null,
            beforeRightMenuShow: null,
            rmenuItems: [],
            enabledInAnyCase: [],

            checkable: false,            //是否为选择模式
            onCheck: null,
            multiple: true,               //多选预留参数
            checkRelated: true,

            onDblclick: null,
            showWarnSign: false,

            indexField: 'index',
            pIndexField: 'pIndex',
            titleField: 'title',

            alarmFlash: {
                show: false,
                levelField: 'alarmLevel',
                timeout: 4000,
                level: 1,
                countField: 'count'
            },

            hoverShowTip: {
                enable: false,
                formatter: null
            },

            iconClass: {
                whole: ['fa fa-folder', 'fa fa-folder-open'],   // 定义展开/收起节点时的图标样式,
                leafClass: 'fa fa-wpforms',
                alignKey: '',                                  // 根据某一字段来设置展开/收起节点时的图标样式
                classMap: {}
            }
        };
        var resoTree = null;
        var activeIndex = -1;
        var items = [];
        var rmenu = null;
        var timeout = null;

        var treeItems = [];
        var checkedItems = [];
        var nodeMap = {};

        /**
         * get tree option
         * @returns {*}
         */
        that.getOptions = function () {
            return options;
        };

        /**
         * set tree options
         * @param option
         */
        that.resetOptions = function (option) {
            return $.extend(options, option);
        };

        /**
         * get tree Obj
         * @returns {*}
         */
        that.getTreeObj = function () {
            return treeObj;
        };

        /**
         * 生成树
         * @param target
         * @param option
         */
        that.initTree = function (target, option,groupName) {
            that.destroy();
            options = $.extend({}, DEFAULT, option);
            options.alarmFlash = $.extend({}, DEFAULT.alarmFlash, option.alarmFlash);
            options.iconClass = $.extend({}, DEFAULT.iconClass, option.iconClass);
            options.initTreeWithPath = $.extend({}, DEFAULT.initTreeWithPath, option.initTreeWithPath);
            treeObj = $('#' + target);

            treeObj.html('');
            treeObj.append('<div style="width: 100%;text-align: center"><div class="loading" style="margin:auto"></div></div>');
            resoTree = 'resoTree_' + target;
            var html = '<ul id="' + resoTree + '" class="menu"></ul>';
            treeObj.append(html);

            createTreeView();
            initRightClickMenu();

            function initRightClickMenu() {
                if (rmenu != null) {
                    rmenu.html('');
                }
                var rmenuId = target + '_rmenu';
                var content = '<div id="' + rmenuId + '" class="rmenu"><ul>';
                if (options.defineRightMenu) {
                    for (var i in options.rmenuItems) {
                        var liClass = (Com.isArray(options.enabledInAnyCase) && options.enabledInAnyCase.indexOf(parseInt(i)) >= 0)
                            ? "enabled-in-any-case" : 'forbid-in-disabled';
                        content += '<li class="' + liClass + '">' + options.rmenuItems[i] + '</li>'
                    }
                } else {
                    content +=
                        '<li id="' + rmenuId + '_editBtn">编辑节点</li>' +
                        '<li id="' + rmenuId + '_delBtn">删除本节点</li>' +
                        '<li id="' + rmenuId + '_removeAllSonBtn">删除所有子节点</li>' +
                        '<li id="' + rmenuId + '_addNewBtn">新增子节点</li>' +
                        '<li id="' + rmenuId + '_addNewBroBtn">新增兄弟节点</li>';
                }
                treeObj.append(content);
                rmenu = $('#' + target + '_rmenu');
            }
        };

        /**
         * 刷新树
         * @returns {boolean}
         */
        that.refresh = function (option) {
            if (resoTree == null) {
                console.log('请先调用 initTree 方法生成树');
                return false;
            }
            treeItems = [];
            checkedItems = [];
            options.activeIndex = activeIndex;
            options.items = options.loadType === 'local' ? items : [];

            if (typeof option == 'object') {
                $.extend(options, option);
            }
            $('#' + resoTree).html('');
            treeObj.append('<div style="width: 100%;text-align: center"><div class="loading" style="margin:auto"></div></div>');
            createTreeView();
        };

        /**
         * 刷新单个节点
         * @param index
         */
        that.refreshNode = function (index) {
            that.removeAllSon(index);
            that.resetNode(index, {isParent: true});
            that.openNodes(index);
        };

        /**
         * create 树视图
         */
        function createTreeView() {
            var target = treeObj.attr('id');
            if (options.loadType == 'server') {
                var params = options.queryParams({});
                Com.ajaxData(options.url, options.ajaxType, params, function (result) {
                    result = typeof options.responseHandler == 'function' ? options.responseHandler(result, params) : result;
                    options.items = checkDataType(JSON.parse(JSON.stringify(result)));
                    x();
                }, null, null, null, options.contentType);
            } else {
                options.items = checkDataType(JSON.parse(JSON.stringify(options.items)));
                x();
            }

            function x() {
                treeObj.find('.loading').remove();
                if (Com.isArray(options.items)) {
                    items = normLDataToSimpleData(JSON.parse(JSON.stringify(options.items)));
                    for (var i in options.items) {
                        initTreeItem(resoTree, options.items[i], parseInt(i) + 1, target + '_menu_item', options.items[i][options.pIndexField], 1);
                    }
                    treeObj.find(".menu ul").css("display", "none");
                }
                initToggleEvent();
            }
        }

        /**
         * 重新加载资源树数据
         * @param data   :重新加载的数据
         * @param activeIndex  :树的展示初始位置
         * @param simpleDataType :是否使用简单数据格式，默认true
         */
        that.load = function (data, activeIndex, simpleDataType) {
            if (resoTree == null) {
                return;
            }

            treeItems = [];
            checkedItems = [];
            $('#' + resoTree).html(' ');

            options.simpleDataType = simpleDataType || options.simpleDataType;
            options.activeIndex = activeIndex || options.activeIndex;
            if (Com.isArray(data)) {
                options.items = checkDataType(JSON.parse(JSON.stringify(data)));
                for (var i in options.items) {
                    initTreeItem(resoTree, options.items[i], parseInt(i) + 1, treeObj.attr('id') + '_menu_item', options.items[i][options.pIndexField], 1);
                }
                treeObj.find(".menu ul").css("display", "none");
            }
            initToggleEvent();
        };

        /**
         * 资源树节点点击事件
         * @param item
         * @param state
         */
        that.onChange = function (item, state, trigget) {
            var treeNode = treeObj.find('li .reso-tree-menu[data-index="' + item[options.indexField] + '"]');
            if (!state) {
                clearTimeout(timeout);
                treeNode.find('.loading').remove();
            }
            // 远程加载数据
            if (options.loadType.indexOf('server') >= 0 && that.isParentNodes(item[options.indexField]) && !that.isLoadData(item[options.indexField]) && state) {
                if (treeNode.find('.loading').length <= 0) {
                    treeNode.append('<div class="loading" style="width: 25px;height: 25px;margin:10px 60px"></div>');
                }

                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    var params = JSON.parse(JSON.stringify(item));
                    // var formatParams = options.queryParams(params);
                    var formatParams={
              //          "parentId":params.id
                        "node":params.id,
                        "includeAll":false
                    };
                    Com.ajaxData(options.url, options.ajaxType, formatParams, function (result) {
                        treeNode.find('.loading').remove();
                        result = typeof options.responseHandler == 'function' ? options.responseHandler(result, formatParams) : result;
                        result = checkDataType(JSON.parse(JSON.stringify(result)));
                        that.appendNodes(item[options.indexField], result);
                    }, null, null, null, options.contentType);
                }, 500);
            }

            trigget = trigget === false ? false : true;
            if (typeof options.onChange == 'function' && trigget) {
                options.onChange(item, state);
            }
        };

        /**
         * 增加子节点
         */
        that.appendNodes = function (index, items) {
            if (Com.isEmpty(items)) {
                console.log('Could not append empty nodes!');
                return false;
            }
            if (index == '-1') {
                append(resoTree, items, options.items.length, resoTree.substr(10) + '_menu_item', index, 1);
                initToggleEvent();
            } else {
                // 事先无子项，追加
                var treeNode = treeObj.find('.reso-tree-menu[data-index="' + index + '"]');
                if (!treeNode.find('.collapse-icon').hasClass('glyphicon-plus-sign')
                    && !treeNode.find('.collapse-icon').hasClass('glyphicon-minus-sign')) {
                    treeNode.find('.collapse-icon').addClass('glyphicon glyphicon-minus-sign');
                }

                if (treeNode.parent().find('#son_menu_' + treeNode.attr('id')).length <= 0) {
                    treeNode.parent().append('<ul id="son_menu_' + treeNode.attr('id') + '" class="son-menu"></ul>')
                }

                var _count = $('#son_menu_' + treeNode.attr('id')).find('li').length + 1;
                append('son_menu_' + treeNode.attr('id'), items, _count, treeNode.attr('id'), index, parseInt(treeNode.attr('data-level')) + 1);


                appendToggleEvent(treeNode.parent());
                if (options.checkable) {
                    var checkedList = [];
                    items.forEach(function (item) {
                        if ((typeof item['checked'] !== 'undefined')
                            && (item['checked'] || (item['checked']).toString().toUpperCase() === 'TRUE')) {
                            checkedList.push(item);
                        }
                    });
                    checkNodes(checkedList);
                }
            }

            if(typeof options.onAppendNodes === 'function'){
                options.onAppendNodes(that.getNode(index),items);
            }

            /**
             * @param treeId  节点所在ul的id
             * @param items   待添加节点
             * @param _count  下标基值
             * @param itemId  父节点的id
             * @param pIndex  父节点的index
             * @param level   父节点的level
             */
            function append(treeId, items, _count, itemId, pIndex, level) {
                if (Com.isArray(items)) {
                    items = checkDataType(items);
                    for (var i in items) {
                        initTreeItem(treeId, items[i], parseInt(i) + _count, itemId, pIndex, level);
                    }
                } else {
                    items = checkPathMode(items, index);
                    initTreeItem(treeId, items, _count, itemId, pIndex, level);
                }

                function checkPathMode(item, pIndex) {
                    if (!Com.isArray(item) && typeof item === 'object' && options.initTreeWithPath.enable) {
                        item.pathIndex = item[options.initTreeWithPath.pathField];
                        item.pPathIndex = pIndex;
                    }
                    return item;
                }
            }

            return that;
        };

        /** 删除子节点
         *
         * @param index
         */
        that.removeNodes = function (index) {
            that.removeAllSon(index);
            treeObj.find('.reso-tree-menu[data-index="' + index + '"]').parent().remove();
            var item = getItem(index);
            treeItems.splice($.inArray(item, treeItems), 1);
        };

        /** 删除所有子节点
         *
         * @param index
         */
        that.removeAllSon = function (index) {
            var treeNode = treeObj.find('.reso-tree-menu[data-index="' + index + '"]');
            treeNode.parent().find('ul.son-menu').each(function () {
                $(this).remove();
            });
            treeNode.find('.collapse-icon').removeClass('glyphicon-plus-sign').removeClass('glyphicon-minus-sign');
            that.getSonNodes(index).forEach(function (item, index) {
                if (Com.isArray(that.getSonNodes(item[options.indexField]))) {
                    that.removeAllSon(item[options.indexField]);
                }
                treeItems.splice($.inArray(item, treeItems), 1)
            });
        };

        /** 修改子节点
         *
         * @param index
         * @param oldTitle
         * @param newTitle
         */
        that.editNodes = function (index, oldTitle, newTitle) {
            var _that = treeObj.find('.reso-tree-menu[data-index="' + index + '"]');
            _that.find('.item-span').hide();
            _that.find('.item-input').show();
            _that.find('.item-input').focus();
            _that.find('.item-input').off('blur').on('blur', function () {
                e(this);
            });

            _that.find('.item-input').off('keydown').on('keydown', function (e) {
                if (e.keyCode == 13) {
                    oldTitle = $(this).prev().text();
                    newTitle = $(this).val();
                    $(this).hide();
                    $(this).prev().show();
                    $(this).prev().text(newTitle);

                    if (typeof options.onEdit == 'function') {
                        options.onEdit(getItem(index), oldTitle, newTitle);
                    }
                }
            });

            function e(_this) {
                oldTitle = $(_this).prev().text();
                newTitle = $(_this).val();
                $(_this).hide();
                $(_this).prev().show();
                $(_this).prev().text(newTitle);

                if (typeof options.onEdit == 'function') {
                    options.onEdit(getItem(index), oldTitle, newTitle);
                }
            }
        };

        /** 回调打开某一子节点
         *
         * @param index
         */
        that.openNodes = function (index) {
            var treeNode = treeObj.find('.reso-tree-menu[data-index="' + index + '"]');
            openParent(treeNode);
            treeNode.click();

            function openParent(sonItem) {
                var pItem = sonItem.parent().parent();
                if (pItem == undefined || pItem.prop("tagName") != 'UL') {
                    return;
                }
                pItem.show();
                pItem.prev().find('.collapse-icon').removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                var itemIcon = pItem.prev().find('.icon');
                // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-open-cls'));
                changeItemIcon(itemIcon, true);
                openParent(pItem);
            }
        };

        /** 获得active index
         *
         */
        that.getActiveItem = function () {
            return getItem(options.activeIndex);
        };

        /**
         * 是否是父节点
         *
         * @param index
         * @returns {*}
         */
        that.isParentNodes = function (index) {
            var treeNode = treeObj.find('.reso-tree-menu[data-index="' + index + '"]');
            return treeNode.find('.collapse-icon').hasClass('glyphicon-plus-sign') || treeNode.find('.collapse-icon').hasClass('glyphicon-minus-sign')
        };

        /**
         * 节点是否已经加载数据
         * @param index
         * @returns {boolean}
         */
        that.isLoadData = function (index) {
            var treeNode = treeObj.find('.reso-tree-menu[data-index="' + index + '"]');
            return treeNode.parent().find('.son-menu').length > 0;
        };

        /** 获得所选
         *
         * @returns {Array}
         */
        that.getSelected = function () {
            var nodes = [];
            if (treeObj !== null) {
                treeObj.find('.checked-icon').each(function () {
                    var _this = $(this).parent();
                    var item = getItem(_this.attr('data-index'));
                    item.checked = true;
                    nodes.push(item);
                });
            }
            return nodes;
        };

        /**
         * 选中某一节点，单选时只选中index，
         * 复选时选中某一节点下的节点，满足params信息,
         * @param index
         * @param params
         * @returns {boolean}
         */
        that.check = function (index, params) {
            if (!options.checkable) {
                console.log('Tree is not in selectable mode currently!');
                return false;
            }

            if (options.multiple) {
                var checkedList = that.getSelected();
                var checkedIndex = [];
                checkedList.forEach(function (item) {
                    checkedIndex.push(item[options.indexField]);
                });
                var generations = that.getGenerations(index);
                generations.forEach(function (item) {
                    if ($.inArray(item[params.field], params.values) !== -1
                        && ($.inArray(item[options.indexField], checkedIndex) === -1)) {
                        checkedList.push(item)
                    }
                });
                that.unCheckAll();
                checkNodes(checkedList);
            } else {
                that.unCheckAll();
                checked(treeObj.find('.reso-tree-menu[data-index="' + index + '"]'));
            }

            return that;
        };

        that.setCheckedStyle = function(items){
            if(Com.isArray(items)){
                items.forEach(function(index){
                    treeObj.find('.reso-tree-menu[data-index="' + index + '"]').addClass('checked');
                })
            }else{
                treeObj.find('.reso-tree-menu[data-index="' + items + '"]').addClass('checked');
            }
        };

        /**
         * 选中所有结点
         * @returns {*}
         */
        that.checkAll = function () {
            if (!options.checkable) {
                console.log('Tree is not in selectable mode currently!');
                return false;
            }
            that.unCheckAll();
            treeObj.find('.reso-tree-menu[data-level="1"]').each(function () {
                checked($(this));
                checkAllSon($(this));
            });
            return that;
        };

        /**
         * 取消选中所有
         * @returns {*}
         */
        that.unCheckAll = function () {
            if (!options.checkable) {
                console.log('Tree is not in selectable mode currently!');
                return false;
            }
            treeObj.find('.checked-icon').each(function () {
                var _this = $(this).parent();
                unchecked(_this);
                uncheckAllSon(_this);
                allParentsRemoveCheckedClass(_this);
            });
            return that;
        };

        /**
         * 获得树所有节点信息
         * @returns {Array}
         */
        that.getAllNodes = function () {
            var checkedArr = that.getSelected();
            var cIndexs = [];
            checkedArr.forEach(function (c) {
                cIndexs.push(c[options.indexField])
            });
            treeItems.forEach(function (t, i) {
                treeItems[i].checked = (cIndexs.indexOf(t[options.indexField]) >= 0 )
            });
            return treeItems;
        };

        /**
         * 获得节点路径
         * @param index
         * @param split
         * @returns {*}
         */
        that.getPath = function (index, split) {
            split = split || '/';
            var item = getItem(index);
            if (item == null) {
                return '-1';
            }
            var path = split + item[options.titleField];
            if (item[options.pIndexField] && item[options.pIndexField] != '-1') {
                path = that.getPath(item[options.pIndexField], split) + path;
            }
            return path;
        };

        /**
         * 获取节点的index路径
         * @param index
         * @param split
         * @returns {*}
         */
        that.getIndexPath = function (index, split) {
            split = split || '/';
            var item = getItem(index);
            if (item == null) {
                return '-1';
            }

            var path = split + item[options.indexField];
            if (Com.isNotBlank(item[options.pIndexField]) && item[options.pIndexField] != '-1') {
                path = that.getIndexPath(item[options.pIndexField], split) + path;
            }

            return path;
        };

        /**
         * 获取根节点
         * @returns {Array}
         */
        that.getRootNodes = function () {
            var res = [];
            treeItems.forEach(function (item, index) {
                if (Com.isBlank(item[options.pIndexField]) || item[options.pIndexField] == '-1') {
                    res.push(item);
                }
            });
            return res;
        };

        /**
         * 展开所有节点
         */
        that.openAllNodes = function () {
            treeObj.find('ul.menu').show();
            treeObj.find('ul.son-menu').show();
            treeObj.find('.reso-tree-menu').each(function () {
                if (($(this).find('.collapse-icon').hasClass('glyphicon-plus-sign')
                    || $(this).find('.collapse-icon').hasClass('glyphicon-minus-sign'))
                    && $(this).parent().find('.son-menu').length > 0) {
                    $(this).find('.collapse-icon').removeClass('glyphicon glyphicon-plus-sign').addClass('glyphicon glyphicon-minus-sign');
                    var itemIcon = $(this).find('.icon');
                    // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-open-cls'));
                    changeItemIcon(itemIcon, true);
                }
            })
        };

        /**
         * 收起所有节点
         */
        that.collapseAllNodes = function () {
            treeObj.find('ul.son-menu').hide();
            treeObj.find('.reso-tree-menu').each(function () {
                if (($(this).find('.collapse-icon').hasClass('glyphicon-plus-sign')
                    || $(this).find('.collapse-icon').hasClass('glyphicon-minus-sign'))
                    && $(this).parent().find('.son-menu').length > 0) {
                    $(this).find('.collapse-icon').removeClass('glyphicon glyphicon-minus-sign').addClass('glyphicon glyphicon-plus-sign');
                    var itemIcon = $(this).find('.icon');
                    // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-close-cls'));
                    changeItemIcon(itemIcon, false);
                }
            });
            activeIndex = -1;
        };

        /**
         * 获取节点
         * @param index
         */
        that.getNode = function (index) {
            return getItem(index);
        };

        /**
         * 获取所有子节点集合
         *
         * @param index
         * @returns {Array}
         */
        that.getSonNodes = function (index) {
            var result = [];
            for (var i in treeItems) {
                if (treeItems[i][options.pIndexField] == index) {
                    result.push(treeItems[i]);
                }
            }
            return result;
        };

        that.destroy = function () {
            if (treeObj) {
                treeObj.html('');
            }
            treeObj = null;
            options = null;
            DEFAULT = {
                activeIndex: '-1',         //默认展开位置
                loadType: 'local|server',  //加载菜单时的方法，‘local’本地，‘server’远程,'local|server'先加载本地，后加载远程
                url: '#',                  //菜单数据加载地址，loadType 为‘server’时必填
                ajaxType: 'GET',           //请求方式
                onChange: null,            //树选择事件
                onAddNew: null,
                onEdit: null,
                onRemove: null,
                onRemoveAllSon: null,
                queryParams: function (params) {      //在这里修改查询参数或追加参数,记得return
                    return params;
                },
                responseHandler: function (data) {     // 修改响应
                    return data;
                },
                simpleDataType: false,
                initTreeWithPath: {
                    enable: false,
                    pathField: 'path',
                    split: '/'
                },
                items: [],

                showRightMenuOnLeftClick: false,
                rightClickable: false,       //鼠标右键事件
                defineRightMenu: false,      //自定义邮件菜单
                onRightMenuItemClick: null,
                rmenuItems: [],
                enabledInAnyCase: [],

                checkable: false,            //是否为选择模式
                onCheck: null,
                multiple: true,               //多选预留参数
                checkRelated: true,

                onDblclick: null,
                showWarnSign: false,

                indexField: 'index',
                pIndexField: 'pIndex',
                titleField: 'title',

                alarmFlash: {
                    show: false,
                    levelField: 'level',
                    timeout: 4000,
                    level: 1,
                    countField: 'count'
                },
                hoverShowTip: {
                    enable: false,
                    formatter: null
                },
                iconClass: {
                    whole: ['fa fa-folder', 'fa fa-folder-open'],   // 定义展开/收起节点时的图标样式,
                    leafClass: 'fa fa-wpforms',
                    alignKey: '',                                  // 根据某一字段来设置展开/收起节点时的图标样式
                    classMap: {
                        key1: ['', ''],
                        key2: ['', '']
                    }
                }
            };
            resoTree = null;
            activeIndex = -1;
            items = [];
            rmenu = null;
            timeout = null;

            treeItems = [];
            checkedItems = [];
        };

        /**
         * 修改节点信息
         * @param index     :待修改的节点
         * @param params    :要修改的参数
         * @returns {boolean}   :修改结果
         */
        that.resetNode = function (index, params) {
            var item = null;
            treeItems.forEach(function (itm, i) {
                if (itm[options.indexField] == index && typeof params == 'object') {
                    item = $.extend(treeItems[i], params);
                }
            });

            if (item !== null) {
                var leafItem = treeObj.find('.reso-tree-menu[data-index="' + item[options.indexField] + '"]');
                leafItem.find('.item-span').text(item[options.titleField]);
                leafItem.find('.icon').removeClass().addClass('icon').addClass(item.disable ? 'glyphicon glyphicon-leaf' : item.iconClass);
                item.disable ? leafItem.addClass('disable') : leafItem.removeClass('disable');

                var gen = that.getGenerations(index);
                if (gen.length - 1 === 0 && !item.isParent) {
                    treeObj.find('.reso-tree-menu[data-index="' + item[options.indexField] + '"] .collapse-icon').removeClass().addClass('collapse-icon');
                }

                if (item.isParent) {
                    treeObj.find('.reso-tree-menu[data-index="' + item[options.indexField] + '"] .collapse-icon').removeClass().addClass('collapse-icon glyphicon glyphicon-plus-sign');
                }
            }
            return item;
        };

        /**
         * 获得所有子孙节点
         * @param index
         * @returns {Array}
         */
        that.getGenerations = function (index) {
            var items = [];
            treeObj.find('.reso-tree-menu[data-index="' + index + '"]').parent().find(".reso-tree-menu").each(function () {
                items.push(getItem($(this).attr('data-index')));
            });
            return items;
        };

        /**
         * 获得所有祖宗节点
         * @param index
         */
        that.getAncestor = function (index) {
            return getAncestor(index, treeItems);
        };

        /**
         * 递归绘画树节点
         * @param treeId
         * @param item
         * @param index
         * @param itemId
         * @param pIndex
         */
        function initTreeItem(treeId, item, index, itemId, pIndex, level) {
            var ITEM_DEFAULR = {
                iconClass: '',
                index: parseInt(Math.random() * 9999 + 1),
                title: 'title',
                isParent: false,
                children: [],
                checked: false,
                disable: false,
                count: 0
            };
            ITEM_DEFAULR[options.indexField] = ITEM_DEFAULR.index;
            item = $.extend({}, ITEM_DEFAULR, item);

            var itemTemp = JSON.parse(JSON.stringify(item));
            itemTemp.children = '';
            itemTemp.index = itemTemp[options.indexField];
            itemTemp[options.pIndexField] = pIndex;
            treeItems.push(itemTemp);
            nodeMap[itemTemp.index] = itemTemp;

            if (itemTemp.checked || (itemTemp.checked).toString().toUpperCase() === 'TRUE') {
                checkedItems.push(itemTemp);
            }

            itemId += '_' + index;
            var treeItem =
                '<li id="li_' + itemId + '" class=""><div id="' + itemId + '" class="reso-tree-menu ' + (item.disable ? 'disable' : 'undisable') + '" data-index="' + item[options.indexField] + '" data-level="' + level + '">' +
                '       <i class="collapse-icon"></i>' +
                '       <div class="horizon_line"></div>' +
                // '       <i class="icon ' + (item.disable ? 'glyphicon glyphicon-leaf' : getIconClass(item, 0)) + '" data-open-cls="' + getIconClass(item, 1) + '" data-close-cls="' + getIconClass(item, 0) + '"></i>' +
                initItemIcon(item) +
                alarmFlash(item) +
                // '       <span class="item-span" title="'+item[options.titleField] +'">' + item[options.titleField] +
                '       <span class="item-span" title="'+item.text +'">' + item.text +
                (options.alarmFlash.show ? ('(' + item[options.alarmFlash.countField] + ')') : '' ) +
                '</span>' +
                // '       <input class="item-input" type="text" value="' + item[options.titleField] + ' " style="display: none" >' +
                '       <input class="item-input" type="text" value="' + item.id + ' " style="display: none" >' +
                '</div></li>';
            $('#' + treeId).append(treeItem);

            if (options.hoverShowTip.enable) {
                $('#li_' + itemId).find('.reso-tree-menu').off('mouseover').on('mouseover', function (e) {
                    $('body').append('<span class="hover-tip-content" ' +
                        'style="left:' + (parseInt($(this).offset().left) + 40) + 'px;top:'+(parseInt($(this).offset().top) + 25)+'px;">' +
                        ((typeof options.hoverShowTip.formatter === 'function') ? options.hoverShowTip.formatter(item) : item[options.titleField])
                        + '</span>')
                }).off('mouseout').on('mouseout', function () {
                    $('.hover-tip-content').remove();
                });
            }

            // 渲染子项
            if (item.isParent || Com.isArray(item.children || (item.isParent).toString().toUpperCase() === 'TRUE')) {
                $('#' + itemId).find('.collapse-icon').addClass('glyphicon glyphicon-plus-sign');
            }

            if (Com.isArray(item.children)) {
                $('#li_' + itemId).append('<ul id="son_menu_' + itemId + '" class="son-menu"></ul>');
                for (var i in item.children) {
                    initTreeItem('son_menu_' + itemId, item.children[i], parseInt(i) + 1, itemId, item[options.indexField], level + 1);
                }
                $('#son_menu_' + itemId).css('display', 'none');
            }

            function alarmFlash(item) {
                if (options.alarmFlash.show) {
                    var level = parseInt(item[options.alarmFlash.levelField]);
                    var levelClass = 'alarm-level-' + level;
                    if (level >= options.alarmFlash.level && item['hasNewAlarm'] === 1) {     //=1表示有新告警，modify By luocb 2018-04-08
                        levelClass += ' alarm-flash-level-' + level;
                        var audio = document.getElementById('treeNewAlarmRingAudio');
                        audio.currentTime = 0;
                        audio.play();
                    }
                    return '<div class="radiusPoint ' + levelClass + '"></div>'
                }
                return '';
            }

            function initItemIcon(item) {
                var openIcon = getIconClass(item, 1),
                    closeIcon = getIconClass(item, 0);
                openIcon = getIconClass(item, 0).indexOf("url") !== -1 ? openIcon.substring(4, openIcon.length -1) : openIcon;
                closeIcon = getIconClass(item, 0).indexOf("url") !== -1 ? closeIcon.substring(4, closeIcon.length -1) : closeIcon;

                return getIconClass(item, 0).indexOf("url") !== -1 ?
                    '<img data-type="img" class="icon" src="' + closeIcon + '" width="14px" height="14px" data-open-cls="' + openIcon + '" data-close-cls="' + closeIcon + '">'
                    : '<i data-type="i" class="icon ' + (item.disable ? 'glyphicon glyphicon-leaf' : closeIcon) + '" data-open-cls="' + openIcon + '" data-close-cls="' + closeIcon + '"></i>';
            }

            function getIconClass(item, type) {
                if (Com.isNotBlank(item.iconClass)) {
                    return Com.isArray(item.iconClass) ? item.iconClass[type] : item.iconClass;
                }

                var key = item[options.iconClass.alignKey];
                if (key && Com.isArray(options.iconClass.classMap[key])) {
                    return options.iconClass.classMap[key][type];
                } else if (key && Com.isNotBlank(options.iconClass.classMap[key])) {
                    return options.iconClass.classMap[key];
                }

                return (item.isParent || Com.isArray(item.children || (item.isParent).toString().toUpperCase() === 'TRUE')) ? options.iconClass.whole[type] : options.iconClass.leafClass;
            }
        }

        /**
         * 树节点点击事件
         */
        function initToggleEvent() {
            // 正常模式
            treeObj.find(".reso-tree-menu").off("click").on("click", function (e) {
                treeObj.find('.reso-tree-menu').removeClass('active');
                $(this).addClass('active');
                var opened = null;
                $(this).next().slideToggle('fast');
                var collapseIcon = $(this).find('.collapse-icon');
                var itemIcon = $(this).find('.icon');
                if (collapseIcon.hasClass('glyphicon-plus-sign')) {
                    collapseIcon.removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                    // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-open-cls'));
                    opened = true;
                    changeItemIcon(itemIcon, true);
                } else if (collapseIcon.hasClass('glyphicon-minus-sign')) {
                    collapseIcon.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                    // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-close-cls'));
                    opened = false;
                    changeItemIcon(itemIcon, false);
                }

                var aIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');
                options.activeIndex = aIndex;
                that.onChange(getItem(options.activeIndex), opened);
            });

            treeObj.find('.reso-tree-menu .collapse-icon').off('click').on('click', function (e) {
                $(this).parent().next().slideToggle('fast');
                var opened = null;
                var itemIcon = $(this).parent().find('.icon');
                if ($(this).hasClass('glyphicon-plus-sign')) {
                    $(this).removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                    // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-open-cls'));
                    opened = true;
                    changeItemIcon(itemIcon, true);
                } else if ($(this).hasClass('glyphicon-minus-sign')) {
                    $(this).removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                    // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-close-cls'));
                    opened = false;
                    changeItemIcon(itemIcon, false);
                }
                that.onChange(getItem($(this).parent().attr('data-index')), opened, false);
                e.stopPropagation();
            });

            // 选择模式
            if (options.checkable) {
                treeObj.find('.reso-tree-menu').addClass('checkable');
                treeObj.find('.reso-tree-menu .item-span').off('click').on('click', function (e) {
                    var _this_item_div = $(this).parent();
                    if (!options.multiple) {
                        treeObj.find('.reso-tree-menu').removeClass('checked').find('.checked-icon').remove();
                        _this_item_div.hasClass('checked') ? unchecked(_this_item_div) : checked(_this_item_div);
                    } else {
                        var bool = false;
                        if (_this_item_div.hasClass('checked')) {
                            unchecked(_this_item_div);
                            if (options.checkRelated) {
                                uncheckAllSon(_this_item_div);
                                allParentsRemoveCheckedClass(_this_item_div);
                                parentsAddcheckedClass(_this_item_div);
                            }
                            bool = false;
                        } else {
                            checked(_this_item_div);
                            if (options.checkRelated) {
                                checkAllSon(_this_item_div);
                                allParentsAddCheckedClass(_this_item_div);
                                if (isSiblingsAllChecked(_this_item_div.parent())) {
                                    parentsAddCheckedIcon(_this_item_div);
                                }
                            }
                            bool = true;
                        }
                    }
                    nodeMap[_this_item_div.attr('data-index')].checked = bool;
                    if (typeof options.onCheck == 'function') {
                        options.onCheck(getItem(_this_item_div.attr('data-index')), bool);
                    }

                    e.stopPropagation();
                });

                that.unCheckAll();
                checkNodes(checkedItems)
            }

            // 左键点击出现菜单
            if (options.showRightMenuOnLeftClick) {
                treeObj.find('.reso-tree-menu .item-span').off('click').on('click', function (e) {
                    treeObj.find('.reso-tree-menu').removeClass('active');
                    $(this).parent().addClass('active');
                    options.activeIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');
                    onRightClick($(this).parent());
                    e.stopPropagation();
                })
            }

            // 双击事件
            if (typeof options.onDblclick == 'function') {
                treeObj.find(".reso-tree-menu .item-span").off('click').on('click', function (e) {
                    treeObj.find('.reso-tree-menu').removeClass('active');
                    $(this).parent().addClass('active');
                    options.activeIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');
                    that.onChange(getItem(options.activeIndex));
                    e.stopPropagation();
                });

                treeObj.find(".reso-tree-menu .item-span").dblclick(function (e) {
                    options.onDblclick(getItem(options.activeIndex));
                });
            }

            if (options.rightClickable) {
                document.oncontextmenu = function (e) {
                    e.preventDefault();
                };
            }
            // 右键事件
            treeObj.find(".reso-tree-menu").off('mousedown').on('mousedown', function (e) {
                if (e.button == 2) {
                    treeObj.find('.reso-tree-menu').removeClass('active');
                    $(this).addClass('active');
                    options.activeIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');
                    onRightClick($(this));
                }
            });

            // 默认展开位置
            if (options.activeIndex != '-1') {
                activeIndex = options.activeIndex;
                (options.activeIndex).toUpperCase() == 'ALL' ? that.openAllNodes()
                    : that.openNodes(options.activeIndex);
            }

            // load success
            if (typeof options.onLoadSuccess == 'function') {
                options.onLoadSuccess(that);
            }

            if (options.alarmFlash.show) {
                if (parseInt(options.alarmFlash.timeout) > 0) {
                    setTimeout(function () {
                        for (var i = parseInt(options.alarmFlash.level); i <= 5; i++) {
                            treeObj.find('.radiusPoint').removeClass('alarm-flash-level-' + i);
                        }
                    }, options.alarmFlash.timeout);
                }
            }
            //给父节点增加事件，并且组织父节点继续冒泡
            $("#resoTree_groupTree").find('li').unbind().bind('dblclick',function (e) {
                e.stopPropagation();
                $this=$(this);
                var check_id = $this.find('.reso-tree-menu').attr("data-index");//左边树的id
                var check_name = $this.find(".item-span").attr("title"); //左边树的name
                var data=$("#itsmOrganizationTable").bootstrapTable('getData');
                var isFalse=false;
                if(data.length==0){
                    var tmp={};
                    tmp.id=check_id;
                    tmp.name=check_name;
                    data.push(tmp);
                }else {
                    for(var i=0;i<data.length;i++){
                        if(data[i].id!=check_id){
                            isFalse=false;
                        }else {
                            return isFalse=true;
                        }
                    }
                    if(isFalse==false){
                        var _tmp={};
                        _tmp.id=check_id;
                        _tmp.name=check_name;
                        data.push(_tmp);
                    }
                }
                creatGroupTable(data);
            })
        }

        /**
         * 追加节点后，需要给新节点追加事件
         * @param target
         */
        function appendToggleEvent(target) {
            target.find(".reso-tree-menu").off("click").on("click", function () {
                treeObj.find('.reso-tree-menu').removeClass('active');
                $(this).addClass('active');

                var opened = null;
                $(this).next().slideToggle('fast');
                var collapseIcon = $(this).find('.collapse-icon');
                var itemIcon = $(this).find('.icon');
                if (collapseIcon.hasClass('glyphicon-plus-sign')) {
                    collapseIcon.removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                    // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-open-cls'));
                    changeItemIcon(itemIcon, true);
                    opened = true;
                } else if (collapseIcon.hasClass('glyphicon-minus-sign')) {
                    collapseIcon.removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                    // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-close-cls'));
                    changeItemIcon(itemIcon, false);
                    opened = false;
                }

                var aIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');
                options.activeIndex = aIndex;
                that.onChange(getItem(options.activeIndex), opened);
            });

            target.find('.reso-tree-menu .collapse-icon').off('click').on('click', function (e) {
                $(this).parent().next().slideToggle('fast');
                var opened = null;
                var itemIcon = $(this).parent().find('.icon');
                if ($(this).hasClass('glyphicon-plus-sign')) {
                    $(this).removeClass('glyphicon-plus-sign').addClass('glyphicon-minus-sign');
                    // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-open-cls'));
                    opened = true;
                    changeItemIcon(itemIcon, true);
                } else if ($(this).hasClass('glyphicon-minus-sign')) {
                    $(this).removeClass('glyphicon-minus-sign').addClass('glyphicon-plus-sign');
                    // itemIcon.removeClass().addClass('icon ' + itemIcon.attr('data-close-cls'));
                    opened = false;
                    changeItemIcon(itemIcon, false);
                }
                that.onChange(getItem($(this).parent().attr('data-index')), opened, false);
                e.stopPropagation();
            });

            if (options.checkable) {
                target.find('.reso-tree-menu').addClass('checkable');
                target.find('.reso-tree-menu .item-span').off('click').on('click', function (e) {
                    var _this_item_div = $(this).parent();
                    if (!options.multiple) {
                        treeObj.find('.reso-tree-menu').removeClass('checked').find('.checked-icon').remove();
                        _this_item_div.hasClass('checked') ? unchecked(_this_item_div) : checked(_this_item_div);
                    } else {
                        var bool = false;
                        if (_this_item_div.hasClass('checked')) {
                            unchecked(_this_item_div);
                            if (options.checkRelated) {
                                uncheckAllSon(_this_item_div);
                                allParentsRemoveCheckedClass(_this_item_div);
                                parentsAddcheckedClass(_this_item_div);
                            }

                            bool = false;
                        } else {
                            checked(_this_item_div);
                            if (options.checkRelated) {
                                checkAllSon(_this_item_div);
                                allParentsAddCheckedClass(_this_item_div);
                                if (isSiblingsAllChecked(_this_item_div.parent())) {
                                    parentsAddCheckedIcon(_this_item_div);
                                }
                            }
                            bool = true;
                        }
                    }

                    nodeMap[_this_item_div.attr('data-index')].checked = bool;
                    if (typeof options.onCheck == 'function') {
                        options.onCheck(getItem(_this_item_div.attr('data-index')), bool);
                    }

                    e.stopPropagation();
                });

                // that.unCheckAll();
                // checkNodes(checkedItems)
            }

            target.find(".reso-tree-menu").off('mousedown').on('mousedown', function (e) {
                if (e.button == 2) {
                    treeObj.find('.reso-tree-menu').removeClass('active');
                    $(this).addClass('active');
                    options.activeIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');
                    onRightClick($(this));
                }
            });

            if (typeof options.onDblclick == 'function') {
                target.find(".reso-tree-menu .item-span").off('click').on('click', function (e) {
                    treeObj.find('.reso-tree-menu').removeClass('active');
                    $(this).parent().addClass('active');
                    options.activeIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');

                    that.onChange(getItem(options.activeIndex));
                    e.stopPropagation();
                });

                target.find(".reso-tree-menu .item-span").dblclick(function (e) {
                    options.onDblclick(getItem(options.activeIndex));
                });
            }

            if (options.showRightMenuOnLeftClick) {
                target.find('.reso-tree-menu .item-span').off('click').on('click', function (e) {
                    treeObj.find('.reso-tree-menu').removeClass('active');
                    $(this).parent().addClass('active');
                    options.activeIndex = target.find(".reso-tree-menu.active").attr('data-index');
                    onRightClick($(this).parent());
                    e.stopPropagation();
                })
            }

            if (options.alarmFlash.show) {
                if (parseInt(options.alarmFlash.timeout) > 0) {
                    setTimeout(function () {
                        for (var i = parseInt(options.alarmFlash.level); i <= 5; i++) {
                            treeObj.find('.radiusPoint').removeClass('alarm-flash-level-' + i);
                        }
                    }, options.alarmFlash.timeout);
                }
            }

            if (options.rightClickable) {
                // 右键事件
                document.oncontextmenu = function (e) {
                    e.preventDefault();
                };
            }
            treeObj.find(".reso-tree-menu").off('mousedown').on('mousedown', function (e) {
                if (e.button == 2) {
                    treeObj.find('.reso-tree-menu').removeClass('active');
                    $(this).addClass('active');
                    options.activeIndex = treeObj.find(".reso-tree-menu.active").attr('data-index');
                    onRightClick($(this));
                }
            });
            //给新增子节点增加双击事件
            target.find(".reso-tree-menu").off('dblclick').on('dblclick',function(e){
                e.stopPropagation();   //  阻止事件冒泡
                $this=$(this);
                var check_id = $this.attr("data-index");
                var check_name = $this.find(".item-span").attr("title");
                var data=$("#itsmOrganizationTable").bootstrapTable('getData');
                var isFalse=false;
                if(data.length==0){
                    var tmp={};
                    tmp.id=check_id;
                    tmp.name=check_name;
                    data.push(tmp);
                }else {
                    for(var i=0;i<data.length;i++){
                        if(data[i].id!=check_id){
                            isFalse=false;
                        }else {
                            return isFalse=true;
                        }
                    }
                    if(isFalse==false){
                        var _tmp={};
                        _tmp.id=check_id;
                        _tmp.name=check_name;
                        data.push(_tmp);
                    }
                }
                creatGroupTable(data);
            });
        }
        function changeItemIcon(iconObj, opened) {
            var iconType = iconObj.attr('data-type');
            var newIconAttr = opened ? 'data-open-cls' : 'data-close-cls';
            iconType === 'img' ? iconObj.attr('src', iconObj.attr(newIconAttr))
                : iconObj.removeClass().addClass('icon ' + iconObj.attr(newIconAttr));
        }

        /**
         * 右键点击事件
         * @param _that
         */
        function onRightClick(_that) {
            if (!options.rightClickable) {
                return;
            }

            var index = _that.attr('data-index');
            if (typeof options.beforeRightMenuShow == 'function') {
                options.beforeRightMenuShow(getItem(index));
            }

            rmenu.removeClass('disable');
            if (_that.hasClass('disable')) {
                rmenu.addClass('disable');
            }

            rmenu.css({
                top: (parseInt(_that.position().top) + 10) + 'px',
                left: (parseInt(_that.position().left) + 70) + 'px',
                visibility: 'visible'
            });
            rmenu.show();

            rmenu.find('ul li').each(function (i) {
                $(this).addClass('forbid-in-disabled');
                if (Com.isArray(options.enabledInAnyCase) && options.enabledInAnyCase.indexOf(parseInt(i)) >= 0) {
                    $(this).removeClass('forbid-in-disabled').addClass('enabled-in-any-case');
                }
            });

            //编辑节点
            $('#' + rmenu.attr('id') + '_editBtn').off('click').on('click', function () {
                // that.editNodes(index);
                if (typeof (options.onEdit == 'function') && !rmenu.hasClass('disable')) {
                    options.onEdit(getItem(index));
                }
                rmenu.hide();
            });

            //删除本节点
            $('#' + rmenu.attr('id') + '_delBtn').off('click').on('click', function () {
                if (typeof options.onRemove == 'function' && !rmenu.hasClass('disable')) {
                    options.onRemove(getItem(index));
                }
                rmenu.hide();
            });

            //删除本节点
            $('#' + rmenu.attr('id') + '_removeAllSonBtn').off('click').on('click', function () {
                if (typeof options.onRemoveAllSon == 'function' && !rmenu.hasClass('disable')) {
                    options.onRemoveAllSon(getItem(index));
                }
                rmenu.hide();
            });

            //新增子节点
            $('#' + rmenu.attr('id') + '_addNewBtn').off('click').on('click', function () {
                if (typeof options.onAddNew == 'function' && !rmenu.hasClass('disable')) {
                    options.onAddNew(getItem(index))
                }
                rmenu.hide();
            });

            //新增兄弟节点
            $('#' + rmenu.attr('id') + '_addNewBroBtn').off('click').on('click', function () {
                var pIndex = _that.parent().parent().prev().attr('data-index');
                pIndex = pIndex != undefined ? pIndex : '-1';
                if (typeof options.onAddNew == 'function' && !rmenu.hasClass('disable')) {
                    options.onAddNew(getItem(pIndex))
                }
                rmenu.hide();
            });

            //下方新增节点
            $('#' + rmenu.attr('id') + '_addNewDownBtn').off('click').on('click', function () {
                rmenu.hide();
            });


            // 上移
            $('#' + rmenu.attr('id') + '_UpBtn').off('click').on('click', function () {
                rmenu.hide();
            });

            // 下移
            $('#' + rmenu.attr('id') + '_DownBtn').off('click').on('click', function () {
                rmenu.hide();
            });

            if (options.defineRightMenu) {
                rmenu.find('ul li').each(function (i) {
                    $(this).off('click').on('click', function () {
                        var forbid = !(rmenu.hasClass('disable') &&
                            !(Com.isArray(options.enabledInAnyCase) && options.enabledInAnyCase.indexOf(parseInt(i)) >= 0));
                        if (typeof options.onRightMenuItemClick == 'function' && forbid) {
                            options.onRightMenuItemClick(i, getItem(index));
                        }
                        rmenu.hide();
                    })
                })
            }
        }

        /**
         * 获取节点信息
         * @param index
         * @param items
         * @returns {*}
         */
        function getItem(index) {
            // for (var i in treeItems) {
            //     if (treeItems[i].index == index) {
            //         return treeItems[i];
            //     }
            // }
            // return null;
            return nodeMap[index];
        }

        /**
         * 是否使用简单数据格式
         * @param items
         * @returns {*}
         */
        function checkDataType(items) {
            if (!options.simpleDataType) {
                // normLDataToSimpleData(JSON.parse(JSON.stringify(items))).forEach(function(node){
                //     nodeMap[node[options.indexField]] = node;
                // });
                return items;
            }
            return simpleDataTypeToNormalDataType(items, options.indexField, options.pIndexField);
        }

        /**
         * 简单关系型数据转树形数据
         * @param sNodes
         * @returns {*}
         */
        function simpleDataTypeToNormalDataType(sNodes, key, parentKey) {
            var i, l,
                key = key || 'index',
                parentKey = parentKey || 'pIndex',
                childKey = 'children';
            if (!key || key == "" || !sNodes) return [];

            if (options.initTreeWithPath.enable) {
                key = options.indexField = 'pathIndex';
                parentKey = options.pIndexField = 'pPathIndex';
            }

            if (Array.isArray(sNodes) && sNodes.length) {
                var r = [];
                var tmpMap = {};
                for (i = 0, l = sNodes.length; i < l; i++) {
                    if (options.initTreeWithPath.enable) {
                        sNodes[i][key] = (sNodes[i][options.initTreeWithPath.pathField]);
                        sNodes[i][parentKey] = (getpIndex2(sNodes[i][options.initTreeWithPath.pathField]));
                    }
                    // nodeMap[sNodes[i][key]] = sNodes[i];
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
                return sNodes;
            }

            function getpIndex2(item) {
                var tempArray = item.split(options.initTreeWithPath.split);
                tempArray.splice(tempArray.length - 1, 1);
                return tempArray.join(options.initTreeWithPath.split);
            }

            // function replaceAll(str){
            //     re = new RegExp("/", "g");
            //     return str.replace(re, '@');
            // }
        }

        /**
         * 树形数据转关系型数据
         * @param items
         * @returns {Array}
         */
        function normLDataToSimpleData(items) {
            var tempArray = [];

            function toSimpleDataType(items, rootIndex) {
                for (var i in items) {
                    if (Com.isArray(items[i].children)) {
                        toSimpleDataType(items[i].children, items[i][options.indexField]);
                    }
                    items[i][options.pIndexField] = rootIndex ? rootIndex : '-1';
                    items[i].children = '';
                    tempArray.push(items[i]);
                }
            }

            toSimpleDataType(items);
            return tempArray;
        }

        function checkNodes(items) {
            var temp = [];
            items.forEach(function (item) {
                var subNodes = that.getGenerations(item[options.indexField]);
                var itemSubNodes = getGenerations(item[options.indexField], items);

                // 判断结点的祖先节点是否被选中
                var ancestorIndex = [], tempAncestorIndex = [];
                that.getAncestor(item[options.indexField]).forEach(function (_item, index) {
                    ancestorIndex.push(_item[options.indexField]);
                });
                getAncestor(item[options.indexField], temp).forEach(function (_item, index) {
                    tempAncestorIndex.push(_item[options.indexField]);
                });

                // if ((subNodes.length - 1 == itemSubNodes.length || itemSubNodes.length - 1 === 0 ) && !hasSameElement(tempAncestorIndex, ancestorIndex)) {
                //     temp.push(item);
                // }
                if (itemSubNodes.length - 1 === 0) {
                    temp.push(item);
                }
            });
            temp.forEach(function (item, index) {
                treeObj.find('.reso-tree-menu[data-index="' + item[options.indexField] + '"] .item-span').click();
            });

            // 检查两个数组是否有相同元素
            function hasSameElement(array1, array2) {
                for (var i in array1) {
                    if ($.inArray(array1[i].toString(), array2) !== -1) {
                        return true;
                    }
                }
                return false;
            }
        }

        /**
         * 选中节点
         * @param dom
         */
        function checked(dom) {
            dom.addClass('checked');
            if (!dom.find('.checked-icon').length) {
                dom.append('<span class="checked-icon glyphicon glyphicon-ok "></span>');
            }
            if(nodeMap[dom.attr('data-index')]) nodeMap[dom.attr('data-index')].checked = true;
        }

        /**
         * 取消选中
         * @param dom
         */
        function unchecked(dom) {
            dom.removeClass('checked');
            dom.find('.checked-icon').remove();
            if(nodeMap[dom.attr('data-index')]) nodeMap[dom.attr('data-index')].checked = false;
        }

        /**
         * 选中所有子节点
         * @param dom
         */
        function checkAllSon(dom) {
            dom.next().children().each(function () {
                checked($(this).find('.reso-tree-menu'));
            })
        }

        /**
         * 取消选中所有子节点
         * @param dom
         */
        function uncheckAllSon(dom) {
            dom.next().children().each(function () {
                unchecked($(this).find('.reso-tree-menu'));
            })
        }

        /**
         * allParentsRemoveCheckedClass
         * @param dom
         */
        function allParentsRemoveCheckedClass(dom) {
            if (dom.parent().parent().prev().hasClass('reso-tree-menu')) {
                var pDom = dom.parent().parent().prev();
                unchecked(pDom);
                allParentsRemoveCheckedClass(pDom);
            }
        }

        /**
         * allParentsAddCheckedClass
         * @param dom
         */
        function allParentsAddCheckedClass(dom) {
            if (dom.parent().parent().prev().hasClass('reso-tree-menu')) {
                dom.parent().parent().prev().addClass('checked');
                allParentsAddCheckedClass(dom.parent().parent().prev());
            }
        }

        /**
         * parentsAddCheckedIcon
         * @param dom
         */
        function parentsAddCheckedIcon(dom) {
            var pDom = dom.parent().parent().prev();
            if (pDom.hasClass('reso-tree-menu')) {
                checked(pDom);
                if (isSiblingsAllChecked(pDom.parent())) {
                    parentsAddCheckedIcon(pDom);
                }
            }
        }

        /**
         * parentsAddcheckedClass
         * @param dom
         */
        function parentsAddcheckedClass(dom) {
            var pDom = dom.parent().parent().prev();
            if (isSibingsHasChecked(dom.parent())) {
                if (pDom.hasClass('reso-tree-menu')) {
                    pDom.addClass('checked');
                    allParentsAddCheckedClass(pDom);
                    return;
                }
            }

            if (pDom.parent().parent().hasClass('son-menu')) {
                parentsAddcheckedClass(pDom);
            }
        }

        /**
         * isSiblingsAllChecked
         * @param dom
         * @returns {boolean}
         */
        function isSiblingsAllChecked(dom) {
            var bool = true;
            dom.siblings().each(function () {
                var _that = $(this);
                if ($('#' + _that.attr('id').substr(3)).find('.checked-icon').length <= 0) {
                    bool = false;
                }
            });
            return bool;
        }

        /**
         * isSibingsHasChecked
         * @param dom
         * @returns {boolean}
         */
        function isSibingsHasChecked(dom) {
            var bool = false;
            dom.siblings().each(function () {
                var _that = $(this);
                if ($('#' + _that.attr('id').substr(3)).find('.checked-icon').length) {
                    bool = true;
                }
            });
            return bool;
        }

        that.getParentNode = function (index) {
            return getParentNode(getItem(index), treeItems, options.pIndexField, options.indexField);
        };

        function getParentNode(item, items, pIndexField, indexField) {
            var bool = null;
            items.forEach(function (itm) {
                if (itm[indexField] == item[pIndexField]) {
                    bool = itm;
                }
            });
            return bool;
        }

        /**
         * 取子节点，方法内自用
         * @param index
         * @param items
         * @param pIndexField
         * @returns {Array}
         */
        function getSonNodes(index, items, pIndexField) {
            var result = [];
            items.forEach(function (itm) {
                if (itm[pIndexField] == index) {
                    result.push(itm);
                }
            });
            return result;
        }

        function getGenerations(index, items) {
            var generations = that.getGenerations(index);
            var indexArray = [], results = [];
            generations.forEach(function (_item) {
                indexArray.push(_item[options.indexField]);
            });
            items.forEach(function (_item, _index) {
                if ($.inArray(_item[options.indexField], indexArray) !== -1) {
                    results.push(_item);
                }
            });
            return results;
        }

        function getAncestor(index, items) {
            var item = getItem(index);
            if (item == null) {
                return [];
            }
            var results = [];
            var pNode = getParentNode(item, items, options.pIndexField, options.indexField);
            if (pNode == null) {
                return [];
            }
            results.push(pNode);
            if (Com.isNotBlank(pNode[options.pIndexField]) && pNode[options.pIndexField] != '-1') {
                var temps = getAncestor(pNode[options.indexField], items);
                if (Com.isArray((temps))) {
                    temps.forEach(function (_item, _index) {
                        results.push(_item);
                    })
                }
            }
            return results;
        }

        /**
         * 获得兄弟节点，方法内自用
         * @param item
         * @param items
         * @param pIndexField
         * @returns {Array}
         */
        function getBroNodes(item, items, pIndexField) {
            var result = [];
            items.forEach(function (itm) {
                if (item[pIndexField] == itm[pIndexField]) {
                    result.push(itm);
                }
            });
            return result;
        }

        return that;
    }

    /**
     * 倒计时定时器
     * @returns {DescTmer}
     * @constructor
     */
    function DescTimer() {
        var that = this;
        var targetObj = null;
        var timer = null;
        var options = null;
        var DEFAULT = {
            callback: null,
            defaultTime: 60,
            showRefreshBtn: true,
            onRefresh: null
        };

        /**
         * 生成计时器
         */
        that.initTimer = function (target, option) {
            targetObj = $('#' + target);
            options = $.extend({}, DEFAULT, option);

            targetObj.addClass(targetObj.hasClass('dropdown') ? '' : 'dropdown');
            targetObj.html('');
            var dropDownBtn = target + '_btn';
            var timerContent =
                '<button id="' + dropDownBtn + '" class="btn dropdown-toggle" data-toggle="dropdown" type="button">' +
                '   <span class="desc-timer-title">' + (parseInt(option.defaultTime) <= 0 ? '关闭' : (option.defaultTime + 's')) + '</span>' +
                '   <span class="glyphicon glyphicon-menu-down"/>' +
                '</button>' +
                '<button type="button" class="btn-link" style="display: ' + (options.showRefreshBtn ? '' : 'none') + '"><i class="glyphicon glyphicon-refresh"></i></button>' +
                '<ul id="timer-select" class="dropdown-menu" aria-labelledby="' + dropDownBtn + '">' +
                '   <li><a data-value="30">30s</a></li>' +
                '   <li><a data-value="60">60s</a></li>' +
                '   <li><a data-value="-1">关闭</a></li>' +
                '</ul>';

            targetObj.append(timerContent);
            initTimerInterval();
            startTimer(option.defaultTime);
        };
        //手动刷新
        that.refresh = function(){
            targetObj.find('.btn-link').click();
        };
        /**
         * 立即执行callback
         */
        that.callback = function () {
            if (typeof options.callback == 'function') {
                options.callback();
            }
        };
        that.start = function () {
            initTimerInterval();
            startTimer(currentTimeSec);
            isFromStart = true;
            isStop = false;
        };
        that.stop = function() {
            clearInterval(timer);
            isStop = true;
        };
        var currentTimeSec = 30;
        var currentPeriod = 30;
        var isFromStart = false;
        var checkPeriod = null;
        var isStop = false;

        function initTimerInterval() {
            targetObj.find('ul.dropdown-menu li a').off('click').on('click', function () {
                var time = parseInt($(this).attr('data-value'));
                currentPeriod = time;
                targetObj.find('.desc-timer-title').text(time == -1 ? '关闭' : (time + 's'));
                checkPeriod = time;
                clearInterval(timer);
                if (time != -1) {
                    startTimer(time);
                }
            });

            targetObj.find('.btn-link').off('click').on('click', function () {
                if(isStop){
                    Com.tips('树刷新取消', '上次请求尚未完成，请稍后再刷新...', 'warning');
                    return;
                }
                if(targetObj.find('.desc-timer-title').text() === '关闭'){
                    Com.tips('失败', '树刷新已关闭，请打开树刷新功能再试...', 'warning');
                    return;
                }
                checkPeriod = checkPeriod || 30;
                targetObj.find('.desc-timer-title').text(checkPeriod == -1 ? '关闭' : (checkPeriod + 's'));
                clearInterval(timer);
                if (checkPeriod != -1) {
                    startTimer(checkPeriod);
                    currentTimeSec = checkPeriod;
                }
                that.callback();
                if (typeof options.onRefresh == 'function') {
                    options.onRefresh();
                }
            })
        }

        function startTimer(period) {
            var tempPeriod = parseInt(period);
            if (tempPeriod <= 0) {
                return;
            }
            timer = setInterval(function () {
                targetObj.find('.desc-timer-title').text(tempPeriod + 's');
                if (tempPeriod == 0 && typeof options.callback == 'function') {
                    options.callback();
                }
                if(isFromStart && tempPeriod === 0){
                    isFromStart = false;
                    period = currentPeriod; //重置回倒数周期
                }
                tempPeriod = tempPeriod == 0 ? parseInt(period) : tempPeriod - 1;
                currentTimeSec = tempPeriod;
            }, 1000);
        }

        return that;
    }

    /**
     * 单选下拉框
     * @returns {SingleSelecter}
     */
    function SingleSelecter() {
        var that = this;
        var targetObj = null;
        var selectorDom = null;
        var options = null;
        var currOption = null;
        var oldOption = null;
        var inputTimeout = null;
        var DEFAULT = {
            loadType: 'local',            //'local' or 'server',默认local
            url: '',                 //远程加载时的url
            method: 'GET',           //远程加载时的方法，get or post
            contentType: '',
            dataField: '',           //存放真实选项数组的头部，默认为 'data'
            totalField: '',
            valueField: 'value',     //远程加载时 单项实际vale 的字段名，默认'value'
            titleField: 'title',     //远程加载时 单项显示标题 的字段名，默认'title'
            iconField: 'icon',

            inputAble: false,
            clearAble: true,
            floatTop: Com.isIE(),
            creatable: false,
            readonly: false,

            defaultValue: '-1', //默认选项
            width: '',          //按钮长度
            height: '500px',
            options: [],
            onSelect: null,     //选择事件
            onDeSelect: null,
            placeholder: '请选择...',
            queryParams: function (params) {
                return params;
            },
            responseHandler: function (data) {
                return data;
            },
            onLoadSuccess: function () {

            },
            btnIconClass: '',
            btnClass: '',
            caret: true
        };

        that.destroy = function () {
            if (targetObj) {
                selectorDom.html('');
                targetObj.html(selectorDom.prop('outerHTML'));
                // targetObj.html('<select id="' + selectorDom.attr('id') + '"></select>');
                $('#' + selectorDom.attr('id') + '_ul').remove();
            }
            targetObj = null;
            selectorDom = null;
            options = null;
            currOption = null;
            oldOption = null;
            inputTimeout = null;
            DEFAULT = {
                loadType: 'local',
                url: '',
                method: 'GET',
                contentType: '',
                dataField: '',
                totalField: '',
                valueField: 'value',
                titleField: 'title',
                iconField: 'icon',
                inputAble: false,
                clearAble: true,
                floatTop: Com.isIE(),
                creatable: false,

                btnIconClass: '',
                btnClass: '',
                caret: true,
                onSelect: null,
                defaultValue: '-1',
                width: '',
                height: '500px',
                options: [],
                onDeSelect: null,

                placeholder: '请选择...',
                queryParams: function (params) {
                    return params;
                },
                responseHandler: function (data) {
                    return data;
                },
                onLoadSuccess: function () {

                },
                readonly: false
            };

            return that;
        };

        that.initSelecter = function (target, option) {
            that.destroy();
            selectorDom = $('#' + target);
            targetObj = $('#' + target);
            selectorDom.html('');
            $('#' + target + '_ul').remove();
            options = $.extend({}, DEFAULT, option);

            init(target);
            selectorDom.data('singleSelect', that);
        };

        that.initSelectWithDom = function (dom, option) {
            that.destroy();
            selectorDom = $(dom);
            targetObj = $(dom);

            options = $.extend({}, DEFAULT, option);
            options.readonly = options.readonly || options.readOnly;
            if (options.loadType === 'local') {
                selectorDom.find('option').each(function () {
                    options.options.push({
                        value: $(this).attr('value'),
                        title: $(this).text()
                    });
                    if ($(this).attr('selected') == 'selected') {
                        options.defaultValue = $(this).attr('value');
                    }
                });
            } else {
                selectorDom.html('');
            }
            $('#' + selectorDom.attr('id') + '_ul').remove();

            var selectId = selectorDom.attr('id') || (Com.randomChar() + '_single-select');
            selectorDom.attr('id', selectId);
            init(selectorDom.attr('id'));
        };

        function init(target) {
            selectorDom.html('');
            selectorDom.addClass('single-selector');
            targetObj.addClass(targetObj.hasClass('dropdown') ? '' : 'dropdown');
            if (selectorDom.parent().hasClass('single-selector')) {
                selectorDom.parent().html('').append(selectorDom);
            } else {
                selectorDom.wrap('<div class="single-selector ' + (options.readonly ? '' : 'dropdown') + '"></div>');
                selectorDom.parent().append(selectorDom);
            }
            targetObj = selectorDom.parent();
            if (options.readonly) {
                targetObj.removeClass('dropdown');
                selectorDom.removeClass('dropdown')
            }

            var dropDownBtn = target + '_btn';
            var readonly = options.readonly ? 'readonly="readonly"' : '';
            options.btnClass += options.readonly ? ' btn ' : ' btn ';
            var html = (options.inputAble ? ('<input id="' + dropDownBtn + '" class="input single-selector-title" placeholder="' + options.placeholder + '" style="padding-right: 25px;width: 100%;height:34px" ' + readonly + '>')
                : ('<button id="' + dropDownBtn + '" class="' + options.btnClass + '" type="button" style="padding-right:30px;height:34px" ' + readonly + '>' +
                    '   <i class="' + options.btnIconClass + '"/>' +
                    '   <span class="single-selector-title">' + options.placeholder + '</span>' +
                    '</button>') ) +
                '<i class="option-icon glyphicon glyphicon-menu-down" style="cursor:' + (readonly ? 'not-allowed' : 'pointer') + ';"/>' +
                '<i class="option-icon glyphicon glyphicon-remove" style="display: none"/>';

            var dropDownMenuID = target + '_ul';
            targetObj.append('<div class="single-selector-dropdown-content">' + html + '</div>');

            if (options.readonly) {
                $('#' + dropDownBtn).off('click').on('click', function () {
                    return false;
                }).off('focus').on('focus', function () {
                    return false;
                });
            }

            var ulHtml = '<ul id="' + dropDownMenuID + '" class="single-selector-ul"' +
                'style="max-height: ' + options.height + ';overflow-y: auto;width: ' + options.width + '"></ul>';

            options.floatTop ? $('body').append(ulHtml) : targetObj.find('.single-selector-dropdown-content').append(ulHtml);

            $('#' + dropDownBtn).css({width: options.width, 'overflow': 'hidden'});
            if (options.loadType.toLowerCase() === 'server') {
                Com.ajaxData(options.url, options.method, options.queryParams({}), function (data) {
                    data = options.responseHandler(data);
                    if(Com.isNotBlank(data)){
                        var datas = options.dataField == "" ? data : data[options.dataField];
                        if (Com.isArray(datas)) {
                            for (var i in datas) {
                                $('#' + dropDownMenuID).append(
                                    '<li><a data-value="' + datas[i][options.valueField] + '"><i class="' + datas[i][options.iconField] + '"></i>' + datas[i][options.titleField] + '</a></li>');
                                selectorDom.append('<option value="' + datas[i][options.valueField] + '">' + datas[i][options.titleField] + '</option>');
                                options.options.push($.extend({}, {
                                    value: datas[i][options.valueField],
                                    title: datas[i][options.titleField],
                                    icon: datas[i][options.iconField]
                                }, datas[i]));
                            }
                        }
                    }
                    initSelectorEvent();
                }, null, null, null, options.contentType);
            } else {
                if (Com.isArray(options.options)) {
                    var items = '';
                    for (var i in options.options) {
                        options.options[i].value = options.options[i][options.valueField];
                        options.options[i].icon = options.options[i][options.iconField];
                        options.options[i].title = options.options[i][options.titleField];

                        items += '<li><a data-value="' + options.options[i].value + '"><i class="' + options.options[i].icon + '"></i>' + options.options[i].title + '</a></li>';
                        selectorDom.append('<option value="' + options.options[i].value + '">' + options.options[i].title + '</option>');
                    }
                    $('#' + dropDownMenuID).append(items);
                }
                initSelectorEvent();
            }

            function initSelectorEvent() {
                initEvent();
                selectorDom.val('');
                if (getOption(options.defaultValue)) {
                    that.select(options.defaultValue);
                } else if (options.defaultValue != '-1' && options.defaultValue.indexOf('eq') >= 0) {
                    $('#' + dropDownMenuID + '.single-selector-ul li:' + options.defaultValue + ' a').click();
                }

                if (typeof options.onLoadSuccess === 'function') {
                    options.onLoadSuccess(that);
                }
            }
        }

        that.load = function (opt, defaultValue) {
            if (!Array.isArray(opt)) {
                if (!Array.isArray(opt.data)) {
                    return false;
                }
                defaultValue = (opt.defaultValue != undefined && opt.defaultValue != null) ? opt.defaultValue : defaultValue;
                opt = opt.data;
            }

            options.options = opt;
            var dropDownMenu = $('#' + selectorDom.attr('id') + '_ul');
            dropDownMenu.html('');
            selectorDom.html('');
            var items = '';
            for (var i in opt) {
                items += '<li><a data-value="' + opt[i][options.valueField] + '"><i class="' + opt[i][options.iconField] + '"></i>' + opt[i][options.titleField] + '</a></li>';
                selectorDom.append('<option value="' + opt[i][options.valueField] + '">' + opt[i][options.titleField] + '</option>');
            }
            dropDownMenu.append(items);
            initEvent();
            if (defaultValue === '-1') {
                that.deSelect();
            }
            defaultValue !== undefined ? that.select(defaultValue) : that.deSelect();
            return true;
        };

        /**
         * 获得当前选择值
         */
        that.getSelected = function () {
            return getOption(currOption);
        };

        /**
         * 设置选中
         */
        that.select = function (value) {
            oldOption = JSON.parse(JSON.stringify(currOption));
            currOption = value;
            var option = getOption(value);

            if (option) {
                options.inputAble ? targetObj.find('.single-selector-title').val(option.title) :
                    targetObj.find('.single-selector-title').text(option.title);
                targetObj.attr('title', option.title);

                selectorDom.val(value);
                if (typeof options.onSelect == 'function') {
                    options.onSelect(option, null, that);
                }
            } else if (Com.isNotBlank(value) && options.creatable) {
                var newItem = {};
                if (!getOption(value)) {
                    newItem[options.valueField] = value;
                    newItem[options.valueField] = value;
                    options.options.push(newItem);
                    selectorDom.append('<option value="' + value + '" selected>' + value + '</option>');
                    targetObj.find('ul.single-selector-ul').append('<li><a data-value="' + value + '"><i class=""></i>' + value + '</a></li>');
                }
                selectorDom.val(value);
                targetObj.find('.single-selector-title').val(value).text(value);
                targetObj.attr('title', value);
            }

            selectorDom.blur();
        };

        //取消所选
        that.deSelect = function () {
            options.inputAble ? targetObj.find('.single-selector-title').val('') :
                targetObj.find('.single-selector-title').text(options.placeholder);
            targetObj.attr('title', '');
            currOption = null;
            selectorDom.val('');
            if (typeof options.onDeSelect == 'function') {
                options.onDeSelect();
            }
            selectorDom.blur();
        };

        that.reposition = function () {
            if (options.floatTop) {
                var id = selectorDom.attr('id');
                var dropDownBtn = id + '_btn';
                var dropDownMenuID = id + '_ul';
                var offset = $('#' + dropDownBtn).offset();
                $('#' + dropDownMenuID).css('width',$('#' + dropDownBtn).css('width'));
                if(offset.top + 34 + $('#'+dropDownMenuID).height()  + 110> window.screen.height){
                    $('#' + dropDownMenuID).offset({top: offset.top -$('#'+dropDownMenuID).height() - 15 , left: offset.left});
                }else{
                    $('#' + dropDownMenuID).offset({top: offset.top + 36, left: offset.left});
                }
            }
        };

        function initEvent() {
            var inputBlurTimeout;
            var dropDownBtn = selectorDom.attr('id') + '_btn';
            var dropDownMenuID = selectorDom.attr('id') + '_ul';

            $('html').on('click', function (e) {
                $('#' + dropDownMenuID).hide();
            });

            $('#' + dropDownMenuID).css('width', $('#' + dropDownBtn).css('width'));

            targetObj.find('#' + dropDownBtn + ',.glyphicon-menu-down,.single-selector-title').off('click').on('click', function () {
                if (options.readonly) return false;
                $('ul.single-selector-ul').not('#' + dropDownMenuID).hide();
                $('#' + dropDownMenuID).toggle();
                if (options.floatTop) {
                    that.reposition();
                }else if(targetObj.offset().top + $('#' + dropDownMenuID).height() + 110 > window.screen.height){
                    $('#' + dropDownMenuID).css({
                        top: '-' + ($('#' + dropDownMenuID).height() + 15) + 'px'
                    })
                }
                return false;
            });

            //可清空
            if (options.clearAble && !options.readonly) {
                targetObj.off('mouseover').on('mouseover', function () {
                    if (currOption) {
                        targetObj.find('.glyphicon-remove').show();
                        targetObj.find('.glyphicon-menu-down').hide();
                    }
                }).off('mouseout').on('mouseout', function () {
                    targetObj.find('.glyphicon-remove').hide();
                    targetObj.find('.glyphicon-menu-down').show();
                });

                targetObj.find('.glyphicon-remove').off('click').on('click', function () {
                    that.deSelect();
                });
            }

            //选项点击事件
            targetObj.find('.single-selector-ul li a').off('click').on('click', function () {
                clearTimeout(inputBlurTimeout);
                targetObj.removeClass('error');
                oldOption = JSON.parse(JSON.stringify(currOption));

                options.inputAble ? targetObj.find('.single-selector-title').val($(this).text())
                    : targetObj.find('.single-selector-title').text($(this).text());
                targetObj.attr('title', $(this).text());
                currOption = $(this).attr('data-value');
                selectorDom.val(currOption);
                if (oldOption !== currOption && typeof options.onSelect === 'function') {
                    options.onSelect(getOption($(this).attr('data-value')), getOption(oldOption), that);
                }
                selectorDom.blur();
                targetObj.find('#' + dropDownMenuID).hide();
            });

            //菜单悬浮于主窗口
            if (options.floatTop) {
                selectorDom.addClass('reposition-able');
                $('#' + dropDownMenuID).removeClass().addClass('single-selector-ul float-top');

                $('#' + dropDownMenuID + ' li a').off('click').on('click', function () {
                    clearTimeout(inputBlurTimeout);
                    targetObj.removeClass('error');
                    oldOption = JSON.parse(JSON.stringify(currOption));

                    options.inputAble ? targetObj.find('.single-selector-title').val($(this).text())
                        : targetObj.find('.single-selector-title').text($(this).text());
                    targetObj.attr('title', $(this).text());
                    currOption = $(this).attr('data-value');
                    selectorDom.val(currOption);
                    if (oldOption != currOption && typeof options.onSelect == 'function') {
                        options.onSelect(getOption($(this).attr('data-value')), getOption(oldOption), that);
                    }
                    selectorDom.blur();
                    $('#' + dropDownMenuID).hide();
                    return false;
                });
            }

            if (options.inputAble) {
                targetObj.find('.single-selector-title').on('click', function () {
                    $('#' + dropDownMenuID).find('li').show();
                });

                targetObj.find('.single-selector-title').off('keyup').on('keyup', function () {
                    if ($(this).prop('readonly')) return false;
                    var obj = $(this);
                    if (inputTimeout) clearTimeout(inputTimeout);
                    inputTimeout = setTimeout(function () {
                        var content = obj.val();
                        if (Com.isBlank(content)) {
                            $('#' + dropDownMenuID).find('li').each(function () {
                                $(this).show();
                            })
                        } else {
                            $('#' + dropDownMenuID).find('li').hide();
                            $('#' + dropDownMenuID).find('li').each(function (index) {
                                if ($(this).find('a').text().indexOf(content) !== -1
                                    || $(this).find('a').text().toUpperCase().indexOf(content.toUpperCase()) !== -1) {
                                    $(this).show();
                                }
                            });
                        }
                        that.reposition()
                    }, 500);
                });

                targetObj.find('.single-selector-title').off('focus').on('focus', function () {
                    if ($(this).prop('readonly')) return false;
                    targetObj.removeClass('error');
                    var content = $(this).val();
                    if (Com.isNotBlank(content) && !Com.isArray(isInputInOptions(content)) && !options.creatable) {
                        $(this).val('');
                    }
                });

                targetObj.find('.single-selector-title').off('blur').on('blur', function () {
                    if ($(this).prop('readonly')) return false;
                    var content = $(this).val().trim();
                    clearTimeout(inputBlurTimeout);
                    inputBlurTimeout = setTimeout(function () {
                        if (Com.isBlank(content)) {
                            selectorDom.val(null);
                        } else if (options.creatable && !Com.isArray(isInputInOptions(content))) {
                            var newItem = {};
                            if (!getOption(content) && Com.queryOption(options.options, options.titleField, content).index == -1) {
                                newItem[options.valueField] = content;
                                newItem[options.valueField] = content;
                                options.options.push(newItem);
                                selectorDom.append('<option value="' + content + '">' + content + '</option>');
                                $('ul#' + dropDownMenuID).append('<li><a data-value="' + content + '"><i class=""></i>' + content + '</a></li>');
                            }
                            selectorDom.val(content);
                            selectorDom.trigger('change');
                            currOption = content;
                            targetObj.attr('title', content);
                            initEvent();
                        } else if (!Com.isArray(isInputInOptions(content))) {
                            targetObj.addClass('error');
                        }
                    }, 200);
                });
            }
            selectorDom.insertAfter(targetObj.find('.single-selector-dropdown-content'));
        }

        function isInputInOptions(option) {
            var res = [];
            options.options.forEach(function (o) {
                if (o.title == option) {
                    res.push(o);
                }
            });
            return res;
        }

        function getOption(value) {
            if (Com.isBlank(options)) return null;
            for (var i in options.options) {
                if (options.options[i][options.valueField] == value) {
                    return options.options[i];
                }
            }
            return null;
        }

        SingleSelecter.prototype.select = function (value) {
            that.select(value);
        };

        SingleSelecter.prototype.deSelect = function () {
            that.deSelect();
        };

        SingleSelecter.prototype.load = function (opt) {
            var options = JSON.parse(JSON.stringify(opt)).data;
            that.load(options);
        };

        SingleSelecter.prototype.getSelected = function () {
            return that.getSelected();
        };

        SingleSelecter.prototype.reposition = function () {
            that.reposition();
        };

        SingleSelecter.prototype.destroy = function () {
            that.destroy();
        };

        return that;
    }

    /**
     * 复选下拉框
     */
    function MultiSelecter() {
        var that = this;
        var selecterObj = null;
        var DEFAULT = {
            loadType: 'local',            //'local' or 'server',默认local
            url: '',                 //远程加载时的url
            method: 'GET',           //远程加载时的方法，get or post
            dataField: '',           //存放真实选项数组的头部，默认为 'data'
            valueField: 'value',     //远程加载时 单项实际vale 的字段名，默认'value'
            titleField: 'title',     //远程加载时 单项显示标题 的字段名，默认'title'
            iconField: 'icon',

            clearAble: true,
            allSelectedText: '全部',
            includeSelectAllOption: true,
            buttonWidth: '150px',
            selectedClass: 'selectedClass',
            buttonClass: '',
            maxHeight: 350,
            nonSelectedText: '请选择aa...',
            selectAllText: '全选',
            nSelectedText: '...',
            selectAllNumber: false,
            onChange: function (option, checked) {
            },
            onSelectAll: function () {
            },
            onDeselectAll: function () {
            },
            width: null,
            options: [],
            placeholder: '请选择...',
            queryParams: function (params) {
                return params;
            },
            responseHandler: function (data) {
                return data;
            },
            onLoadSuccess: function () {
            }
        };
        var options = null;

        that.initMultiSelecter = function (target, option) {
            options = $.extend({}, DEFAULT, option);
            options.nonSelectedText = options.placeholder;
            options.buttonClass = 'btn btn-default ' + options.buttonClass;

            selecterObj = $('#' + target);
            selecterObj.html('');
            selecterObj.wrap('<div class="multi-select"></div>');
            selecterObj.parents('.multi-select').html('').append(selecterObj);

            if (options.loadType == 'server') {
                Com.ajaxData(options.url, options.method, options.queryParams({}), function (data) {
                    data = options.responseHandler(data);
                    var datas = options.dataField == "" ? data : data[options.dataField];
                    if (Com.isArray(datas)) {
                        for (var i in datas) {
                            selecterObj.append('<option value="' + datas[i][options.valueField] + '">' + datas[i][options.titleField] + '</option>');
                            options.options.push({
                                value: datas[i][options.valueField],
                                title: datas[i][options.titleField]
                            });
                        }
                    }
                    initEvent();
                });
            } else {
                if (Com.isArray(options.options)) {
                    for (var i in options.options) {
                        selecterObj.append('<option value="' + options.options[i][options.valueField] + '">' + options.options[i][options.titleField] + '</option>');
                    }
                }
                initEvent();
            }
        };

        that.destroy = function () {
            selecterObj.multiselect('destroy');
        };

        // 全选
        that.selectAll = function () {
            selecterObj.multiselect('selectAll', false);
            selecterObj.multiselect('refresh');
            selecterObj.multiselect('updateButtonText');
        };

        // 取消全选
        that.deSelectAll = function () {
            selecterObj.multiselect('deselectAll', false);
            selecterObj.multiselect('refresh');
            selecterObj.multiselect('updateButtonText');
        };

        // 获得选择项
        that.getSelected = function () {
            if (selecterObj == undefined || selecterObj === null) {
                return null;
            }
            return selecterObj.val();
        };

        // 设置选择项
        that.select = function (value) {
            selecterObj.multiselect('select', value);
            selecterObj.multiselect('refresh');
            selecterObj.multiselect('updateButtonText');
        };

        function initEvent() {
            if (options.width) {
                options.buttonWidth = options.width;
            }
            selecterObj.multiselect(options);

            selecterObj.parent().find('.dropdown-menu').css({width: options.width});
            selecterObj.parent().find('.btn-group').find('button')
                .css({'text-align': 'left', 'padding-right': '25px'})
                .append('<i class="option-icon glyphicon glyphicon-menu-down"/>')
                .find('.caret').hide();

            selecterObj.parent().find('.btn-group')
                .append('<i class="mlti-select-clear-btn option-icon glyphicon glyphicon-remove" style="z-index: 100"></i>')
                .find('.glyphicon-remove').hide();

            if (options.clearAble) {
                selecterObj.parent().find('.btn-group').off('mouseover').on('mouseover', function () {
                    if (that.getSelected()) {
                        selecterObj.parent().find('.btn-group').find('.glyphicon-remove').show();
                        // selecterObj.parent().find('.btn-group').find('.glyphicon-menu-down').hide();
                    }
                }).off('mouseout').on('mouseout', function () {
                    selecterObj.parent().find('.btn-group').find('.glyphicon-menu-down').show();
                    selecterObj.parent().find('.btn-group').find('.glyphicon-remove').hide();
                });
            }

            selecterObj.parent().find('.btn-group').find('.mlti-select-clear-btn').off('mouseover').on('mouseover', function () {
                $(this).css({'color': '#929399'});
            }).off('click').on('click', function () {
                that.deSelectAll();
            });
            selecterObj.insertAfter(selecterObj.parent().find('.btn-group'));

            selecterObj.parent().find('ul.multiselect-container').find('li a label').each(function(){
                $(this).attr('title',$(this).text())
            });

            if (typeof options.onLoadSuccess === 'function') {
                options.onLoadSuccess();
            }
        }

        return that;
    }

    /**
     * 级联下拉框
     * @returns {CascaderSelecter}
     * @constructor
     */
    function CascaderSelecter() {
        var that = this;
        var targetObj = null;
        var dropdownMenu = null;
        var activeIndex = null;
        var DEFAULT = {
            width: '',                      //宽度，
            height: '',                     //下拉框最大高度
            simpleDataType: false,          //简单关系型数据
            join: ' / ',                    //连接符，默认‘/’
            clearAble: true,
            onSelect: null,                 //选择事件
            justShowLastNode: false,        //只展示叶子节点,默认true
            allNodesCanSelected: false,     //所有节点均可选择,默认false
            options: [],

            loadType: '',                //'local' or 'server',默认local，当值为'server'时,options不必填,只支持简单数据格式
            url: '',                     //远程加载时的url
            method: 'GET',               //远程加载时的方法，get or post
            dataField: '',               //存放真实选项数组的头部，默认为 ''
            valueField: 'value',         //远程加载时 单项实际vale 的字段名，默认'value'
            titleField: 'value',         //远程加载时 单项显示标题 的字段名，默认'title',
            pValueField: 'pValue',
            placeholder: '请选择...',
            queryParams: function (params) {      //在这里修改查询参数或追加参数,记得return
                return params;
            },
            responseHandler: function (data) {      //在这里修改响应结果,记得return
                return data;
            }
        };

        that.options = null;
        that.initSelecter = function (target, options) {
            that.options = $.extend({}, DEFAULT, options);
            targetObj = $('#' + target);

            targetObj.html('');
            targetObj.addClass(targetObj.hasClass('cascader-selecter') ? '' : ' cascader-selecter');

            var dropDownBtn = target + 'DropdownBtn';
            targetObj.append('<button id="' + dropDownBtn + '" type="button" title="请选择..." class="btn cascader-selecter-btn" style="padding-right: 30px">' +
                '<span class="cascader-selecter-title">' + that.options.placeholder + '</span>' +
                '</button>' +
                '<span class="glyphicon glyphicon-menu-down option-icon" />' +
                '<span class="glyphicon glyphicon-remove option-icon" style="display: none;z-index:400"/>');

            if (Com.isNotBlank(that.options.width)) {
                that.options.width += ((that.options.width).indexOf('px') > 0 ? '' : 'px');
                $('#' + dropDownBtn).css({width: that.options.width});
            }

            targetObj.append('<div class="dropdown-content"></div>');
            dropdownMenu = targetObj.find('.dropdown-content');

            if (that.options.loadType.indexOf('server') >= 0) {
                Com.ajaxData(that.options.url, that.options.method, that.options.queryParams({}), function (result) {
                    that.options.options = that.options.responseHandler(result);
                    // that.options.simpleDataType = true;
                    i();
                })
            } else {
                i();
            }

            function i() {
                initItem(that.options.options, target + '_mail_ul', 'mail_ul');
                initSelectListening($('#' + target + '_mail_ul'));
                initEvent();
            }

            dropdownMenu.hide();
            $('#' + dropDownBtn).off('click').on('click', function () {
                dropdownMenu.toggle();
            })
        };

        /**
         * 设置选中
         */
        that.select = function (value) {
            var item = getItem(value);
            var selectPath = getPath(value, JSON.parse(JSON.stringify(that.options.options)));
            if (selectPath != null) {
                activeIndex = value;
                var text = that.options.justShowLastNode ? item.label : path(selectPath, that.options.join);
                targetObj.find('.cascader-selecter-btn').prop('title', path(selectPath, that.options.join));
                targetObj.find('.cascader-selecter-title').text(text);
                targetObj.find('li').removeClass('active');
                targetObj.find('.son_ul').remove();
            }
        };

        /**
         * 获得选中项的值
         */
        that.getSelected = function () {
            return getItem(activeIndex);
        };

        /**
         * 获得选中的路径
         * @param value
         */
        that.getPath = function () {
            return activeIndex != null ? getPath(activeIndex, JSON.parse(JSON.stringify(that.options.options))) : null;
        };

        function initItem(array, menuId, menuClass) {
            array = that.options.simpleDataType ? Com.simpleDataTypeToNormalDataType(array, that.options.valueField, that.options.pValueField, 'children') : array;

            if (Com.isArray(array)) {
                var html = '<ul id="' + menuId + '" class="' + menuClass + '">';
                for (var i in array) {
                    html += '<li class="' + (Com.isArray(array[i].children) ? ' hadChildren' : ' ') + '" data-value="' + array[i][that.options.valueField] + '" title="'+array[i][that.options.titleField]+'"><a><span>' + array[i][that.options.titleField] + '</span></a>' +
                        (Com.isArray(array[i].children) ? '<i class="glyphicon glyphicon-menu-right right-arrow"></i>' : '') +
                        '</li>'
                }
                html += '</ul>';
                dropdownMenu.append(html);

                if (Com.isNotBlank(that.options.height)) {
                    that.options.height += (that.options.height).indexOf('px') ? '' : 'px';
                    $('#' + menuId).css({
                        height: that.options.height
                    })
                }
            }
        }

        function initSelectListening(target,groupName) {

            if (that.options.allNodesCanSelected) {
                target.find('a span').off('click').on('click', function (e) {
                    var element = $(this).parent().parent();
                    activeIndex = element.attr('data-value');
                    var text = that.options.justShowLastNode ? element.text() : path(that.getPath(), that.options.join);
                    targetObj.find('.cascader-selecter-btn').prop('title', path(that.getPath(), that.options.join));
                    targetObj.find('.cascader-selecter-title').text(text);
                    dropdownMenu.hide();
                    if (typeof that.options.onSelect == 'function') {
                        that.options.onSelect(getItem(activeIndex))
                    }
                    e.stopPropagation();
                });
            }

            target.find('li').each(function () {
                var element = $(this);
                element.off('click').on('click', function () {
                    target.nextAll().remove();
                    if (!element.hasClass('active')) {
                        target.find('li').removeClass('active');
                        element.addClass('active');
                    }

                    // 无子项设置选中
                    if (!element.hasClass('hadChildren')) {
                        activeIndex = element.attr('data-value');
                        var text = that.options.justShowLastNode ? element.text() : path(that.getPath(), that.options.join);
                        targetObj.find('.cascader-selecter-btn').prop('title', path(that.getPath(), that.options.join));
                        targetObj.find('.cascader-selecter-title').text(text);
                        dropdownMenu.hide();

                        if (typeof that.options.onSelect == 'function') {
                            that.options.onSelect(getItem(activeIndex))
                        }
                        return;
                    }
                    // 有子项继续展开
                    if ($('#' + element.attr('data-value') + '_sub_ul').length <= 0) {
                        initItem(getItem(element.attr('data-value'), that.options.options).children, element.attr('data-value') + '_sub_ul', 'son_ul');
                        initSelectListening($('#' + element.attr('data-value') + '_sub_ul'))
                    }
                })
            });
        }

        function initEvent() {
            if (that.options.clearAble) {
                targetObj.off('mouseover').on('mouseover', function () {
                    if (activeIndex != null) {
                        targetObj.find('.glyphicon-remove').show().off('click').on('click', function () {
                            activeIndex = null;
                            targetObj.find('li').removeClass('active');
                            targetObj.find('.son_ul').remove();
                            targetObj.find('.cascader-selecter-btn').prop('title', '请选择...');
                            targetObj.find('.cascader-selecter-title').text(that.options.placeholder);
                        });
                        targetObj.find('.glyphicon-menu-down').hide();
                    }
                }).off('mouseout').on('mouseout', function () {
                    targetObj.find('.glyphicon-remove').hide();
                    targetObj.find('.glyphicon-menu-down').show();
                });
            }

            targetObj.find('.glyphicon-menu-down').off('click').on('click', function () {
                targetObj.find('.cascader-selecter-btn').click();
            });
        }

        function getItem(value, items) {
            items = (items == null || items == undefined ) ? that.options.options : items;
            for (var i in items) {
                if (items[i][that.options.valueField] == value) {
                    return items[i];
                } else if (Com.isArray(items[i].children)) {
                    var a = getItem(value, items[i].children);
                    if (a != null) return a;
                }
            }
            return null;
        }

        function getPath(value, items) {
            var path = null;
            for (var i in items) {
                if (items[i][that.options.valueField] == value) {
                    path = items[i];
                    delete(path.children);
                    break;
                } else if (Com.isArray(items[i].children)) {
                    var node = getPath(value, items[i].children);
                    if (node != null) {
                        items[i].children = node;
                        path != null ? path.children = items[i] : path = items[i];
                        break;
                    }
                }
            }
            return path;
        }

        function path(value, split) {
            return value[that.options.titleField] + (value.children != undefined ? split + path(value.children, split) : '');
        }

        return that;
    }

    /**
     * 伸缩悬浮标签页
     */
    function FloatTabs() {
        var that = this;
        var tabObj = null;
        var options = null;
        var perWidth = null;
        var firstClickArray = {};
        var DEFAULT = {
            collapse: true,
            activeIndex: '-1',
            minWidth: '250px',
            // maxWidth: '800px',
            onOpen: null,
            onClose: null,
            itemClass: '',
            activeClass: '',
            onChange: null,
            items: []
        };

        that.initTabs = function (target, option) {
            tabObj = $('#' + target);
            options = $.extend({}, DEFAULT, option);

            tabObj.css({'min-width': options.minWidth});
            tabObj.addClass('open');

            var ulId = target + "__ul";
            tabObj.append('<ul id="' + ulId + '"></ul>');
            $('#' + ulId).css({
                'width': 'auto',
                'white-space': 'nowrap',
                'min-width': options.minWidth
            });

            if (Com.isArray(options.items)) initItems($('#' + ulId), options.items);
            initEvent();
            options.activeIndex = options.activeIndex == '-1' ? options.items[0]['index'] : options.activeIndex;
            that.setActive(options.activeIndex);

            if (options.collapse) that.close();
        };

        that.load = function (items, activeIndex) {
            if (tabObj === null) {
                console.log('请先调用initTabs方法初始化悬浮标签页！');
                return false;
            }
            if (Com.isArray(items)) {
                options.items = items;
                tabObj.removeClass('collapse');
                tabObj.css({width: ''});
                initItems($('#' + tabObj.attr('id') + '__ul'), items);
                initEvent();
            }

            options.activeIndex = activeIndex || items[0]['index'];
            that.setActive(options.activeIndex);
        };

        function initItems(targetUl, items) {
            targetUl.html('<i class="collapse-icon glyphicon glyphicon-arrow-right"></i>');
            firstClickArray = {};
            for (var i in items) {
                var ITEM_DEFAULT = {
                    index: parseInt(Math.random() * 9999) + 1,
                    title: '新标签页',
                    href: '#'
                };
                var item = $.extend({}, ITEM_DEFAULT, items[i]);
                firstClickArray[item.index] = true;
                targetUl.append('<li class="float-tab-li ' + options.itemClass + '" data-index="' + item.index + '" href="' + item.href + '" data-toggle="tab">' + item.title + '</li>')
            }
        }

        /**
         * 获得active项
         */
        that.getActive = function () {
            if (tabObj !== null) {
                return getItem(tabObj.find('li.active').attr('data-index'));
            }
            return null;
        };

        /**
         * 设置选中项
         */
        that.setActive = function (index) {
            tabObj.find('.float-tab-li').removeClass('active').removeClass(options.activeClass);
            tabObj.find('li[data-index=' + index + ']').addClass('active').addClass(options.activeClass);
            var target = $(tabObj.find('li[data-index=' + index + ']').attr('href'));
            target.siblings().removeClass('active').removeClass('in');
            target.addClass('active in');

            if (typeof options.onChange == 'function') {
                // options.onChange(index);
                options.onChange(getItem(index), firstClickArray[index]);
                firstClickArray[index] = false;
            }
        };

        /**
         * 打开标签页
         */
        that.open = function () {
            if (!tabObj.hasClass('collapse')) {
                console.log('float tabs had already open');
                return;
            }

            tabObj.animate({width: perWidth}, 'normal');
            tabObj.removeClass('collapse').addClass('open');
            tabObj.find('li').show();
            tabObj.find('li.active').removeClass('float');
            tabObj.find('.collapse-icon').removeClass('glyphicon-arrow-left').addClass('glyphicon-arrow-right');

            if (typeof options.onOpen == 'function') {
                options.onOpen();
            }
        };

        /**
         * 收起标签页
         */
        that.close = function () {
            if (tabObj.hasClass('collapse')) {
                console.log('float tabs had already close');
                return;
            }

            perWidth = tabObj.width() + 'px';
            tabObj.animate({width: options.minWidth}, 'normal', function () {
                tabObj.addClass('collapse');
                tabObj.find('li').each(function (index) {
                    if (index == 0) $(this).show;
                    else if ($(this).hasClass('active')) $(this).addClass('float');
                    else $(this).hide();
                });
                tabObj.find('li').each(function (index) {
                    if ($(this).hasClass('active') && index == 0) {
                        $(this).next().show();

                    }
                });
            });
            tabObj.find('.collapse-icon').removeClass('glyphicon-arrow-right').addClass('glyphicon-arrow-left');

            if (typeof options.onClose == 'function') {
                options.onClose();
            }
        };

        //定义事件
        function initEvent() {
            tabObj.find('.float-tab-li').off('click').on('click', function () {
                tabObj.find('.float-tab-li').removeClass('active').removeClass(options.activeClass);
                $(this).addClass('active ' + options.activeClass);

                if (typeof options.onChange == 'function') {
                    var item = getItem(tabObj.find('li.active').attr('data-index'));
                    options.onChange(item, firstClickArray[item.index]);
                    firstClickArray[item.index] = false;
                }
            });

            tabObj.find('.collapse-icon').off('click').on('click', function () {
                if (tabObj.hasClass('collapse')) {
                    that.open();
                } else {
                    that.close();
                }
            })
        }

        function getItem(index) {
            for (var i in options.items) {
                if (options.items[i].index == index) {
                    return options.items[i];
                }
            }
            return null;
        }

        return that;
    }

    /**
     * bootstrap Table
     * @param target    : 目标dom ID
     * @param options   : options
     * @returns {buildTable}
     */
    function createTable(target, options) {
        var that = this;
        var tableObj = null;
        var DEFAULT = {
            // 基本
            url: '',
            method: '',
            dataField: "",
            sidePagination: "client",
            onLoadSuccess: function () {
            },
            onPostBody: function () {
            },
            onLoadError: function () {
            },
            columns: [],
            escape: true,
            // 分页
            smartDisplay: false,
            pagination: true,
            pageSizeEditable: true,
            paginationLoop: false,
            showPaginationSwitch: false,
            pageSize: 25,
            pageNumber: 1,
            pageList: [15, 30, 50, 100],
            paginationHAlign: 'right',
            paginationDetailHAlign: 'right',
            showPaginationPage: true,
            // 其他
            classes: 'table table-no-bordered table-striped table-hover-row',
            locale: "zh-CN",
            contentType: 'application/json',
            dataType: 'json',
            undefinedText: ' ',
            cache: false,
            striped: true,
            search: false,
            showRefresh: false,
            clickToSelect: false,
            showHeader: true,
            showFooter: false,
            //行样式
            rowStyle: function (row, index) {
                return {
                    css: {
                        'font-size': '14px',
                        'height': '30px',
                        'color': '#757575'
                    }
                }
            },
            formatNoMatches: function () {
                return '无符合条件的记录';
            },
            onClickRow: function (item, $element) {
                return false;
            },
            queryParams: function (params) {
                return params;
            },
            responseHandler: function (data) {
                return data;
            },

            //行展开
            rowsCanOpen: false,
            rowsOpenUseParentDom: true,
            rowsOpenDefineOpenDom: null,
            rowsOpenUrl: '',
            rowsOpenDataField: "",
            rowsOpenQueryParams: function (params) {
                return params
            },
            rowsOpenResponseHandler: function (res) {
                return res
            }
        };

        //合并默认配置
        tableObj = $('#' + target);
        options = $.extend({}, DEFAULT, options);
        options.queryParams = Com.mergeFunc(function (params) {
            // Com.ajaxData(Com.getRootPath() + '/userInfo');
            var page = {
                pageSize: params.limit,
                pageNum: (parseInt(params.offset) / parseInt(params.limit) ) + 1,
                order: {}
            };
            if (typeof params.sort !== 'undefined') {
                page.order[params.sort] = params.order;
            }
            return {page: page};
        }, options.queryParams, 'append');

        options.onPostBody = Com.mergeFunc(options.onPostBody, function (e) {
            Com.refreshTipsEvent();
            if(options.striped){
                $('#' + target).parent('.fixed-table-body').addClass('striped');
            }
        }, 'merge');

        if (options.rowsCanOpen) {
            options.onClickRow = Com.mergeFunc(options.onClickRow, openRow, 'merge');
        }

        for (var i in options.columns) {
            if (Com.isArray(options.columns[i])) {
                options.columns[i].forEach(function (item, index) {
                    options.columns[i][index] = $.extend({}, buildColumn(item), item);
                })
            } else {
                options.columns[i] = $.extend({}, buildColumn(options.columns[i]), options.columns[i]);
            }
        }

        create(target, options);

        function create(id, option) {
            $('#' + id).bootstrapTable('destroy').bootstrapTable(option);
        }

        function buildColumn(item) {
            if (item.checkbox || item.radio) {
                return {
                    align: "left",
                    valign: "middle"
                }
            }

            var _formatter = formatter;
            if (typeof item.formatter == 'function') {
                var funcTemp = item.formatter;
                _formatter = function (value, row, field) {
                    return '<div class="hover-show-tip">' + funcTemp(value, row, field) + '</div>';
                };
            }

            return {
                align: "left",
                valign: "middle",
                formatter: _formatter
            };

            function formatter(value, row, index) {
                var _w = '';
                if (Com.isNotBlank(item.width)) {
                    var width = item.width.toString();
                    width = width.indexOf('px') !== -1 ? width.substr(0, width.indexOf('px')) : width;
                    _w = (parseInt(width) - 16) + 'px';
                }
                // var w = Com.isBlank(item.width) ? '' :
                //     (item.width.toString().indexOf('px') > 0 ) ? item.width : (item.width + 'px');
                return '<div class="hover-show-tip " style="width: ' + _w + ';">' + (Com.isNotBlank(value) || value == '0' ? value : options.undefinedText) + '</div>';
            }
        }

        that.openRow = function (row, $element, field) {
            openRow(row, $element, field);
        };

        function openRow(row, $element, field) {
            tableObj = $('#' + $element.parents('table').attr('id'));
            var willOpenTableOption = tableObj.bootstrapTable('getOptions');
            // /*若设置options = willOpenTableOption第二次则无法展开，故新建1个变量，部分赋旧值*/
            options.rowsOpenUrl = willOpenTableOption.rowsOpenUrl;
            options.method = willOpenTableOption.method;
            options.rowsOpenDataField = willOpenTableOption.rowsOpenDataField;
            options.rowsOpenUseParentDom = willOpenTableOption.rowsOpenUseParentDom;
            options.columns = willOpenTableOption.columns;
            options.rowsOpenQueryParams = willOpenTableOption.rowsOpenQueryParams;
            options.onLoadSuccess = willOpenTableOption.onLoadSuccess;
            options.onPostBody = willOpenTableOption.onPostBody;
            var hasSubTable = tableObj.find('tr[data-index=' + $element.attr('data-index') + ']').next().hasClass('sub-table-panel');

            tableObj.find('.sub-table-panel').remove();
            if (hasSubTable) {
                return false;
            }

            $element.after('<div class="sub-table-panel" style="width: ' + tableObj.width() + 'px;position: absolute;left: 0"></div>');

            if (options.rowsOpenUrl && options.rowsOpenUrl.length) {
                Com.ajaxData(options.rowsOpenUrl, options.method, options.rowsOpenQueryParams(row), function (data) {
                    data = options.rowsOpenResponseHandler(data);
                    if (options.rowsOpenDataField != "" && options.rowsOpenDataField != undefined && options.rowsOpenDataField) {
                        data = data[options.rowsOpenDataField];
                    }
                    options.rowsOpenUseParentDom ? initSubTable(data)
                        : tableObj.find('.sub-table-panel').append(options.rowsOpenDefineOpenDom(row, $element, field, data));
                }, null, options.dataType, null, options.contentType);
            } else {
                options.rowsOpenUseParentDom ? initSubTable(row.children)
                    : tableObj.find('.sub-table-panel').append(options.rowsOpenDefineOpenDom(row, $element, field));
            }

            function initSubTable(data) {
                if (Com.isArray(data)) {
                    tableObj.find('.sub-table-panel').append('<table id="tempTable"></table>');
                    $('#tempTable').css({width: tableObj.width(), 'table-layout': 'auto'});
                    var newColumns = [];
                    options.columns[0].forEach(function (item) {
                        var c = $.extend({}, buildColumn(item), item);
                        if (c.checkbox || c.radio) {
                            c.width = 45;
                            c.checkbox = false;
                            c.radio = false;
                        }
                        newColumns.push(c);
                    });
                    var opt = {
                        url: '',
                        data: data,
                        columns: newColumns,
                        showHeader: false,
                        pagination: false,
                        height: (data.length * 40 > 250 ? 250 : ''),
                        onLoadSuccess: options.onLoadSuccess,
                        onPostBody: options.onLoadSuccess
                    };
                    opt = $.extend({}, options, opt);
                    opt.onClickRow = function () {
                        return false;
                    };
                    opt.queryParams = null;
                    create('tempTable', opt);
                }
            }
        }
        return that;
    }

    /**
     * 弹出框,(基于bootstrapDialog的二次封装)
     * @param options
     * @returns {SimpleDialog}
     */
    function SimpleDialog(options) {
        var that = this;
        var DEFAULT = {
            type: BootstrapDialog.TYPE_DEFAULT,
            size: BootstrapDialog.SIZE_NORMAL,
            backdrop: 'false',
            closable: true,
            closeByBackdrop: false,
            closeByKeyboard: true,
            draggable: true,
            closeIcon: '&#215;',
            spinicon: BootstrapDialog.ICON_SPINNER,
            autodestroy: true,
            animate: true,

            cssClass: '',
            title: 'Title',
            message: 'Message',
            buttons: [],
            onshow: null,
            onshown: null,

            showHeader: true,
            width: null,
            hideBackDrop: true
        };

        options = $.extend({}, DEFAULT, options);
        if (Array.isArray(options.buttons) && options.buttons.length) {
            for (var i in options.buttons) {
                var BUTTON_DEFAULT = {
                    autospin: '',
                    icon: '',
                    label: '',
                    cssClass: '',
                    action: null
                };
                options.buttons[i] = $.extend({}, BUTTON_DEFAULT, options.buttons[i]);
                options.buttons[i].cssClass = 'dialog-btn ' + options.buttons[i].cssClass;
            }
        }
        options.onshown = Com.mergeFunc(options.onshown, function () {
            $('input').attr('autocomplete','off');
            Com.refreshInputEvent();
        }, 'merge');

        var dialogObj = new BootstrapDialog(options);
        return dialogObj;
    }

    /**
     * 头部为可切换标签的弹出框
     * @param options
     */
    function TabsDialog(options) {
        var that = this;
        var DEFAULT = {
            onshow: null,
            onTabChange: null,
            tabs: []
        };

        //合并默认配置
        options = $.extend({}, DEFAULT, options);
        var ulId = 'tabs_' + Com.randomChar(16) + '_ul';
        options.onshown = Com.mergeFunc(options.onshown, function () {
            $('#' + ulId).find('li a').each(function (i) {
                $(this).off('click').on('click', function () {
                    if (typeof options.onTabChange == 'function') {
                        options.onTabChange(i, $(this).text());
                    }
                })
            })
        }, 'merge');

        if (Com.isArray(options.tabs)) {
            var headerTabs = '<ul class="normal-tabs nav nav-tabs" id="' + ulId + '">';
            for (var i in options.tabs) {
                headerTabs += '<li class="' + (i == 0 ? 'active' : '') + '"><a href="' + options.tabs[i].href + '" data-toggle="tab">' + options.tabs[i].title + '</a></li>'
            }
            headerTabs += '</ul>';

            var func = options.onshow;
            var newFunc = function (dialog) {
                dialog.$modalHeader.find('.bootstrap-dialog-header').css({
                    'float': 'right',
                    'margin-top': '13px',
                    'margin-right': '10px'
                });
                dialog.$modalHeader.css({
                    'padding': '0',
                    'padding-top': '10px'
                });
                dialog.$modalHeader.html('');
                dialog.$modalHeader.append(headerTabs);
                if (typeof func == 'function') {
                    func(dialog)
                }

            };
            options.onshow = newFunc;
            options.title = '';
        }

        var dialogObj = new SimpleDialog(options);
        return dialogObj;
    }

    function PercentBar(target, options) {
        var that = this;
        var DEFAULT = {
            colors: ['#00A3FD', '#64DEF6', '#DFE9FB'],
            height: '24px',
            options: []
        };
        var targetObj = $('#' + target);
        targetObj.html('');
        targetObj.css('width', '100%');
        options = $.extend({}, DEFAULT, options);
        targetObj.append('<div class="bar"></div><div class="msg"></div>');
        targetObj.find('.bar').css('height', options.height);

        if (Array.isArray(options.options) && options.options) {
            for (var i in options.options) {
                targetObj.find('.bar').append('<span class="bar-item" style="background-color: ' + (options.options[i].color ? options.options[i].color : options.colors[i]) +
                    ';width:' + (options.options[i].value + '%') + '"></span>');

                targetObj.find('.msg').append('<span class="msg-item" style="background: ' + (options.options[i].color ? options.options[i].color : options.colors[i]) + '"></span><span>' + options.options[i].title +
                    '</span>'
                )
            }
        }
        return that;
    }

    function TagsGroup(dom, array) {
        var that = this;
        var domObj = $(dom);

        that.push = function (item) {
            var title = typeof item === 'string' ? item : item.title;
            var value = typeof item === 'string' ? item : item.value;
            domObj.append('<span class="tag" data-value="' + value + '">' + title +
                '<i class="fa fa-times-circle tag-remove-icon" aria-hidden="true"></i>' +
                '</span>');
            Com.refreshTagsGroupEvent();
        };

        that.pushAll = function (array) {
            if (Com.isArray(array)) {
                var that = this;
                array.forEach(function (item) {
                    that.push(item);
                });
            }
            Com.refreshTagsGroupEvent();
        };

        that.clear = function () {
            domObj.html('');
        };

        that.remove = function (option) {
            if (domObj.find('.tag[data-value="' + option + '"]').length) {
                domObj.find('.tag[data-value="' + option + '"]').remove();
                return true;
            }
            console.log('Could not find options[' + option + ']');
            return false;
        };

        that.getSelected = function () {
            var result = [];
            domObj.find('.tag').each(function () {
                result.push($(this).attr('data-value'));
            });
            return result;
        };

        Com.isArray(array) ? that.pushAll(array) : that.push(array);

        return that;
    }

       /**
     * @description 表格数据导出为excel
     * @param id 表格id（自动获取选择项和表头）
     * @param fileName 文件名称
     * */
    function exportExcelFromTable(id, fileName, sheetName) {
        var columns = $('#' + id).bootstrapTable("getOptions").columns[0];
        var headers = [];
        columns.forEach(function (t) {
            if (!Com.isEmpty(t.title) && !Com.isEmpty(t.field)) {
                headers.push(t);
            }
        });
        var data = $('#' + id).bootstrapTable('getSelections');
        if (0 === data.length) {
            data = $('#' + id).bootstrapTable('getData');
            Com.confirm("导出本页所有数据？", function (bool) {
                if(bool) exportExcel(headers, data, fileName, sheetName);
            });
        } else {
            Com.confirm("导出勾选数据？", function (bool) {
                if(bool) exportExcel(headers, data, fileName, sheetName);
            });

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
        sheetName = (Com.isEmpty(sheetName)) ? "" : sheetName;
        $.ajax({
            url: Com.getRootPath() + "/common/excel/export",
            method: 'POST',
            xhrFields: {
                responseType: 'blob'
            },
            data: JSON.stringify({data: data, headers: headers, fileName: fileName, sheetName: sheetName}),
            contentType: "application/json"
        }).done(function (result) {
            downloadFile(result, fileName);
        });
    }

    /**
     * @description 表格数据导出为excel，多sheet版
     * @param list
     * @param list[x].headers 表头
     * @param list[x].data 表格数据
     * @param list[x].fileName 文件名称
     * @param list[x].sheetName 表格sheet名
     * */
    function exportExcelMultiple(list) {
        $.ajax({
            url: Com.getRootPath() + "/common/excel/exportMultiple",
            method: 'POST',
            xhrFields: {
                responseType: 'blob'
            },
            data: JSON.stringify(list),
            contentType: "application/json"
        }).done(function (result) {
            downloadFile(result, list[0].fileName);
        });
    }

    /**
     * 文件保存
     * 支持IE10以上
     * */
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

    $().ready(function () {
        $('html').off('click').on('click', function (e) {
            if (!e.target.id || !$('#' + e.target.id).parent().parent().hasClass('rmenu')) {
                $('.rmenu').hide();
            }
            if (!$(e.target).parent().parent().hasClass('single-selecter-ul float-top')
                && !$(e.target).parent().hasClass('single-selecter-dropdown-content')) {
                $('.single-selecter-ul.float-top').hide();
            }
        });

        $('.collapse-tree-btn').addClass('glyphicon glyphicon-tree-conifer tree-btn tree-btn-open');
        $('.collapse-tree-btn').off('click').on('click', function () {
            if ($('.page-content .page-content-left').is(':hidden')) {
                $('.page-content .page-content-left').animate({'width': '270px'}, 'normal', function () {
                    $('.page-content .page-content-left').show();
                    $('.table').bootstrapTable('scrollTo', '0px').bootstrapTable('resetView');
                    Com.repositionDragBar();
                });
                $('.page-content .page-content-right').animate({'padding-left': '284px'}, 'normal');
                $('.page-content .page-content-right .top-bar').animate({'left': '289px'}, 'normal');
                $('.tree-btn').removeClass('tree-btn-close').addClass('tree-btn-open');
            } else {
                $('.page-content .page-content-left').animate({'width': '0'}, 'normal', function () {
                    $(this).hide();
                    $('.table').bootstrapTable('scrollTo', '0px').bootstrapTable('resetView');
                    Com.repositionDragBar();
                });
                $('.page-content .page-content-right').animate({'padding-left': '2px'}, 'normal');
                $('.page-content .page-content-right .top-bar').animate({'left': '7px'}, 'normal');
                $('.tree-btn').removeClass('tree-btn-open').addClass('tree-btn-close');
            }
            $('.query-panel').hide();//关闭告警查询的panel
        });

        if (typeof GC === 'object' && Com.isNotBlank(GC.basePath)) {
            Com.setRootPath(GC.basePath)
        }

        Com.refreshDatePicker();
        Com.refreshTipsEvent();


        jQuery('img.svg').each(function () {
            var $img = jQuery(this);
            var imgID = $img.attr('id');
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');

            jQuery.get(imgURL, function (data) {
                // Get the SVG tag, ignore the rest
                var $svg = jQuery(data).find('svg');

                // Add replaced image's ID to the new SVG
                if (typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }
                // Add replaced image's classes to the new SVG
                if (typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass + ' replaced-svg');
                }

                // Remove any invalid XML tags as per http://validator.w3.org
                $svg = $svg.removeAttr('xmlns:a');

                // Replace image with new SVG
                $img.replaceWith($svg);

            }, 'xml');
        });

        document.onkeypress = banBackSpace;
        document.onkeydown = banBackSpace;

        $('input').attr('autocomplete','off');
        Com.refreshInputEvent();
        Com.refreshSwitchBtnEvent();

        window.resize = function(){
            $('table').each(function(){
                if(typeof  $(this).bootstrapTable === 'function'){
                    $(this).bootstrapTable('resetView')
                }
            })
        }
    });
    !function ($) {
        "use strict";

        $.fn.singleSelecter = function (option, parameter) {
            return this.each(function () {
                var data = $(this).data('singleSelect');
                var options = typeof option === 'object' && option;

                if (!data) {
                    var data = new SingleSelecter();
                    data.initSelectWithDom(this, options);
                    $(this).data('singleSelect', data);
                }

                if (typeof option == 'string') {
                    data[option](parameter);
                    if (option === 'destroy') {
                        $(this).data('singleSelect', false);
                    }
                }
            });
        };
    }(window.jQuery);


    function banBackSpace(e) {
        var ev = e || window.event;
        var obj = ev.relatedTarget || ev.srcElement || ev.target || ev.currentTarget;

        if (ev.keyCode === 8) {
            var tagName = obj.nodeName;
            if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
                return stopIt(ev);
            }
            var tagType = obj.type.toUpperCase();//标签类型
            if (tagName === 'INPUT' && (tagType !== 'TEXT' && tagType !== 'TEXTAREA' && tagType !== 'PASSWORD' && tagType !== 'NUMBER')) {
                return stopIt(ev);
            }
            if ((tagName === 'INPUT' || tagName === 'TEXTAREA') && (obj.readOnly === true || obj.disabled === true)) {
                return stopIt(ev);
            }
        }
    }

    function stopIt(ev) {
        if (ev.preventDefault) {
            ev.preventDefault();
        }
        if (ev.returnValue) {
            ev.returnValue = false;
        }
        return false;
    }
    /*视图配置选择工作组和组织*/
    function creatGroupTable(data) {
        $('#itsmOrganizationTable').bootstrapTable('destroy').bootstrapTable({
            data:data,
            contentType:"application/json;charsets=utf-8",
            sidePagination: "client",
            dataType:'json',
            classes:'table table-no-bordered table-striped',
            cache: false,               //是否使用缓存，默认为true
            striped: true,              //是否显示行间隔色
            pagination: true,   //是否显示分页
            pageSize: 15,               //每页的记录行数
            pageNumber: 1,              //初始化加载第一页，默认第一页
            pageList: [15,20,30,50,100],  //可供选择的每页的行数
            pageSizeEditable: true,
            search: false,               //是否显示表格搜索
            showRefresh: false,          //是否显示刷新按钮
            clickToSelect: false,        //是否启用点击选中行
            toolbar: "#toolbar_screen", //工具按钮用哪个容器
            sidePagination: "client",   //分页方式：client客户端分页，server服务端分页
            showHeader: true, //是否显示列头
            showFooter: false, //是否显示列脚
            showPaginationSwitch: false,
            paginationLoop: false,
            paginationDetailHAlign: 'left',
            height:undefined,
            columns: [{
                align : 'center',
                checkbox: true,                          // 显示复选框
            },
                { field: 'id',  title: 'ID' },
                {field: 'name', title: '名称', },
            ],
            formatLoadingMessage: function(){
                return "正在努力地加载数据中，请稍候……";
            },
            formatNoMatches: function () {
                return '无符合条件的记录';
            },
            rowStyle: function (row, index) {
                return {
                    css: {
                        color: '#757575'
                    }
                }
            },

        });
    }
    return{
        Com:Com,
        SideBarMenu:SideBarMenu,
        ResoTree:ResoTree,
        DescTimer:DescTimer,
        SingleSelecter:SingleSelecter,
        MultiSelecter:MultiSelecter,
        CascaderSelecter:CascaderSelecter,
        FloatTabs:FloatTabs,
        createTable:createTable,
        SimpleDialog:SimpleDialog,
        TabsDialog:TabsDialog,
        PercentBar:PercentBar,
        TagsGroup:TagsGroup,
        exportExcelFromTable:exportExcelFromTable,
        downloadFile:downloadFile,
        banBackSpace:banBackSpace,
        stopIt:stopIt,
        creatGroupTable:creatGroupTable
    }
});