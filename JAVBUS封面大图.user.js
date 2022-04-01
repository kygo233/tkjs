// ==UserScript==
// @name         JAVBUS larger thumbnails
// @name:zh-CN   JAVBUS封面大图
// @namespace    https://github.com/kygo233/tkjs
// @homepage     https://sleazyfork.org/zh-CN/scripts/409874-javbus-larger-thumbnails
// @version      20220328
// @author       kygo233
// @license      MIT
// @description          replace thumbnails of javbus,javdb,javlibrary and avmoo with source images
// @description:zh-CN    javbus,javdb,javlibrary,avmoo替换封面为源图

// @include      *javbus.com/*
// @include      *javdb.com/*
// @include      *avmoo.cyou/*
// @include      *javlibrary.com/*
// @include      /^.*(javbus|busjav|busfan|fanbus|buscdn|cdnbus|dmmsee|seedmm|busdmm|dmmbus|javsee|seejav)\..*$/
// @include      /^.*(javdb)[0-9]*\..*$/
// @include      /^.*(avmoo)\..*$/

// @require      https://cdn.jsdelivr.net/npm/vanilla-lazyload@17.3.0/dist/lazyload.min.js

// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_download
// @grant        GM_setClipboard
// @connect *

// 2022-03-28 匹配dmmbus;修复标题不可点击的bug
// 2022-03-18 修复欧美区磁力按钮打开重复的问题；javlibrary添加将左侧菜单上移的功能
// 2022-03-03 调整设置按钮到左上角；删除javdb磁力列表里的广告
// 2021-09-03 匹配javdb更多网址 例如javdb30
// 2021-08-18 调整blogjav视频截图获取方法
// 2021-06-03 修复javdb磁力弹窗预告片播放bug；番号变成可点击
// 2021-06-01 修复多列布局下 图片样式失效的问题
// 2021-05-31 JavDb添加磁力功能;解决已点击链接颜色失效问题;对大于标准宽高比的图片进行缩放;
// 2021-05-06 适配javlibrary;添加标题全显样式控制;自动翻页开关无需刷新页面;删除高清图标的显示控制
// 2021-04-04 适配JAVDB;点击图片弹出新窗口;标题默认显示一行;调整样式;增加英文显示
// 2021-03-09 恢复高清字幕图标的显示
// 2021-02-06 新增图片懒加载插件；重调样式；优化按钮效果，切换样式不刷新页面；磁力界面新增演员表样品图显示；
// 2021-01-18 适配AVMOO网站;无码页面屏蔽竖图模式;调整域名匹配规则
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

(function () {
    'use strict';
    let statusDefault = {
        autoPage: false,
        copyBtn :true,
        toolBar: true,
        avInfo:true,
        halfImg:false,
        fullTitle:false,
        waterfallWidth:100,
        columnNumFull:3,
        columnNumHalf:4,
        menutoTop : false
    };
    const SCREENSHOT_SUFFIX = "-screenshot-tag";
    const AVINFO_SUFFIX = "-avInfo-tag";
    const blogjavSelector= "h2.entry-title>a";
    const fullImgCSS=`width: 100%!important;height:100%!important;`;
    const halfImgCSS=`position: relative;left: -112%;width: 212% !important;height: 100% !important;max-width: 212%;`;

    const copy_Svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"  width="16" height="16" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/></svg>`;
    const download_Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="tool-svg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/></svg>`;
    const picture_Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  class="tool-svg" viewBox="0 0 16 16"><path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/></svg>`;
    const magnet_Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  class="tool-svg" x="0px" y="0px" viewBox="0 0 1000 1000" ><g><g transform="translate(0.000000,460.000000) scale(0.100000,-0.100000)"><path d="M4171.6,3994c-183.9-13.4-515.3-67.1-706.9-113c-770.2-187.7-1448.4-563.3-2021.2-1118.8c-707-685.9-1130.3-1494.4-1299-2481c-59.4-358.3-59.4-1002,0-1360.2c157.1-923.4,546-1705.1,1172.5-2354.6c695.4-722.3,1534.6-1159.1,2548.1-1325.7c174.4-28.7,388.9-34.5,1643.8-40.2l1440.7-7.7v1302.8v1302.8l-1354.5,7.6c-1207,5.7-1369.8,9.6-1480.9,40.2c-448.3,116.9-785.5,335.3-1036.5,666.7c-252.9,339.1-364,666.7-364,1088.2s111.1,749.1,364,1088.2c241.4,318,595.8,551.8,1000.1,659.1c157.1,40.2,191.6,42.1,1517.3,47.9l1354.5,7.7v1302.8v1300.9l-1344.9-3.8C4863.3,4001.6,4219.5,3997.8,4171.6,3994z"/><path d="M7620.1,2704.6V1401.8h1139.9H9900v1302.8v1302.8H8760.1H7620.1V2704.6z"/><path d="M7620.1-3502.7v-1302.8h1139.9H9900v1302.8v1302.8H8760.1H7620.1V-3502.7z"/></g></g></svg>`;

    const LOCALE = {
        zh: {
            menuText :'设置',
            menu_autoPage: '自动下一页',
            menu_copyBtn :'复制图标',
            menu_toolBar: '功能图标',
            menu_avInfo:'弹窗中的演员和样品图',
            menu_halfImg:'竖图模式',
            menu_fullTitle:'标题全显',
            menu_columnNum:'列',
            menu_menutoTop:'左侧菜单移至上方',
            copyButton:'复制',
            copySuccess:'复制成功',
            getAvImg_norespond:'blogjav.net网站暂时无法响应',
            getAvImg_none:'未搜索到',
            tool_magnetTip:'磁力',
            tool_downloadTip:'下载封面',
            tool_pictureTip:'视频截图(blogjav.net)需代理',
            scrollerPlugin_end:'完'
        },
        en: {
            menuText :'Settings',
            menu_autoPage:'auto Next Page',
            menu_copyBtn:'copy icon',
            menu_toolBar:'tools icon',
            menu_avInfo:'actors and sample images in pop-ups',
            menu_halfImg:'Vertical image mode',
            menu_fullTitle:'Full Title',
            menu_columnNum:'columns',
            menu_menutoTop:'Move the left menu to the top',
            copyButton:'Copy',
            copySuccess:'Copy successful',
            getAvImg_norespond:'blogjav.net is temporarily unable to respond',
            getAvImg_none:'Not found',
            tool_magnetTip:'Magnet',
            tool_downloadTip:'Download cover',
            tool_pictureTip:'Video screenshot from blogjav.net',
            scrollerPlugin_end:'End'
        }
    }
    let getlanguage = () => {
        let local= navigator.language;
        local = local.toLowerCase().replace('_', '-');
        if (local in LOCALE){
            return LOCALE[local];
        }else if (local.split('-')[0] in LOCALE){
            return LOCALE[local.split('-')[0]];
        }else {
            return LOCALE.en;
        }
    }
    let lang = getlanguage();

    // 弹出提示框
    let showAlert = (msg) => {
        var $alert=$(`<div  class="alert-zdy" ></div>`);
        $('body').append($alert);
        $alert.text(msg);
        $alert.show({start:function(){
            $(this).css({'margin-top': -$(this).height() / 2 });
            $(this).css({'margin-left': -$(this).width() / 2 });
        }}).delay(3000).fadeOut();
    }

    let notice = () => {
        if(Status.get("notice")) return;
        let $notice=$(`<div  style="position:fixed;top:50%;left:50%; padding:20px;font-size:20px;color:white;background-color:rgb(0,0,0);border-radius:4px;animation:itemShow .3s;z-index:1051;" >
          <span></span><div style="display: inline-block;padding: 0 10px;cursor: pointer;">X</div> </div>`);
        $('body').append($notice);
        $notice.find("span").text("设置菜单已移至左上角！");
        $notice.find("div").on("click",()=>$notice.hide());
        $notice.show({start:function(){
            $(this).css({'margin-top': -$(this).height() / 2  ,'margin-left': -$(this).width() / 2 });
        }});
        Status.set("notice",true);
    }
    //图片加载时的回调函数
    let imgCallback =  (img)=> {
        if (Status.isHalfImg()) {
            if(img.height < img.width){
                img.style= halfImgCSS ;
            }else{
                img.style= fullImgCSS ;
            }
        }else{
            //大图模式下，对大于标准比例(以ipx的封面为准)的图片进行缩小
            if(img.height/img.width>=0.7){
                img.style= `width:${img.width*67.25/img.height}%;` ;
            }else{
                img.style= fullImgCSS ;
            }
        }
    }

    let Status = {
        halfImg_block:false,//是否屏蔽竖图模式，默认为否
        set : function(key,value){
            if(key=="columnNum") {
                key=key+(this.isHalfImg()?"Half":"Full");
            }else if(key=="waterfallWidth"){
                key=key+"_"+currentWeb;//宽度为各网站独立属性
            }
            return GM_setValue(key, value);
        },
        get : function(key){
            return GM_getValue(key=="waterfallWidth"?(key+"_"+currentWeb):key, statusDefault[key]);
        },
        //是否为竖图模式
        isHalfImg: function () {
            return this.get("halfImg") && (!this.halfImg_block);
        },
        //获取列数
        getColumnNum: function () {
            var key= 'columnNum'+(this.isHalfImg()?"Half":"Full");
            return this.get(key);
        }
    };
    //弹窗类，用于展示演员,样品图和磁力
    class Popover{
        show(){
            document.documentElement.classList.add("scrollBarHide");
            this.element.show({duration:0,start:function(){
                var t=$(this).find('#modal-div');
                t.css({'margin-top': Math.max(0, ($(window).height() - t.height()) / 2) });
            }});
        }
        hide(){
            document.documentElement.classList.remove("scrollBarHide");
            this.element.hide();
            this.element.find('.pop-up-tag').hide();
        }
        init(){
            var me=this;
            me.element = $('<div  id="myModal"><div  id="modal-div" > </div></div>');
            me.element.on('click',function(e){
                if($(e.target).closest("#modal-div").length==0){
                    me.hide();
                }
            });
            me.scrollBarWidth = me.getScrollBarWidth();
            GM_addStyle('.scrollBarHide{ padding-right: ' + me.scrollBarWidth + 'px;overflow:hidden;}');
            $('body').append(me.element);
            //加载javbus的图片浏览插件
            if(currentWeb=="javbus"){
                me.element.magnificPopup({
                    delegate: 'a.sample-box-zdy:visible',
                    type: 'image',
                    closeOnContentClick: false,
                    closeBtnInside: false,
                    mainClass: 'mfp-with-zoom mfp-img-mobile',
                    image: {verticalFit: true},
                    gallery: { enabled: true},
                    zoom: {enabled: true,duration: 300,opener: function (element) {return element.find('img');}}
                });
            }
        }
        append(elem){
            if(!this.element){ this.init();}
            this.element.find("#modal-div").append(elem);
            return this;
        }
        //获取滚动条的宽度
        getScrollBarWidth() {
            var el = document.createElement("p");
            var styles = {width: "100px",height: "100px",overflowY: "scroll" };
            for (var i in styles) {
                el.style[i] = styles[i];
            }
            document.body.appendChild(el);
            var scrollBarWidth = el.offsetWidth - el.clientWidth;
            el.remove();
            return scrollBarWidth;
        }
    }
    class SettingMenu {
        onChange = {
            autoPage: function() {
                if (scroller) {
                    scroller.destroy();
                    scroller = null;
                } else {
                    scroller = new ScrollerPlugin($('#waterfall-zdy'), lazyLoad);
                }
            },
            copyBtn: function() {
                $("#waterfall-zdy .copy-svg").toggle();
            },
            toolBar: function() {
                $("#waterfall-zdy .func-div").toggle();
            },
            halfImg: function() {
                let me = this;
                $("#waterfall-zdy .movie-box-b img.loaded").each(function(index, el) {
                    imgCallback(el);
                });
                var columnNum = Status.getColumnNum();
                GM_addStyle('#waterfall-zdy .item-b{ width: ' + 100 / columnNum + '%;}');
                $("#columnNum_range").val(columnNum);
                $("#columnNum_range+span").text(columnNum);
            },
            fullTitle: function() {
                $("#waterfall-zdy a[name='av-title']").toggleClass("titleNowrap");
            },
            avInfo: function() {},
            menutoTop : function() {location.reload();},
            columnNum: function(columnNum) {
                GM_addStyle('#waterfall-zdy .item-b{ width: ' + 100 / columnNum + '%;}');
            },
            waterfallWidth: function(width) {
                var widthSelctor = currentObj.widthSelector;
                $(widthSelctor).css("width", width + "%");
                $(widthSelctor).css("margin", "0 " + (width > 100 ? (100 - width) / 2 + "%" : "auto"));
            }
        }
        constructor() {
            let columnNum = Status.getColumnNum();
            let $menu = $('<div  id="menu-div" ></div>');
            $menu.append(this.creatCheckbox("autoPage", lang.menu_autoPage));
            $menu.append(this.creatCheckbox("copyBtn", lang.menu_copyBtn));
            $menu.append(this.creatCheckbox("toolBar", lang.menu_toolBar));
            $menu.append(this.creatCheckbox("halfImg", lang.menu_halfImg, Status.halfImg_block));
            $menu.append(this.creatCheckbox("fullTitle", lang.menu_fullTitle));
            if (["javbus", "javdb"].includes(currentWeb)) {
                $menu.append(this.creatCheckbox("avInfo", lang.menu_avInfo));
            }
            if (currentWeb == 'javlibrary') {
                $menu.append(this.creatCheckbox("menutoTop", lang.menu_menutoTop));
            }
            $menu.append(this.creatRange("columnNum", lang.menu_columnNum, columnNum, 8));
            $menu.append(this.creatRange("waterfallWidth", '%', Status.get("waterfallWidth") , currentObj.maxWidth ? currentObj.maxWidth : 100));
            let $circle = $(`<div style="position: ${currentWeb=="javlibrary"?"absolute":"fixed"};z-index: 1030;left:0;top:${currentWeb=="javlibrary"?"36px":"0px"};"><div style="width: 40px;height: 40px;background-color: rgb(208 176 176 / 90%);border-radius: 20px;"></div></div>`);
            $circle.append($menu);
            $circle.mouseenter(() => $menu.show()).mouseleave(() => $menu.hide());
            $("body").append($circle);
        }
        creatCheckbox(tagName, name, disabled) {
            let me =this;
            let $checkbox = $(`<div class="switch-div"><input ${disabled?'disabled="disabled"':''} type="checkbox" id="${tagName}_checkbox" /><label  for="${tagName}_checkbox" >${name}</label></div>`);
            $checkbox.find("input")[0].checked = Status.get(tagName);
            $checkbox.find("input").eq(0).click(function() {
                Status.set(tagName, this.checked);
                me.onChange[tagName]();
            });
            return $checkbox;
        }
        creatRange(tagName, name, value, max) {
            let me =this;
            let $range = $(`<div  class="range-div"><input type="range" id="${tagName}_range"  min="1" max="${max}" step="1" value="${value}"  /><span name="value">${value}</span><span>${name}</span></div>`);
            $range.bind('input propertychange', function() {
                var val = $(this).find("input").eq(0).val();
                $(this).find("span[name=value]").html(val);
                Status.set(tagName, val);
                me.onChange[tagName](val);
            });
            return $range;
        }
    }

    function showMagnetTable(itemID,avid,href,elem) {
        if ($(elem).hasClass("svg-loading")) {return;}
        let tagName = `${itemID}${AVINFO_SUFFIX}`;
        let $el=$(`.pop-up-tag[name='${tagName}']`);
        if ($el.length > 0) {
            $el.show();myModal.show();
        } else {
            $(elem).addClass("svg-loading");
            Promise.resolve().then(()=>{
                switch(currentWeb) {
                    case "javbus": {
                        return getMagnet4JavBus(href,tagName)
                    }
                    case "javdb": {
                        return getMagnet4JavDB(href,tagName,itemID)
                    }
                }
            }).then((dom)=>{
                myModal.append(dom).show();
            }).catch(err=>alert(err)).then(()=>$(elem).removeClass("svg-loading"));
        }
    }
    //获取javdb的演员磁力信息
    async function getMagnet4JavDB(href,tagName,itemID) {
        let doc = await fetch(href).then(response => response.text());
        let $doc=$($.parseHTML(doc));
        let info = $(`<div class="pop-up-tag" name="${tagName}"></div>`);
        if(Status.get("avInfo")){
            let actors= $doc.find("div.video-meta-panel .panel-block").toArray().find(el=> $(el).find("a[href^='/actors/']").length>0);
            $(actors).find("a").attr("target","_blank");
            let preview_images= $doc.find(".columns").toArray().find(el=> $(el).find("div.tile-images.preview-images").length>0);
            let $preview_images = $(preview_images);
            $preview_images.find(".preview-video-container").attr("href",`#preview-video-${itemID}`);
            $preview_images.find("#preview-video").attr("id",`preview-video-${itemID}`);
            $preview_images.find("img[data-src]").each((i,el)=> $(el).attr("src",$(el).attr("data-src")));
            info.append(actors);info.append(preview_images);
        }
        let magnetTable = $doc.find(`div[data-controller="review"]`);
        magnetTable.find("div.moj-content").remove();// 移除广告
        info.append(magnetTable);
        return info;
    };
    // javbus：获取演员磁力信息
    async function getMagnet4JavBus(href, tagName) {
        let {gid,dom} = await avInfofetch(href,tagName);
        //有码和欧美 0  无码 1
        let uc_code = location.pathname.search(/(uncensored|mod=uc)/) < 1 ? 0 : 1;
        let url = `${location.protocol}//${location.hostname}/ajax/uncledatoolsbyajax.php?gid=${gid}&lang=zh&img=&uc=${uc_code}&floor=` + Math.floor(Math.random() * 1e3 + 1);
        let doc = await fetch(url).then(response => response.text());
        let table_html = doc.substring(0, doc.indexOf('<script')).trim();
        let table_tag = $(`<table class="table pop-up-tag" name="${tagName}" style="background-color:#FFFFFF;" ></table>`);
        table_tag.append($(table_html));
        table_tag.find("tr").each(function (i) { // 遍历 tr
            let $a = $(this).find('a');
            if ($a.length) {
               let magent_url = $a[0].href;
               $(this).prepend(creatCopybutton(magent_url));
            }
        });
        dom.push(table_tag);
        return dom;
    };
    //javbus：磁力链接添加复制按钮
    function creatCopybutton(text) {
        let $copyButton = $(`<td><button class="center-block">${lang.copyButton}</button></td>`);
        $copyButton.find("button").click(function () {
            GM_setClipboard(text);
            showAlert(lang.copySuccess);
        });
        return $copyButton;
    }
    //javbus：获取详情页面的 演员表和样品图元素
    async function avInfofetch(href,tagName) {
        let doc = await fetch(href).then(response => response.text())
        let str = /var\s+gid\s+=\s+(\d{1,})/.exec(doc);
        let avInfo = {gid:str[1],dom:[]};
        if(Status.get("avInfo")){
            let sample_waterfall = $($.parseHTML(doc)).find("#sample-waterfall");
            let avatar_waterfall = $($.parseHTML(doc)).find("#avatar-waterfall");
            if(avatar_waterfall.length>0){
                avatar_waterfall[0].id = "";
                avatar_waterfall.addClass("pop-up-tag");
                avatar_waterfall.attr("name",tagName);
                avatar_waterfall.find("a.avatar-box span").each((i,el)=> {
                    let $copySvg = $(`<div style="width:24px;height:24px;display: flex;align-items: center;justify-content: center;">${copy_Svg}</div>`);
                    $copySvg.click(function () {
                        GM_setClipboard($(el).text());
                        showAlert(lang.copySuccess);
                        return false;
                    });
                    $(el).prepend($copySvg);
                });
                avatar_waterfall.find("a.avatar-box").attr("target","_blank").removeClass("avatar-box").addClass("avatar-box-zdy");
                avInfo.dom.push(avatar_waterfall);
            }
            if(sample_waterfall.length>0){
                sample_waterfall[0].id = "";
                sample_waterfall.addClass("pop-up-tag");
                sample_waterfall.attr("name",tagName);
                sample_waterfall.find(".sample-box").removeClass("sample-box").addClass("sample-box-zdy");
                avInfo.dom.push(sample_waterfall);
            }
        }
        return avInfo;
    };

    //弹出视频截图
    function showBigImg(itemID,avid,elem) {
        if ($(elem).hasClass("svg-loading")) {return;}
        let tagName = `${itemID}${SCREENSHOT_SUFFIX}`;
        let $selector = $(`.pop-up-tag[name='${tagName}']`);
        if ($selector.length > 0) {
            $selector.show();
            myModal.show();
        } else {
            $(elem).addClass("svg-loading");
            getAvImg(avid,tagName).then(($img)=>{
                myModal.append($img).show();
            }).catch(err=>showAlert(err)).then(()=>{
                $(elem).removeClass("svg-loading");
            });
        }
    }
    const getRequest = (url) => {
        return new Promise((resolve, reject)=>{
            GM_xmlhttpRequest({
                method: "GET",
                url: url,
                timeout: 20000,
                onload: (r)=>{ 
                    r.status==200?resolve(r.responseText):reject(lang.getAvImg_norespond);
                },
                onerror : (r)=> reject(`error`),
                ontimeout : (r)=> reject(`timeout`)
            });
        })
    }
    /**根据番号获取blogjav的视频截图，使用fetch会产生跨域问题*/
    async function getAvImg(avid,tagName) {
        const doc = await getRequest(`https://blogjav.net/?s=${avid}`);
        let resultList = $($.parseHTML(doc)).find(blogjavSelector).toArray().map((v)=> {return {title:v.innerHTML,href:v.href} });
        if (resultList.length==0) {
           return Promise.reject(lang.getAvImg_none);
        }
        let $img = new ScreenshotPanel(tagName,resultList);
        let findIndex = resultList.findIndex(v=> v.title.search(/FHD/i)>0);//默认显示FHD
        let index_show = findIndex>-1?findIndex:0;
        $img.find(`li.imgResult-li[index=${index_show}]`).trigger('click');
        return $img;
    };
    class ScreenshotPanel{
        constructor(tagName,resultList){
            let me =this;
            let $img = $(`<div name="${tagName}" class="pop-up-tag" style="min-height:${$(window).height()}px;">
                        <ul style="${resultList.length==1?'display:none':''}">
                        ${resultList.map((v,i)=>`<li class="imgResult-li" index=${i} data="${v.href}">${v.title}</li>`).join('')}</ul>
                        <span class="download-icon" >${download_Svg}</span>
                        ${resultList.map((v,i)=>`<img index=${i}  name="screenshot" style="display:none;width:100%" />`).join('')}
                        </div>`);
            $img.find("li.imgResult-li").click(function(){
                if ($(this).hasClass("imgResult-loading")) {return;}
                let index_to = $(this).attr('index');
                let index_from =  $img.find("img:visible").attr(`index`);
                if( index_to != index_from){
                    $img.find("li.imgResult-li.imgResult-Current").removeClass('imgResult-Current');
                    $(this).addClass(`imgResult-loading`).addClass("imgResult-Current");
                    $img.find("img").hide();
                    let $img_to = $img.find(`img[index=${index_to}]`);
                    $img_to.show();
                    Promise.resolve().then(()=>{
                        if($img_to.attr(`src`)){
                            return true;
                        }else{
                            return me.getScreenshotUrl($(this).attr('data')).then((r)=>{
                                $img_to.attr(`src`,r);
                            });
                        }
                    }).catch((err)=>{showAlert(err)}).then((r)=>{$(this).removeClass(`imgResult-loading`);});
                }
            })
            $img.find("span.download-icon").click(function(){
                GM_download($img.find("img:visible").attr(`src`), `${avid}.jpg`);
            });
            return $img;
        }
        async getScreenshotUrl(imgUrl){
            const result = await getRequest(imgUrl);
            let img_src = /<img .*data-lazy-src="https:\/\/.*pixhost.to\/thumbs\/.*>/.exec(result);
            let src = $(img_src[0]).attr("data-lazy-src").replace('thumbs', 'images').replace('//t', '//img').replace('"', '');
            console.log(src);
            return src;
        }
    }

    let lazyLoad;
    let scroller;
    let myModal;//弹窗插件实例
    let currentWeb = "javbus";//网站域名标识，用于判断当前在什么网站
    let currentObj ;//当前网站对应的属性对象
    /**
     * 通用属性对象
     * domainReg：         域名正则式 用于判断当前在什么网站
     * excludePages：      排除的页面
     * halfImg_block_Pages 屏蔽竖图的页面
     * gridSelector        源网页的网格选择器
     * itemSelector        源网页的子元素选择器
     * widthSelector       源网页的宽度设置元素选择器
     * pageNext            源网页的下一页元素选择器
     * pageSelector        源网页的翻页元素选择器
     * getAvItem           解析源网页item的数据
     * init_Style          加载各网页的特殊css
     */
    let ConstCode = {
        javbus: {
            domainReg: /(javbus|busjav|busfan|fanbus|buscdn|cdnbus|dmmsee|seedmm|busdmm|dmmbus|javsee|seejav)\./i,
            excludePages: ['/actresses', 'mdl=favor&sort=1', 'mdl=favor&sort=2', 'mdl=favor&sort=3', 'mdl=favor&sort=4', 'searchstar'],
            halfImg_block_Pages:['/uncensored','javbus.one','mod=uc','javbus.red'],
            gridSelector: 'div#waterfall',
            itemSelector: 'div#waterfall div.item',
            widthSelector : '#waterfall-zdy',
            pageNext:'a#next',
            pageSelector:'.pagination',
            getAvItem: function (elem) {
                var photoDiv = elem.find("div.photo-frame")[0];
                var href = elem.find("a")[0].href;
                var img = $(photoDiv).children("img")[0];
                var src = img.src;
                if (src.match(/pics.dmm.co.jp/)) {
                    src = src.replace(/ps.jpg/, "pl.jpg");
                } else {
                    src = src.replace(/thumbs/, "cover").replace(/thumb/, "cover").replace(/.jpg/, "_b.jpg");
                }
                var title = img.title;
                var AVID = elem.find("date").eq(0).text();
                var date = elem.find("date").eq(1).text();
                var itemTag = "";elem.find("div.photo-info .btn").toArray().forEach( x=> itemTag+=x.outerHTML);
                return {AVID: AVID,href: href,src: src,title: title,date: date,itemTag:itemTag};
            }
        },
        javdb: {
            domainReg: /(javdb)[0-9]*\./i,
            excludePages: ['/users/'],
            halfImg_block_Pages:['/uncensored','/western','/video_uncensored','/video_western'],
            gridSelector: 'div#videos>.grid',
            itemSelector: 'div#videos>.grid div.grid-item',
            widthSelector : '#waterfall-zdy',
            pageNext: 'a.pagination-next',
            pageSelector:'.pagination-list',
            init_Style: function(){
                var local_color=$(".box").css("background-color");
                let css = `.pop-up-tag[name$='${AVINFO_SUFFIX}'] {background-color: rgb(255 255 255 / 90%);}`;
                //判断是否为暗色主题
                if(local_color=="rgb(18, 18, 18)"){
                    css=`.scroll-request span{background:white;}#waterfall-zdy .movie-box-b a:link {color : inherit;}#waterfall-zdy  .movie-box-b{background-color:${local_color};}.alert-zdy {color: black;background-color: white;}`;
                }
                GM_addStyle(`${css} #myModal #modal-div article.message {margin-bottom: 0}`);
            },
            maxWidth: 150,//javdb允许的最大宽度为150%，其他网站默认最大宽度为100%
            getAvItem: function (elem) {
                var href = elem.find("a")[0].href;
                var img = elem.find("div.item-image>img").eq(0);
                var src = img.attr("data-src").replace(/thumbs/, "covers") ;
                var title = elem.find("div.video-title").eq(0).text();
                if(!title) {title = elem.find("div.video-title2").eq(0).text()};
                var AVID = elem.find("div.uid").eq(0).text();
                if(!AVID) {AVID = elem.find("div.uid2").eq(0).text()};
                var date = elem.find("div.meta").eq(0).text();
                var itemTag = elem.find(".tags.has-addons").html();
                return {AVID: AVID,href: href,src: src,title: title,date: date,itemTag:itemTag};
            }
            //init: function(){ if(location.href.includes("/users/")){ this.widthSelector="div.section";} }
        },
        avmoo: {
            domainReg: /avmoo\./i,
            excludePages: ['/actresses'],
            gridSelector: 'div#waterfall',
            itemSelector: 'div#waterfall div.item',
            widthSelector : '#waterfall-zdy',
            pageNext: 'a[name="nextpage"]',
            pageSelector:'.pagination',
            getAvItem: function (elem) {
                var photoDiv = elem.find("div.photo-frame")[0];
                var href = elem.find("a")[0].href;
                var img = $(photoDiv).children("img")[0];
                var src = img.src.replace(/ps.jpg/, "pl.jpg");
                var title = img.title;
                var AVID = elem.find("date").eq(0).text();
                var date = elem.find("date").eq(1).text();
                var itemTag = "";elem.find("div.photo-info .btn").toArray().forEach( x=> itemTag+=x.outerHTML);
                return {AVID: AVID,href: href,src: src,title: title,date: date,itemTag:itemTag};
            }
        },
        javlibrary: {
            domainReg: /javlibrary\./i,
            gridSelector: 'div.videothumblist',
            itemSelector: 'div.videos div.video',
            widthSelector : '#waterfall-zdy',
            pageNext: 'a.page.next',
            pageSelector:'.page_selector',
            getAvItem: function (elem) {
                var href = elem.find("a")[0].href;
                var src = elem.find("img")[0].src;
                if(src.indexOf("pixhost")<0){//排除含有pixhost的src，暂时未发现规律
                    src= src.replace(/ps.jpg/, "pl.jpg");
                }
                var title = elem.find("div.title").eq(0).text();
                var AVID = elem.find("div.id").eq(0).text();
                return {AVID: AVID,href: href,src: src,title: title,date: '',itemTag:''};
            },
            init_Style: function(){
                GM_addStyle(`${Status.get("menutoTop")?`#leftmenu {width : 100%;float: none;}#leftmenu>table { display : none;}#leftmenu .menul1,#leftmenu .menul1>ul{display: flex;align-items: center;justify-content: center;flex-wrap: wrap;}#leftmenu .menul1{padding: 5px;}#rightcolumn{margin: 0 5px;padding : 10px 5px;}`:``}#waterfall-zdy div{box-sizing: border-box;}`);
            },
        }
    };

    /** 用于屏蔽老司机脚本的代码*/
    function oldDriverBlock(){
        if(['javbus','avmoo'].includes(currentWeb)){ //屏蔽老司机脚本,改写id
            if ($('.masonry').length > 0) {
                $('.masonry').removeClass("masonry");
            }
            let $waterfall = $('#waterfall');
            if($waterfall.length){
                $waterfall.get(0).id = "waterfall-destroy";
            }
            if($waterfall.find("#waterfall").length){ //javbus首页有2个'waterfall' ID
                $waterfall.find("#waterfall").get(0).id = "";
            }
            //解决 JAV老司机 $pages[0].parentElement.parentElement.id = "waterfall_h";
            //女优作品界面此代码会把id设置到class=row层
            if ($('#waterfall_h.row').length > 0) {
                $('#waterfall_h.row').removeAttr("id");
            }
            let $waterfall_h= $('#waterfall_h');
            if ($waterfall_h.length) {
                $waterfall_h.get(0).id = "waterfall-destroy";
            }
            if(location.pathname.search(/search/) > 0){//解决"改写id后，搜索页面自动跳转到无码页面"的bug
                $('body').append('<div id="waterfall"></div>');
            }
            currentObj.gridSelector = "#waterfall-destroy";
        }
        if(['javlibrary'].includes(currentWeb)){ //屏蔽老司机脚本,改写id
            let $waterfall = $('div.videothumblist');
            if($waterfall.length){
                $waterfall.removeClass("videothumblist");
                $waterfall.find(".videos").removeClass("videos");
                $waterfall.get(0).id = "waterfall-destroy";
            }
            currentObj.gridSelector = "#waterfall-destroy";
        }
    }
    class Page{
         constructor(){
            for (let key in ConstCode) {
                let domainReg = ConstCode[key].domainReg;
                if (domainReg && domainReg.test(location.href)) {
                    currentWeb = key;//首先判断当前是什么网站
                    break;
                }
            }
            currentObj = ConstCode[currentWeb];
            //排除页面的判断
            if (currentObj.excludePages) {
                for (let page of currentObj.excludePages) {
                    if (location.pathname.includes(page)) return;
                }
            }
            //调用初始化方法 未使用  if (currentObj.init) { currentObj.init();}
            //屏蔽竖图模式的页面判断
            if (currentObj.halfImg_block_Pages) {
                for (let blockPage of currentObj.halfImg_block_Pages) {
                    if (location.href.includes(blockPage)) {
                        Status.halfImg_block = true;
                        break;
                    };
                }
            }
            this.render();
         }
         render(){
            let $items = $(currentObj.itemSelector);
            if ($items.length<1) return;
            oldDriverBlock();
            this.addStyle();
            currentObj.init_Style?.();
            let menu = new SettingMenu();
            //加载图片懒加载插件
            lazyLoad = new LazyLoad({
                callback_loaded: function (img) {
                    $(img).removeClass("minHeight-200");
                    imgCallback(img);
                }
            });
            let gridPanel = new GridPanel($items,lazyLoad);
            myModal = new Popover();//弹出插件
            //加载滚动翻页插件
            if(Status.get("autoPage") && $(currentObj.pageSelector).length ){
                scroller=new ScrollerPlugin(gridPanel.$dom,lazyLoad);
            }
         }
         addStyle() {
            let columnNum = Status.getColumnNum();
            let waterfallWidth=Status.get("waterfallWidth");
            let css_waterfall = `
                ${currentObj.widthSelector}{
                    width:${waterfallWidth}%;
                    margin:0 ${waterfallWidth>100?(100-waterfallWidth)/2+'%':'auto'};
                    transition:.5s ;
                }
                #waterfall-zdy{display:flex;flex-direction:row;flex-wrap:wrap;}
                #waterfall-zdy .item-b{padding:5px;width:${100 / columnNum}%;transition:.5s ;animation: fadeInUp .5s ease-out;}
                #waterfall-zdy .movie-box-b{border-radius:5px;background-color:white;border:1px solid rgba(0,0,0,0.2);box-shadow:0 2px 3px 0 rgba(0,0,0,0.1);overflow:hidden}#waterfall-zdy .movie-box-b a:link{color:black}#waterfall-zdy .movie-box-b a:visited{color:gray}#waterfall-zdy .movie-box-b .photo-frame-b{text-align:center}#waterfall-zdy .movie-box-b .photo-info-b{padding:7px}#waterfall-zdy .movie-box-b .photo-info-b a{display:block}#waterfall-zdy .info-bottom,.info-bottom-two{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap}#waterfall-zdy .avatar-box-b{display:flex;flex-direction:column;background-color:white;border-radius:5px;align-items:center;border:1px solid rgba(0,0,0,0.2)}#waterfall-zdy .avatar-box-b p{margin:0 !important}#waterfall-zdy date:first-of-type{font-size:18px !important}#waterfall-zdy .func-div{float:right;padding:2px;white-space:nowrap}#waterfall-zdy .func-div span{margin-right:2px}#waterfall-zdy .copy-svg{vertical-align:middle;display:inline-block}#waterfall-zdy span.svg-span{cursor:pointer;opacity:.3}#waterfall-zdy span.svg-span:hover{opacity:1}#waterfall-zdy .item-tag{display:inline-block;white-space:nowrap}#waterfall-zdy .jlt-hidden{display:none;}#waterfall-zdy .minHeight-200{min-height:200px}
                #myModal{overflow-x:hidden;overflow-y:auto;display:none;position:fixed;top:0;left:0;right:0;bottom:0;z-index:1050;background-color:rgba(0,0,0,0.5)}#myModal #modal-div{position:relative;width:80%;margin:0 auto;background-color:rgb(6 6 6 / 50%);border-radius:8px;animation:fadeInDown .5s}#modal-div .pop-up-tag{border-radius:8px;overflow:hidden}#modal-div .sample-box-zdy,.avatar-box-zdy{display:inline-block;border-radius:8px;background-color:#fff;overflow:hidden;margin:5px;width:140px}#modal-div .sample-box-zdy .photo-frame{overflow:hidden;margin:10px}#modal-div .sample-box-zdy img{height:90px}#modal-div .avatar-box-zdy .photo-frame{overflow:hidden;height:120px;margin:10px}#modal-div .avatar-box-zdy img{height:120px}#modal-div .avatar-box-zdy span{font-weight:bold;text-align:center;word-wrap:break-word;display:flex;justify-content:center;align-items:center;padding:5px;line-height:22px;color:#333;background-color:#fafafa;border-top:1px solid #f2f2f2}svg.tool-svg{fill:currentColor;width:22px;height:22px;vertical-align:middle}span.svg-loading{display:inline-block;animation:svg-loading 2s infinite}#menu-div{white-space:nowrap;background-color:white;color:black;display:none;min-width:200px;border-radius:5px;padding:10px;box-shadow:0 10px 20px 0 rgb(0 0 0 / 50%)}#menu-div>div:hover{background-color:gainsboro}#menu-div .switch-div{display:flex;align-items:center;font-size:large;font-weight:bold;}#menu-div .switch-div *{margin:0;padding:4px;}#menu-div .switch-div label{flex-grow:1;}#menu-div .range-div{display:flex;flex-direction:row;flex-wrap:nowrap}#menu-div .range-div input{cursor:pointer;width:80%;max-width:200px}.alert-zdy{position:fixed;top:50%;left:50%;padding:12px 20px;font-size:20px;color:white;background-color:rgb(0,0,0,.75);border-radius:4px;animation:itemShow .3s;z-index:1051}
                .titleNowrap{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.download-icon{position:absolute;right:0;z-index:2;cursor:pointer}.download-icon>svg{width:30px;height:30px;fill:aliceblue}@keyframes fadeInUp{0%{transform:translate3d(0,10%,0);opacity:.5}100%{transform:none;opacity:1}}@keyframes fadeInDown{0%{transform:translate3d(0,-100%,0);opacity:0}100%{transform:none;opacity:1}}@keyframes itemShow{0%{transform:scale(0)}100%{transform:scale(1)}}@keyframes svg-loading{0%{transform:scale(1);opacity:1}50%{transform:scale(1.2);opacity:1}100%{transform:scale(1);opacity:1}}.scroll-request{text-align:center;height:15px;margin:15px auto}.scroll-request span{display:inline-block;width:15px;height:100%;margin-right:8px;border-radius:50%;background:rgb(16,19,16);animation:load 1s ease infinite}@keyframes load{0%,100%{transform:scale(1)}50%{transform:scale(0)}}.scroll-request span:nth-child(2){animation-delay:0.125s}.scroll-request span:nth-child(3){animation-delay:0.25s}.scroll-request span:nth-child(4){animation-delay:0.375s}.imgResult-li{color:rgb(255,255,255,50%);font-size:20px;}.imgResult-li.imgResult-Current{color: white;}.imgResult-loading{animation: changeTextColor 1s  ease-in  infinite ;}.imgResult-li:hover{cursor: pointer;color: white;}@keyframes changeTextColor {0%{ color:rgba(255,255,255,1)} 50%{ color:rgba(255,255,255, .5)}  100%{ color:rgba(255,255,255, 1)}  }`;
            GM_addStyle(css_waterfall);
        }
    }
    class GridPanel{
        constructor($items,lazyLoad){
            this.$dom=$(`<div id= 'waterfall-zdy'></div>`);
            $(currentObj.gridSelector).hide();//隐藏源页面列表
            $(currentObj.gridSelector).eq(0).before(this.$dom);
            let $elems = this.constructor.parseItems($items);
            this.$dom.append($elems);
            lazyLoad.update();
        }
        static parseItems(elems){
            let elemsHtml = "";
            let imgStyle = Status.isHalfImg() ? halfImgCSS : fullImgCSS;
            let parseFunc = currentObj.getAvItem;
            let [toolBar,copyBtn,fullTitle,magnet] =[Status.get("toolBar"),Status.get("copyBtn"),Status.get("fullTitle"),['javbus','javdb'].includes(currentWeb)];
            for (let i = 0; i < elems.length; i++) {
                let tag = elems.eq(i);
                let html = "";
                //判断是否为 女优个人资料item
                if (currentWeb!="javdb" && tag.find(".avatar-box").length) {
                    tag.find(".avatar-box").addClass("avatar-box-b").removeClass("avatar-box");
                    html = `<div class='item-b'>${tag.html()}</div>`;
                }else{
                    let AvItem = parseFunc(tag);
                    html = `<div class="item-b">
                                <div class="movie-box-b">
                                <div class="photo-frame-b">
                                    <a  href="${AvItem.href}" target="_blank"><img style="${imgStyle}" class="lazy minHeight-200"  data-src="${AvItem.src}" ></a>
                                </div>
                                <div class="photo-info-b">
                                    <a name="av-title" href="${AvItem.href}" target="_blank" title="${AvItem.title}" class="${fullTitle?'':'titleNowrap'}"><span class="svg-span copy-svg ${copyBtn?'':'jlt-hidden'}" name="copy">${copy_Svg}</span> <span>${AvItem.title}</span></a>
                                    <div class="info-bottom">
                                      <div class="info-bottom-one">
                                          <a  href="${AvItem.href}" target="_blank"><span class="svg-span copy-svg ${copyBtn?'':'jlt-hidden'}"  name="copy">${copy_Svg}</span><date name="avid">${AvItem.AVID}</date>${AvItem.date?` / ${AvItem.date}`:""}</a>
                                      </div>
                                      <div class="info-bottom-two">
                                        <div class="item-tag">${AvItem.itemTag}</div>
                                        <div class="func-div ${toolBar?'':'jlt-hidden'}" item-id="${AvItem.AVID}${Math.random().toString(16).slice(2)}"  >
                                        <span name="magnet" class="svg-span  ${magnet?'':'jlt-hidden'}" title="${lang.tool_magnetTip}" AVID="${AvItem.AVID}" data-href="${AvItem.href}">${magnet_Svg}</span>
                                        <span name="download" class="svg-span" title="${lang.tool_downloadTip}" src="${AvItem.src}" src-title="${AvItem.AVID} ${AvItem.title}">${download_Svg}</span>
                                        <span name="picture" class="svg-span" title="${lang.tool_pictureTip}" AVID="${AvItem.AVID}" >${picture_Svg}</span>
                                       </div>
                                     </div>
                                   </div>
                                </div>
                                </div>
                            </div>`;
                }
                elemsHtml = elemsHtml + html;
            }
            let $elems = $(elemsHtml);
            $elems.find("span[name]").click(function () {
                let name = $(this).attr("name");
                switch (name) {
                    case "copy":GM_setClipboard($(this).next().text());showAlert(lang.copySuccess);return false;
                    case "download":GM_download($(this).attr("src"), $(this).attr("src-title")+".jpg");break;
                    case "magnet":showMagnetTable($(this).parent("div").attr("item-id"),$(this).attr("AVID").replace(/\./g, '-'),$(this).attr("data-href"),this);break;
                    case "picture":showBigImg($(this).parent("div").attr("item-id"),$(this).attr("AVID"),this);break;
                    default:break;
                }
            });
            return $elems;
        }
    }
    class ScrollerPlugin{
        constructor(waterfall,lazyLoad){
            let me=this;
            me.waterfall=waterfall;
            me.lazyLoad=lazyLoad;
            let $pageNext=$(currentObj.pageNext);
            me.nextURL = $pageNext.attr('href');
            me.scroller_status=$(`<div class = "scroller-status"  style="text-align:center;display:none"><div class="scroll-request"><span></span><span></span><span></span><span></span></div><h2 class="scroll-last">${lang.scrollerPlugin_end}</h2></div>`);
            me.waterfall.after(me.scroller_status);
            me.locked=false;
            me.canLoad=true;
            me.$page=$(currentObj.pageSelector);
            me.domWatch_func=me.domWatch.bind(me);
            document.addEventListener('scroll',me.domWatch_func);
            if (history.scrollRestoration) {
               history.scrollRestoration = 'manual';//防止自动恢复页面位置
            }
        }
        domWatch (){
            let me = this;
            if (me.$page.get(0).getBoundingClientRect().top - $(window).height() < 300 && (!me.locked) && (me.canLoad)) {
                me.locked=true;
                me.loadNextPage(me.nextURL).then(()=>{me.locked=false});
            }
        }
        async loadNextPage(url){
            this.showStatus('request');
            console.log(url);
            let respondText = await fetch(url, { credentials: 'same-origin' }).then(respond=>respond.text());
            let $body = $(new DOMParser().parseFromString(respondText, 'text/html'));
            let elems = GridPanel.parseItems($body.find(currentObj.itemSelector));
            if (currentWeb != "javdb" && location.pathname.includes('/star/') && elems) {
                elems=elems.slice(1);
            }
            this.scroller_status.hide();
            this.waterfall.append(elems);
            this.lazyLoad.update();
            //history.pushState({}, "", url);
            this.nextURL = $body.find(currentObj.pageNext).attr('href');
            if(!this.nextURL){
                this.canLoad=false;
                this.showStatus("last");
            }
        }
        showStatus(status){
            this.scroller_status.children().each( (i,e)=>{$(e).hide()});
            this.scroller_status.find(`.scroll-${status}`).show();
            this.scroller_status.show();
        }
        destroy (){
            this.scroller_status.remove();
            document.removeEventListener('scroll',this.domWatch_func);
        }
    }
    new Page();
})();