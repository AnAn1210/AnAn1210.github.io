const DEFAULT_FILE_NAME = '文件.txt';
const STORAGE_KEY = 'NOTEPAD_FILE_ID';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('雲端記事本')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getDocumentData() {
  const file = ensureDocumentFile_();
  return buildPayload_(file, file.getBlob().getDataAsString('UTF-8'));
}

function saveDocument(content) {
  const file = ensureDocumentFile_();
  const text = String(content ?? '');
  file.setContent(text);
  PropertiesService.getScriptProperties().setProperty(STORAGE_KEY, file.getId());
  return buildPayload_(file, text);
}

function ensureDocumentFile_() {
  const properties = PropertiesService.getScriptProperties();
  const storedId = properties.getProperty(STORAGE_KEY);

  if (storedId) {
    try {
      const fileById = DriveApp.getFileById(storedId);
      if (fileById.getName() === DEFAULT_FILE_NAME) {
        return fileById;
      }
    } catch (error) {
      // fallback to search by name
    }
  }

  const files = DriveApp.getFilesByName(DEFAULT_FILE_NAME);
  if (files.hasNext()) {
    const existingFile = files.next();
    properties.setProperty(STORAGE_KEY, existingFile.getId());
    return existingFile;
  }

  const newFile = DriveApp.createFile(DEFAULT_FILE_NAME, '', MimeType.PLAIN_TEXT);
  properties.setProperty(STORAGE_KEY, newFile.getId());
  return newFile;
}

function buildPayload_(file, content) {
  return {
    fileId: file.getId(),
    fileName: file.getName(),
    fileUrl: file.getUrl(),
    lastUpdated: file.getLastUpdated().toISOString(),
    content: content,
  };
}
