const { register } = window.__TAURI_PLUGIN_GLOBAL_SHORTCUT__;
const { getCurrentWindow } = window.__TAURI__.window;

let minimizeToggle = false;

window.addEventListener("DOMContentLoaded", async () => {
    const input = document.querySelector("#input");
    await getCurrentWindow().onFocusChanged(({ payload: focused }) => (focused ? undefined : input.blur()));

    await register("CommandOrControl+[", async () => {
        if (!minimizeToggle && input === document.activeElement) {
            await getCurrentWindow().minimize();
            minimizeToggle = true;
        } else {
            await getCurrentWindow().unminimize();
            minimizeToggle = false;
        }
        await getCurrentWindow().setFocus();
        input.focus();
    });
});
