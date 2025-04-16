import { GRID, VIDEO, MISSAV, JABLE } from "./utils/siteList";
import { mount, type Component } from "svelte";
import "./app.css";
import Grid from "./compoment/JavbusAndJavdb.svelte";
import GridMissav from "./compoment/Missav.svelte";
import GridJable from "./compoment/Jable.svelte";
import Magnet from "./compoment/common/Magnet.svelte";
import Modal from "./compoment/common/Modal.svelte";
import Page from "./utils/page";

function render(GridCompoment: Component) {
    if (Page.pageType == GRID) {
        const target = document.createElement("div");
        Page.rawGridEl!.insertAdjacentElement("afterend", target);
        mount(GridCompoment, { target });
    } else if (Page.pageType == VIDEO) {
        const AVID = location.pathname.split("/").filter(Boolean).slice(-1)[0];
        const modal = mount(Modal, { target: document.body });
        mount(Magnet, {
            target: Page.rawGridEl!,
            props: { AVID, modal },
        });
    }
}

function main() {
    const target = document.createElement("div");
    Page.rawGridEl!.style.display = "none";
    Page.rawGridEl!.insertAdjacentElement("beforebegin", target);
    mount(Grid, { target });
}
if (Page.name == MISSAV) {
    render(GridMissav);
} else if (Page.name == JABLE) {
    render(GridJable);
} else {
    main();
}
