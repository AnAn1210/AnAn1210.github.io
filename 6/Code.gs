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
      --bg: #ead8f7;
      --bg2: #d7b9ef;
      --card: rgba(255, 255, 255, 0.95);
      --card-2: rgba(248, 242, 255, 0.98);
      --ink: #43304f;
      --muted: #8d74a0;
      --line: rgba(114, 74, 150, 0.14);
      --purple: #a75fd3;
      --purple-2: #c58cf0;
      --shadow: 0 28px 80px rgba(128, 74, 171, 0.16);
      --shadow-soft: 0 10px 28px rgba(145, 86, 196, 0.08);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      font-family: "Segoe UI", "Noto Sans TC", "Microsoft JhengHei", sans-serif;
      color: var(--ink);
      background:
        radial-gradient(circle at top left, rgba(255,255,255,0.8), transparent 28%),
        radial-gradient(circle at bottom right, rgba(255,255,255,0.45), transparent 32%),
        linear-gradient(145deg, var(--bg), var(--bg2));
      padding: 22px 18px 26px;
    }

    .app {
      width: min(820px, 100%);
      margin: 0 auto;
      border-radius: 22px;
      overflow: hidden;
      background: var(--card);
      box-shadow: var(--shadow);
      border: 1px solid rgba(122, 72, 166, 0.10);
    }

    .header {
      padding: 20px 22px 16px;
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: center;
      background: linear-gradient(180deg, #a95ad6 0%, #9a56c4 100%);
      color: #fff;
    }

    .brand {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      min-width: 0;
    }

    .brand-mark {
      width: 18px;
      height: 18px;
      margin-top: 4px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #fff, #ead8f7 48%, #c98bea 76%, #8f4dbb 100%);
      box-shadow: 0 0 0 4px rgba(255,255,255,0.14);
      flex: 0 0 auto;
    }

    h1 {
      margin: 0;
      font-size: clamp(1.5rem, 4vw, 2.15rem);
      line-height: 1.1;
      letter-spacing: 0.03em;
    }

    .subtitle {
      margin: 6px 0 0;
      font-size: 0.92rem;
      color: rgba(255,255,255,0.84);
      line-height: 1.55;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 14px;
      border-radius: 999px;
      background: rgba(255,255,255,0.16);
      color: #fff;
      font-size: 0.88rem;
      font-weight: 800;
      white-space: nowrap;
    }

    .pill::before {
      content: "";
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #8eff9b;
      box-shadow: 0 0 0 4px rgba(142,255,155,0.14);
    }

    .pill.dirty::before { background: #ffe08a; }
    .pill.saving::before { background: #fff; }
    .pill.error::before { background: #ff9aa6; }

    .body {
      padding: 0 16px 16px;
      background: linear-gradient(180deg, var(--card-2), #fff);
    }

    .filebar {
      padding: 15px 6px 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(122, 72, 166, 0.12);
    }

    .fileline {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      color: var(--purple);
      font-weight: 800;
    }

    .fileicon {
      width: 24px;
      height: 24px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      background: linear-gradient(180deg, #efe4fb, #dfc2f6);
      color: #8a51b5;
      font-size: 0.92rem;
      flex: 0 0 auto;
    }

    .fileinfo {
      color: var(--muted);
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .editor-shell {
      margin-top: 12px;
      border: 1px solid rgba(122, 72, 166, 0.10);
      border-radius: 16px;
      overflow: hidden;
      background: #fff;
      box-shadow: var(--shadow-soft);
    }

    textarea {
      width: 100%;
      min-height: 438px;
      resize: vertical;
      border: 0;
      outline: none;
      padding: 16px 18px 18px;
      background: #fff;
      color: var(--ink);
      font: 500 1rem/1.9 "Segoe UI", "Noto Sans TC", "Microsoft JhengHei", sans-serif;
      white-space: pre-wrap;
    }

    textarea::placeholder { color: #b59dc7; }

    .footer {
      margin-top: 14px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 0 4px 2px;
    }

    .stats {
      color: #6f5c80;
      font-size: 0.88rem;
      display: flex;
      flex-wrap: wrap;
      gap: 14px;
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    button {
      border: 1px solid rgba(122, 72, 166, 0.14);
      border-radius: 14px;
      padding: 10px 16px;
      font: inherit;
      font-weight: 800;
      cursor: pointer;
      background: #fff;
      color: #6a4e7e;
      box-shadow: 0 8px 18px rgba(150, 88, 197, 0.08);
      transition: transform 0.12s ease, box-shadow 0.18s ease, background 0.18s ease;
    }

    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 26px rgba(150, 88, 197, 0.12);
    }

    button.primary {
      border-color: transparent;
      color: #fff;
      background: linear-gradient(180deg, var(--purple-2), var(--purple));
    }

    .meta {
      margin-top: 10px;
      color: #9b86ab;
      font-size: 0.84rem;
      line-height: 1.55;
    }

    .message {
      display: none;
      margin-top: 10px;
      padding: 10px 12px;
      border-radius: 12px;
      background: #f7f0fd;
      border: 1px solid rgba(122, 72, 166, 0.12);
      color: #735486;
      font-size: 0.9rem;
    }

    .message.show { display: block; }

    @media (max-width: 760px) {
      body { padding: 12px; }
      .header,
      .footer,
      .filebar {
        flex-direction: column;
        align-items: flex-start;
      }

      .pill { width: 100%; justify-content: center; }
      textarea { min-height: 360px; }
      .actions { width: 100%; }
      .actions button { flex: 1; }
    }
  </style>
</head>
<body>
  <main class="app">
    <header class="header">
      <div class="brand">
        <span class="brand-mark"></span>
        <div>
          <h1>雲端記事本</h1>
          <p class="subtitle">直接使用 GAS 讀寫 Google 雲端資料夾，預設開啟記事本.txt</p>
        </div>
      </div>
      <div class="pill" id="savePill">已儲存</div>
    </header>

    <section class="body">
      <div class="filebar">
        <div class="fileline">
          <span class="fileicon">文</span>
          <span id="fileName">記事本.txt</span>
        </div>
        <div class="fileinfo" id="fileState">已儲存</div>
      </div>

      <div class="editor-shell">
        <textarea id="editor" spellcheck="false" placeholder="載入中..."></textarea>
      </div>

      <div class="message" id="message"></div>

      <div class="footer">
        <div class="stats">
          <span>字數：<strong id="charCount">0</strong></span>
          <span>最後修改：<strong id="lastUpdated">--</strong></span>
        </div>
        <div class="actions">
          <button type="button" id="reloadBtn">重新載入</button>
          <button type="button" class="primary" id="saveBtn">Save</button>
        </div>
      </div>

      <div class="meta">儲存目標：Google 雲端資料夾 ID 1L29dWvmGy9nTt4HHEPlkiCp1TKZjSN6V</div>
    </section>
  </main>

  <script>
    const editor = document.getElementById('editor');
    const saveBtn = document.getElementById('saveBtn');
    const reloadBtn = document.getElementById('reloadBtn');
    const savePill = document.getElementById('savePill');
    const fileState = document.getElementById('fileState');
    const fileName = document.getElementById('fileName');
    const message = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    const lastUpdated = document.getElementById('lastUpdated');
    const autosaveDelayMs = 900;

    let activeContent = '';
    let isDirty = false;
    let isSaving = false;
    let isLoaded = false;
    let autosaveTimer = null;

    function hasBridge() {
      return typeof google !== 'undefined' && google.script && google.script.run;
    }

    function setMessage(text, show) {
      message.textContent = text || '';
      message.classList.toggle('show', !!show);
    }

    function setCharCount() {
      charCount.textContent = String(editor.value.length);
    }

    function setState(text, mode) {
      fileState.textContent = text;
      savePill.textContent = text;
      savePill.className = 'pill';
      if (mode) {
        savePill.classList.add(mode);
      }
    }

    function setMeta(payload) {
      const updated = payload.lastUpdated ? new Date(payload.lastUpdated).toLocaleString('zh-TW') : '--';
      fileName.textContent = payload.fileName || '記事本.txt';
      lastUpdated.textContent = updated;
      document.title = (payload.fileName || '雲端記事本') + ' - 作品 06';
    }

    function loadFromServer() {
      setState('讀取中...', 'saving');
      setMessage('', false);
      google.script.run
        .withSuccessHandler((payload) => {
          activeContent = payload.content || '';
          editor.value = activeContent;
          isDirty = false;
          isLoaded = true;
          setMeta(payload);
          setCharCount();
          setState('已儲存');
          setMessage('已連線到 Google 雲端資料夾中的記事本.txt。', true);
        })
        .withFailureHandler((error) => {
          console.error(error);
          setState('讀取失敗', 'error');
          setMessage('讀取失敗，請確認這個 Apps Script 已取得 Drive 存取權限。', true);
        })
        .getDocumentData();
    }

    function loadDocument() {
      if (!hasBridge()) {
        setState('請以 Web App 開啟', 'error');
        setMessage('這個頁面必須由 Apps Script Web App 提供，才能直接讀寫雲端記事本。', true);
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
      setState('儲存中...', 'saving');
      setMessage('', false);

      const content = editor.value;

      google.script.run
        .withSuccessHandler((payload) => {
          activeContent = content;
          editor.value = payload.content || content;
          isDirty = false;
          isSaving = false;
          setMeta(payload);
          setCharCount();
          setState('已儲存');
          setMessage('內容已寫回記事本.txt。', true);
        })
        .withFailureHandler((error) => {
          console.error(error);
          isSaving = false;
          setState('儲存失敗', 'error');
          setMessage('儲存失敗，請稍後再試。', true);
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

      autosaveTimer = setTimeout(function () {
        autosaveTimer = null;
        saveDocument();
      }, autosaveDelayMs);
    }

    editor.addEventListener('input', function () {
      setCharCount();
      isDirty = editor.value !== activeContent;
      if (isDirty) {
        setState('未儲存變更', 'dirty');
        scheduleAutosave();
      } else if (isLoaded) {
        setState('已儲存');
      }
    });

    document.addEventListener('keydown', function (event) {
      const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
      if (isSaveShortcut) {
        event.preventDefault();
        saveDocument();
      }
    });

    saveBtn.addEventListener('click', saveDocument);
    reloadBtn.addEventListener('click', loadDocument);

    window.addEventListener('beforeunload', function (event) {
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
