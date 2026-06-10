(function () {
    function setupMoviePlayer(sourceUrl) {
        var video = document.querySelector(".movie-video");
        var overlay = document.querySelector(".player-overlay");
        var hasAttached = false;
        var hls = null;

        if (!video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (hasAttached) {
                return;
            }
            hasAttached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(sourceUrl);
                hls.attachMedia(video);
                return;
            }
            video.src = sourceUrl;
        }

        function beginPlayback() {
            attachSource();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener("click", beginPlayback);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                beginPlayback();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
            if (hls && typeof hls.stopLoad === "function") {
                hls.stopLoad();
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;
})();
