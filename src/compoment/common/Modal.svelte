<script lang="ts">
    import { GM_addStyle } from "$";
    import { mount } from "svelte";
    import { JAVBUS } from "../../utils/siteList";
    import Page from "../../utils/page";

    let modalEl: HTMLDivElement;
    let isFirst = true;
    function creatEl(id: string, innerHTML = "") {
        const div = document.createElement("div");
        div.classList.add("modal-content-b");
        div.setAttribute("id", id);
        div.innerHTML = innerHTML;
        return div;
    }
    function append(id: string, content: string | Element[] | { props: any; component: any }) {
        if (isFirst) {
            isFirst = false;
            init();
        }
        let el;
        if (typeof content === "string") {
            el = creatEl(id, content);
        } else if (Array.isArray(content)) {
            el = creatEl(id);
            el.append(...content);
        } else if (content instanceof Object && content.props) {
            el = creatEl(id);
            mount(content.component, {
                target: el,
                props: content.props,
            });
        } else {
            throw new Error("content can't be parsed");
        }
        modalEl.querySelector("#modal-div")!.append(el);
        show();
    }
    function show(id?: string) {
        document.documentElement.classList.add("scrollBarHide");
        if (id) {
            modalEl.querySelector(`#${id}`)?.classList.remove("hidden-b");
        }
        modalEl.classList.remove("hidden-b");
        modalEl.focus();
        modalEl.scrollTop = 0;
    }
    function hide() {
        document.documentElement.classList.remove("scrollBarHide");
        modalEl.classList.add("hidden-b");
        modalEl.querySelectorAll(".modal-content-b").forEach(el => el.classList.add("hidden-b"));
    }
    function onclick(e: Event) {
        (e.target as HTMLElement).id === "myModal" && hide();
    }
    function onkeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            hide();
        }
    }
    function init() {
        setScrollBarWidth();
        //加载javbus的图片浏览插件
        if (Page.name == JAVBUS) {
            //@ts-ignore
            globalThis.$(modalEl).magnificPopup({
                delegate: "a.sample-box-zdy:visible",
                type: "image",
                closeOnContentClick: false,
                closeBtnInside: false,
                mainClass: "mfp-with-zoom mfp-img-mobile",
                image: { verticalFit: true },
                gallery: { enabled: true },
                zoom: {
                    enabled: true,
                    duration: 300,
                    opener: function (element: any) {
                        return element.find("img");
                    },
                },
            });
        }
    }
    //获取滚动条的宽度
    function setScrollBarWidth() {
        const el = document.createElement("p");
        Object.assign(el.style, { position: "absolute", top: "-1000px", width: "100px", height: "100px", overflowY: "scroll" });
        document.body.appendChild(el);
        const scrollBarWidth = el.offsetWidth - el.clientWidth;
        el.remove();
        GM_addStyle(`.scrollBarHide{ padding-right: ${scrollBarWidth}px;overflow:hidden;}`);
    }

    export { append, show };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
<div id="myModal" class="hidden-b" {onclick} {onkeydown} tabindex="-1" bind:this={modalEl}>
    <div id="modal-div"></div>
</div>

<style>
    #myModal {
        overflow-x: hidden;
        overflow-y: auto;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1050;
        background-color: rgba(0, 0, 0, 0.75);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #modal-div :global {
        position: relative;
        width: 80%;
        max-width: 1200px;
        animation: fadeInDown 0.5s ease-out;
        max-height: 100vh;

        .modal-content-b {
            background-color: rgba(0, 0, 0, 0.5);
            border-radius: 5px;
        }

        .sample-box-zdy,
        .avatar-box-zdy {
            display: inline-block;
            border-radius: 5px;
            background-color: #fff;
            text-align: center;
            margin: 0 5px 5px 0;
            width: 130px;
        }
        .sample-box-zdy {
            .photo-frame {
                overflow: hidden;
                margin: 5px;
            }
            img {
                height: 90px;
            }
        }
        .avatar-box-zdy {
            .photo-frame {
                overflow: hidden;
                height: 120px;
                margin: 5px;
            }
            img {
                height: 120px;
            }
            span {
                font-weight: bold;
                word-wrap: break-word;
                padding: 5px;
                line-height: 22px;
                color: #333;
            }
        }
        .javbus-table {
            width: 100%;
            background-color: #ffffff;
            border-radius: 5px;
            overflow: hidden;
            tr:hover {
                background-color: #d4d4d4 !important;
            }

            a.btn {
                color: #fff;
                padding: 2px 3px;
                white-space: nowrap;
                border-radius: 0.25rem;
                opacity: 0.65;
                &.btn-primary {
                    background-color: #007bff;
                }
                &.btn-warning {
                    background-color: #ffc107;
                }
            }
        }
    }

    @keyframes fadeInDown {
        0% {
            transform: translate3d(0, -50%, 0);
            opacity: 0;
        }
        100% {
            transform: none;
            opacity: 1;
        }
    }
</style>
