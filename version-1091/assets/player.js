document.addEventListener("DOMContentLoaded", function () {
  var Hls = window.Hls;
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var overlay = player.querySelector(".play-overlay");
    var src = player.getAttribute("data-src") || (video ? video.getAttribute("data-src") : "");
    var hls = null;
    var ready = false;

    function attach() {
      if (!video || !src || ready) {
        return;
      }

      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    }

    function play() {
      attach();

      if (!video) {
        return;
      }

      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }

      if (overlay) {
        overlay.hidden = true;
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!ready) {
          play();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.hidden = true;
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
});
