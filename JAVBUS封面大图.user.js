﻿// ==UserScript==
// @name         JAVBUS封面大图
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  改编自脚本 JAV老司机
// @author       kygo233
// @include      https://www.javbus.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_download
// @grant        GM_setClipboard
// @connect *
// 2020-08-26 修复查询结果为1个时，item宽度为100%的问题
// 2020-08-26 添加瀑布流
// 2020-08-24 第一版：封面大图、下载封面、查看视频截图
// ==/UserScript==

(function() {
    'use strict';
    // 瀑布流状态：1：开启、0：关闭
    let waterfallScrollStatus = GM_getValue('scroll_status', 0);
    let columnNum = GM_getValue('bigImg_columnNum', 3);
    let IMG_SUFFIX="-bigimg-tag";
    let MAGNET_SUFFIX="-magnet-tag";
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
    function addStyle(){
        GM_addStyle([
            '#waterfall_h {width: auto !important;height: auto !important;display: flex;flex-direction: row;flex-wrap: wrap;}',
            '#waterfall_h .item{position: relative !important;top: auto !important;left: auto !important;}',
            '#waterfall_h .movie-box  {margin:6px!important;width: auto !important;height: auto !important;display: flex;flex-direction: column;}',
            '#waterfall_h .movie-box .photo-frame {width:auto !important;height:auto!important; }',
            '#waterfall_h .movie-box img {width: 100% !important;; height: 100% !important;object-fit: contain !important;}',
            '.pop-up-tag{ margin-left:auto  !important;margin-right:auto  !important;display: block;}',
            '.big-img-a{float:right;cursor:pointer;margin-left:10px;}',
        ].join(''));
        GM_addStyle('#waterfall_h .item{ width: '+100/columnNum+'%;}');
        //添加bootstrap弹出框，用于显示磁力表格和视频截图，
        $('body').append('<div class="modal fade" id="myModal"  role="dialog" >'
                         +'<div class="modal-dialog" style="width:60% !important;" role="document" id="magnettablediv" ></div>');
        //列数下拉框,
        var select_tag= $( '<select class="form-control " style="margin-top: 8px;" id="inputGroupSelect01">'
                          + ' <option value="1">1列</option>'
                          + ' <option value="2">2列</option>'
                          + ' <option value="3">3列</option>'
                          + ' <option value="4">4列</option>'
                          + ' <option value="5">5列</option>'
                          + '  </select>');
        $(select_tag).find("option[value='"+columnNum+"']").attr("selected",true);
        $(select_tag).change(function(){
            GM_setValue('bigImg_columnNum', $(this).val());
            GM_addStyle('#waterfall .item.item { flex: '+100/columnNum+'%;}');
            window.location.reload();
        });
        let li_elem = document.createElement('li');
        $(li_elem).append($(select_tag));
        $("#navbar ul.nav").first().append($(li_elem));
    }


    //设置点击标签
    function setTag(tag){
        //替换封面为大图 Begin
        var photoDiv=$(tag).find("div.photo-frame")[0];
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
        //替换封面为大图 end
        var infoDiv=$(tag).find("div.photo-info")[0];
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

    }

    //显示视频截图
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
    //获取视频截图
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
    //显示磁力表格
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
    //ajax 获取磁力链接
    function getMagnet(avid,src){
        var url= 'https://www.javbus.com/'+avid;
        ajaxGet(url,function(responseText){
            var str=/var\s+gid\s+=\s+(\d{1,})/.exec(responseText);
            var gid=str[1];
            url= 'https://www.javbus.com/ajax/uncledatoolsbyajax.php?gid='+gid+'&lang=zh&img='+src+'&uc=0&floor='+Math.floor(Math.random() * 1e3 + 1);
            ajaxGet(url,function(responseText){
                var table_html=responseText.substring(0,responseText.indexOf('<script')).trim();
                var table_tag=$('<table class="table pop-up-tag"  style="background-color:#FFFFFF" id="'+avid+MAGNET_SUFFIX+'"></table>');
                var tbody_jq= $(table_html);
                table_tag.append(tbody_jq);
                $('#magnettablediv').append(table_tag);

                $('#'+avid+MAGNET_SUFFIX).find("tr").each(function(i){ // 遍历 tr
                    var me=this;
                    var copyButton = $('<button>复制</button>');
                    var magent_url = $(me).find('a')[0].href;
                    copyButton.click(function(){
                        var btn=this;
                        btn.innerHTML = '成功';
                        GM_setClipboard(magent_url);
                        setTimeout(function() {
                            btn.innerHTML = '复制';
                        }, 1000);
                    });
                    var td_tag=$('<td></td>');
                    td_tag.append(copyButton);
                    $(me).prepend(td_tag);
                });
                $('#myModal').modal();
            });
        });
    };

    class Lock {
        constructor(d = false) {
            this.locked = d;
        }
        lock() {
            this.locked = true;
        }
        unlock() {
            this.locked = false;
        }
    }

    function waterfallScrollInit() {
        var $pages = $('div#waterfall div.item');
        if ($pages .length) {
            if(!location.pathname.includes('/actresses')){
                GM_addStyle('#waterfall_h .avatar-box {width: auto !important;height: auto !important;display: flex;flex-direction: row;}');
                $('#waterfall')[0].id="waterfall_h";
                addStyle();
            }
            waterfallButton();
            var w = new waterfall({});

        }
    };
    function waterfall(selectorcfg = {}){
        this.lock = new Lock();
        this.baseURI = this.getBaseURI();
        this.selector = {
            next: 'a#next',
            item: 'div#waterfall div.item',
            cont: '.masonry',
            pagi: '.pagination-lg',
        };
        Object.assign(this.selector, selectorcfg);
        this.pagegen = this.fetchSync(location.href);
        this.anchor = $(this.selector.pagi)[0];
        this._count = 0;
        this._2func = function (cont, elems) {
            if (location.pathname.includes('/star/') && elems) {
                cont.append(elems.slice(1));
            } else {
                cont.append(elems);
            }
        };
        this._3func = function ( elems) {
            if(!location.pathname.includes('/actresses')){//排除actresses页面
                for (let i = 0; i < elems.length; i++) {
                    if($(elems[i]).find("div.avatar-box").length > 0) continue;
                    setTag(elems[i]);
                }
            }
        };
        if ($(this.selector.item).length) {
            // 开启关闭瀑布流判断
            if(waterfallScrollStatus > 0) {
                document.addEventListener('scroll', this.scroll.bind(this));
                document.addEventListener('wheel', this.wheel.bind(this));
            }
            this.appendElems();
        }
    }
    waterfall.prototype.getBaseURI = function () {
        let _ = location;
        return `${_.protocol}//${_.hostname}${(_.port && `:${_.port}`)}`;
    };
    waterfall.prototype.getNextURL = function (href) {
        let a = document.createElement('a');
        a.href = href;
        return `${this.baseURI}${a.pathname}${a.search}`;
    };
    // 瀑布流脚本
    waterfall.prototype.fetchURL = function (url) {
        console.log(`fetchUrl = ${url}`);
        const fetchwithcookie = fetch(url, {credentials: 'same-origin'});
        return fetchwithcookie.then(response => response.text())
            .then(html => new DOMParser().parseFromString(html, 'text/html'))
            .then(doc => {
            let $doc = $(doc);
            let href = $doc.find(this.selector.next).attr('href');
            let nextURL = href ? this.getNextURL(href) : undefined;
            let elems = $doc.find(this.selector.item);
            return {
                nextURL,
                elems
            };
        });
    };
    // 瀑布流脚本
    waterfall.prototype.fetchSync = function* (urli) {
        let url = urli;
        do {
            yield new Promise((resolve, reject) => {
                if (this.lock.locked) {
                    reject();
                }
                else {
                    this.lock.lock();
                    resolve();
                }
            }).then(() => {
                return this.fetchURL(url).then(info => {
                    url = info.nextURL;
                    return info.elems;
                })
                ;
            }).then(elems => {
                this.lock.unlock();
                return elems;
            }).catch((err) => {
                // Locked!
            });
        } while (url);
    };
    // 瀑布流脚本
    waterfall.prototype.appendElems = function () {
        if(this._count === 0){
             var elems=$('div#waterfall_h div.item');
             $(this.selector.cont).empty().append(elems);
             this._count += 1;
             this._3func(elems);
        }else{
            let nextpage = this.pagegen.next();
            if (!nextpage.done) {
                nextpage.value.then(elems => {
                    this._2func($(this.selector.cont), elems);
                    this._count += 1;
                    this._3func(elems);
                }) ;
            }
        }
    };
    // 瀑布流脚本
    waterfall.prototype.end = function () {
        document.removeEventListener('scroll', this.scroll.bind(this));
        document.removeEventListener('wheel', this.wheel.bind(this));
        let $end = $(`<h1>The End</h1>`);
        $(this.anchor).replaceWith($end);
    };
    waterfall.prototype.reachBottom = function (elem, limit) {
        return (elem.getBoundingClientRect().top - $(window).height()) < limit;
    };
    waterfall.prototype.scroll = function () {
        if (this.reachBottom(this.anchor, 500) && this.appendElems(this._2func)) {
            this.end();
        }
    };
    waterfall.prototype.wheel = function () {
        if (this.reachBottom(this.anchor, 1000) && this.appendElems(this._2func)) {
            this.end();
        }
    };

    function waterfallButton() {
        var checkbox = $('<a href="javascript:;" >瀑布流<input  type="checkbox"  /></a>');
        checkbox.find("input")[0].checked=waterfallScrollStatus > 0?true:false;
        checkbox.click(function () {
            if ($(this).find("input")[0].checked==true) {
                GM_setValue('scroll_status', 1);
            } else {
                GM_setValue('scroll_status', 0);
            }
            window.location.reload();
        });
        let li_elem = document.createElement('li');
        $(li_elem).append(checkbox);
        $("#navbar ul.nav").first().append($(li_elem));
    }
    waterfallScrollInit();
    // Your code here...
})();