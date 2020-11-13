/*------------------------------------------------------
     *封装的dialog插件，基于bootstrap模态窗口的简单扩展
-------------------------------------------------------*/
(function (root, factory) {


    "use strict";
    // AMD module is defined
    if (typeof define === "function" && define.amd) {
        define(['jquery'],function ($) {
            return {
                CreatModal:factory(root.jQuery)
            }
        });
    }else{
        root.CreatModal = factory(root.jQuery);
    }

}(this, function ($) {
    var defaults = {
        id: "modal",//弹窗id
        title: "dialog",//弹窗标题
        width: "600",//弹窗宽度，暂时不支持%
        height: "500",//弹窗高度,不支持%
        backdrop: false,//是否显示遮障，和原生bootstrap 模态框一样
        keyboard: true,//是否开启esc键退出，和原生bootstrap 模态框一样
        remote: "",//加载远程url，和原生bootstrap 模态框一样
        openEvent: null,//弹窗打开后回调函数
        closeEvent: null,//弹窗关闭后回调函数
        okEvent: null//单击确定按钮回调函数
    };

    function CreatModal($this,opts){
        this.options = $.extend( true,{}, defaults, opts );
        //$(".modal").remove();
        this.init($this);
    }
    CreatModal.prototype ={
        init: function ($this) {

            var _self = this;
            var modal = $("#" +  _self.options.id);

            if(modal.attr('id') == _self.options.id){
                modal.remove();
            }

            //动态插入窗口
            var d = _self.dHtml( _self.options);
            $("body").append(d);

            var modal = $("#" +  _self.options.id);

            //初始化窗口
            modal.modal({
                backdrop:  _self.options.backdrop,
                keyboard:  _self.options.keyboard
            });



            modal
            //显示窗口
                .modal('show')
                //隐藏窗口后删除窗口html
                .on('hidden', function () {
                    modal.remove();
                    $(".modal-backdrop").remove();
                    if ( _self.options.closeEvent) {
                        eval( _self.options.closeEvent);
                    }
                })
                //窗口显示后
                .on('shown', function () {

                    if ( _self.options.openEvent) {
                        eval( _self.options.openEvent);
                    }

                    $(document).on('show.bs.modal', '.modal', function (event) {
                        var zIndex = 1040 + (10 * $('.modal:visible').length);
                        $(this).css('z-index', zIndex);
                    });


                });
            //绑定按钮事件
            $(".dialog-confirm-btn").click(function () {
                if ( _self.options.okEvent) {
                    //_self.options.okEvent();
                     var ret =  _self.options.okEvent();
                     if (ret) {
                         modal.modal('hide');
                         _self.options={};
                     }
                }
            });
        },
        dHtml: function (o) {
            return ' <div class="modal inmodal fade transparentBg animated fadeInDown" id="'+ o.id +'" tabindex="-1" role="dialog"  aria-hidden="true">\n' +
                '        <div class="modal-dialog modal-lg">\n' +
                '            <div class="modal-content">\n' +
                '                <div class="modal-header">\n' +
                '                    <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>\n' +
                '                    <h4 class="modal-title">'+ o.title +'</h4>\n' +
                '                </div>\n' +
                '                <div class="modal-body">\n' +
                '                    <div class="horizontal-form">\n' + o.content +

                '                    </div>\n' +
                '                </div>\n' +
                '\n' +
                '                <div class="modal-footer">\n' +
                '                    <button type="button" class="btn dialog-btn" data-dismiss="modal">关闭</button>\n' +
                '                    <button type="button" class="btn dialog-btn dialog-confirm-btn">保存</button>\n' +
                '                </div>\n' +
                '            </div>\n' +
                '        </div>\n' +
                '    </div>'
        }
    };

    return CreatModal;
}));

