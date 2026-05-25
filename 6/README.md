# 雲端記事本

這個資料夾是可部署到 Google Apps Script 的雲端記事本專案，已加入作品集首頁的作品 06。

## 功能
- 透過 Google Drive 讀取與儲存 `記事本.txt`
- 在瀏覽器中直接編輯
- 支援 `Ctrl + S` / `Cmd + S` 快速回存與自動儲存
- 直接在 Apps Script Web App 中使用，不需要額外前端檔案

## 檔案
- `Code.gs`: Apps Script 後端
- `appsscript.json`: 專案設定

## 部署方式
1. 建立一個新的 Google Apps Script 專案。
2. 將 `6/Code.gs`、`6/appsscript.json` 內容貼到專案中。
3. 第一次執行或部署時授權 Google Drive 存取。
4. 以 Web App 發佈後，就能在瀏覽器讀取與儲存 `記事本.txt`。

## 使用方式
- 載入後會先讀取 `記事本.txt`
- 修改內容後按 `Ctrl + S` 或點 Save 即可儲存
- 內容會自動延遲儲存到 Google 雲端資料夾
