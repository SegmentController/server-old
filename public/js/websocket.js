var socket = null;

const reconnect_ms = 1234;
function socket_open() {
  socket = null;

  try {
    var wsproto = (location.protocol == 'https:') ? 'wss:' : 'ws:';
    socket = new WebSocket(wsproto + '//' + location.host + '/ws');

    socket.onopen = function (event) {
      setTimeout(function () { socket.send('hello') }, 75);

      if (window.jQuery)
        $('.ws-indicator').addClass('online');

      if (typeof ws_channels !== 'undefined') {
        let i = 0;
        for (const key of Object.keys(ws_channels))
          setTimeout(function (channel) {
            socket.send(JSON.stringify({ command: 'subscribe', channel: channel }));
          }, 10 + 150 * ++i, key);
      }
    };

    socket.onclose = function (event) {
      if (window.jQuery)
        $('.ws-indicator').removeClass('online');
      setTimeout(function () { socket_open(); }, reconnect_ms);
    };

    var timeout = null;
    socket.onmessage = function (event) {
      try {
        if (json = JSON.parse(event.data))
          if (json.channel) {
            if (typeof ws_channels !== 'undefined')
              for (const [key, value] of Object.entries(ws_channels))
                if (key == json.channel)
                  if (typeof value === 'function') {
                    delete json.channel;
                    setTimeout((delegation) => delegation.value(delegation.json), 1, { value, json });
                  }
          }
          else {
            if (typeof ws_onreceive === 'function')
              setTimeout((jsontosend) => ws_onreceive(jsontosend), 1, json);
          }
      }
      catch (ex) { }
    };
  }
  catch (ex) { }
}

function socket_send(msg) {
  try {
    if (socket && socket.readyState == 1) {
      socket.send(msg);
      return true;
    }
  }
  catch (ex) { }

  return false;
}

if (window.jQuery)
  $(function () {
    if ("WebSocket" in window)
      if (typeof ws_channels !== 'undefined')
        socket_open();
  });
