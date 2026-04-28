/* global CPI_DATA */
"use strict";

const CHANNELS = [
  { id: "slack-fincrime",  name: "Slack #fincrime",          recipients: 42 },
  { id: "teams-aml",       name: "Teams · AML Compliance",   recipients: 18 },
  { id: "email-watchlist", name: "Email · watchlist@firm",   recipients: 7  },
  { id: "mattermost-intl", name: "Mattermost #intel-global", recipients: 31 }
];

const SHARE_LOG_KEY = "fim:share-log";

const shareBtn = document.getElementById("btn-share");
if (shareBtn) shareBtn.addEventListener("click", openShare);

let currentScope = null;
document.addEventListener("country:select", (e) => {
  currentScope = e.detail && e.detail.alpha3 ? e.detail.alpha3 : null;
});

function buildPermalink() {
  const url = new URL(window.location.href);
  url.hash = currentScope ? `country=${encodeURIComponent(currentScope)}` : "";
  return url.toString();
}

function loadLog() {
  try { return JSON.parse(localStorage.getItem(SHARE_LOG_KEY) || "[]"); }
  catch { return []; }
}
function saveLog(log) {
  try { localStorage.setItem(SHARE_LOG_KEY, JSON.stringify(log.slice(0, 20))); } catch {}
}

function openShare() {
  const scopeLabel = currentScope
    ? `${(CPI_DATA[currentScope] && CPI_DATA[currentScope].name) || currentScope} (${currentScope})`
    : "Global view";

  const channelHtml = CHANNELS.map((c) => `
    <li class="channel">
      <div>
        <div class="channel-name">${c.name}</div>
        <div class="channel-recipients">${c.recipients} recipients</div>
      </div>
      <button type="button" class="btn" data-send="${c.id}">Send</button>
    </li>`).join("");

  const log = loadLog();
  const logHtml = log.length
    ? `<ul class="share-log">${log.map((e) => `<li><span class="when">${new Date(e.ts).toLocaleString()}</span> · <strong>${e.channel}</strong> · ${e.scope}</li>`).join("")}</ul>`
    : `<p class="form-hint">No shares yet this session.</p>`;

  const html = `
    <div class="share">
      <p class="form-lead">Distribute this view to internal channels. Permalink encodes the current country selection so recipients open the same scope.</p>
      <label>Scope <input type="text" value="${scopeLabel}" readonly /></label>
      <label>Permalink
        <div class="copy-row">
          <input id="share-link" type="text" value="${buildPermalink()}" readonly />
          <button type="button" class="btn" id="share-copy">Copy</button>
        </div>
      </label>
      <h3>Internal channels</h3>
      <ul class="channels">${channelHtml}</ul>
      <h3>Recent shares (this session)</h3>
      ${logHtml}
    </div>`;

  window.fimModal.open({
    title: "Share internal",
    content: html,
    onMount: (body) => {
      body.querySelector("#share-copy").addEventListener("click", async () => {
        const input = body.querySelector("#share-link");
        try {
          await navigator.clipboard.writeText(input.value);
          window.fimModal.toast("Permalink copied", "ok");
        } catch {
          input.select();
          document.execCommand("copy");
          window.fimModal.toast("Permalink copied", "ok");
        }
      });
      body.querySelectorAll("button[data-send]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const channel = CHANNELS.find((c) => c.id === btn.dataset.send);
          const entry = { ts: Date.now(), channel: channel.name, scope: scopeLabel };
          const log = [entry, ...loadLog()];
          saveLog(log);
          btn.textContent = "Sent ✓";
          btn.disabled = true;
          window.fimModal.toast(`Pushed to ${channel.name} (${channel.recipients} recipients)`, "ok");
        });
      });
    }
  });
}
