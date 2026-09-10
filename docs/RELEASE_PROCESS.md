# VidoGo Basic 发布规范

## 面向用户的版本说明

每个版本必须提供 `docs/releases/<版本号>.md`，GitHub Release 正文只从该文件读取。

版本说明只写用户能够感知的内容：

- 新增或改变了什么功能。
- 用户现在可以怎样使用。
- 必要的升级、兼容性或数据迁移提醒。

不要写以下开发过程内容：

- 代码行数、提交数量、测试通过情况。
- 内部实现、依赖、IPC、文件哈希或打包细节。
- 按钮尺寸、边距等零碎开发调整。
- 只有 `Full Changelog` 或完整变更记录链接的空白说明。

文字应简洁、使用中文，并以用户价值组织内容，不能把开发日志直接复制到 Release。

## 发布前必须同步

1. 更新 `package.json` 和 `package-lock.json` 的版本号。
2. 更新 `VERSION.md`。
3. 更新 `README.md` 与 `README.zh-CN.md` 的版本徽章、下载文字和链接。
4. 新建对应的 `docs/releases/<版本号>.md`。
5. 运行 `npm run check`；版本信息有任何不一致时必须停止发布。
6. GitHub Release 应由 `Imoot-TT` 账号创建，发布工作流只负责校正正文和上传资产，不得用 `github-actions` 代替用户创建 Release。

## 0.1.9 示例

合格的说明见 `docs/releases/0.1.9.md`：只说明自动更新对用户带来的变化，以及旧版本需要手动升级一次的必要提示。
