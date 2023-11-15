使用需求：我一般都是按照类型分类存电影，有的时候不止一块硬盘，互相翻看基本信息实在麻烦，不如把这些视频的基本信息打印在一个txt文件上如图：（如果该视频读不出来比特率之类信息就不显示，鼠标可以右键属性查看该视频是否有比特率之类信息）
 

需要使用的工具：ffmpeg+nodeJS
ffmpeg部分：
操作方法：确保电脑安装了ffmpeg工具： 




第二步选择图中这个进行下载






把下载好的文件解压到自定义的文件夹比如：



把bin目录设置成环境变量




nodeJS部分：
确保电脑安装了nodeJS：
Node.js (nodejs.org)

选择安装稳定版本，然后配置环境变量：
这里举例是我的安装的地址
D:\tools\nodejs\node_global




打开cmd输入以下操作配置nodeJS
npm config set prefix 'D:\tools\nodejs\node_global'
npm config set cache 'D:\tools\nodejs\node_cache'

这里还是我的安装路径举例，根据自己的安装地址动态变化后面的内容




下载我的工具解压到需要打印的文件夹下（该工具打印此文件夹的所有子文件夹内容，注意路径！）




下载依赖结束后，使用node执行脚本即可！输入以下指令
node videoMsg.js




如果视频内容非常多可能会需要个把分钟时间，耐心等待。
看到文件夹下面多了一个




具体配置内容如下：

根据自己的具体需求可以修改下面三个参数
const videoType: string[] = ['mp4', 'mkv', 'ts', 'rmvb']; //需要统计的视频格式类型
const minSizeInGB = 0.2; //大小GB，大于这个大小的文件才会被统计
const txtFileName = '1子文件夹里所有大文件的信息.txt'; //打印输出结果的文件名