(function () {
  var navButton = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('.hero-carousel');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('.local-filter-input'));

  filterInputs.forEach(function (input) {
    var scope = input.closest('section') ? input.closest('section').querySelector('.local-filter-scope') : document.querySelector('.local-filter-scope');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (initial) {
      input.value = initial;
    }

    function runFilter() {
      if (!scope) {
        return;
      }

      var term = input.value.trim().toLowerCase();
      var items = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));

      items.forEach(function (item) {
        var haystack = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
        item.classList.toggle('is-filter-hidden', term !== '' && haystack.indexOf(term) === -1);
      });
    }

    input.addEventListener('input', runFilter);
    runFilter();
  });
})();

function initMoviePlayer(sourceUrl) {
  var shell = document.querySelector('.player-shell');

  if (!shell) {
    return;
  }

  var video = shell.querySelector('.movie-video');
  var cover = shell.querySelector('.player-cover');
  var hlsInstance = null;
  var started = false;

  if (!video || !cover || !sourceUrl) {
    return;
  }

  function playVideo() {
    if (started) {
      video.play().catch(function () {});
      return;
    }

    started = true;
    cover.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');

    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      video.play().catch(function () {});
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      return;
    }

    video.src = sourceUrl;
    video.play().catch(function () {});
  }

  cover.addEventListener('click', playVideo);
  video.addEventListener('click', function () {
    if (!started) {
      playVideo();
    }
  });
}
