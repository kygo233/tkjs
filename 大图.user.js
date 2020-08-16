// ==UserScript==
// @name         大图
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include     https://www.javbus.com/*
// @exclude    https://www.javbus.com/actresses/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_download
// @grant        GM_notification
// @connect *
// ==/UserScript==

(function() {
    'use strict';
    let columnNum = GM_getValue('bigImg_columnNum', 2);
    GM_addStyle([
        '#waterfall {height: initial !important;width: initial !important;display: flex;flex-direction: row;flex-wrap: wrap;}',
        '#waterfall .item{position: relative !important;top: initial !important;left: initial !important;float: none;}',
        '#waterfall .movie-box,#waterfall .avatar-box {width: initial !important;height: initial !important;display: flex;flex-direction: column;}',
        '#waterfall .movie-box .photo-frame {width:initial !important;height:initial!important; flex-grow:1 !important;}',
        '#waterfall .movie-box .photo-info { flex-grow:1 !important;}',
        '#waterfall .movie-box img {width: 100% !important;; height: 100% !important;object-fit: contain !important;}',
    ].join(''));
    GM_addStyle('#waterfall .item.item { flex: '+100/columnNum+'%;}');

    function parsetext(text) {
        var doc = null;
        try {
            doc = document.implementation.createHTMLDocument('');
            doc.documentElement.innerHTML = text;
            return doc;
        }
        catch (e) {
            alert('parse error');
        }
    };

    function ajaxGet(url,fn) {
        let xhr=new XMLHttpRequest();
        xhr.open("GET",url);
        xhr.send();
        xhr.onreadystatechange=function () {
            if (xhr.readyState==4&&xhr.status==200) {
                fn(xhr.responseText);
            }
        }
    }

    function getAvImg(avid,bigDiv){
        bigDiv.text('加载中..');
        //异步请求搜索blogjav.net的番号
        GM_xmlhttpRequest({
            method: "GET",
            url: 'http://blogjav.net/?s='+avid,
            onload: function(result) {
                var doc = parsetext(result.responseText);
                let a_array = $(doc).find(".more-link");
                let a = a_array[0];
                for(let i = 0; i < a_array.length ; i ++){
                    var fhd_idx = a_array[i].innerHTML.search(/FHD/);
                    //debugger;
                    if(fhd_idx > 0){
                        a = a_array[i];
                        break;
                    }
                }
                if (a) {
                    //异步请求调用内页详情的访问地址
                    GM_xmlhttpRequest({
                        method: "GET",
                        //大图地址
                        url: a.href,
                        headers:{
                            referrer:  "http://pixhost.to/" //绕过防盗图的关键
                        },
                        onload: function(XMLHttpRequest) {
                            var bodyStr = XMLHttpRequest.responseText;
                            var yixieBody = bodyStr.substring(bodyStr.search(/<span id="more-(\S*)"><\/span>/),bodyStr.search(/<div class="category/));
                            var img_start_idx = yixieBody.search(/"><img .*src="https*:\/\/(\S*)pixhost.to\/thumbs\//);
                            //如果找到内容大图
                            if( img_start_idx > 0)
                            {
                                var new_img_src = yixieBody.substring(yixieBody.indexOf('src',img_start_idx) + 5,yixieBody.indexOf('alt') - 2);
                                var targetImgUrl = new_img_src.replace('thumbs','images').replace('//t','//img').replace('"','');
                                console.log(targetImgUrl);
                                imgShow(targetImgUrl);
                            }else{
                                alert('无大图');
                            }
                            bigDiv.text('视频截图');

                        },
                        onerror: function(e) {
                            console.log(e);
                        }
                    });//end  GM_xmlhttpRequest
                }
            },
            onerror: function(e) {
                console.log(e);
            }
        });//end  GM_xmlhttpRequest
    };
    $('body').append('<div id="outerdiv" style="position:fixed;top:0;left:0;background:rgba(0,0,0,0.2);z-index:999;width:100%;height:100%;display:none;">'
                     +'<div id="innerdiv" style="position:absolute;overflow-y:scroll;"><img id="bigimg" style="display:block" src="" /></div></div>');
    $('body').append('<div class="modal fade" id="myModal"  role="dialog" >'
                     +'<div class="modal-dialog"  style="background-color:#FFFFFF;" role="document" id="magnettablediv" >'
                     +'</div></div>');
    var waterfallScrollStatus=1;
    var a3= $( '<select class="form-control" id="inputGroupSelect01">'
              + ' <option value="1">1列</option>'
              + ' <option value="2">2列</option>'
              + ' <option value="3">3列</option>'
              + ' <option value="4">4列</option>'
              + ' <option value="5">5列</option>'
              + '  </select>');
    let li_elem = document.createElement('li');
    $(li_elem).append($(a3));
    $(a3).find("option[value='"+columnNum+"']").attr("selected",true);
    $(a3).change(function(){
        GM_setValue('bigImg_columnNum', $(this).val());
        GM_addStyle('#waterfall .item.item { flex: '+100/columnNum+'%;}');
        window.location.reload();
    });

    $(".visible-md-block").closest(".dropdown").after($(li_elem));
    function setBigImg(){
        if(!$('#waterfall').length){
            return;
        }
        $("a[class='movie-box']").each(function(){
            var photoDiv=$(this).children("div.photo-frame")[0];
            $(photoDiv).hide();
            var img = $(photoDiv).children("img")[0];
            var src= img.src;
            if(src.match(/pics.dmm.co.jp/)){
                src=src.replace(/ps.jpg/,"pl.jpg");
            }else {
                src=src.replace(/thumbs/,"cover").replace(/thumb/,"cover").replace(/.jpg/,"_b.jpg");
            }
            var bigimg= new Image();
            bigimg.src=src;
            $(photoDiv).append(bigimg);
            img.remove();
            $(photoDiv).show();

            var infoDiv=$(this).children("div.photo-info")[0];
            var spanTag=$(infoDiv).find("span")[0];
            var AVIDDiv=$(infoDiv).find("date")[0];
            var AVID=$(AVIDDiv).text();

            var bigDivTag=$('<a href="javascript:;">视频截图</a>');
            bigDivTag.attr("style","float:right;cursor:pointer;");
            var downloadDiv=$('<a href="javascript:;">下载封面</a>');
            downloadDiv.attr("style","float:right;cursor:pointer;margin-right:10px;");
            var magnetDivTag=$('<a href="javascript:;" >磁力链接</a>');
            magnetDivTag.attr("style","float:right;cursor:pointer;margin-right:10px;");
            $(spanTag).append(bigDivTag);
            $(spanTag).append(downloadDiv);
            $(spanTag).append(magnetDivTag);
            bigDivTag.click(function(){
                getAvImg(AVID,bigDivTag);
            });
            downloadDiv.click(function(){
                GM_download(src,AVID+".jpg");
            });
            magnetDivTag.click(function(){
                showMagnetTable(AVID,src);
            });
        });
    }
    function showMagnetTable(avid,src){
        var table_id="#"+avid+"table";
        $('.pop-up-div').hide();
        if($(table_id).length>0){
            $(table_id).show();
            $('#myModal').modal();
        }else{
            getMagnet(avid,src);
        }
    }

    function getMagnet(avid,src){
        var url= 'https://www.javbus.com/'+avid;
        ajaxGet(url,function(responseText){
            var str=/var\s+gid\s+=\s+(\d{1,})/.exec(responseText);
            var gid=str[1];
            url= 'https://www.javbus.com/ajax/uncledatoolsbyajax.php?gid='+gid+'&lang=zh&img='+src+'&uc=0&floor='+Math.floor(Math.random() * 1e3 + 1);
            ajaxGet(url,function(responseText){
                var table_html=responseText.substring(0,responseText.indexOf('<script')).trim();
                var table_id="#"+avid+"magnet-table";
                var table_tag=$('<table class="table pop-up-div" id="'+table_id+'"></table>');
                table_tag.append(table_html);
                $('#magnettablediv').append(table_tag);
                $('#myModal').modal();

            });
        });
    };
    function imgShow(targetImgUrl){
        var outerdiv="#outerdiv";
        var innerdiv="#innerdiv";
        var bigimg="#bigimg";
        $(bigimg).attr("src", targetImgUrl);//设置#bigimg元素的src属性

        /*获取当前点击图片的真实大小，并显示弹出层及大图*/
        $("<img/>").attr("src", targetImgUrl).load(function(){
            var windowW = $(window).width();//获取当前窗口宽度
            var windowH = $(window).height();//获取当前窗口高度
            var realWidth = this.width;//获取图片真实宽度
            var realHeight = this.height;//获取图片真实高度
            var imgWidth, imgHeight;
            var scale = 0.8;//缩放尺寸，当图片真实宽度和高度大于窗口宽度和高度时进行缩放
            imgWidth = windowW*scale;//如大于窗口宽度，图片宽度进行缩放
            imgHeight = imgWidth/realWidth*realHeight;//等比例缩放高度
            $(bigimg).css("width",windowW*scale);//以最终的宽度对图片缩放
            $(bigimg).css("height",imgHeight);
            var w = (windowW-windowW*scale)/2;//计算图片与窗口左边距
            var h = (windowH-windowH*scale)/2;//计算图片与窗口上边距
            $(innerdiv).css("width",windowW*scale);//以最终的宽度对图片缩放
            $(innerdiv).css("height",windowH);//以最终的宽度对图片缩放
            $(innerdiv).css({ "left":w});//设置#innerdiv的top和left属性
            $(outerdiv).fadeIn("fast");//淡入显示#outerdiv及.pimg
        });

        $(outerdiv).click(function(){//再次点击淡出消失弹出层
            $(this).fadeOut("fast");
        });
    }



    setBigImg();
    // Your code here...
})();