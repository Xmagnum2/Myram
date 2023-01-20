const { appWindow } = window.__TAURI__.window;

document
  .getElementById('titlebar-minimize')
  .addEventListener('click', () => appWindow.minimize())
document
  .getElementById('titlebar-maximize')
  .addEventListener('click', () => appWindow.toggleMaximize())
document
  .getElementById('titlebar-close')
  .addEventListener('click', () => appWindow.minimize())

window.addEventListener("DOMContentLoaded", async () => {
  document.querySelector("#window").style.color = blackOrWhite(rgba2hex(getComputedStyle(document.querySelector("#window")).backgroundColor));
})

function blackOrWhite(hexcolor) {
  var r = parseInt(hexcolor.substr(1, 2), 16);
  var g = parseInt(hexcolor.substr(3, 2), 16);
  var b = parseInt(hexcolor.substr(5, 2), 16);
  return ((((r * 299) + (g * 587) + (b * 114)) / 1000) < 128) ? "white" : "black";
}

function rgba2hex(orig) {
  var rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    hex = rgb ?
      (rgb[1] | 1 << 8).toString(16).slice(1) +
      (rgb[2] | 1 << 8).toString(16).slice(1) +
      (rgb[3] | 1 << 8).toString(16).slice(1) : orig;

  return "#" + hex;
}