(function () {
    var navButton = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (navButton && nav) {
        navButton.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            navButton.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    document.querySelectorAll("img").forEach(function (img) {
        img.addEventListener("error", function () {
            img.classList.add("image-missing");
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length) {
        var activeIndex = 0;
        var showSlide = function (index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        };
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });
        window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    var searchInput = document.querySelector("[data-filter='search']");
    var regionSelect = document.querySelector("[data-filter='region']");
    var typeSelect = document.querySelector("[data-filter='type']");
    var yearSelect = document.querySelector("[data-filter='year']");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var applyFilters = function () {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var region = regionSelect ? regionSelect.value : "";
        var type = typeSelect ? typeSelect.value : "";
        var year = yearSelect ? yearSelect.value : "";
        cards.forEach(function (card) {
            var haystack = [card.dataset.title, card.dataset.genre, card.dataset.tags, card.dataset.region, card.dataset.type, card.dataset.year].join(" ").toLowerCase();
            var visible = true;
            if (keyword && haystack.indexOf(keyword) === -1) {
                visible = false;
            }
            if (region && card.dataset.region !== region) {
                visible = false;
            }
            if (type && card.dataset.type !== type) {
                visible = false;
            }
            if (year && card.dataset.year !== year) {
                visible = false;
            }
            card.style.display = visible ? "" : "none";
        });
    };
    [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        }
    });
})();

function startMoviePlayer(streamUrl) {
    var video = document.getElementById("movie-player");
    var cover = document.querySelector(".play-cover");
    var playButton = document.querySelector(".play-cover button");
    if (!video || !streamUrl) {
        return;
    }

    var ready = false;
    var prepare = function () {
        if (ready) {
            return;
        }
        ready = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    };

    var play = function () {
        prepare();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    };

    if (cover) {
        cover.addEventListener("click", play);
    }
    if (playButton) {
        playButton.addEventListener("click", function (event) {
            event.stopPropagation();
            play();
        });
    }
    video.addEventListener("play", function () {
        if (cover) {
            cover.classList.add("is-hidden");
        }
    });
    prepare();
}
