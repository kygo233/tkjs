// ==UserScript==
// @name         封面大图local
// @namespace    https://github.com/kygo233/tkjs
// @homepage     https://sleazyfork.org/zh-CN/scripts/409874-javbus-larger-thumbnails
// @version      0.0.1
// @author       kygo233
// @license      MIT
// @description          replace thumbnails of javbus,javdb,javlibrary and avmoo with source images
// @description:zh-CN    javbus,javdb,javlibrary,avmoo替换封面为源图

// @include      *javbus.com/*
// @include      *javdb.com/*
// @include      *avmoo.cyou/*
// @include      *javlibrary.com/*
// @include      http://ys.com/jav/javlibrary.html
// @include      /^.*(javbus|busjav|busfan|fanbus|buscdn|cdnbus|dmmsee|seedmm|busdmm|dmmbus|javsee|seejav)\..*$/
// @include      /^.*(javdb)[0-9]*\..*$/
// @include      /^.*(avmoo)\..*$/


// @require      file://D:\gitproject\tkjs\JAVBUS封面大图.user.js
// @resource     localCss  file://D:\gitproject\本地调用\common.css
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_download
// @grant        GM_setClipboard
// @grant        GM_getResourceText
// @connect *

// ==/UserScript==

(function () {
    'use strict';
    // @require      file://D:\gitproject\本地调用\lazyload.min.js
    // @require      https://cdn.jsdelivr.net/npm/vanilla-lazyload@17.3.0/dist/lazyload.min.js
     let load = true;
     let localCss = GM_getResourceText("localCss");
     if (load && localCss) {
        GM_addStyle(localCss);
     }
})();