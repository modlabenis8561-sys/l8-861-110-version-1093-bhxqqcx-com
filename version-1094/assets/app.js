(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupNav() {
    var toggle = document.querySelector(".nav-toggle");
    if (!toggle) {
      return;
    }
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        play();
      });
    });

    play();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var section = panel.closest(".content-section") || document;
      var input = panel.querySelector(".js-filter");
      var chips = Array.prototype.slice.call(panel.querySelectorAll(".chip"));
      var cards = Array.prototype.slice.call(section.querySelectorAll(".filter-grid .movie-card"));
      var chipValue = "";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var kind = card.getAttribute("data-kind") || "";
          var visibleByQuery = !query || text.indexOf(query) !== -1;
          var visibleByChip = !chipValue || kind.indexOf(chipValue) !== -1 || text.indexOf(chipValue.toLowerCase()) !== -1;
          card.classList.toggle("is-hidden", !(visibleByQuery && visibleByChip));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          chipValue = chip.getAttribute("data-filter-value") || "";
          apply();
        });
      });
    });
  }

  ready(function () {
    setupNav();
    setupHero();
    setupFilters();
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movie-player");
  var cover = document.querySelector(".player-cover");
  if (!video || !streamUrl) {
    return;
  }
  var attached = false;
  var hlsInstance = null;

  function attachStream() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 40,
        maxMaxBufferLength: 80,
        enableWorker: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function startPlayback() {
    attachStream();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.controls = true;
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", startPlayback);
  }
  video.addEventListener("click", function () {
    if (!attached) {
      startPlayback();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
