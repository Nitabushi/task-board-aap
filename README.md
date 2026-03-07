# Task Board - タスク管理アプリ

ポートフォリオ用のタスク管理アプリケーション

## 技術スタック

| 区分           | 技術                                        |
| -------------- | ------------------------------------------- |
| フロントエンド | Vue.js 3 + TypeScript + Vite + Tailwind CSS |
| バックエンド   | Laravel 12 (PHP 8.3)                        |
| データベース   | MySQL 8.4                                   |
| 認証           | Laravel Sanctum                             |
| テスト         | PHPUnit / Vitest                            |
| CI/CD          | GitHub Actions                              |
| 開発環境       | Dev Container (Docker)                      |

## 開発手法

- **Spec-Driven Development (SpecDD)**: 仕様書を先に作成し、仕様に基づいてAI（Claude Code）と協働して実装
- **TDD (テスト駆動開発)**: テストを先行して記述し、テストを通す形で実装

## セットアップ

### 前提条件

- Docker Desktop
- VS Code + [Dev Containers拡張]

### 手順

1. リポジトリをクローン

```bash
git clone https://github.com/<your-username>/task-board.git
cd task-board
```

2. VS Code で開き、Dev Container で起動

```
コマンドパレット → Dev Containers: Reopen in Container
```

3. バックエンドのセットアップ

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve --host=0.0.0.0
```

4. フロントエンドのセットアップ

```bash
cd frontend
npm install
npm run dev
```

5. ブラウザでアクセス

- フロントエンド: http://localhost:5173
- API: http://localhost:8000

### テストユーザー

| 名前       | メール            | パスワード | 役割   |
| ---------- | ----------------- | ---------- | ------ |
| 管理者太郎 | admin@example.com | password   | 管理者 |
| 一般花子   | user1@example.com | password   | 一般   |
| 一般次郎   | user2@example.com | password   | 一般   |

## ドキュメント

- [要件定義書](docs/requirements/requirements.md)
- [API仕様書](docs/design/openapi.yaml)（設計フェーズで作成予定）
- [テスト計画書](docs/test-plan.md)（設計フェーズで作成予定）

<!-- TODO: Issue #17 で完成させる -->
<!-- - スクリーンショット -->
<!-- - ディレクトリ構成の詳細 -->
<!-- - 開発プロセスの説明 -->

## ライセンス

MIT License
