/* La Turca Trade — JSON içerik düzenleyici (bağımlılıksız). */
(function () {
  "use strict";
  const cfg = window.LTT_EDITOR;
  const panel = window.LTT_PANEL;
  if (!cfg) return;

  const H = cfg.hints;
  let state = structuredClone(cfg.data);
  let sha = cfg.sha;
  let dirty = false;
  const openSet = new Set();
  const root = document.getElementById("editor");
  const saveBtn = document.getElementById("save");
  const dirtyEl = document.getElementById("dirty");
  const LANGS = ["es", "pt", "en", "tr"];
  const LANG_NAMES = { es: "ES", pt: "PT", en: "EN", tr: "TR" };

  // ---------- yardımcılar ----------
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v === true ? "" : v);
    }
    for (const k of kids.flat()) if (k != null) n.append(k.nodeType ? k : document.createTextNode(String(k)));
    return n;
  };
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
  const isI18n = (v) => isObj(v) && Object.keys(v).length && Object.keys(v).every((k) => LANGS.includes(k)) && Object.values(v).every((x) => typeof x === "string");
  const pathKey = (path) => path.map((p) => (typeof p === "number" ? "*" : p)).join(".");
  const getAt = (obj, path) => path.reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const setAt = (path, v) => {
    const parent = getAt(state, path.slice(0, -1));
    parent[path[path.length - 1]] = v;
    markDirty();
  };
  const humanize = (k) => String(k).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
  function labelFor(path) {
    const pk = pathKey(path);
    const last = path[path.length - 1];
    if (typeof last === "number") return "#" + (last + 1);
    return H.pathLabels[pk] || H.pathLabels[path.filter((p) => typeof p !== "number").join(".")] || H.labels[last] || humanize(last);
  }
  const helpFor = (path) => H.help[path[path.length - 1]] || "";
  const enumFor = (path) => H.enums[pathKey(path)];
  const fileKind = (path) => H.files[path[path.length - 1]];
  const rawUrl = (p) => (p && p.startsWith("/") ? cfg.raw + p : p);

  function markDirty() {
    dirty = true;
    dirtyEl.textContent = "Kaydedilmemiş değişiklikler var";
    dirtyEl.className = "warn";
    saveBtn.disabled = false;
  }
  window.addEventListener("beforeunload", (e) => {
    if (dirty) { e.preventDefault(); e.returnValue = ""; }
  });

  function blankLike(v) {
    if (typeof v === "string") return "";
    if (typeof v === "number") return 0;
    if (typeof v === "boolean") return false;
    if (Array.isArray(v)) return [];
    if (isObj(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blankLike(x)]));
    return null;
  }

  function itemTitle(v, i) {
    if (!isObj(v)) return "#" + (i + 1);
    const pick = v.name || v.brand || v.t || v.q || v.v || v.code || (isI18n(v.title) && (v.title.tr || v.title.es)) || (isI18n(v.label) && (v.label.tr || v.label.es)) || v.id;
    return (pick ? String(pick) : "Kayıt") + "";
  }

  // ---------- alan çizimleri ----------
  function refLine(refVal) {
    if (typeof refVal !== "string" || !refVal || !cfg.refLang) return null;
    return el("div", { class: "ref" }, el("b", { text: cfg.refLang + ": " }), refVal);
  }

  function textInput(path, value, onInput) {
    const long = value.length > 70 || value.includes("\n");
    const input = long ? el("textarea", { rows: Math.min(8, Math.max(2, Math.ceil(value.length / 80))) }) : el("input", { type: "text" });
    input.value = value;
    input.addEventListener("input", () => onInput(input.value));
    return input;
  }

  const LIMITS = { title: 44, description: 155 };
  function counter(path, input) {
    const k = path[path.length - 1];
    const max = LIMITS[k];
    if (!max || path.length !== 2) return null; // yalnızca sayfa başlık/açıklaması
    const c = el("small", { class: "count" });
    const upd = () => {
      const n = input.value.length;
      c.textContent = n + " / " + max + " karakter" + (n > max ? " — Google kısaltabilir" : "");
      c.className = "count" + (n > max ? " over" : "");
    };
    input.addEventListener("input", upd);
    upd();
    return c;
  }

  function fieldString(container, path, value, refVal) {
    const kind = fileKind(path);
    const opts = enumFor(path);
    const wrap = el("label", { class: "f" }, el("span", { class: "lbl", text: labelFor(path) }));
    if (opts) {
      const sel = el("select", { onchange: () => setAt(path, sel.value) }, opts.map(([v, l]) => el("option", { value: v, text: l })));
      sel.value = value;
      wrap.append(sel);
    } else if (kind) {
      wrap.append(fileField(path, value, kind));
    } else {
      const inp = textInput(path, value, (v) => setAt(path, v));
      wrap.append(inp);
      const cnt = counter(path, inp);
      if (cnt) wrap.append(cnt);
    }
    const help = helpFor(path);
    if (help) wrap.append(el("small", { class: "help", text: help }));
    const r = refLine(refVal);
    if (r) wrap.append(r);
    container.append(wrap);
  }

  function fieldNumber(container, path, value) {
    const input = el("input", { type: "number", step: "any", value: value == null ? "" : value });
    input.addEventListener("input", () => setAt(path, input.value === "" ? null : Number(input.value)));
    container.append(el("label", { class: "f small" }, el("span", { class: "lbl", text: labelFor(path) }), input));
  }

  function fieldBool(container, path, value) {
    const input = el("input", { type: "checkbox" });
    input.checked = !!value;
    input.addEventListener("change", () => setAt(path, input.checked));
    const help = helpFor(path);
    container.append(el("label", { class: "f check" }, input, el("span", { text: labelFor(path) }), help ? el("small", { class: "help", text: help }) : null));
  }

  function fieldI18n(container, path, value, refVal) {
    const box = el("div", { class: "f i18n" }, el("span", { class: "lbl", text: labelFor(path) }));
    const grid = el("div", { class: "i18n-grid" });
    for (const l of LANGS) {
      if (!(l in value)) continue;
      const input = textInput([...path, l], value[l], (v) => setAt([...path, l], v));
      grid.append(el("label", { class: "i18n-cell" }, el("em", { text: LANG_NAMES[l] }), input));
    }
    box.append(grid);
    container.append(box);
    void refVal;
  }

  function fileField(path, value, kind) {
    const box = el("div", { class: "file" });
    const input = el("input", { type: "text", value });
    input.addEventListener("input", () => { setAt(path, input.value); preview(); });
    const prev = el("div", { class: "file-prev" });
    function preview() {
      prev.innerHTML = "";
      const v = getAt(state, path);
      if (!v) return;
      if (kind === "image") prev.append(el("img", { src: rawUrl(v), alt: "", loading: "lazy" }));
      else prev.append(el("a", { href: (panel.site || "") + v, target: "_blank", rel: "noopener", text: "PDF'i aç ↗" }));
    }
    const picker = el("input", { type: "file", accept: kind === "pdf" ? "application/pdf" : "image/jpeg,image/png,image/webp", hidden: true });
    const btn = el("button", { type: "button", class: "btn sm", text: kind === "pdf" ? "PDF yükle" : "Fotoğraf yükle", onclick: () => picker.click() });
    const status = el("span", { class: "muted small" });
    picker.addEventListener("change", async () => {
      const file = picker.files[0];
      if (!file) return;
      btn.disabled = true;
      status.textContent = "Yükleniyor… (" + (file.size / 1048576).toFixed(1) + " MB)";
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      fd.append("csrf", panel.csrf);
      try {
        const res = await fetch(cfg.upload, { method: "POST", body: fd, headers: { Accept: "application/json", "X-CSRF": panel.csrf } });
        const j = await res.json();
        if (!j.ok) throw new Error(j.error || "Yükleme başarısız");
        input.value = j.path;
        setAt(path, j.path);
        // Kardeş alanları otomatik doldur (katalog kapağı ölçüsü, PDF boyutu/sayfa sayısı)
        const parent = getAt(state, path.slice(0, -1));
        const key = path[path.length - 1];
        if (kind === "image" && key === "cover" && "coverW" in parent) { parent.coverW = j.w; parent.coverH = j.h; }
        if (kind === "pdf") {
          const sk = "sizeMb" + key.replace(/^file/, ""); // file → sizeMb, fileEs → sizeMbEs
          parent[sk] = j.sizeMb;
          if (key === "file" && "pages" in parent && j.pages) parent.pages = j.pages;
        }
        status.textContent = "Yüklendi. Kaydetmeyi unutmayın.";
        render();
        toast("Dosya yüklendi. Değişikliği yayınlamak için \"Kaydet ve yayınla\"ya basın.");
      } catch (e) {
        status.textContent = "";
        toast(e.message, true);
      } finally {
        btn.disabled = false;
        picker.value = "";
      }
    });
    preview();
    box.append(prev, el("div", { class: "file-row" }, input, btn, picker), status);
    return box;
  }

  function arrayPrimitive(container, path, arr, refArr) {
    const box = el("div", { class: "f list" }, el("span", { class: "lbl", text: labelFor(path) }));
    arr.forEach((v, i) => {
      const row = el("div", { class: "list-row" });
      if (typeof v === "number" || v === null) {
        const input = el("input", { type: "number", step: "any", value: v == null ? "" : v });
        input.addEventListener("input", () => setAt([...path, i], input.value === "" ? null : Number(input.value)));
        row.append(input);
      } else {
        row.append(textInput([...path, i], String(v), (x) => setAt([...path, i], x)));
      }
      row.append(el("button", { type: "button", class: "icon", title: "Sil", text: "✕", onclick: () => { arr.splice(i, 1); markDirty(); render(); } }));
      box.append(row);
      const r = refLine(Array.isArray(refArr) ? refArr[i] : null);
      if (r) box.append(r);
    });
    const sample = arr.find((x) => x !== null && x !== undefined);
    box.append(el("button", { type: "button", class: "btn sm ghost", text: "+ Ekle", onclick: () => { arr.push(typeof sample === "number" ? 0 : ""); markDirty(); render(); } }));
    container.append(box);
  }

  function arrayObjects(container, path, arr, refArr) {
    const box = el("div", { class: "f objlist" }, el("span", { class: "lbl", text: labelFor(path) + " (" + arr.length + ")" }));
    arr.forEach((item, i) => {
      const id = pathKey(path) + "#" + i + ":" + itemTitle(item, i);
      const det = el("details", { class: "item", open: openSet.has(id) });
      det.addEventListener("toggle", () => (det.open ? openSet.add(id) : openSet.delete(id)));
      const tools = el(
        "span",
        { class: "item-tools" },
        el("button", { type: "button", class: "icon", title: "Yukarı", text: "↑", disabled: i === 0, onclick: (e) => { e.preventDefault(); [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; markDirty(); render(); } }),
        el("button", { type: "button", class: "icon", title: "Aşağı", text: "↓", disabled: i === arr.length - 1, onclick: (e) => { e.preventDefault(); [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; markDirty(); render(); } }),
        el("button", { type: "button", class: "icon danger", title: "Sil", text: "✕", onclick: (e) => { e.preventDefault(); if (confirm("\"" + itemTitle(item, i) + "\" silinsin mi?")) { arr.splice(i, 1); markDirty(); render(); } } }),
      );
      const thumb = item && typeof item.image === "string" && item.image ? el("img", { class: "thumb", src: rawUrl(item.image), alt: "" }) : null;
      det.append(el("summary", {}, thumb, el("span", { class: "item-title", text: itemTitle(item, i) }), tools));
      const body = el("div", { class: "item-body" });
      renderObject(body, [...path, i], item, Array.isArray(refArr) ? refArr[i] : undefined);
      det.append(body);
      box.append(det);
    });
    const tpl = arr[0];
    if (tpl) {
      box.append(el("button", {
        type: "button", class: "btn sm ghost", text: "+ Ekle",
        onclick: () => {
          const n = blankLike(tpl);
          arr.push(n);
          openSet.add(pathKey(path) + "#" + (arr.length - 1) + ":" + itemTitle(n, arr.length - 1));
          markDirty(); render();
        },
      }));
    }
    container.append(box);
  }

  function renderObject(container, path, obj, refObj) {
    for (const [k, v] of Object.entries(obj)) renderNode(container, [...path, k], v, isObj(refObj) ? refObj[k] : undefined);
  }

  function renderNode(container, path, value, refVal) {
    if (typeof value === "string") return fieldString(container, path, value, refVal);
    if (typeof value === "number" || value === null) return fieldNumber(container, path, value);
    if (typeof value === "boolean") return fieldBool(container, path, value);
    if (Array.isArray(value)) {
      if (value.length && value.every((x) => isObj(x))) return arrayObjects(container, path, value, refVal);
      if (value.length && value.every((x) => Array.isArray(x))) {
        const fs = el("fieldset", { class: "group" }, el("legend", { text: labelFor(path) }));
        value.forEach((sub, i) => arrayPrimitive(fs, [...path, i], sub, Array.isArray(refVal) ? refVal[i] : undefined));
        return container.append(fs);
      }
      return arrayPrimitive(container, path, value, refVal);
    }
    if (isI18n(value)) return fieldI18n(container, path, value, refVal);
    if (isObj(value)) {
      const fs = el("fieldset", { class: "group" }, el("legend", { text: labelFor(path) }));
      renderObject(fs, path, value, refVal);
      return container.append(fs);
    }
  }

  function render() {
    const scroll = window.scrollY;
    root.innerHTML = "";
    const keys = Object.keys(state);
    keys.forEach((k, idx) => {
      const id = "sec:" + k;
      if (cfg.openFirst && idx === 0 && !openSet.has("init:" + k)) { openSet.add(id); openSet.add("init:" + k); }
      const v = state[k];
      const simple = typeof v !== "object" || v === null;
      if (simple) {
        renderNode(root, [k], v, cfg.ref ? cfg.ref[k] : undefined);
        return;
      }
      const det = el("details", { class: "section", open: openSet.has(id) || keys.length === 1 });
      det.addEventListener("toggle", () => (det.open ? openSet.add(id) : openSet.delete(id)));
      det.append(el("summary", { text: labelFor([k]) }));
      const body = el("div", { class: "section-body" });
      renderNode(body, [k], v, cfg.ref ? cfg.ref[k] : undefined);
      // Bölüm adının tekrar başlık olmasını engelle
      const first = body.firstElementChild;
      if (first && first.tagName === "FIELDSET") { first.classList.add("flat"); }
      det.append(body);
      root.append(det);
    });
    window.scrollTo(0, scroll);
  }

  // ---------- kaydet ----------
  saveBtn.addEventListener("click", async () => {
    saveBtn.disabled = true;
    dirtyEl.textContent = "Kaydediliyor…";
    try {
      const res = await fetch(cfg.save, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF": panel.csrf },
        body: JSON.stringify({ sha, data: state }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error || "Kaydedilemedi");
      sha = j.sha;
      dirty = false;
      dirtyEl.textContent = "Kaydedildi (" + j.commit + "). Site 1–3 dakika içinde güncellenecek.";
      dirtyEl.className = "okc";
      toast("Kaydedildi. Site derleniyor; bitince otomatik güncellenecek.");
      if (window.LTT_PUB) window.LTT_PUB.kick();
    } catch (e) {
      dirtyEl.textContent = "Kaydedilemedi";
      dirtyEl.className = "warn";
      saveBtn.disabled = false;
      toast(e.message, true);
    }
  });

  function toast(msg, bad) {
    if (window.LTT_TOAST) window.LTT_TOAST(msg, bad);
    else alert(msg);
  }

  render();
})();
