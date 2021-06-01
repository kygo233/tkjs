// ==UserScript==
// @name         JAVBUS larger thumbnails
// @name:zh-CN   JAVBUS封面大图
// @namespace    https://github.com/kygo233/tkjs
// @version      20210601
// @author       kygo233
// @description          replace thumbnails of javbus,javdb,javlibrary and avmoo with source images
// @description:zh-CN    javbus,javdb,javlibrary,avmoo替换封面为源图

// @include      *javbus.com/*
// @include      *javdb.com/*
// @include      *avmoo.cyou/*
// @include      *javlibrary.com/*
// @include      /^.*(javbus|busfan|fanbus|buscdn|cdnbus|dmmsee|seedmm|busdmm|busjav)\..*$/
// @include      /^.*(javdb)[0-9]?\..*$/
// @include      /^.*(avmoo)\..*$/

// @require      https://cdn.jsdelivr.net/npm/vanilla-lazyload@17.3.0/dist/lazyload.min.js

// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_download
// @grant        GM_setClipboard
// @connect *

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
        columnNumHalf:4
    };
    const IMG_SUFFIX = "-screenshot-tag";
    const AVINFO_SUFFIX = "-avInfo-tag";
    const blogjavSelector= "#content h2.entry-title>a";
    const fullImgCSS=`width: 100%!important;height:100%!important;`;
    const halfImgCSS=`position: relative;left: -112%;width: 212% !important;height: 100% !important;max-width: 212%;`;

    const copy_Svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"  width="16" height="16" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/></svg>`;
    const download_Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="tool-svg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/></svg>`;
    const picture_Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  class="tool-svg" viewBox="0 0 16 16"><path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/></svg>`;
    const magnet_Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  class="tool-svg" x="0px" y="0px" viewBox="0 0 1000 1000" ><g><g transform="translate(0.000000,460.000000) scale(0.100000,-0.100000)"><path d="M4171.6,3994c-183.9-13.4-515.3-67.1-706.9-113c-770.2-187.7-1448.4-563.3-2021.2-1118.8c-707-685.9-1130.3-1494.4-1299-2481c-59.4-358.3-59.4-1002,0-1360.2c157.1-923.4,546-1705.1,1172.5-2354.6c695.4-722.3,1534.6-1159.1,2548.1-1325.7c174.4-28.7,388.9-34.5,1643.8-40.2l1440.7-7.7v1302.8v1302.8l-1354.5,7.6c-1207,5.7-1369.8,9.6-1480.9,40.2c-448.3,116.9-785.5,335.3-1036.5,666.7c-252.9,339.1-364,666.7-364,1088.2s111.1,749.1,364,1088.2c241.4,318,595.8,551.8,1000.1,659.1c157.1,40.2,191.6,42.1,1517.3,47.9l1354.5,7.7v1302.8v1300.9l-1344.9-3.8C4863.3,4001.6,4219.5,3997.8,4171.6,3994z"/><path d="M7620.1,2704.6V1401.8h1139.9H9900v1302.8v1302.8H8760.1H7620.1V2704.6z"/><path d="M7620.1-3502.7v-1302.8h1139.9H9900v1302.8v1302.8H8760.1H7620.1V-3502.7z"/></g></g></svg>`;

    const LOCALE = {
        zh: {
            menuText :'设置',
            menu_autoPage: '鼠标滚轮翻页',
            menu_copyBtn :'复制图标',
            menu_toolBar: '功能图标',
            menu_avInfo:'弹窗中的演员和样品图',
            menu_halfImg:'竖图模式',
            menu_fullTitle:'标题全显',
            menu_columnNum:'列',
            copyButton:'复制',
            copySuccess:'复制成功',
            getAvImg_norespond:'blogjav.net网站暂时无法响应',
            getAvImg_none:'未搜索到',
            tool_magnetTip:'磁力',
            tool_downloadTip:'下载封面',
            tool_pictureTip:'视频截图(blogjav.net)',
            scrollerPlugin_end:'完'
        },
        en: {
            menuText :'Settings',
            menu_autoPage:'turn pages by mouse wheel',
            menu_copyBtn:'copy icon',
            menu_toolBar:'tools icon',
            menu_avInfo:'actors and sample images in pop-ups',
            menu_halfImg:'Vertical image mode',
            menu_fullTitle:'Full Title',
            menu_columnNum:'columns',
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

    function showAlert(msg){
        var $alert=$(`<div  class="alert-zdy" ></div>`);
        $('body').append($alert);
        $alert.text(msg);
        $alert.show({start:function(){
            $(this).css({'margin-top': -$(this).height() / 2 });
            $(this).css({'margin-left': -$(this).width() / 2 });
        }}).delay(3000).fadeOut();
    }

    let tool_Func = {
        autoPage: function () {
            if(scroller){
                scroller.destroy();
                scroller=null;
            }else{
                scroller= new ScrollerPlugin($('#waterfall-zdy'),lazyLoad);
            }
        },
        copyBtn: function () {
            $("#waterfall-zdy .copy-svg").toggle();
        },
        toolBar: function () {
            $("#waterfall-zdy .func-div").toggle();
        },
        halfImg:function () {
            let me = this;
            $("#waterfall-zdy .movie-box-b img.loaded").each(function (index,el) {
                me.imgCallback(el);
            });
            var columnNum = Status.getColumnNum();
            GM_addStyle('#waterfall-zdy .item-b{ width: ' + 100 / columnNum + '%;}');
            $("#columnNum_range").val(columnNum);
            $("#columnNum_range+span").text(columnNum);
        },
        fullTitle : function(){
            $("#waterfall-zdy a[name='av-title']").toggleClass("titleNowrap");
        },
        avInfo: function () { },
        columnNum: function (columnNum) {
            GM_addStyle('#waterfall-zdy .item-b{ width: ' + 100 / columnNum + '%;}');
        },
        waterfallWidth: function (width) {
            var widthSelctor=currentObj.widthSelector;
            $(widthSelctor).css("width", width + "%");
            $(widthSelctor).css("margin", "0 " + (width>100?(100-width)/2+"%":"auto"));
        },
        imgCallback:function (img) {
            if (Status.isHalfImg()) {
                if(img.height < img.width){
                    img.style= halfImgCSS ;
                }else{
                    img.style= fullImgCSS ;
                }
            }else{
                if(img.height/img.width>=0.7){
                    img.style= `width:${img.width*67.25/img.height}%;` ;
                }else{
                    img.style= fullImgCSS ;
                }
            }
        }
    };

    let Status = {
        halfImg_block:false,
        set : function(key,value){
            if(key=="columnNum") {
                key=key+(this.isHalfImg()?"Half":"Full");
            }else if(key=="waterfallWidth"){
                key=key+"_"+currentWeb;
            }
            return GM_setValue(key, value);
        },
        get : function(key){
            return GM_getValue(key=="waterfallWidth"?(key+"_"+currentWeb):key, statusDefault[key]);
        },
        isHalfImg: function () {
            return this.get("halfImg") && (!this.halfImg_block);
        },
        getColumnNum: function () {
            var key= 'columnNum'+(this.isHalfImg()?"Half":"Full");
            return this.get(key);
        }
    };

    class Popover{
        show(el){
            if(el) {$(el).removeClass("svg-loading")};
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
            if(currentWeb=="javbus"){
                me.element.magnificPopup({
                    delegate: 'a.sample-box-zdy:visible',
                    type: 'image',
                    closeOnContentClick: false,
                    closeBtnInside: false,
                    mainClass: 'mfp-with-zoom mfp-img-mobile',
                    image: {
                        verticalFit: true
                    },
                    gallery: {
                        enabled: true
                    },
                    zoom: {
                        enabled: true,
                        duration: 300,
                        opener: function (element) {
                            return element.find('img');
                        }
                    }
                });
            }
        }
        append(elem){
            if(!this.element){ this.init();}
            this.element.find("#modal-div").append(elem);
        }
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

    function addMenu() {
        var columnNum = Status.getColumnNum();
        var $menu = $('<div  id="menu-div" ></div>');
        $menu.append(creatCheckbox("autoPage", lang.menu_autoPage));
        $menu.append(creatCheckbox("copyBtn", lang.menu_copyBtn));
        $menu.append(creatCheckbox("toolBar", lang.menu_toolBar));
        $menu.append(creatCheckbox("halfImg", lang.menu_halfImg,Status.halfImg_block));
        if (currentWeb == 'javbus') {
            $menu.append(creatCheckbox("avInfo", lang.menu_avInfo));
        }
        $menu.append(creatCheckbox("fullTitle", lang.menu_fullTitle));
        $menu.append(creatRange("columnNum", lang.menu_columnNum, columnNum, 8));
        $menu.append(creatRange("waterfallWidth", '%', waterfallWidth, currentObj.maxWidth?currentObj.maxWidth:100));
        var $spanner = $(currentObj.menu.html);
        $spanner.append($menu);
        $spanner.mouseenter(()=>$menu.show()).mouseleave(()=>$menu.hide());
        $(currentObj.menu.position).append($spanner);
    }

    function creatCheckbox(tagName, name,disabled) {
        var $checkbox = $(`<div class="switch-div"><input ${disabled?'disabled="disabled"':''} type="checkbox" id="${tagName}_checkbox" /><label  for="${tagName}_checkbox" >${name}</label></div>`);
        $checkbox.find("input")[0].checked = Status.get(tagName);
        $checkbox.find("input").eq(0).click(function () {
            Status.set(tagName, this.checked);
            tool_Func[tagName]();
        });
        return $checkbox;
    }
    function creatRange(tagName, name, value, max) {
        var $range = $(`<div  class="range-div"><input type="range" id="${tagName}_range"  min="1" max="${max}" step="1" value="${value}"  /><span name="value">${value}</span><span>${name}</span></div>`);
        $range.bind('input propertychange', function () {
            var val = $(this).find("input").eq(0).val();
            $(this).find("span[name=value]").html(val);
            Status.set(tagName, val);
            tool_Func[tagName](val);
        });
        return $range;
    }

    function showMagnetTable(avid, href,elem) {
        if ($(elem).hasClass("svg-loading")) {return;}
        $(elem).addClass("svg-loading");
        let $el=$(`.pop-up-tag[name='${avid}${AVINFO_SUFFIX}']`);
        if ($el.length > 0) {
            $el.show();
            myModal.show(elem);
        } else {
            switch(currentWeb) {
                case "javbus": {
                    getMagnet(avid).then(avInfo_c => {
                        myModal.append(avInfo_c.avatar_waterfall);
                        myModal.append(avInfo_c.sample_waterfall);
                        myModal.append(avInfo_c.magnetTable);
                        myModal.show(elem);
                    });
                    break;
                }
                case "javdb": {
                    getMagnet4JavDB(avid,href).then(avInfo => {
                        myModal.append(avInfo);
                        myModal.show(elem);
                    });;
                    break;
                }
            }
        }
    }
    function getMagnet4JavDB(avid,href) {
        return fetch(href).then(response => response.text()).then(doc => {
            let $doc=$($.parseHTML(doc));
            let actors= $doc.find("div.video-meta-panel .panel-block").toArray().find(el=> $(el).find("a[href^='/actors/']").length>0);
            let preview_images= $doc.find(".columns").toArray().find(el=> $(el).find("div.tile-images.preview-images").length>0);
            $(preview_images).find("img[data-src]").each((i,el)=> $(el).attr("src",$(el).attr("data-src")));
            let magnetTable = $doc.find(`div[data-controller="review"]`);
            let info = $(`<div class="pop-up-tag" name="${avid}${AVINFO_SUFFIX}"></div>`);
            info.append(actors);info.append(preview_images);info.append(magnetTable);
            return info;
        })
    };
    function getMagnet(avid, src) {
        //有码和欧美 0  无码 1
        var uc_code = location.pathname.search(/(uncensored|mod=uc)/) < 1 ? 0 : 1;
        return avInfofetch(avid).then(avInfo_c => {
            var gid = avInfo_c.gid;
            var url = `${location.protocol}//${location.hostname}/ajax/uncledatoolsbyajax.php?gid=${gid}&lang=zh&img=${src}&uc=${uc_code}&floor=` + Math.floor(Math.random() * 1e3 + 1);
            return fetch(url).then(response => response.text())
                .then(doc => {
                var table_html = doc.substring(0, doc.indexOf('<script')).trim();
                var table_tag = $(`<table class="table pop-up-tag" name="${avid}${AVINFO_SUFFIX}" style="background-color:#FFFFFF;" ></table>`);
                table_tag.append($(table_html));
                table_tag.find("tr").each(function (i) { // 遍历 tr
                    var me = this;
                    if ($(me).find('a').length == 0) {
                        return true;
                    }
                    var magent_url = $(me).find('a')[0].href;
                    addCopybutton(me, magent_url);
                });
                avInfo_c.magnetTable = table_tag;
                return avInfo_c;
            })
        });
    };

    function avInfofetch(avid) {
        return fetch(`${location.protocol}//${location.hostname}/`+avid) .then(response => response.text())
            .then(doc => {
            var str = /var\s+gid\s+=\s+(\d{1,})/.exec(doc);
            var gid = str[1];
            var avInfo_c={avid:avid};
            avInfo_c.gid=gid;
            if(Status.get("avInfo")){
                var sample_waterfall = $($.parseHTML(doc)).find("#sample-waterfall");
                var avatar_waterfall = $($.parseHTML(doc)).find("#avatar-waterfall");
                if(sample_waterfall.length>0){
                    sample_waterfall[0].id = "";
                    sample_waterfall.addClass("pop-up-tag");
                    sample_waterfall.attr("name",avid + AVINFO_SUFFIX);
                    sample_waterfall.find(".sample-box").removeClass("sample-box").addClass("sample-box-zdy");
                }
                if(avatar_waterfall.length>0){
                    avatar_waterfall[0].id = "";
                    avatar_waterfall.addClass("pop-up-tag");
                    avatar_waterfall.attr("name",avid + AVINFO_SUFFIX);
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
                }
                avInfo_c.sample_waterfall=sample_waterfall;
                avInfo_c.avatar_waterfall=avatar_waterfall;
            }
            return avInfo_c;
        }).catch(err => alert(err));
    };

    function addCopybutton(tag, text) {
        var copyButton = $(`<button class="center-block">${lang.copyButton}</button>`);
        copyButton.click(function () {
            var btn = this;
            GM_setClipboard(text);
            showAlert(lang.copySuccess);
        });
        var td_tag = $('<td></td>');
        td_tag.append(copyButton);
        $(tag).prepend(td_tag);
    }

    function showBigImg(avid,elem) {
        let $selector = $(`.pop-up-tag[name='${avid}${IMG_SUFFIX}']`);
        if ($selector.length > 0) {
            $selector.show();
            myModal.show();
        } else {
            getAvImg(avid,elem);
        }
    }

    function getAvImg(avid, elem) {
        if ($(elem).hasClass("svg-loading")) {return;}
        $(elem).addClass("svg-loading");
        GM_xmlhttpRequest({
            method: "GET",
            url: 'http://blogjav.net/?s=' + avid,
            onload: function (result) {
                if (result.status !== 200) {
                    showAlert(lang.getAvImg_norespond);
                    $(elem).removeClass("svg-loading");
                    return;
                }
                var doc = result.responseText;
                let a_array = $($.parseHTML(doc)).find(blogjavSelector);
                let imgUrl;
                if(a_array.length){
                    imgUrl= a_array[0].href;
                    for (let i = 0; i < a_array.length; i++) {
                        let tempUrl = a_array[i].href;
                        if (tempUrl.search(/FHD/i) > 0) {
                            imgUrl = tempUrl;
                            break;
                        }
                    }
                }
                if (!imgUrl) {
                    showAlert(lang.getAvImg_none);
                    $(elem).removeClass("svg-loading");
                    return;
                }
                GM_xmlhttpRequest({
                    method: "GET",
                    url: imgUrl,
                    headers: {
                        referrer: "http://pixhost.to/"
                    },
                    onload: function (XMLHttpRequest) {
                        var bodyStr = XMLHttpRequest.responseText;
                        var img_src_arr = /<img .*data-src="https:\/\/.*pixhost.to\/thumbs\/.*>/.exec(bodyStr);
                        if (img_src_arr) {
                            var src = $(img_src_arr[0]).attr("data-src").replace('thumbs', 'images').replace('//t', '//img').replace('"', '');
                            console.log(src);
                            var height = $(window).height();
                            var img_tag = $(`<div name="${avid}${IMG_SUFFIX}" class="pop-up-tag" ><img style="min-height:${height}px;width:100%" src="${src}" /></div>`);
                            var downloadBtn = $(`<span class="download-icon" >${download_Svg}</span>`);
                            downloadBtn.click(function () {
                                GM_download(src, avid + ".jpg");
                            });
                            $(img_tag).prepend(downloadBtn);
                            myModal.append(img_tag);
                            myModal.show();
                        }else if(bodyStr.match("404 Not Found")){
                            showAlert(lang.getAvImg_norespond);
                        }
                        $(elem).removeClass("svg-loading");
                    }
                });
            }
        });
    };

    let myModal;
    let currentWeb ;
    let currentObj ;
    let ConstCode = {
        javbus: {
            domainReg: /(javbus|busfan|fanbus|buscdn|cdnbus|dmmsee|seedmm|busdmm|busjav)\./i,
            excludePages: ['/actresses', 'mdl=favor&sort=1', 'mdl=favor&sort=2', 'mdl=favor&sort=3', 'mdl=favor&sort=4', 'searchstar'],
            halfImg_block_Pages:['/uncensored','javbus.one','mod=uc'],
            menu:{
                position:'#navbar ul:first',
                html:`<li class='dropdown'><a class='dropdown-toggle'>${lang.menuText}</a></li>`
            },
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
            domainReg: /(javdb)[0-9]?\./i,
            excludePages: ['/users/'],
            halfImg_block_Pages:['/uncensored','/western','/video_uncensored','/video_western'],
            menu:{
                position:'#navbar-menu-hero .navbar-start',
                html:`<div class='navbar-item' >${lang.menuText}</div>`
            },
            gridSelector: 'div#videos>.grid',
            itemSelector: 'div#videos>.grid div.grid-item',
            widthSelector : '#waterfall-zdy',
            pageNext: 'a.pagination-next',
            pageSelector:'.pagination-list',
            init_Style: function(){
                var local_color=$(".box").css("background-color");
                if(local_color=="rgb(18, 18, 18)"){
                    GM_addStyle(`.scroll-request span{background:white;}a[name="av-title"]:link {color : inherit;}#waterfall-zdy  .movie-box-b{background-color:${local_color};}.alert-zdy {color: black;background-color: white;}`);
                }
            },
            maxWidth: 150,
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
            menu:{
                position:'#navbar ul:first',
                html:`<li class='dropdown'><a class='dropdown-toggle'>${lang.menuText}</a></li>`
            },
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
            menu:{
                position:'div#rightcolumn',
                html:`<div  style="position: absolute;top: -1em;right: 10px;color: #000000;background: #ffffff;padding: 5px 5px 5px 5px;font-weight: bold;font-family: Arial;">${lang.menuText}</div>`
            },
            gridSelector: 'div.videothumblist',
            itemSelector: 'div.videos div.video',
            widthSelector : '#waterfall-zdy',
            pageNext: 'a.page.next',
            pageSelector:'.page_selector',
            getAvItem: function (elem) {
                var href = elem.find("a")[0].href;
                var src = elem.find("img")[0].src;
                if(src.indexOf("pixhost")<0){//排除含有pixhost的src
                    src= src.replace(/ps.jpg/, "pl.jpg");
                }
                var title = elem.find("div.title").eq(0).text();
                var AVID = elem.find("div.id").eq(0).text();
                return {AVID: AVID,href: href,src: src,title: title,date: '',itemTag:''};
            },
            init_Style: function(){
                GM_addStyle(`#menu-div{right:0} #waterfall-zdy div{box-sizing: border-box;}`);
            },
        }
    };

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
    function pageInit() {
        for (var key in ConstCode) {
            var domainReg = ConstCode[key].domainReg;
            if (domainReg && domainReg.test(location.href)) {
                currentWeb = key;
                currentObj = ConstCode[key];
                //排除页面的判断
                if (ConstCode[key].excludePages) {
                    for (var page of ConstCode[key].excludePages) {
                        if (location.pathname.includes(page)) return;
                    }
                }
                //调用初始化方法 未使用  if (ConstCode[key].init) { ConstCode[key].init();}
                //屏蔽竖图模式的页面判断
                if (ConstCode[key].halfImg_block_Pages) {
                    for (var blockPage of ConstCode[key].halfImg_block_Pages) {
                        if (location.href.includes(blockPage)) {
                            Status.halfImg_block = true;
                            break;
                        };
                    }
                }
                break;
            }
        }
        let $items = $(currentObj.itemSelector);
        if (currentWeb && $items.length) {
            oldDriverBlock();
            $(currentObj.gridSelector).hide();
            var waterfall=$(`<div id= 'waterfall-zdy'></div>`);
            $(currentObj.gridSelector).eq(0).before(waterfall);
            addStyle();//全局样式
            if(currentObj.init_Style){currentObj.init_Style()};
            addMenu(); //添加菜单
            myModal = new Popover();//弹出插件
            //加载图片懒加载插件
            lazyLoad = new LazyLoad({
                callback_loaded: function (img) {
                    $(img).removeClass("minHeight-200");
                    tool_Func.imgCallback(img);
                }
            });
            let elems=getItems($items);
            waterfall.append(elems);
            lazyLoad.update();
            if(Status.get("autoPage") && $(currentObj.pageSelector).length ){
                scroller=new ScrollerPlugin(waterfall,lazyLoad);
            }
        }
    }
    let lazyLoad;
    let scroller;
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
            me.wheelFunc=me.wheelWatch.bind(me);
            document.addEventListener('wheel',me.wheelFunc);
        }
        wheelWatch (){
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
            let elems = getItems($body.find(currentObj.itemSelector));
            if (currentWeb != "javdb" && location.pathname.includes('/star/') && elems) {
                elems=elems.slice(1);
            }
            this.scroller_status.hide();
            this.waterfall.append(elems);
            this.lazyLoad.update();
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
            document.removeEventListener('wheel',this.wheelFunc);
        }
    }

    function getItems(elems) {
        var elemsHtml = "";
        var imgStyle = Status.isHalfImg() ? halfImgCSS : fullImgCSS;
        var parseFunc = currentObj.getAvItem;
        for (let i = 0; i < elems.length; i++) {
            elemsHtml = elemsHtml + getItem(elems.eq(i), parseFunc,imgStyle);
        }
        var $elems = $(elemsHtml);
        if (!Status.get("toolBar")) {
            $elems.find(".func-div").css("display","none");
        }
        if(!(['javbus','javdb'].includes(currentWeb))){
            $elems.find(".func-div span[name='magnet']").remove();
        }
        if (!Status.get("copyBtn")) {
            $elems.find(".copy-svg").css("display","none");
        }
        if (Status.get("fullTitle")) {
            $elems.find(".titleNowrap").removeClass("titleNowrap");
        }
        $elems.find("span[name='copy']").click(function () {
            GM_setClipboard($(this).next().text());
            showAlert(lang.copySuccess);
            return false;
        });
        $elems.find(".func-div span[name='download']").click(function () {
            GM_download($(this).attr("src"), $(this).attr("src-title")+".jpg");
        });
        $elems.find(".func-div span[name='magnet']").click(function () {
            showMagnetTable($(this).attr("AVID").replace(/\./g, '-'),$(this).attr("data-href"),this);
        });
        $elems.find(".func-div span[name='picture']").click(function () {
            showBigImg($(this).attr("AVID"),this);
        });
        return $elems;
    }

    function getItem(tag,parseFunc,imgStyle) {
        if (currentWeb!="javdb" && tag.find(".avatar-box").length) {
            tag.find(".avatar-box").addClass("avatar-box-b").removeClass("avatar-box");
            return `<div class='item-b'>${tag.html()}</div>`;
        }
        var AvItem = parseFunc(tag);
        return `<div class="item-b">
                    <div class="movie-box-b">
                    <div class="photo-frame-b">
                        <a  href="${AvItem.href}" target="_blank"><img style="${imgStyle}" class="lazy minHeight-200"  data-src="${AvItem.src}" ></a>
                    </div>
                    <div class="photo-info-b">
                        <a name="av-title" href="${AvItem.href}" target="_blank" title="${AvItem.title}" class="titleNowrap"><span class="svg-span copy-svg" name="copy">${copy_Svg}</span> <span>${AvItem.title}</span></a>
                        <div class="info-bottom">
                          <div class="info-bottom-one">
                              <span class="svg-span copy-svg"  name="copy">${copy_Svg}</span><date name="avid">${AvItem.AVID}</date>${AvItem.date?` / ${AvItem.date}`:""}
                          </div>
                          <div class="info-bottom-two">
                            <div class="item-tag">${AvItem.itemTag}</div>
                            <div class="func-div">
                            <span name="magnet" class="svg-span" title="${lang.tool_magnetTip}" AVID="${AvItem.AVID}" data-href="${AvItem.href}">${magnet_Svg}</span>
                            <span name="download" class="svg-span" title="${lang.tool_downloadTip}" src="${AvItem.src}" src-title="${AvItem.AVID} ${AvItem.title}">${download_Svg}</span>
                            <span name="picture" class="svg-span" title="${lang.tool_pictureTip}" AVID="${AvItem.AVID}" >${picture_Svg}</span>
                           </div>
                         </div>
                       </div>
                    </div>
                    </div>
                </div>`;
    }

    let waterfallWidth = 100;
    function addStyle() {
        var columnNum = Status.getColumnNum();
        waterfallWidth=Status.get("waterfallWidth");
        var css_waterfall = `
${currentObj.widthSelector}{
    width:${waterfallWidth}%;
    margin:0 ${waterfallWidth>100?(100-waterfallWidth)/2+'%':'auto'};
    transition:.5s ;
}
/*#waterfall-zdy img.lazy{transition: width .3s ;}*/
#waterfall-zdy{
    display:flex;
    flex-direction:row;
    flex-wrap:wrap;
}
#waterfall-zdy .item-b{
    padding:5px;
    width:${100 / columnNum}%;
    transition:.5s ;
    animation: fadeInUp .5s ease-out;
}
#waterfall-zdy .movie-box-b {
    border-radius: 5px;
    background-color:white;
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
a[name="av-title"]:link    {  color : black;}
a[name="av-title"]:visited {  color : gray;}
.minHeight-200{
    min-height:200px;
}
#waterfall-zdy .movie-box-b .photo-frame-b {
    text-align: center;
}
#waterfall-zdy .movie-box-b .photo-info-b {
    padding: 7px;
}
#waterfall-zdy .movie-box-b .photo-info-b a {
    display: block;
}
#waterfall-zdy .info-bottom,.info-bottom-two{
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
}
#waterfall-zdy .avatar-box-b {
    display: flex;
    flex-direction: column;
    background-color:white;
    border-radius: 5px;
    align-items: center;
    border: 1px solid rgba(0, 0, 0, 0.2);
}
#waterfall-zdy .avatar-box-b p {
    margin: 0 !important
}
#waterfall-zdy date:first-of-type {
    font-size: 18px !important
}
#waterfall-zdy .func-div {
    float: right;padding: 2px;
    white-space:nowrap;
}
#waterfall-zdy .func-div span {
    margin-right: 2px;
}
#waterfall-zdy .copy-svg {
    vertical-align: middle;
    display: inline-block
}
#waterfall-zdy span.svg-span {
    cursor: pointer;
    opacity: .3;
}
#waterfall-zdy span.svg-span:hover {
    opacity: 1
}
#waterfall-zdy .item-tag {
    display: inline-block;
    white-space:nowrap;
}
#myModal {
    overflow-x: hidden;
    overflow-y: auto;
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1050;
    background-color: rgba(0, 0, 0, 0.5);
}
#myModal #modal-div {
    position: relative;
    width: 80%;
    margin: 0 auto;
    background-color: rgb(6 6 6 / 50%);
    border-radius: 8px;
    animation: fadeInDown .5s;
}
#modal-div .pop-up-tag {
    border-radius: 8px;
    overflow: hidden
}
#modal-div .sample-box-zdy,.avatar-box-zdy {
    display: inline-block;
    border-radius: 8px;
    background-color: #fff;
    overflow: hidden;
    margin: 5px;
    width: 140px
}
#modal-div .sample-box-zdy .photo-frame {
    overflow: hidden;
    margin: 10px
}
#modal-div .sample-box-zdy img {
    height: 90px
}
#modal-div .avatar-box-zdy .photo-frame {
    overflow: hidden;
    height: 120px;
    margin: 10px
}
#modal-div .avatar-box-zdy img {
    height: 120px
}
#modal-div .avatar-box-zdy span {
    font-weight: bold;
    text-align: center;
    word-wrap: break-word;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px;
    line-height: 22px;
    color: #333;
    background-color: #fafafa;
    border-top: 1px solid #f2f2f2
}
svg.tool-svg {
    fill: currentColor;
    width: 22px;
    height: 22px;
    vertical-align: middle
}
span.svg-loading {
    display: inline-block;
    animation: svg-loading 2s infinite;
}
#menu-div {
    white-space: nowrap;
    background-color: white;
    color:black;
    display: none;
    min-width: 200px;
    position: absolute;
    top: 100%;
    border-radius: 5px;
    padding: 5px;
    box-shadow: 0 10px 20px 0 rgb(0 0 0 / 50%)
}
#menu-div>div:hover{
    background-color:gainsboro;
}
#menu-div .switch-div,#menu-div .switch-div *{
    margin: 3px;
}
#menu-div .switch-div label{
    display: inline;
}
#menu-div .range-div {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
}
#menu-div .range-div input {
    cursor: pointer;
    width: 80%;max-width:200px;
}
.alert-zdy {
    position: fixed;
    top: 50%;
    left: 50%;
    padding: 12px 20px;
    font-size: 20px;
    color: white;
    background-color: rgb(0,0,0,.75);
    border-radius: 4px;
    animation: itemShow .3s;
    z-index: 1051;
}
.titleNowrap{
    white-space:nowrap;text-overflow: ellipsis;overflow:hidden;
}
.download-icon {
    position: absolute;
    right: 0;
    z-index: 2;
    cursor: pointer
}
.download-icon>svg {
    width: 30px;
    height: 30px;
    fill: aliceblue;
}
@keyframes fadeInUp {
    0% {transform: translate3d(0, 10%, 0);opacity: .5; }
    100% {transform: none; opacity: 1;}
}
@keyframes fadeInDown {
    0% {transform: translate3d(0, -100%, 0);opacity: 0; }
    100% {transform: none; opacity: 1;}
}
@keyframes itemShow {
    0% {transform:scale(0);}
    100% {transform:scale(1);}
}

@keyframes svg-loading{
    0% {transform:scale(1);opacity:1;}
    50% {transform:scale(1.2);opacity:1;}
    100% {transform:scale(1);opacity:1;}
}
.scroll-request {text-align: center;height: 15px; margin: 15px auto;}.scroll-request span {display: inline-block;width: 15px;height: 100%;margin-right: 8px;border-radius: 50%; background: rgb(16, 19, 16); animation: load 1s ease infinite;} @keyframes load { 0% ,100%{transform:scale(1); }50% {transform:scale(0);}}.scroll-request span:nth-child(2) {animation-delay: 0.125s;}.scroll-request span:nth-child(3) {animation-delay: 0.25s;}.scroll-request span:nth-child(4){animation-delay: 0.375s;}
`;
        GM_addStyle(css_waterfall);
    }
    pageInit();
})();