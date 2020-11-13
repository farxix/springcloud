var api  = getApiUrl();

(function($, window) {
    var path = './';
    try {
        if (global.staticPath) {
            path = global.staticPath + '../lib/uploadSuccess/'
        }
    } catch (e) {}

    function randomNum() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    function getName(obj) {
        return obj.replace(/\.|#/g, "");
    }

    function isArray(array) { //是否是数组
        return Object.prototype.toString.call(array) === '[object Array]';
    }
    // 判断浏览器是否支持图片的base64
    function isSupportBase64() {
        var data = new Image();
        var support = true;
        data.onload = data.onerror = function() {
            if (this.width != 1 || this.height != 1) {
                support = false;
            }
        };
        data.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
        return support;
    }
    $.fn.swfupUpload = function(options) {
        var $obj = $(this); //父级对象

        if (!WebUploader.Uploader.support()) {
            var error = "上传控件不支持您的浏览器！请尝试升级flash版本或者使用新版的浏览器。";
            $obj.text(error);
            return;
        }

        //创建默认参数
        var defaults = {
            swf: path + './lib/webuploader/dist/Uploader.swf', //swf文件路径
            server: api+'/v1/file/upload', //服务端文件上传路径
            // deleteServer: '/common/file/post.jsp?operType=delete', //服务端文件删除路径
            statusField: 'message', //成功状态字段
            sucStatus: 'success', //成功状态值
            data: 'data', //返回的data数据{"data":{}}
            idField: 'oid', //成功返回的id字段
            valField: 'value', //成功返回的value字段值
            jsonValField: false, //成功返回的json值(默认false，保存valField值)
            checkboxField: 'imgCheckbox', //图片保存name名称checkbox(表单提交的附件字段名)
            callback: function(status, file, response) {}, //请求上传成功/失败回调函数(status,sucStatus[success]成功，error失败)
            errorCallback:function(){},//上传控件验证格式出错
            manualBtn: '.webuploadbtn', //手动上传按钮,必须在$obj里面
            manualBtnText: '开始上传', //手动上传按钮文本
            fileList: '.uploader-list', //输出文件列表,必须在$obj里面
            showFileList: true, //是否显示文件列表，默认显示
            selectCallback: function(file) {}, //选中文件的时候回调
            showType: 'text', //显示类型，默认text(文本),image(图片)
            showDown:true,//是否显示下载按钮
            delConfirm: function(fnDelFile) { //删除前确认
                if (window.confirm('你确定要删除吗？')) {
                    fnDelFile();
                }
            },
            imgWidth: 100, //预览图片缩列图大小
            imgHeight: 100,

            /*API参数*/
            pick: '#pick-uploader', //上传文件的按钮的id
            pickText: '<i class="fa fa-folder-open" style="color:#fdbc40"></i>上传文件', //上传文件的按钮的文字
            delText: "&times", //删除按钮标签
            //上传文件类型
            accept: {
                extensions: '*', //gif,jpg,jpeg,bmp,png,txt,zip
                mimeTypes: '*/*' //image/*,text/*,application/*
            },
            auto: true, //自动上传
            fileVal: "file", //上传的name字段
            formData: {'userid':"root"}, //文件上传请求额外传递的的参数
            fileNumLimit: null, //验证文件总数量, 超出则不允许加入队列
            fileSizeLimit: null, //60M,验证文件总大小是否超出限制, 超出则不允许加入队列。
            fileSingleSizeLimit: 10 * 1024 * 1024, //8M,验证单个文件大小是否超出限制, 超出则不允许加入队列
            timeout:0,//(插件源码默认2分钟),0为不限制时间
            resize: false,
            duplicate:true,
            runtimeOrder: 'html5,flash',
            method: 'POST',
        };

        var opts = $.extend(defaults, options);

        var pickerid = '',
            uploaderStrdiv = '',
            callback = opts.callback;


        if (!opts.pick) {
            //唯一的ID
            pickerid = randomNum();
            opts.pick = '#' + pickerid;
        } else {
            pickerid = opts.pick.replace(/\#|\./g, '');
        }

        //上传按钮
        var pickBtn = '';
        if ($(opts.pick).length == 0) {
            pickBtn = '<div id="' + pickerid + '" class="pick-btn">' + opts.pickText + '</div>';
        }

        //添加手动上传按钮
        var btnStr = '';
        if (!opts.auto && $obj.find(opts.manualBtn).length == 0) {
            btnStr = '<span class="' + getName(opts.manualBtn) + '">' + opts.manualBtnText + '</span>';
        }

        uploaderStrdiv = pickBtn + btnStr + '<div  class="' + getName(opts.fileList) + '"></div>' +
            '<div style="display:none" class="uploadhiddenInput"></div>';

        //若队列已经存在则不无需再添加
        if ($obj.find(opts.fileList).length > 0) {
            uploaderStrdiv = pickBtn;
            if ($obj.find('.uploadhiddenInput').length == 0) {
                uploaderStrdiv += '<div style="display:none" class="uploadhiddenInput"></div>';
            }
        }
        $obj.append(uploaderStrdiv);

        var $list = $obj.find(opts.fileList),
            $btn = $obj.find(opts.manualBtn), //手动上传按钮备用
            state = 'pending',
            $hiddenInput = $obj.find('.uploadhiddenInput');

        if (opts.showFileList) { $list.show(); } else { $list.hide(); }

        //实例化
        var uploader = WebUploader.create(opts);



        //错误信息
        var text = '';

        function showError(code) {
            switch (code) {
                case 'Q_TYPE_DENIED':
                    text = '文件类型不正确';
                    break;
                case 'F_DUPLICATE':
                    text = '文件已经存在';
                    break;
                case 'Q_EXCEED_NUM_LIMIT':
                    text = '文件数量不能超过' + opts.fileNumLimit + '个';
                    break;
                case 'Q_EXCEED_SIZE_LIMIT':
                    text = '文件总大小不能超过' + parseInt(opts.fileSizeLimit / 1024) + 'k';
                    break;
                case 'F_EXCEED_SIZE':
                    text = '单个文件大小不能超过' + parseInt(opts.fileSingleSizeLimit / 1024) + 'k';
                    break;
                default:
                    text = '文件不符合要求';
                    break;
            }
            opts.errorCallback(text);
            alert(text);
        }

        uploader.options.headers = {'Accept' :'application/x-ms-application, image/jpeg, application/xaml+xml, image/gif, image/pjpeg, application/x-ms-xbap, application/vnd.ms-excel, application/vnd.ms-powerpoint, application/msword, */*'};
        //uploader.options.headers = {'Accept':'application/json;charset=UTF-8'};
        uploader.on('error', function(code) {
            showError(code);
        });

        //队列添加前
        uploader.on('beforeFileQueued', function(file) {

            //如果每次只能上传一个，则再次选择前先删除文件
            if (opts.fileNumLimit == 1) {
                //删除所有
                uploader.delAllFile();
            }
            if (opts.fileNumLimit && $obj.find('.upload-file-item').length >= opts.fileNumLimit) {
                text = '文件数量不能超过' + opts.fileNumLimit + '个';
                alert(text);
                return false;
            }
        });

        //队列事件
        function fileQueuedList(file, flag) {
            var str, imgItem,
                text = flag ? '正在上传...' : '等待上传';
            str = '<div id="' + file.id + '" class="upload-file-item">' +
                '<span class="web-span webuploadinfo"><span class="web-text">' + file.name + '</span></span>' +
                '<span class="web-span webuploadstate">' + text + '</span>' +
                '<span class="web-span webuploadDelbtn">' + opts.delText + '</span>' +
                '</div>';
            $list.append(str);

            if (opts.showType == 'image') {
                var $fileObj = $('#' + file.id);
                $fileObj.addClass('upload-file-item-img');
                $fileObj.find('.webuploadDelbtn').html(opts.delText);
                uploader.makeThumb(file, function(error, src) {
                    if (error) {
                        return;
                    }
                    if (isSupportBase64()) {
                        var img = $('<img src="' + src + '" class="web-img as-img as-flex-xy" >');
                        $fileObj.find('.webuploadinfo').html(img);
                    }
                }, opts.imgWidth, opts.imgHeight);

            }
        }

        uploader.on('fileQueued', function(file) {
            fileQueuedList(file, opts.auto);
            if (opts.auto) {
                uploader.upload();
            }
            opts.selectCallback(file);
        });

        // 自定义上传参数要在这里赋值
        uploader.on( 'uploadBeforeSend', function( object, data,header ) {
            // 修改data可以控制发送哪些携带数据。
            data.userid = Global.userid;
        });



        uploader.on('uploadProgress', function(file, percentage) { //进度条事件
            var $li = $obj.find('#' + file.id),
                $percent = $li.find('.progress .bar');

            // 避免重复创建
            if (!$percent.length) {
                $percent = $('<span class="progress">' +
                    '<span  class="percentage"><span class="text"></span>' +
                    '<span class="bar" role="progressbar" style="width: 0%">' +
                    '</span></span>' +
                    '</span>').appendTo($li).find('.bar');
            }

            $li.find('.webuploadstate').html('正在上传...');
            $li.find(".text").text(Math.round(percentage * 100) + '%');
            $percent.css('width', percentage * 100 + '%');
        });
        uploader.on('uploadSuccess', function(file, response) { //上传成功事件
            var data = {};
            if (isArray(response[opts.data])) {
                //若数组只取第一个
                data = response[opts.data][0] || {};
            } else {
                data = response[opts.data] || {};
            }


            if (response[opts.statusField] == opts.sucStatus) {
                $obj.find('#' + file.id).find('.webuploadstate').addClass('web-ok').html('上传成功');
                var id = data[opts.idField] || '';
                var val = data[opts.valField] || '';
                if (opts.jsonValField) { //保存整个json值
                    try {
                        val = JSON.stringify(data);
                    } catch (e) {}
                }
                $hiddenInput.append('<input type="checkbox" id="hiddenInput' + file.id + '" class="hiddenInput" name="' + opts.checkboxField + '" data-id="' + id + '" value=\'' + val + '\' checked="checked"/>');

                callback(opts.sucStatus, file, response);

                //下载按钮
                if(opts.showDown){

                    $obj.find('#' + file.id).find('.webuploadDelbtn').after('<span class="icon-file-down" data-id="' + id + '" title="下载">下载</span>');
                    // $obj.find('#' + file.id).find('.icon-file-down').unbind("click").bind('click',function(){
                    // });
                }

            } else {
                $obj.find('#' + file.id).find('.webuploadstate').addClass('web-error').html('上传失败');
                callback(opts.sucStatus, file, response);
            }

        });

        uploader.on('uploadError', function(file) {
            $obj.find('#' + file.id).find('.webuploadstate').addClass('web-error').html('上传出错');
            callback('error', file);
        });

        uploader.on('uploadComplete', function(file) { //全部完成事件
            $obj.find('#' + file.id).find('.progress').fadeOut();
        });

        uploader.on('all', function(type) {
            if (type === 'startUpload') {
                state = 'uploading';
            } else if (type === 'stopUpload') {
                state = 'paused';
            } else if (type === 'uploadFinished') {
                state = 'done';
            }

            if (state === 'uploading') {
                $btn.text('暂停上传');
            } else {
                $btn.text(opts.manualBtnText);
            }

        });

        //删除时执行的方法
        uploader.on('fileDequeued', function(file) {
            delFile(file.id, file.flag);
        });

        //删除文件
        function delFile(id, flag) {
            var fileId = $("#hiddenInput" + id).attr('data-id') || '';
            if (!fileId) {
                //没上传的直接删除
                $('#' + id).remove();
                return;
            }

            if (flag == 0) {
                //只清除队列文件
                $list.empty();
                $hiddenInput.empty();
                return;
            }


            if (!flag && flag != 0) { opts.delConfirm(fnDelFile); } else if (flag) {
                //删除所有
                opts.delConfirm(fnDelFile);
            }

            function fnDelFile(json, delBack,type) {
                if(type&&delBack && delBack(id,fileId)){//特殊情况不请求接口
                    return;
                }
                json = json || {};
                var dataJson = {};
                dataJson[opts.idField] = fileId;
                dataJson = $.extend(dataJson, json);
                $.ajax({
                    type: "post",
                    url: opts.deleteServer,
                    data: dataJson,
                    dataType: "json",
                    success: ajaxCallback,
                    error:function(e) {
                        try {
                            $("#" + id).remove();
                            $("#hiddenInput" + id).remove();
                        } catch (e) {}
                    }

                });

                function ajaxCallback(data) {
                    if (data[opts.statusField] + '' == opts.sucStatus) {
                        $("#" + id).remove();
                        $("#hiddenInput" + id).remove();
                        if(!type){ delBack && delBack();}
                    } else {
                        alert('删除失败');
                    }
                }
            }
        }

        //多文件点击上传的方法
        $btn.on('click', function() {
            if (state === 'uploading') {
                uploader.stop();
            } else {
                uploader.upload();
            }
        });

        //删除
        $list.on("click", ".webuploadDelbtn", function() {

            var id = $(this).parent().attr("id");
            var file = uploader.getFile(id);
            if (file) {
                //加入删除队列
                uploader.removeFile(file);
            } else {
                //直接删除(编辑的时候用到)
                delFile(id);
            }
        });

        //清除所有(f0默认只清除队列文件,1连同清除服务器文件)
        uploader.delAllFile = function(flag) {
            flag = flag || 0;
            $list.find('.webuploadDelbtn').each(function() {
                var id = $(this).parent().attr("id");
                var file = uploader.getFile(id);
                if (file) {
                    //加入删除队列
                    file.flag = flag;
                    uploader.removeFile(file);
                } else {
                    //直接删除
                    delFile(id, flag);
                }
            });
        };

        return uploader;

    };

    $.fn.GetFilesAddress = function(options) {
        var defaults = { "idField": "id", "valField": "value" };
        var opts = $.extend(defaults, options);
        var ele = $(this);
        var filesdata = ele.find(".uploadhiddenInput");
        var filesAddress = [];
        filesdata.find(".hiddenInput").each(function() {
            var data = {};
            data[opts.valField] = $(this).val();
            data[opts.idField] = $(this).attr('data-id');
            filesAddress.push(data);
        });
        return filesAddress;

    }

})(jQuery, window);
