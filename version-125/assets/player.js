(function () {
  var hlsMime = 'application/vnd.apple.mpegurl';

  function attachStream(video, streamUrl) {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    video.setAttribute('data-ready', '1');

    if (video.canPlayType(hlsMime)) {
      video.src = streamUrl;
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video.hlsPlayer = hls;
      return;
    }

    video.src = streamUrl;
    video.load();
  }

  window.setupMoviePlayer = function (videoId, playerId, streamUrl) {
    var video = document.getElementById(videoId);
    var player = document.getElementById(playerId);

    if (!video || !player || !streamUrl) {
      return;
    }

    var startButton = player.querySelector('.player-start');

    function startPlayback() {
      attachStream(video, streamUrl);

      if (startButton) {
        startButton.classList.add('is-hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (startButton) {
      startButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        startPlayback();
      });
    }

    player.addEventListener('click', function (event) {
      if (event.target === video && video.getAttribute('data-ready') !== '1') {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    });
  };
})();
