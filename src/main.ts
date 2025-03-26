import { Page } from "./utils/siteConfigs";
import { mount } from "svelte";
import "./app.css";
import Grid from "./lib/Grid.svelte";

const rawItemsEl = document.body.querySelectorAll(Page.itemSelector);
if (rawItemsEl.length < 1) throw new Error("No items found");
const rawGridEl = document.body.querySelector(Page.gridSelector) as HTMLElement;
const renderEl = document.createElement("div");
rawGridEl.style.display = "none";
rawGridEl.insertAdjacentElement("beforebegin", renderEl);

Object.assign(Page, {
    rawItemsEl,
    rawGridEl,
    renderEl,
});
const app = mount(Grid, {
    target: renderEl,
});
export default app;
