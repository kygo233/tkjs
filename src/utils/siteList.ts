export const [JAVBUS, JAVDB, MISSAV, JAVFREE, BLOGJAV] = ["javbus", "javdb", "missav", "javfree", "blogjav"];
export const [GRID, VIDEO] = ["grid", "video"];

interface Page {
    name: string;
    domainReg: RegExp;
    excludePages?: string[];
    halfImgBlockPages?: string[];
    itemSelector: string;
    itemSelectorObj?: Record<string, string>;
    pageNext: string;
    getAvItem?: (elem: Element) => { [propName: string]: any };
    rawItemsEl?: NodeListOf<Element>;
    renderEl?: Element;
    pageType?: string;
}
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

function isMobile(): boolean {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export const defaultConfig = {
    autoPage: false,
    pageHistory: false,
    toolbar: true,
    toolbar_autoHide: !isMobile(),
    previewSite: JAVFREE,
    linkUrl: "https://missav.ws/",
    avInfo: false,
    newWindow: true,
    halfImg: false,
    fullTitle: false,
    maxWidth: true,
    autoColumn: true,
    columnNumFull: 3,
    columnNumHalf: 4,
};

export const defaultConfigMissav = {
    autoPage: false,
    pageHistory: false,
    toolbar: true,
    uncensoredFilter: false,
};

const id = () => Math.random().toString(16).slice(2);
export const siteConfigsList = [
    {
        name: JAVBUS,
        domainReg: /^https?:\/\/.*(javbus|busjav|busfan|fanbus|buscdn|cdnbus|dmmsee|seedmm|busdmm|dmmbus|javsee|seejav)\..*$/,
        excludePages: ["/actresses", "mdl=favor&sort=1", "mdl=favor&sort=2", "mdl=favor&sort=3", "mdl=favor&sort=4", "searchstar"],
        halfImgBlockPages: ["/uncensored", "mod=uc", "javbus.hair"],
        itemSelector: "div#waterfall>div.item",
        pageNext: "a#next",
        getAvItem: function (elem: Element) {
            let AVID = elem.querySelector("date")?.textContent;
            if (!AVID) return { html: elem.innerHTML };
            let href = elem.querySelector("a")?.href;
            let img = elem.querySelector<HTMLImageElement>("div.photo-frame>img");
            let src = img?.src || "";
            if (src.match(/pics.dmm.co.jp/)) {
                src = src.replace(/ps.jpg/, "pl.jpg");
            } else if (src.match(/image.mgstage.com/)) {
                src = src.replace(/pf_o1_|pb_p_/, "pb_e_");
            } else {
                src = src
                    .replace(/thumbs/, "cover")
                    .replace(/thumb/, "cover")
                    .replace(/.jpg/, "_b.jpg");
            }
            let title = img?.title || "";
            let date = elem.querySelectorAll("date")[1]?.textContent || "";
            let itemTag = elem.querySelector("div.photo-info div:first-of-type")?.innerHTML || "";
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
        domainReg: /^https?:\/\/.*(missav).*$/,
        pageType: null,
        itemSelectorObj: {
            [GRID]: "div.grid[x-init]>div",
            [VIDEO]: "button[\\@click\\.prevent=\"togglePanel('share')\"]",
        },
        pageNext: "a[rel=next]",
    },
];

//首先判断当前是什么网站
export const Page = siteConfigsList.find(v => v.domainReg.test(location.href)) as Page;
if (!Page) {
    throw new Error(`domain not matched`);
}
//排除页面的判断
if (Page.excludePages?.find(page => location.pathname.includes(page))) {
    throw new Error(`excluded Page`);
}

let rawItemsEl;
if (Page.itemSelector) {
    rawItemsEl = document.body.querySelectorAll(Page.itemSelector);
} else if (Page.itemSelectorObj) {
    for (const [pageType, itemSelector] of Object.entries(Page.itemSelectorObj)) {
        rawItemsEl = document.body.querySelectorAll(itemSelector);
        if (rawItemsEl.length > 0) {
            Page.pageType = pageType;
            Page.itemSelector = itemSelector;
            break;
        }
    }
}
if (!rawItemsEl || rawItemsEl.length < 1) {
    throw new Error("No items found");
}
Page.rawItemsEl = rawItemsEl;

document.body.setAttribute(Page.name, "");
