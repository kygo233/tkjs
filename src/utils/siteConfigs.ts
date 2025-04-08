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

export const downloadSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/></svg>`;
export const pictureSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/></svg>`;
export const magnetSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a7 7 0 0 0-7 7v3h4V8a3 3 0 0 1 6 0v3h4V8a7 7 0 0 0-7-7m7 11h-4v3h4zM5 12H1v3h4zM0 8a8 8 0 1 1 16 0v8h-6V8a2 2 0 1 0-4 0v8H0z"/></svg>`;
export const linkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/></svg>`;

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
