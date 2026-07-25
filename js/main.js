/* ==========================================================================
   Zadeyo CS2 Cheats — Global Scripts
   Mobile nav toggle + custom video play overlay + FAQ helpers.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  initMobileNav();
  initVideoOverlay();
  initVideoMuteToggle();
  initNewsletterForm();
  initTiltCards();
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

/**
 * Persistent mute/unmute control for the preview video, independent of
 * the play overlay so it stays usable once playback has started (the
 * play overlay itself fades out and stops intercepting clicks at that
 * point). Videos start unmuted by default; this just gives visitors an
 * obvious way to silence gameplay audio without hunting for native
 * video controls.
 */
function initVideoMuteToggle() {
  var wrapper = document.querySelector(".video-wrapper");

  if (!wrapper) {
    return;
  }

  var video = wrapper.querySelector("video");
  var toggle = wrapper.querySelector(".video-mute-toggle");

  if (!video || !toggle) {
    return;
  }

  toggle.addEventListener("click", function (event) {
    event.stopPropagation();
    video.muted = !video.muted;
    toggle.setAttribute("aria-pressed", video.muted ? "true" : "false");
    toggle.setAttribute("aria-label", video.muted ? "Unmute preview video" : "Mute preview video");
  });
}

/**
 * Footer newsletter form has no backend to submit to, so this just
 * prevents the page reload and gives the visitor a lightweight
 * confirmation instead of a dead GET request.
 */
function initNewsletterForm() {
  var form = document.querySelector(".newsletter-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var input = form.querySelector(".newsletter-input");
    var button = form.querySelector(".newsletter-submit");

    if (button) {
      button.textContent = "Subscribed!";
      button.disabled = true;
    }
    if (input) {
      input.value = "";
    }
  });
}

/**
 * Mouse-tracked 3D tilt cards with a physics-based spring settle — a
 * vanilla JS/CSS stand-in for the React "TiltedCard" (framer-motion)
 * component. This site has no React, no bundler and no npm dependencies
 * by design (see PROJECT_MEMORY.md), so the same rotateX/rotateY-on-move,
 * scale-on-hover and cursor-tracking glow are reproduced here with plain
 * DOM events + requestAnimationFrame instead of `motion/react`.
 *
 * Skips itself entirely when the visitor has requested reduced motion.
 * Otherwise it relies on real "mousemove" events to drive the tilt —
 * touch input doesn't fire those while dragging/tapping, so touch
 * devices naturally stay static without needing a pointer-type media
 * query (those queries unreliably report "coarse" on some touchscreen
 * Windows laptops even while an actual mouse is being used, which would
 * silently disable the effect for mouse users too).
 */
function initTiltCards() {
  var cards = document.querySelectorAll(".tilt-card");

  if (!cards.length) {
    return;
  }

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    return;
  }

  cards.forEach(setupTiltCard);
}

function setupTiltCard(card) {
  var ROTATE_AMPLITUDE = 10; // max degrees of tilt
  var SCALE_ON_HOVER = 1.04;
  var STIFFNESS = 120;
  var DAMPING = 14;
  var MASS = 1;
  var SETTLE_EPSILON = 0.01;

  var glow = card.querySelector(".tilt-card-glow");

  var axes = {
    rx: { value: 0, velocity: 0, target: 0 },
    ry: { value: 0, velocity: 0, target: 0 },
    scale: { value: 1, velocity: 0, target: 1 }
  };

  var rafId = null;
  var lastTime = null;

  function stepSpring(axis, dt) {
    var force = -STIFFNESS * (axis.value - axis.target);
    var dampingForce = -DAMPING * axis.velocity;
    var acceleration = (force + dampingForce) / MASS;
    axis.velocity += acceleration * dt;
    axis.value += axis.velocity * dt;
  }

  function isSettled() {
    return Object.keys(axes).every(function (key) {
      var axis = axes[key];
      return Math.abs(axis.value - axis.target) < SETTLE_EPSILON && Math.abs(axis.velocity) < SETTLE_EPSILON;
    });
  }

  function render() {
    card.style.transform =
      "perspective(900px) rotateX(" + axes.rx.value.toFixed(2) + "deg) " +
      "rotateY(" + axes.ry.value.toFixed(2) + "deg) " +
      "scale(" + axes.scale.value.toFixed(3) + ")";
  }

  function tick(now) {
    if (lastTime === null) {
      lastTime = now;
    }
    var dt = Math.min((now - lastTime) / 1000, 0.032);
    lastTime = now;

    stepSpring(axes.rx, dt);
    stepSpring(axes.ry, dt);
    stepSpring(axes.scale, dt);
    render();

    if (isSettled()) {
      rafId = null;
      lastTime = null;
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (rafId === null) {
      lastTime = null;
      rafId = requestAnimationFrame(tick);
    }
  }

  card.addEventListener("mousemove", function (event) {
    var rect = card.getBoundingClientRect();
    var offsetX = event.clientX - rect.left - rect.width / 2;
    var offsetY = event.clientY - rect.top - rect.height / 2;

    axes.rx.target = (offsetY / (rect.height / 2)) * -ROTATE_AMPLITUDE;
    axes.ry.target = (offsetX / (rect.width / 2)) * ROTATE_AMPLITUDE;

    if (glow) {
      var px = ((event.clientX - rect.left) / rect.width) * 100;
      var py = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--tilt-x", px + "%");
      card.style.setProperty("--tilt-y", py + "%");
    }

    startLoop();
  });

  card.addEventListener("mouseenter", function () {
    // Hand off from the CSS-only fallback tilt (see .tilt-card:hover) to
    // the JS spring: drop "transform" from the transitioned properties so
    // per-frame inline updates below aren't also smoothed by the CSS
    // transition, which would make the cursor-tracking tilt feel laggy.
    card.style.transitionProperty = "border-color, box-shadow";
    axes.scale.target = SCALE_ON_HOVER;
    card.classList.add("is-tilting");
    startLoop();
  });

  card.addEventListener("mouseleave", function () {
    axes.rx.target = 0;
    axes.ry.target = 0;
    axes.scale.target = 1;
    card.classList.remove("is-tilting");
    startLoop();
  });
}
