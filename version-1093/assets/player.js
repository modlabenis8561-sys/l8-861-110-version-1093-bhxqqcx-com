(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-trigger');
    var backdrop = player.querySelector('.player-backdrop');
    var stream = player.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    function attachStream() {
      if (!video || !stream || loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function startPlayback() {
      attachStream();
      player.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }
    if (backdrop) {
      backdrop.addEventListener('click', startPlayback);
    }
    if (video) {
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
