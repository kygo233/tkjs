// ==UserScript==
// @name         JAVBUS封面大图
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  改编自脚本 JAV老司机
// @author       kygo233
// @include      https://*.javbus.*/*
// @include      https://*.busfan.*/*
// @include      https://*.fanbus.*/*

// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_download
// @grant        GM_setClipboard
// @connect *

// 2021-01-01 新增宽度调整功能;
// 2020-12-29 解决半图模式下 竖图显示不全的问题;
// 2020-10-16 解决功能开关取默认值为undefined的bug
// 2020-10-16 解决和"JAV老司机"同时运行时样式冲突问题，需关闭老司机的瀑布流
// 2020-10-14 收藏界面只匹配影片；下载图片文件名添加标题；新增复制番号、标题功能；视频截图文件下载；封面显示半图；增加样式开关
// 2020-09-20 收藏界面的适配
// 2020-08-27 适配更多界面
// 2020-08-26 修复查询结果为1个时，item宽度为100%的问题
// 2020-08-26 添加瀑布流
// 2020-08-24 第一版：封面大图、下载封面、查看视频截图
// ==/UserScript==

(function() {
    'use strict';
    // 瀑布流状态：1：开启、0：关闭
    let waterfallScrollStatus = GM_getValue('waterfall_status', 0);
    let copyBtnStatus = GM_getValue('copyBtn_status', 1);
    let aTagStatus = GM_getValue('aTag_status', 1);
    let itemTagStatus = GM_getValue('itemTag_status', 1);
    let halfImgStatus = GM_getValue('halfImg_status', 0);
    let waterfallWidth = GM_getValue('waterfallWidth', 100);

    let statusDefaultMap = new Map(); // 空Map
    statusDefaultMap.set('waterfall', 0); //
    statusDefaultMap.set('copyBtn', 1); //
    statusDefaultMap.set('aTag', 1);
    statusDefaultMap.set('itemTag', 1);
    statusDefaultMap.set('halfImg', 0);
    let columnNum_full = GM_getValue('bigImg_columnNum_full', 3);
    let columnNum_half = GM_getValue('bigImg_columnNum_half', 4);
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

    //添加全局样式 导航栏功能按钮
    function addStyle(){
        GM_addStyle([
            '#waterfall_h1 {margin:0 auto;height: auto !important;display: flex;flex-direction: row;flex-wrap: wrap;padding:10px;}',
            '#waterfall_h1 .item{position: relative !important;top: auto !important;left: auto !important;}',
            '#waterfall_h1 .movie-box  {margin:5px !important; width: auto !important;height: auto !important;display: flex;flex-direction: column;}',
            '#waterfall_h1 .avatar-box {width: auto !important;height: auto !important;display: flex;flex-direction: row;}',
            '#waterfall_h1 .movie-box .photo-frame {width:auto !important;height:auto!important; }',
            '.pop-up-tag{ margin-left:auto  !important;margin-right:auto  !important;}',
            '.big-img-a{float:right;cursor:pointer !important;margin-left:5px;color:black;opacity:0.8;}',
            '.big-img-a:hover{color:blue;}',
            '.download-icon{font-size:50px;color:black;position:absolute;right:0;z-index:2;cursor:pointer }',
            '.copyBtn-icon{font-size:18px;opacity:0.4;top:3px !important;}',
            '.copyBtn:hover{color:red;opacity:1;}',
            '.switch_div { cursor:pointer ;display: flex;flex-direction: row;flex-wrap: wrap;}',
            '.switch_div:hover{background-color:#E6E6FA;}',
            '.switch_div label {cursor:pointer;width: 50%;text-align: right;}',
            '.switch_div input {cursor:pointer;width: 50%;}',
            '.fullImgCSS {width: 100% !important;; height: 100% !important;}',
            '.halfImgCSS {position: relative;left:-110.5%;width: 210% !important;; height: 100% !important;}',
            '.range_div {display: flex;flex-direction: row;flex-wrap: wrap;}',
            '.range_div input{cursor:pointer ;width: 80%;}',
            '.range_div span{  width: 20%;text-align: center;}',
        ].join(''));

        var columnNum=halfImgStatus>0?columnNum_half:columnNum_full;
        GM_addStyle('#waterfall_h1 .item{ width: '+100/columnNum+'%;}');

        $("#waterfall_h1").css("width",waterfallWidth+"%");
        //添加bootstrap弹出框，用于显示磁力表格和视频截图，
        $('body').append('<div class="modal fade" id="myModal"  role="dialog" >'
                         +'<div class="modal-dialog" style="width:80% !important;"  id="magnettablediv" > </div>');
        //列数下拉框,
        var select_tag= $( '<select class="form-control" style="margin-top: 8px;padding:0;" id="inputGroupSelect01">'
                          + ' <option value="1">1列</option><option value="2">2列</option><option value="3">3列</option>'
                          + ' <option value="4">4列</option><option value="5">5列</option><option value="6">6列</option></select>');
        $(select_tag).find("option[value='"+columnNum+"']").attr("selected",true);
        $(select_tag).change(function(){
            GM_setValue('bigImg_columnNum_'+(halfImgStatus>0?'half':'full'), $(this).val());
            window.location.reload();
        });
        let li_elem = document.createElement('li');
        $(li_elem).append($(select_tag));
        $("#navbar ul.nav").first().append($(li_elem));

        var other_select_tag= $('<li class="dropdown">'
                                +' <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" data-hover="dropdown" >样式开关<span class="caret"></span></a>'
                                +' <ul class="dropdown-menu" role="menu">'
                                +'</ul> </li>');
        $(other_select_tag).mouseover(function() {
            $(this).addClass('open');
        }).mouseout(function() {
            $(this).removeClass('open');
        });
        var ul =$(other_select_tag).children("ul")[0];
         $(ul).on("click","[data-stopPropagation]",function(e) {
           e.stopPropagation();
        });
        $(ul).append(creatCheckbox("waterfall","瀑布流"));
        $(ul).append(creatCheckbox("copyBtn","复制图标"));
        $(ul).append(creatCheckbox("aTag","功能链接"));
        $(ul).append(creatCheckbox("itemTag","高清图标"));
        $(ul).append(creatCheckbox("halfImg","封面半图"));
        var range=$('<li data-stopPropagation="true" ><div  class="range_div"><input type="range"   min="1" max="100" step="1" value="'+waterfallWidth+'"  /><span>'+waterfallWidth+'</span></div></li>');
        $(range).bind('input propertychange', function() {
            var val=$(this).find("input").eq(0).val();
            $("#waterfall_h1").css("width",val+"%");
    	    $(this).find("span").eq(0).html(val);
            GM_setValue("waterfallWidth", val);
		});
        $(ul).append( range);

        $(ul).append('<div style="padding:4px;">和"JAV老司机"同时运行时，请关闭老司机的瀑布流<div>');
        $("#navbar ul.nav").first().append($(other_select_tag));

    }
    //根据id、name生成勾选框
    function creatCheckbox(tagName,name){
        var checkbox = $('<li><div class="switch_div"><label   for="'+tagName+'_checkbox" >'+name+'</label><input  type="checkbox" id="'+tagName+'_checkbox" /></div></li>');
        var status=tagName+"_status";
        checkbox.find("input")[0].checked=GM_getValue(status,statusDefaultMap.get(tagName)) > 0?true:false;
        checkbox.click(function () {
            ($(this).find("input")[0].checked==true)?GM_setValue(status, 1): GM_setValue(status, 0);
            window.location.reload();
        });
        return checkbox;
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
      //判断是否为半图显示
        if(halfImgStatus>0){
             $(bigimg).addClass("halfImgCSS");
             $(bigimg).load(function(){
               if(bigimg.height>bigimg.width){
                   $(bigimg).removeClass("halfImgCSS");
                   $(bigimg).addClass("fullImgCSS");
               }
             });
        }else{
           $(bigimg).addClass("fullImgCSS");
        }
        $(photoDiv).append(bigimg);
        img.remove();
        $(photoDiv).show();
        //替换封面为大图 end
        var infoDiv=$(tag).find("div.photo-info")[0];
        var spanTag=$(infoDiv).find("span")[0];

        var title=$(spanTag).html().split("<br")[0].trim();//标题
        //  $(spanTag).html($(spanTag).html().replace(/.*?<br>/,title));
        var AVIDDiv=$(infoDiv).find("date")[0];
        var AVID=$(AVIDDiv).text(); //番号
        if(itemTagStatus<1){
            $(spanTag).children("div").remove();
        }
        if(copyBtnStatus > 0){
            addCopyATagPre(spanTag,title);
            addCopyATagPre(AVIDDiv,AVID);
        }
        if(aTagStatus> 0){
            var bigDivTag=$('<a href="javascript:;" class="big-img-a" >视频截图</a>');
            var downloadDiv=$('<a href="javascript:;" class="big-img-a" >下载封面</a>');
            var magnetDivTag=$('<a href="javascript:;"  class="big-img-a" >磁力链接</a>');
            $(spanTag).append(bigDivTag);
            $(spanTag).append(downloadDiv);
            $(spanTag).append(magnetDivTag);
            bigDivTag.click(function(){showBigImg(AVID,title,bigDivTag);});
            downloadDiv.click(function(){GM_download(src,AVID+" "+title+".jpg");});
            magnetDivTag.click(function(){ showMagnetTable(AVID,src);});
        }
    }
    //添加复制图标
    function addCopyATagPre(tag,text){
        var copyATag = $('<span class="glyphicon glyphicon-copy copyBtn copyBtn-icon"></span>');
        copyATag.click(function(){
            var span=this;
            $(span).removeClass("glyphicon glyphicon-copy").addClass('glyphicon glyphicon-ok');
            //btn.innerHTML = '成功>';
            GM_setClipboard(text);
            setTimeout(function() {
                $(span).removeClass("glyphicon glyphicon-ok").addClass('glyphicon glyphicon-copy');
                //   btn.innerHTML = '复制>';
            }, 1000);
            return false;
        });
        $(tag).prepend(copyATag);
    }
    //显示视频截图
    function showBigImg(avid,title,bigDivTag){
        if(bigDivTag.text()!="视频截图"){return;}
        var img_id=avid+IMG_SUFFIX;
        $('.pop-up-tag').hide();
        if($("#"+img_id).length>0){
            $("#"+img_id).show();
            $('#myModal').modal();
        }else{
            getAvImg(avid,title,bigDivTag);
        }
    }
    //获取视频截图
    function getAvImg(avid,title,bigDivTag){
        bigDivTag.text('加载中..');

        GM_xmlhttpRequest({
            method: "GET",
            url: 'http://blogjav.net/?s='+avid,
            onload: function(result) {
                if(result.status!==200)
                { alert('blogjav.net此网站暂时无法响应');
                 bigDivTag.text('视频截图');
                 return;}
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
                                var img_tag=$('<div id="'+avid+IMG_SUFFIX+'" class="pop-up-tag" ><img class="carousel-inner" src="'+src+'" /></div>');
                                var downloadBtn = $('<span class="glyphicon glyphicon-download-alt download-icon copyBtn" ></span>');
                                downloadBtn.click(function(){
                                    GM_download(src,avid+" 截图.jpg");
                                });
                                $(img_tag).prepend(downloadBtn);
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
        var basehref=`${location.protocol}//${location.hostname}/`;
        avid=avid.replace(/\./g,'-');
        var url= basehref+avid;
        //有码和欧美 0  无码 1
        var uc_code=location.pathname.search(/uncensored/) < 1?0:1;
        ajaxGet(url,function(responseText){
            var str=/var\s+gid\s+=\s+(\d{1,})/.exec(responseText);
            var gid=str[1];
            url= basehref+ 'ajax/uncledatoolsbyajax.php?gid='+gid+'&lang=zh&img='+src+'&uc='+uc_code+'&floor='+Math.floor(Math.random() * 1e3 + 1);
            ajaxGet(url,function(responseText){
                var table_html=responseText.substring(0,responseText.indexOf('<script')).trim();
                var table_tag=$('<table class="table pop-up-tag"  style="background-color:#FFFFFF;" id="'+avid+MAGNET_SUFFIX+'"></table>');
                table_tag.append($(table_html));
                var length=table_tag.find("tr").length;
                var HEIGHT=window.innerHeight;
                if( HEIGHT>=35*length){
                    table_tag.css("margin-top",(HEIGHT-35*length)/2-40);
                }
                $('#magnettablediv').append(table_tag);
                $('#'+avid+MAGNET_SUFFIX).find("tr").each(function(i){ // 遍历 tr
                    var me=this;
                    if($(me).find('a').length==0){ return true;}
                    var magent_url = $(me).find('a')[0].href;
                    addCopybutton(me,magent_url);
                });
                $('#myModal').modal();
            });
        });
    };
    function addCopybutton(tag,text){
        var copyButton = $('<button class="center-block">复制</button>');
        copyButton.click(function(){
            var btn=this;
            btn.innerHTML = '成功';
            GM_setClipboard(text);
            setTimeout(function() {
                btn.innerHTML = '复制';
            }, 1000);
        });
        var td_tag=$('<td></td>');
        td_tag.append(copyButton);
        $(tag).prepend(td_tag);
    }
    class Lock {
        constructor(d = false) { this.locked = d; }
        lock() { this.locked = true;}
        unlock() { this.locked = false; }
    }

    function waterfallScrollInit() {
        if(!location.pathname.includes('/actresses') &&
           !(location.pathname.includes('mdl=favor') && location.pathname.search(/sort=[1-4]/)>0) &&
           $('div#waterfall div.item').length){
                $('#waterfall')[0].id="waterfall_h1";
                //解决和"JAV老司机"同时运行时样式冲突问题--begin
                if($('.masonry').length>0){
                    $('.masonry').addClass("masonry2");
                    $('.masonry').removeClass("masonry");
                }
                if($('#waterfall_h').length>0){
                    $('#waterfall_h')[0].id="waterfall_h1";
                }
                //解决 JAV老司机 第619行 $pages[0].parentElement.parentElement.id = "waterfall_h";
                //收藏界面样式变形的问题
                if($('#waterfall_h1.row').length>0){
                    $('#waterfall_h1.row').removeAttr("id");
                }
                //解决和"JAV老司机"同时运行时样式冲突问题--end
                addStyle();
                //样式比瀑布流先生效，所以先隐藏掉原图
                if($('#waterfall_h1 .movie-box img').length>0){
                   $('#waterfall_h1 .movie-box img').hide();
                }
                if(waterfallScrollStatus > 0) {
                    var w = new waterfall({});
                }else{
                    var elems = $('div#waterfall_h1 div.item');
                    if(!elems.length){return;};
                    $('.masonry2').empty().append(elems);
                    for (let i = 0; i < elems.length; i++) {
                        if($(elems[i]).find(".avatar-box").length > 0) continue;
                        setTag(elems[i]);
                    }
                }
        }
    };
    function waterfall(selectorcfg = {}){
        this.lock = new Lock();
        this.baseURI = this.getBaseURI();
        this.selector = {
            next: 'a#next',
            item: 'div#waterfall div.item',
            cont: '.masonry2',
            pagi: '.pagination-lg',
        };
        Object.assign(this.selector, selectorcfg);
        this.pagegen = this.fetchSync(location.href);
        this.anchor = $(this.selector.pagi)[0];
        this._count = 0;
        this._1func = function (cont, elems) {
            cont.empty().append(elems);
        };
        this._2func = function (cont, elems) {
            if (location.pathname.includes('/star/') && elems) {
                cont.append(elems.slice(1));
            } else {
                cont.append(elems);
            }
        };
        this._3func = function ( elems) {
            if(!location.pathname.includes('/actresses') && elems){//排除actresses页面
                for (let i = 0; i < elems.length; i++) {
                    if($(elems[i]).find(".avatar-box").length > 0) continue;
                    setTag(elems[i]);
                }
            }
        };
        if ($('div#waterfall_h1 div.item').length>0 || $('div#waterfall div.item').length>0) {
            document.addEventListener('scroll', this.scroll.bind(this));
            document.addEventListener('wheel', this.wheel.bind(this));
            this.appendElems(this._1func);
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
        do { yield new Promise((resolve, reject) => {
            if (this.lock.locked) { reject(); }
            else {this.lock.lock();resolve(); }
        }).then(() => {
            return this.fetchURL(url).then(info => {
                url = info.nextURL;
                return info.elems;
            });
        }).then(elems => {
            this.lock.unlock();
            return elems;
        }).catch((err) => { });
           } while (url);
    };
    // 瀑布流脚本
    waterfall.prototype.appendElems = function () {
        let nextpage = this.pagegen.next();
        if (!nextpage.done) {
            nextpage.value.then(elems => {
                const cb = (this._count === 0) ? this._1func : this._2func;
                cb($(this.selector.cont), elems);
                this._count += 1;
                this._3func(elems);
            }) ;
        }
        return nextpage.done;
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

    waterfallScrollInit();
    // Your code here...
})();