# テスト計画書

## 関連ドキュメント

| ドキュメント   | ファイル                                     | 内容                    |
| -------------- | -------------------------------------------- | ----------------------- |
| 要件定義書     | `docs/requirements/requirements.md`          | 機能要件・非機能要件    |
| 設計書         | `docs/design/design.md`                      | システム構成・API設計   |
| API仕様書      | `docs/design/openapi.yaml`                   | OpenAPI 3.0 全エンドポイント |
| テスト結果格納 | `docs/test-results/`                         | テスト実行結果レポート  |
| テストコード   | `tests/backend/`, `tests/frontend/`          | テストコード格納先      |

---

## 目次

- [1. テスト方針](#1-テスト方針)
- [2. テスト種別と対象](#2-テスト種別と対象)
- [3. テスト観点](#3-テスト観点)
- [4. バックエンドテスト詳細](#4-バックエンドテスト詳細)
  - [4.1 認証 API テスト](#41-認証-api-テスト)
  - [4.2 タスク API テスト](#42-タスク-api-テスト)
  - [4.3 ユーザー管理 API テスト](#43-ユーザー管理-api-テスト)
- [5. フロントエンドテスト詳細](#5-フロントエンドテスト詳細)
- [6. カバレッジ目標](#6-カバレッジ目標)
- [7. テスト実行手順](#7-テスト実行手順)
- [8. テスト結果ドキュメントフォーマット](#8-テスト結果ドキュメントフォーマット)
- [改訂履歴](#改訂履歴)

---

## 1. テスト方針

### 開発手法

**TDD（テスト駆動開発）** に準拠して実装する。

1. **Red**: 失敗するテストを先に書く
2. **Green**: テストが通る最小限のコードを書く
3. **Refactor**: テストが通った状態でリファクタリング

### テスト優先度

| 優先度 | 対象                               |
| ------ | ---------------------------------- |
| 高     | 認証・認可ロジック、CRUD API全件   |
| 高     | バリデーション（必須・文字数・型） |
| 中     | 主要フロントエンドコンポーネント   |
| 中     | Composable・Store                  |
| 低     | UI表示の細かな見た目               |

---

## 2. テスト種別と対象

| テスト種別          | ツール                    | 格納場所                      | 対象                                    |
| ------------------- | ------------------------- | ----------------------------- | --------------------------------------- |
| API結合テスト（BE） | PHPUnit Feature Test      | `tests/backend/Feature/`      | 全APIエンドポイント（正常系・異常系）   |
| 単体テスト（BE）    | PHPUnit Unit Test         | `tests/backend/Unit/`         | Model、FormRequest、Policy、Middleware  |
| コンポーネントテスト| Vitest + Vue Test Utils   | `tests/frontend/components/`  | 主要Vueコンポーネント                   |
| Composableテスト    | Vitest                    | `tests/frontend/composables/` | useAuth, useTasks, useUsers             |
| Storeテスト         | Vitest + Pinia Testing    | `tests/frontend/stores/`      | auth, tasks, users Store                |

> **注意**: バックエンドのテストコードは実装時に `backend/tests/` 配下（Laravel標準）に配置し、`tests/backend/` はシンボリックリンクまたは参照ドキュメントとして扱う。フロントエンドも同様に `frontend/tests/` 配下に配置する。

---

## 3. テスト観点

### 3.1 正常系

- 正しい入力値でAPIが期待するステータスコードとレスポンスを返す
- CRUD操作後にDBの状態が正しく変化する
- レスポンスのJSON構造がAPI仕様書（openapi.yaml）と一致する

### 3.2 異常系

| 観点               | 確認内容                                               |
| ------------------ | ------------------------------------------------------ |
| 未認証             | 認証必須エンドポイントに未ログイン状態でアクセス→401  |
| 権限不足           | 一般ユーザーが管理者APIにアクセス→403                 |
| 他ユーザーのリソース | 他ユーザーのタスクを更新・削除→403                  |
| 存在しないリソース | 存在しないID指定→404                                  |
| バリデーション失敗 | 必須項目なし・文字数超過・不正な値→422               |
| 論理削除済みユーザー | deleted_atが非NULLのユーザーでログイン→422           |
| 自己削除禁止       | 管理者が自分自身を削除→403                            |

### 3.3 認証・認可

| シナリオ                                | 期待結果   |
| --------------------------------------- | ---------- |
| 正しい認証情報でログイン                | 200、ユーザー情報返却 |
| 誤ったパスワードでログイン              | 422        |
| 論理削除済みユーザーでログイン          | 422        |
| 未ログイン状態で認証必須APIにアクセス   | 401        |
| 一般ユーザーが `/api/admin/*` にアクセス| 403        |
| ログアウト後にAPIアクセス              | 401        |

### 3.4 バリデーション

#### タスク

| フィールド  | テストケース                                           |
| ----------- | ------------------------------------------------------ |
| title       | 空文字→422、256文字→422、255文字→201/200、null→422  |
| description | 1001文字→422、1000文字→201/200、null→OK（任意）      |
| status      | 不正な値→422、todo/in_progress/done→OK               |
| priority    | 不正な値→422、high/medium/low→OK                     |
| due_date    | 不正な日付形式→422、null→OK（任意）、有効な日付→OK   |

#### ユーザー

| フィールド | テストケース                                                |
| ---------- | ----------------------------------------------------------- |
| name       | 空文字→422、256文字→422、255文字→201/200                  |
| email      | 無効な形式→422、重複→422、有効な形式→OK                  |
| password   | 7文字→422、8文字以上→OK、更新時空欄→パスワード変更なし   |
| role       | admin/user以外→422、admin→OK、user→OK                    |

### 3.5 CRUD操作の整合性

- 作成後にGETで取得できる
- 更新後に変更が反映されている
- 削除後にGETで取得できない（404）
- ユーザー論理削除後、関連タスクが物理削除される（CASCADE）
- 論理削除済みユーザーの編集リクエスト→404

### 3.6 境界値

| 項目                | 境界値                          |
| ------------------- | ------------------------------- |
| タイトル文字数      | 254文字（OK）、255文字（OK）、256文字（NG） |
| 説明文文字数        | 999文字（OK）、1000文字（OK）、1001文字（NG） |
| パスワード文字数    | 7文字（NG）、8文字（OK）        |
| ユーザー名文字数    | 254文字（OK）、255文字（OK）、256文字（NG） |

---

## 4. バックエンドテスト詳細

テストクラスは `backend/tests/Feature/` 配下に配置する。

### 4.1 認証 API テスト

**クラス**: `AuthControllerTest`

| # | テストメソッド名                                       | HTTP     | エンドポイント              | 期待ステータス |
| - | ------------------------------------------------------ | -------- | --------------------------- | -------------- |
| 1 | test_login_with_valid_credentials                      | POST     | /api/login                  | 200            |
| 2 | test_login_returns_user_data                           | POST     | /api/login                  | 200 + body確認 |
| 3 | test_login_with_wrong_password                         | POST     | /api/login                  | 422            |
| 4 | test_login_with_nonexistent_email                      | POST     | /api/login                  | 422            |
| 5 | test_login_with_soft_deleted_user                      | POST     | /api/login                  | 422            |
| 6 | test_login_with_missing_email                          | POST     | /api/login                  | 422            |
| 7 | test_login_with_missing_password                       | POST     | /api/login                  | 422            |
| 8 | test_logout_when_authenticated                         | POST     | /api/logout                 | 204            |
| 9 | test_logout_when_unauthenticated                       | POST     | /api/logout                 | 401            |
| 10| test_get_current_user_when_authenticated              | GET      | /api/user                   | 200 + body確認 |
| 11| test_get_current_user_when_unauthenticated            | GET      | /api/user                   | 401            |

### 4.2 タスク API テスト

**クラス**: `TaskControllerTest`

#### GET /api/tasks（タスク一覧）

| # | テストメソッド名                                  | 期待ステータス | 確認内容                             |
| - | ------------------------------------------------- | -------------- | ------------------------------------ |
| 1 | test_get_tasks_returns_only_own_tasks             | 200            | 自分のタスクのみ返却                 |
| 2 | test_get_tasks_does_not_include_other_user_tasks  | 200            | 他ユーザーのタスクが含まれない       |
| 3 | test_get_tasks_returns_correct_structure          | 200            | レスポンス構造がAPI仕様通り          |
| 4 | test_get_tasks_when_unauthenticated               | 401            | 未認証拒否                           |
| 5 | test_get_tasks_returns_empty_when_no_tasks        | 200            | タスク0件でも空配列を返す            |

#### POST /api/tasks（タスク作成）

| # | テストメソッド名                                  | 期待ステータス | 確認内容                             |
| - | ------------------------------------------------- | -------------- | ------------------------------------ |
| 6 | test_create_task_with_valid_data                  | 201            | タスク作成・DBに保存                 |
| 7 | test_create_task_assigns_to_authenticated_user    | 201            | user_idがログインユーザーに設定      |
| 8 | test_create_task_without_title                    | 422            | titleなしは拒否                      |
| 9 | test_create_task_with_title_exceeding_max_length  | 422            | 256文字は拒否                        |
| 10| test_create_task_with_title_at_max_length         | 201            | 255文字はOK                          |
| 11| test_create_task_with_invalid_status              | 422            | 不正なstatusは拒否                   |
| 12| test_create_task_with_invalid_priority            | 422            | 不正なpriorityは拒否                 |
| 13| test_create_task_with_description_exceeding_max   | 422            | 1001文字の説明文は拒否               |
| 14| test_create_task_with_null_description            | 201            | descriptionはnull許容                |
| 15| test_create_task_with_null_due_date               | 201            | due_dateはnull許容                   |
| 16| test_create_task_with_invalid_due_date_format     | 422            | 不正な日付形式は拒否                 |
| 17| test_create_task_when_unauthenticated             | 401            | 未認証拒否                           |

#### PUT /api/tasks/{id}（タスク更新）

| # | テストメソッド名                                  | 期待ステータス | 確認内容                             |
| - | ------------------------------------------------- | -------------- | ------------------------------------ |
| 18| test_update_own_task_with_valid_data              | 200            | 自分のタスク更新成功                 |
| 19| test_update_other_user_task_is_forbidden          | 403            | 他ユーザーのタスク更新は拒否         |
| 20| test_update_nonexistent_task                      | 404            | 存在しないタスクは404                |
| 21| test_update_task_validation_errors                | 422            | バリデーションエラー                 |
| 22| test_update_task_when_unauthenticated             | 401            | 未認証拒否                           |

#### PATCH /api/tasks/{id}/status（ステータス更新）

| # | テストメソッド名                                  | 期待ステータス | 確認内容                             |
| - | ------------------------------------------------- | -------------- | ------------------------------------ |
| 23| test_update_status_with_valid_status              | 200            | ステータス更新成功                   |
| 24| test_update_status_of_other_user_task_is_forbidden| 403            | 他ユーザーのタスクは拒否             |
| 25| test_update_status_with_invalid_status            | 422            | 不正なstatusは拒否                   |
| 26| test_update_status_of_nonexistent_task            | 404            | 存在しないタスクは404                |
| 27| test_update_status_when_unauthenticated           | 401            | 未認証拒否                           |

#### DELETE /api/tasks/{id}（タスク削除）

| # | テストメソッド名                                  | 期待ステータス | 確認内容                             |
| - | ------------------------------------------------- | -------------- | ------------------------------------ |
| 28| test_delete_own_task                              | 204            | 自分のタスク削除成功・DBから除去     |
| 29| test_delete_other_user_task_is_forbidden          | 403            | 他ユーザーのタスク削除は拒否         |
| 30| test_delete_nonexistent_task                      | 404            | 存在しないタスクは404                |
| 31| test_delete_task_when_unauthenticated             | 401            | 未認証拒否                           |

### 4.3 ユーザー管理 API テスト

**クラス**: `Admin\UserControllerTest`

#### GET /api/admin/users（ユーザー一覧）

| # | テストメソッド名                                       | 期待ステータス | 確認内容                             |
| - | ------------------------------------------------------ | -------------- | ------------------------------------ |
| 1 | test_admin_can_get_all_users                           | 200            | 全ユーザー取得                       |
| 2 | test_admin_can_get_soft_deleted_users                  | 200            | 論理削除済みユーザーも含まれる       |
| 3 | test_regular_user_cannot_access_user_list              | 403            | 一般ユーザーは拒否                   |
| 4 | test_get_user_list_when_unauthenticated                | 401            | 未認証拒否                           |
| 5 | test_user_list_returns_correct_structure               | 200            | レスポンス構造がAPI仕様通り          |

#### POST /api/admin/users（ユーザー作成）

| # | テストメソッド名                                       | 期待ステータス | 確認内容                             |
| - | ------------------------------------------------------ | -------------- | ------------------------------------ |
| 6 | test_admin_can_create_user                             | 201            | ユーザー作成・DBに保存               |
| 7 | test_created_user_password_is_hashed                   | 201            | パスワードがbcryptでハッシュ化       |
| 8 | test_create_user_with_duplicate_email                  | 422            | 重複メールアドレスは拒否             |
| 9 | test_create_user_with_invalid_email_format             | 422            | 無効なメール形式は拒否               |
| 10| test_create_user_with_short_password                   | 422            | 7文字以下のパスワードは拒否          |
| 11| test_create_user_with_missing_required_fields          | 422            | 必須項目なしは拒否                   |
| 12| test_create_user_with_invalid_role                     | 422            | 不正なroleは拒否                     |
| 13| test_regular_user_cannot_create_user                   | 403            | 一般ユーザーは拒否                   |
| 14| test_create_user_when_unauthenticated                  | 401            | 未認証拒否                           |

#### PUT /api/admin/users/{id}（ユーザー編集）

| # | テストメソッド名                                       | 期待ステータス | 確認内容                             |
| - | ------------------------------------------------------ | -------------- | ------------------------------------ |
| 15| test_admin_can_update_user                             | 200            | ユーザー編集成功                     |
| 16| test_update_user_password_when_provided                | 200            | パスワードが更新される               |
| 17| test_update_user_password_unchanged_when_empty         | 200            | パスワード空欄で変更なし             |
| 18| test_update_soft_deleted_user_returns_not_found        | 404            | 論理削除済みユーザーの編集は404      |
| 19| test_update_user_with_duplicate_email                  | 422            | 他ユーザーと重複するメールは拒否     |
| 20| test_update_user_email_same_as_own_is_allowed          | 200            | 自分自身のメールアドレスへの更新はOK |
| 21| test_regular_user_cannot_update_user                   | 403            | 一般ユーザーは拒否                   |
| 22| test_update_user_when_unauthenticated                  | 401            | 未認証拒否                           |

#### DELETE /api/admin/users/{id}（ユーザー論理削除）

| # | テストメソッド名                                       | 期待ステータス | 確認内容                             |
| - | ------------------------------------------------------ | -------------- | ------------------------------------ |
| 23| test_admin_can_soft_delete_user                        | 204            | deleted_atがセットされる             |
| 24| test_soft_delete_user_cascades_tasks                   | 204            | 関連タスクが物理削除される           |
| 25| test_admin_cannot_delete_self                          | 403            | 自分自身の削除は拒否                 |
| 26| test_delete_nonexistent_user                           | 404            | 存在しないユーザーは404              |
| 27| test_soft_deleted_user_cannot_login                    | 422            | 削除済みユーザーはログイン不可       |
| 28| test_regular_user_cannot_delete_user                   | 403            | 一般ユーザーは拒否                   |
| 29| test_delete_user_when_unauthenticated                  | 401            | 未認証拒否                           |

---

## 5. フロントエンドテスト詳細

テストコードは `frontend/tests/` 配下に配置する（Vitest + Vue Test Utils）。

### 5.1 コンポーネントテスト

#### TaskCard.vue

| # | テストケース                                    | 確認内容                                     |
| - | ----------------------------------------------- | -------------------------------------------- |
| 1 | タスク情報を正しく表示する                      | タイトル・優先度バッジ・期限日が表示         |
| 2 | 優先度バッジの色が正しく表示される              | 高=赤、中=黄、低=緑                          |
| 3 | due_dateがnullの場合は期限日が非表示            | 期限日エリアが存在しない                     |
| 4 | カードクリックでemitが発火する                  | clickイベントが発火される                    |

#### TaskModal.vue

| # | テストケース                                    | 確認内容                                     |
| - | ----------------------------------------------- | -------------------------------------------- |
| 1 | 作成モードで正しいタイトルが表示される          | 「タスク作成」が表示                         |
| 2 | 編集モードで正しいタイトルが表示される          | 「タスク編集」が表示                         |
| 3 | 編集モードで既存データが初期値として設定される  | フォームに既存のタスクデータが入力済み       |
| 4 | 編集モードで削除ボタンが表示される              | 削除ボタンが存在する                         |
| 5 | 作成モードで削除ボタンが表示されない            | 削除ボタンが存在しない                       |
| 6 | タイトル未入力でバリデーションエラーが表示される| エラーメッセージが表示                       |
| 7 | 保存ボタンクリックでsubmitイベントが発火する    | submitイベントとフォームデータが渡される     |
| 8 | キャンセルボタンクリックでcloseイベントが発火する| closeイベントが発火される                  |

#### TaskBoard.vue

| # | テストケース                                    | 確認内容                                     |
| - | ----------------------------------------------- | -------------------------------------------- |
| 1 | 3つのカラム（TODO/進行中/完了）が表示される     | 各カラムが存在する                           |
| 2 | タスクが正しいカラムに表示される                | statusに対応するカラムにタスクカードがある   |
| 3 | ステータスフィルタでタスクが絞り込まれる        | 選択したステータスのタスクのみ表示           |
| 4 | 優先度フィルタでタスクが絞り込まれる            | 選択した優先度のタスクのみ表示               |
| 5 | 検索キーワードでタスクが絞り込まれる            | タイトル・説明文でのキーワード一致           |
| 6 | フィルタと検索の組み合わせが機能する            | 複数条件の同時適用                           |

#### UserTable.vue

| # | テストケース                                    | 確認内容                                     |
| - | ----------------------------------------------- | -------------------------------------------- |
| 1 | ユーザー一覧が表示される                        | 全ユーザーの行が存在する                     |
| 2 | 論理削除済みユーザーがグレーアウトで表示される  | 削除済みユーザーの行にグレースタイルが当たる |
| 3 | 論理削除済みユーザーに編集・削除ボタンがない    | 削除済みユーザー行にボタンが存在しない       |
| 4 | 自分自身に削除ボタンがない                      | ログインユーザー行に削除ボタンがない         |

#### UserModal.vue

| # | テストケース                                    | 確認内容                                     |
| - | ----------------------------------------------- | -------------------------------------------- |
| 1 | 作成モードでパスワードが必須表示                | パスワードフィールドに必須マークがある       |
| 2 | 編集モードでパスワードが任意表示                | パスワードフィールドに「空欄で変更なし」表示 |
| 3 | バリデーションエラーが表示される                | エラーメッセージが表示                       |

### 5.2 Composable テスト

#### useAuth.ts

| # | テストケース                                    | 確認内容                                     |
| - | ----------------------------------------------- | -------------------------------------------- |
| 1 | login()が成功時にユーザー情報をstoreにセットする| authStore.userが更新される                   |
| 2 | login()が失敗時にエラーをスローする             | エラーがキャッチされる                       |
| 3 | logout()がstoreのユーザーをクリアする           | authStore.userがnullになる                   |

#### useTasks.ts

| # | テストケース                                    | 確認内容                                     |
| - | ----------------------------------------------- | -------------------------------------------- |
| 1 | fetchTasks()がAPIを呼び出しstoreを更新する      | tasksStore.tasksが更新される                 |
| 2 | createTask()が成功時にstoreに追加される         | 新規タスクがstoreに追加される                |
| 3 | updateTask()が成功時にstoreが更新される         | 該当タスクがstoreで更新される                |
| 4 | deleteTask()が成功時にstoreから削除される       | 該当タスクがstoreから除去される              |

### 5.3 Store テスト

#### stores/auth.ts

| # | テストケース                                    | 確認内容                                     |
| - | ----------------------------------------------- | -------------------------------------------- |
| 1 | 初期状態でuserがnull・checkedがfalse            | 初期値確認                                   |
| 2 | fetchUser()成功でuser・checkedが更新される      | state更新確認                                |
| 3 | isAdmin computedが正しく動作する               | adminの場合true、userの場合false             |

#### stores/tasks.ts

| # | テストケース                                    | 確認内容                                     |
| - | ----------------------------------------------- | -------------------------------------------- |
| 1 | fetchTasks()でtasksが更新される                 | state確認                                    |
| 2 | createTask()でtasksに追加される                 | 配列に追加確認                               |
| 3 | updateTask()でtasks内の該当タスクが更新される   | 該当IDのタスクが更新確認                     |
| 4 | deleteTask()でtasksから除去される               | 該当IDのタスクが除去確認                     |

---

## 6. カバレッジ目標

| 対象             | 目標    | 計測ツール           |
| ---------------- | ------- | -------------------- |
| バックエンド全体 | **80%以上** | PHPUnit --coverage   |
| Controller層     | 90%以上 | PHPUnit --coverage   |
| FormRequest層    | 95%以上 | PHPUnit --coverage   |
| Policy・Middleware| 100%   | PHPUnit --coverage   |
| フロントエンド   | 主要コンポーネント網羅 | Vitest coverage |

---

## 7. テスト実行手順

### バックエンドテスト

```bash
# テスト専用DBを使用（.env.testingを参照）
cd backend
php artisan test

# カバレッジレポート生成（HTML）
php artisan test --coverage-html coverage-report

# 特定クラスのみ実行
php artisan test --filter AuthControllerTest
php artisan test --filter TaskControllerTest
php artisan test --filter Admin\\UserControllerTest
```

### フロントエンドテスト

```bash
cd frontend

# 一回実行
npx vitest run

# ウォッチモード（開発中）
npx vitest

# カバレッジ付き実行
npx vitest run --coverage
```

### テスト環境設定

- バックエンドテストは `RefreshDatabase` トレイトを使用し、各テストで DBをクリーンな状態に保つ
- テスト用DB設定は `backend/.env.testing` に定義（DB名: `task_board_test`）
- フロントエンドテストはAPIモック（`vi.mock`）を使用し、実際のAPIに依存しない

---

## 8. テスト結果ドキュメントフォーマット

テスト実行後の結果は `docs/test-results/YYYY-MM-DD_result.md` に記録する。

```markdown
# テスト実行結果

## 実行日時

YYYY-MM-DD HH:MM

## 実行環境

- PHP: 8.3.x
- Laravel: 12.x
- PHPUnit: x.x.x
- Node.js: x.x.x
- Vitest: x.x.x

## バックエンドテスト結果

| テストクラス               | テスト数 | 成功 | 失敗 | スキップ |
| -------------------------- | -------- | ---- | ---- | -------- |
| AuthControllerTest         | 11       | 11   | 0    | 0        |
| TaskControllerTest         | 31       | 31   | 0    | 0        |
| Admin\UserControllerTest   | 29       | 29   | 0    | 0        |
| **合計**                   | **71**   | **71** | **0** | **0** |

### カバレッジサマリー

| 対象         | ライン   | 関数     | ブランチ |
| ------------ | -------- | -------- | -------- |
| Controllers  | xx%      | xx%      | xx%      |
| FormRequests | xx%      | xx%      | xx%      |
| Models       | xx%      | xx%      | xx%      |
| Policies     | xx%      | xx%      | xx%      |
| **合計**     | **xx%**  | **xx%**  | **xx%**  |

## フロントエンドテスト結果

| テスト対象           | テスト数 | 成功 | 失敗 |
| -------------------- | -------- | ---- | ---- |
| Components           | xx       | xx   | 0    |
| Composables          | xx       | xx   | 0    |
| Stores               | xx       | xx   | 0    |
| **合計**             | **xx**   | **xx** | **0** |

## 失敗テスト詳細

（失敗がある場合のみ記載）

| テストクラス | テストメソッド | エラー内容 | 対応状況 |
| ------------ | -------------- | ---------- | -------- |
| -            | -              | -          | -        |

## 備考

（特記事項があれば記載）
```

---

## 改訂履歴

| 版  | 日付       | 内容         |
| --- | ---------- | ------------ |
| 1.0 | 2026-03-08 | 初版作成     |
