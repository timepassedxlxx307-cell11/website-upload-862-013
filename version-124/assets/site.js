(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var current = 0;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    showSlide(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var searchInput = document.querySelector('[data-search-input]');
  var categorySelect = document.querySelector('[data-category-filter]');
  var typeSelect = document.querySelector('[data-type-filter]');
  var resetButton = document.querySelector('[data-filter-reset]');
  var resultNote = document.querySelector('[data-result-note]');
  var emptyResult = document.querySelector('[data-empty-result]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search-card]'));

  var queryFromUrl = function () {
    try {
      return new URLSearchParams(window.location.search).get('q') || '';
    } catch (error) {
      return '';
    }
  };

  var applyFilters = function () {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var category = categorySelect ? categorySelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = card.getAttribute('data-search-text') || '';
      var cardCategory = card.getAttribute('data-category') || '';
      var cardType = card.getAttribute('data-type') || '';
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (category && cardCategory !== category) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';

      if (matched) {
        visibleCount += 1;
      }
    });

    if (resultNote) {
      resultNote.textContent = visibleCount ? '筛选结果：' + visibleCount + ' 部' : '没有匹配结果';
    }

    if (emptyResult) {
      emptyResult.style.display = visibleCount ? 'none' : 'block';
    }
  };

  if (cards.length) {
    var initialQuery = queryFromUrl();

    if (searchInput && initialQuery) {
      searchInput.value = initialQuery;
    }

    [searchInput, categorySelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        applyFilters();
      });
    }

    applyFilters();
  }
})();
