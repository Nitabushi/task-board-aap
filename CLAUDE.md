# CLAUDE.md - プロジェクトルール

## プロジェクト概要

- **アプリ名**: Task Board（タスク管理アプリ）
- **目的**: ポートフォリオ用のWebアプリケーション
- **開発手法**: Spec-Driven Development + TDD

## 技術スタック

- **フロントエンド**: Vue.js 3（Composition API）+ TypeScript + Vite
- **UIフレームワーク**: Tailwind CSS
- **状態管理**: Pinia
- **HTTP通信**: Axios
- **バックエンド**: Laravel 12（PHP 8.3）
- **認証**: Laravel Sanctum（SPA認証、Cookieベース）
- **データベース**: MySQL 8.4
- **テスト**: PHPUnit（バックエンド）、Vitest（フロントエンド）
- **CI/CD**: GitHub Actions

## ディレクトリ構成

```
task-board/
├── backend/          ← Laravel プロジェクト
│   ├── app/
│   ├── tests/
│   └── ...
├── frontend/         ← Vue.js プロジェクト
│   ├── src/
│   ├── tests/
│   └── ...
├── docs/             ← 仕様書・ドキュメント
│   ├── requirements/
│   │   └── requirements.md
│   ├── design/
│   │   └── openapi.yaml  ← Swagger（設計フェーズで作成）
│   ├── test-plan.md
│   └── ...
└── CLAUDE.md         ← このファイル
```

## 仕様書の参照先

実装時は必ず以下の仕様書を参照すること：

- **要件定義書**: `docs/requirements/requirements.md`
- **設計書**: `docs/design/`（画面設計、DB設計）
- **API仕様書**: `docs/design/openapi.yaml`（Swagger / OpenAPI 3.0、設計フェーズで作成）
- **テスト計画書**: `docs/test-plan.md`

## コーディング規約

### バックエンド（Laravel / PHP）

- PSR-12 コーディングスタイルに準拠
- Eloquent ORM を使用（クエリビルダーの直接使用は避ける）
- FormRequest でバリデーションを行う（コントローラーに書かない）
- API Resource でレスポンスを整形する
- ルーティングは `routes/api.php` に定義
- 命名規則:
  - モデル: 単数形、PascalCase（例: `Task`, `User`）
  - コントローラー: PascalCase + Controller（例: `TaskController`）
  - テスト: PascalCase + Test（例: `TaskControllerTest`）

### フロントエンド（Vue.js / TypeScript）

- Composition API（`<script setup lang="ts">`）を使用
- ESLint + Prettier で自動フォーマット
- コンポーネントファイル名: PascalCase（例: `TaskCard.vue`）
- Composable: `use` プレフィックス（例: `useAuth.ts`）
- 型定義: `src/types/` ディレクトリに配置
- API呼び出し: `src/api/` ディレクトリに集約

## テスト方針

- **TDD（テスト駆動開発）** で実装する
  1. Red: 失敗するテストを先に書く
  2. Green: テストが通る最小限のコードを書く
  3. Refactor: リファクタリング
- バックエンド: PHPUnit Feature Test で API の結合テストを記述
- フロントエンド: Vitest でコンポーネントテストを記述
- テスト実行: `cd backend && php artisan test`
- テスト実行: `cd frontend && npx vitest`

## コミットメッセージ規約

Conventional Commits に準拠：

```
feat: 新機能追加
fix: バグ修正
docs: ドキュメントのみの変更
test: テストの追加・修正
refactor: リファクタリング
chore: ビルドプロセスやツールの変更
style: コードスタイルの変更（動作に影響しない）
ci: CI/CD設定の変更
```

## 開発環境

- Dev Container（Docker Compose）で動作
- Laravel API: `http://localhost:8000`
- Vue.js Dev Server: `http://localhost:5173`
- MySQL: `localhost:3306`（DB名: `task_board`）

## AI作業ログ

- 作業を行うたびに `ai-logs/` ディレクトリにログファイルを記録すること
- ファイル名は `YYYY-MM-DD_連番.md` 形式（例: `2026-03-07_001.md`）
- 同日に複数ファイルが存在する場合は連番をインクリメントする
- 記録内容（Markdown形式）:

```markdown
# 日付: YYYY-MM-DD

## ユーザーからの指示
（ユーザーが依頼した内容をそのまま記載）

## 実施した作業
（実際に行った作業の概要）

## 変更したファイル
- path/to/file - 変更内容の説明

## 備考
（特記事項があれば記載）
```

## 注意事項

- 他ユーザーのタスクにはアクセスできないよう認可チェックを必ず実装すること
- パスワードは bcrypt でハッシュ化すること
- API レスポンスは日本語のメッセージを返すこと
- エラーハンドリングは適切に行い、ユーザーにわかりやすいメッセージを表示すること
