(function ($) {
	$.fn.dateSelect = function(){
		return this.each(function(){
		    var _this = this;
		    new InitDate(_this);
		 });
  };
  function InitDate(target){
          this.init(target);
	 }
     InitDate.prototype={
         init:function(target){
             this.createDiv(target);
         },
         initHour:function(){
             var hourArr = [];
             for(var i = 0;i<24;i++){
                  var _hour = i<10?"0"+i+":00":""+i+":00";
                  hourArr.push(_hour);
             }
             return hourArr;
         },
         initMin:function(){
             var minArr = [];
             for(var i = 0;i<60;i++){
                 var _min = i<10?"0"+i:""+i;
                 minArr.push(_min);
                 i+=4;
             }
             return minArr;
         },
         createDiv:function(target){
                 $('.pop-box').remove();
                 var  hourArr = this.initHour();
                 var  html =[];
                 html.push('<div class="pop-box">');
                 html.push('<ul class="time-list">')
                 for(var i=0;i<hourArr.length;i++){
                     html.push('<li class="hour"><span>'+hourArr[i]+'</span></li>');
                 }
                html.push('</ul>');
                html.push('</div>');
                var $div = $(target).closest('div.modal');
                $(html.join('')).appendTo($div).css({
                     left:$(target).offset().left,
										 top:'220.641px'
                     // top:$(target).offset().top+30
                });

                this.bindHourClick(target);
                /*当点击框以外的空白地，让下拉选择框消失*/
                $(document).mouseup(function (e) {
                     if($(e.target).closest("div.pop-box").length==0){
                        $('.pop-box').remove();
                    }
                })
         },
         bindHourClick:function(targe){
                var that = this;
                $('.time-list li.hour').each(function(i,val){
                      var  _$this = $(val);
                      _$this.unbind().bind('click',function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            var hour =  $(this).find('span').text().split(":")[0];
                            var minArr = that.initMin();
                            $('.time-list').empty();

                            var html = [];
                            for(var i=0;i<minArr.length;i++){
                                html.push('<li class="min"><span>'+hour+":"+minArr[i]+'</span></li>');
                            }
                            $(html.join('')).appendTo('.time-list');
                            that.bindMinClick(targe);
                      })
                })
         },
         bindMinClick:function(targe){
                $('.time-list li.min').each(function(i,val){
                      var  _$this = $(val);
                      _$this.unbind().bind('click',function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            var min =  $(this).find('span').text();
                            $(targe).val(min);
                            $(targe).trigger("change");
                            $('.pop-box').remove();
                      })
                })
         }
     }

})(jQuery);
