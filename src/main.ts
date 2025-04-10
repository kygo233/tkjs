import { GRID, VIDEO, MISSAV } from "./utils/siteList";
import { mount } from "svelte";
import "./app.css";
import Grid from "./lib/Grid.svelte";

import GridMissav from "./lib/missav/Grid.svelte";
import MagnetMissav from "./lib/missav/Magnet.svelte";
import Modal from "./lib/Modal.svelte";
import { Page } from "./utils/page";

function missav() {
    if (Page.pageType == GRID) {
        const rawGridEl = Page.rawItemsEl![0].parentElement!;
        const target = document.createElement("div");
        rawGridEl.insertAdjacentElement("afterend", target);
        Page.renderEl = rawGridEl;
        mount(GridMissav, { target });
    } else if (Page.pageType == VIDEO) {
        const target = Page.rawItemsEl![0].parentElement!;
        const AVID = location.pathname.split("/").slice(-1)[0];
        const modal = mount(Modal, { target: document.body }).modal;
        mount(MagnetMissav, {
            target,
            props: { AVID, modal },
        });
    }
}

function main() {
    const rawGridEl = Page.rawItemsEl![0].parentElement!;
    const target = document.createElement("div");
    rawGridEl.style.display = "none";
    rawGridEl.insertAdjacentElement("beforebegin", target);
    Page.renderEl = target;
    mount(Grid, { target });
}
if (Page.name == MISSAV) {
    missav();
} else {
    main();
}
