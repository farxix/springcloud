
var api  = getApiUrl();
var userType=$("#orgId",parent.document).attr("data-userType");
var orgId = $("#orgId", parent.document).attr("data-id");
var userId = $("#orgId", parent.document).attr("data-user");
var login = {userTel:localStorage.getItem("userTel"),tokenId:localStorage.getItem("tokenId")};
var _file = null;

var param ={
  type	:2,
  uploadId :orgId,
  orgId:orgId,
  fileName:'',
  img:'',
  createBy:userId
}

$(function () {
    // 企业名称
    getApplyOrgInfo();

    //头像设置查询
     getImg();

    /**
     * 创建的WebUploadr对象
     */
    var imageUploader = WebUploader.create({

        server:'',

        // 是否开起分片上传。
        chunked: false,
        //选择完文件或是否自动上传
        auto: false,
        //swf文件路径
        swf: './lib/webuploader/dist/Uploader.swf', //swf文件路径
        // 上传并发数。允许同时最大上传进程数[默认值：3]   即上传文件数
        threads: 1,
        //文件接收服务端接口
        // server: baseUrl + "file/save",
        // 选择文件的按钮
        pick: {id:'#imagePicker',multiple :false},
        //上传请求的方法
        method: "POST",
        // 不压缩image, 默认如果是jpeg，文件上传前会压缩一把再上传！
        resize: false,
        //指定接受哪些类型的文件
        accept: {
            title: 'Images',
            extensions: 'jpg,jpeg,bmp,png',
            mimeTypes: 'image/*'
        },
        formData: param, //文件上传请求额外传递的的参数
    });

    /**
     * 文件被添加进队列的时候
     */
    imageUploader.on('fileQueued', function (file) {

        var $list = $('#imagesList');
        var $div = $(' <div id="'+file.id+'">'+
            '<img src="" alt="图片">'+
            '</div>'),
            $img = $div.find('img');
        $list.empty().append($div);
        param.fileName = file.name;
        _file = file;

        //创建图片预览
        imageUploader.makeThumb(file, function (error, src) {

           if (error) {
                  $img.replaceWith('<span>不能预览</span>');
                  return;
            }

            imgWidth = file._info.width;
            imgHeight = file._info.height;

            if(imgWidth > 200 || imgHeight > 60){
                $img.replaceWith('<span>图片尺寸不符合要求</span>');
                imageUploader.reset();
                return;
            }else{
                $list.css('background','#ffffff');
                $img.attr('src', src);
                $("#save").attr("disabled",false);
            }

        },32,32);
    });

    //上传出错
    imageUploader.on('uploadError', function (file) {
        var $li = $('#' + file.id),
            $error = $li.find('div.error');
        // 避免重复创建
        if (!$error.length) {
            // 移除原来的
            $li.children('div.state').remove();
            // 创建新的状态进度条
            $error = $('<div class="error"></div>').appendTo($li);
        }
        $error.text('上传出错');
    });

    /**
     * 确认上传
     */
    $("#save").on('click', function () {
         checkLogoFile(_file.source.source,function(res){
             if(res.status == 0){
                 param.img = res.data;

                 ajaxData('main-api','/api/file/addImg',param,function(res){
                       if(res.status === 0){
                           //请求成功时处理
                           sweetAlert({
                               title: "信息",
                               text: "上传成功！",
                               type: "success",
                               confirmButtonColor: "#3197FA",
                               confirmButtonText: "确定"
                           },function(){
                               $("#save").attr("disabled",true);
                               parent.location.reload();  
                           });
                       }else{
                             var $li = $('#' + file.id),
                                 $error = $li.find('div.error');
                             // 避免重复创建
                             if (!$error.length) {
                                 // 移除原来的
                                 $li.children('div.state').remove();
                                 // 创建新的状态进度条
                                 $error = $('<div class="error"></div>').appendTo($li);
                             }
                             $error.text('上传出错');
                       }
                 });
             }

         })

    })
})


// 获取企业名称
function getApplyOrgInfo(){
    var params={
          "orgId":orgId
    }
    ajaxData('user','/user/orgInfo/getApplyOrgInfo',params,function(res){
          if(res.status == 0){
              $('#orgName').html(res.data.data.orgName);
          }
    });
}


// 获取图像
function getImg(){
  var params={
        "type":2,
        "uploadId":orgId
  }
  ajaxData('main-api','/api/file/getImg',params,function(res){
        if(res.status === 0){
            var file = res.data.data;
            var img = 'data:image/png;base64,'+file.img;



            $('#logoImg',parent.document).attr('src',img);

            var $list = $('#imagesList');
            var $div = $(' <div >'+
                '<img src="'+img+'" alt="图片">'+
                '</div>'),
                $img = $div.find('img');
            $list.empty().append($div);
            $list.css('background','#ffffff');
            $("#save").attr("disabled",true);
        }else{
            $("#save").attr("disabled",false);
        }
  });
}
