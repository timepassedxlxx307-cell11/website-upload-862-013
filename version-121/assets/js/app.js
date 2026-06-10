(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var player = document.querySelector('[data-player]');

  if (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('.play-overlay');
    var source = player.getAttribute('data-player');
    var started = false;

    function startVideo() {
      if (!video || !source) {
        return;
      }

      if (!started) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            maxBufferLength: 30,
            enableWorker: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else {
          video.src = source;
        }
        started = true;
      }

      if (overlay) {
        overlay.classList.add('hidden');
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
      if (!started) {
        startVideo();
      }
    });
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchTitle = document.querySelector('[data-search-title]');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function movieCard(item) {
    var tags = (item.genres || []).slice(0, 2).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '<a href="movie/' + escapeHtml(item.id) + '.html" class="card-link" aria-label="' + escapeHtml(item.title) + '">',
      '<div class="poster">',
      '<span class="poster-mark">' + escapeHtml(String(item.title || '').slice(0, 1)) + '</span>',
      '<img src="./' + escapeHtml(item.cover) + '.jpg" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.style.display=\'none\'">',
      '</div>',
      '<div class="card-content">',
      '<div class="card-tags">' + tags + '</div>',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p class="card-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>',
      '<p class="card-desc">' + escapeHtml(item.oneLine) + '</p>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function runSearch(query) {
    if (!searchResults || !window.SITE_SEARCH_DATA) {
      return;
    }

    var keyword = String(query || '').trim().toLowerCase();
    var source = window.SITE_SEARCH_DATA;
    var result = source;

    if (keyword) {
      result = source.filter(function (item) {
        return [
          item.title,
          item.region,
          item.regionGroup,
          item.type,
          item.year,
          item.genreRaw,
          (item.genres || []).join(' '),
          (item.tags || []).join(' '),
          item.oneLine
        ].join(' ').toLowerCase().indexOf(keyword) !== -1;
      });
    }

    if (searchTitle) {
      searchTitle.textContent = keyword ? '搜索结果：' + query : '推荐内容';
    }

    searchResults.innerHTML = result.slice(0, 96).map(movieCard).join('') || '<div class="notice-card">没有找到匹配内容</div>';
  }

  if (searchForm && searchInput && searchResults) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    searchInput.value = query;
    runSearch(query);

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = searchInput.value.trim();
      var nextUrl = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
      window.history.replaceState(null, '', nextUrl);
      runSearch(value);
    });

    Array.prototype.slice.call(document.querySelectorAll('[data-filter]')).forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter') || '';
        searchInput.value = value;
        window.history.replaceState(null, '', 'search.html?q=' + encodeURIComponent(value));
        runSearch(value);
      });
    });
  }
})();
