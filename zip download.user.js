// ==UserScript==
// @name         zip download
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include      *jav*
// @require      https://cdn.jsdelivr.net/npm/jquery@3.2.1/dist/jquery.min.js

// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';
    class DownloadPanel{
        constructor(){
            this.addPanel();
        }
        show(){
            if(!this.element) { this.addPanel();}
            this.element.show();
        }
        hide(){
            this.element.hide();
        }
        loadJS(){
            let jsArray =["https://cdn.jsdelivr.net/npm/jszip@3.6.0/dist/jszip.min.js","https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js"];
            let head = document.getElementsByTagName("head")[0];
            for (let url of jsArray.values()) {
                let script = document.createElement("script");
                script.src = url;
                head.appendChild(script);
            }
        }
        js_wait(){
            if (typeof JSZip === 'undefined' || typeof FileSaver === 'undefined') {
                setTimeout(this.js_wait.bind(this), 200);
            }else{
                this.element.find("button[name=download]").attr("disabled",false);
            }
        }
        addPanel(){
            let me=this;
            me.loadJS();
            GM_addStyle(`
#downloadPanel{
    width: 300px;
    height: 200px;
    background-color: #efe0e0;
    border-radius: 5px;
    position: fixed;
    right: 15px;
    color:black;
    text-align:center;
    border: 1px solid rgb(208 123 123 / 51%);
    box-shadow: 5px 5px 4px 0 rgb(0 0 0 / 10%);
    bottom: 5px;
    box-sizing: content-box;
    z-index: 1000;
}
#downloadPanel button[name="download"]{
    height: 25px;
    border: 1px solid #0a050575;
    padding: 0 9px;
    background-color: #fff;
    color: #000;
}
#downloadPanel button[disabled]{
   color: #0006;
   cursor: not-allowed!important;
}
.close-div {
    position: absolute;
    right: 5px;
    top: 5px;
    width: 25px;
    height: 25px;
    border-radius: 12.5px;
    cursor: pointer;
}
.close-div:hover {
    background: #868686;
}
.close-div:before ,.close-div:after {
    position: absolute;
    content: '';
    width: 17px;
    height: 3px;
    background: white;
    top: 11px;
    left: 4px;
}
.close-div:before{
    transform: rotate(45deg);
}
.close-div:after{
    transform: rotate(-45deg);
}
#file-Info div[name=filename] {
  width:70%;display:inline-block;text-align:right;
}
#file-Info div[name=state] {
  width:30%;display:inline;
}
#file-Info::-webkit-scrollbar {width: 7px;}
#file-Info::-webkit-scrollbar-track {border-radius: 8px;background-color: #F5F5F5;}
#file-Info::-webkit-scrollbar-thumb {border-radius: 8px;background-color: #c8c8c8;} `)
            me.element = $(`<div  id="downloadPanel">
                              <div class="close-div"></div>
                              <div id="download-formPanel" style="height:25px;width: 270px;margin:5px 0;">
                                <button name="download"  disabled="true">下载</button>
                                <span>番号</span><input  placeholder="ssni,abp" name="key"></input>
                                <span style="display:none">线程数</span><input style="display:none" name="poolLimit" value="3"></input>
                              </div>
                              <div id="progress-Info" style="position: absolute;top: 35px;">
                                    <span name="sum"></span><span name="total"></span><span name="msg"></span>
                              </div>
                              <div id="file-Info" style="height:160px;width:100%;overflow-y:auto;background-color: white;"></div>
                           </div>`);
            me.js_wait();
            me.element.find("button[name=download]").on("click", function () {
                let button = this;
                button.disabled= true;
                me.resetInfo();
                let arrayList = me.getResultList();
                if(arrayList.length){
                    me.element.find("span[name=total]").text(arrayList.length);
                    let poolLimit = me.element.find("input[name=poolLimit]").val();
                    me.downloadZip(poolLimit?poolLimit:5,arrayList).then(()=>(button.disabled=false));
                }else{
                    me.element.find("span[name=msg]").text("无过滤结果");button.disabled=false;
                }
            });
            me.element.find(".close-div").on("click", function () {
                me.hide();
            });
            $('body').append(me.element);
        }
        getResultList(){
            let list =[];
            let key = this.element.find("input[name=key]").val().toUpperCase();
            let keyArray = key.replace("，",",").split(",").filter(k=> k && k.trim());
            $("div.movie-box-b").each(function () {
                let avid = $(this).find("date[name=avid]").text();
                if(keyArray.length && (! keyArray.find(k=> avid.indexOf(k)>-1)) ){
                    return ;
                }
                let url = $(this).find("img.lazy").attr("data-src");
                let filename = avid+".jpg";
                list.push({avid:avid,url:url,filename:filename});
            });
            return list;
        }
        downloadZip(poolLimit,arrayList){
            let me=this;
            let sum = 0;
            let zip = new JSZip();
            return me.asyncPool(poolLimit,arrayList,function(item,array){
                let $state=me.addFileInfo(item.avid);
                //return false;
                return me.getImgResource(item.url).then(response =>{
                    if (response) {
                        zip.file(item.filename, response);
                        $state.text(`✔`);
                        me.element.find(`span[name="sum"]`).text(`${++sum}/`);
                    } else {
                        $state.text(`❎`);
                    }
                }).catch(err =>$state.text(`❎`));
            }).then(() => zip.generateAsync({type:"blob"}).then(blob => saveAs(blob, "download.zip") ))
        }
        getImgResource(url){
            return new Promise((resolve, reject)=>{
                GM_xmlhttpRequest({
                    method: "GET",
                    url: url,
                    timeout: 20000,
                    responseType : 'blob',
                    onload: function (r) {
                        if(r.statusText == "OK"){
                          resolve(r.response);
                        }else{
                          reject();
                        }
                    },
                    onerror : function (r) {
                        reject();
                    }
                });
            })
        }
        //https://blog.csdn.net/ghostlpx/article/details/106431837
        async asyncPool(poolLimit, array, iteratorFn) {
            const ret = []
            const executing = []
            for (const item of array) {
                const p = Promise.resolve().then(() => iteratorFn(item, array));
                ret.push(p)
                const e = p.then(() => executing.splice(executing.indexOf(e), 1))
                executing.push(e)
                if (executing.length >= poolLimit) {
                    await Promise.race(executing)
                }
            }
            return Promise.all(ret)
        }
        addFileInfo(avid){
            let $fileInfo=$(`<div style="width:50%;display:inline-block;float:left;"><div name="filename">${avid}:</div><div name="state">--></div></div>`);
            this.element.find("#file-Info").append($fileInfo);
            return $fileInfo.find("div[name=state]");
        }
        resetInfo(){
            this.element.find("#progress-Info span").text("");
            this.element.find("#file-Info").empty();
        }
    }
    let panel= new DownloadPanel();

    // Your code here...
})();