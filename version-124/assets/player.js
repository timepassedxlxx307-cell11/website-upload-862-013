(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.stream-player'));

  var startVideo = function (box) {
    var video = box.querySelector('video');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');

    if (!stream) {
      return;
    }

    var play = function () {
      box.classList.add('is-playing');
      var started = video.play();

      if (started && typeof started.catch === 'function') {
        started.catch(function () {});
      }
    };

    if (box.getAttribute('data-ready') === '1') {
      play();
      return;
    }

    box.setAttribute('data-ready', '1');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      play();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });

      hls.attachMedia(video);
      hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(stream);
      });
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        play();
      });
      box.hlsPlayer = hls;
      return;
    }

    video.src = stream;
    play();
  };

  players.forEach(function (box) {
    var layer = box.querySelector('.play-layer');
    var video = box.querySelector('video');

    if (layer) {
      layer.addEventListener('click', function () {
        startVideo(box);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        startVideo(box);
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
    }
  });
})();
