(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function initMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var mobileNav = document.querySelector('.mobile-nav');
        if (!toggle || !mobileNav) {
            return;
        }
        toggle.addEventListener('click', function () {
            var open = mobileNav.hasAttribute('hidden');
            if (open) {
                mobileNav.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
                toggle.textContent = '×';
            } else {
                mobileNav.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
                toggle.textContent = '☰';
            }
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
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
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function initFilters() {
        var list = document.querySelector('[data-filter-list]');
        var input = document.querySelector('[data-filter-input]');
        var typeSelect = document.querySelector('[data-type-filter]');
        if (!list || !input) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        if (query) {
            input.value = query;
        }

        function apply() {
            var term = normalize(input.value);
            var typeValue = normalize(typeSelect ? typeSelect.value : '');
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var cardType = normalize(card.getAttribute('data-type'));
                var matchesTerm = !term || haystack.indexOf(term) !== -1;
                var matchesType = !typeValue || cardType.indexOf(typeValue) !== -1;
                card.classList.toggle('is-hidden', !(matchesTerm && matchesType));
            });
        }

        input.addEventListener('input', apply);
        if (typeSelect) {
            typeSelect.addEventListener('change', apply);
        }
        apply();
    }

    function initPlayer() {
        var shell = document.querySelector('[data-player]');
        var video = document.querySelector('#movie-player');
        var button = document.querySelector('#play-button');
        if (!shell || !video || !button) {
            return;
        }
        var source = video.getAttribute('data-src');
        var started = false;
        var hlsInstance = null;

        function attachSource() {
            if (started || !source) {
                return;
            }
            started = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                button.querySelector('span:last-child').textContent = '当前浏览器暂不支持播放';
                started = false;
                return;
            }
            button.classList.add('is-hidden');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', attachSource);
        shell.addEventListener('click', function (event) {
            if (!started && event.target !== button && !button.contains(event.target)) {
                attachSource();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
})();
