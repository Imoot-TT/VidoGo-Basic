# Windows 安装包签名

0.2.0 起，发布工作流拒绝未签名安装包。需要一张受 Windows 信任的 Authenticode 代码签名证书（PFX）。

## GitHub Actions secrets

- `WINDOWS_CODE_SIGNING_CERTIFICATE`：PFX 的 Base64 内容或 electron-builder 支持的安全证书链接，对应 `CSC_LINK`。
- `WINDOWS_CODE_SIGNING_PASSWORD`：PFX 密码，对应 `CSC_KEY_PASSWORD`。

同时在 GitHub Actions Variables 设置 `VIDOGO_ACCOUNT_API_ORIGIN`，值为已经部署的生产 HTTPS 账户/匿名漏斗服务来源（例如 `https://api.example.com`，不要包含路径）。缺少此值、使用 HTTP 或回环地址时，发布也会被阻止，避免生成无法登录、购买或上报漏斗的安装包。

发布任务会同时检查 `VidoGo Basic.exe` 和 NSIS 安装包的 `Get-AuthenticodeSignature` 状态；任一不是 `Valid` 就停止上传。

## 本地验证

设置 `CSC_LINK`、`CSC_KEY_PASSWORD` 和生产 `VIDOGO_ACCOUNT_API_ORIGIN` 后运行：

```powershell
npm run dist:signed
```

脚本只在构建期间写入生产服务地址，随后恢复本地开发配置；它会验证应用程序与安装包两个签名目标。缺少生产服务、没有证书或签名无效时不会产生可发布结果。
