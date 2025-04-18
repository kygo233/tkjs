import { GRID, VIDEO, MISSAV, JABLE, AV123, JAVBUS, JAVDB } from "./utils/siteList";
import { mount, type Component } from "svelte";
import "./app.css";
import Grid from "./component/JavbusAndJavdb.svelte";
import Missav from "./component/Missav.svelte";
import Jable from "./component/Jable.svelte";
import Av123 from "./component/Av123.svelte";
import Magnet from "./component/common/Magnet.svelte";
import Modal from "./component/common/Modal.svelte";
import Page from "./utils/page";

function render(GridComponent: Component) {
    if (Page.pageType == GRID) {
        const target = document.createElement("div");
        Page.rawGridEl!.insertAdjacentElement("afterend", target);
        mount(GridComponent, { target });
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

const pageComponentMap: Record<string, Component> = {
    [MISSAV]: Missav,
    [AV123]: Av123,
    [JABLE]: Jable,
    [JAVBUS]: Grid,
    [JAVDB]: Grid,
};
if (pageComponentMap[Page.name]) {
    if (Page.name === JAVBUS || Page.name === JAVDB) {
        main();
    } else {
        render(pageComponentMap[Page.name]);
    }
}
