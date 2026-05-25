const FOLDER_ID = '1L29dWvmGy9nTt4HHEPlkiCp1TKZjSN6V';
const DEFAULT_FILE_NAME = '記事本.txt';
const STORAGE_KEY = 'NOTEPAD_FILE_ID';

function doGet() {
  return HtmlService.createHtmlOutput(getHtml_())
    .setTitle('雲端記事本')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getDocumentData() {
  const file = ensureNotepadFile_();
  return buildPayload_(file, readFileContent_(file));
}

function saveDocument(content) {
  const file = ensureNotepadFile_();
  const text = String(content ?? '');
  file.setContent(text);
  PropertiesService.getScriptProperties().setProperty(STORAGE_KEY, file.getId());
  return buildPayload_(file, text);
}

function ensureNotepadFile_() {
  const properties = PropertiesService.getScriptProperties();
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const storedId = properties.getProperty(STORAGE_KEY);

  if (storedId) {
    try {
      const fileById = DriveApp.getFileById(storedId);
      if (fileById.getName() === DEFAULT_FILE_NAME && isInTargetFolder_(fileById, folder)) {
        properties.setProperty(STORAGE_KEY, fileById.getId());
        return fileById;
      }
    } catch (error) {
      // Ignore stale IDs and fall back to folder lookup.
    }
  }

  const files = folder.getFilesByName(DEFAULT_FILE_NAME);
  if (files.hasNext()) {
    const existingFile = files.next();
    properties.setProperty(STORAGE_KEY, existingFile.getId());
    return existingFile;
  }

  const newFile = folder.createFile(DEFAULT_FILE_NAME, '', MimeType.PLAIN_TEXT);
  properties.setProperty(STORAGE_KEY, newFile.getId());
  return newFile;
}

function isInTargetFolder_(file, folder) {
  const parents = file.getParents();
  while (parents.hasNext()) {
    if (parents.next().getId() === folder.getId()) {
      return true;
    }
  }
  return false;
}

function readFileContent_(file) {
  return file.getBlob().getDataAsString('UTF-8');
}

function buildPayload_(file, content) {
  return {
    fileId: file.getId(),
    fileName: file.getName(),
    fileUrl: file.getUrl(),
    lastUpdated: file.getLastUpdated().toISOString(),
    content: content,
    folderId: FOLDER_ID,
  };
}

function getHtml_() {
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>雲端記事本</title>
  <style>
    :root {
      color-scheme: light;
      --bg-a: #f7f7f7;
      --bg-b: #d9d9d9;
      --panel: rgba(255, 255, 255, 0.92);
      --paper: #ffffff;
      --ink: #111111;
      --muted: #666666;
      --line: rgba(17, 17, 17, 0.1);
      --accent: #111111;
      --accent-strong: #000000;
      --shadow: 0 26px 70px rgba(0, 0, 0, 0.14);
      --paper-shadow: 0 12px 34px rgba(0, 0, 0, 0.08);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      color: var(--ink);
      font-family: "Segoe UI", "Noto Sans TC", "Microsoft JhengHei", sans-serif;
      background:
        radial-gradient(circle at top left, rgba(255,255,255,0.95), transparent 30%),
        radial-gradient(circle at top right, rgba(255,255,255,0.6), transparent 20%),
        linear-gradient(150deg, var(--bg-a), var(--bg-b));
      padding: clamp(14px, 3vw, 28px);
    }

    .shell {
      width: min(1080px, 100%);
      margin: 0 auto;
      display: grid;
      gap: 18px;
    }

    .hero,
    .panel {
      border: 1px solid rgba(121, 89, 53, 0.12);
      border-radius: 28px;
      box-shadow: var(--shadow);
      background: var(--panel);
      backdrop-filter: blur(8px);
    }

    .hero {
      padding: clamp(18px, 3.2vw, 30px);
      position: relative;
      overflow: hidden;
    }

    .hero::after {
      content: "";
      position: absolute;
      right: -40px;
      bottom: -80px;
      width: 240px;
      height: 240px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 0, 0, 0.12), transparent 66%);
      pointer-events: none;
    }

    h1 {
      margin: 0;
      font-size: clamp(2rem, 5vw, 3.3rem);
      line-height: 1.05;
      letter-spacing: 0.04em;
    }

    .sub {
      margin: 12px 0 0;
      color: var(--muted);
      line-height: 1.8;
      max-width: 72ch;
    }

    .toolbar {
      margin-top: 18px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }

    .button {
      border-radius: 999px;
      border: 1px solid rgba(17, 17, 17, 0.14);
      background: rgba(255, 255, 255, 0.92);
      color: var(--ink);
      padding: 10px 16px;
      font: inherit;
      font-weight: 700;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    }

    .button {
      cursor: pointer;
      transition: transform 0.12s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    .button:hover {
      box-shadow: 0 10px 26px rgba(0, 0, 0, 0.12);
      background: rgba(255, 255, 255, 0.95);
    }

    .button:active { transform: translateY(1px); }

    .button.primary {
      background: linear-gradient(180deg, #111111, #000000);
      color: #fff;
      border-color: transparent;
    }

    .button.primary:hover {
      background: linear-gradient(180deg, #333333, #111111);
    }

    .status {
      margin-left: auto;
      font-weight: 700;
      color: #705c45;
    }

    .panel {
      padding: clamp(16px, 2.8vw, 24px);
      display: grid;
      gap: 14px;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: space-between;
      align-items: center;
    }

    .titleline {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.15rem;
      font-weight: 800;
    }

    .dot {
      width: 13px;
      height: 13px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, #ffffff, #444444 70%);
      box-shadow: 0 0 0 5px rgba(0, 0, 0, 0.08);
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      color: var(--muted);
      font-size: 0.95rem;
    }

    .notice {
      display: none;
      padding: 12px 14px;
      border-radius: 16px;
      background: rgba(248, 248, 248, 0.96);
      border: 1px solid rgba(17, 17, 17, 0.12);
      color: #222222;
      font-weight: 700;
      line-height: 1.6;
    }

    .notice.show { display: block; }

    .paper {
      position: relative;
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid rgba(17, 17, 17, 0.12);
      background: linear-gradient(180deg, var(--paper), #fcfcfc);
      box-shadow: var(--paper-shadow);
      min-height: 520px;
    }

    .paper::before {
      content: "";
      position: absolute;
      inset: 44px 0 0;
      background-image: linear-gradient(to bottom, transparent 0, transparent 34px, var(--line) 35px);
      background-size: 100% 35px;
      pointer-events: none;
      opacity: 0.95;
    }

    .paperbar {
      position: relative;
      z-index: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      padding: 16px 18px 12px;
      border-bottom: 1px solid rgba(17, 17, 17, 0.12);
      background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,248,248,0.9));
    }

    .paperbar label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      color: var(--muted);
    }

    .paperbar input {
      width: min(280px, 100%);
      padding: 10px 12px;
      border-radius: 14px;
      border: 1px solid rgba(17, 17, 17, 0.14);
      font: inherit;
      background: #fff;
      color: var(--ink);
      outline: none;
    }

    .paperbar input:focus {
      border-color: rgba(17, 17, 17, 0.55);
      box-shadow: 0 0 0 3px rgba(17, 17, 17, 0.08);
    }

    .editor-wrap {
      position: relative;
      z-index: 1;
      padding: 14px 18px 18px;
      min-height: 440px;
    }

    textarea {
      width: 100%;
      min-height: 430px;
      resize: vertical;
      border: 0;
      outline: none;
      background: transparent;
      color: var(--ink);
      font: 600 1.05rem/1.9 "Segoe UI", "Noto Sans TC", "Microsoft JhengHei", sans-serif;
      white-space: pre-wrap;
      padding: 4px 2px 8px;
    }

    .footer {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 14px;
      justify-content: space-between;
      color: var(--muted);
      font-size: 0.92rem;
      padding: 0 4px;
    }

    .saving { color: var(--accent-strong); }

    @media (max-width: 720px) {
      .status { margin-left: 0; width: 100%; }
      .paperbar input { width: 100%; }
      textarea { min-height: 340px; }
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <h1>雲端記事本</h1>
      <p class="sub">這是一個單一 Google Apps Script 檔案版記事本。開啟時會自動讀取指定雲端資料夾中的 <strong>記事本.txt</strong>，若不存在就建立；按下 <strong>Save</strong> 會直接寫回同一個檔案。</p>
      <div class="toolbar">
        <button class="button primary" id="saveBtn" type="button">Save</button>
        <div class="status" id="status">初始化中</div>
      </div>
    </section>

    <section class="panel">
      <div class="row">
        <div class="titleline"><span class="dot"></span>記事本編輯區</div>
        <div class="meta">
          <span id="fileName">記事本.txt</span>
          <span id="fileInfo">等待讀取</span>
        </div>
      </div>

      <div class="notice" id="notice"></div>

      <div class="paper">
        <div class="paperbar">
          <label for="docTitle">檔案</label>
          <input id="docTitle" type="text" value="記事本.txt" readonly />
          <span class="chip" id="shortcutHint">Ctrl + S / ⌘ + S</span>
        </div>
        <div class="editor-wrap">
          <textarea id="editor" spellcheck="false" placeholder="載入中..."></textarea>
        </div>
      </div>

      <div class="footer">
        <div>狀態：<strong id="saveState">初始化中</strong></div>
        <div>儲存目標：Google 雲端資料夾 ID 1L29dWvmGy9nTt4HHEPlkiCp1TKZjSN6V</div>
      </div>
    </section>
  </main>

  <script>
    const editor = document.getElementById('editor');
    const saveBtn = document.getElementById('saveBtn');
    const statusEl = document.getElementById('status');
    const saveStateEl = document.getElementById('saveState');
    const noticeEl = document.getElementById('notice');
    const fileNameEl = document.getElementById('fileName');
    const fileInfoEl = document.getElementById('fileInfo');
    const autosaveDelayMs = 900;

    let activeContent = '';
    let isDirty = false;
    let isSaving = false;
    let isLoaded = false;
    let autosaveTimer = null;

    function setStatus(text, mode) {
      statusEl.textContent = text;
      saveStateEl.textContent = text;
      saveStateEl.className = mode === 'saving' ? 'saving' : '';
    }

    function showNotice(text) {
      noticeEl.textContent = text;
      noticeEl.classList.add('show');
    }

    function hideNotice() {
      noticeEl.classList.remove('show');
      noticeEl.textContent = '';
    }

    function setMetadata(payload) {
      const lastUpdated = payload.lastUpdated ? new Date(payload.lastUpdated).toLocaleString('zh-TW') : '未知';
      fileNameEl.textContent = payload.fileName || '記事本.txt';
      fileInfoEl.textContent = '最後更新：' + lastUpdated;
      document.title = (payload.fileName || '雲端記事本') + ' - 雲端記事本';
      document.getElementById('docTitle').value = payload.fileName || '記事本.txt';
    }

    function hasBridge() {
      return typeof google !== 'undefined' && google.script && google.script.run;
    }

    function loadFromServer() {
      setStatus('讀取中...');
      google.script.run
        .withSuccessHandler((payload) => {
          activeContent = payload.content || '';
          editor.value = activeContent;
          setMetadata(payload);
          setStatus('已連線');
          isDirty = false;
          isLoaded = true;
          hideNotice();
        })
        .withFailureHandler((error) => {
          console.error(error);
          setStatus('讀取失敗');
          showNotice('無法讀取雲端記事本，請確認此 Apps Script 已授權 Drive 存取權限。');
        })
        .getDocumentData();
    }

    function loadDocument() {
      if (!hasBridge()) {
        setStatus('請以 Apps Script Web App 開啟');
        showNotice('這個頁面必須由 Apps Script Web App 提供，才能直接讀寫 Google 雲端資料夾中的記事本.txt。');
        return;
      }

      loadFromServer();
    }

    function saveDocument() {
      if (!isLoaded || isSaving) {
        return;
      }

      if (autosaveTimer) {
        clearTimeout(autosaveTimer);
        autosaveTimer = null;
      }

      isSaving = true;
      setStatus('儲存中...', 'saving');
      hideNotice();

      const content = editor.value;

      google.script.run
        .withSuccessHandler((payload) => {
          activeContent = content;
          editor.value = payload.content || content;
          setMetadata(payload);
          setStatus('已儲存');
          isDirty = false;
          showNotice('內容已寫回記事本.txt。');
          isSaving = false;
        })
        .withFailureHandler((error) => {
          console.error(error);
          setStatus('儲存失敗');
          showNotice('儲存失敗，請稍後再試。');
          isSaving = false;
        })
        .saveDocument(content);
    }

    function scheduleAutosave() {
      if (!isLoaded || !isDirty) {
        return;
      }

      if (autosaveTimer) {
        clearTimeout(autosaveTimer);
      }

      autosaveTimer = setTimeout(() => {
        autosaveTimer = null;
        saveDocument();
      }, autosaveDelayMs);
    }

    editor.addEventListener('input', () => {
      isDirty = editor.value !== activeContent;
      if (isDirty) {
        setStatus('未儲存變更');
        scheduleAutosave();
      } else if (isLoaded) {
        setStatus('已連線');
      }
    });

    document.addEventListener('keydown', (event) => {
      const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
      if (isSaveShortcut) {
        event.preventDefault();
        saveDocument();
      }
    });

  saveBtn.addEventListener('click', saveDocument);

    window.addEventListener('beforeunload', (event) => {
      if (autosaveTimer) {
        clearTimeout(autosaveTimer);
        autosaveTimer = null;
      }

      if (isDirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    });

    loadDocument();
  </script>
</body>
</html>`;
}
