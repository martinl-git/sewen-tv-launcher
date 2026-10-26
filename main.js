// Sewen TV launcher module. TizenBrew evaluates this in every page the launcher module opens: tv.lan, and
// the sites the launcher opens in place (Wants, HA, Cricket; punch list #12). It runs through TizenBrew's
// debugger, so a site's own CSP cannot stop it.
(function () {
  if (window.top !== window.self) return;   // never inside frames (Finances, the overlay panel)
  var TV = 'https://tv.lan.calmetech.net';
  var keys = [
    'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue',
    'MediaPlayPause', 'MediaPlay', 'MediaPause', 'MediaStop',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
  ];
  try {
    if (window.tizen && tizen.tvinputdevice) {
      tizen.tvinputdevice.registerKeyBatch(keys);
    }
  } catch (e) {
    // keys stay unregistered; arrows, Enter and Back still work
  }
  if (location.origin === TV) return;
  // Red button = back to Sewen TV, from any site (its overlay panel may be blocked by the site's CSP).
  document.addEventListener('keydown', function (e) {
    if (e.keyCode === 403) { e.preventDefault(); location.href = TV + '/'; }
  }, true);
  // The site scripts (overlay: long-press OK panel and pop-ups; spatial navigation) come from tv.lan.
  var SITES = { 'wants.lan.calmetech.net': 'jellyseerr', 'hass.lan.calmetech.net': 'hass', 'cric.lan.calmetech.net': 'cricket' };
  var site = SITES[location.hostname];
  if (!site) return;
  var parent = document.head || document.documentElement;
  ['launchcore', 'overlay', site].forEach(function (name) {
    var s = document.createElement('script');
    s.src = TV + '/static/mods/' + name + '.js';
    s.async = false;   // keep execution order
    parent.appendChild(s);
  });
})();
