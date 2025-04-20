<script lang="ts">
    import { mount } from "svelte";
    import Magnet from "./common/Magnet.svelte";
    import Menu from "./common/Menu.svelte";
    import LoadMore from "./common/LoadMore.svelte";
    import Modal from "./common/Modal.svelte";
    import Page from "../utils/page";
    import config from "../utils/config.svelte";

    const itemsOperations = {
        get: (raw: NodeListOf<HTMLDivElement>) => {
            for (let i = 0; i < raw.length; i++) {
                const el = raw[i];
                const href = el.querySelector("a[title]")?.getAttribute("href")!;
                const AVID = href.split("/").filter(Boolean).slice(-1)[0];
                mount(Magnet, {
                    target: el.querySelector("div.thumb")!,
                    props: { AVID, type: Page.pageType, modal, config },
                });
            }
            return raw;
        },
        update: (items: NodeListOf<HTMLDivElement>) => {
            Page.rawGridEl!.append(...Array.from(items));
        },
    };
    const modal = mount(Modal, { target: document.body });
    itemsOperations.get(Page.rawItemsEl as NodeListOf<HTMLDivElement>);
    mount(Menu, { target: document.body, props: { config } });
</script>

{#if config.autoPage}
    <LoadMore {itemsOperations} {config} />
{/if}
