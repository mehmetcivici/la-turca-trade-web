/* La Turca Trade paneli — yayın durumu, otomatik güncelleme, bildirimler. */
(function () {
  "use strict";
  const P = window.LTT_PANEL;
  if (!P) return;
  const pill = document.getElementById("pubstate");
  const box = document.getElementById("pubBox");
  const label = document.getElementById("pubLabel");
  const nowBtn = document.getElementById("pubNow");
  const toastEl = document.getElementById("toast");
  let timer = null;
  let deploying = false;
  let fast = false;

  window.LTT_TOAST = function (msg, bad) {
    toastEl.textContent = msg;
    toastEl.className = "toast" + (bad ? " bad" : "");
    toastEl.hidden = false;
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => (toastEl.hidden = true), bad ? 9000 : 5000);
  };

  const CLS = { live: "ok", building: "wait", ready: "wait", failed: "bad", error: "bad", nogit: "bad", pinned: "wait" };

  function show(d) {
    const text = deploying ? "Site güncelleniyor…" : d.label;
    const cls = deploying ? "wait" : CLS[d.state] || "";
    if (pill) { pill.textContent = text; pill.className = "pill " + cls; }
    if (label) label.textContent = text;
    if (box) {
      let html = '<span class="pill ' + cls + '">' + text + "</span>";
      if (d.run) html += '<p class="muted small">Son derleme: ' + (d.run.message || "") + ' · <a href="' + d.run.url + '" target="_blank" rel="noopener">ayrıntı</a></p>';
      if (d.deployed && d.deployed.at) html += '<p class="muted small">Sitede yüklü sürüm: ' + String(d.deployed.sha || "").slice(0, 7) + " · " + new Date(d.deployed.at).toLocaleString("tr-TR") + "</p>";
      if (d.state === "failed") html += '<p class="small warn">Derleme başarısız oldu. Son değişiklikte bir alan hatalı olabilir; geliştiriciye haber verin.</p>';
      box.innerHTML = html;
    }
    if (nowBtn) nowBtn.hidden = !(d.state === "ready" || d.state === "live" || d.state === "pinned");
  }

  async function deploy(manual) {
    if (deploying) return;
    deploying = true;
    if (pill) { pill.textContent = "Site güncelleniyor…"; pill.className = "pill wait"; }
    try {
      const res = await fetch(P.base + "/guncelle.php", { method: "POST", headers: { Accept: "application/json", "X-CSRF": P.csrf } });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Güncellenemedi");
      window.LTT_TOAST("Site güncellendi (" + j.files + " dosya değişti).");
    } catch (e) {
      window.LTT_TOAST("Site güncellenemedi: " + e.message, true);
    } finally {
      deploying = false;
      poll(true);
    }
    void manual;
  }

  async function poll(fresh) {
    clearTimeout(timer);
    try {
      const res = await fetch(P.base + "/durum.php" + (fresh ? "?taze=1" : ""), { headers: { Accept: "application/json" } });
      const d = await res.json();
      show(d);
      if (d.state === "ready" && P.autoUpdate && !deploying) deploy(false);
      fast = d.state === "building" || d.state === "ready";
    } catch (e) {
      if (pill) { pill.textContent = "Durum alınamadı"; pill.className = "pill bad"; }
    }
    timer = setTimeout(() => poll(false), fast ? 12000 : 60000);
  }

  window.LTT_PUB = { kick: () => { fast = true; setTimeout(() => poll(true), 4000); } };
  if (nowBtn) nowBtn.addEventListener("click", () => deploy(true));
  poll(false);
})();
