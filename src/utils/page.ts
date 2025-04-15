import { siteList } from "./siteList";

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
    rawGridEl?: HTMLElement;
    pageType?: string;
    defaultConfig?: Record<string, any>;
    configValueName?: string;
}

//首先判断当前是什么网站
const Page = siteList.find(v => v.domainReg.test(location.href)) as Page;
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
Page.rawGridEl = Page.rawItemsEl[0].parentElement!;
document.body.setAttribute(Page.name, "");
export default Page;
