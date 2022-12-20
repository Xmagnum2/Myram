import Sortable from "./sortable.core.esm.js";

const { BaseDirectory, readTextFile, writeTextFile } = window.__TAURI__.fs;

let form, input, todoList;
let append = (htmlStr, parentSelector) => {
  let tmpElem;

  if (typeof htmlStr !== "string" || typeof parentSelector !== "string" || document.querySelector(parentSelector).length === 0) return;

  tmpElem = document.createElement("div");
  tmpElem.innerHTML = htmlStr;

  return document.querySelector(parentSelector).appendChild(tmpElem.firstChild);
};

async function add(value) {
  if (!value) {
    return;
  }
  const added = append(`<div title="${value}" class="todo hover"><div class=todoHandle>::</div><form class=todoForm><input class=todoInput value="${value}"></input></form><button class=todoButton>Done</button></div>`, '#todoList')
  // new Drag(added);

  added.childNodes[1].childNodes[0].addEventListener("input", edit);
  added.childNodes[1].addEventListener("submit", (e) => { e.preventDefault(); e.target.childNodes[0].blur() });
  added.childNodes[2].addEventListener("click", done);
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
  form = document.querySelector("#form");
  input = document.querySelector("#input");
  todoList = document.querySelector("#todoList");
  await setup();
  new Sortable(todoList, {
    animation: 110,
    handle: ".todoHandle",
    forceFallback: true,
    onChoose: function (e) {
      document.querySelectorAll(".todo").forEach(e => e.classList.remove("hover"));
    },
    onEnd: function (e) {
      document.querySelectorAll(".todo").forEach(e => e.classList.add("hover"));
      save();
    }
  })
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await add(e.target.childNodes[1].value);
    input.value = "";
    input.focus();
  });
});

async function setup() {
  try {
    const content = await readTextFile("todo-list/storage.txt", {
      dir: BaseDirectory.LocalData,
    });
    content
      .split(" ")
      .map((e) => decodeURI(e))
      .forEach(add);
  } catch (e) {
    console.log(e);
  }
}

async function save() {
  try {
    await writeTextFile(
      "todo-list/storage.txt",
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