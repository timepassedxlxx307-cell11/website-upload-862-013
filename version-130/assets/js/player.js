(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function loadHls() {
        return new Promise(function (resolve, reject) {
            if (window.Hls) {
                resolve(window.Hls);
                return;
            }
            var existing = document.querySelector("script[data-hls-loader]");
            if (existing) {
                existing.addEventListener("load", function () {
                    resolve(window.Hls);
                });
                existing.addEventListener("error", reject);
                return;
            }
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
            script.async = true;
            script.setAttribute("data-hls-loader", "true");
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    ready(function () {
        var shell = document.querySelector("[data-player]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var button = shell.querySelector("[data-play-button]");
        var message = shell.querySelector("[data-player-message]");
        var streamUrl = shell.getAttribute("data-stream-url");
        var initialized = false;
        var initializing = false;
        var hlsInstance = null;

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add("is-visible");
        }

        function bindStream() {
            if (initialized) {
                return Promise.resolve();
            }
            if (initializing) {
                return new Promise(function (resolve) {
                    var tick = setInterval(function () {
                        if (initialized) {
                            clearInterval(tick);
                            resolve();
                        }
                    }, 120);
                });
            }
            initializing = true;
            return new Promise(function (resolve, reject) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    initialized = true;
                    initializing = false;
                    resolve();
                    return;
                }
                loadHls().then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        hlsInstance = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                            if (data && data.fatal) {
                                showMessage("视频加载失败，请刷新页面重试");
                            }
                        });
                        hlsInstance.loadSource(streamUrl);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                            initialized = true;
                            initializing = false;
                            resolve();
                        });
                    } else {
                        initializing = false;
                        reject(new Error("unsupported"));
                    }
                }).catch(function (error) {
                    initializing = false;
                    reject(error);
                });
            });
        }

        function play() {
            bindStream().then(function () {
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        showMessage("点击视频区域即可继续播放");
                    });
                }
            }).catch(function () {
                showMessage("视频加载失败，请刷新页面重试");
            });
        }

        function togglePlay() {
            if (!initialized || video.paused) {
                play();
            } else {
                video.pause();
            }
        }

        if (button) {
            button.addEventListener("click", togglePlay);
        }
        video.addEventListener("click", togglePlay);
        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            shell.classList.remove("is-playing");
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
