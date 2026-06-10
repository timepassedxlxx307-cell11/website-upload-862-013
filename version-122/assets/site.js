(function () {
    var menuToggle = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuToggle && mobilePanel) {
        menuToggle.addEventListener("click", function () {
            var isOpen = mobilePanel.hasAttribute("hidden");
            if (isOpen) {
                mobilePanel.removeAttribute("hidden");
                document.body.classList.add("menu-open");
                menuToggle.setAttribute("aria-expanded", "true");
            } else {
                mobilePanel.setAttribute("hidden", "");
                document.body.classList.remove("menu-open");
                menuToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var activeSlide = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
            slide.classList.toggle("active", position === activeSlide);
        });
        dots.forEach(function (dot, position) {
            dot.classList.toggle("active", position === activeSlide);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-target")) || 0);
            window.clearInterval(timer);
            timer = null;
            startHero();
        });
    });

    startHero();

    var grid = document.getElementById("movieGrid");
    var searchInput = document.getElementById("movieSearchInput");
    var yearFilter = document.getElementById("yearFilter");
    var genreFilter = document.getElementById("genreFilter");
    var noResults = document.getElementById("noResults");

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyQueryFromUrl() {
        if (!searchInput) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            searchInput.value = query;
        }
    }

    function filterMovies() {
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var query = normalize(searchInput && searchInput.value);
        var year = normalize(yearFilter && yearFilter.value);
        var genre = normalize(genreFilter && genreFilter.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
            var text = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-region"),
                card.getAttribute("data-tags")
            ].join(" "));
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
            var matchesGenre = !genre || normalize(card.getAttribute("data-genre")).indexOf(genre) !== -1;
            var isVisible = matchesQuery && matchesYear && matchesGenre;
            card.hidden = !isVisible;
            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (noResults) {
            noResults.hidden = visibleCount !== 0;
        }
    }

    applyQueryFromUrl();
    [searchInput, yearFilter, genreFilter].forEach(function (control) {
        if (control) {
            control.addEventListener("input", filterMovies);
            control.addEventListener("change", filterMovies);
        }
    });
    filterMovies();
})();
