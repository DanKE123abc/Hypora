const EventEmitter = require('events');
const { ipcMain } = require('electron');
const emitter = new EventEmitter();

// 菜单栏模板
const menuTemplate = [
    {
        label: '文件',
        submenu: [
            {
                label: '新建',
                accelerator: 'CmdOrCtrl+N',
                click: function () {
                    emitter.emit('action','new');
                }
            },
            {
                label: '新建窗口',
                accelerator: 'CmdOrCtrl+Shift+N',
                click: function () {
                    emitter.emit('action','new-win');
                }
            },
            {type: 'separator'},
            {
                label: '打开',
                accelerator: 'CmdOrCtrl+O',
                click: function () {
                    emitter.emit('action','open');
                }
            },
            {type: 'separator'},
            {
                label: '保存',
                accelerator: 'CmdOrCtrl+S',
                click: function () {
                    emitter.emit('action','save');
                }
            },
            {
                label: '另存为',
                accelerator: 'CmdOrCtrl+Shift+S',
                click: function () {
                    emitter.emit('action','save-as');
                }
            },
            {type: 'separator'},
            {
                label: '关闭',
                accelerator: 'CmdOrCtrl+W',
                click: function () {
                   emitter.emit('action','quit');
                }
            },
        ]
    },
    {label: '编辑',
        submenu: [
            { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
            { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
            { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
            { label: '删除', accelerator: 'CmdOrCtrl+D', role: 'delete' },
            { type: 'separator' },  //分隔线
            { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectall' },
        ]
    },
    {
        label: '段落',
        submenu: [
            {
                label: '一级标题',
                accelerator: 'CmdOrCtrl+1',
                click: function () {
                    emitter.emit('set-title', 1);
                }
            },
            {
                label: '二级标题',
                accelerator: 'CmdOrCtrl+2',
                click: function () {
                    emitter.emit('set-title', 2);
                }
            },
            {
                label: '三级标题',
                accelerator: 'CmdOrCtrl+3',
                click: function () {
                    emitter.emit('set-title', 3);
                }
            },
            {
                label: '四级标题',
                accelerator: 'CmdOrCtrl+4',
                click: function () {
                    emitter.emit('set-title', 4);
                }
            },
            {
                label: '五级标题',
                accelerator: 'CmdOrCtrl+5',
                click: function () {
                    emitter.emit('set-title', 5);
                }
            },
            {
                label: '六级标题',
                accelerator: 'CmdOrCtrl+6',
                click: function () {
                    emitter.emit('set-title', 6);
                }
            },
            { type: 'separator' },
            {
                label: '公式块',
                click: function () {
                    emitter.emit('edit','set-formula');
                }
            },
            {
                label: '代码块',
                click: function () {
                    emitter.emit('edit','set-code');
                }
            },
            { type: 'separator' },
            {
                label: '引用',
                click: function () {
                    emitter.emit('edit','set-quote');
                }
            },
            { type: 'separator' },
            {
                label: '有序列表',
                click: function () {
                    emitter.emit('editor','ordered-list');
                }
            },
            {
                label: '无序列表',
                click: function () {
                    emitter.emit('editor','unordered-list');
                }
            },
            {
                label: '任务列表',
                click: function () {
                    emitter.emit('editor','task-list');
                }
            },
            { type: 'separator' },
            {
                label: '脚注',
                click: function () {
                    emitter.emit('edit','set-footnote');
                }
            },
            { type: 'separator' },
            {
                label: '水平分割线',
                click: function () {
                    emitter.emit('edit','set-divider');
                }
            },
        ]
    },
    {
        label: '格式',
        submenu: [
            {
                label: '加粗',
                accelerator: 'CmdOrCtrl+B',
                click: function () {
                    emitter.emit('editor','bold');
                }
            },
            {
                label: '斜体',
                accelerator: 'CmdOrCtrl+I',
                click: function () {
                    emitter.emit('editor','italic');
                }
            },
            {
                label: '下划线',
                accelerator: 'CmdOrCtrl+U',
                click: function () {
                    emitter.emit('editor','underline');
                }
            },
            {
                label: '代码',
                click: function () {
                    emitter.emit('editor','code');
                }
            },
            { type: 'separator' },
            {
                label: '删除线',
                click: function () {
                    emitter.emit('editor','deleteline');
                }
            },
            {
                label: '注释',
                click: function () {
                    emitter.emit('editor','comment');
                }
            },

        ]
    },
    {
        label: '视图',
        submenu: [
            {
                label: '大纲',
                click: function () {
                    emitter.emit('view','toggleOutline');
                }
            },
            { type: 'separator' },
            {
                label: '源代码模式',
                click: function () {
                    emitter.emit('view','toggleSourceMode');
                }
            },
            { type: 'separator' },
            {
                label: '只读模式',
                click: function () {
                    emitter.emit('view','toggleEditorLock');
                }
            },
            {
                label: '打字机模式',
                click: function () {
                    emitter.emit('view','toggleTypewriterMode');
                }
            },
            { type: 'separator' },
            {
                label: '状态栏',
                click: function () {
                    emitter.emit('view','toggleBottomBar');
                }
            },
            { type: 'separator' },
            {
                label: '开发者工具',
                click: function () {
                    emitter.emit('view','chromiumDevTools');
                }
            },
        ]
    },
    {
        label: '主题',
        submenu: [
            {
                label: 'Classic',
                click: function () {
                    emitter.emit('theme','classic');
                }
            },
            {
                label: 'Dark',
                click: function () {
                    emitter.emit('theme','dark');
                }
            },
        ]
    },
    {
        label: '帮助',
        submenu: [
            {
                label: '关于',
                click: function () {
                    emitter.emit('help','about');
                }
            },
            //{
            //    label: '开源许可证',
            //    click: function () {
            //        emitter.emit('help','opensource');
            //    }
            //},
        ]
    },
];

const contextMenuTemplate = [
    { label: '剪切', accelerator: 'CmdOrCtrl+X', role: 'cut' },
    { label: '复制', accelerator: 'CmdOrCtrl+C', role: 'copy' },
    { label: '粘贴', accelerator: 'CmdOrCtrl+V', role: 'paste' },
    { label: '删除', accelerator: 'CmdOrCtrl+D', role: 'delete' },
    { label: '全选', accelerator: 'CmdOrCtrl+A', role: 'selectall' },
    { type: 'separator' },
    { label: '复制/粘贴为...',
        submenu: [
            {
                label: '复制为纯文本',
                click: function () {
                    emitter.emit('editor','copy2text');
                }
            },
            { type: 'separator' },
            {
                label: '粘贴为Markdown',
                click: function () {
                    emitter.emit('editor','paste2md');
                }
            },
        ]
    },
    { type: 'separator' },
    {
        label: '格式',
        submenu: [
            {
                label: '加粗',
                click: function () {
                    emitter.emit('editor','bold');
                }
            },
            {
                label: '斜体',
                click: function () {
                    emitter.emit('editor','italic');
                }
            },
            {
                label: '下划线',
                click: function () {
                    emitter.emit('editor','underline');
                }
            },
            {
                label: '引用',
                click: function () {
                    emitter.emit('edit','set-quote');
                }
            },
            {
                label: '有序列表',
                click: function () {
                    emitter.emit('editor','ordered-list');
                }
            },
            {
                label: '无序列表',
                click: function () {
                    emitter.emit('editor','unordered-list');
                }
            },
            {
                label: '任务列表',
                click: function () {
                    emitter.emit('editor','task-list');
                }
            },
    ]
    },
    {
        label: '段落',
        submenu: [
            {
                label: '一级标题',
                accelerator: 'CmdOrCtrl+1',
                click: function () {
                    emitter.emit('set-title', 1);
                }
            },
            {
                label: '二级标题',
                accelerator: 'CmdOrCtrl+2',
                click: function () {
                    emitter.emit('set-title', 2);
                }
            },
            {
                label: '三级标题',
                accelerator: 'CmdOrCtrl+3',
                click: function () {
                    emitter.emit('set-title', 3);
                }
            },
            {
                label: '四级标题',
                accelerator: 'CmdOrCtrl+4',
                click: function () {
                    emitter.emit('set-title', 4);
                }
            },
            {
                label: '五级标题',
                accelerator: 'CmdOrCtrl+5',
                click: function () {
                    emitter.emit('set-title', 5);
                }
            },
            {
                label: '六级标题',
                accelerator: 'CmdOrCtrl+6',
                click: function () {
                    emitter.emit('set-title', 6);
                }
            }
        ]

    },
    {
        label: '插入',
        submenu: [
            {
                label: '脚注',
                click: function () {
                    emitter.emit('edit','set-footnote');
                }
            },
            {
                label: '水平分割线',
                click: function () {
                    emitter.emit('edit','set-divider');
                }
            },
            {
                label: '代码块',
                click: function () {
                    emitter.emit('edit','set-code');
                }
            },
            {
                label: '公式块',
                click: function () {
                    emitter.emit('edit','set-formula');
                }
            },

        ]
    },
];

const aboutDialog = {
    type: 'info',
    title: '关于 Hypora',
    message: ' Hypora 是一款类似于 Typora 的 Markdown 文本编辑器 \n\n 开源地址：https://github.com/DanKE123abc/Hypora \n\n' +
        'Hypora是自由软件，你不需要支付任何费用就可以使用、复制、修改它，不过，你的行为受 MIT 协议约束。详见：https://github.com/DanKE123abc/Hypora/blob/main/LICENSE \n\n' +
        'Hypora在开发时，使用了部分优秀的开源项目，Hypora在遵守开源协议的同时在此附上使用的开源项目及其开发者、归属协议名单：https://github.com/DanKE123abc/Hypora/blob/main/OpenSourceLicense.md \n\n' +
        ' 作者：DanKe \n' +
        ' 版本：1.0.0',
    buttons: ['确定']
}

module.exports = {
    menuTemplate : menuTemplate,
    contextMenuTemplate : contextMenuTemplate,
    emitter : emitter,
    aboutDialog : aboutDialog
};
