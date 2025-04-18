<script lang="ts">
    import { mount } from "svelte";
    import Magnet from "./common/Magnet.svelte";
    import Modal from "./common/Modal.svelte";
    import Page from "../utils/page";

    function createObserverByConfig(config: Record<string, any>) {
        let { targetNode, domParse } = config;
        if (!targetNode) return;
        let callback = function (mutationsList: MutationRecord[]) {
            mutationsList.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    domParse(mutation.addedNodes);
                }
            });
        };
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, {
            childList: true,
        });
    }

    function parseItems(raw: NodeListOf<HTMLDivElement>) {
        for (let i = 0; i < raw.length; i++) {
            const el = raw[i];
            const imgBox = el.querySelector(".img-box a") as HTMLAnchorElement;
            const href = imgBox.href;
            const AVID = href.split("/").filter(Boolean).slice(-1)[0];
            mount(Magnet, {
                target: imgBox,
                props: { AVID, type: Page.pageType, modal },
            });
        }
        return raw;
    }
    function init() {
        let targetNode;
        if (location.pathname.includes("/my/")) {
            //收藏页面
            targetNode = document.body.querySelector("#site-content>.container");
        } else {
            targetNode = document.body.querySelector("#site-content");
        }
        const config_page_turn = {
            targetNode,
            domParse: (addedNodes: NodeList) => {
                addedNodes.forEach((addNode: Node) => {
                    if (/list_videos.*_videos/.test((addNode as HTMLElement).id)) {
                        requestAnimationFrame(() => {
                            parseItems(document.body.querySelectorAll(Page.itemSelector));
                        });
                    }
                });
            },
        };
        createObserverByConfig(config_page_turn);
    }

    const modal = mount(Modal, { target: document.body });
    //this.parseItems(Page.rawItemsEl as NodeListOf<HTMLDivElement>);
    init();
</script>
