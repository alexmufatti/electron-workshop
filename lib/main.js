// TODO: you will implement this!
const electron = require('electron');

const BrowserWindow = electron.BrowserWindow
const path = require('path')
const fs = require('fs')
const dialog = electron.dialog
const Menu = electron.Menu
const sys = require('sys')
const exec = require('child_process').exec;
var child;
var app = electron.app;



function openFile () {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
    { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
  ]
  })

  if (!files) return

  const file = files[0]

  const content = fs.readFileSync(file).toString()

  app.addRecentDocument(file)
  mainWindow.webContents.send('file-opened', file, content)

}

function saveFile (content) {
  const file = dialog.showSaveDialog(mainWindow, {
    properties: ['saveFile'],
    filters: [
    { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] }
  ]
  })




  fs.writeFileSync(file, content);

  mainWindow.webContents.send('file-saved', file)

}

app.on('ready', () => {
  console.log('The application is ready.')

  mainWindow = new BrowserWindow({width: 600, height: 700, title:'My beautiful application', x:0, y:0, frame: false})
  mainWindow.webContents.openDevTools()
  mainWindow.setAlwaysOnTop(false);

  mainWindow.loadURL('file://' + path.join(__dirname, 'index.html'))

  // This event fires once the browser window's DOM is loaded

    mainWindow.webContents.on('did-finish-load', () => {
      //openFile()
    })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})


const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open...',
        accelerator: 'CmdOrCtrl+O',
        click () { openFile() }
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click () { saveFile() }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: 'Developer',
    submenu: [
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin'
          ? 'Alt+Command+I'
          : 'Ctrl+Shift+I',
        click () { mainWindow.webContents.toggleDevTools() }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  const name = app.getName()
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click () { app.quit() }
      }
    ]
  })
}
function execCmd (cmd) {
child = exec(cmd, function (error, stdout, stderr) {
  mainWindow.webContents.send('cmd-out', stdout)

  if (error !== null) {
    mainWindow.webContents.send('cmd-error', stderr)
  }
});
}

exports.openFile = openFile
exports.saveFile = saveFile
exports.execCmd = execCmd
