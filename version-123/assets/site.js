(function () {
  var body = document.body;
  var base = body ? body.getAttribute('data-base') || './' : './';
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var active = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === active);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === active);
    });
  }

  function restartHero() {
    if (!slides.length) {
      return;
    }
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(function () {
      showSlide(active + 1);
    }, 5200);
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        restartHero();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        restartHero();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        restartHero();
      });
    }
    restartHero();
  }

  var globalSearch = document.getElementById('globalSearch');
  var resultBox = document.getElementById('searchResults');
  var searchItems = window.SEARCH_MOVIES || [];

  function joinPath(prefix, path) {
    if (!path) {
      return prefix;
    }
    if (/^https?:\/\//.test(path)) {
      return path;
    }
    if (prefix === './') {
      return './' + path.replace(/^\.\//, '');
    }
    return prefix.replace(/\/$/, '') + '/' + path.replace(/^\.\//, '');
  }

  function renderResults(query) {
    if (!globalSearch || !resultBox) {
      return;
    }
    var value = query.trim().toLowerCase();
    if (!value) {
      resultBox.classList.remove('is-open');
      resultBox.innerHTML = '';
      body.classList.remove('search-open');
      return;
    }
    var hits = searchItems.filter(function (item) {
      return item.key.indexOf(value) !== -1;
    }).slice(0, 12);
    if (!hits.length) {
      resultBox.innerHTML = '<div class="empty-result">没有找到相关影片</div>';
      resultBox.classList.add('is-open');
      body.classList.add('search-open');
      return;
    }
    resultBox.innerHTML = hits.map(function (item) {
      return '<a href="' + joinPath(base, item.url) + '">' +
        '<img src="' + joinPath(base, item.cover) + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + item.title + '</strong><span>' + item.meta + '</span></span>' +
        '</a>';
    }).join('');
    resultBox.classList.add('is-open');
    body.classList.add('search-open');
  }

  if (globalSearch && resultBox) {
    globalSearch.addEventListener('input', function () {
      renderResults(globalSearch.value);
    });
    document.addEventListener('click', function (event) {
      if (!resultBox.contains(event.target) && event.target !== globalSearch) {
        resultBox.classList.remove('is-open');
        body.classList.remove('search-open');
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.content-section')).forEach(function (section) {
    var input = section.querySelector('.card-filter');
    var select = section.querySelector('.genre-filter');
    var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
    if (!input && !select) {
      return;
    }
    function filterCards() {
      var text = input ? input.value.trim().toLowerCase() : '';
      var genre = select ? select.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var okText = !text || haystack.indexOf(text) !== -1;
        var okGenre = !genre || haystack.indexOf(genre.toLowerCase()) !== -1;
        card.classList.toggle('is-hidden', !(okText && okGenre));
      });
    }
    if (input) {
      input.addEventListener('input', filterCards);
    }
    if (select) {
      select.addEventListener('change', filterCards);
    }
  });
})();
