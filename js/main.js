/* ==========================================================================
   Zadeyo CS2 Cheats — Global Scripts
   Mobile nav toggle + custom video play overlay + FAQ helpers.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  initMobileNav();
  initVideoOverlay();
});

/**
 * Toggles the mobile navigation menu.
 */
function initMobileNav() {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");

  if (!toggle || !nav) {
    return;
  }

  toggle.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

/**
 * Wires up the custom play button overlay on the preview video.
 * Clicking the overlay starts playback and hides the button instantly.
 */
function initVideoOverlay() {
  var wrapper = document.querySelector(".video-wrapper");

  if (!wrapper) {
    return;
  }

  var video = wrapper.querySelector("video");
  var overlay = wrapper.querySelector(".video-play-overlay");

  if (!video || !overlay) {
    return;
  }

  var startPlayback = function () {
    overlay.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    video.play();
  };

  overlay.addEventListener("click", startPlayback);
  overlay.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      startPlayback();
    }
  });

  video.addEventListener("pause", function () {
    if (video.currentTime > 0 && !video.ended) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });
}
