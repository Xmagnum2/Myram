import Sortable from "./sortable.core.esm.js";
const { BaseDirectory, readTextFile, writeTextFile, exists, createDir } = window.__TAURI__.fs;

let input, todoList;

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
  e.composedPath()[1].remove();
  await save();
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

window.addEventListener("DOMContentLoaded", async () => {
  var e = await exists("Myram", { dir: BaseDirectory.LocalData });
  if (!e) await createDir("Myram", { dir: BaseDirectory.LocalData, recursive: true });

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
  document.querySelector("#form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await add(e.target.childNodes[1].value);
    input.value = "";
    input.focus();
  });
});

function createTodoElement(value) {
  const tempElm = document.createElement("div");
  tempElm.innerHTML = `<div title="${value}" class="todo hover"><div class=todoHandle>::</div><form class=todoForm><input class=todoInput value="${value}"></input></form><button class=todoButton>Done</button></div>`;
  tempElm.firstChild.childNodes[1].childNodes[0].addEventListener("input", edit);
  tempElm.firstChild.childNodes[1].addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.childNodes[0].blur();
  });
  tempElm.firstChild.childNodes[2].addEventListener("click", done);
  return tempElm.firstChild;
}
