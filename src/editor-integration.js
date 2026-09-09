const crypto = require('node:crypto');
const fsSync = require('node:fs');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFile, spawn } = require('node:child_process');

const REGISTRY_EDITOR_SPECS = [
  {
    id: 'jianying-pro', name: '剪映专业版', priority: 10,
    keys: [
      'HKCU\\Software\\Classes\\JianyingPro.Media\\shell\\open\\command',
      'HKLM\\Software\\Classes\\JianyingPro.Media\\shell\\open\\command',
    ],
  },
  {
    id: 'premiere-pro', name: 'Adobe Premiere Pro', priority: 20,
    keys: [
      'HKCU\\Software\\Classes\\adobe+ppro\\shell\\open\\command',
      'HKLM\\Software\\Classes\\adobe+ppro\\shell\\open\\command',
    ],
  },
  {
    id: 'capcut', name: 'CapCut', priority: 30,
    keys: [
      'HKCU\\Software\\Classes\\capcut\\shell\\open\\command',
      'HKLM\\Software\\Classes\\capcut\\shell\\open\\command',
    ],
  },
];

const UNINSTALL_ROOTS = [
  'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
  'HKLM\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall',
];

const DIALOG_IMPORT_SCRIPT = String.raw`
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class VidoGoEditorInput {
  public delegate bool EnumWindowsProc(IntPtr window, IntPtr parameter);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
  [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X, Y; }
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc callback, IntPtr parameter);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr window, out uint processId);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr window);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr window, out RECT rectangle);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr window);
  [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr window, ref POINT point);
  [DllImport("user32.dll")] public static extern bool GetCursorPos(out POINT point);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint flags, uint dx, uint dy, uint data, UIntPtr extraInfo);
  public static IntPtr FindLargestWindow(uint[] processIds) {
    IntPtr best = IntPtr.Zero;
    long bestArea = 0;
    EnumWindows(delegate(IntPtr window, IntPtr parameter) {
      uint processId;
      GetWindowThreadProcessId(window, out processId);
      if (Array.IndexOf(processIds, processId) < 0 || !IsWindowVisible(window)) return true;
      RECT rectangle;
      if (!GetWindowRect(window, out rectangle)) return true;
      long width = Math.Max(0, rectangle.Right - rectangle.Left);
      long height = Math.Max(0, rectangle.Bottom - rectangle.Top);
      long area = width * height;
      if (width >= 500 && height >= 350 && area > bestArea) { best = window; bestArea = area; }
      return true;
    }, IntPtr.Zero);
    return best;
  }
  public static POINT CursorPosition() { POINT point; GetCursorPos(out point); return point; }
  public static void ClickClient(IntPtr window, int x, int y) {
    POINT point = new POINT { X = x, Y = y };
    ClientToScreen(window, ref point);
    SetCursorPos(point.X, point.Y);
    mouse_event(0x0002, 0, 0, 0, UIntPtr.Zero);
    mouse_event(0x0004, 0, 0, 0, UIntPtr.Zero);
  }
}
'@
$editorPath = [IO.Path]::GetFullPath($env:VIDOGO_EDITOR_EXE)
$editorId = [string]$env:VIDOGO_EDITOR_ID
$processName = [IO.Path]::GetFileNameWithoutExtension($editorPath)
$paths = @((ConvertFrom-Json $env:VIDOGO_EDITOR_FILES) | ForEach-Object { [IO.Path]::GetFullPath([string]$_) })
$process = Get-Process -Name $processName -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $process) {
  Start-Process -FilePath $editorPath | Out-Null
  for ($attempt = 0; $attempt -lt 80 -and -not $process; $attempt++) {
    Start-Sleep -Milliseconds 150
    $process = Get-Process -Name $processName -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
  }
}
if (-not $process) { Write-Output 'VIDOGO_EDITOR_NOT_READY'; exit 4 }
$previousForeground = [VidoGoEditorInput]::GetForegroundWindow()
$shell = New-Object -ComObject WScript.Shell
if (-not $shell.AppActivate($process.Id)) { Write-Output 'VIDOGO_EDITOR_NOT_READY'; exit 4 }
Start-Sleep -Milliseconds 180
if ($editorId -eq 'capcut') {
  [uint32[]]$processIds = @(Get-Process -Name $processName -ErrorAction SilentlyContinue | ForEach-Object { $_.Id })
  $editorWindow = [VidoGoEditorInput]::FindLargestWindow($processIds)
  if ($editorWindow -eq [IntPtr]::Zero) { Write-Output 'VIDOGO_EDITOR_NOT_READY'; exit 4 }
  [void][VidoGoEditorInput]::SetForegroundWindow($editorWindow)
  Start-Sleep -Milliseconds 120
  $cursor = [VidoGoEditorInput]::CursorPosition()
  try {
    [VidoGoEditorInput]::ClickClient($editorWindow, 40, 60)
    Start-Sleep -Milliseconds 420
    [VidoGoEditorInput]::ClickClient($editorWindow, 170, 100)
  } finally {
    [void][VidoGoEditorInput]::SetCursorPos($cursor.X, $cursor.Y)
  }
} else {
  $shell.SendKeys('^i')
}
Start-Sleep -Milliseconds 650
$shell.SendKeys('%n')
Start-Sleep -Milliseconds 120
$selection = if ($paths.Count -eq 1) { $paths[0] } else { ($paths | ForEach-Object { '"' + ($_ -replace '"', '') + '"' }) -join ' ' }
$previousClipboard = [System.Windows.Forms.Clipboard]::GetDataObject()
try {
  [System.Windows.Forms.Clipboard]::SetText($selection)
  $shell.SendKeys('^v')
  Start-Sleep -Milliseconds 100
  $shell.SendKeys('{ENTER}')
  Start-Sleep -Milliseconds 220
} finally {
  if ($previousClipboard) { [System.Windows.Forms.Clipboard]::SetDataObject($previousClipboard, $true) }
}
[void][VidoGoEditorInput]::SetForegroundWindow($previousForeground)
Write-Output 'VIDOGO_IMPORT_OK'
`;

function runFile(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { encoding: 'utf8', windowsHide: true, timeout: 12000, maxBuffer: 8 * 1024 * 1024, ...options }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve(String(stdout || ''));
    });
  });
}

function expandWindowsEnvironmentVariables(value) {
  return String(value || '').replace(/%([^%]+)%/g, (token, name) => process.env[name] || process.env[name.toUpperCase()] || token);
}

function executableFromValue(value) {
  const expanded = expandWindowsEnvironmentVariables(value).trim();
  const match = expanded.match(/^\s*"([^"]+\.exe)"/i) || expanded.match(/^\s*(.+?\.exe)(?:[",\s]|$)/i);
  if (!match?.[1]) return '';
  return path.resolve(match[1].replace(/^"|"$/g, '').trim());
}

async function existingExecutable(value) {
  const executable = executableFromValue(value);
  if (!executable) return '';
  try {
    return (await fs.stat(executable)).isFile() ? executable : '';
  } catch {
    return '';
  }
}

async function readRegistryDefaultValue(key) {
  try {
    const stdout = await runFile('reg.exe', ['query', key, '/ve'], { timeout: 3000 });
    return stdout.match(/REG_(?:EXPAND_)?SZ\s+(.+)$/mi)?.[1]?.trim() || '';
  } catch {
    return '';
  }
}

function editorIdentity(name, executable, preferredId = '') {
  const lower = `${name} ${path.basename(executable)}`.toLowerCase();
  let id = preferredId;
  let displayName = String(name || '').trim();
  let priority = 80;
  let importMode = 'import-dialog';
  if (/jianying|剪映/.test(lower)) { id ||= 'jianying-pro'; displayName = '剪映专业版'; priority = 10; importMode = 'open-file'; }
  else if (/premiere/.test(lower)) { id ||= 'premiere-pro'; displayName = 'Adobe Premiere Pro'; priority = 20; }
  else if (/davinci|resolve/.test(lower)) { id ||= 'davinci-resolve'; displayName = 'DaVinci Resolve'; priority = 25; }
  else if (/capcut/.test(lower)) { id ||= 'capcut'; displayName = 'CapCut'; priority = 30; }
  else if (/filmora|万兴喵影/.test(lower)) { id ||= 'filmora'; displayName = 'Wondershare Filmora'; priority = 35; }
  else if (/vegas/.test(lower)) { id ||= 'vegas-pro'; displayName = 'VEGAS Pro'; priority = 40; importMode = 'open-media'; }
  const fingerprint = crypto.createHash('sha1').update(executable.toLowerCase()).digest('hex').slice(0, 10);
  return {
    id: id || `custom-${fingerprint}`,
    name: displayName || path.basename(executable, path.extname(executable)),
    executable,
    priority,
    importMode,
  };
}

function parseUninstallRecords(stdout) {
  const records = [];
  let record = null;
  for (const line of String(stdout || '').split(/\r?\n/)) {
    if (/^HKEY_/i.test(line.trim())) {
      if (record) records.push(record);
      record = {};
      continue;
    }
    if (!record) continue;
    const match = line.match(/^\s*(DisplayName|DisplayIcon|InstallLocation)\s+REG_(?:EXPAND_)?SZ\s+(.*)$/i);
    if (match) record[match[1].toLowerCase()] = match[2].trim();
  }
  if (record) records.push(record);
  return records;
}

function looksLikeEditor(name) {
  return /剪映|jianying|capcut|premiere|davinci\s+resolve|filmora|万兴喵影|vegas\s+pro/i.test(String(name || ''));
}

async function executableFromInstallRecord(record) {
  const fromIcon = await existingExecutable(String(record.displayicon || '').replace(/,\s*-?\d+\s*$/, ''));
  if (fromIcon && !/(?:unins|uninstall|setup|installer|update)/i.test(path.basename(fromIcon))) return fromIcon;
  const directory = expandWindowsEnvironmentVariables(record.installlocation || '').trim();
  if (!directory) return '';
  const fileNames = ['JianyingPro.exe', 'CapCut.exe', 'Adobe Premiere Pro.exe', 'Resolve.exe', 'Wondershare Filmora.exe', 'Filmora.exe', 'vegas.exe', 'vegaspro.exe'];
  for (const fileName of fileNames) {
    const candidate = path.join(directory, fileName);
    try { if ((await fs.stat(candidate)).isFile()) return candidate; } catch { /* Try the next known executable. */ }
  }
  return '';
}

async function discoverEditors() {
  if (process.platform !== 'win32') return [];
  const editors = [];
  for (const spec of REGISTRY_EDITOR_SPECS) {
    for (const key of spec.keys) {
      const executable = await existingExecutable(await readRegistryDefaultValue(key));
      if (!executable) continue;
      editors.push(editorIdentity(spec.name, executable, spec.id));
      break;
    }
  }
  for (const root of UNINSTALL_ROOTS) {
    let stdout = '';
    try { stdout = await runFile('reg.exe', ['query', root, '/s']); } catch { continue; }
    for (const record of parseUninstallRecords(stdout)) {
      if (!looksLikeEditor(record.displayname)) continue;
      const executable = await executableFromInstallRecord(record);
      if (executable) editors.push(editorIdentity(record.displayname, executable));
    }
  }
  const unique = new Map();
  for (const editor of editors) {
    const key = editor.executable.toLowerCase();
    const previous = unique.get(key);
    if (!previous || editor.priority < previous.priority) unique.set(key, editor);
  }
  return Array.from(unique.values()).sort((left, right) => left.priority - right.priority || left.name.localeCompare(right.name));
}

function customEditor(executable) {
  const resolved = path.resolve(String(executable || ''));
  if (path.extname(resolved).toLowerCase() !== '.exe' || !fsSync.existsSync(resolved)) return null;
  return editorIdentity('', resolved);
}

function launchEditor(executable, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, {
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    });
    child.once('error', reject);
    child.once('spawn', () => {
      child.unref();
      resolve();
    });
  });
}

async function importIntoEditor(editor, filePaths) {
  const executable = await existingExecutable(editor?.executable || '');
  if (!executable) return { ok: false, reason: 'editor-not-found' };
  const requestedPaths = (Array.isArray(filePaths) ? filePaths : [filePaths]).filter(Boolean).map((filePath) => path.resolve(filePath));
  const paths = [];
  for (const mediaPath of requestedPaths) {
    try { if ((await fs.stat(mediaPath)).isFile()) paths.push(mediaPath); } catch { /* Missing library items are not sent to the editor. */ }
  }
  if (!paths.length) return { ok: false, reason: 'file-not-found' };
  try {
    if (editor.importMode === 'open-file') {
      for (const mediaPath of paths) await launchEditor(executable, [`-open-file=${mediaPath}`]);
    } else if (editor.importMode === 'open-media') {
      for (const mediaPath of paths) await launchEditor(executable, ['/OPEN', mediaPath]);
    } else {
      const stdout = await runFile('powershell.exe', ['-NoProfile', '-STA', '-ExecutionPolicy', 'Bypass', '-Command', DIALOG_IMPORT_SCRIPT], {
        timeout: 12000,
        env: { ...process.env, VIDOGO_EDITOR_EXE: executable, VIDOGO_EDITOR_ID: editor.id || '', VIDOGO_EDITOR_FILES: JSON.stringify(paths) },
      });
      if (!stdout.includes('VIDOGO_IMPORT_OK')) return { ok: false, reason: 'editor-not-ready' };
    }
    return { ok: true, editor: editor.id, editorName: editor.name, path: paths[0], count: paths.length };
  } catch (error) {
    const output = `${error?.stdout || ''}\n${error?.stderr || ''}`;
    if (/VIDOGO_(?:EDITOR_NOT_READY|IMPORT_DIALOG_NOT_FOUND)/.test(output)) {
      return { ok: false, reason: 'editor-not-ready', message: output.trim() };
    }
    return { ok: false, reason: 'editor-launch-failed', message: error?.message || String(error) };
  }
}

module.exports = { customEditor, discoverEditors, importIntoEditor };
