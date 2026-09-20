<div align="center">
  <img src="assets/vidogo-brand-icon.png" alt="VidoGo Basic" width="144">
  <h1>VidoGo Basic</h1>
  <p>面向 Windows 的在线视频识别、下载与录制桌面工具。</p>
  <p><a href="README.md">English</a> · <strong>中文</strong></p>
  <p>
    <img alt="版本" src="https://img.shields.io/badge/version-0.2.1-1688f0">
    <img alt="平台" src="https://img.shields.io/badge/platform-Windows%20x64-0078d4">
    <img alt="许可证" src="https://img.shields.io/badge/license-MIT-22a06b">
  </p>
</div>

---

## 下载

[下载 VidoGo Basic 0.2.1 Windows x64 安装包](https://github.com/Imoot-TT/VidoGo-Basic/releases/tag/basic-v0.2.1)

## 主要功能

- 粘贴一个公开或已授权的来源链接，生成完整创作者素材包。
- 识别普通视频、HLS 和 DASH 媒体。
- 识别并下载视频、MP3、图片和字幕资源。
- 选择可用的画质和编码格式。
- 复用浏览器登录状态执行下载。
- 录制非 DRM 的 HTML 视频。
- 在本地管理下载、历史记录和收藏夹。

同一来源的视频、MP3、字幕和封面只计 1 个 Free 项目。DRM 保护内容不受支持。

## 套餐

- Free：每天 5 个来源项目。
- Creator：US$39/年；验证期提供限量 US$59 创始买断。

可选匿名漏斗只记录媒体识别、成功保存、编辑器导入、第二次使用和购买等产品步骤；不会收集链接、标题、搜索词、文件名、路径、Cookie 或下载内容。

## 从源码运行

```powershell
npm install
python -m pip install -r requirements.txt
npm start
```

### 账户服务连接

登录、注册、套餐和订单由独立的 VidoGo Management Platform 提供，Basic 本身不启动或内置账户服务器。

默认配置连接当前线上账户服务；如果本地开发要连接自己运行的账户服务，请通过环境变量覆盖它：

```powershell
$env:VIDOGO_ACCOUNT_API_ORIGIN = 'http://127.0.0.1:8790'
npm start
Remove-Item Env:VIDOGO_ACCOUNT_API_ORIGIN
```

`192.168.31.17` 是服务器所在局域网主机，不是线上客户端应写入的公网 API 地址。生产安装包必须使用公网 HTTPS 账户服务地址；发布脚本会校验并注入 `VIDOGO_ACCOUNT_API_ORIGIN`，不会把局域网 IP 或本地回环地址打进正式包。

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
