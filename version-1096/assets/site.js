(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupSliders() {
        document.querySelectorAll("[data-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
            var prev = slider.querySelector("[data-slide-prev]");
            var next = slider.querySelector("[data-slide-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });
            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            show(0);
            start();
        });
    }

    function uniqueValues(cards, key) {
        var values = [];
        cards.forEach(function (card) {
            var value = card.getAttribute("data-" + key) || "";
            if (value && values.indexOf(value) === -1) {
                values.push(value);
            }
        });
        return values.sort(function (a, b) {
            return String(b).localeCompare(String(a), "zh-Hans-CN");
        });
    }

    function setupFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var search = scope.querySelector("[data-search]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .compact-card"));
            var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));

            selects.forEach(function (select) {
                var key = select.getAttribute("data-filter");
                uniqueValues(cards, key).forEach(function (value) {
                    var option = document.createElement("option");
                    option.value = value;
                    option.textContent = value;
                    select.appendChild(option);
                });
            });

            function matchText(card, query) {
                if (!query) {
                    return true;
                }
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.textContent
                ].join(" ").toLowerCase();
                return haystack.indexOf(query) !== -1;
            }

            function matchSelects(card) {
                return selects.every(function (select) {
                    var key = select.getAttribute("data-filter");
                    var value = select.value;
                    if (!value) {
                        return true;
                    }
                    return (card.getAttribute("data-" + key) || "") === value;
                });
            }

            function apply() {
                var query = search ? search.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var visible = matchText(card, query) && matchSelects(card);
                    card.classList.toggle("is-filter-hidden", !visible);
                });
            }

            if (search) {
                search.addEventListener("input", apply);
            }
            selects.forEach(function (select) {
                select.addEventListener("change", apply);
            });
            apply();
        });
    }

    window.initMoviePlayer = function (streamUrl) {
        var shell = document.querySelector("[data-player-shell]");
        if (!shell) {
            return;
        }
        var video = shell.querySelector("video");
        var button = shell.querySelector(".play-layer");
        var hlsInstance = null;
        var hasStarted = false;

        function attach() {
            if (hasStarted || !video || !streamUrl) {
                return;
            }
            hasStarted = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
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
        }

        function play() {
            attach();
            if (button) {
                button.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupSliders();
        setupFilters();
    });
})();
