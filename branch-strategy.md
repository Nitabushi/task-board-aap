## ブランチ戦略

```
main ← 安定版（リリース可能な状態のみ）
  ├── hotfix/* ← 本番の緊急修正
  └── develop ← 開発のベースブランチ
        ├── feature/* ← 機能開発（Issue単位）
        └── release/* ← リリース準備（最終調整・テスト）
```

### ブランチの役割

| ブランチ   | 用途                             | 作成元  | マージ先            | 直接push                  |
| ---------- | -------------------------------- | ------- | ------------------- | ------------------------- |
| main       | 安定版。リリース可能な状態のみ   | -       | -                   | ❌ 禁止（#5まで作業済み） |
| develop    | 開発のベースブランチ             | main    | main（release経由） | ⚠️ 小さな修正のみ可       |
| feature/\* | 機能開発。Issue単位で作成        | develop | develop             | ✅                        |
| release/\* | リリース前の最終調整・結合テスト | develop | main + develop      | ✅                        |
| hotfix/\*  | 本番の緊急バグ修正               | main    | main + develop      | ✅                        |

### 各ブランチの詳細

#### feature/\*

- 機能開発やドキュメント作成に使用
- Issue単位で作成し、完了後に `develop` へPRを作成してマージ
- PRでコード差分を確認することがレビューの代わりとなる
- 命名規則: `feature/issue番号-簡潔な説明`

#### release/\*

- 全機能が `develop` に揃った段階で作成
- リリース前の結合テスト・バグ修正・ドキュメント最終調整を行う
- 問題なければ `main` と `develop` の両方にマージ
- 命名規則: `release/バージョン`（例: `release/1.0.0`）
- 本プロジェクトでは Phase 3（Issue #16〜#18）で使用

#### hotfix/\*

- `main` で発見された緊急バグの修正に使用
- 修正後、`main` と `develop` の両方にマージ
- 命名規則: `hotfix/簡潔な説明`（例: `hotfix/login-csrf-fix`）
- 本プロジェクトでは必要に応じて使用

### 運用ルール

- Issue #1〜#5（環境準備・要件定義）は `main` ブランチで作業済み
- Issue #6（設計）以降は `develop` ブランチを起点にブランチ運用を開始する
- `develop` ブランチから `feature/*` を切って作業する
- 作業完了後、`develop` にPRを作成してマージする
  - PRの差分がレビュー記録となる（セルフレビュー）
- Phase 3 で `release/1.0.0` を作成し、結合テスト・最終調整を実施
- release ブランチで問題なければ `main` にマージしてリリース完了
- Issue #6 以降、`main` には直接pushしない

### ブランチ運用開始手順

Issue #5 完了後、以下を実行して `develop` ブランチを作成する：

1. `main` の最新状態から `develop` を作成
2. 以降は `develop` から `feature/*` を切って作業

### ブランチ一覧（Issue対応）

#### Phase 0 - 環境準備（main で作業済み）

| Issue | ブランチ         |
| ----- | ---------------- |
| #1    | main（作業済み） |
| #2    | main（作業済み） |
| #3    | main（作業済み） |
| #4    | main（作業済み） |

#### Phase 1 - 仕様策定

| Issue | ブランチ            |
| ----- | ------------------- |
| #5    | main（作業済み）    |
| #7    | feature/6-design    |
| #8    | feature/8-test-plan |

#### Phase 2 - 実装

| Issue | ブランチ |
| ----- | -------- |
| #8〜  | develop  |

#### Phase 3 - テスト・仕上げ

| Issue | ブランチ                                             |
| ----- | ---------------------------------------------------- |
| #16   | release/1.0.0（結合テスト）                          |
| #17   | release/1.0.0（ドキュメント整備、#16と同一ブランチ） |
| #18   | release/1.0.0（最終確認、#16と同一ブランチ）         |

### マージフロー図

```
Phase 0-1:  main で作業

Phase 1-2:  main → develop を作成
            develop → feature/* → develop（PR経由）

Phase 3:    develop → release/1.0.0
            release/1.0.0 で結合テスト・最終調整
            release/1.0.0 → main（リリース）
            release/1.0.0 → develop（同期）

緊急修正:   main → hotfix/* → main + develop
```
