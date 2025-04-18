<script lang="ts">
    import { mount, tick } from "svelte";
    import Magnet from "./common/Magnet.svelte";
    import Menu from "./common/Menu.svelte";
    import LoadMore from "./common/LoadMore.svelte";
    import Modal from "./common/Modal.svelte";
    import Page from "../utils/page";
    import config from "../utils/config.svelte";

    class Grid {
        lozad: any;
        constructor() {
            this.itemsOperations.get(Page.rawItemsEl as NodeListOf<HTMLDivElement>);
        }
        itemsOperations = {
            get: (raw: NodeListOf<HTMLDivElement>) => {
                for (let i = 0; i < raw.length; i++) {
                    const el = raw[i];
                    const AVID = el.querySelector("a[title]")?.getAttribute("href")!.replace(/^v\//, "");
                    mount(Magnet, {
                        target: el.querySelector("div.thumb")!,
                        props: { AVID, type: Page.pageType, modal, config },
                    });
                }
                return raw;
            },
            update: (items: NodeListOf<HTMLDivElement>) => {
                Page.rawGridEl!.append(...items);
                tick().then(() => {
                    this.lozad.observe();
                });
            },
        };
    }
    const modal = mount(Modal, { target: document.body });
    const grid = new Grid();
    mount(Menu, { target: document.body, props: { config } });
    let itemsOperations = grid.itemsOperations;
</script>

{#if config.autoPage}
    <LoadMore {itemsOperations} {config} />
{/if}
