<script lang="ts">
    import { onDestroy } from "svelte";
    import LANG from "../../utils/language";
    import Page from "../../utils/page";
    import { safeFetch } from "../../utils";

    const [LOAD, ERROR, END] = ["1", "2", "3"];
    let { itemsOperations, config } = $props();
    let status = $state("");
    let el: HTMLElement;
    let locked = false;
    let nextURL: string | null | undefined;
    function init() {
        nextURL = document.body.querySelector(Page.pageNext)?.getAttribute("href");
        nextURL && addListener();
    }
    function addListener() {
        document.addEventListener("scroll", domWatch);
        history.scrollRestoration = "manual"; // 防止自动恢复页面位置
    }
    function removeListener() {
        document.removeEventListener("scroll", domWatch);
        history.scrollRestoration = "auto";
    }
    function domWatch() {
        if (el.getBoundingClientRect().top - window.innerHeight < 300 && !locked && nextURL) {
            locked = true;
            loadNextPage(nextURL).then(() => {
                locked = false;
            });
        }
    }
    async function loadNextPage(url: string) {
        try {
            console.log(url);
            status = LOAD;
            let responseText = await safeFetch(url, { credentials: "same-origin" });
            let doc = new DOMParser().parseFromString(responseText, "text/html");
            let items = itemsOperations.get(doc.body.querySelectorAll(Page.itemSelector));
            itemsOperations.filter?.(items);
            itemsOperations.update(items);
            config.pageHistory && history.pushState({}, "", url);
            nextURL = doc.body.querySelector(Page.pageNext)?.getAttribute("href");
            status = nextURL ? "" : END;
        } catch (error) {
            console.log(error);
            status = ERROR;
        }
    }
    init();
    onDestroy(removeListener);
</script>

<div class="scroll-status" bind:this={el}>
    {#if status == LOAD}
        <div class="scroll-load"></div>
    {:else if status == END}
        <div class="scroll-end">{LANG.autoPage_end}</div>
    {:else if status == ERROR}
        <div class="scroll-error">error</div>
    {/if}
</div>

<style>
    .scroll-status {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 15px;
        font-size: 20px;
        .scroll-load {
            width: 100px;
            height: 5px;
            border-radius: 10px;
            background: currentColor;
            opacity: 0.5;
        }
    }
</style>
