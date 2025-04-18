import { getRequest } from ".";
import LANG from "./language";
import { BLOGJAV, JAVFREE } from "./siteList";

export interface Preview {
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
export async function getPreview(avid: string) {
    const r = await getRequest(searchOptions.urlPrefix + avid, { timeout: 20000 });
    const doc = new DOMParser().parseFromString(r.responseText, "text/html");
    const results: Preview[] = Array.from(doc.querySelectorAll(searchOptions.resultSelector) as NodeListOf<HTMLAnchorElement>).map(v => ({
        title: v.innerHTML,
        href: v.href,
    }));
    //const results=  [{title:'1r3rffh',href:'f'},{title:'2ggrredf',href:'ff'}];
    if (results.length == 0) {
        throw new Error(LANG.preview_none);
    }
    let indexTo = -1;
    for (let i = 0; i < results.length; i++) {
        const r = results[i] as Preview;
        r.src = await getPreviewUrl(r.href);
        if (r.src) {
            indexTo = i;
            break;
        }
    }
    if (indexTo == -1) {
        throw new Error(LANG.preview_none);
    }
    return results.slice(indexTo);
}
export async function getPreviewUrl(href: string) {
    //return [`http://localhost/jav/test/START-264-1080p.jpeg`]
    const r = await getRequest(href);
    const doc = new DOMParser().parseFromString(r.responseText, "text/html");
    const imgElements = doc.querySelectorAll(searchOptions.imgSelector) as NodeListOf<HTMLImageElement>;
    if (imgElements.length === 0) {
        return null;
    }
    const src = Array.from(imgElements).map(img => img.src);
    const parseSrc = searchOptions.parseSrc;
    return parseSrc ? src.map(parseSrc) : src;
}
