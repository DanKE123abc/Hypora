const { ipcRenderer, app , clipboard} = require('electron');
const menu = require('./menu');
const path = require('path');
const {BrowserWindow, dialog, Menu , getCurrentWindow } = require('@electron/remote')
const fs = require('fs');

let isSave = true; // 初始状态无需保存
let currentFile = null; // 初始状态无文件路径
let isQuit = true;
let isInit = false;
let originalContent = null;

let isOutlineVisible = false;
let isBottomBarVisible = true;
let isEditorLock = false;
let isSourceMode = false;
let isTyprwriterMode = false;

var config = {
    height: "100%",
    value: "",
    mode: "ir",
    preview: {
        mode: "editor"
    },
    toolbar:[],
    toolbarConfig : {
        hide : true,
        pin : true
    },
    outline:{
        enable: false,
        position: "left"
    },
    typewriterMode: false,
    cdn: "./node_modules/vditor",
    after: () => {
        if (!isInit){
            initMd();
        }
    },
    counter :{
        enable : true,
        type: "markdown",
        after: (length, counter) => {
            document.getElementById('wordCount').textContent = `${length} 词`;
            contentModification();
        }
    },
    // _lutePath: './node_modules/vditor/src/js/lute/lute.min.js'
};

var vditor = new Vditor('vditor', config);


// 创建菜单
const contextMenu = Menu.buildFromTemplate(menu.contextMenuTemplate);
window.addEventListener('contextmenu', (e) => {
    e.preventDefault(); // 阻止默认的右键菜单
    contextMenu.popup(BrowserWindow.getFocusedWindow());
});
menu.emitter.on("editor", handleEditorCommand);
function handleEditorCommand(args) {
    switch (args) {
        case 'bold':
            const boldContent = "**" + vditor.getSelection() + "**";
            document.execCommand('insertText', false, boldContent);
            break;
        case 'italic':
            const italicContent = "*" + vditor.getSelection() + "*";
            document.execCommand('insertText', false, italicContent);
            break;
        case 'underline':
            const underlineContent = "<u>" + vditor.getSelection() + "</u>";
            document.execCommand('insertText', false, underlineContent);
            break;
        case 'code':
            const codeContent = "`" + vditor.getSelection() + "`";
            document.execCommand('insertText', false, codeContent);
            break;
        case 'deleteline':
            const deletelineContent = "~~" + vditor.getSelection() + "~~";
            document.execCommand('insertText', false, deletelineContent);
            break;
        case 'comment':
            const commentContent = "<!--" + vditor.getSelection() + "-->";
            document.execCommand('insertText', false, commentContent);
            break;
        case 'ordered-list':
            const orderedlistContent = "1. " + vditor.getSelection();
            document.execCommand('insertText', false, orderedlistContent);
            break;
        case 'unordered-list':
            const unorderedlistContent = "- " + vditor.getSelection();
            document.execCommand('insertText', false, unorderedlistContent);
            break;
        case 'task-list':
            const tasklistContent = "- [ ] " + vditor.getSelection();
            document.execCommand('insertText', false, tasklistContent);
            break;
        case 'set-quote':
            setQuote();
            break;
        case 'copy2text':
            const content = vditor.getSelection();
            if (content) {
                clipboard.writeText(content);
            }
            break;
        case 'paste2md':
            vditor.insertValue(vditor.html2md(clipboard.readText()));
            break;
    }
}

ipcRenderer.on('editor', (event, args) => {
    handleEditorCommand(args);
});

ipcRenderer.on('view', (event, args) => {
    switch (args) {
        case 'toggleOutline':
            toggleOutline(!isOutlineVisible);
            break;
        case 'toggleBottomBar':
            toggleBottomBar(!isBottomBarVisible);
            break;
        case 'toggleEditorLock':
            toggleEditorLock(!isEditorLock);
            break;
        case 'toggleTypewriterMode':
            toggleTypewriterMode(!isTyprwriterMode);
            break;
        case 'toggleSourceMode':
            toggleSourceMode(!isSourceMode);
            break;
    }
});

ipcRenderer.on('theme', (event, args) => {
    switch (args) {
        case 'classic':
            vditor.setTheme("classic","light");
            break;
        case 'dark':
            vditor.setTheme("dark","dark")
            break;
    }
});

ipcRenderer.on('help', (event, args) => {
    switch (args) {
        case 'about':
            dialog.showMessageBox(menu.aboutDialog);
            break;
    }
});

ipcRenderer.on('action',(event, args) =>{
    switch (args) {
        case 'new':
            initMd();
            break;
        case 'open':
            askSaveNeed();
            openFile();
            break;
        case 'save':
            saveCurrentMd();
            break;
        case 'save-as':
            currentFile = null;
            saveCurrentMd();
            break;
        case 'quit':
            askSaveNeed();
            if(isQuit) {
                ipcRenderer.send('exit');
            }
            break;
    }
});


menu.emitter.on("set-title", (numberOfHashes) => {
    setTitle(numberOfHashes)
});
ipcRenderer.on('set-title', (event,numberOfHashes) => {
    setTitle(numberOfHashes)
});
function setTitle(numberOfHashes) {
    const hashes = '#'.repeat(numberOfHashes);
    const content = hashes + " " + vditor.getSelection();
    vditor.focus();
    document.execCommand('insertText', false, content);
}


ipcRenderer.on('edit', (event,args) => {
    handleEditCommand(args);
});
menu.emitter.on("edit", handleEditCommand);
function handleEditCommand(args) {
    switch (args) {
        case 'set-formula':
            setFormula();
            break;
        case 'set-code':
            setCode();
            break;
        case 'set-quote':
            setQuote();
            break;
        case 'set-footnote':
            setFootnote();
            break;
        case 'set-divider':
            setDivider();
            break;
    }
}
function setDivider() { //水平分割线
    const content = '______';
    vditor.focus();
    document.execCommand('insertText', false, content);
}
function setCode() { //代码块
    const content = '```';
    vditor.focus();
    document.execCommand('insertText', false, content);
}
function setFormula() { //公式块
    const content = '$$';
    vditor.focus();
    document.execCommand('insertText', false, content);
}
function setFootnote() {
    const hashes = '[^]:';
    const content = hashes + " " + vditor.getSelection();
    vditor.focus();
    document.execCommand('insertText', false, content);
}
function setQuote() {
    const hashes = '>';
    const content = hashes + " " + vditor.getSelection();
    vditor.focus();
    document.execCommand('insertText', false, content);
}


ipcRenderer.on('open-cmd', (event, currentFilePath) => {
    currentFile = currentFilePath;
    const txtRead = readText(currentFile);
    vditor.setValue(txtRead);
    document.title = currentFile + ' - Hypora';
    originalContent = vditor.getValue();
    isSave = true;
    isInit = true;
});


function toggleTypewriterMode(bool) {
    isTyprwriterMode = bool;
    config.value = vditor.getValue();
    if(isTyprwriterMode)
    {
        config.typewriterMode = true;
        vditor.destroy();
        vditor = new Vditor('vditor',config);
        showToast('可在视图菜单中关闭','打字机模式 已开启');
    }
    else if(!isTyprwriterMode)
    {
        config.typewriterMode = false;
        vditor.destroy();
        vditor = new Vditor('vditor',config);
    }
    toggleEditorLock(isEditorLock);
    toggleOutline(isOutlineVisible)
    toggleSourceMode(isSourceMode);
}

function toggleSourceMode(bool) {
    isSourceMode = bool;
    config.value = vditor.getValue();
    if(isSourceMode)
    {
        config.mode = "sv";
        vditor.destroy();
        vditor = new Vditor('vditor',config);
    }
    else if(!isSourceMode)
    {
        config.mode = "ir";
        vditor.destroy();
        vditor = new Vditor('vditor',config);
    }
    toggleEditorLock(isEditorLock);
    toggleOutline(isOutlineVisible);
    toggleTypewriterMode(isTyprwriterMode);
}

function toggleEditorLock(bool) {
    isEditorLock = bool
    if(isEditorLock == false)
    {
        vditor.enable();
    }
    else if(isEditorLock == true)
    {
        vditor.disabled();
        showToast('可在视图菜单中关闭','只读模式 已开启');
    }
}

function toggleOutline(bool) {
    const outlineElement = document.querySelector('.vditor-outline');
    isOutlineVisible = bool;
    if (outlineElement) {
        outlineElement.style.display = isOutlineVisible ? 'block' : 'none';
    }
}

function toggleBottomBar(bool) {
    const bottomBar = document.getElementById('bottomBar');
    isBottomBarVisible = bool;
    if (bottomBar) {
        // 仅更改display属性，而不更改其他布局相关样式
        bottomBar.style.display = isBottomBarVisible ? 'flex' : 'none';
    }
    // 显示一个 Toast 消息
}

var sourceCodeModeCheckbox = document.getElementById('sourceCodeMode');
sourceCodeModeCheckbox.addEventListener('change', function() {
    var isChecked = sourceCodeModeCheckbox.checked;
    if (isChecked) {
        toggleSourceMode(true);
    } else {
        toggleSourceMode(false);
    }
});

var outlineCheckbox = document.getElementById('outline');
outlineCheckbox.addEventListener('change', function() {
    var isChecked = outlineCheckbox.checked;
    if (isChecked) {
        toggleOutline(true);
    } else {
        toggleOutline(false);
    }
});

function showToast(message, title = '通知', ms = 3000) {
    // 创建一个新的 div 元素，用于 Toast
    const toastElement = document.createElement('div');
    toastElement.className = 'toast';
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    toastElement.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">${title}</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">
      ${message}
    </div>
  `;

    // 将 Toast 元素添加到页面中
    var toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    toastContainer.appendChild(toastElement);

    // 初始化并显示 Toast
    const bootstrapToast = new bootstrap.Toast(toastElement);
    bootstrapToast.show();

    // 如果设置了自动隐藏，添加一个计时器来关闭 Toast
    if (ms > 0) {
        setTimeout(() => {
            bootstrapToast.hide();
        }, ms);
    }
}

function initMd() {
    currentFile = null;
    vditor.setValue('');
    document.title = 'Untitled - Hypora';
    isSave = true;
    isInit = true;
    originalContent = vditor.getValue();
    ipcRenderer.send('isInit');
}

function askSaveNeed() {
    // 检测是否需要执行保存命令
    if (isSave) {
        return;
    }
    // 弹窗类型为 message
    const options = {
        type: 'question',
        message: '请问是否保存当前文档？',
        buttons: [ 'Yes', 'No', 'Cancel']
    }
    // 处理弹窗操作结果
    const selection = dialog.showMessageBoxSync(getCurrentWindow() , options);
    // 按钮 yes no cansel 分别为 [0, 1, 2]
    if (selection === 0) {
        saveCurrentMd();
    } else if(selection === 1) {
        console.log('Cancel and Quit!');
    } else { // 点击 cancel 或者关闭弹窗则禁止退出操作
        console.log('Cancel and Hold On!');
        isQuit = false; // 阻止执行退出
    }
}

// 保存文档，判断新文档or旧文档
function saveCurrentMd() {
    // 新文档则执行弹窗保存操作
    if(!currentFile) {
        const options = {
            title: 'Save',
            filters: [
                { name: 'Markdown Files', extensions: ['md'] },
                { name: 'All Files', extensions: ['*'] }
            ]
        }
        const paths = dialog.showSaveDialogSync(getCurrentWindow(), options);
        if(paths) {
            currentFile = paths;
        }
    }
    // 旧文档直接执行保存操作
    if(currentFile) {
        const txtSave = vditor.getValue();
        saveText(currentFile, txtSave);
        isSave = true;
        document.title = currentFile + " - Hypora";
    }

}

function saveText( file, text ) {
    const fs = require('fs');
    fs.writeFileSync( file, text );
    originalContent = vditor.getValue();
}

// 选择文档路径
function openFile() {
    // 弹窗类型为openFile
    const options = {
        filters: [
            { name: 'Markdown Files', extensions: ['md'] },
            { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
    }
    // 处理弹窗结果
    const file = dialog.showOpenDialogSync(getCurrentWindow(), options);
    if(file) {
        currentFile = file[0];
        const txtRead = readText(currentFile);
        vditor.setValue(txtRead);
        document.title = currentFile + ' - Hypora';
        originalContent = vditor.getValue();
        isSave = true;
        isInit = true;
    }

}
// 读取文档方法
function readText(file) {
    const fs = require('fs');
    return fs.readFileSync(file, 'utf8');
}

//
function contentModification() {
    if (!(vditor === null)) {
        if (isSave) {
            if(originalContent !== null)
            {
                if(vditor.getValue() !== originalContent)
                {
                    isSave = false;
                    document.title = document.title.replace(/ - /g, '● - ');
                }
            }
        }
    }
}