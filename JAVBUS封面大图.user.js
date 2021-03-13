// ==UserScript==
// @name         JAVBUS封面大图
// @namespace    http://tampermonkey.net/
// @version      0.11
// @description  javbus javdb avmoo替换封面为大图
// @author       kygo233

// @include     /^https:\/\/.*(javbus|busfan|fanbus|buscdn|cdnbus|dmmsee|seedmm|busdmm|busjav)\..*$/
// @include      https://*avmoo.*
// @include      /^https:\/\/.*(javdb)[0-9]\..*$/

// @require      https://cdn.jsdelivr.net/npm/vanilla-lazyload@17.3.0/dist/lazyload.min.js
// @require      https://unpkg.com/infinite-scroll@4/dist/infinite-scroll.pkgd.min.js

// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_download
// @grant        GM_setClipboard
// @connect *

// 2021-03-01 适配javdb；设置菜单移至左上角；点击图片弹出新窗口；标题默认显示一行；恢复高清图标显示
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

//vue
//国际化
(function () {
    'use strict';
    let statusDefault = {
        autoPage: false,
        copyBtn :true,
        toolBar: true,
        avInfo:true,
        itemTag:true,
        halfImg:false,
        waterfallWidth:100,
        columnNumFull:3,
        columnNumHalf:4
    };
    const IMG_SUFFIX = "-bigimg-tag";
    const AVINFO_SUFFIX = "-avTnfo-tag";
    const blogjavSelector= "#content .title2>h1>a";

    const copy_Svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"  width="16" height="16" viewBox="0 0 16 16"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/></svg>`;
    const download_Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="tool-svg" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8zm15 0A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V4.5z"/></svg>`;
    const picture_Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  class="tool-svg" viewBox="0 0 16 16"><path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/></svg>`;
    const magnet_Svg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  class="tool-svg" x="0px" y="0px" viewBox="0 0 1000 1000" ><g><g transform="translate(0.000000,460.000000) scale(0.100000,-0.100000)"><path d="M4171.6,3994c-183.9-13.4-515.3-67.1-706.9-113c-770.2-187.7-1448.4-563.3-2021.2-1118.8c-707-685.9-1130.3-1494.4-1299-2481c-59.4-358.3-59.4-1002,0-1360.2c157.1-923.4,546-1705.1,1172.5-2354.6c695.4-722.3,1534.6-1159.1,2548.1-1325.7c174.4-28.7,388.9-34.5,1643.8-40.2l1440.7-7.7v1302.8v1302.8l-1354.5,7.6c-1207,5.7-1369.8,9.6-1480.9,40.2c-448.3,116.9-785.5,335.3-1036.5,666.7c-252.9,339.1-364,666.7-364,1088.2s111.1,749.1,364,1088.2c241.4,318,595.8,551.8,1000.1,659.1c157.1,40.2,191.6,42.1,1517.3,47.9l1354.5,7.7v1302.8v1300.9l-1344.9-3.8C4863.3,4001.6,4219.5,3997.8,4171.6,3994z"/><path d="M7620.1,2704.6V1401.8h1139.9H9900v1302.8v1302.8H8760.1H7620.1V2704.6z"/><path d="M7620.1-3502.7v-1302.8h1139.9H9900v1302.8v1302.8H8760.1H7620.1V-3502.7z"/></g></g></svg>`;

    //显示提示框
    function showAlert(msg){
        var $alert=$(`<div  class="alert-zdy" ></div>`);
        $('body').append($alert);
        $alert.text(msg);
        $alert.show().delay(3000).fadeOut();
    }

    //配置功能 绑定事件
    let tool_Func = {
        autoPage: function () {
            window.location.reload();
        },
        copyBtn: function () {
            $("#waterfall-zdy .copy-svg").toggle();
        },
        itemTag: function () {
            $("#waterfall-zdy .item-tag").toggle();
        },
        toolBar: function () {
            $("#waterfall-zdy .func-div").toggle();
        },
        halfImg:function () {
            var removeClassName = "halfImgCSS";
            var addClassName = "fullImgCSS";
            if (Status.isHalfImg()) {
                removeClassName = "fullImgCSS";
                addClassName = "halfImgCSS";
            }
            $("#waterfall-zdy .movie-box-b img").each(function () {
                //高大于宽的图片 不变化
                if (!(this.height >= this.width)) {
                    $(this).removeClass(removeClassName).addClass(addClassName);
                }
            });
            var columnNum = Status.getColumnNum();
            GM_addStyle('#waterfall-zdy .item{ width: ' + 100 / columnNum + '%;}');
            $("#columnNum_range").val(columnNum);
            $("#columnNum_range+span+span").text(columnNum);
        },
        avInfo: function () {
            //$("#modal-div .avInfo").toggle();
        },
        columnNum: function (columnNum) {
            GM_addStyle('#waterfall-zdy .item{ width: ' + 100 / columnNum + '%;}');
        },
        waterfallWidth: function (width) {
            var widthSelctor=currentObj.widthSelector;
            $(widthSelctor).css("width", width + "%");
            $(widthSelctor).css("margin", "0 " + (width>100?(100-width)/2+"%":"auto"));
        }
    };

    let Status = {
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
        //判断是否为竖图模式
        isHalfImg: function () {
            return this.get("halfImg") && (!currentObj.halfImg_block);
        },
        //获取列数
        getColumnNum: function () {
            var key= 'columnNum'+(this.isHalfImg()?"Half":"Full");
            return this.get(key);
        }
    };

    function Popover() {
        this.show = function () {
            document.documentElement.classList.add("scrollBarHide");
            this.element.show(0,function(){
                var t=$(this).find('#modal-div');
                t.css({'margin-top': Math.max(0, ($(window).height() - t.height()) / 2) });
            });
        };
        this.hide = function () {
            document.documentElement.classList.remove("scrollBarHide");
            this.element.hide();
        };
        this.init =function (){
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
                    delegate: 'a.sample-box-zdy',
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
        this.append =function (elem){
            if(!this.element){ this.init();}
            this.element.find("#modal-div").append(elem);
        }
        // 封装获取滚动条宽度的方法
        this.getScrollBarWidth= function () {
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
    let myModal;
    function addModal() {
        //添加弹出框，用于显示磁力表格和视频截图，
        myModal = new Popover();
    }
    //添加
    function addMenu() {
        var columnNum = Status.getColumnNum();
        var $menu = $('<div  id="menu-div" ></div>');
        $menu.append(creatCheckbox("autoPage", "自动翻页"));
        $menu.append(creatCheckbox("copyBtn", "复制图标"));
        $menu.append(creatCheckbox("itemTag", "高清&字幕图标"));
        $menu.append(creatCheckbox("toolBar", "功能图标"));
        $menu.append(creatCheckbox("halfImg", "竖图模式",currentObj.halfImg_block));
        if (currentWeb == 'javbus') {
            $menu.append(creatCheckbox("avInfo", "演员表&样品图"));
        }
        $menu.append(creatRange("columnNum", "列数", columnNum, 8));
        $menu.append(creatRange("waterfallWidth", "宽度", waterfallWidth, currentObj.maxWidth?currentObj.maxWidth:100));
        var $spanner = $(currentObj.menu.html);
        $spanner.append($menu);
        $spanner.mouseenter(function () {
            $menu.show();
        });
        $spanner.mouseleave(function () {
            $menu.hide();
        });
        $(currentObj.menu.position).append($spanner);
    }
    //根据id、name生成勾选框
    function creatCheckbox(tagName, name,disabled) {
        var $checkbox = $(`<div class="switch-div"><label  for="${tagName}_checkbox" >${name}</label><input ${disabled?'disabled="disabled"':''} type="checkbox" id="${tagName}_checkbox" /></div>`);
        $checkbox.find("input")[0].checked = Status.get(tagName);
        $checkbox.find("input").eq(0).click(function () {
            Status.set(tagName, this.checked);
            tool_Func[tagName]();
        });
        return $checkbox;
    }
    function creatRange(tagName, name, value, max) {
        var $range = $(`<div  class="range-div"><input type="range" id="${tagName}_range"  min="1" max="${max}" step="1" value="${value}"  /><span>${name} </span><span>${value}</span></div>`);
        $range.bind('input propertychange', function () {
            var val = $(this).find("input").eq(0).val();
            $(this).find("span").eq(1).html(val);
            Status.set(tagName, val);
            tool_Func[tagName](val);
        });
        return $range;
    }
    //显示磁力表格
    function showMagnetTable(avid, src) {
        var avInfo_id = avid + AVINFO_SUFFIX;
        $('.pop-up-tag').hide();
        if ($(".pop-up-tag[name=" + avInfo_id + "]").length > 0) {
            $(".pop-up-tag[name=" + avInfo_id + "]").show();
            myModal.show();
        } else {
            console.time("Magnetfetch耗时: ");
            getMagnet(avid, src).then(avInfo_c => {
                myModal.append(avInfo_c.avatar_waterfall);
                myModal.append(avInfo_c.sample_waterfall);
                myModal.append(avInfo_c.magnetTable);
                myModal.show();
                console.timeEnd("Magnetfetch耗时: ");
            });
        }
    }

    //ajax 获取磁力链接
    function getMagnet(avid, src) {
        //有码和欧美 0  无码 1
        var uc_code = location.pathname.search(/(uncensored|mod=uc)/) < 1 ? 0 : 1;
        return avInfofetch(avid).then(avInfo_c => {
            var gid = avInfo_c.gid;
            var url = `${location.protocol}//${location.hostname}/ajax/uncledatoolsbyajax.php?gid=${gid}&lang=zh&img=${src}&uc=${uc_code}&floor=` + Math.floor(Math.random() * 1e3 + 1);
            return fetch(url).then(response => response.text())
                .then(doc => {
                var table_html = doc.substring(0, doc.indexOf('<script')).trim();
                var name = avid + AVINFO_SUFFIX;
                var table_tag = $('<table class="table pop-up-tag" name="' + name + '" style="background-color:#FFFFFF;" ></table>');
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
    function avInfofetch(avid) {
        return fetch(`${location.protocol}//${location.hostname}/`+avid) .then(response => response.text())
            .then(doc => {
            var str = /var\s+gid\s+=\s+(\d{1,})/.exec(doc);
            var gid = str[1];
            var avInfo_c=new AvInfo(avid);
            avInfo_c.gid=gid;
            if(Status.get("avInfo")){
                var sample_waterfall = $($.parseHTML(doc)).find("#sample-waterfall");
                var avatar_waterfall = $($.parseHTML(doc)).find("#avatar-waterfall");
                if(sample_waterfall.length>0){
                    sample_waterfall[0].id = "";
                    sample_waterfall.addClass("pop-up-tag");
                    sample_waterfall.attr("name",avid + AVINFO_SUFFIX);
                    sample_waterfall.find("a").attr("data-group",avid);
                    sample_waterfall.find(".sample-box").removeClass("sample-box").addClass("sample-box-zdy");
                }
                if(avatar_waterfall.length>0){
                    avatar_waterfall[0].id = "";
                    avatar_waterfall.addClass("pop-up-tag");
                    avatar_waterfall.attr("name",avid + AVINFO_SUFFIX);
                    avatar_waterfall.find("a.avatar-box").removeClass("avatar-box").addClass("avatar-box-zdy");
                }
                avInfo_c.sample_waterfall=sample_waterfall;
                avInfo_c.avatar_waterfall=avatar_waterfall;
            }
            return avInfo_c;
        }).catch(err => alert(err));
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
    //显示视频截图
    function showBigImg(avid,elem) {
        var img_id = avid + IMG_SUFFIX;
        $('.pop-up-tag').hide();
        if ($("#" + img_id).length > 0) {
            $("#" + img_id).show();
            myModal.show();
        } else {
            getAvImg(avid,elem);
        }
    }

    //获取视频截图
    function getAvImg(avid, elem) {
        if (elem.click_lock) {
            showAlert('加载中。。。');
            return;
        }
        elem.click_lock = true;
        GM_xmlhttpRequest({
            method: "GET",
            url: 'http://blogjav.net/?s=' + avid,
            onload: function (result) {
                if (result.status !== 200) {
                    showAlert( 'blogjav.net网站暂时无法响应');
                    elem.click_lock = false;
                    return;
                }
                var doc = result.responseText;
                let a_array = $(doc).find(blogjavSelector);
                let imgUrl;
                for (let i = 0; i < a_array.length; i++) {
                    imgUrl = a_array[i].href;
                    var fhd_idx = a_array[i].href.search(/FHD/g);
                    if (fhd_idx > 0) {
                        break;
                    }
                }
                if (!imgUrl) {
                    showAlert('暂时没有');
                    elem.click_lock = false;
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
                        if (img_src_arr) {
                            var src = $(img_src_arr[0]).attr("src").replace('thumbs', 'images').replace('//t', '//img').replace('"', '');
                            console.log(src);
                            var height = $(window).height();
                            var img_tag = $('<div id="' + avid + IMG_SUFFIX + '" class="pop-up-tag" ><img style="min-height:' + height + 'px;width:100%" src="' + src + '" /></div>');
                            var downloadBtn = $('<span class="download-icon" >'+download_Svg+'</span>');
                            downloadBtn.click(function () {
                                GM_download(src, avid + " 截图.jpg");
                            });
                            $(img_tag).prepend(downloadBtn);
                            myModal.append(img_tag);
                            myModal.show();
                        }else if(bodyStr.match("404 Not Found")){
                            showAlert('blogjav.net网站暂时无法响应');
                        }
                        elem.click_lock = false;
                    }
                });
            }
        });
    };

    let currentWeb = "javbus"; //默认为javbus
    let currentObj ;
    let ConstCode = {
        javbus: {
            domainReg: /(javbus|busfan|fanbus|buscdn|cdnbus|dmmsee|seedmm|busdmm|busjav)\./i,
            excludePages: ['/actresses', 'mdl=favor&sort=1', 'mdl=favor&sort=2', 'mdl=favor&sort=3', 'mdl=favor&sort=4', 'searchstar'],
            halfImg_block: false,
            halfImg_block_Pages:['/uncensored','javbus.one'],
            menu:{
                position:'#navbar ul:first',
                html:`<li class='dropdown'><a class='dropdown-toggle'>样式开关</a></li>`
            },
            gridSelector: 'div#waterfall',
            itemSelector: 'div#waterfall div.item',
            widthSelector : '#waterfall-zdy',
            pageNext:'a#next',
            pageSelector:'.pagination',
            getAvItem: function (elem) {
                var photoDiv = elem.find("div.photo-frame")[0];
                var href = elem.find("a")[0].href; //跳转链接
                var img = $(photoDiv).children("img")[0];
                var src = img.src; //获取大图地址
                if (src.match(/pics.dmm.co.jp/)) {
                    src = src.replace(/ps.jpg/, "pl.jpg");
                } else {
                    src = src.replace(/thumbs/, "cover").replace(/thumb/, "cover").replace(/.jpg/, "_b.jpg");
                }
                var title = img.title; //标题
                var AVID = elem.find("date").eq(0).text().replace(/\./g, '-'); //番号
                var date = elem.find("date").eq(1).text(); //日期
                var itemTag = "";elem.find("div.photo-info .btn").toArray().forEach( x=> itemTag+=x.outerHTML);
                return {AVID: AVID,href: href,src: src,title: title,date: date,itemTag:itemTag};
            }
        },
        javdb: {
            domainReg: /(javdb)[0-9]\./i,
            excludePages: '',
            halfImg_block: false,
            halfImg_block_Pages:['/uncensored','/western','/video_uncensored','/video_western'],
            menu:{
                position:'#navbar-menu-hero .navbar-start',
                html:`<div class='navbar-item'><a class='navbar-link'>样式开关</a></div>`
            },
            gridSelector: 'div#videos>.grid',
            itemSelector: 'div#videos>.grid div.grid-item',
            widthSelector : '#waterfall-zdy',
            pageNext: 'a.pagination-next',
            pageSelector:'.pagination-list',
            init_Style: function(){
                var local_color=$(".box").css("background-color");
                GM_addStyle(`#waterfall-zdy  .movie-box-b{background-color:${local_color};}`);
            },
            maxWidth: 150,
            getAvItem: function (elem) {
                var href = elem.find("a")[0].href; //跳转链接
                var img = elem.find("div.item-image>img").eq(0);
                var src = img.attr("data-src").replace(/thumbs/, "covers") ; //获取大图地址
                var title = elem.find("div.video-title").eq(0).text(); //标题
                if(!title) {title = elem.find("div.video-title2").eq(0).text()};
                var AVID = elem.find("div.uid").eq(0).text().replace(/\./g, '-'); //番号
                if(!AVID) {AVID = elem.find("div.uid2").eq(0).text()};
                var date = elem.find("div.meta").eq(0).text(); //日期
                var itemTag = elem.find(".tags.has-addons").html(); //日期
                return {AVID: AVID,href: href,src: src,title: title,date: date,itemTag:itemTag};
            },
            init: function(){
                if(location.href.includes("/users/")){ this.widthSelector="div.section";}
            }
        },
        avmoo: {
            domainReg: /avmoo\./i,
            excludePages: ['/actresses'],
            halfImg_block: false,
            menu:{
                position:'#navbar ul:first',
                html:`<li class='dropdown'><a class='dropdown-toggle'>样式开关</a></li>`
            },
            gridSelector: 'div#waterfall',
            itemSelector: 'div#waterfall div.item',
            widthSelector : '#waterfall-zdy',
            pageNext: 'a[name="nextpage"]',
            pageSelector:'.pagination',
            getAvItem: function (elem) {
                var photoDiv = elem.find("div.photo-frame")[0];
                var href = elem.find("a")[0].href; //跳转链接
                var img = $(photoDiv).children("img")[0];
                var src = img.src.replace(/ps.jpg/, "pl.jpg"); //获取大图地址
                var title = img.title; //标题
                var AVID = elem.find("date").eq(0).text().replace(/\./g, '-'); //番号
                var date = elem.find("date").eq(1).text(); //日期
                var itemTag = "";elem.find("div.photo-info .btn").toArray().forEach( x=> itemTag+=x.outerHTML);
                return {AVID: AVID,href: href,src: src,title: title,date: date,itemTag:itemTag};
            }
        }
    };

    //加载图片懒加载插件
    let lazyLoad = new LazyLoad({
        callback_loaded: function (bigimg) {
            //加载时的回调，本身为竖图的不做变化
            if (Status.isHalfImg() && bigimg.height >= bigimg.width) {
                $(bigimg).removeClass("halfImgCSS");
                $(bigimg).addClass("fullImgCSS");
            }
        }
    });
    function pageInit() {
        //判断页面的地址, 加载对应的参数
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
                //调用初始化方法
                if (ConstCode[key].init) {
                    ConstCode[key].init();
                }
                //屏蔽竖图模式的页面判断
                if (ConstCode[key].halfImg_block_Pages) {
                    for (var blockPage of ConstCode[key].halfImg_block_Pages) {
                        if (location.href.includes(blockPage)) {
                            ConstCode[key].halfImg_block = true;
                            break;
                        };
                    }
                }
                break;
            }
        }
        if ($(currentObj.itemSelector).length) {
            $(currentObj.gridSelector).hide();
            var waterfall=$(`<div id= 'waterfall-zdy'></div>`);
            $(currentObj.gridSelector).eq(0).before(waterfall);
            addStyle();//全局样式
            if(currentObj.init_Style){currentObj.init_Style()};
            addMenu(); //添加菜单
            addModal(); //弹出插件
            var elems=getItems($(currentObj.itemSelector));
            waterfall.append(elems);
            lazyLoad.update();
            if(Status.get("autoPage") && $(currentObj.pageSelector).length ){
                var scroller= `<div class = "scroller-status" style="text-align:center;display:none"><h1 class="loader-ellips infinite-scroll-request">加载中</h1><h1 class="infinite-scroll-last">end</h1></div>`;
                waterfall.after(scroller);
                var infScroll = new InfiniteScroll( '#waterfall-zdy', {
                    path: currentObj.pageNext,
                    append: false,
                   //button: '.view-more-button',
                    scrollThreshold: false,
                    history:false,
                  //hideNav:currentObj.pageSelector,
                    status: '.scroller-status'
                });
                infScroll.on( 'load', function( body, path, response ) {
                    console.log(path);
                    var elems_fetch=getItems($(body).find(currentObj.itemSelector));
                    if (currentWeb!="javdb" && location.pathname.includes('/star/') && elems_fetch) {
                        elems_fetch=elems_fetch.slice(1);
                    }
                    waterfall.append(elems_fetch);
                    lazyLoad.update();
                    done=true;
                });
                document.addEventListener('wheel', function(){
                    if ($(currentObj.pageSelector)[0].getBoundingClientRect().top - $(window).height() < 300 && done) {
                         done=false;
                         infScroll.loadNextPage();
                     }
                });
            }
        }
    }
    let done=true;
    function getItems(elems) {
        var elemsHtml = "";
        var className = Status.isHalfImg() ? "halfImgCSS" : "fullImgCSS";
        var parseFunc = currentObj.getAvItem;
        for (let i = 0; i < elems.length; i++) {
            elemsHtml = elemsHtml + getItem(elems.eq(i), parseFunc,className);
        }
        var $elems = $(elemsHtml);
        if (!Status.get("toolBar")) {
            $elems.find(".func-div").css("display","none");
        }
        if(!(currentWeb=="javbus")){
            $elems.find(".func-div span[name='magnet']").remove();
        }
        if (!Status.get("copyBtn")) {
            $elems.find(".copy-svg").css("display","none");
        }

        if (!Status.get("itemTag")) {
            $elems.find(".item-tag").css("display","none");
        }
        $elems.find("span[name='copy']").click(function () {
            GM_setClipboard($(this).next().text());
            showAlert('复制成功');
            return false;
        });
        $elems.find(".func-div span[name='download']").click(function () {
            GM_download($(this).attr("src"), $(this).attr("src-title")+".jpg");
        });
        $elems.find(".func-div span[name='magnet']").click(function () {
            showMagnetTable($(this).attr("AVID"));
        });
        $elems.find(".func-div span[name='picture']").click(function () {
            showBigImg($(this).attr("AVID"),this);
        });
        // currentObj.elemsLoaded(elemsArray);
        return $elems;
    }

    function getItem(tag,parseFunc,className) {
        //currentObj.specialItem(tag);
        if (currentWeb!="javdb" && tag.find(".avatar-box").length) {
            tag.find(".avatar-box").addClass("avatar-box-b").removeClass("avatar-box");
            return `<div class='item'>${tag.html()}</div>`;
        }
        var AvItem = parseFunc(tag);
        return `<div class="item">
                    <div class="movie-box-b">
                    <div class="photo-frame-b">
                        <a  href="${AvItem.href}" target="_blank"><img class="lazy ${className}"  data-src="${AvItem.src}" ></a>
                    </div>
                    <div class="photo-info-b">
                        <a name="av-title" href="${AvItem.href}" target="_blank" title="${AvItem.title}" class="titleNowrap"><span class="svg-span copy-svg" name="copy">${copy_Svg}</span> <span>${AvItem.title}</span></a>
                        <div class="info-bottom">
                          <div class="info-bottom-one">
                              <span class="svg-span copy-svg"  name="copy">${copy_Svg}</span><date name="avid">${AvItem.AVID}</date> / <date>${AvItem.date}</date>
                          </div>
                          <div class="info-bottom-two">
                            <div class="item-tag">${AvItem.itemTag}</div>
                            <div class="func-div">
                            <span name="magnet" class="svg-span" title="磁力" AVID="${AvItem.AVID}" >${magnet_Svg}</span>
                            <span name="download" class="svg-span" title="下载图片" src="${AvItem.src}" src-title="${AvItem.AVID} ${AvItem.title}">${download_Svg}</span>
                            <span name="picture" class="svg-span" title="视频截图" AVID="${AvItem.AVID}" >${picture_Svg}</span>
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
    transition:width .5s ease;
}
#waterfall-zdy{
    display:flex;
    flex-direction:row;
    flex-wrap:wrap;
}
#waterfall-zdy .item{
    padding:5px;
    width:${100 / columnNum}%;
    transition:all .4s ease
}
#waterfall-zdy .movie-box-b {
    border-radius: 5px;
    background-color:white;
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1);
    overflow: hidden;
}
#waterfall-zdy .movie-box-b .photo-frame-b a {
    display: block;
}
#waterfall-zdy .movie-box-b .photo-info-b {
    padding: 10px;
}
#waterfall-zdy .movie-box-b .photo-info-b a {
    color: inherit;
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
img.fullImgCSS {
    width: 100% !important;
/*去掉height属性 lazyload插件有不加载图片的bug*/
    height: 100% !important;
}
img.halfImgCSS {
    position: relative;
    left: -112%;
    width: 212% !important;
    height: 100% !important;
    max-width: 212%
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
    animation: fadeInDown .4s;
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
    display: block;
    padding: 10px;
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
#menu-div {
    background-color: white;
    color:black;
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    width: 210px;
    border-radius: 5px;
    padding: 5px 0;
    box-shadow: 0 10px 20px 0 rgb(0 0 0 / 50%)
}
#menu-div .switch-div label {
    display: inline-block;
    width: 70%;
    text-align: right
}
#menu-div .switch-div input {
    width: 30%
}
#menu-div .range-div {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap
}
#menu-div .range-div input {
    cursor: pointer;
    width: 70%
}
#menu-div .layoutMode-div{
    padding: 4px;
    text-align: center
}
.alert-zdy {
    width: 400px;
    z-index: 1999;
    position: fixed;
    top: 50px;
    left: 50%;
    margin-left: -200px;
    padding: 15px;
    font-size: 20px;
    color: #0f5132;
    background-color: #d1e7dd;
    border: 1px solid #dca7a7;
    border-radius: 4px;
    animation: fadeInDown .4s;
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
@keyframes fadeInDown {
    0% {
        transform: translate3d(0, -100%, 0);
        opacity: 0;
    }
    100% {
        transform: none;
        opacity: 1;
    }
}
`;
        GM_addStyle(css_waterfall);
    }
    pageInit();
    // Your code here...
})();