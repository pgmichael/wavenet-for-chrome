// Nasty hack that ensures that the service worker doesn't become idle by pinging
// it every X seconds. This shouldn't be necessary but there is a bug in MV3 that makes
// service worker not handle messages on `sendMessage` when it is idle (re-actives the
// worker, but doesn't handle incoming messages).
export function Heartbeat() {
  const sendMessage = function() {
    try {
      chrome.runtime.sendMessage({ id: 'ping' })
    } catch (e) {}
  }

  sendMessage()
  setInterval(sendMessage, 10000)
}
