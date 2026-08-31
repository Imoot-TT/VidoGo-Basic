# VidoGo 版本命名规范

## 当前版本

- 产品名称：**VidoGo Basic**
- 源码版本：**0.1.2**
- GitHub Release 标签：**`basic-v0.1.2`**
- Windows 安装包：**`VidoGo-Basic-0.1.2-x64-Setup.exe`**

`0.1.0` 是 Basic 产品线的首个公开开发版本；后续 `0.1.x` 用于兼容性和平台支持修复。`0.x` 表示产品仍在开发阶段；产品达到首个稳定版本时再升级为 `1.0.0`。

## 产品线命名

| 产品线 | 应用内显示 | Release 标签 | 安装包示例 |
| --- | --- | --- | --- |
| Basic | `VidoGo Basic 0.1.2` | `basic-v0.1.2` | `VidoGo-Basic-0.1.2-x64-Setup.exe` |
| V2 | `VidoGo V2 0.1.0` | `v2-v0.1.0` | `VidoGo-V2-0.1.0-x64-Setup.exe` |
| Platform | `VidoGo Platform 0.1.0` | `platform-v0.1.0` | `VidoGo-Platform-0.1.0.zip` |

三条产品线分别维护自己的 [Semantic Versioning](https://semver.org/) 序列，互不占用版本号。版本格式统一为 `主版本.次版本.修订号`：不兼容变更增加主版本，新功能增加次版本，兼容修复增加修订号；预发布版本可使用 `-alpha.1`、`-beta.1`、`-rc.1`。

Basic 的更新检查只读取 `basic-v*` Release，不会把 V2 或 Platform 的发布误判为 Basic 更新。
