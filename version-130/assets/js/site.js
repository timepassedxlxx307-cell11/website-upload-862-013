(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (toggle && nav) {
            toggle.addEventListener("click", function () {
                nav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var active = 0;
        var timer;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === active);
            });
        }

        function startHero() {
            if (slides.length < 2) {
                return;
            }
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(active + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(active - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(active + 1);
                startHero();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startHero();
            });
        });

        showSlide(0);
        startHero();

        var searchInput = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-video-card]"));
        var counter = document.querySelector("[data-result-counter]");
        var empty = document.querySelector("[data-empty-result]");

        function applySearch() {
            if (!searchInput || !cards.length) {
                return;
            }
            var keyword = searchInput.value.trim().toLowerCase();
            var shown = 0;
            cards.forEach(function (card) {
                var text = card.getAttribute("data-filter-text") || "";
                var matched = !keyword || text.indexOf(keyword) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    shown += 1;
                }
            });
            if (counter) {
                counter.textContent = keyword ? "找到 " + shown + " 部相关影片" : "输入关键词筛选影片";
            }
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", applySearch);
            applySearch();
        }
    });
})();
