(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function one(selector, root) {
    return (root || document).querySelector(selector);
  }

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = one(".nav-toggle");
    var panel = one(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupImages() {
    document.addEventListener("error", function (event) {
      var target = event.target;
      if (target && target.tagName === "IMG") {
        target.classList.add("is-hidden");
      }
    }, true);
  }

  function setupHero() {
    var slides = all(".hero-slide");
    var dots = all(".hero-dot");
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    function next() {
      show(current + 1);
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(next, 5500);
      });
    });
    show(0);
    timer = setInterval(next, 5500);
  }

  function setupSearchPage() {
    var form = one(".search-panel");
    var cards = all(".search-card");
    if (!form || !cards.length) {
      return;
    }
    var keyword = one('[data-filter="keyword"]', form);
    var genre = one('[data-filter="genre"]', form);
    var year = one('[data-filter="year"]', form);
    var type = one('[data-filter="type"]', form);
    var empty = one(".empty-state");
    var params = new URLSearchParams(window.location.search);
    if (keyword && params.get("q")) {
      keyword.value = params.get("q");
    }
    function normalize(value) {
      return (value || "").toString().trim().toLowerCase();
    }
    function apply() {
      var q = normalize(keyword && keyword.value);
      var g = normalize(genre && genre.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-keywords"));
        var matchKeyword = !q || haystack.indexOf(q) !== -1;
        var matchGenre = !g || normalize(card.getAttribute("data-genre")).indexOf(g) !== -1;
        var matchYear = !y || normalize(card.getAttribute("data-year")) === y;
        var matchType = !t || normalize(card.getAttribute("data-type")).indexOf(t) !== -1;
        var matched = matchKeyword && matchGenre && matchYear && matchType;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    [keyword, genre, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      apply();
    });
    apply();
  }

  function setupPlayer() {
    var shell = one(".player-shell");
    if (!shell) {
      return;
    }
    var video = one("video[data-hls]", shell);
    var overlay = one(".player-overlay", shell);
    var button = one(".player-start", shell);
    if (!video) {
      return;
    }
    var started = false;
    var hls = null;
    function start() {
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var src = video.getAttribute("data-hls");
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = src;
        video.play().catch(function () {});
      }
    }
    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        start();
      });
    }
    shell.addEventListener("click", function (event) {
      if (!started && event.target !== video) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  onReady(function () {
    setupMenu();
    setupImages();
    setupHero();
    setupSearchPage();
    setupPlayer();
  });
})();
