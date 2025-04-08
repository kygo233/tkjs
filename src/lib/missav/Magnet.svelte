<script lang="ts">
    import { asyncWithLoading } from "../../utils";
    import { getMagnet } from "../../utils/magnet";
    import { GRID, magnetSvg, Page, VIDEO } from "../../utils/siteConfigs";

    let { AVID, modal, config = {} } = $props();
    const id = "magnet" + Math.random().toString(16).slice(2);
    let loadState = $state({
        isLoading: false,
        isLoaded: false,
    });
    function showMagnet() {
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
    <span class={["magnet-grid", loadState.isLoading && "span-loading", !config.toolbar && "hidden-b"]} onclick={showMagnet}>{@html magnetSvg}</span>
{:else if Page.pageType == VIDEO}
    <span class={["magnet-video", loadState.isLoading && "span-loading"]} onclick={showMagnet}>{@html magnetSvg}</span>
{/if}

<style>
    .magnet-grid {
        opacity: 0;
        border-radius: 5px;
        background-color: rgba(31, 41, 55, 0.75);
        color: rgb(229, 233, 240);
        padding: 5px;
        width: initial;
        height: initial;
        bottom: initial;
        left: initial;
        right: 5px;
        top: 5px;
        cursor: pointer;
        :global(svg) {
            width: 22px;
            height: 22px;
        }

        &:hover {
            opacity: 1;
        }
    }
    .magnet-video {
        color: rgb(236, 239, 244);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
    }
    span.span-loading {
        opacity: 1;
        animation: span-loading 1s infinite;
    }
</style>
