# 設計書レビューチェックリスト

参照元: `docs/requirements/requirements.md`
レビュー対象: `docs/design/` 配下の全ドキュメント

---

## 0. レビュー対象ドキュメント一覧

| # | ファイル | 内容 |
|---|---------|------|
| 1 | `docs/design/design.md` | システム構成・画面設計・FE/BE実装設計・認証認可・エラーハンドリング |
| 2 | `docs/design/er-diagram.md` | Mermaid記法によるER図・リレーション説明 |
| 3 | `docs/design/table-definitions.md` | テーブル定義・インデックス設計・Laravelマイグレーション設計 |
| 4 | `docs/design/screen-transitions.md` | Mermaid記法による画面遷移図・遷移ルール一覧 |
| 5 | `docs/design/openapi.yaml` | OpenAPI 3.0 全エンドポイント仕様 |
| 6 | `docs/design/mockup/*.html` | HTMLモックアップ（login / task-board / task-modal / user-management / user-modal） |

---

## 1. 要件定義書トレース確認

### 1.1 機能要件（F-001〜F-014）

| 要件ID | 機能名 | design.md | openapi.yaml | screen-transitions.md |
|--------|--------|:---------:|:------------:|:---------------------:|
| F-001 | ログイン | §3.1, §6 | POST /login | ✓ |
| F-002 | ログアウト | §5.3 | POST /logout | ✓ |
| F-003 | タスク一覧（カンバン） | §3.2 | GET /tasks | ✓ |
| F-004 | タスク作成 | §3.3 | POST /tasks | ✓ |
| F-005 | タスク編集 | §3.3 | PUT /tasks/{id} | ✓ |
| F-006 | タスク削除 | §3.3 | DELETE /tasks/{id} | ✓ |
| F-007 | タスクステータス変更 | §3.2 D&D仕様 | PATCH /tasks/{id}/status | ✓ |
| F-008 | タスクフィルタ（ステータス） | §3.2 | —（FE側処理） | ✓ |
| F-009 | タスクフィルタ（優先度） | §3.2 | —（FE側処理） | ✓ |
| F-010 | タスク検索 | §3.2 | —（FE側処理） | ✓ |
| F-011 | ユーザー一覧 | §3.4 | GET /admin/users | ✓ |
| F-012 | ユーザー作成 | §3.5 | POST /admin/users | ✓ |
| F-013 | ユーザー編集 | §3.5 | PUT /admin/users/{id} | ✓ |
| F-014 | ユーザー削除（論理削除） | §5.3 | DELETE /admin/users/{id} | ✓ |

### 1.2 画面要件（S-001〜S-005）

| 画面ID | 画面名 | design.md | mockup | screen-transitions.md |
|--------|--------|:---------:|:------:|:---------------------:|
| S-001 | ログイン画面 | §3.1 | login.html | ✓ |
| S-002 | タスクボード画面 | §3.2 | task-board.html | ✓ |
| S-003 | タスク作成/編集モーダル | §3.3 | task-modal.html | ✓ |
| S-004 | ユーザー管理画面 | §3.4 | user-management.html | ✓ |
| S-005 | ユーザー作成/編集モーダル | §3.5 | user-modal.html | ✓ |

### 1.3 APIエンドポイント（§6.2）

| エンドポイント | openapi.yaml |
|----------------|:------------:|
| POST /api/login | ✓ |
| POST /api/logout | ✓ |
| GET /api/user | ✓ |
| GET /api/tasks | ✓ |
| POST /api/tasks | ✓ |
| PUT /api/tasks/{id} | ✓ |
| PATCH /api/tasks/{id}/status | ✓ |
| DELETE /api/tasks/{id} | ✓ |
| GET /api/admin/users | ✓ |
| POST /api/admin/users | ✓ |
| PUT /api/admin/users/{id} | ✓ |
| DELETE /api/admin/users/{id} | ✓ |

---

## 2. ドキュメント別チェック観点

### 2.1 design.md

- [ ] 全画面（S-001〜S-005）の設計が存在するか
- [ ] 各画面のアクセス権が要件定義書と一致しているか
- [ ] タスクカードの表示項目（タイトル・優先度バッジ・期限日）が要件F-003と一致しているか
- [ ] タスク作成フォームのデフォルト値（status: todo, priority: medium）が要件F-004と一致しているか
- [ ] F-007フォールバック仕様（セレクトボックス）がUIに設計されているか
- [ ] FEディレクトリ構成がCLAUDE.mdの規約に沿っているか
- [ ] Composableに `use` プレフィックスが適用されているか
- [ ] Axiosクライアントに `withCredentials: true` が設定されているか
- [ ] FormRequestによるバリデーションが設計されているか（コントローラーに書かない）
- [ ] API Resourceによるレスポンス整形が設計されているか
- [ ] TaskPolicy による認可チェックが設計されているか
- [ ] AdminMiddleware による管理者チェックが設計されているか
- [ ] エラーレスポンスが日本語メッセージになっているか
- [ ] 401レスポンス時のFEリダイレクトがインターセプターで処理される設計か

### 2.2 er-diagram.md

- [ ] usersとtasksの1対多リレーションが要件定義書§5.3と一致しているか
- [ ] 全カラムの型・制約がtable-definitions.mdと一致しているか
- [ ] SoftDeletesの注意点（論理削除ではCASCADEが発火しない）が明記されているか

### 2.3 table-definitions.md

- [ ] usersテーブルの全カラムが要件定義書§5.1と一致しているか
- [ ] tasksテーブルの全カラムが要件定義書§5.2と一致しているか
- [ ] enum値が要件定義書と一致しているか
- [ ] CASCADE DELETEがFK制約に設定されているか
- [ ] SoftDeletesの挙動について補足説明があるか
- [ ] マイグレーションコードがテーブル定義と一致しているか

### 2.4 screen-transitions.md

- [ ] 全画面（S-001〜S-005）が遷移図に含まれているか
- [ ] 認証ガードのリダイレクト条件がdesign.md§4.4と一致しているか
- [ ] タスク削除の確認ダイアログフローが要件F-006と一致しているか
- [ ] ユーザー管理のadminチェックが設計されているか
- [ ] 論理削除済みユーザーの操作制限が記載されているか
- [ ] 自分自身の削除不可が記載されているか
- [ ] バリデーションエラー時の遷移（モーダル継続表示）が記載されているか

### 2.5 openapi.yaml

- [ ] 全エンドポイントが要件定義書§6.2と一致しているか
- [ ] リクエスト/レスポンスのスキーマがdesign.md型定義と一致しているか
- [ ] バリデーションルール（maxLength等）がFormRequest設計と一致しているか
- [ ] エラーレスポンス形式が要件定義書§6.1と一致しているか
- [ ] `/sanctum/csrf-cookie` のベースURLが正しく設定されているか
- [ ] コレクションレスポンスが `{ data: [...] }` 形式か

---

## 3. ドキュメント間整合性チェック観点

- [ ] APIパス: 要件定義書 ↔ openapi.yaml ↔ design.md
- [ ] テーブル定義: 要件定義書 ↔ er-diagram.md ↔ table-definitions.md
- [ ] 画面一覧: 要件定義書 ↔ design.md ↔ screen-transitions.md ↔ mockup
- [ ] ルーティングガード: design.md§4.4 ↔ screen-transitions.md
- [ ] バリデーションルール: design.md§5.5 ↔ openapi.yaml スキーマ
- [ ] エラーレスポンス形式: 要件定義書§6.1 ↔ design.md§7 ↔ openapi.yaml
- [ ] HTTPステータスコード: design.md§7 ↔ openapi.yaml responses
- [ ] enum値: table-definitions.md ↔ er-diagram.md ↔ openapi.yaml
