(function () {
  var body = document.body;
  var toggle = document.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.hero-thumb'));
  var active = 0;

  function setHero(index) {
    if (!slides.length) {
      return;
    }
    active = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === active);
    });
    thumbs.forEach(function (thumb, thumbIndex) {
      thumb.classList.toggle('is-active', thumbIndex === active);
    });
  }

  thumbs.forEach(function (thumb, index) {
    thumb.addEventListener('click', function () {
      setHero(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      setHero(active + 1);
    }, 6200);
  }

  var heroSearch = document.querySelector('[data-hero-search]');
  if (heroSearch) {
    heroSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = heroSearch.querySelector('input');
      var query = input ? input.value.trim() : '';
      var target = './library.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-filter-year]');
  var genreSelect = document.querySelector('[data-filter-genre]');
  var resetButton = document.querySelector('[data-filter-reset]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var keyword = normalize(filterInput ? filterInput.value : '');
    var year = yearSelect ? yearSelect.value : '';
    var genre = genreSelect ? genreSelect.value : '';
    cards.forEach(function (card) {
      var searchText = normalize(card.getAttribute('data-search'));
      var cardYear = card.getAttribute('data-year') || '';
      var cardGenre = card.getAttribute('data-genre') || '';
      var matchKeyword = !keyword || searchText.indexOf(keyword) !== -1;
      var matchYear = !year || cardYear === year;
      var matchGenre = !genre || cardGenre.indexOf(genre) !== -1;
      card.classList.toggle('hidden-by-filter', !(matchKeyword && matchYear && matchGenre));
    });
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', applyFilters);
  }
  if (genreSelect) {
    genreSelect.addEventListener('change', applyFilters);
  }
  if (resetButton) {
    resetButton.addEventListener('click', function () {
      if (filterInput) {
        filterInput.value = '';
      }
      if (yearSelect) {
        yearSelect.value = '';
      }
      if (genreSelect) {
        genreSelect.value = '';
      }
      applyFilters();
    });
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q && filterInput) {
    filterInput.value = q;
    applyFilters();
  }
})();
