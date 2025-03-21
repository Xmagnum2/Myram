import Sortable, { AutoScroll } from "./sortable.core.esm.js";
import { SelectElement } from "./selectElement.js";
const { BaseDirectory, readTextFile, writeTextFile, exists, mkdir } = window.__TAURI_PLUGIN_FS__;

const { enable } = window.__TAURI_PLUGIN_AUTOSTART__;

await enable();

const selectElement = new SelectElement();
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
    const value = e.composedPath()[1].title;
    e.composedPath()[1].remove();
    await save();
    await setHistory(value);
    const history = document.createElement("p");
    history.title = value;
    history.textContent = value;
    document.querySelector("#historyContent").appendChild(history);
}

async function save() {
    try {
        await writeTextFile(
            "Myram/storage.txt",
            Array.from(todoList.children)
                .map((e) => encodeURI(e.title))
                .join(" "),
            {
                baseDir: BaseDirectory.LocalData,
            }
        );
    } catch (e) {
        console.log(e);
    }
}

async function getHistory() {
    try {
        const data = await readTextFile("Myram/history.txt", {
            baseDir: BaseDirectory.LocalData,
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
            baseDir: BaseDirectory.LocalData,
        });
    } catch (e) {
        console.log(e);
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    const existMyramDir = await exists("Myram", { baseDir: BaseDirectory.LocalData });
    if (!existMyramDir) await mkdir("Myram", { baseDir: BaseDirectory.LocalData, recursive: true });

    input = document.querySelector("#input");
    todoList = document.querySelector("#todoList");

    try {
        const content = await readTextFile("Myram/storage.txt", {
            baseDir: BaseDirectory.LocalData,
        });
        content
            .split(" ")
            .reverse()
            .map((e) => decodeURI(e))
            .forEach((value) => {
                const todoElement = createTodoElement(value);
                document.querySelector("#todoList").prepend(todoElement);
            });
    } catch (e) {
        console.log(e);
    }

    Sortable.mount(new AutoScroll());

    new Sortable(todoList, {
        animation: 80,
        forceAutoScrollFallback: true,
        scrollSpeed: 10,
        scrollSensitivity: 100,
        handle: ".todoHandle",
        onChoose: () => {
            document.querySelectorAll(".todo").forEach((e) => e.classList.remove("hover"));
        },
        onEnd: async () => {
            document.querySelectorAll(".todo").forEach((e) => e.classList.add("hover"));
            await save();
        },
    });

    document.querySelector("#input").addEventListener("focus", async () => {
        const history = document.querySelector("#history");
        const option = document.querySelector("#option");
        if (history.classList.contains("active")) history.click();
        if (option.classList.contains("active")) option.click();
    });

    const history = await getHistory();
    document.querySelector("#historyContent").innerHTML = history.map((e) => `<p title=${e}>${e}</p>`).join("");

    document.querySelector("#history").addEventListener("click", async (e) => {
        if (e.target.innerText === "History") {
            e.target.innerText = "Close";
            document.querySelector("#history").classList.add("active");
            document.querySelector("#historyContent").classList.add("active");

            document.querySelector("#option").innerText = "Option";
            document.querySelector("#option").classList.remove("active");
            document.querySelector("#optionContent").classList.remove("active");
        } else {
            e.target.innerText = "History";
            document.querySelector("#history").classList.remove("active");
            document.querySelector("#historyContent").classList.remove("active");
        }
        selectElement.reset(e.target);
    });

    document.querySelector("#option").addEventListener("click", async (e) => {
        if (e.target.innerText === "Option") {
            e.target.innerText = "Close";

            document.querySelector("#option").classList.add("active");
            document.querySelector("#optionContent").classList.add("active");

            document.querySelector("#history").innerText = "History";
            document.querySelector("#history").classList.remove("active");
            document.querySelector("#historyContent").classList.remove("active");
        } else {
            e.target.innerText = "Option";
            document.querySelector("#option").classList.remove("active");
            document.querySelector("#optionContent").classList.remove("active");
        }
        selectElement.reset(e.target);
    });

    document.querySelector("#form").addEventListener("submit", async (e) => {
        e.preventDefault();
        await add(e.target.childNodes[1].value);
        input.value = "";
        input.focus();
    });

    Array.from(document.getElementsByTagName("input")).forEach((e) =>
        e.addEventListener("focus", () => {
            selectElement.reset(e.id == "input" ? e : e.parentElement.parentElement);
        })
    );

    document.addEventListener("keydown", (e) => {
        if (!selectElement.elem) {
            selectElement.reset(document.querySelector(".todo"));
            return;
        }
        const rect = selectElement.elem.getBoundingClientRect();
        switch (e.key) {
            case "ArrowUp":
                e.preventDefault();
                if (selectElement.elem.classList.contains("todo")) {
                    selectElement.moveUp();
                    if (document.querySelector("#todoList").scrollTop > selectElement.elem.offsetTop) {
                        selectElement.elem.scrollIntoView(true);
                    }
                }
                break;
            case "ArrowDown":
                e.preventDefault();
                selectElement.moveDown();
                console.log(document.querySelector("#todoList").scrollTop + document.querySelector("#todoList").clientHeight, selectElement.elem.offsetTop + rect.height + 2);
                if (document.querySelector("#todoList").scrollTop + document.querySelector("#todoList").clientHeight < selectElement.elem.offsetTop + rect.height + 2) {
                    selectElement.elem.scrollIntoView(false);
                }
                break;
            case "ArrowLeft":
                if (input.value) break;
                if (!selectElement.elem.classList.contains("todo")) {
                    e.preventDefault();
                    selectElement.moveLeft();
                }
                break;
            case "ArrowRight":
                if (input.value) break;
                if (!selectElement.elem.classList.contains("todo")) {
                    e.preventDefault();
                    selectElement.moveRight();
                }
                break;
            case "Enter":
                if (document.activeElement.tagName !== "BUTTON" && selectElement.elem !== document.querySelector("#input")) {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        selectElement.done();
                    } else {
                        e.preventDefault();
                        selectElement.action();
                    }
                    break;
                }
        }
    });
});

function createTodoElement(value) {
    const tempElm = document.createElement("div");
    tempElm.innerHTML = `<div title="${value}" class="todo"><div class=todoHandle>::</div><form class=todoForm><input class=todoInput value="${value}"></input></form><button class=todoButton>Done</button></div>`;
    tempElm.firstChild.childNodes[1].childNodes[0].addEventListener("input", edit);
    tempElm.firstChild.childNodes[1].childNodes[0].addEventListener("focus", (e) => {
        selectElement.reset(e.target.parentElement.parentElement);
    });
    tempElm.firstChild.childNodes[1].addEventListener("submit", (e) => {
        e.preventDefault();
        e.target.childNodes[0].blur();
    });
    tempElm.firstChild.childNodes[2].addEventListener("click", done);
    return tempElm.firstChild;
}
