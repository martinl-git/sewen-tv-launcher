// Sewen TV launcher module. TizenBrew evaluates this in every page the launcher module opens: tv.lan, and
// the sites the launcher opens in place (Wants, HA, Cricket; punch list #12). It runs through TizenBrew's
// debugger, so a site's own CSP cannot stop it. Off tv.lan: red = home, Back = a page back (home if stuck).
// YouTube opens in place too (punch list #22): TizenTube runs here, and YouTube's own quit comes home.
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
  var YOUTUBE = location.hostname === 'www.youtube.com';
  if (YOUTUBE) {
    // YouTube quits with window.close() (second Back on its home; seen on the TV 2026-10-26): come home instead
    // of closing TizenBrew onto the Samsung menu. Back itself stays YouTube's.
    window.close = function () { location.href = TV + '/'; };
    tizenTube();
  }
  // Back (punch list #16) = a page back inside the site; from its first page that is tv.lan, which opened
  // the site in place. If nothing navigates within BACK_MS (empty history, a redirect), go home instead.
  // An open overlay panel takes Back first: its window-level listener stops the key before it gets here.
  var BACK_MS = 800, backTimer = null;
  function cancelBack() { if (backTimer !== null) { clearTimeout(backTimer); backTimer = null; } }
  ['popstate', 'pagehide', 'beforeunload'].forEach(function (t) { window.addEventListener(t, cancelBack); });
  function back() {
    var from = location.href;
    cancelBack();
    backTimer = setTimeout(function () {
      backTimer = null;
      if (location.href === from) location.href = TV + '/';
    }, BACK_MS);
    history.back();
  }
  // The element that really has focus, through open shadow roots (HA): document.activeElement stops at the host.
  function focused() {
    var a = document.activeElement, n = 0;
    while (a && a.shadowRoot && a.shadowRoot.activeElement && n++ < 32) a = a.shadowRoot.activeElement;
    return a;
  }
  // A text field keeps Back for the on-screen keyboard (same rule as the jellyseerr and overlay scripts).
  function textEntry(el) {
    if (!el) return false;
    var tag = String(el.tagName || '').toUpperCase();
    if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (tag === 'INPUT') return !/^(button|submit|reset|image|checkbox|radio)$/i.test(String(el.type || ''));
    return el.isContentEditable === true;
  }
  // Red button = back to Sewen TV, from any site (its overlay panel may be blocked by the site's CSP).
  document.addEventListener('keydown', function (e) {
    if (e.keyCode === 403) { e.preventDefault(); location.href = TV + '/'; }
    else if (e.keyCode === 10009 && !YOUTUBE && !textEntry(focused())) { e.preventDefault(); if (!e.repeat) back(); }
  }, true);
  // TizenTube (ad-free YouTube) at a fixed version, checked against its SHA-384 (the same hash as
  // static/mods/youtube.js). youtube.com's CSP (nonce + Trusted Types) refuses <script src> from elsewhere, so the
  // code is fetched, verified and run through a Trusted Types policy. On any failure YouTube still works, with ads.
  function tizenTube() {
    var URL_ = 'https://cdn.jsdelivr.net/npm/@foxreis/tizentube@1.15.2/dist/userScript.js';
    var SHA384 = 'MSKNY76lINCj3cOJ/aIlev7oAaZVdVIF3+BLlMFZlJD5GjLbxkzTAYYHHqcRxkiP';
    fetch(URL_, { credentials: 'omit' }).then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
      return crypto.subtle.digest('SHA-384', buf).then(function (d) {
        var b = new Uint8Array(d), bin = '';
        for (var i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]);
        if (btoa(bin) !== SHA384) return;
        var code = new TextDecoder().decode(buf), tt = window.trustedTypes;
        var policy = tt && tt.createPolicy ? tt.createPolicy('sewen-tizentube', { createScript: function (x) { return x; } }) : null;
        (0, eval)(policy ? policy.createScript(code) : code);
      });
    }).catch(function () {});
  }
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
