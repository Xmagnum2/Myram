const { BaseDirectory, readTextFile, writeTextFile } = window.__TAURI__.fs;

let form, input, todoList;
var append = (htmlStr, parentSelector) => {
  var tmpElem;

  if (typeof htmlStr !== "string" || typeof parentSelector !== "string" || document.querySelector(parentSelector).length === 0) return;

  tmpElem = document.createElement("div");
  tmpElem.innerHTML = htmlStr;

  return document.querySelector(parentSelector).appendChild(tmpElem.firstChild);
};

async function add(value) {
  if (input.value === "" && value === undefined) {
    return;
  }
  if (value === undefined) value = input.value;
  const added = append(`<div title="${value}" class=todo><form class=todoForm><input class=todoInput value="${value}"></input></form><button class=todoButton>Done</button></div>`, "#todoList");
  added.childNodes[0].addEventListener("submit", (e) => {
    e.preventDefault();
    e.target.childNodes[0].blur();
  });
  added.childNodes[0].childNodes[0].addEventListener("input", edit);
  added.childNodes[1].addEventListener("click", done);
  input.value = "";
  input.focus();
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

window.addEventListener("DOMContentLoaded", async () => {
  form = document.querySelector("#form");
  input = document.querySelector("#input");
  todoList = document.querySelector("#todoList");
  await setup();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await add();
  });
});

async function setup() {
  try {
    const content = await readTextFile("storage.txt", {
      dir: BaseDirectory.Resource,
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
      "storage.txt",
      Array.from(todoList.children)
        .map((e) => encodeURI(e.title))
        .join(" "),
      {
        dir: BaseDirectory.Resource,
      }
    );
  } catch (e) {
    console.log(e);
  }
}
