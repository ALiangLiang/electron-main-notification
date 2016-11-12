const {
  ipcMain,
  BrowserWindow
} = require('electron')
const path = require('path')

var window = null
var callbacks = {}

module.exports = function(title, opts, onClick, onClose) {
  if (window) return sendNotification(title, opts, onClick, onClose)

  window = new BrowserWindow({
    show: false
  })
  window.loadURL('file://' + path.join(__dirname, '/fake-browser.html'))
  window.on('ready-to-show', () => {
    sendNotification(title, opts, onClick, onClose)
  })

  ipcMain.on('display-notification-onclick', (event, uid) => {
    if (!callbacks[uid]) return
    callbacks[uid].call(this)
  })
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const
      r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function sendNotification(title, opts, onClick, onClose) {
  var uidClick = uuid()
  var uidClose = uuid()
  if (onClick) callbacks[uidClick] = onClick
  if (onClose) callbacks[uidClose] = onClose
  window.webContents.send('display-notification', {
    title: title,
    opts: opts,
    uidClick: uidClick,
    uidClose: uidClose
  })
}
