(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var button = $('[data-menu-toggle]');
    var nav = $('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      button.classList.toggle('open', open);
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initBackTop() {
    var button = $('[data-back-top]');
    if (!button) {
      return;
    }
    function sync() {
      button.classList.toggle('visible', window.scrollY > 360);
    }
    window.addEventListener('scroll', sync, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    sync();
  }

  function initGlobalSearch() {
    $all('[data-global-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = 'search.html' + (query ? '?q=' + encodeURIComponent(query) : '');
        window.location.href = target;
      });
    });
  }

  function initHero() {
    var hero = $('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = $all('[data-hero-slide]', hero);
    var dots = $all('[data-hero-dot]', hero);
    var prev = $('[data-hero-prev]', hero);
    var next = $('[data-hero-next]', hero);
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    $all('[data-filter-input]').forEach(function (input) {
      var section = input.closest('.content-section') || document;
      var cards = $all('.movie-card', section);
      input.addEventListener('input', function () {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region')
          ].join(' '));
          card.style.display = !query || haystack.indexOf(query) !== -1 ? '' : 'none';
        });
      });
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card standard">' +
      '<a href="' + escapeHtml(movie.url) + '" class="poster-link" aria-label="观看' + escapeHtml(movie.title) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="poster-shade"></span><span class="play-dot">▶</span></a>' +
      '<div class="movie-info"><h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
      '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
      '<div class="tag-row">' + tags + '</div></div></article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var results = $('[data-search-results]');
    var input = $('[data-search-page-input]');
    var form = $('[data-search-page-form]');
    if (!results || !input || !form || !window.MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render(query) {
      var q = normalize(query);
      var items = window.MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));
        return !q || haystack.indexOf(q) !== -1;
      }).slice(0, 120);
      results.innerHTML = items.map(movieCard).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input.value);
      var q = input.value.trim();
      history.replaceState(null, '', 'search.html' + (q ? '?q=' + encodeURIComponent(q) : ''));
    });
    input.addEventListener('input', function () {
      render(input.value);
    });
    $all('[data-search-chip]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        input.value = chip.getAttribute('data-search-chip') || '';
        render(input.value);
      });
    });
    render(initial);
  }

  function initPlayer() {
    var shell = $('.player-shell');
    if (!shell) {
      return;
    }
    var video = $('video', shell);
    var trigger = $('[data-play-trigger]', shell);
    var stream = video ? video.getAttribute('data-stream') : shell.getAttribute('data-stream');
    var loaded = false;
    var hls;

    function attach() {
      if (!video || loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      attach();
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initBackTop();
    initGlobalSearch();
    initHero();
    initFilters();
    initSearchPage();
    initPlayer();
  });
})();
