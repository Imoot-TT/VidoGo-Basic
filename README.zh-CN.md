<div align="center">
  <img src="assets/vidogo-brand-icon.png" alt="VidoGo Basic" width="144">
  <h1>VidoGo Basic</h1>
  <p>面向 Windows 的视频浏览、识别、下载与录制桌面工具。</p>
  <p><a href="README.md">English</a> · <strong>中文</strong></p>
  <p>
    <img alt="版本" src="https://img.shields.io/badge/version-0.1.0-1688f0">
    <img alt="平台" src="https://img.shields.io/badge/platform-Windows%20x64-0078d4">
    <img alt="Electron" src="https://img.shields.io/badge/Electron-39.8.10-47848f">
    <img alt="许可证" src="https://img.shields.io/badge/license-MIT-22a06b">
  </p>
</div>

---

## 下载

请从 [VidoGo Basic 0.1.0 Release](https://github.com/Imoot-TT/VidoGo-Basic/releases/tag/basic-v0.1.0) 下载 Windows 安装包：

- `VidoGo-Basic-0.1.0-x64-Setup.exe`

安装包作为 GitHub Release 附件发布，不会提交进普通 Git 仓库。

## 主要功能

- 内置浏览器，可复用视频网站登录状态。
- 识别普通视频资源、HLS 播放列表和 DASH 清单。
- 展开显示画质、分辨率和编码格式，并提供推荐选项。
- 通过 Python、`yt-dlp` 和浏览器 Cookie 执行下载。
- 录制非 DRM 的 HTML 视频，并使用内置 FFmpeg 无损重封装。
- 本地下载队列、历史记录、收藏夹、套餐限制、主题和多语言界面。
- Basic 专属更新检查，只接受 `basic-v*` GitHub Releases。

程序会主动拒绝 DRM 保护内容。用户应自行遵守适用法律、网站条款和内容版权要求。

## 版本规范

当前源码版本为 **0.1.0**。

| 项目 | 命名规则 | 当前值 |
| --- | --- | --- |
| 产品名称 | `VidoGo Basic` | `VidoGo Basic` |
| 语义化版本 | `主版本.次版本.修订号` | `0.1.0` |
| Git 标签 / Release | `basic-v主版本.次版本.修订号` | `basic-v0.1.0` |
| Windows 安装包 | `VidoGo-Basic-版本-x64-Setup.exe` | `VidoGo-Basic-0.1.0-x64-Setup.exe` |

Basic、V2 和 Platform 分别维护独立版本序列。完整规则请参阅 [VERSION.md](VERSION.md)。

## 从源码运行

环境要求：

- Windows 10 或 Windows 11 x64
- Node.js 和 npm
- Python 3
- 开发模式合并视频和录制时，`PATH` 中需包含 FFmpeg 与 FFprobe

安装依赖并启动：

```powershell
npm install
python -m pip install -r requirements.txt
npm start
```

## 构建 Windows 安装包

安装构建依赖，然后生成 NSIS 安装包：

```powershell
python -m pip install -r requirements-build.txt
npm.cmd run dist:win
```

发布构建会冻结 Python 下载与元数据工作进程，并打包 FFmpeg 和 FFprobe。最终用户无需单独安装 Python、Node.js、`yt-dlp` 或 FFmpeg。

制作公开安装包前，请在 [config/account-service.json](config/account-service.json) 中配置生产环境 HTTPS 管理服务地址。打包版本会拒绝非 HTTPS 地址；开发和测试仍可使用 `VIDOGO_ACCOUNT_API_ORIGIN` 覆盖。

## 大型二进制发布规范

GitHub 普通仓库会阻止超过 100 MiB 的文件。VidoGo Basic 安装包约为 237 MB，因此：

- `dist/` 必须保持在 Git 忽略列表中。
- 不要使用 `git add -f` 强制提交安装包、blockmap 或生成的更新元数据。
- 源码按正常方式提交。
- 安装包及相关生成文件上传到 GitHub Releases。

该流程遵循 [GitHub 关于分发大型二进制文件的官方建议](https://docs.github.com/zh/repositories/working-with-files/managing-large-files/about-large-files-on-github#分发大型二进制文件)。

## 项目结构

```text
assets/      应用图标和品牌资源
backend/     下载与元数据工作进程
config/      运行时服务配置
docs/        开发、测试与功能对照文档
scripts/     构建和审计脚本
src/         Electron 主进程、预加载和界面代码
tests/       JavaScript、Python 和 Electron 验证
```

本仓库只包含独立的 VidoGo Basic 桌面产品。V2、Platform、官网和管理服务均由其他仓库分别维护。

## 开发说明

- 开发模式下载 4K 视频时，`PATH` 中必须包含 FFmpeg；发布构建已内置。
- 浏览器状态保存在独立的 `VidoGo Runtime\rebuild-v1` 配置目录中。
- 账户服务地址通过 `config/account-service.json` 或开发环境变量配置。
- 继续开发前请阅读 [docs/HANDOFF.md](docs/HANDOFF.md)、[docs/VIDBROWSER_PARITY.md](docs/VIDBROWSER_PARITY.md) 和 [docs/TESTING.md](docs/TESTING.md)。

## 许可证

MIT
