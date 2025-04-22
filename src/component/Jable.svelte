<script lang="ts">
    import { mount } from "svelte";
    import Magnet from "./common/Magnet.svelte";
    import Modal from "./common/Modal.svelte";
    import Page from "../utils/page";

    function parseItems(raw: NodeListOf<HTMLDivElement>) {
        for (let i = 0; i < raw.length; i++) {
            const imgBox = raw[i].querySelector(".img-box a") as HTMLAnchorElement;
            const AVID = imgBox.href.split("/").filter(Boolean).slice(-1)[0];
            mount(Magnet, {
                target: imgBox,
                props: { AVID, type: Page.pageType, modal },
            });
        }
    }
    function creatObserver() {
        //收藏页面的选择器不一样
        const targetSelector = location.pathname.includes("/my/") ? "#site-content>.container" : "#site-content";
        const targetNode = document.body.querySelector(targetSelector);
        if (!targetNode) return;
        const callback = function (mutationsList: MutationRecord[]) {
            mutationsList.forEach(mutation => {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((addNode: Node) => {
                        if (/list_videos.*_videos/.test((addNode as HTMLElement).id)) {
                            requestAnimationFrame(() => {
                                parseItems(document.body.querySelectorAll(Page.itemSelector));
                            });
                        }
                    });
                }
            });
        };
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, {
            childList: true,
        });
    }

    const modal = mount(Modal, { target: document.body });
    parseItems(Page.rawItemsEl as NodeListOf<HTMLDivElement>);
    creatObserver();
</script>
