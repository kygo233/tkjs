import { GM_getValue } from "$";
import { defaultConfig } from ".";
import { Page } from "./page";

let config = Object.assign(defaultConfig, GM_getValue("config", {}));
let isHalfImgBlock = Boolean(Page.halfImgBlockPages?.find(page => location.href.includes(page)));
export const status = $state({
    config,
    windowWidth: window.innerWidth,
    isHalfImgBlock,
});
