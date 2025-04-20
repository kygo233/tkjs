<script lang="ts">
    import config from "../utils/config.svelte";
    import { JAVBUS, JAVDB, type AvItem } from "../utils/siteList";
    import LazyLoad, { type ILazyLoadInstance } from "vanilla-lazyload";
    import { mount, tick } from "svelte";
    import { GM_addStyle } from "$";
    import Menu from "./common/Menu.svelte";
    import { getRequest, asyncWithLoading, magnetSvg, linkSvg, pictureSvg, clickToCopy } from "../utils/index";
    import getMagnet from "../utils/magnet";
    import LoadMore from "./common/LoadMore.svelte";
    import Preview from "./common/Preview.svelte";
    import LANG from "../utils/language";
    import Modal from "./common/Modal.svelte";
    import { setSearchOptions, getPreviewSearchResult } from "../utils/preview";
    import Page from "../utils/page";

    let gridEL: HTMLElement;
    const isHalfImgBlock = Boolean(Page.halfImgBlockPages?.find(page => location.href.includes(page)));
    let isFullImg = $derived(isHalfImgBlock || !config.halfImg);
    let windowWidth = $state(window.innerWidth);
    let AvItems: Array<AvItem> = $state([]);
    let lazyLoad: ILazyLoadInstance;

    function init() {
        lazyLoad = new LazyLoad({
            callback_loaded: img => imgResize(img as HTMLImageElement),
        });
        itemsOperations.update(itemsOperations.get(Page.rawItemsEl!));
        watchConfig();
        window.addEventListener("resize", () => {
            windowWidth = window.innerWidth;
        });
    }
    const itemsOperations = {
        get: (raw: NodeListOf<Element>): Array<AvItem> => {
            return Array.from(raw).map(el => Page.getAvItem!(el) as AvItem);
        },
        filter: (items: Array<AvItem>) => {
            if (Page.name == JAVBUS && location.pathname.includes("/star/") && items) {
                items.splice(0, 1);
            }
        },
        update: (items: Array<AvItem>) => {
            AvItems.push(...items);
            tick().then(() => {
                lazyLoad.update();
            });
        },
    };
    function handleClick(event: Event, item: AvItem) {
        event.preventDefault();
        const name = (event.target as Element).closest("span[data-name]")?.getAttribute("data-name");
        if (!name || !(name in toolbarFunc)) return;
        const loadingName = `${name}Loading`;
        const contentId = `${name}-${item.id}`;
        if (item[loadingName]) return;
        if (item.hasOwnProperty(contentId)) {
            modal.show(contentId);
            return;
        }
        asyncWithLoading(
            async () => {
                const toolbarMethod = toolbarFunc[name as keyof typeof toolbarFunc];
                if (!toolbarMethod) return;
                const content = await toolbarMethod(item);
                if (content) {
                    modal.append(contentId, content);
                    item[contentId] = contentId;
                }
            },
            item,
            loadingName,
        );
    }
    const toolbarFunc = {
        magnet: async (item: AvItem) => {
            return await getMagnet[Page.name](item as AvItem & string);
        },
        preview: async (item: AvItem) => {
            const results = await getPreviewSearchResult(item.AVID);
            return {
                component: Preview,
                props: {
                    results,
                },
            };
        },
        link: async (item: AvItem) => {
            new URL(config.linkUrl);
            if (!config.linkUrl.endsWith("/")) {
                config.linkUrl += "/";
            }
            const url = `${config.linkUrl}${item.AVID}`;
            await getRequest(url, { method: "HEAD" });
            window.open(url, "_blank");
        },
    };
    function imgResize(img: HTMLImageElement) {
        const imgRatio = img.naturalHeight / img.naturalWidth;
        if (imgRatio > 0.8) {
            if (isFullImg) {
                img.style = "object-fit: contain;";
            } else {
                if (imgRatio < 1.3) {
                    img.style = "object-position: bottom;object-fit:contain";
                } else {
                    img.style = "object-position: center;object-fit:cover";
                }
            }
        }
    }
    function watchConfig() {
        let isFirst = true;
        $effect(() => {
            config.halfImg;
            if (isFirst) {
                isFirst = false;
                return;
            }
            gridEL.querySelectorAll(".box-b img.loaded").forEach(element => {
                imgResize(element as HTMLImageElement);
            });
        });
    }

    const setcolumnNum = () => {
        let columnNum;
        if (config.autoColumn) {
            columnNum = Math.round(windowWidth / (isFullImg ? 500 : 350));
        } else {
            columnNum = isFullImg ? config.columnNumFull : config.columnNumHalf;
        }
        GM_addStyle(`#grid-b .item-b{ width:${100 / columnNum}%; }`);
    };

    if (Page.name == JAVDB) {
        $effect.pre(() => {
            const el = document.body.querySelector(".section .container")!;
            if (config.maxWidth) {
                el.classList.add("max-width-100");
            } else {
                el.classList.remove("max-width-100");
            }
        });
    }

    $effect.pre(() => {
        setcolumnNum();
    });
    init();
    mount(Menu, { target: document.body, props: { config, isHalfImgBlock } });
    const modal = mount(Modal, { target: document.body });

    $effect.pre(() => {
        setSearchOptions(config.previewSite);
    });
</script>

{#snippet toolbar(item: AvItem)}
    <!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
    <div class="toolbar-b" onclick={event => handleClick(event, item)}>
        <span data-name="magnet" class={{ "span-loading": item.magnetLoading }} title={LANG.tip_magnet}>{@html magnetSvg}</span>
        <span data-name="preview" class={{ "span-loading": item.previewLoading }} title={LANG.tip_preview}>{@html pictureSvg}</span>
        <span data-name="link" class={{ "span-loading": item.linkLoading }} title={LANG.tip_link}>{@html linkSvg}</span>
    </div>
{/snippet}
<!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
{#snippet box(item: AvItem)}
    <a class="box-b" href={item.href} target={config.newWindow ? "_blank" : "_self"}>
        <div class="cover-b">
            <!-- svelte-ignore a11y_missing_attribute -->
            <img class="lazy" data-src={item.src} />
            {#if config.toolbar && config.autoHide}
                {@render toolbar(item)}
            {/if}
        </div>
        <div class="detail-b">
            <div class={["detail-title", !config.fullTitle && "titleNowrap"]} onclick={config.clickToCopy ? event => clickToCopy(event) : undefined}>{item.title}</div>
            <div class="info-bottom">
                <div class="avid-box">
                    <span class="detail-avid" onclick={config.clickToCopy ? event => clickToCopy(event) : undefined}>{item.AVID}</span>
                    <span> / <span>{item.date}</span></span>
                </div>
                {#if Page.name == JAVDB}
                    <div class="score">{@html item.score}</div>
                {/if}
                <div class="tag-box">
                    <div class="item-tag">{@html item.itemTag}</div>
                    {#if config.toolbar && !config.autoHide}
                        {@render toolbar(item)}
                    {/if}
                </div>
            </div>
        </div>
    </a>
{/snippet}

<div id="grid-b" class={isFullImg ? "full-b" : "half-b"} bind:this={gridEL}>
    {#each AvItems as item, index (index)}
        <div class="item-b">
            {#if item.AVID}
                {@render box(item)}
            {:else}
                <div>{@html item.html}</div>
            {/if}
        </div>
    {/each}
</div>
{#if config.autoPage}
    <LoadMore {itemsOperations} {config} />
{/if}

<style>
    #grid-b {
        display: flex;
        flex-wrap: wrap;

        .item-b {
            padding: 5px;
            transition: width 0.5s;
            animation: fadeInUp 0.5s ease-out;

            :global(.avatar-box) :global {
                display: flex;
                flex-direction: column;
                border-radius: 5px;
                align-items: center;
                width: 100%;
                margin: 0;

                .photo-frame {
                    margin: 5px;
                }
                p {
                    margin: 0 !important;
                }
            }
        }

        .box-b {
            display: block;
            border-radius: 5px;
            background-color: white;
            border: 1px solid rgba(0, 0, 0, 0.2);
            box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1);
            overflow: hidden;
            color: black;

            &:visited {
                color: gray;
            }
        }

        .cover-b {
            position: relative;

            img {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            img:not([src]) {
                visibility: hidden;
            }
            :global(img.lazy.error) {
                width: auto;
            }
        }

        .detail-b {
            padding: 6px 8px;

            .info-bottom,
            .tag-box {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
            }

            .tag-box:has(.toolbar-b) {
                flex-grow: 1;
            }
            .avid-box,
            .score {
                margin-right: 5px;
            }
            .detail-title,
            .detail-avid {
                &:hover {
                    text-decoration: underline;
                }
            }

            .detail-avid {
                font-size: 18px;
            }
            .titleNowrap {
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }
    }

    #grid-b.full-b {
        .cover-b {
            padding-top: 67.25%;
        }
    }
    #grid-b.half-b {
        .cover-b {
            padding-top: 142.57%;
            img {
                object-position: right;
            }
        }
    }

    .toolbar-b {
        display: flex;

        .cover-b & {
            position: absolute;
            bottom: 0px;
            right: 0px;
            padding: 6px;
            opacity: 0;
            &:hover {
                opacity: 1;
                animation: fadeInUp 0.5s ease-out;
            }

            &:has(span.span-loading) {
                opacity: 1;
            }

            span {
                padding: 3px;
                border-radius: 5px;
                color: black;
                background-color: #b5fffc;
            }
        }

        .tag-box & {
            opacity: 0.75;
        }

        span {
            line-height: 0;
            margin: 0 2px;
            &:hover {
                transform: scale(1.1);
            }

            :global(svg) {
                vertical-align: -3px;
                width: 22px;
                height: 22px;
            }
            &[data-name="preview"] {
                :global(svg) {
                    width: 23.5px;
                    height: 23.5px;
                }
            }

            &.span-loading {
                animation: span-loading 1s infinite;
            }
        }
    }

    @keyframes -global-span-loading {
        0%,
        100% {
            transform: none;
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
        }
        50% {
            transform: translateY(-15%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
        }
    }

    @keyframes -global-fadeInUp {
        0% {
            transform: translate3d(0, 5%, 0);
            opacity: 0.5;
        }
        100% {
            transform: none;
            opacity: 1;
        }
    }
</style>
