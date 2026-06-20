(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        show(0);
        start();
    }

    function setupFilters() {
        var input = document.querySelector("[data-filter-input]");
        var year = document.querySelector("[data-filter-year]");
        var region = document.querySelector("[data-filter-region]");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
        var empty = document.querySelector("[data-empty-result]");
        if (!cards.length || (!input && !year && !region)) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query && input) {
            input.value = query;
        }

        function filter() {
            var q = input ? input.value.trim().toLowerCase() : "";
            var y = year ? year.value : "";
            var r = region ? region.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var matched = true;
                if (q && haystack.indexOf(q) === -1) {
                    matched = false;
                }
                if (y && card.getAttribute("data-year") !== y) {
                    matched = false;
                }
                if (r && card.getAttribute("data-region") !== r) {
                    matched = false;
                }
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        [input, year, region].forEach(function (element) {
            if (element) {
                element.addEventListener("input", filter);
                element.addEventListener("change", filter);
            }
        });
        filter();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".player-overlay");
            var src = player.getAttribute("data-video");
            var loaded = false;
            var hls = null;
            if (!video || !src) {
                return;
            }

            function load() {
                if (loaded) {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else {
                    video.src = src;
                }
                loaded = true;
            }

            function begin() {
                load();
                if (button) {
                    button.classList.add("hidden");
                }
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {
                        if (button) {
                            button.classList.remove("hidden");
                        }
                    });
                }
            }

            if (button) {
                button.addEventListener("click", begin);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    begin();
                }
            });
            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove("hidden");
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
