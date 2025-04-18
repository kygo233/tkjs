<script lang="ts">
    let alert = $state({
        isVisible: false,
        massege: "",
        type: "",
        close: false,
    });

    const TYPE = {
        SUCCESS: "✔",
        ERROR: "❌",
    };

    export function show(msg: string, type: keyof typeof TYPE, close?: Boolean | string) {
        alert.massege = (TYPE[type] ?? "") + msg;
        if (!close) {
            alert.close = true;
            setTimeout(() => {
                alert.isVisible = false;
            }, 3000);
        }
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events,a11y_no_static_element_interactions -->
<div class="alert-zdy">
    {alert.massege}
    {#if alert.close}
        <div class="alert-close" onclick={() => (alert.isVisible = false)}>&#x2715;</div>
    {/if}
</div>

<style>
</style>
