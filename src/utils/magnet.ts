import { getRequest, Tips } from "./index";
import LANG from "./language";
import { config } from "./config.svelte";
import { GM_setClipboard } from "$";
import { JAVBUS, JAVDB, MISSAV, type AvItem } from "./siteList";

async function getMagnetFromJavbus(avid: string): Promise<HTMLTableElement[]> {
    const originUrl = "https://www.javbus.com";
    avid = avid.replace("-uncensored-leak", "").replace("-chinese-subtitle", "");
    const url = `${originUrl}/${avid}`;
    const response = await getRequest(url);
    if (response.status == 404) {
        throw LANG.request_invalidUrl;
    }
    const [gid, uc_code] = getGid(response.responseText);
    const magnetUrl = `${originUrl}/ajax/uncledatoolsbyajax.php?gid=${gid}&lang=zh&img=&uc=${uc_code}&floor=` + Math.floor(Math.random() * 1e3 + 1);
    const magnetDoc = await getRequest(magnetUrl).then(r => r.responseText);
    const table = getMagnetTable(magnetDoc);
    return [table];
}

const getGid = (doc: string): [gid: string, uc_code: string] => {
    const str = /var\s+gid\s+=\s+(\d{1,})/.exec(doc);
    const uc = /var\s+uc\s+=\s+(0|1)/.exec(doc);
    if (!str || !uc) {
        throw new Error("getGid error");
    }
    return [str[1], uc[1]];
};

const getMagnetTable = (doc: string): HTMLTableElement => {
    const table = document.createElement("table");
    table.classList.add("javbus-table");
    table.innerHTML = doc.substring(0, doc.indexOf("<script")).trim();
    addCopybutton(table);
    return table;
};

const addCopybutton = (table: HTMLTableElement) => {
    table.querySelectorAll("tr").forEach(tr => {
        const a = tr.querySelector("a");
        if (!a) return;
        const magent = a.href;
        const td = document.createElement("td");
        const button = document.createElement("button");
        button.className = "btn-copy";
        button.textContent = LANG.copyButton;
        button.addEventListener("click", function () {
            GM_setClipboard(magent, "text");
            Tips.show(LANG.copySuccess, Tips.TYPE.SUCCESS);
        });
        td.appendChild(button);
        tr.prepend(td);
    });
};

export const getMagnet = {
    [JAVBUS]: async (item: AvItem): Promise<Element[]> => {
        //获取详情页面的 演员表和样品图元素
        const doc = await fetch(item.href).then(response => response.text());
        const [gid, uc_code] = getGid(doc);
        const resultEl = [];
        if (config.avInfo) {
            const docParsed = new DOMParser().parseFromString(doc, "text/html");
            const sample = docParsed.querySelector("#sample-waterfall");
            const avatar = docParsed.querySelector("#avatar-waterfall");
            if (avatar) {
                avatar.id = "";
                //avatar.querySelectorAll("a.avatar-box span:last-child").forEach((span) => {});
                avatar.querySelectorAll("a.avatar-box").forEach(a => {
                    a.setAttribute("target", "_blank");
                    a.classList.remove("avatar-box");
                    a.classList.add("avatar-box-zdy");
                });
                resultEl.push(avatar);
            }
            if (sample) {
                sample.id = "";
                sample.querySelectorAll(".sample-box").forEach(box => {
                    box.classList.remove("sample-box");
                    box.classList.add("sample-box-zdy");
                });
                resultEl.push(sample);
            }
        }
        const url = `${location.protocol}//${location.hostname}/ajax/uncledatoolsbyajax.php?gid=${gid}&lang=zh&img=&uc=${uc_code}&floor=` + Math.floor(Math.random() * 1e3 + 1);
        const magnetDoc = await fetch(url).then(response => response.text());
        const table = getMagnetTable(magnetDoc);
        resultEl.push(table);
        return resultEl;
    },
    [JAVDB]: async (item: AvItem): Promise<Element[]> => {
        const response = await fetch(item.href).then(response => response.text());
        const docParsed = new DOMParser().parseFromString(response, "text/html");
        const resultEl = [];
        if (config.avInfo) {
            const actors = docParsed.querySelector("div.video-meta-panel .panel-block a[href^='/actors/']")?.closest(".panel-block");
            if (actors) {
                //actors.querySelectorAll("a").forEach((a) => {});
                resultEl.push(actors);
            }
            const previewImages = docParsed.querySelector(".columns .tile-images.preview-images")?.closest(".columns");
            if (previewImages) {
                previewImages.querySelectorAll(".preview-video-container").forEach(container => {
                    container.setAttribute("href", `#preview-video-${item.id}`);
                });
                previewImages.querySelector("#preview-video")?.setAttribute("id", `preview-video-${item.id}`);
                previewImages.querySelectorAll("img[data-src]").forEach(img => {
                    img.setAttribute("src", img.getAttribute("data-src")!);
                });
                resultEl.push(previewImages);
            }
        }
        const magnetTable = docParsed.querySelector(`div.columns[data-controller="movie-tab"]`);
        if (magnetTable) {
            magnetTable.querySelectorAll("div.top-meta").forEach(meta => meta.remove()); // 移除广告
            resultEl.push(magnetTable);
        }
        return resultEl;
    },
    [MISSAV]: getMagnetFromJavbus,
};
