const { register } = window.__TAURI__.globalShortcut;
const { appWindow } = window.__TAURI__.window;

let minimizeToggle = false;

window.addEventListener("DOMContentLoaded", async () => {
  const input = document.querySelector("#input");
  await appWindow.onFocusChanged(({ payload: focused }) => (focused ? undefined : input.blur()));

  await register("CommandOrControl+[", async () => {
    if (!minimizeToggle && input === document.activeElement) {
      await appWindow.minimize();
      minimizeToggle = true;
    } else {
      await appWindow.unminimize();
      minimizeToggle = false;
    }
    await appWindow.setFocus();
    input.focus();
  });
});



