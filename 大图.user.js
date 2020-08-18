// ==UserScript==
// @name         大图
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       kygo233

// @include      https://www.javbus.com/*
// @exclude      https://www.javbus.com/actresses/*

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
    let IMG_SUFFIX="-bigimg-tag";
    let MAGNET_SUFFIX="-magnet-tag";
    GM_addStyle([
        '#waterfall {height: initial !important;width: initial !important;display: flex;flex-direction: row;flex-wrap: wrap;}',
        '#waterfall .item{position: relative !important;top: initial !important;left: initial !important;float: none;}',
        '#waterfall .movie-box  {width: initial !important;height: initial !important;display: flex;flex-direction: column;}',
        '#waterfall .avatar-box {width: auto !important;height: initial !important;display: flex;flex-direction: row;}',
        '#waterfall .movie-box .photo-frame {width:initial !important;height:initial!important; flex-grow:1 !important;}',
        '#waterfall .movie-box .photo-info { flex-grow:1 !important;}',
        '#waterfall .movie-box img {width: 100% !important;; height: 100% !important;object-fit: contain !important;}',
        '.pop-up-tag{ margin-left:auto  !important;margin-right:auto  !important;display: block;}',
        '.big-img-a{float:right;cursor:pointer;margin-left:10px;}',
    ].join(''));
    GM_addStyle('#waterfall .item{ flex: '+100/columnNum+'%;}');

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
    $('body').append('<div class="modal fade" id="myModal"  role="dialog" >'
                     +'<div class="modal-dialog" style="width:60% !important;" role="document" id="magnettablediv" ></div>');
    var select_tag= $( '<select class="form-control " style="margin-top: 8px;" id="inputGroupSelect01">'
                      + ' <option value="1">1列</option>'
                      + ' <option value="2">2列</option>'
                      + ' <option value="3">3列</option>'
                      + ' <option value="4">4列</option>'
                      + ' <option value="5">5列</option>'
                      + '  </select>');
    let li_elem = document.createElement('li');
    $(li_elem).append($(select_tag));
    $(select_tag).find("option[value='"+columnNum+"']").attr("selected",true);
    $(select_tag).change(function(){
        GM_setValue('bigImg_columnNum', $(this).val());
        GM_addStyle('#waterfall .item.item { flex: '+100/columnNum+'%;}');
        window.location.reload();
    });

    $(".visible-md-block").closest(".dropdown").after($(li_elem));

    //设置点击标签
    function setTag(){
        //判断是否有瀑布流
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

            var bigDivTag=$('<a href="javascript:;" class="big-img-a" >视频截图</a>');
            var downloadDiv=$('<a href="javascript:;" class="big-img-a" >下载封面</a>');
            var magnetDivTag=$('<a href="javascript:;"  class="big-img-a" >磁力链接</a>');
            $(spanTag).append(bigDivTag);
            $(spanTag).append(downloadDiv);
            $(spanTag).append(magnetDivTag);
            bigDivTag.click(function(){
                if(bigDivTag.text()=="视频截图"){
                    showBigImg(AVID,bigDivTag);
                }
            });
            downloadDiv.click(function(){
                GM_download(src,AVID+".jpg");
            });
            magnetDivTag.click(function(){
                showMagnetTable(AVID,src);
            });
        });
    }

    window.bbimg =function (o){

    }

    function showBigImg(avid,bigDivTag){
        var img_id=avid+IMG_SUFFIX;
        $('.pop-up-tag').hide();
        if($("#"+img_id).length>0){
            $("#"+img_id).show();
            $('#myModal').modal();
        }else{
            getAvImg(avid,bigDivTag);
        }
    }

    function getAvImg(avid,bigDivTag){
        bigDivTag.text('加载中..');
        //异步请求搜索blogjav.net的番号
        GM_xmlhttpRequest({
            method: "GET",
            url: 'http://blogjav.net/?s='+avid,
            onload: function(result) {
                var doc = result.responseText;
                let a_array = $(doc).find(".more-link");
                let imgUrl;
                for(let i = 0; i < a_array.length ; i ++){
                    imgUrl = a_array[i].href;
                    var fhd_idx = a_array[i].href.search(/FHD/g);
                    if(fhd_idx > 0) { break;}
                }
                if (imgUrl) {
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: imgUrl,
                        headers:{
                            referrer:  "http://pixhost.to/" //绕过防盗图的关键
                        },
                        onload: function(XMLHttpRequest) {
                            var bodyStr = XMLHttpRequest.responseText;
                            var img_src_arr =/<img .*src="https*:\/\/.*pixhost.to\/thumbs\/.*>/.exec(bodyStr);
                            if( img_src_arr[0]) //如果找到内容大图
                            {
                                var src = $(img_src_arr[0]).attr("src").replace('thumbs','images').replace('//t','//img').replace('"','');
                                console.log(src);
                                var img_tag=$('<img class="pop-up-tag  carousel-inner"   id="'+avid+IMG_SUFFIX+'"    src="'+src+'" />');
                                $('#magnettablediv').append(img_tag);
                                $('#myModal').modal();
                            }else{
                                bigDivTag.text('无大图');
                            }
                            bigDivTag.text('视频截图');
                        }
                    });//end  GM_xmlhttpRequest
                }else{
                     bigDivTag.text('无大图');
                }
            }
        });//end  GM_xmlhttpRequest
    };

    function showMagnetTable(avid,src){
        var table_id="#"+avid+MAGNET_SUFFIX;
        $('.pop-up-tag').hide();
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
                var table_tag=$('<table class="table pop-up-tag"  style="background-color:#FFFFFF" id="'+avid+MAGNET_SUFFIX+'"></table>');
                table_tag.append(table_html);
                $('#magnettablediv').append(table_tag);
                $('#myModal').modal();

            });
        });
    };
    setTag();
    // Your code here...
})();