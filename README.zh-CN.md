<div align="center">
  <img src="assets/vidogo-brand-icon.png" alt="VidoGo Basic" width="144">
  <h1>VidoGo Basic</h1>
  <p>面向 Windows 的在线视频识别、下载与录制桌面工具。</p>
  <p><a href="README.md">English</a> · <strong>中文</strong></p>
  <p>
    <img alt="版本" src="https://img.shields.io/badge/version-0.1.6-1688f0">
    <img alt="平台" src="https://img.shields.io/badge/platform-Windows%20x64-0078d4">
    <img alt="许可证" src="https://img.shields.io/badge/license-MIT-22a06b">
  </p>
</div>

---

## 下载

[下载 VidoGo Basic 0.1.6 Windows x64 安装包](https://github.com/Imoot-TT/VidoGo-Basic/releases/tag/basic-v0.1.6)

## 主要功能

- 在应用内直接浏览视频网站。
- 识别普通视频、HLS 和 DASH 媒体。
- 识别并下载视频、MP3、图片和字幕资源。
- 选择可用的画质和编码格式。
- 复用浏览器登录状态执行下载。
- 录制非 DRM 的 HTML 视频。
- 在本地管理下载、历史记录和收藏夹。

## 从源码运行

```powershell
npm install
python -m pip install -r requirements.txt
npm start
```

## 素材归档

同一来源内容只创建一个素材项目目录，并按类型归档：

```text
VidoGo Basic/YouTube/标题 [媒体 ID]/
├─ video/       视频及不同画质版本
├─ audio/       提取的 MP3
├─ images/      唯一的一份 cover.*，以及图集图片
├─ subtitles/   按语言区分的字幕
└─ metadata.json
```

再次下载同一内容时会复用该目录和已有封面，不会为视频、音频或封面按钮分别创建项目。

## 许可证

MIT
