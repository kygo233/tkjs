export const [JAVBUS, JAVDB, MISSAV, AV123, JABLE, JAVFREE, BLOGJAV] = ["javbus", "javdb", "missav", "av123", "jable", "javfree", "blogjav"];
export const [GRID, VIDEO] = ["grid", "video"];

export interface AvItem {
    id: string;
    AVID: string;
    href: string;
    src: string;
    title: string;
    date: string;
    itemTag: string;
    score: string;
    [key: string]: any;
}
export interface AvItem {
    html: string;
}

const id = () => Math.random().toString(16).slice(2);
export const siteList = [
    {
        name: JAVBUS,
        domainReg: /^https?:\/\/.*(javbus|busjav|busfan|fanbus|buscdn|cdnbus|dmmsee|seedmm|busdmm|dmmbus|javsee|seejav)\..*$/,
        excludePages: ["/actresses", "mdl=favor&sort=1", "mdl=favor&sort=2", "mdl=favor&sort=3", "mdl=favor&sort=4", "searchstar"],
        halfImgBlockPages: ["/uncensored", "mod=uc", "javbus.hair"],
        gridSelector: "div#waterfall",
        itemSelector: "div#waterfall>div.item",
        pageNext: "a#next",
        getAvItem: function (elem: Element) {
            let AVID = elem.querySelector("date")?.textContent;
            if (!AVID) return { html: elem.innerHTML };
            let href = elem.querySelector("a")?.href;
            let img = elem.querySelector<HTMLImageElement>("div.photo-frame>img");
            let src = img?.src!;
            if (src.match(/pics.dmm.co.jp/)) {
                src = src.replace(/ps.jpg/, "pl.jpg");
            } else if (src.match(/image.mgstage.com/)) {
                src = src.replace(/pf_o1_|pb_p_/, "pb_e_");
                //} else if (src.endsWith("nopic.jpg")) {
            } else {
                src = src
                    .replace(/thumbs/, "cover")
                    .replace(/thumb/, "cover")
                    .replace(/.jpg/, "_b.jpg");
            }
            let title = img?.title;
            let date = elem.querySelectorAll("date")[1]?.textContent;
            let itemTag = elem.querySelector("div.photo-info div:first-of-type")?.innerHTML;
            return { id: id(), AVID, href, src, title, date, itemTag, score: "" };
        },
    },
    {
        name: JAVDB,
        domainReg: /^https?:\/\/.*(javdb)[0-9]*\..*$/,
        excludePages: ["/users/"],
        halfImgBlockPages: ["/uncensored", "/western", "/video_uncensored", "/video_western"],
        itemSelector: "div.movie-list.h>div.item",
        pageNext: "a.pagination-next",
        getAvItem: function (elem: Element) {
            let href = elem.querySelector("a")?.href;
            let src = elem.querySelector<HTMLImageElement>("div.cover > img")?.src;
            let title = elem.querySelector("a")?.title;
            let AVID = elem.querySelector("div.video-title>strong")?.textContent;
            let date = elem.querySelector("div.meta")?.textContent;
            let score = elem.querySelector("div.score")?.innerHTML;
            let itemTag = elem.querySelector(".tags.has-addons")?.innerHTML;
            return { id: id(), AVID, href, src, title, date, itemTag, score };
        },
    },
    {
        name: MISSAV,
        domainReg: /^https?:\/\/.*(missav)\..*$/,
        itemSelectorObj: {
            [GRID]: "div.grid[x-init]>div",
            [VIDEO]: "button[\\@click\\.prevent=\"togglePanel('share')\"]",
        },
        pageNext: "a[rel=next]",
    },
    {
        name: AV123,
        domainReg: /^https?:\/\/.*(123av|\.1av)\..*$/,
        itemSelectorObj: {
            [GRID]: "#page-list .box-item-list>div",
            [VIDEO]: "button.btn.favourite",
        },
        pageNext: ".pagination .active + li a",
    },
    {
        name: JABLE,
        domainReg: /^https?:\/\/.*(jable)\..*$/,
        itemSelectorObj: {
            [GRID]: "div[id^=list_videos_] div.row>div",
            [VIDEO]: ".video-info .my-3 button",
        },
    },
];
