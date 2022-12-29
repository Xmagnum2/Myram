import Sortable from "./sortable.core.esm.js";

const { BaseDirectory, readTextFile, writeTextFile } = window.__TAURI__.fs;

let input, todoList;

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

async function add(value) {
  if (!value) return;

  const todoElement = createTodoElement(value);
  document.querySelector("#todoList").prepend(todoElement);

  save();
}

async function edit(e) {
  e.composedPath()[2].title = e.target.value;
  await save();
}

async function done(e) {
  e.composedPath()[1].remove();
  await save();
}

window.addEventListener("DOMContentLoaded", async () => {
  input = document.querySelector("#input");
  todoList = document.querySelector("#todoList");
  await setup();
  new Sortable(todoList, {
    animation: 110,
    handle: ".todoHandle",
    forceFallback: true,
    onChoose: function (e) {
      document.querySelectorAll(".todo").forEach((e) => e.classList.remove("hover"));
    },
    onEnd: function (e) {
      document.querySelectorAll(".todo").forEach((e) => e.classList.add("hover"));
      save();
    },
  });
  document.querySelector("#form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await add(e.target.childNodes[1].value);
    input.value = "";
    input.focus();
  });
});

async function setup() {
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
