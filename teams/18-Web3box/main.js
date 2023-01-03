// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
const mode = require("electron-is-dev");

let mainWindow;
let willQuitApp = false;
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    // frame:false,
    backgroundColor: '#111315',
    icon: './public/web3box.ico',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag:true,
      nodeIntegration:true
    },
  })
  // if(mode){
  //   mainWindow.loadURL("http://localhost:3000/")
  // }else{
  //   mainWindow.loadURL(url.format({
  //     pathname:path.join(__dirname,'./build/index.html'),
  //     protocol:'file:',
  //     slashes:true
  //   }))
  // }
  //mainWindow.webContents.openDevTools();
  // and load the index.html of the app.
  // mainWindow.loadFile('./public/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  return mainWindow;
}

function loadVite(port) {
  if (mode) {
    mainWindow.loadURL(`http://localhost:${port}`).catch((e) => {
      console.log('Error loading URL, retrying', e);
      setTimeout(() => {
        loadVite(port);
      }, 200);
    });
  } else {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, './build/index.html'),
      protocol: 'file:',
      slashes: true
    }))
  }

}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  mainWindow = createWindow();
  mainWindow.on('close', (e) => {
    if (willQuitApp) {
      mainWindow = null;
    } else {
      mainWindow.hide();
      mainWindow.setSkipTaskbar(true);
      e.preventDefault();
    }
  })
  loadVite(3000);
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.show();
    }
  })
})


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
app.on('before-quit', () => { willQuitApp = true });
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.