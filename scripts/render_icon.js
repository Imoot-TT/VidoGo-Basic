const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.whenReady().then(async () => {
  const root = path.resolve(__dirname, '..');
  const sourcePath = path.join(root, 'assets', 'app-icon.svg');
  const outputPath = path.join(root, 'assets', 'app-icon.png');
  const source = fs.readFileSync(sourcePath, 'utf8')
    .replace('width="256" height="256"', 'width="512" height="512"');
  const window = new BrowserWindow({
    width: 512,
    height: 512,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: { offscreen: true },
  });
  const html = `<style>html,body{width:512px;height:512px;margin:0;background:transparent;overflow:hidden}svg{display:block}</style>${source}`;
  await window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  const image = await window.webContents.capturePage({ x: 0, y: 0, width: 512, height: 512 });
  if (image.isEmpty()) throw new Error('Electron could not capture the SVG application icon.');
  fs.writeFileSync(outputPath, image.toPNG());
  window.destroy();
  console.log(`Rendered ${outputPath}`);
  app.quit();
}).catch((error) => {
  console.error(error?.stack || error);
  app.exit(1);
});
