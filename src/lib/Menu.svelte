<script lang="ts">
    import { GM_setValue } from "$";
    import LANG from "../utils/language";
    import { Page, JAVDB, JAVFREE, BLOGJAV, defineConfig } from "../utils/siteConfigs";
    import { status } from "../utils/status.svelte";

    type ConfigKeys = keyof typeof defineConfig;
    type CheckboxItem = { text: string; disabled: boolean };
    type Checkboxs = Record<ConfigKeys, CheckboxItem>;

    let isVisible = $state(false);

    const config: Record<ConfigKeys, any> = status.config;
    let checkboxs = $state<Checkboxs>({} as Checkboxs);
    (Object.keys(defineConfig) as ConfigKeys[]).forEach(key => {
        if (typeof defineConfig[key] === "boolean") {
            if (key === "maxWidth" && Page.name !== JAVDB) return;
            checkboxs[key] = {
                text: LANG[`menu_${key}`],
                disabled: key === "halfImg" && status.isHalfImgBlock,
            };
        }
    });
    $effect(() => {
        GM_setValue("config", config);
    });
</script>

<div class="menu-b">
    <!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
    <div class={["menu-tool", isVisible && "menu-tool-opacity"]} onclick={() => (isVisible = !isVisible)}>&#x1F528;</div>
    <div class={["menu-list", !isVisible && "hidden-b"]}>
        {#each Object.entries(checkboxs) as [key, item]}
            <div class="checkbox-div">
                <input type="checkbox" disabled={item.disabled} id={key + "_checkbox"} bind:checked={config[key as ConfigKeys]} />
                <label for={key + "_checkbox"}>{item.text}</label>
            </div>
        {/each}

        {#if config.halfImg}
            <div class="range-div">
                <input type="range" disabled={config.autoColumn || status.isHalfImgBlock} bind:value={config.columnNumHalf} min="1" max="8" step="1" />
                <span>{config.columnNumHalf}</span>
            </div>
        {:else}
            <div class="range-div">
                <input type="range" disabled={config.autoColumn} bind:value={config.columnNumFull} min="1" max="8" step="1" />
                <span>{config.columnNumFull}</span>
            </div>
        {/if}
        <div class="input-div">
            <input bind:value={config.linkUrl} />
        </div>
        <div class="radio-div">
            <span>{LANG.menu_previewSite}</span>&nbsp;
            <input type="radio" id={JAVFREE + "_radio"} bind:group={config.previewSite} value={JAVFREE} />
            <label for={JAVFREE + "_radio"}>javfree.me</label>
            <input type="radio" id={BLOGJAV + "_radio"} bind:group={config.previewSite} value={BLOGJAV} />
            <label for={BLOGJAV + "_radio"}>blogjav.net</label>
        </div>
    </div>
</div>

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
        animation: fadeInUp 0.2s ease;

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
        }
        .radio-div {
            label {
                font-weight: initial;
            }
        }
    }
</style>
