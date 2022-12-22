import $ from 'jquery' ;
var play = function (){
    var $picture = $('.picture'),
        $pictureS = $picture.children(),
        $pre = $('.pre'),
        $next = $('.next'),
        $follow = $('.follow'),
        $imgS = $pictureS.length,
        $imgWidth = $pictureS.width();
    
    var thumbnail_num = 5, //展示缩略图数量
        small_thumbnail_num = 4,//小图数
        small_thumbnail_w = 112,//小图宽度
        small_thumbnail_h = 57,//小图高度
        big_thumbnail_w = 132,//大图宽度
        big_thumbnail_h = 66,//大图高度
        borderWidth = 2,//图片边框 选中样式
        img_interval = 8;// 图片间隔距离
        //  img_W = img_interval + small_thumbnail_w;// 小图占据宽度 加间隔距离

    //图片少于 5个 后面不在执行
    if($imgS <= thumbnail_num){
        $follow.addClass("text_align_c")
    }
    if($imgS < 2){return}

    $picture.prepend($pictureS.last().clone());
    $picture.append($pictureS.first().clone());
    imgtotal = $picture.children().length;
    $picture.css({left:0-$imgWidth,width:imgtotal*$imgWidth});

    var curIdx = 0;
    var isAnimate = false;

    if($imgS >= thumbnail_num){
        $follow_first_img_w = $follow.children().outerWidth(true);
        $follow.width(($imgS - 1) * img_W + $follow_first_img_w);
    }

    $pre.on('click',function(){
         playPre();
    });
    $next.on('click',function(){
         playNext();
    });
    $follow.find('li').on('click',function(){
         var $idx = $(this).index();
         if($idx > curIdx){
             playNext($idx - curIdx);
         }else if($idx < curIdx){
             playPre(curIdx - $idx);
         }
    });

    playGo();

    function playPre(idx){
        // eslint-disable-next-line no-redeclare
        var idx = idx || 1;
        if(isAnimate){return};
        isAnimate = true;
        $picture.animate({left: '+=' + ($imgWidth*idx)},function(){
            curIdx = ($imgS + curIdx - idx)%$imgS;
            // eslint-disable-next-line no-unused-expressions
            if(curIdx === ($imgS - 1)){idx
                $picture.css({left: 0-$imgWidth*$imgS});
            }
            isAnimate =false;
            follow(1);
        })
    }

    function playNext(idx){
        // eslint-disable-next-line no-redeclare
        var idx = idx || 1;
        if(isAnimate){return}
        isAnimate = true;
        $picture.animate({left: '-=' + ($imgWidth*idx)},function(){
            curIdx = (curIdx + idx)%$imgS;
            if(curIdx === 0){
                $picture.css({left: 0-$imgWidth});
            }
            isAnimate = false;
            follow(2);
        })
    }

    function follow(direction){
        //选中的图片添加边框
        $follow.children().removeClass('hover')
                .eq(curIdx).addClass('hover');	
        
        //动画大图变小图
        $follow.children().eq(curIdx).siblings().find("img").animate({
            width: small_thumbnail_w,
            height: small_thumbnail_h,
            borderWidth: "0px"
        })
        //动画小图变大图	
        $follow.children().eq(curIdx).find("img").animate({
            width: big_thumbnail_w,
            height: big_thumbnail_h,
            borderWidth: borderWidth
        })
        //图片数量大于 5
        if($imgS >= thumbnail_num){
            var $follow_li = $follow.children();
            var $follow_li_len = $follow_li.length;
            //获取 当前元素前面的兄弟元素
            var $first_li =  $follow_li.eq(curIdx).prevAll();
            var $first_li_len = $first_li.length;
            //获取 当前元素后面的兄弟元素
            var $last_li =  $follow_li.eq(curIdx).nextAll();
            var $last_li_len = $last_li.length;

            //下一页
            if(direction === 2){
                //获取匹配元素相对父元素的偏移 用于判断显示的缩略图中当前位于第五
                var to_left_num = $(".breviary").find(".hover").position().left;
                if(curIdx !== 0 && to_left_num > 400){
                    if($last_li_len >= small_thumbnail_num){
                        $follow.animate({
                            marginLeft: -(img_W*small_thumbnail_num),
                        })
                    }else if($last_li_len < small_thumbnail_num){
                        var style = $(".follow").attr("style");
                        var _num_px = style.split("margin-left: ")[1];
                        var _num = _num_px === undefined ? 0 : _num_px.replace("px;",'')
                        $follow.animate({
                            marginLeft: -(img_W * $last_li_len + -_num),
                        })
                    }
                }
            }
            //上一页
            if(direction === 1){
                //获取匹配元素相对父元素的偏移 用于判断显示的缩略图中当前位于第一
                // eslint-disable-next-line no-redeclare
                var to_left_num = $(".breviary").find(".hover").position().left;
                if(curIdx === $follow_li_len - 1){
                    $follow.animate({
                        marginLeft: -( img_W*($follow_li_len-thumbnail_num) ),
                    })
                }
                click_img_and_left()
            }
            //点击缩略图
            if(curIdx === 0){
                $follow.animate({
                    marginLeft: 0,
                })
            }
            click_img_and_left()
            function click_img_and_left(){
                if(to_left_num === -8 && $first_li_len >= small_thumbnail_num){
                    $follow.animate({
                        marginLeft: -( img_W * ($first_li_len - small_thumbnail_num) ),
                    })
                }else if(to_left_num === -8 && $first_li_len < small_thumbnail_num){
                    $follow.animate({
                        marginLeft: 0,
                    })
                }
            }
        }
    }

    function playGo(){
        colck = setInterval(function(){
            playNext();
        },4000);
    }
    $("#carousel").hover(function(){
        clearInterval(colck)
    },function(){
        playGo()
    })
};
play();
