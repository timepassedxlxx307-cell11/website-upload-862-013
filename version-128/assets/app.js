
(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function joinPath(base, path) {
    if (!base || base === '.') {
      return './' + path;
    }
    return base.replace(/\/$/, '') + '/' + path;
  }

  function initMobileNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var activeIndex = 0;
    var timer = null;

    function show(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        schedule();
      });
    });

    slider.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });

    slider.addEventListener('mouseleave', schedule);
    schedule();
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initStaticFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-filter-list]');
    if (!panel || !list) {
      return;
    }
    var keyword = panel.querySelector('[data-filter-keyword]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));

    function apply() {
      var q = normalize(keyword && keyword.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre')
        ].join(' '));
        var matchKeyword = !q || haystack.indexOf(q) !== -1;
        var matchYear = !y || normalize(card.getAttribute('data-year')) === y;
        var matchType = !t || normalize(card.getAttribute('data-type')).indexOf(t) !== -1;
        card.hidden = !(matchKeyword && matchYear && matchType);
      });
    }

    [keyword, year, type].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
  }

  function renderMovieCard(movie, base) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    var image = joinPath(base, movie.coverIndex + '.jpg');
    var href = joinPath(base, movie.detail);
    return [
      '<article class="movie-card" data-movie-card>',
      '  <a href="' + href + '" class="movie-card-link" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <div class="poster-wrap">',
      '      <img src="' + image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <div class="poster-shade"></div>',
      '      <span class="year-badge">' + escapeHtml(movie.year) + '</span>',
      '      <span class="play-float">▶</span>',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '      <h2>' + escapeHtml(movie.title) + '</h2>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="tag-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function initSearchPage() {
    var page = document.querySelector('[data-search-page]');
    var results = document.getElementById('searchResults');
    var empty = document.getElementById('searchEmpty');
    if (!page || !results || !window.MOVIES) {
      return;
    }
    var base = page.getAttribute('data-base') || '.';
    var keyword = page.querySelector('[data-search-keyword]');
    var year = page.querySelector('[data-search-year]');
    var type = page.querySelector('[data-search-type]');

    function apply() {
      var q = normalize(keyword && keyword.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var filtered = window.MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.oneLine,
          (movie.tags || []).join(' ')
        ].join(' '));
        var matchKeyword = !q || haystack.indexOf(q) !== -1;
        var matchYear = !y || normalize(movie.year) === y;
        var matchType = !t || normalize(movie.type).indexOf(t) !== -1;
        return matchKeyword && matchYear && matchType;
      }).slice(0, 120);
      results.innerHTML = filtered.map(function (movie) {
        return renderMovieCard(movie, base);
      }).join('');
      if (empty) {
        empty.hidden = filtered.length > 0;
      }
    }

    [keyword, year, type].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });
    apply();
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[src="' + src + '"]');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', reject, { once: true });
        if (window.Hls) {
          resolve();
        }
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initPlayer() {
    var section = document.querySelector('[data-player]');
    if (!section) {
      return;
    }
    var video = section.querySelector('video[data-src]');
    var button = section.querySelector('[data-play-button]');
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute('data-src');
    var hlsInstance = null;

    function attachNative() {
      video.src = source;
      section.classList.add('is-playing');
      return video.play();
    }

    function attachHls() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      section.classList.add('is-playing');
      return new Promise(function (resolve) {
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().then(resolve).catch(resolve);
        });
      });
    }

    button.addEventListener('click', function () {
      if (!source) {
        return;
      }
      button.disabled = true;
      button.querySelector('strong').textContent = '正在连接播放源';
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        attachNative().catch(function () {
          button.disabled = false;
          button.querySelector('strong').textContent = '点击播放';
        });
        return;
      }
      loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js')
        .then(function () {
          if (window.Hls && window.Hls.isSupported()) {
            return attachHls();
          }
          return attachNative();
        })
        .catch(function () {
          return attachNative();
        })
        .catch(function () {
          button.disabled = false;
          button.querySelector('strong').textContent = '点击播放';
        });
    });
  }

  ready(function () {
    initMobileNav();
    initHeroSlider();
    initStaticFilters();
    initSearchPage();
    initPlayer();
  });
})();
