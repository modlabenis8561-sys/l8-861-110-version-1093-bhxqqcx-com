(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var next = root.querySelector('[data-hero-next]');
    var prev = root.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function getCards(scope) {
    return Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
  }

  function applyFilters(scope) {
    var input = scope.querySelector('[data-search-input]');
    var active = scope.querySelector('.filter-chip.is-active');
    var list = document.querySelector('[data-card-list]') || scope;
    var cards = getCards(list);
    var empty = document.querySelector('[data-empty-state]');
    var query = input ? input.value.trim().toLowerCase() : '';
    var filter = active ? active.getAttribute('data-filter') : 'all';
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var genres = card.getAttribute('data-genres') || '';
      var matchesText = !query || text.indexOf(query) !== -1;
      var matchesFilter = !filter || filter === 'all' || genres.indexOf(filter) !== -1;
      var shouldShow = matchesText && matchesFilter;
      card.classList.toggle('is-hidden', !shouldShow);
      if (shouldShow) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  function initSearchAndFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
    forms.forEach(function (form) {
      var input = form.querySelector('[data-search-input]');
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var list = document.querySelector('[data-card-list]');
        if (list) {
          applyFilters(document);
        } else {
          var value = input ? input.value.trim() : '';
          var url = './category-all.html';
          if (value) {
            url += '?q=' + encodeURIComponent(value);
          }
          window.location.href = url;
        }
      });
      if (input && document.querySelector('[data-card-list]')) {
        input.addEventListener('input', function () {
          applyFilters(document);
        });
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    var list = document.querySelector('[data-card-list]');
    var pageInput = document.querySelector('[data-search-input]');
    if (q && list && pageInput) {
      pageInput.value = q;
      applyFilters(document);
    }

    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('is-active');
        });
        chip.classList.add('is-active');
        applyFilters(document);
      });
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var button = wrap.querySelector('.play-layer');
      var streamUrl = wrap.getAttribute('data-video');
      var loaded = false;
      var hlsInstance = null;

      function loadStream() {
        if (!video || !streamUrl || loaded) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
        loaded = true;
      }

      function startPlayback() {
        loadStream();
        if (button) {
          button.classList.add('is-hidden');
        }
        if (video) {
          video.setAttribute('controls', 'controls');
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              video.setAttribute('controls', 'controls');
            });
          }
        }
      }

      if (button) {
        button.addEventListener('click', startPlayback);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            startPlayback();
          }
        });
      }
      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearchAndFilters();
    initPlayers();
  });
}());
