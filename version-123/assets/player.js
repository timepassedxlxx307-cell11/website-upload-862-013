function setupMoviePlayer(streamUrl, videoId, coverId, startId) {
  var video = document.getElementById(videoId);
  var cover = document.getElementById(coverId);
  var start = document.getElementById(startId);
  var hls = null;
  var ready = false;

  function loadStream() {
    if (!video || ready) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      ready = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      ready = true;
    } else {
      video.src = streamUrl;
      ready = true;
    }
  }

  function startPlayback(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    loadStream();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    if (video) {
      var request = video.play();
      if (request && typeof request.catch === 'function') {
        request.catch(function () {});
      }
    }
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }
  if (start) {
    start.addEventListener('click', startPlayback);
  }
  if (video) {
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', function () {
      if (cover) {
        cover.classList.add('is-hidden');
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
