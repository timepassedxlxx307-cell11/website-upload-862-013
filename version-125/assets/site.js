(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var previous = document.querySelector('[data-hero-prev]');
  var next = document.querySelector('[data-hero-next]');
  var activeIndex = 0;
  var sliderTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function restartSlider() {
    if (sliderTimer) {
      window.clearInterval(sliderTimer);
    }

    if (slides.length > 1) {
      sliderTimer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
      restartSlider();
    });
  });

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(activeIndex - 1);
      restartSlider();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(activeIndex + 1);
      restartSlider();
    });
  }

  showSlide(0);
  restartSlider();

  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  filterForms.forEach(function (form) {
    var scopeSelector = form.getAttribute('data-filter-form');
    var scope = document.querySelector(scopeSelector);
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]')) : [];
    var empty = document.querySelector('[data-filter-empty]');
    var queryInput = form.querySelector('[name="q"]');
    var typeSelect = form.querySelector('[name="type"]');
    var regionSelect = form.querySelector('[name="region"]');
    var yearSelect = form.querySelector('[name="year"]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (queryInput && initialQuery) {
      queryInput.value = initialQuery;
    }

    function applyFilter() {
      var query = normalize(queryInput ? queryInput.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var region = normalize(regionSelect ? regionSelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var visible = true;

        if (query && haystack.indexOf(query) === -1) {
          visible = false;
        }

        if (type && cardType !== type) {
          visible = false;
        }

        if (region && cardRegion !== region) {
          visible = false;
        }

        if (year && cardYear !== year) {
          visible = false;
        }

        card.style.display = visible ? '' : 'none';

        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    Array.prototype.slice.call(form.elements).forEach(function (element) {
      element.addEventListener('input', applyFilter);
      element.addEventListener('change', applyFilter);
    });

    applyFilter();
  });
})();
