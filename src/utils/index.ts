import { GM_xmlhttpRequest, GM_download, type GmDownloadOptions } from "$";

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
                    onload: (r: any) => resolve(r),
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
