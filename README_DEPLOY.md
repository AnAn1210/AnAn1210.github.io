部署到 GitHub Pages（快速說明）

1) 建立 GitHub 倉庫並推送（假設分支為 `main`）

```bash
git init
git add .
git commit -m "site: publish"
git branch -M main
git remote add origin git@github.com:<your-username>/<repo>.git
git push -u origin main
```

2) 啟用 GitHub Pages：
- 到倉庫 -> Settings -> Pages -> 來源選擇 `gh-pages` 或 `main`（視你的部署方式而定）。

3) 使用 GitHub Actions 自動部署（已在 `.github/workflows/gh-pages.yml`）：
- Actions 會在你 push 到 `main` 時建立 artifact 並部署到 Pages。請確認 `main` 為預設分支。

4) 若你想要立即在本機測試，執行：

```bash
python -m http.server 8000
```
然後在同一區域網路的手機瀏覽器開啟：

http://<你的電腦局域網IP>:8000/

替換 `<你的電腦局域網IP>` 為我剛回傳的 `172.16.81.204`。
