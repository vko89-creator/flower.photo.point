// Таймер акции: до конца осени (30 ноября 2026, 23:59:59)
(function () {
  var end = new Date(2026, 10, 30, 23, 59, 59).getTime();
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function tick() {
    var left = Math.max(0, end - Date.now());
    var s = Math.floor(left / 1000);
    document.getElementById("t-days").textContent = pad(Math.floor(s / 86400));
    document.getElementById("t-hours").textContent = pad(Math.floor(s % 86400 / 3600));
    document.getElementById("t-mins").textContent = pad(Math.floor(s % 3600 / 60));
    document.getElementById("t-secs").textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);

  // Формы: сообщение после отправки
  function bind(formId, msgId, text) {
    var f = document.getElementById(formId), m = document.getElementById(msgId);
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      m.textContent = text;
      f.reset();
    });
  }
  bind("order-form", "form-message", "Спасибо! Заявка отправлена, мы свяжемся с вами.");
  bind("quick-form", "quick-message", "Принято! Перезвоним в ближайшее время.");
})();

// Плавная прокрутка к блокам при нажатии на кнопки и пункты меню (ссылки вида #order)
document.addEventListener("click", function (e) {
  var a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute("href") === "#") return;
  var target = document.querySelector(a.getAttribute("href"));
  if (!target) return;
  e.preventDefault();
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", a.getAttribute("href"));
});

// Галерея «Работы учеников»: по клику на плитку открывается весь раздел
(function () {
  var tiles = document.querySelectorAll(".gallery-item[data-prefix]");
  if (!tiles.length) return;

  // Если у обложки нет файла с основным именем — пробуем запасное (data-alt)
  tiles.forEach(function (t) {
    var img = t.querySelector("img");
    img.addEventListener("error", function () {
      if (t.dataset.alt && t.dataset.prefix !== t.dataset.alt) {
        t.dataset.prefix = t.dataset.alt;
        img.src = t.dataset.prefix + "1.jpg";
      }
    });
  });

  var box = document.createElement("div");
  box.className = "lightbox";
  box.hidden = true;
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Просмотр работ");
  box.innerHTML =
    '<div class="lb-inner">' +
    '<button type="button" class="lb-close" aria-label="Закрыть">×</button>' +
    '<div class="lb-title"></div>' +
    '<div class="lb-stage">' +
    '<button type="button" class="lb-nav lb-prev" aria-label="Предыдущее фото">‹</button>' +
    '<img class="lb-img" alt="" />' +
    '<button type="button" class="lb-nav lb-next" aria-label="Следующее фото">›</button>' +
    "</div>" +
    '<p class="lb-count"></p>' +
    '<div class="lb-thumbs"></div>' +
    "</div>";
  document.body.appendChild(box);

  var imgEl = box.querySelector(".lb-img");
  var titleEl = box.querySelector(".lb-title");
  var countEl = box.querySelector(".lb-count");
  var thumbsEl = box.querySelector(".lb-thumbs");
  var closeBtn = box.querySelector(".lb-close");
  var prefix = "", total = 0, title = "", cur = 1, opener = null;

  function src(i) { return prefix + i + ".jpg"; }

  function show(i) {
    cur = ((i - 1 + total) % total) + 1;
    imgEl.src = src(cur);
    imgEl.alt = title + " — фото " + cur + " из " + total;
    countEl.textContent = cur + " / " + total;
    Array.prototype.forEach.call(thumbsEl.children, function (b, k) {
      var on = k + 1 === cur;
      b.classList.toggle("active", on);
      if (on) b.scrollIntoView({ block: "nearest", inline: "center" });
    });
    // подгружаем соседние фото заранее
    [cur + 1, cur - 1].forEach(function (n) {
      var p = new Image();
      p.src = src(((n - 1 + total) % total) + 1);
    });
  }

  function open(tile) {
    opener = tile;
    prefix = tile.dataset.prefix;
    total = parseInt(tile.dataset.count, 10);
    title = tile.dataset.title;
    titleEl.textContent = title;
    thumbsEl.innerHTML = "";
    for (var i = 1; i <= total; i++) {
      (function (n) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Фото " + n);
        var t = document.createElement("img");
        t.src = src(n);
        t.alt = "";
        t.loading = "lazy";
        b.appendChild(t);
        b.addEventListener("click", function () { show(n); });
        thumbsEl.appendChild(b);
      })(i);
    }
    box.hidden = false;
    document.body.classList.add("lb-open");
    show(1);
    closeBtn.focus();
  }

  function close() {
    box.hidden = true;
    document.body.classList.remove("lb-open");
    imgEl.removeAttribute("src");
    if (opener) opener.focus();
  }

  tiles.forEach(function (t) {
    t.addEventListener("click", function () { open(t); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(t); }
    });
  });

  closeBtn.addEventListener("click", close);
  box.querySelector(".lb-prev").addEventListener("click", function () { show(cur - 1); });
  box.querySelector(".lb-next").addEventListener("click", function () { show(cur + 1); });
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  document.addEventListener("keydown", function (e) {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(cur - 1);
    else if (e.key === "ArrowRight") show(cur + 1);
  });
})();
