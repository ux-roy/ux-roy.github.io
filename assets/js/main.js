
!(function ($) {
  "use strict";
})(jQuery);
var nav_sections = $('section');
var main_nav = $('.nav-menu, #mobile-nav');

// 🔴 AOS Initialization (Animation On Scrolling) -----------> 
  AOS.init({
    duration: 1000,
    easing: "ease-in-out-back"
  });

// 🔴 Typing Animated Text Top of (Hero Background) ----------->
if ($('.typed').length) {
  var typed_strings = $(".typed").data('typed-items');
  typed_strings = typed_strings.split(',')
  new Typed('.typed', {
    strings: typed_strings,
    loop: true,
    typeSpeed: 100,
    backSpeed: 50,
    backDelay: 2000
  });
}

// 🔴 Update Navigation (Active State Scroll Effect) ----------->
$(window).on('scroll', function () {
  var cur_pos = $(this).scrollTop() + 10;
  var activeSet = false;

  nav_sections.each(function () {
    if (activeSet) return;

    var top = $(this).offset().top;
    var bottom = top + $(this).outerHeight();

    if (cur_pos >= top && cur_pos <= bottom) {
      main_nav.find('a').removeClass('active');
      main_nav
        .find('a[href="#' + this.id + '"]')
        .addClass('active');

      activeSet = true;
    }
  });

  if (cur_pos < 200) {
    $(".nav-menu ul:first li:first").addClass('active');
  }
});

// 🔴 Unified Back to Top Button (Visible & Clicked) ----------->
$(function () {
  const $backToTop = $('.back-to-top');

  $(window).on('scroll', function () {
    const isOverlayOpen = $('.overlay-active').length > 0;
    if ($(this).scrollTop() > 100 && !isOverlayOpen) {
      $backToTop.fadeIn('slow');
    } else {
      $backToTop.fadeOut('slow');
    }
  });

  $backToTop.on('click', function (e) {
    e.preventDefault();
    $('html, body').stop().animate({
      scrollTop: 0
    }, 1500, 'easeInOutExpo');
    return false;
  });
});

// 🔴 Smooth Scrolling and Key Navigation (Handling) ----------->
$(document).on('click', '.nav-menu a, .scrollto', function (e) {
  if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
    e.preventDefault();
    var target = $(this.hash);
    if (target.length) {
      var scrollto = target.offset().top;

      $('html, body').animate({
        scrollTop: scrollto
      }, 1500, 'easeInOutExpo');
    }
  }
});

// 🔴 Progress Bar Animation Triggered (On Scroll) ----------->
$('.skills-content').waypoint(function () {
  $('.progress .progress-bar').each(function () {
    $(this).css("width", $(this).attr("aria-valuenow") + '%');
  });
}, {
  offset: '80%'
});

// 🔴 Portfolio Filtering Interaction Isotope (Load) ----------->
$(window).on('load', function () {
  var portfolioIsotope = $('.portfolio-container').isotope({
    itemSelector: '.portfolio-item',
    layoutMode: 'fitRows',
    filter: '.case-study'
  });

  $('#portfolio-flters li').on('click', function () {
    $("#portfolio-flters li").removeClass('filter-active');
    $(this).addClass('filter-active');

    portfolioIsotope.isotope({
      filter: $(this).attr('data-filter')
    });
  });
});

// 🔴 Portfolio Filter Sliding Indicate (Active Tab) ----------->
document.addEventListener('DOMContentLoaded', function () {
  const tabs = document.querySelectorAll('#portfolio-flters li');
  const indicator = document.createElement('div');
  indicator.classList.add('indicator');
  document.querySelector('#portfolio-flters').appendChild(indicator);

  function updateIndicator(element) {
    const rect = element.getBoundingClientRect();
    const parentRect = element.parentElement.getBoundingClientRect();
    indicator.style.width = `${rect.width}px`;
    indicator.style.left = `${rect.left - parentRect.left}px`;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', event => {
      document.querySelector('#portfolio-flters .filter-active').classList.remove('filter-active');
      event.target.classList.add('filter-active');
      updateIndicator(event.target);
    });
  });

  updateIndicator(document.querySelector('#portfolio-flters .filter-active'));
});

// 🔴 Portfolio Popup Overlay for (Pictures Preview) ----------->
document.querySelectorAll('.popup-trigger').forEach(button => {
  button.addEventListener('click', () => {
    const portfolioItem = button.closest('.portfolio-item');
    const overlay = portfolioItem.querySelector('.overlay').cloneNode(true);
    const mediaSrc = portfolioItem.querySelector('iframe').src || 
                     portfolioItem.querySelector('img')?.src || 
                     portfolioItem.querySelector('video')?.src;
    
    const iframe = overlay.querySelector('iframe');
    if (iframe) iframe.src = mediaSrc;
    
    document.body.appendChild(overlay);
    
    overlay.style.display = 'flex';
    overlay.style.zIndex = '9999';
    document.body.classList.add('no-scroll');
    overlay.classList.add('overlay-active');

    $('.back-to-top').hide();

    overlay.querySelector('.close-btn').addEventListener('click', () => {
      overlay.style.display = 'none';
      document.body.removeChild(overlay);
      document.body.classList.remove('no-scroll');
      overlay.classList.remove('overlay-active');
      $('.back-to-top').show();
    });
  });
});

// 🔴 Website Logo (Click Smooth Scroll To Start) ----------->
$(document).on('click', '#logo-container a', function (e) {
  const target = $('#hero');
  if (target.length) {
    e.preventDefault();
    if (!$('.overlay-active').length) {
      $('html, body').animate({
        scrollTop: target.offset().top
      }, 1500, 'easeInOutExpo');
    }
  }
});

// 🔴 Mobile Navigation Toggle (The Button Click) ----------->
$(document).on('click', '.mobile-nav-toggle', function (e) {
  e.stopPropagation();
  $('body').toggleClass('mobile-nav-active');
  $('#menu-line-icon').toggleClass('change');
});

// 🔴 Close Hamburger When Clicked (Section Links)----------->
$(document).on('click', '.nav-menu a', function () {
  if ($(window).width() < 1200) {
    $('body').removeClass('mobile-nav-active');
    $('#menu-line-icon').removeClass('change');
    $('.nav-menu a').removeClass('active');
  }
});

// 🔴 Common Navigation Handle (Close and Scroll) ----------->
$(document).on('click', function (e) {
  const $target = $(e.target);
  const isMobileNavActive = $('body').hasClass('mobile-nav-active');

  const isClickOutside = !$target.closest('.mobile-nav-toggle, .nav-menu, .mobile-nav').length;

  if (isMobileNavActive && isClickOutside) {
    $('body').removeClass('mobile-nav-active');
    $('#menu-line-icon').removeClass('change');
  }
});

// 🔴 Contact Form (With Loading, Success, Error) ----------->
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form-submition');
  if (!form) return;

  const loading = form.querySelector('.sending-message');
  const errorMsg = form.querySelector('.error-message');
  const successMsg = form.querySelector('.confirm-message');

  const showMessage = (el, duration = 5000) => {
    el.style.display = 'flex';
    setTimeout(() => {
      hideMessage(el);
    }, duration);
  };

  const hideMessage = (el) => {
    el.style.display = 'none';
  };

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    showMessage(loading, 5000);
    hideMessage(errorMsg);
    hideMessage(successMsg);

    const formData = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      hideMessage(loading);

      if (response.ok) {
        showMessage(successMsg);
        form.reset();
      } else {
        const result = await response.json();
        errorMsg.innerText = result.message || 'Something went wrong! Please try again.';
        showMessage(errorMsg);
      }
    } catch (error) {
      hideMessage(loading);
      errorMsg.innerText = 'Lost connection? Please check your internet.';
      showMessage(errorMsg);
    }
  });
});

// 🔴 Desktop Specific hook (Convert Into Sidebar) ----------->
document.body.classList.add("desktop-compact");
