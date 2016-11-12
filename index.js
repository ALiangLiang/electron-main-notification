const { ipcMain, BrowserWindow } = require('electron')
const uuid = require('uuid')
const path = require('path')

var window = null
var callbacks = {}

module.exports = function (title, opts, onClick, onClose) {
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

function sendNotification (title, opts, onClick, onClose) {
  var uidClick = uuid.v1()
  var uidClose = uuid.v1()
  if (onClick) callbacks[uidClick] = onClick
  if (onClose) callbacks[uidClose] = onClose
  window.webContents.send('display-notification', {
    title: title,
    opts: opts,
    uidClick: uidClick,
    uidClose: uidClose
  })
}
