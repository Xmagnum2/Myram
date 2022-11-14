const { invoke } = window.__TAURI__.tauri;

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

async function add() {
  // todoList.textContent = await invoke("greet", { name: input.value });
  if(input.value == ""){
    return
  }
  const added = append(`<div title=${input.value} class=todo><form class=todoForm><input class=todoInput value=${input.value}></input></form><button class=todoButton>Done</button></div>`, '#todoList')
  added.childNodes[0].addEventListener("submit", (e) => {e.preventDefault(); e.target.childNodes[0].blur()});
  added.childNodes[0].childNodes[0].addEventListener("input", (e) => edit(e.target));
  added.childNodes[1].addEventListener("click", (e) => done(e));
  input.value = ""
  input.focus();
}

async function edit(target) {
  // todoList.textContent = await invoke("greet", { name: input.value });
  console.log(target.value);
}

async function done(e) {
  // todoList.textContent = await invoke("greet", { name: input.value });
  e.path[1].remove();
}

window.addEventListener("DOMContentLoaded", () => {
  form = document.querySelector("#form");
  input = document.querySelector("#input");
  todoList = document.querySelector("#todoList");
  document
    .querySelector("#button")
    .addEventListener("click", () => add());

  form.addEventListener("submit", (e) => {e.preventDefault(); add()});
});
