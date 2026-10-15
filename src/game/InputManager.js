export class InputManager {
  constructor(root) {
    this.root = root;
    this.held = new Set();
    this.jumpPressed = false;
    this.onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const action = {
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right",
        arrowup: "jump",
        w: "jump",
        " ": "jump",
      }[key];
      if (!action) return;
      event.preventDefault();
      if (action === "jump" && !this.held.has("keyboard-jump"))
        this.jumpPressed = true;
      this.held.add(action === "jump" ? "keyboard-jump" : `keyboard-${action}`);
    };
    this.onKeyUp = (event) => {
      const key = event.key.toLowerCase();
      const action = {
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right",
        arrowup: "jump",
        w: "jump",
        " ": "jump",
      }[key];
      if (action)
        this.held.delete(
          action === "jump" ? "keyboard-jump" : `keyboard-${action}`,
        );
    };
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    root.querySelectorAll("[data-control]").forEach((button) => {
      const control = button.dataset.control;
      button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        this.held.add(`pointer-${event.pointerId}-${control}`);
        if (control === "jump") this.jumpPressed = true;
      });
      const release = (event) =>
        this.held.delete(`pointer-${event.pointerId}-${control}`);
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("lostpointercapture", release);
    });
  }

  read() {
    const held = [...this.held];
    const snapshot = {
      left: held.some((key) => key.endsWith("-left")),
      right: held.some((key) => key.endsWith("-right")),
      jumpHeld:
        this.held.has("keyboard-jump") ||
        held.some((key) => key.endsWith("-jump")),
      jumpPressed: this.jumpPressed,
    };
    this.jumpPressed = false;
    return snapshot;
  }

  destroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
