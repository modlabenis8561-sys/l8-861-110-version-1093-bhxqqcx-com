(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        function showHero(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showHero(index);
            });
        });
        if (slides.length > 1) {
            setInterval(function () {
                showHero(current + 1);
            }, 5200);
        }
    }

    var list = document.querySelector('[data-card-list]');
    if (list) {
        var search = document.querySelector('[data-card-search]');
        var filters = Array.prototype.slice.call(document.querySelectorAll('[data-card-filter]'));
        var params = new URLSearchParams(window.location.search);
        if (search && params.get('q')) {
            search.value = params.get('q');
        }
        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }
        function applyFilters() {
            var keyword = normalize(search ? search.value : '');
            var cards = Array.prototype.slice.call(list.children);
            var filterValues = {};
            filters.forEach(function (filter) {
                filterValues[filter.getAttribute('data-card-filter')] = normalize(filter.value);
            });
            cards.forEach(function (card) {
                var text = normalize(card.textContent + ' ' + Object.keys(card.dataset).map(function (key) {
                    return card.dataset[key];
                }).join(' '));
                var visible = !keyword || text.indexOf(keyword) !== -1;
                Object.keys(filterValues).forEach(function (name) {
                    var value = filterValues[name];
                    if (value && normalize(card.dataset[name]) !== value) {
                        visible = false;
                    }
                });
                card.classList.toggle('is-hidden', !visible);
            });
        }
        if (search) {
            search.addEventListener('input', applyFilters);
        }
        filters.forEach(function (filter) {
            filter.addEventListener('change', applyFilters);
        });
        applyFilters();
    }
})();
