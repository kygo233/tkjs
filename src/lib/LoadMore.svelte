<script lang="ts">
    import { onDestroy } from "svelte";
    import LANG from "../utils/language";
    import { Page } from "../utils/page";

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
        <div class="scroll-load"><span></span><span></span><span></span><span></span></div>
    {:else if status == END}
        <h3 class="scroll-end">{LANG.autoPage_end}</h3>
    {:else if status == ERROR}
        <h3 class="scroll-error">error</h3>
    {/if}
</div>

<style>
    .scroll-status {
        text-align: center;
        span {
            display: inline-block;
            width: 12px;
            height: 12px;
            margin-right: 8px;
            border-radius: 50%;
            background: rgba(16, 19, 16, 0.7);
            animation: scroll-load 1s ease infinite;
        }
    }
    @keyframes scroll-load {
        0%,
        100% {
            transform: scale(1);
        }
        50% {
            transform: scale(0);
        }
    }
    .scroll-load {
        span:nth-child(2) {
            animation-delay: 0.125s;
        }
        span:nth-child(3) {
            animation-delay: 0.25s;
        }
        span:nth-child(4) {
            animation-delay: 0.375s;
        }
    }
</style>
