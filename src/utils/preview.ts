import { getRequest } from ".";
import LANG from "./language";
import { BLOGJAV, JAVFREE } from "./siteList";

interface Preview {
    title: string;
    href: string;
    src?: string[] | null;
    zoom?: boolean;
    isLoading?: boolean;
}

const searchOptionsAll = {
    [JAVFREE]: {
        urlPrefix: "https://javfree.me/?s=",
        resultSelector: "#primary article h2.entry-title>a",
        imgSelector: '#primary .entry-content>p>img[src$=".jpeg"]',
    },
    [BLOGJAV]: {
        urlPrefix: "https://blogjav.net/?s=",
        resultSelector: "#primary article h2.entry-title>a",
        imgSelector: '#primary .entry-content>p img[src*="pixhost.to/thumbs"]',
        parseSrc: (src: string) => src.replace("thumbs", "images").replace("//t", "//img"),
    },
};
let searchOptions = searchOptionsAll[JAVFREE];

export const setSearchOptions = (site: string) => {
    searchOptions = searchOptionsAll[site];
};
export async function getPreviewSearchResult(avid: string) {
    const r = await getRequest(searchOptions.urlPrefix + avid, { timeout: 20000 });
    const doc = new DOMParser().parseFromString(r.responseText, "text/html");
    const resultsEl = doc.querySelectorAll<HTMLAnchorElement>(searchOptions.resultSelector);
    const results: Preview[] = Array.from(resultsEl).map(v => ({
        title: v.innerHTML,
        href: v.href,
    }));
    //const results=  [{title:'1r3rffh',href:'f'},{title:'2ggrredf',href:'ff'}];
    // 找到第一个有效结果，直接返回从该结果开始的数组
    for (let i = 0; i < results.length; i++) {
        results[i].src = await getPreviewUrl(results[i].href);
        if (results[i].src) {
            return results.slice(i);
        }
    }
    throw new Error(LANG.preview_none);
}
export async function getPreviewUrl(href: string) {
    //return [`http://localhost/jav/test/START-264-1080p.jpeg`]
    const r = await getRequest(href);
    const doc = new DOMParser().parseFromString(r.responseText, "text/html");
    const imgElements = doc.querySelectorAll<HTMLImageElement>(searchOptions.imgSelector);
    if (imgElements.length === 0) {
        return null;
    }
    const src = Array.from(imgElements).map(img => img.src);
    const parseSrc = searchOptions.parseSrc;
    return parseSrc ? src.map(parseSrc) : src;
}
