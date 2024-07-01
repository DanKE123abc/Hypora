const { ipcMain, app, session, BrowserWindow, Menu, MenuItem } = require('electron');
const path = require('path');
const fs = require('fs');
const menu = require('./menu');
const remote = require('@electron/remote/main');
const {spawn} = require("child_process");

let win; // 将win声明为全局变量

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.webContents.setIgnoreMenuShortcuts(false);
    remote.initialize();
    remote.enable(win.webContents);
    win.loadFile('index.html'); // 确保您的HTML文件名与此处匹配

    win.on('close', function (e) {
        // 阻止默认关闭事件
        e.preventDefault();
        win.webContents.send("quit");
    });
}

// 创建菜单栏
const mainMenu = Menu.buildFromTemplate(menu.menuTemplate);
Menu.setApplicationMenu(mainMenu);

// 监听 app 准备就绪事件
app.whenReady().then(() => {
    createWindow();
    menu.emitter.on("action", (args) => {
        switch(args) {
            case 'new': // 新建
                const { spawn } = require('child_process');
                win.webContents.send('new');
                break;
            case 'new-win':
                const { spawn } = require('child_process');
                break;
            default:
                win.webContents.send(args);
        }
    });
    menu.emitter.on("editor", (args) => {
        win.webContents.send("editor", args);
    });
    menu.emitter.on("view", (args) => {
        switch (args) {
            case 'chromiumDevTools':
                win.webContents.openDevTools();
                break;
        }
        win.webContents.send('view', args);
    });
    menu.emitter.on("theme", (args) => {
        win.webContents.send('theme', args);
    });
    menu.emitter.on("help", (args) => {
        win.webContents.send('help', args);
    });
    menu.emitter.on("set-title", (args) => {
        win.webContents.send('set-title', args);
    });
    win.setIcon(path.join(__dirname, 'assets/icon.ico'));

    win.once('ready-to-show', () => {
        const filePath = process.argv[1];

        if (filePath && fs.existsSync(filePath)) {
            console.log(`文件路径已找到: ${filePath}`);
            ipcMain.on('isInit', function() {
                win.webContents.send('open_cmd', filePath);
            });
        } else {
            console.error('未找到有效的文件路径参数');
        }
    });

});

// 监听 app 所有窗口关闭事件
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// 监听 app 激活事件
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on('exit', function() {
    win.destroy();
});




