<script lang="ts">
    import { mount, tick } from "svelte";
    import Magnet from "./common/Magnet.svelte";
    import Menu from "./common/Menu.svelte";
    import LoadMore from "./common/LoadMore.svelte";
    import Modal from "./common/Modal.svelte";
    import Page from "../utils/page";
    import config from "../utils/config.svelte";

    let lozadObj: any;
    function init() {
        let items = itemsOperations.get(Page.rawItemsEl as NodeListOf<HTMLDivElement>);
        itemsOperations.filter(items);
        //@ts-ignore
        lozadObj = lozad(".lozad", {
            loaded: function (element: Element) {
                element.classList.remove("lozad");
            },
        });
    }
    const itemsOperations = {
        get: (raw: NodeListOf<HTMLDivElement>) => {
            for (let i = 0; i < raw.length; i++) {
                const el = raw[i];
                const AVID = el.querySelector("a")?.getAttribute("alt");
                mount(Magnet, {
                    target: el.querySelector("div.thumbnail>div:first-child")!,
                    props: { AVID, type: Page.pageType, modal, config },
                });
            }
            return raw;
        },
        filter: (items: NodeListOf<HTMLDivElement>) => {
            if (config.uncensoredFilter) {
                items.forEach(element => {
                    let el = element.querySelector("a[alt$=uncensored-leak]");
                    if (el) {
                        element.style.display = "none";
                    }
                });
            }
        },
        update: (items: NodeListOf<HTMLDivElement>) => {
            Page.rawGridEl!.append(...Array.from(items));
            tick().then(() => {
                lozadObj.observe();
            });
        },
    };
    const modal = mount(Modal, { target: document.body });
    init();
    mount(Menu, { target: document.body, props: { config } });
</script>

{#if config.autoPage}
    <LoadMore {itemsOperations} {config} />
{/if}
