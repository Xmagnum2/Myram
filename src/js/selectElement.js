export class SelectElement {
  moveUp() {
    this.elem.classList.remove("selected");
    this.elem.querySelector('input').blur();
    if (this.elem.previousElementSibling) {
      this.elem = this.elem.previousElementSibling;
    } else if (this.elem === document.querySelector(".todo")) {
      this.elem = document.querySelector("#input");
      this.elem.focus();
    }
    this.elem.classList.add("selected");
  }
  moveDown() {
    if (this.elem.classList.contains("active")) return;
    if (this.elem != document.querySelector("#input")) {
      if (this.elem.classList.contains("todo")) this.elem.querySelector('input').blur();
    } else {
      this.elem.blur();
    }
    this.elem.classList.remove("selected");
    if (this.elem.nextElementSibling) {
      this.elem = this.elem.nextElementSibling;
    } else {
      if (!this.elem.classList.contains("todo")) this.elem = document.querySelector(".todo");
    }
    this.elem.classList.add("selected");
  }
  moveLeft() {
    if (this.elem === document.querySelector("#input")) {
      this.elem.blur();
      this.elem.classList.remove("selected");
      this.elem = document.querySelector("#history");
      this.elem.click();
    } else if (this.elem === document.querySelector("#option")) {
      this.elem.classList.remove("selected");
      this.elem = document.querySelector("#input");
      this.elem.focus();
      this.elem.classList.add("selected");
    }
  }
  moveRight() {
    if (this.elem === document.querySelector("#input")) {
      this.elem.blur();
      this.elem.classList.remove("selected");
      this.elem = document.querySelector("#option");
      this.elem.click();
    } else if (this.elem === document.querySelector("#history")) {
      this.elem.classList.remove("selected");
      this.elem = document.querySelector("#input");
      this.elem.focus();
      this.elem.classList.add("selected");
    }
  }
  done() {
    const temp = this.elem.nextElementSibling;
    this.elem.classList.remove("selected");
    this.elem.querySelector('button').click();
    this.elem = temp;
    this.elem.classList.add("selected");
  }
  action() {
    if (this.elem.classList.contains("todo")) {
      if (this.elem !== document.querySelector("#input")) {
        if (this.elem.querySelector('input') === document.activeElement) {
          this.elem.querySelector('input').blur();
        } else {
          this.elem.querySelector('input').focus();
        }
      }
    } else {
      this.elem.click();
    }
  }
  reset(elem) {
    if (this.elem) this.elem.classList.remove("selected");
    this.elem = elem;
    this.elem.classList.add("selected");
  }
}