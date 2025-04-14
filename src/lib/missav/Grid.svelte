<script lang="ts">
    import { mount, tick } from "svelte";
    import MagnetMissav from "./Magnet.svelte";
    import Menu from "../Menu.svelte";
    import LoadMore from "../LoadMore.svelte";
    import Modal from "../Modal.svelte";
    import Page from "../../utils/page";
    import { config } from "../../utils/config.svelte";

    class Grid {
        lozad: any;
        constructor() {
            let items = this.itemsOperations.get(Page.rawItemsEl as NodeListOf<HTMLDivElement>);
            this.itemsOperations.filter(items);
            //@ts-ignore
            this.lozad = lozad(".lozad", {
                loaded: function (element: Element) {
                    element.classList.remove("lozad");
                },
            });
        }
        itemsOperations = {
            get: (raw: NodeListOf<HTMLDivElement>) => {
                for (let i = 0; i < raw.length; i++) {
                    const el = raw[i];
                    const AVID = el.querySelector("a")?.getAttribute("alt");
                    mount(MagnetMissav, {
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
                Page.renderEl!.append(...items);
                tick().then(() => {
                    this.lozad.observe();
                });
            },
        };
    }
    const modal = mount(Modal, { target: document.body }).modal;
    const grid = new Grid();
    mount(Menu, { target: document.body, props: { config } });
    let itemsOperations = grid.itemsOperations;
</script>

{#if config.autoPage}
    <LoadMore {itemsOperations} {config} />
{/if}
