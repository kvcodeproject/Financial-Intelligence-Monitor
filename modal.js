"use strict";

const root = document.getElementById("modal-root");
const titleEl = document.getElementById("modal-title");
const bodyEl = document.getElementById("modal-body");
const closeBtn = document.getElementById("modal-close");

window.fimModal = {
  open({ title, content, onMount }) {
    if (!root) return;
    titleEl.textContent = title || "";
    bodyEl.innerHTML = "";
    if (typeof content === "string") bodyEl.innerHTML = content;
    else if (content instanceof Node) bodyEl.appendChild(content);
    root.hidden = false;
    document.body.classList.add("modal-open");
    if (typeof onMount === "function") onMount(bodyEl);
  },
  close() {
    if (!root) return;
    root.hidden = true;
    document.body.classList.remove("modal-open");
    bodyEl.innerHTML = "";
  },
  toast(message, kind = "ok") {
    let host = document.getElementById("toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "toast-host";
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = `toast toast-${kind}`;
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => el.classList.add("show"), 10);
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 300);
    }, 2600);
  }
};

if (closeBtn) closeBtn.addEventListener("click", () => window.fimModal.close());
if (root) root.addEventListener("click", (e) => { if (e.target === root) window.fimModal.close(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") window.fimModal.close(); });
