const { BaseDirectory, readTextFile, writeTextFile } = window.__TAURI__.fs;

let form, input, todoList;
var append = function (htmlStr, parentSelector) {
  var tmpElem;

  if (typeof htmlStr !== 'string' ||
    typeof parentSelector !== 'string' ||
    document.querySelector(parentSelector).length === 0) return;

  tmpElem = document.createElement('div');
  tmpElem.innerHTML = htmlStr;

  return document.querySelector(parentSelector).appendChild(tmpElem.firstChild);
};

async function add(value) {
  if (input.value === "" && value === undefined) {
    return
  }
  if (value === undefined) value = input.value;
  const added = append(`<div title="${value}" class=todo><form class=todoForm><input class=todoInput value="${value}"></input></form><button class=todoButton>Done</button></div>`, '#todoList')
  added.childNodes[0].addEventListener("submit", (e) => { e.preventDefault(); e.target.childNodes[0].blur() });
  added.childNodes[0].childNodes[0].addEventListener("input", edit);
  added.childNodes[1].addEventListener("click", done);
  input.value = ""
  input.focus();
  save();
}

async function edit(e) {
  e.path[2].title = e.target.value;
  save();
}

async function done(e) {
  e.path[1].remove();
  save();
}

window.addEventListener("DOMContentLoaded", () => {
  form = document.querySelector("#form");
  input = document.querySelector("#input");
  todoList = document.querySelector("#todoList");
  setup();

  form.addEventListener("submit", (e) => { e.preventDefault(); add() });
});

async function setup() {
  try {
    const content = await readTextFile("storage.txt", {
      dir: BaseDirectory.AppLocalData
    })
    content.split(" ").map(e => decodeURI(e)).forEach(add);
    console.log(content.split(" ").map(e => {console.log(decodeURI(e)); return decodeURI(e)}));
  } catch (e) {
    console.log(e);
  }
}

async function save() {
  try {
    await writeTextFile("storage.txt", Array.from(todoList.children).map(e => encodeURI(e.title)).join(" "), {
      dir: BaseDirectory.AppLocalData
    });
  } catch (e) {
    console.log(e);
  }
}