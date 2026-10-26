// Sewen TV launcher loader: registers extra remote keys, nothing else.
(function () {
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
})();
