// ==UserScript==
// @name         JAVBUS封面大图
// @namespace    http://tampermonkey.net/
// @version      0.10
// @description  改编自脚本 JAV老司机
// @author       kygo233

// @include     /^https:\/\/.*\.(javbus|busfan|fanbus|buscdn|cdnbus|dmmsee|seedmm|busdmm|busjav)\..*$/
// @include      https://*avmoo.*

// @require      https://cdn.jsdelivr.net/npm/vanilla-lazyload@17.3.0/dist/lazyload.min.js
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_download
// @grant        GM_setClipboard
// @connect *

// 2021-02-06 新增图片懒加载插件；重调样式；优化按钮效果，切换样式不刷新页面；
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

// 懒加载 done
// promise加载内容 done
// 网络错误 boostrap提示框  done
// avmoo 隐藏磁力按钮 done
// 无缝瀑布流
// 国际化
// 标题单行显示
(function () {
    'use strict';
    // 瀑布流状态：1：开启、0：关闭
    let waterfallScrollStatus = GM_getValue('waterfall_status', 0);
    let copyBtnStatus = GM_getValue('copyBtn_status', 1);
    let aTagStatus = GM_getValue('aTag_status', 1);
    let halfImgStatus = GM_getValue('halfImg_status', 0);
    let waterfallWidth = GM_getValue('waterfallWidth', 100);

    let statusDefaultMap = new Map(); // 空Map
    statusDefaultMap.set('waterfall', 0); //
    statusDefaultMap.set('copyBtn', 1); //
    statusDefaultMap.set('aTag', 1);
    statusDefaultMap.set('halfImg', 0);
    let columnNum_full = GM_getValue('bigImg_columnNum_full', 3);
    let columnNum_half = GM_getValue('bigImg_columnNum_half', 4);
    const IMG_SUFFIX = "-bigimg-tag";
    const MAGNET_SUFFIX = "-magnet-tag";
    const SAMPLE_SUFFIX = "-sample-tag";
    const AVATAR_SUFFIX = "-avatar-tag";
    const AVINFO_SUFFIX = "-avTnfo-tag";

    let GetData = {
        //判断是否为竖图模式
        isHalfImg :function(){
            return GM_getValue('halfImg_status', 0) > 0 && !halfImg_block;
        },
        //获取列数
        getColumnNum :function(){
            return this.isHalfImg() ? GM_getValue('bigImg_columnNum_half', 4) : GM_getValue('bigImg_columnNum_full', 3);
        }
    }

    //加载图片懒加载插件
    let lazyLoad = new LazyLoad({
        callback_loaded: function(bigimg){
            //加载时的回调，本身为竖图的不做变化
            if ( GetData.isHalfImg() && bigimg.height > bigimg.width) {
                $(bigimg).removeClass("halfImgCSS");
                $(bigimg).addClass("fullImgCSS");
            }
        }
    });

    //导航栏的功能 绑定事件
    let func_List={
        select_tag : {
            change:function(columnNum){
                GM_setValue('bigImg_columnNum_' + (GetData.isHalfImg()? 'half' : 'full'),columnNum );
                GM_addStyle('#waterfall_h1 .item{ width: ' + 100 / columnNum + '%;}');
            }
        },
        waterfall : {
            checkbox : function (){
                window.location.reload();
            }
        } ,
        copyBtn:{
            checkbox : function (){
                $(".copyBtn-icon").toggleClass("hidden");
            }
        },
        aTag:{
            checkbox : function (){
                $(".func-div").toggleClass("hidden");
            }
        },
        halfImg :{
            checkbox : function (){
                var removeClassName="halfImgCSS";
                var addClassName="fullImgCSS";
                if (GetData.isHalfImg()) {
                    removeClassName="fullImgCSS";
                    addClassName="halfImgCSS";
                }
                $("#waterfall_h1 .movie-box-b img").each(function(){
                    //高大于宽的图片 不变化
                    if (! (this.height > this.width)) {
                        $(this).removeClass(removeClassName).addClass(addClassName);
                    }
                });
                var columnNum = GetData.getColumnNum();
                GM_addStyle('#waterfall_h1 .item{ width: ' + 100 / columnNum + '%;}');
                $("#inputGroupSelect01").val(columnNum);

            }
        }
    };
    function showAlert(msg){
        var $alet = $("#alert-error");
        if(!$alet.length){
            var alert=`<div id="alert-error" class="alert alert-danger" style="width:400px;position: fixed;top: 100px;left: 50%;margin-left:-200px;display:none;font-size: 20px;" role="alert"></div>`;
            $alet=$(alert);
            $('body').append($alet);
        }
        $alet.text(msg);
        $alet.fadeIn().delay(2000).fadeOut();
    }

    //添加全局样式 导航栏功能按钮
    function addStyle() {
        GM_addStyle(css_waterfall);
        var columnNum = GetData.getColumnNum();
        GM_addStyle('#waterfall_h1 { width: ' + waterfallWidth + '% !important;}');
        GM_addStyle('#waterfall_h1 .item{ width: ' + 100 / columnNum + '%;}');
        //添加bootstrap弹出框，用于显示磁力表格和视频截图，
        var myModal=$('<div class="modal fade" id="myModal"  role="dialog" >' +
                      '<div class="modal-dialog" style="width:80% !important;"  id="modal-div" > </div>');
        $('body').append(myModal);

        //启用图片浏览插件
        myModal.magnificPopup({
            delegate: '.sample-a-zdy',
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
                opener: function(element) {
                    return element.find('img');
                }
            }
        });
        //列数下拉框,
        var select_tag = $('<select class="form-control" style="margin-top: 8px;padding:0;" id="inputGroupSelect01">' +
                           ' <option value="1">1列</option><option value="2">2列</option><option value="3">3列</option>' +
                           ' <option value="4">4列</option><option value="5">5列</option><option value="6">6列</option></select>');
        $(select_tag).val(columnNum);
        $(select_tag).change(function(){
            func_List.select_tag.change($(this).val());
        });
        let li_elem = document.createElement('li');
        $(li_elem).append($(select_tag));
        $("#navbar ul.nav").first().append($(li_elem));

        var other_select_tag = $('<li class="dropdown">' +
                                 ' <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" data-hover="dropdown" >样式开关<span class="caret"></span></a>' +
                                 ' <ul class="dropdown-menu" role="menu">' +
                                 '</ul> </li>');
        $(other_select_tag).mouseover(function () {
            $(this).addClass('open');
        }).mouseout(function () {
            $(this).removeClass('open');
        });
        var ul = $(other_select_tag).children("ul")[0];
        //阻止事件冒泡  实现点击后不关闭下拉菜单
        $(ul).on("click", "[data-stopPropagation]", function (e) {
            e.stopPropagation();
        });
        $(ul).append(creatCheckbox("waterfall", "瀑布流"));
        $(ul).append(creatCheckbox("copyBtn", "复制图标"));
        $(ul).append(creatCheckbox("aTag", "功能链接"));
        if (!halfImg_block) {
            $(ul).append(creatCheckbox("halfImg", "竖图模式"));
        }
        var range = $('<li data-stopPropagation="true" ><div  class="range_div"><input type="range"   min="1" max="100" step="1" value="' + waterfallWidth + '"  /><span>' + waterfallWidth + '</span></div></li>');
        $(range).bind('input propertychange', function () {
            var val = $(this).find("input").eq(0).val();
            GM_addStyle('#waterfall_h1{ width: ' + val + '%!important;}');
            $(this).find("span").eq(0).html(val);
            GM_setValue("waterfallWidth", val);
        });
        $(ul).append(range);

        $(ul).append('<div style="padding:4px;">和"JAV老司机"同时运行时，请关闭老司机的瀑布流<div>');
        $("#navbar ul.nav").first().append($(other_select_tag));

    }
    //根据id、name生成勾选框
    function creatCheckbox(tagName, name) {
        var checkbox = $('<li data-stopPropagation="true"><div class="switch_div"><label   for="' + tagName + '_checkbox" >' + name + '</label><input  type="checkbox" id="' + tagName + '_checkbox" /></div></li>');
        var status = tagName + "_status";
        checkbox.find("input")[0].checked = GM_getValue(status, statusDefaultMap.get(tagName)) > 0 ? true : false;
        checkbox.click(function () {
            ($(this).find("input")[0].checked == true) ? GM_setValue(status, 1): GM_setValue(status, 0);
            func_List[tagName].checkbox();
        });
        return checkbox;
    }
    class AvInfo {
        constructor(avid) {
            this.avid=avid;
            this.gid="";//查询磁力的参数
            this.sample_waterfall="";//样品图片
            this.avatar_waterfall="";//演员
            this.bigImg="";
            this.magnetTable="";
        }
    }
    //用于保存视频的信息
    let avInfo=new Map();
    //获取  gid 演员表 视频截图
    function getAvInfo(avid) {
        return new Promise((resolve, reject) => {
            if(avInfo.has(avid)){
                resolve(avInfo.get(avid));
            }else{
                avInfofetch(avid).then(avInfo_c=>resolve(avInfo_c));
            }
        })
    };

    function avInfofetch(avid) {
        return fetch(`${location.protocol}//${location.hostname}/`+avid) .then(response => response.text())
            .then(doc => {
            var str = /var\s+gid\s+=\s+(\d{1,})/.exec(doc);
            var gid = str[1];
            var sample_waterfall = $($.parseHTML(doc)).find("#sample-waterfall");
            var avatar_waterfall = $($.parseHTML(doc)).find("#avatar-waterfall");
            if(sample_waterfall.length>0){
                sample_waterfall[0].id = "#" + avid + SAMPLE_SUFFIX;;
                sample_waterfall.addClass("pop-up-tag");
                sample_waterfall.attr("name",avid + AVINFO_SUFFIX);
                sample_waterfall.find("a").attr("data-group",avid);
                sample_waterfall.find("a.sample-box").removeClass("sample-box").addClass("sample-a-zdy");
            }
            if(avatar_waterfall.length>0){
                avatar_waterfall[0].id = "#" + avid + AVATAR_SUFFIX;;
                avatar_waterfall.addClass("pop-up-tag");
                avatar_waterfall.attr("name",avid + AVINFO_SUFFIX);
                avatar_waterfall.find("a.avatar-box").removeClass("avatar-box").addClass("avatar-box-zdy");
            }
            var avInfo_c=new AvInfo(avid);
            avInfo_c.gid=gid;
            avInfo_c.sample_waterfall=sample_waterfall;
            avInfo_c.avatar_waterfall=avatar_waterfall;
            avInfo.set(avid,avInfo_c);
            return avInfo_c;
        }).catch(err => alert(err));

    };
    //设置点击标签
    function setTag(elems) {
        var src_fuc = ConstCode[currentWeb].replaceImgSrc;
        var className =GetData.isHalfImg()?"halfImgCSS":"fullImgCSS";
        for (let i = 0; i < elems.length; i++) {
            if ($(elems[i]).find(".avatar-box").length > 0) {
                $(elems).find(".avatar-box").addClass("avatar-box-b").removeClass("avatar-box");
                continue;
            }
            add_Tag(elems[i], src_fuc,className);
        }
        if(currentWeb=="avmoo"){
            $(elems).find(".func-div span[name='magnet']").addClass("hidden");
        }
        lazyLoad.update();
    }

    //自定义item 模板
    function getTemplate(elem,href,src,title,avid,date) {
        var template=`<div class="movie-box-b">
                         <div class="photo-frame-b">
                            <a  href="${href}"><img class="lazy"  data-src="${src}" ></a>
                         </div>
                         <div class="photo-info-b">
                             <a name="av_title" href="${href}"><span name="title_span">${title}</span></a>
                             <date name="avid">${avid}</date> / <date>${date}</date>
                             <div class="func-div">
                                <span name="magnet" class="glyphicon glyphicon-magnet func-span"   data-toggle="tooltip" data-placement="bottom" title="磁力"  style="transform: rotate(90deg);"   ></span>
                                <span name="download" class="glyphicon glyphicon-download func-span"  data-toggle="tooltip" data-placement="bottom" title="下载封面"></span>
                                <span name="picture" class="glyphicon glyphicon-picture func-span" data-toggle="tooltip" data-placement="bottom" title="视频截图"></span>
                             </div>
                         </div>
                     </div>`;
        return template;
    }

    function add_Tag(tag, src_fuc,className) {
        //替换封面为大图 Begin
        var photoDiv = $(tag).find("div.photo-frame")[0];

        var href=$(tag).find("a")[0].href;//跳转链接
        var img = $(photoDiv).children("img")[0];
        var src = src_fuc(img.src);//获取大图地址
        var title = img.title; //标题

        var AVID = $(tag).find("date").eq(0).text(); //番号
        AVID = AVID.replace(/\./g, '-');
        var date = $(tag).find("date").eq(1).text(); //日期
        $(tag).html(getTemplate(tag,href,src,title,AVID,date));
        var bigimg = $(tag).find("img")[0];
        $(bigimg).addClass(className);
        //替换封面为大图 end

        addCopyATagPre($(tag).find("a[name='av_title']").eq(0), title);
        addCopyATagPre($(tag).find("date[name='avid']").eq(0), AVID);
        var func_div=$(tag).find(".func-div")[0];

        if(GM_getValue('aTag_status', 1)<1){
            $(func_div).addClass("hidden");
        }
        $(tag).find(".func-div span[name='picture']").click(function () {
            showBigImg(AVID,this);
        });
        $(tag).find(".func-div span[name='download']").click(function () {
            GM_download(src, AVID + " " + title + ".jpg");
        });
        $(tag).find(".func-div span[name='magnet']").click(function () {
            showMagnetTable(AVID, src);
        });
    }

    //添加复制图标
    function addCopyATagPre(tag, text) {
        var copyATag = $('<span class="glyphicon glyphicon-bookmark copyBtn-icon" ></span>');
        if(GM_getValue('copyBtn_status', 1)<1){
            copyATag.addClass("hidden");
        }
        copyATag.click(function () {
            var span = this;
            $(span).removeClass("glyphicon-bookmark").addClass('glyphicon-ok');
            GM_setClipboard(text);
            setTimeout(function () {
                $(span).removeClass("glyphicon-ok").addClass('glyphicon-bookmark');
            }, 1000);
            return false;
        });
        $(tag).prepend(copyATag);
    }
    //显示视频截图
    function showBigImg(avid,elem) {
        var img_id = avid + IMG_SUFFIX;
        $('.pop-up-tag').hide();
        if ($("#" + img_id).length > 0) {
            $("#" + img_id).show();
            $('#myModal').modal();
        } else {
             getAvImg(avid,elem);
        }
    }
    //获取视频截图
    function getAvImg(avid,elem) {
        if(elem.click_lock) {
            showAlert("加载中。。。");
            return;
        }
        elem.click_lock=true;
        GM_xmlhttpRequest({
            method: "GET",
            url: 'http://blogjav.net/?s=' + avid,
            onload: function (result) {
                if (result.status !== 200) {
                    showAlert("blogjav.net此网站暂时无法响应");
                    elem.click_lock=false;
                    return;
                }
                var doc = result.responseText;
                let a_array = $(doc).find(".entry-title a");
                let imgUrl;
                for (let i = 0; i < a_array.length; i++) {
                    imgUrl = a_array[i].href;
                    var fhd_idx = a_array[i].href.search(/FHD/g);
                    if (fhd_idx > 0) {
                        break;
                    }
                }
                if(!imgUrl){
                    elem.click_lock=false;
                    return;
                }
                GM_xmlhttpRequest({
                    method: "GET",
                    url: imgUrl,
                    headers: {
                        referrer: "http://pixhost.to/" //绕过防盗图的关键
                    },
                    onload: function (XMLHttpRequest) {
                        var bodyStr = XMLHttpRequest.responseText;
                        var img_src_arr = /<img .*src="https*:\/\/.*pixhost.to\/thumbs\/.*>/.exec(bodyStr);
                        if (img_src_arr[0]){
                            var src = $(img_src_arr[0]).attr("src").replace('thumbs', 'images').replace('//t', '//img').replace('"', '');
                            console.log(src);
                            var img_tag = $('<div id="' + avid + IMG_SUFFIX + '" class="pop-up-tag" ><img class="carousel-inner" src="' + src + '" /></div>');
                            var downloadBtn = $('<span class="glyphicon glyphicon-download-alt download-icon" ></span>');
                            downloadBtn.click(function () {
                                GM_download(src, avid + " 截图.jpg");
                            });
                            $(img_tag).prepend(downloadBtn);
                            $('#modal-div').append(img_tag);
                            $('#myModal').modal();
                        }
                        elem.click_lock=false;
                    }
                });
            }
        });
    };

    //显示磁力表格
    function showMagnetTable(avid, src) {
        var avInfo_id = avid + AVINFO_SUFFIX;
        $('.pop-up-tag').hide();
        if ($(".pop-up-tag[name="+avInfo_id+"]").length > 0) {
            $(".pop-up-tag[name="+avInfo_id+"]").show();
            $('#myModal').modal();
        } else {
            console.time("Magnetfetch耗时: ");
            getMagnet(avid, src).then(avInfo_c=>{
                $('#modal-div').append(avInfo_c.avatar_waterfall);
                $('#modal-div').append(avInfo_c.sample_waterfall);
                $('#modal-div').append(avInfo_c.magnetTable);
                $('#myModal').modal();
                console.timeEnd("Magnetfetch耗时: ");
            });
        }
    }

    //ajax 获取磁力链接
    function getMagnet(avid, src) {
        //有码和欧美 0  无码 1
        var uc_code = location.pathname.search(/uncensored/) < 1 ? 0 : 1;
        return getAvInfo(avid).then(avInfo_c=>{
            var gid=avInfo_c.gid;
            var url = `${location.protocol}//${location.hostname}/ajax/uncledatoolsbyajax.php?gid=${gid}&lang=zh&img=${src}&uc=${uc_code}&floor=` + Math.floor(Math.random() * 1e3 + 1);
            return fetch(url).then(response => response.text())
                .then(doc => {
                var table_html = doc.substring(0, doc.indexOf('<script')).trim();
                var id= avid + MAGNET_SUFFIX;
                var name= avid + AVINFO_SUFFIX;
                var table_tag = $('<table class="table pop-up-tag" name="'+name+'" style="background-color:#FFFFFF;" id="' +id+ '"></table>');
                table_tag.append($(table_html));
                // var length = table_tag.find("tr").length;
                //var HEIGHT = window.innerHeight;
                //if (HEIGHT >= 35 * length) {
                //    table_tag.css("margin-top", (HEIGHT - 35 * length) / 2 - 40);
                // }
                table_tag.find("tr").each(function (i) { // 遍历 tr
                    var me = this;
                    if ($(me).find('a').length == 0) {
                        return true;
                    }
                    var magent_url = $(me).find('a')[0].href;
                    addCopybutton(me, magent_url);
                });
                avInfo_c.magnetTable=table_tag;
                return avInfo_c;
            })
        });

    };

    function addCopybutton(tag, text) {
        var copyButton = $('<button class="center-block">复制</button>');
        copyButton.click(function () {
            var btn = this;
            btn.innerHTML = '成功';
            GM_setClipboard(text);
            setTimeout(function () {
                btn.innerHTML = '复制';
            }, 1000);
        });
        var td_tag = $('<td></td>');
        td_tag.append(copyButton);
        $(tag).prepend(td_tag);
    }
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

    function waterfallScrollInit(pageItem) {
        if (!location.pathname.includes('/actresses') &&
            !(location.pathname.includes('mdl=favor') && location.pathname.search(/sort=[1-4]/) > 0) &&
            $('div#waterfall div.item').length) {
            $('#waterfall')[0].id = "waterfall_h1";
            //解决和"JAV老司机"同时运行时样式冲突问题--begin
            if ($('.masonry').length > 0) {
                $('.masonry').addClass("masonry2");
                $('.masonry').removeClass("masonry");
            }
            if ($('#waterfall_h').length > 0) {
                $('#waterfall_h')[0].id = "waterfall_h1";
            }
            //解决 JAV老司机 第619行 $pages[0].parentElement.parentElement.id = "waterfall_h";
            //收藏界面样式变形的问题
            if ($('#waterfall_h1.row').length > 0) {
                $('#waterfall_h1.row').removeAttr("id");
            }
            //解决和"JAV老司机"同时运行时样式冲突问题--end
            addStyle();
            //样式比瀑布流先生效，所以先隐藏掉原图
            if ($('#waterfall_h1 .movie-box img').length > 0) {
                $('#waterfall_h1 .movie-box img').hide();
            }
            if (waterfallScrollStatus > 0) {
                var w = new waterfall(pageItem);
            } else {
                var elems = $('div#waterfall_h1 div.item');
                if (!elems.length) {
                    return;
                };
                elems.attr("style","");
                $('.masonry2').empty().append(elems);
                setTag(elems);

            }
        }
    };

    function waterfall(selectorcfg = {}) {
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
        this._3func = function (elems) {
            if (!location.pathname.includes('/actresses') && elems) { //排除actresses页面
                setTag(elems);
            }
        };
        if ($('div#waterfall_h1 div.item').length > 0 || $('div#waterfall div.item').length > 0) {
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
        const fetchwithcookie = fetch(url, {
            credentials: 'same-origin'
        });
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
                } else {
                    this.lock.lock();
                    resolve();
                }
            }).then(() => {
                return this.fetchURL(url).then(info => {
                    url = info.nextURL;
                    return info.elems;
                });
            }).then(elems => {
                this.lock.unlock();
                return elems;
            }).catch((err) => {});
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
            });
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

    let currentWeb = "javbus";//默认为javbus
    let halfImg_block = false;
    let ConstCode = {
        javbus: {
            domainReg: /(javbus|busfan|fanbus|buscdn|cdnbus|dmmsee|seedmm|busdmm|busjav)\./i,
            replaceImgSrc: function (src) {
                if (src.match(/pics.dmm.co.jp/)) {
                    src = src.replace(/ps.jpg/, "pl.jpg");
                } else {
                    src = src.replace(/thumbs/, "cover").replace(/thumb/, "cover").replace(/.jpg/, "_b.jpg");
                }
                return src;
            },
            pageItem: {
                next: 'a#next',
                item: 'div#waterfall div.item',
                cont: '.masonry2',
                pagi: '.pagination-lg'
            },
            uncensored: 0
        },
        avmoo: {
            domainReg: /avmoo\./i,
            replaceImgSrc: function (src) {
                src = src.replace(/ps.jpg/, "pl.jpg");
                return src;
            },
            pageItem: {
                next: 'a[name="nextpage"]',
                item: 'div#waterfall div.item',
                cont: '#waterfall_h1',
                pagi: '.pagination'
            }
        }
    };
    function jsInit() {
        //判断页面的地址, 加载对应的参数
        for (var key in ConstCode) {
            var domainReg = ConstCode[key].domainReg;
            if (domainReg && domainReg.test(location.href)) {
                currentWeb = key;
                break;
            }
        }
        //无码和欧美类 屏蔽 竖图模式
        if (location.href.includes('/uncensored') || location.href.includes('javbus.one')) halfImg_block = true;
        waterfallScrollInit(ConstCode[currentWeb].pageItem);
    }

    const css_waterfall=`
#waterfall_h1 {
    margin: 10px auto;
    height: auto !important;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
#waterfall_h1 .item {
    margin-bottom: 15px;
    padding :0 7px;
}
#waterfall_h1 .movie-box-b  {
    border-radius: 5px;
    display: flex;
  /*  height: 100%;*/
    background-color:white;
    flex-direction: column;
    border: 1px solid rgba(0,0,0,0.2);
    box-shadow: 0 2px 3px 0 rgba(0,0,0,0.1);
}
#waterfall_h1 .avatar-box-b {
    display: flex;
    flex-direction: row;
    background-color:white;
    border-radius: 5px;
    align-items:center;
    border: 1px solid rgba(0,0,0,0.2);
    justify-content:space-around;
}
#waterfall_h1 .avatar-box-b p,span{
   margin:0!important;
}
#waterfall_h1 .movie-box-b .photo-frame-b{
}
#waterfall_h1 .movie-box-b .photo-frame-b a{
     display:block;
     overflow:hidden;
     border-top-right-radius: 5px;
     border-top-left-radius: 5px;
}
#waterfall_h1 .movie-box-b .photo-info-b {
    padding: 10px;
}
#waterfall_h1 .movie-box-b .photo-info-b  a{
    color: #333;
    display:block;
}
#waterfall_h1 .movie-box-b .photo-info-b  a:hover{
    color: #23527c;
}
#waterfall_h1 date:first-of-type{
    font-size: 18px;
}
.func-div{
   float:right;
}
.pop-up-tag {
     border-radius: 10px;
     overflow: hidden;
}
.func-span {
    cursor: pointer ;
    font-size:21px;
    opacity: 0.2;
    padding:2px 5px;

}
.func-span:hover {
   opacity: 1;
}
.download-icon {
    font-size: 30px;
    color: black;
    position: absolute;
    right: 0;
    z-index: 2;
    cursor: pointer
}
.copyBtn-icon {
    font-size: 15px;
    opacity: 0.4;
    top: 3px !important;
}
.copyBtn-icon:hover {
    color: red;
    opacity: 1;
}
.switch_div {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
.switch_div:hover {
    background-color: #E6E6FA;
}
.switch_div label {
    cursor: pointer;
    width: 50%;
    text-align: right;
}
.switch_div input {
    cursor: pointer;
    width: 50%;
}
.fullImgCSS {
    width: 100% !important;
    height: 100% !important;
}
.halfImgCSS {
    position: relative;
    left: -112%;
    width: 212% !important;
    height: 100% !important;
}
.range_div {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
}
.range_div input {
    cursor: pointer;
    width: 80%;
}
.range_div span {
    width: 20%;
    text-align: center;
}

#myModal #modal-div{
 background-color: rgb(6 6 6 / 50%);
 border-radius: 10px;
}
#myModal .sample-a-zdy,.avatar-box-zdy {
    display: inline-block;
    background-color: #fff;
    overflow: hidden;
    margin: 5px;
    width: 140px;
}
#myModal .sample-a-zdy .photo-frame {
    overflow: hidden;
    margin: 10px;
}
#myModal .sample-a-zdy img {
    height: 90px;
}
#myModal .avatar-box-zdy .photo-frame {
    overflow: hidden;
    height: 120px;
    margin: 10px;
}
#myModal .avatar-box-zdy img {
    height: 120px;
}
#myModal .avatar-box-zdy span {
    font-weight: bold;
    text-align: center;
    word-wrap: break-word;
    display: block;
    padding: 10px;
    line-height: 22px;
    color: #333;
    background-color: #FAFAFA;
    border-top: 1px solid #F2F2F2;
}
`;
    jsInit();
    // Your code here...
})();