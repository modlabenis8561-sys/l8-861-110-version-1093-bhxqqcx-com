document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      var isOpen = document.body.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
  var prev = document.querySelector("[data-hero-prev]");
  var next = document.querySelector("[data-hero-next]");
  var current = 0;
  var timer = null;

  function activate(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
      dot.setAttribute("aria-selected", dotIndex === current ? "true" : "false");
    });
  }

  function startHero() {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5200);
    }
  }

  if (prev) {
    prev.addEventListener("click", function () {
      activate(current - 1);
      startHero();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      activate(current + 1);
      startHero();
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      activate(index);
      startHero();
    });
  });

  activate(0);
  startHero();

  var searchInput = document.querySelector("[data-search-input]");
  var searchableItems = Array.prototype.slice.call(document.querySelectorAll("[data-title][data-tags]"));
  var emptyState = document.querySelector("[data-empty-state]");

  if (searchInput && searchableItems.length) {
    searchInput.addEventListener("input", function () {
      var value = searchInput.value.trim().toLowerCase();
      var visible = 0;

      searchableItems.forEach(function (item) {
        var haystack = [item.getAttribute("data-title"), item.getAttribute("data-tags")].join(" ").toLowerCase();
        var matched = !value || haystack.indexOf(value) !== -1;
        item.style.display = matched ? "" : "none";

        if (matched) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    });
  }
});
