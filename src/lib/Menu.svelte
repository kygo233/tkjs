<script lang="ts">
    import { GM_setValue } from "$";
    import LANG from "../utils/language";
    import Page from "../utils/page";
    import { JAVFREE, BLOGJAV, JAVBUS, JAVDB } from "../utils/siteList";

    interface Checkboxs {
        key: string;
        text: string;
        disabled: boolean;
    }
    let { config, isHalfImgBlock = false } = $props();
    let isVisible = $state(false);

    let checkboxsList = $state<Checkboxs[]>([]);

    for (const [key, value] of Object.entries(Page.defaultConfig!)) {
        if (typeof value === "boolean") {
            checkboxsList.push({
                key,
                text: LANG[`menu_${key}`],
                disabled: key === "halfImg" && isHalfImgBlock,
            });
        }
    }
    $effect(() => {
        GM_setValue(Page.configValueName!, config);
    });
</script>

<div class="menu-b">
    <!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
    <div class={["menu-tool", isVisible && "menu-tool-opacity"]} onclick={() => (isVisible = !isVisible)}>&#x1F528;</div>
    <div class={["menu-list", !isVisible && "hidden-b"]}>
        {#each checkboxsList as { key, text, disabled }}
            <div class="checkbox-div">
                <input type="checkbox" {disabled} id={key + "_checkbox"} bind:checked={config[key]} />
                <label for={key + "_checkbox"}>{text}</label>
            </div>
        {/each}
        {#if Page.name == JAVBUS || Page.name == JAVDB}
            {@render others()}
        {/if}
    </div>
</div>

{#snippet others()}
    {#if config.halfImg}
        <div class="range-div">
            <input type="range" disabled={config.autoColumn || isHalfImgBlock} bind:value={config.columnNumHalf} min="1" max="8" step="1" />
            <span>{config.columnNumHalf}</span>
        </div>
    {:else}
        <div class="range-div">
            <input type="range" disabled={config.autoColumn} bind:value={config.columnNumFull} min="1" max="8" step="1" />
            <span>{config.columnNumFull}</span>
        </div>
    {/if}
    <div class="input-div">
        <span>{LANG.menu_linkUrl}</span>
        <input bind:value={config.linkUrl} />
    </div>
    <div class="radio-div">
        <span>{LANG.menu_previewSite}</span>&nbsp;
        <input type="radio" id={JAVFREE + "_radio"} bind:group={config.previewSite} value={JAVFREE} />
        <label for={JAVFREE + "_radio"}>javfree.me</label>
        <input type="radio" id={BLOGJAV + "_radio"} bind:group={config.previewSite} value={BLOGJAV} />
        <label for={BLOGJAV + "_radio"}>blogjav.net</label>
    </div>
{/snippet}

<style>
    .menu-b {
        position: fixed;
        z-index: 1030;
        left: 0;
        top: 0;
        display: flex;
        flex-direction: column;

        .menu-tool {
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-size: 20px;
            opacity: 0;

            &:hover {
                opacity: 1;
            }
            &.menu-tool-opacity {
                opacity: 1;
            }
        }
    }

    .menu-list {
        padding: 6px;
        background: linear-gradient(to left top, #f3fef4 0%, #fbfbfb 100%);
        color: black;
        border-radius: 5px;
        font-size: large;
        font-weight: 550;
        overflow: hidden;
        box-shadow: 0 10px 20px 0 rgb(0 0 0 / 50%);
        animation: fadeInUp 0.2s ease-out;

        > div {
            display: flex;
            align-items: center;
            padding: 5px;
            border-radius: 5px;

            &:hover {
                background-color: rgba(57, 86, 54, 0.214);
            }
        }

        input {
            margin: 0;
            padding: 0;
        }
        label {
            margin: 0;
            padding: 0 5px;
        }
        .checkbox-div {
            label {
                flex-grow: 1;
            }
        }
        .range-div input {
            width: 250px;
        }
        .input-div input {
            border-radius: 3px;
            border: 1px solid rgb(0, 0, 0, 0.5);
            padding: 3px;
            font-size: medium;
            flex-grow: 1;
            outline: none;
        }
        .radio-div {
            label {
                font-weight: initial;
            }
        }
    }
</style>
