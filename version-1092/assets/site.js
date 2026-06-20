(function () {
    var menuButton = document.querySelector('[data-mobile-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-area]')).forEach(function (area) {
        var input = area.querySelector('[data-search-input]');
        var typeSelect = area.querySelector('[data-type-filter]');
        var yearSelect = area.querySelector('[data-year-filter]');
        var cards = Array.prototype.slice.call(area.querySelectorAll('[data-movie-card]'));

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var typeValue = normalize(typeSelect ? typeSelect.value : '');
            var yearValue = normalize(yearSelect ? yearSelect.value : '');

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type')
                ].join(' '));
                var typeMatch = !typeValue || normalize(card.getAttribute('data-type')).indexOf(typeValue) !== -1;
                var yearMatch = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                var keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
                card.style.display = typeMatch && yearMatch && keywordMatch ? '' : 'none';
            });
        }

        [input, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });
})();
