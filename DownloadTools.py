import requests,re,os,time,shutil

url="https://unpkg.com/"
mod="vditor"
version=""
headers={ 'Accept-Language': 'zh-CN,zh;q=0.8',
            'Content-Type': 'text/html;Charset=utf-8',
            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36"
            }
#获取HTML
def getHTML(url,encoding='utf-8'):
    rd = requests.get(url, params=None, headers=headers)
    rd.encoding = encoding
    return rd.text

#获取版本
def getVsions(m):
    h=getHTML(url+m+'/')
    j=re.findall(r'<select name="version"(.*?)</select>', h,re.S)[0]
    patt = re.compile(r'<option.+?>(.+?)</option>')
    option = patt.findall(j)
    return option

#扫描目录
def getPaths(v,p='/',files=[],folders=[]):
    h=getHTML(url+v+p)
    t=re.findall(r'<table(.*?)</table>', h,re.S)[0]
    href = re.findall('href="(.*?)"',t)
    for name in href:
        path=p+name
        #if name in ['../','LICENSE'] or not 'iconfont' in path:#material-design-icons
        if name in ['../','LICENSE'] or path in ['/packages/','/types/','/dist/docs/','/docs/','/samples/',"/test/","/locale/"] :#跳过
            continue
        print(path)
        if name[-1]=='/':
            folders.append(path)
            getPaths(v,path,files,folders)
        else:
            files.append(path)
    return {"files":files,"folders":folders}

#创建目录
def makeDirs(dirs,p):
    if p==None:
        p='./'
    for  i in dirs:
        path=p+i
        if not os.path.exists(path):
            print("创建目录",path)
            os.makedirs(path)

#下载文件
def download(url,path=None):#dir=保存文件夹路径
    if not os.path.exists(path):
        print("下载:",url)
        r=requests.get(url)
        t=str(time.time())+'.'+str(pid)+'.tmp'
        open(t, 'wb').write(r.content)
        shutil.move(t, path)
    else:
        print("文件已存在")

pid=os.getpid()
print(url+mod+'/')
versions=getVsions(mod)
print("所有版本:",versions)
version=mod+'@'+versions[-1]
print("默认版本:",version)
paths=getPaths(version)
makeDirs(paths["folders"],version)
for i in paths["files"]:
    u=url+version+i
    download(u,version+'/'+i)
print("完成")