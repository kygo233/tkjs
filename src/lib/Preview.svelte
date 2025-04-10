<script lang="ts">
    import { asyncWithLoading, getDownload, downloadSvg } from "../utils";
    import LANG from "../utils/language";
    import { getPreviewUrl } from "../utils/preview";

    let props = $props();
    let results = $state(props.results);
    let current = $state(0);
    let downloadStatus = $state({ isLoading: false });

    const showImage = (index: number) => {
        const item = results[index];
        current = index;
        if (item.isLoading || item.src != undefined) {
            return;
        } else {
            asyncWithLoading(async () => {
                item.src = await getPreviewUrl(item.href);
            }, item);
        }
    };
    const download = () => {
        const src = results[current].src;
        if (downloadStatus.isLoading || !src) return;
        asyncWithLoading(async () => {
            for (let index = 0; index < src.length; index++) {
                await getDownload(src[index]);
            }
        }, downloadStatus);
    };
</script>

<!-- svelte-ignore a11y_missing_attribute,a11y_click_events_have_key_events,a11y_no_static_element_interactions,a11y_no_noninteractive_element_interactions -->
<div class="preview-panel">
    <ul class="preview-title-ul">
        {#each results as item, index}
            <li class={["preview-title", current === index && "preview-title-current", item.isLoading && "preview-title-loading"]} onclick={() => showImage(index)}>{item.title}</li>
        {/each}
    </ul>
    <span onclick={download} class={["preview-dwonload", downloadStatus.isLoading && "span-loading"]}>{@html downloadSvg}</span>
    {#each results as item, index}
        {#if current == index}
            <div>
                {#if item.src === null}
                    <span style="background-color:white;">{LANG.preview_none}</span>
                {:else if item.src}
                    {#each item.src as src}
                        <img {src} class={["preview-img", item.zoom && "img-zoom"]} onclick={() => (item.zoom = !item.zoom)} />
                    {/each}
                {/if}
            </div>
        {/if}
    {/each}
</div>

<style>
    .preview-panel {
        min-height: 100vh;

        ul.preview-title-ul {
            margin: 0;
            padding: 10px 10px 10px 40px;
            list-style-type: disc;
        }

        .preview-dwonload {
            position: absolute;
            border-radius: 3px;
            padding: 3px;
            right: 0;
            z-index: 2;
            cursor: pointer;
            background-color: #3333338d;
            color: aliceblue;
            :global(> svg) {
                width: 30px;
                height: 30px;
                vertical-align: middle;
            }
            &.span-loading {
                animation: span-loading 1s infinite;
            }
        }

        .preview-title {
            color: rgb(255, 255, 255, 50%);
            font-size: 20px;
            cursor: pointer;
        }
        .preview-title-current {
            color: white;
        }
        .preview-title-loading {
            animation: changeTextColor 1s ease-in infinite;
        }

        .preview-img {
            width: 100%;
            cursor: zoom-in;

            &.img-zoom {
                max-width: 120%;
                width: 120%;
                margin: 0 -10%;
                cursor: zoom-out;
            }
        }
    }

    @keyframes changeTextColor {
        0%,
        100% {
            color: rgba(255, 255, 255, 1);
        }
        50% {
            color: rgba(255, 255, 255, 0.5);
        }
    }
</style>
