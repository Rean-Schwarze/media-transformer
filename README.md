# 多媒体文件格式转换软件

使用现代化设计的多媒体文件格式转换软件，支持音频、视频、图片多种格式相互转换。

![image-20240702230334827](https://rean-blog-bucket.oss-cn-guangzhou.aliyuncs.com/assets/essay/image-20240702230334827.png)

![image-20240702230458765](https://rean-blog-bucket.oss-cn-guangzhou.aliyuncs.com/assets/img/image-20240702230458765.png)

2024/07/16更新：玛雅 这个b我一定要装 确实没想到这个nbcs的选题能拿第1

![image-20240716115542570](https://rean-blog-bucket.oss-cn-guangzhou.aliyuncs.com/assets/img/image-20240716115542570.png)

------

## 功能一览

### 主题切换

软件会自动检测系统所使用的主题（深色、浅色），自动切换主题，也可以手动点击右上角按钮进行切换

### 音频转换

![image-20240702231818629](https://rean-blog-bucket.oss-cn-guangzhou.aliyuncs.com/assets/img/image-20240702231818629.png)

#### 转换参数

- 批量上传文件上限：10
- 支持导入文件格式：.mp3, .ogg, .wav, .flac, .m4a
- 支持导出文件格式：.mp3, .wav, .flac
- 支持采样率：44100 Hz、48000 Hz
- 支持导出mp3比特率（kbps）：64、128、192、256、320
- 支持导出wav位深（bit）：8、16、24、32(浮点数)
- 支持导出flac位深（bit）：16、24、32
- 支持导出flac压缩率：0~8

### 视频转换

![image-20240702232431028](https://rean-blog-bucket.oss-cn-guangzhou.aliyuncs.com/assets/img/image-20240702232431028.png)

#### 视频预览

![image-20240702232459845](https://rean-blog-bucket.oss-cn-guangzhou.aliyuncs.com/assets/img/image-20240702232459845.png)

#### 转换参数

- 批量上传文件上限：10
- 支持导入文件格式：.mp4, .mov, .mkv, .ts
- 支持导出文件格式：.aac, .mp4, .mov
- 支持抽取aac音频流
- 支持转换封装（复制视频流、音频流）
- 支持导出视频帧率（fps）：与源相同、24、25、30、60
- 支持导出视频编码预设：全部
- 支持导出视频编码crf：18~28
- 支持导出视频固定比特率（kbps）：1000~12000

### 图片转换

#### 图片预览

![image-20240702233145964](https://rean-blog-bucket.oss-cn-guangzhou.aliyuncs.com/assets/img/image-20240702233145964.png)

#### 转换参数

- 批量上传文件上限：10
- 支持导入文件格式：.jpg/.jpeg, .png, .bmp, .webp, .jfif
- 支持导出文件格式：.jpeg, .png, .webp



## 已知问题

1. 转换视频时设置分辨率参数无效
2. 转换视频编码时速度很慢（As of now, WebAssembly is still a lot slower than native. 来源：[FAQ | ffmpeg.wasm (ffmpegwasm.netlify.app)](https://ffmpegwasm.netlify.app/docs/faq/#why-ffmpegwasm-is-so-slow-comparing-to-ffmpeg)）



## 更新日志

### 2024/07/02

#### 新增

1. 新增对.ts格式的支持

#### 修复

1. 修复图片预览弹窗有时关闭按钮无法点击的问题
2. 修复某些下拉框选项无法选择的问题
3. 修复视频设置中某些设置未正常清空的问题

#### 优化

1. 优化音频设置flac中压缩率选项显示
2. 优化视频设置中crf选项显示
3. 优化视频转换导出文件名

### 2024/06/23

#### 修复

1. 修复批量设置后添加/删除功能失效的问题
2. 手动释放URL对象

### 2024/06/16

#### 修复

1. 修复ffmpeg加载失败的问题
