# 雲端記事本

這個資料夾是可部署到 Google Apps Script 的雲端記事本專案。

## 功能
- 透過 Google Drive 讀取與儲存 `文件.txt`
- 在瀏覽器中直接編輯
- 支援 `Ctrl + S` / `Cmd + S` 快速回存
- 本機直接開啟時會用 `localStorage` 做預覽，部署到 Apps Script 後會切換成真正的 Drive 讀寫

## 檔案
- `index.html`: 前端頁面
- `Code.gs`: Apps Script 後端
- `appsscript.json`: 專案設定

## 部署方式
1. 建立一個新的 Google Apps Script 專案。
2. 將 `6/Code.gs`、`6/index.html`、`6/appsscript.json` 內容貼到專案中。
3. 第一次執行或部署時授權 Google Drive 存取。
4. 以 Web App 發佈後，就能在瀏覽器讀取與儲存 `文件.txt`。

## 使用方式
- 載入後會先讀取 `文件.txt`
- 修改內容後按 `Ctrl + S` 或點「立即回存」即可儲存
- 若在本機開啟，會以本機預覽模式運作
