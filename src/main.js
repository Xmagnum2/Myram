const { invoke } = window.__TAURI__.tauri;

let input;
let todoList;
let target;
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
  const added = append(`<div class=todo><input class=todoInput value=${input.value}></input><button class=todoButton>Done</button></div>`, '#todoList')
  added.childNodes[0].addEventListener("click", (e) => edit(e.target));
  added.childNodes[1].addEventListener("click", (e) => done(e));
  input.value = ""
}

async function edit(target) {
  // todoList.textContent = await invoke("greet", { name: input.value });
}

async function done(e) {
  // todoList.textContent = await invoke("greet", { name: input.value });
  e.path[1].remove();
}

window.addEventListener("DOMContentLoaded", () => {
  input = document.querySelector("#input");
  todoList = document.querySelector("#todoList");
  document
    .querySelector("#button")
    .addEventListener("click", () => add());
});
