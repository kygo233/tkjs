import { GM_xmlhttpRequest, GM_download, type GmDownloadOptions, GM_setClipboard } from "$";
import LANG from "./language";

export const asyncWithLoading = async (fn: Function, item: Record<string, any>, loadingProp = "isLoading") => {
    try {
        item[loadingProp] = true;
        await fn();
    } catch (error: any) {
        console.error(error);
        Tips.show(error.message ?? error, Tips.TYPE.ERROR);
    } finally {
        item[loadingProp] = false;
    }
};
export function getRequest(url: string, params?: Record<string, any>): Promise<any> {
    console.log(url);
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest(
            Object.assign(
                {
                    method: "GET",
                    url: url,
                    timeout: 10000,
                    headers: { Referer: url },
                    onload: (r: any) => {
                        r.status >= 200 && r.status < 300 ? resolve(r) : reject(`${r.status} ${LANG.request_error}`);
                    },
                    onerror: () => reject(`error错误`),
                    ontimeout: () => reject(`timeout超时`),
                },
                params,
            ),
        );
    });
}
export function getDownload(url: string, name?: string) {
    return new Promise((resolve, reject) => {
        GM_download({
            url: url,
            name: name ? name : url.split("/").pop(),
            headers: { Referer: url },
            onload: () => resolve("success"),
            onerror: () => reject(`error错误`),
            ontimeout: () => reject(`timeout超时`),
        } as GmDownloadOptions);
    });
}
export const Tips = {
    TYPE: {
        SUCCESS: "✔",
        ERROR: "❌",
    },
    show: (msg: string, type: string, close?: Boolean | string) => {
        const alert = document.createElement("div");
        alert.className = "alert-zdy";
        alert.innerHTML = (type ?? "") + msg;
        if (close) {
            const closeButton = document.createElement("div");
            closeButton.className = "alert-close";
            closeButton.innerHTML = "&#x2715;";
            closeButton.addEventListener("click", () => (alert.style.display = "none"));
            alert.appendChild(closeButton);
        }
        document.body.appendChild(alert);
        if (!close) {
            setTimeout(() => {
                alert.style.display = "none";
            }, 3000);
        }
    },
};

export const downloadSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5"/><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z"/></svg>`;
export const pictureSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/></svg>`;
export const magnetSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a7 7 0 0 0-7 7v3h4V8a3 3 0 0 1 6 0v3h4V8a7 7 0 0 0-7-7m7 11h-4v3h4zM5 12H1v3h4zM0 8a8 8 0 1 1 16 0v8h-6V8a2 2 0 1 0-4 0v8H0z"/></svg>`;
export const linkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/></svg>`;

export const clickToCopy = (even: Event) => {
    even.preventDefault();
    GM_setClipboard((even.target as HTMLElement).textContent!, "text");
    Tips.show(LANG.copySuccess, Tips.TYPE.SUCCESS);
};
