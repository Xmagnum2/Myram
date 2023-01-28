import Sortable, { AutoScroll } from "./sortable.core.esm.js";
const { BaseDirectory, readTextFile, writeTextFile, exists, createDir } = window.__TAURI__.fs;
const { register } = window.__TAURI__.globalShortcut;
const { appWindow, WebviewWindowHandle } = window.__TAURI__.window;
const { WINDOW_CLOSE_REQUESTED } = window.__TAURI__.event.TauriEvent;

let input, todoList, minimizeToggle;

async function add(value) {
  if (!value) return;

  const todoElement = createTodoElement(value);
  document.querySelector("#todoList").prepend(todoElement);

  await save();
}

async function edit(e) {
  e.composedPath()[2].title = e.target.value;
  await save();
}
async function done(e) {
  const value = e.composedPath()[1].title;
  e.composedPath()[1].remove();
  await save();
  await setHistory(value);
  if (historyToggle) {
    document.querySelector("#historyContent").SetHTML(`<p title=${value}>${value}</p>`);
  }
}

async function save() {
  try {
    await writeTextFile(
      "Myram/storage.txt",
      Array.from(todoList.children)
        .map((e) => encodeURI(e.title))
        .join(" "),
      {
        dir: BaseDirectory.LocalData,
      }
    );
  } catch (e) {
    console.log(e);
  }
}

async function getHistory() {
  try {
    const data = await readTextFile("Myram/history.txt", {
      dir: BaseDirectory.LocalData,
    });
    const history = data.split(" ");
    if (history.shift() != new Date().getDate()) {
      return [];
    }
    return history.map((e) => decodeURI(e));
  } catch (e) {
    console.log(e);
    return [];
  }
}

async function setHistory(value) {
  try {
    const history = await getHistory();
    history.push(value);
    history.unshift(new Date().getDate());
    await writeTextFile("Myram/history.txt", history.map((e) => encodeURI(e)).join(" "), {
      dir: BaseDirectory.LocalData,
    });
  } catch (e) {
    console.log(e);
  }
}

window.addEventListener("DOMContentLoaded", async () => {
  const existMyramDir = await exists("Myram", { dir: BaseDirectory.LocalData });
  if (!existMyramDir) await createDir("Myram", { dir: BaseDirectory.LocalData, recursive: true });

  input = document.querySelector("#input");
  todoList = document.querySelector("#todoList");

  try {
    const content = await readTextFile("Myram/storage.txt", {
      dir: BaseDirectory.LocalData,
    });
    content
      .split(" ")
      .reverse()
      .map((e) => decodeURI(e))
      .forEach(add);
  } catch (e) {
    console.log(e);
  }
  Sortable.mount(new AutoScroll());
  new Sortable(todoList, {
    animation: 110,
    handle: ".todoHandle",
    forceFallback: true,
    onChoose: (e) => {
      document.querySelectorAll(".todo").forEach((e) => e.classList.remove("hover"));
    },
    onEnd: async (e) => {
      document.querySelectorAll(".todo").forEach((e) => e.classList.add("hover"));
      await save();
    },
  });

  const history = await getHistory();
  document.querySelector("#historyContent").innerHTML = history.map((e) => `<p title=${e}>${e}</p>`).join("");

  document.querySelector("#history").addEventListener("click", async (e) => {
    if (e.target.innerText === "History") {
      e.target.innerText = "Close";
      document.querySelector("#historyContent").classList.add("active");

      document.querySelector("#option").innerText = "Option";
      document.querySelector("#optionContent").classList.remove("active");
    } else {
      e.target.innerText = "History";
      document.querySelector("#historyContent").classList.remove("active");
    }
  });

  document.querySelector("#option").addEventListener("click", async (e) => {
    if (e.target.innerText === "Option") {
      e.target.innerText = "Close";

      document.querySelector("#history").innerText = "History";
      document.querySelector("#historyContent").classList.remove("active");

      document.querySelector("#optionContent").classList.add("active");
    } else {
      e.target.innerText = "Option";
      document.querySelector("#optionContent").classList.remove("active");
    }
  });

  document.querySelector("#form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await add(e.target.childNodes[1].value);
    input.value = "";
    input.focus();
  });

  await appWindow.onFocusChanged(({ payload: focused }) => (focused ? undefined : input.blur()));

  var a = new WebviewWindowHandle();
  a._handleTauriEvent(WINDOW_CLOSE_REQUESTED, ({ event, payload }) => {
    console.log(event, payload);
    setTimeout(function () {
      console.log("I am the third log after 5 seconds");
    }, 6000);
  });

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

function createTodoElement(value) {
  const tempElm = document.createElement("div");
  tempElm.innerHTML = `<div title="${value}" class="todo"><div class=todoHandle>::</div><form class=todoForm><input class=todoInput value="${value}"></input></form><button class=todoButton>Done</button></div>`;
  tempElm.firstChild.childNodes[1].childNodes[0].addEventListener("input", edit);
  tempElm.firstChild.childNodes[1].addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.childNodes[0].blur();
  });
  tempElm.firstChild.childNodes[2].addEventListener("click", done);
  return tempElm.firstChild;
}
