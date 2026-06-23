# iMONNIT ダッシュボード

iMONNIT APIと連携したセンサー監視・可視化Webアプリケーションです。

---

## 必要環境

- Node.js 18 以上
- npm 9 以上

---

## セットアップ・起動手順

### 1. リポジトリをクローン

```bash
git clone https://github.com/dhgirl1022/test1.git
cd test1
```

### 2. 依存パッケージをインストール

```bash
npm install
```

### 3. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開いてください。

---

## 使い方

### テストモード（APIキーなしで試す）

1. 起動後、API接続設定画面が表示されます
2. **「テストモードで試す（デモデータ）」** ボタンをクリック
3. デモデータでダッシュボードの全機能を確認できます

### 本番モード（iMONNIT APIキーを使う）

1. [iMONNITアカウント](https://www.imonnit.com) にログインし、APIキーIDとAPIシークレットキーを取得
2. API接続設定画面に入力して **「接続する」** をクリック
3. 接続確認後、ダッシュボードが表示されます
4. APIキーはブラウザのlocalStorageに保存されます（次回以降は入力不要）

---

## 主な機能

| 機能 | 説明 |
|---|---|
| ダッシュボード | センサーステータス集計、ネットワーク絞り込み、センサー一覧 |
| センサー詳細 | センサーカードをクリックで過去24時間のグラフを表示 |
| アラート | 閾値超過・電池残量低下などの通知一覧 |
| ゲートウェイ | 各ゲートウェイのオンライン状態確認 |
| 自動更新 | 30秒ごとにデータを自動取得（トグルで切替） |

---

## ビルド（本番用）

```bash
npm run build
```

`dist/` フォルダに静的ファイルが生成されます。

```bash
npm run preview   # ビルド結果のプレビュー
```

---

## プロジェクト構成

```
├── src/
│   ├── api/
│   │   └── monnit.js          # iMONNIT API クライアント
│   ├── components/
│   │   ├── ApiSettings.jsx    # API接続設定画面
│   │   ├── Dashboard.jsx      # メインダッシュボード
│   │   ├── SensorCard.jsx     # センサーカード
│   │   ├── SensorChart.jsx    # センサー詳細グラフ
│   │   ├── NetworkList.jsx    # ネットワーク一覧
│   │   ├── GatewayStatus.jsx  # ゲートウェイ状態
│   │   └── AlertPanel.jsx     # アラートパネル
│   ├── data/
│   │   └── mockData.js        # テストモード用デモデータ
│   └── App.jsx
├── vite.config.js             # Vite設定（CORSプロキシ含む）
├── .env.example               # 環境変数サンプル
└── package.json
```

---

## 技術スタック

- **React 18** + **Vite**
- **Tailwind CSS** — スタイリング
- **Recharts** — グラフ描画
- **Axios** — HTTP通信
- **date-fns** — 日付処理
