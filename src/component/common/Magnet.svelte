<script lang="ts">
    import { asyncWithLoading, magnetSvg } from "../../utils";
    import getMagnet from "../../utils/magnet";
    import Page from "../../utils/page";
    import { GRID, VIDEO } from "../../utils/siteList";

    let { AVID, modal, config = {} } = $props();
    const id = "magnet" + Math.random().toString(16).slice(2);
    let loadState = $state({
        isLoading: false,
        isLoaded: false,
    });
    function showMagnet(event: Event) {
        event.preventDefault();
        if (loadState.isLoading) return;
        if (loadState.isLoaded) {
            modal.show(id);
            return;
        }
        asyncWithLoading(async () => {
            const content = await getMagnet[Page.name](AVID);
            modal.append(id, content);
            loadState.isLoaded = true;
        }, loadState);
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
{#if Page.pageType == GRID}
    <span class={["magnet-grid", loadState.isLoading && "span-loading", config.toolbar === false && "hidden-b"]} onclick={showMagnet}>{@html magnetSvg}</span>
{:else if Page.pageType == VIDEO}
    <span class={["magnet-video", loadState.isLoading && "span-loading"]} onclick={event => showMagnet(event)}>{@html magnetSvg}</span>
{/if}

<style>
    .magnet-grid {
        opacity: 0;
        border-radius: 5px;
        color: rgb(229, 233, 240);
        padding: 5px;
        cursor: pointer;
        :global(svg) {
            width: 22px;
            height: 22px;
        }

        &:hover {
            opacity: 1;
        }
        :global {
            body[missav] & {
                width: initial;
                height: initial;
                bottom: initial;
                left: initial;
                right: 5px;
                top: 5px;
                background-color: rgba(31, 41, 55, 0.75);
            }
            body[av123] & {
                position: absolute;
                right: 10px;
                top: 10px;
                background-color: rgba(0, 0, 0, 0.4);
            }
            body[jable] & {
                position: absolute;
                right: 15px;
                top: 5px;
                z-index: 100;
                background-color: rgba(0, 0, 0, 0.5);
            }
        }
    }
    .magnet-video {
        color: rgb(236, 239, 244);
        cursor: pointer;

        :global {
            body[av123] & {
                margin-left: 10px;
            }
        }
    }
    span.span-loading {
        opacity: 1;
        animation: span-loading 1s infinite;
    }
</style>
