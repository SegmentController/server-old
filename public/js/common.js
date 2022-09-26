function rgb2hex(rgb, usehashmark) { return (usehashmark ? '#' : '') + `${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => Number.parseInt(n, 10).toString(16).padStart(2, '0')).join('')}` }

Number.prototype.between = function (a, b) { return this >= Math.min.apply(Math, [a, b]) && this <= Math.max.apply(Math, [a, b]); }

function pagereload(latencyms) {
  if (latencyms === undefined)
    window.location.reload();
  else
    setTimeout(function () { pagereload(undefined); }, latencyms);
}

function divreload(element, onready, latencyms) {
  if (latencyms === undefined)
    $('#' + element).load(window.location.href + ' #' + element + " > *", function () {
      if (onready)
        onready();
    });
  else
    setTimeout(function () { divreload(element, onready, undefined); }, latencyms);
}

var elem = document.documentElement;
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen();
  }
}

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
})
const ToastSuccess = Toast.mixin({ icon: 'success', timer: 1500 })
const ToastInfo = Toast.mixin({ icon: 'info' })
const ToastError = Toast.mixin({ icon: 'error' })
const ToastWarning = Toast.mixin({ icon: 'warning' })

function initContextMenus(selector) {
  $(function () {
    $('body').on('contextmenu', selector, function (e) {
      $('.context-menu').hide();

      const menu = $(e.currentTarget).find('.context-menu')
      if (menu.length) {
        $(menu[0]).css({
          display: "block",
          left: e.offsetX,
          top: e.offsetY,
        });
        return false
      }
    });
  })
}

if (window.jQuery)
  $(function () {
    $('html').on('click', function () {
      $('.context-menu').hide();
    });
    $('html').on('click', function () {
      //$('.bs-menu').hide();
    });

    // $('html').on('contextmenu', function () {
    //   $('.context-menu').hide();
    //   return false
    // });

    $(".dropdown-instant").on('mouseenter', function () {
      const dropdownMenu = $(this).children(".dropdown-menu");
      if (dropdownMenu) {
        if (dropdownMenu.hasClass('dropend'))
          dropdownMenu.css({ left: '100%', right: 'auto', top: '-8px' })
        dropdownMenu.show();
      }
    });
    $(".dropdown-instant").on('mouseleave', function () {
      const dropdownMenu = $(this).children(".dropdown-menu");
      if (dropdownMenu) dropdownMenu.hide();
    });
  })
