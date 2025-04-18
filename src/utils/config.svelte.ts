import { GM_getValue } from "$";
import Page from "./page";
import { AV123, JAVDB, JAVFREE, MISSAV } from "./siteList";

function isMobile(): boolean {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
const defaultConfig: Record<string, any> = {
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
    clickToCopy: true,
    autoColumn: true,
    columnNumFull: 3,
    columnNumHalf: 4,
};
const missav = {
    autoPage: false,
    pageHistory: false,
    toolbar: true,
    uncensoredFilter: false,
};
const av123 = {
    autoPage: false,
    pageHistory: false,
    toolbar: true,
};
const configValueName = "config";
if (Page.name == MISSAV) {
    Page.defaultConfig = missav;
    Page.configValueName = configValueName + "-" + Page.name;
} else if (Page.name == AV123) {
    Page.defaultConfig = av123;
    Page.configValueName = configValueName + "-" + Page.name;
} else {
    if (Page.name == JAVDB) {
        defaultConfig.maxWidth = true;
    }
    Page.defaultConfig = defaultConfig;
    Page.configValueName = configValueName;
}
function merge(target: Record<string, any>, source: Record<string, any>) {
    const result: Record<string, any> = {};
    for (const key in target) {
        result[key] = source.hasOwnProperty(key) ? source[key] : target[key];
    }
    return result;
}
let obj = merge(Page.defaultConfig, GM_getValue(Page.configValueName, {}));
const config = $state(obj);

export default config;
