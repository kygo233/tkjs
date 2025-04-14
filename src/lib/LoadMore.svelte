<script lang="ts">
    import { onDestroy } from "svelte";
    import LANG from "../utils/language";
    import Page from "../utils/page";

    let { itemsOperations, config } = $props();
    let status = $state("");

    const [LOAD, ERROR, END] = ["1", "2", "3"];
    class LoadMore {
        grid = Page.renderEl!;
        locked = false;
        nextURL;
        domWatchFuc;
        constructor() {
            this.nextURL = document.body.querySelector(Page.pageNext)?.getAttribute("href");
            if (this.nextURL) {
                this.domWatchFuc = this.domWatch.bind(this);
                this.addListener();
            }
        }
        destroy() {
            this.removeListener();
        }
        addListener() {
            document.addEventListener("scroll", this.domWatchFuc as EventListener);
            history.scrollRestoration = "manual"; // 防止自动恢复页面位置
        }
        removeListener() {
            document.removeEventListener("scroll", this.domWatchFuc as EventListener);
            history.scrollRestoration = "auto";
        }
        domWatch() {
            if (this.grid.getBoundingClientRect().bottom - window.innerHeight < 300 && !this.locked && this.nextURL) {
                this.locked = true;
                this.loadNextPage(this.nextURL).then(() => {
                    this.locked = false;
                });
            }
        }
        async loadNextPage(url: string) {
            try {
                console.log(url);
                status = LOAD;
                let responseText = await fetch(url, { credentials: "same-origin" }).then(response => response.text());
                let doc = new DOMParser().parseFromString(responseText, "text/html");
                let items = itemsOperations.get(doc.body.querySelectorAll(Page.itemSelector));
                itemsOperations.filter(items);
                itemsOperations.update(items);
                config.pageHistory && history.pushState({}, "", url);
                this.nextURL = doc.body.querySelector(Page.pageNext)?.getAttribute("href");
                status = this.nextURL ? "" : END;
            } catch (error) {
                console.log(error);
                status = ERROR;
            }
        }
    }

    const loadMore = new LoadMore();
    onDestroy(() => {
        loadMore.destroy();
    });
</script>

<div class="scroll-status">
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
