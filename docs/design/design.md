# 設計書

## 関連ドキュメント

| ドキュメント     | ファイル                                          | 内容                            |
| ---------------- | ------------------------------------------------- | ------------------------------- |
| 本書             | `docs/design/design.md`                           | システム構成・画面設計・実装設計 |
| ER図             | [er-diagram.md](er-diagram.md)                    | Mermaid記法によるER図           |
| テーブル定義書   | [table-definitions.md](table-definitions.md)      | テーブル定義・インデックス・マイグレーション |
| API仕様書        | [openapi.yaml](openapi.yaml)                      | OpenAPI 3.0 全エンドポイント仕様 |
| 画面遷移図       | [screen-transitions.md](screen-transitions.md)    | Mermaid記法による画面遷移図     |
| モックアップ     | [mockup/](mockup/)                                | HTMLモックアップ（各画面）      |

---

## 目次

- [1. 概要](#1-概要)
- [2. システム構成](#2-システム構成)
- [3. 画面設計](#3-画面設計)
  - [3.1 S-001: ログイン画面](#31-s-001-ログイン画面)
  - [3.2 S-002: タスクボード画面](#32-s-002-タスクボード画面)
  - [3.3 S-003: タスク作成/編集モーダル](#33-s-003-タスク作成編集モーダル)
  - [3.4 S-004: ユーザー管理画面](#34-s-004-ユーザー管理画面)
  - [3.5 S-005: ユーザー作成/編集モーダル](#35-s-005-ユーザー作成編集モーダル)
- [4. フロントエンド設計](#4-フロントエンド設計)
  - [4.1 ディレクトリ構成](#41-ディレクトリ構成)
  - [4.2 コンポーネント一覧](#42-コンポーネント一覧)
  - [4.3 型定義](#43-型定義)
  - [4.4 ルーティング設計](#44-ルーティング設計)
  - [4.5 状態管理（Pinia）](#45-状態管理pinia)
  - [4.6 API通信層](#46-api通信層)
- [5. バックエンド設計](#5-バックエンド設計)
  - [5.1 ディレクトリ構成](#51-ディレクトリ構成)
  - [5.2 ルーティング設計](#52-ルーティング設計)
  - [5.3 コントローラー設計](#53-コントローラー設計)
  - [5.4 モデル設計](#54-モデル設計)
  - [5.5 FormRequest設計](#55-formrequest設計)
  - [5.6 API Resource設計](#56-api-resource設計)
- [6. 認証・認可設計](#6-認証認可設計)
- [7. エラーハンドリング設計](#7-エラーハンドリング設計)
- [改訂履歴](#改訂履歴)

---

## 1. 概要

本書は Task Board（タスク管理アプリ）の設計を定義する。
要件定義書（`docs/requirements/requirements.md`）に基づき、フロントエンド・バックエンド・データベースの各層の設計を記載する。

---

## 2. システム構成

```
ブラウザ（Chrome）
    │
    │ HTTP（Cookie認証）
    ▼
Vue.js 3 Dev Server（:5173）
    │
    │ Axios / REST API
    ▼
Laravel 12 API Server（:8000）
    │
    │ Eloquent ORM
    ▼
MySQL 8.4（:3306 / DB: task_board）
```

### サービス間通信

| 通信元     | 通信先      | プロトコル | 認証方式                  |
| ---------- | ----------- | ---------- | ------------------------- |
| Vue.js     | Laravel API | HTTP/JSON  | Laravel Sanctum（Cookie） |
| Laravel    | MySQL       | TCP        | DB認証（.env設定）        |

---

## 3. 画面設計

画面一覧・パス・アクセス権の概要は要件定義書「4. 画面一覧」を参照。
HTMLモックアップは [mockup/](mockup/) を参照。
画面遷移図は [screen-transitions.md](screen-transitions.md) を参照。

### 3.1 S-001: ログイン画面

**パス**: `/login`
**アクセス権**: 未認証のみ（認証済みの場合は `/tasks` にリダイレクト）
**モックアップ**: [mockup/login.html](mockup/login.html)

#### レイアウト

```
┌─────────────────────────────────────┐
│                                     │
│         Task Board                  │
│       タスク管理アプリ              │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  メールアドレス               │  │
│  │  [________________________]   │  │
│  │                               │  │
│  │  パスワード                   │  │
│  │  [________________________]   │  │
│  │                               │  │
│  │  [エラーメッセージ表示エリア] │  │
│  │                               │  │
│  │  [      ログイン      ]       │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

#### 仕様

- エラー時: 「メールアドレスまたはパスワードが正しくありません」を表示
- ログイン成功時: `/tasks` へリダイレクト
- 論理削除済みユーザーはログイン不可（同上エラーメッセージ）

---

### 3.2 S-002: タスクボード画面

**パス**: `/tasks`
**アクセス権**: 全認証ユーザー
**モックアップ**: [mockup/task-board.html](mockup/task-board.html)

#### レイアウト

```
┌─────────────────────────────────────────────────────────────┐
│ [Task Board]           [ユーザー管理(admin only)] [ログアウト] │  ← ヘッダー
├─────────────────────────────────────────────────────────────┤
│ 検索: [_________] ステータス:[▼] 優先度:[▼]  [+ タスク追加]  │  ← フィルタバー
├───────────────┬───────────────┬─────────────────────────────┤
│    TODO       │    進行中     │       完了                   │
│ ┌───────────┐ │ ┌───────────┐ │ ┌─────────────────────────┐ │
│ │タスクカード│ │ │タスクカード│ │ │タスクカード             │ │
│ │タイトル   │ │ │タイトル   │ │ │タイトル                 │ │
│ │[高] 2/28  │ │ │[中] 3/01  │ │ │[低] -                   │ │
│ └───────────┘ │ └───────────┘ │ └─────────────────────────┘ │
└───────────────┴───────────────┴─────────────────────────────┘
```

#### タスクカード表示項目

| 項目     | 表示内容                                  |
| -------- | ----------------------------------------- |
| タイトル | タスクのタイトル（全文）                  |
| 優先度   | バッジ形式（高: 赤、中: 黄、低: 緑）     |
| 期限日   | `YYYY/MM/DD` 形式（未設定の場合は非表示） |

#### フィルタ・検索仕様

- 検索はタイトル・説明文のキーワード部分一致（フロントエンド側で実行）
- ステータスフィルタ: 全て / TODO / 進行中 / 完了
- 優先度フィルタ: 全て / 高 / 中 / 低
- フィルタはフロントエンド側で適用（API再取得不要）
- 複数フィルタの同時適用可能

#### ドラッグ&ドロップ仕様

- カードをドラッグしてカラム間を移動可能
- ドロップ時に `PATCH /api/tasks/{id}/status` を呼び出してステータス更新

---

### 3.3 S-003: タスク作成/編集モーダル

**表示条件**: タスク追加ボタン押下（作成）/ タスクカードクリック（編集）
**アクセス権**: 全認証ユーザー
**モックアップ**: [mockup/task-modal.html](mockup/task-modal.html)

#### レイアウト

```
┌─────────────────────────────────────┐
│  タスク作成 / タスク編集         ✕  │
├─────────────────────────────────────┤
│  タイトル *                         │
│  [________________________________] │
│                                     │
│  説明文                             │
│  [________________________________] │
│  [________________________________] │
│                                     │
│  ステータス *        優先度 *        │
│  [TODO        ▼]    [中      ▼]    │
│                                     │
│  期限日                             │
│  [____/____/____]                   │
│                                     │
│  [削除（編集時のみ）] [キャンセル] [保存] │
└─────────────────────────────────────┘
```

#### フォーム仕様

| フィールド | 必須              | デフォルト | バリデーション            |
| ---------- | ----------------- | ---------- | ------------------------- |
| タイトル   | ○                 | -          | 最大255文字               |
| 説明文     | ✕                 | -          | 最大1000文字              |
| ステータス | ○                 | todo       | todo / in_progress / done |
| 優先度     | ○                 | medium     | high / medium / low       |
| 期限日     | ✕                 | -          | 有効な日付形式            |

> **F-007 フォールバック仕様について**: ステータスフィールドのセレクトボックスが、要件定義書 F-007「ドラッグ&ドロップが難しい場合のフォールバック」を兼ねる。タスク編集モーダルを開いてステータスを変更・保存することでD&Dと同等の操作が可能。

---

### 3.4 S-004: ユーザー管理画面

**パス**: `/admin/users`
**アクセス権**: 管理者のみ
**モックアップ**: [mockup/user-management.html](mockup/user-management.html)

#### レイアウト

```
┌──────────────────────────────────────────────────────────────────────┐
│ ユーザー管理                                       [+ ユーザー追加]  │
├──────┬─────────────────┬──────────────────┬──────┬────────┬─────────┤
│  ID  │ 名前            │ メールアドレス   │ 役割 │ 作成日 │ 操作    │
├──────┼─────────────────┼──────────────────┼──────┼────────┼─────────┤
│    1 │ 管理者太郎      │ admin@example.com│admin │2026/03 │ [編集]  │
│    2 │ 一般花子        │ user1@example.com│user  │2026/03 │[編集][削除]│
│    3 │ 一般次郎（削除済）│ user2@...      │user  │2026/03 │ 削除済  │ ← グレーアウト
└──────┴─────────────────┴──────────────────┴──────┴────────┴─────────┘
```

#### 表示仕様

- 論理削除済みユーザーも一覧に表示（行をグレーアウト）
- 論理削除済みユーザーには「編集」「削除」ボタンを非表示
- 自分自身には「削除」ボタンを非表示

---

### 3.5 S-005: ユーザー作成/編集モーダル

**表示条件**: ユーザー追加ボタン押下（作成）/ 編集ボタンクリック（編集）
**アクセス権**: 管理者のみ
**モックアップ**: [mockup/user-modal.html](mockup/user-modal.html)

#### フォーム仕様

| フィールド     | 必須                     | バリデーション                      |
| -------------- | ------------------------ | ----------------------------------- |
| 名前           | ○                        | 最大255文字                         |
| メールアドレス | ○                        | 有効な形式、ユニーク                |
| パスワード     | ○（作成時）/ ✕（編集時） | 最小8文字（空欄の場合は変更しない） |
| 役割           | ○                        | admin / user                        |

---

## 4. フロントエンド設計

### 4.1 ディレクトリ構成

```
frontend/src/
├── api/                  # API通信層
│   ├── auth.ts           # 認証API
│   ├── tasks.ts          # タスクAPI
│   ├── users.ts          # ユーザー管理API
│   └── client.ts         # Axiosインスタンス設定
├── components/           # 再利用可能なUIコンポーネント
│   ├── common/
│   │   ├── AppHeader.vue
│   │   ├── BaseModal.vue
│   │   └── BaseButton.vue
│   ├── tasks/
│   │   ├── TaskBoard.vue
│   │   ├── TaskColumn.vue
│   │   ├── TaskCard.vue
│   │   └── TaskModal.vue
│   └── users/
│       ├── UserTable.vue
│       └── UserModal.vue
├── composables/          # Composable関数
│   ├── useAuth.ts
│   ├── useTasks.ts
│   └── useUsers.ts
├── pages/                # ページコンポーネント
│   ├── LoginPage.vue
│   ├── TaskBoardPage.vue
│   └── UserManagePage.vue
├── router/               # Vue Router設定
│   └── index.ts
├── stores/               # Pinia Store
│   ├── auth.ts
│   ├── tasks.ts
│   └── users.ts
├── types/                # TypeScript型定義
│   ├── auth.ts
│   ├── task.ts
│   └── user.ts
└── App.vue
```

### 4.2 コンポーネント一覧

| コンポーネント | ファイル                          | 役割                                  |
| -------------- | --------------------------------- | ------------------------------------- |
| AppHeader      | `components/common/AppHeader.vue` | 共通ヘッダー（ナビ・ログアウト）      |
| BaseModal      | `components/common/BaseModal.vue` | モーダルの共通ラッパー                |
| BaseButton     | `components/common/BaseButton.vue`| 共通ボタン                            |
| TaskBoard      | `components/tasks/TaskBoard.vue`  | カンバンボード全体（フィルタ含む）    |
| TaskColumn     | `components/tasks/TaskColumn.vue` | ステータスカラム（D&Dドロップゾーン） |
| TaskCard       | `components/tasks/TaskCard.vue`   | タスクカード（D&Dドラッグ対象）       |
| TaskModal      | `components/tasks/TaskModal.vue`  | タスク作成/編集モーダル               |
| UserTable      | `components/users/UserTable.vue`  | ユーザー一覧テーブル                  |
| UserModal      | `components/users/UserModal.vue`  | ユーザー作成/編集モーダル             |

### 4.3 型定義

#### `types/task.ts`

```typescript
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'high' | 'medium' | 'low'

export interface Task {
  id: number
  user_id: number
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null  // 'YYYY-MM-DD'
  created_at: string
  updated_at: string
}

export interface TaskFormData {
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
}
```

#### `types/user.ts`

```typescript
export type UserRole = 'admin' | 'user'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface UserFormData {
  name: string
  email: string
  password: string
  role: UserRole
}
```

#### `types/auth.ts`

```typescript
import type { UserRole } from './user'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
}
```

### 4.4 ルーティング設計

| パス           | コンポーネント       | ガード                                                    |
| -------------- | -------------------- | --------------------------------------------------------- |
| `/`            | -                    | `/tasks` へリダイレクト                                   |
| `/login`       | `LoginPage.vue`      | 認証済みの場合は `/tasks` へリダイレクト                  |
| `/tasks`       | `TaskBoardPage.vue`  | 未認証の場合は `/login` へリダイレクト                    |
| `/admin/users` | `UserManagePage.vue` | 未認証 or 非管理者の場合は `/tasks` へリダイレクト         |

#### Navigation Guard の実装方針

```typescript
// router/index.ts
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.checked) {
    await authStore.fetchUser()
  }

  if (to.meta.requiresAuth && !authStore.user) {
    return { path: '/login' }
  }
  if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
    return { path: '/tasks' }
  }
  if (to.path === '/login' && authStore.user) {
    return { path: '/tasks' }
  }
})
```

### 4.5 状態管理（Pinia）

#### `stores/auth.ts`

| State   | 型             | 説明                     |
| ------- | -------------- | ------------------------ |
| user    | AuthUser\|null | ログイン中のユーザー情報 |
| checked | boolean        | 認証状態確認済みフラグ   |

| Action      | 説明                             |
| ----------- | -------------------------------- |
| fetchUser() | `GET /api/user` で認証状態を確認 |
| login()     | `POST /api/login`                |
| logout()    | `POST /api/logout`               |

#### `stores/tasks.ts`

| State   | 型      | 説明               |
| ------- | ------- | ------------------ |
| tasks   | Task[]  | タスク一覧（全件） |
| loading | boolean | ローディング状態   |

| Action         | 説明                           |
| -------------- | ------------------------------ |
| fetchTasks()   | `GET /api/tasks`               |
| createTask()   | `POST /api/tasks`              |
| updateTask()   | `PUT /api/tasks/{id}`          |
| updateStatus() | `PATCH /api/tasks/{id}/status` |
| deleteTask()   | `DELETE /api/tasks/{id}`       |

#### `stores/users.ts`（管理者のみ使用）

| State   | 型      | 説明             |
| ------- | ------- | ---------------- |
| users   | User[]  | ユーザー一覧     |
| loading | boolean | ローディング状態 |

| Action        | 説明                           |
| ------------- | ------------------------------ |
| fetchUsers()  | `GET /api/admin/users`         |
| createUser()  | `POST /api/admin/users`        |
| updateUser()  | `PUT /api/admin/users/{id}`    |
| deleteUser()  | `DELETE /api/admin/users/{id}` |

### 4.6 API通信層

#### `api/client.ts`

```typescript
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // http://localhost:8000
  withCredentials: true,  // Cookie送信のために必須
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})
```

- CSRF保護のため、ログイン前に `GET /sanctum/csrf-cookie` を呼び出す
- 401レスポンス時はログイン画面へリダイレクト（インターセプターで処理）

---

## 5. バックエンド設計

### 5.1 ディレクトリ構成

```
backend/app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php
│   │   ├── TaskController.php
│   │   └── Admin/
│   │       └── UserController.php
│   ├── Requests/
│   │   ├── LoginRequest.php
│   │   ├── StoreTaskRequest.php
│   │   ├── UpdateTaskRequest.php
│   │   ├── UpdateTaskStatusRequest.php
│   │   └── Admin/
│   │       ├── StoreUserRequest.php
│   │       └── UpdateUserRequest.php
│   ├── Resources/
│   │   ├── TaskResource.php
│   │   └── UserResource.php
│   └── Middleware/
│       └── AdminMiddleware.php
├── Models/
│   ├── Task.php
│   └── User.php
└── Policies/
    └── TaskPolicy.php
```

### 5.2 ルーティング設計

```php
// routes/api.php

// 認証不要
Route::post('/login', [AuthController::class, 'login']);

// 認証必須
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // タスク
    Route::apiResource('tasks', TaskController::class)->except(['show']);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);

    // ユーザー管理（管理者のみ）
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::apiResource('users', Admin\UserController::class)->except(['show']);
    });
});
```

### 5.3 コントローラー設計

#### AuthController

| メソッド | HTTP   | パス        | 処理                                          |
| -------- | ------ | ----------- | --------------------------------------------- |
| login    | POST   | /api/login  | Sanctumで認証、成功時にユーザー情報を返す     |
| logout   | POST   | /api/logout | セッション・トークンを破棄                    |
| user     | GET    | /api/user   | ログイン中のユーザー情報を返す（UserResource）|

#### TaskController

| メソッド     | HTTP   | パス                     | 処理                                        |
| ------------ | ------ | ------------------------ | ------------------------------------------- |
| index        | GET    | /api/tasks               | 自分のタスク一覧（TaskResource::collection）|
| store        | POST   | /api/tasks               | タスク作成（201返却）                       |
| update       | PUT    | /api/tasks/{task}        | タスク更新（Policy: 自分のタスクのみ）      |
| updateStatus | PATCH  | /api/tasks/{task}/status | ステータスのみ更新                          |
| destroy      | DELETE | /api/tasks/{task}        | タスク削除（Policy: 自分のタスクのみ）      |

#### Admin\UserController

| メソッド | HTTP   | パス                    | 処理                               |
| -------- | ------ | ----------------------- | ---------------------------------- |
| index    | GET    | /api/admin/users        | 全ユーザー一覧（論理削除済み含む） |
| store    | POST   | /api/admin/users        | ユーザー作成                       |
| update   | PUT    | /api/admin/users/{user} | ユーザー編集（論理削除済みは不可） |
| destroy  | DELETE | /api/admin/users/{user} | 論理削除（自分自身は不可）         |

### 5.4 モデル設計

#### User モデル

```php
class User extends Authenticatable
{
    use HasApiTokens, SoftDeletes;

    protected $fillable = ['name', 'email', 'password', 'role'];
    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'deleted_at' => 'datetime',
        // role は PHP の string として扱う（BackedEnum は使用しない）
        // バリデーションは FormRequest（in:admin,user）で保証する
    ];

    public function tasks(): HasMany { ... }
}
```

#### Task モデル

```php
class Task extends Model
{
    protected $fillable = ['user_id', 'title', 'description', 'status', 'priority', 'due_date'];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function user(): BelongsTo { ... }
}
```

### 5.5 FormRequest設計

#### StoreTaskRequest / UpdateTaskRequest

| フィールド  | ルール                             |
| ----------- | ---------------------------------- |
| title       | required, string, max:255          |
| description | nullable, string, max:1000         |
| status      | required, in:todo,in_progress,done |
| priority    | required, in:high,medium,low       |
| due_date    | nullable, date                     |

#### UpdateTaskStatusRequest

| フィールド | ルール                             |
| ---------- | ---------------------------------- |
| status     | required, in:todo,in_progress,done |

#### StoreUserRequest

| フィールド | ルール                              |
| ---------- | ----------------------------------- |
| name       | required, string, max:255           |
| email      | required, email, unique:users,email |
| password   | required, string, min:8             |
| role       | required, in:admin,user             |

#### UpdateUserRequest

| フィールド | ルール                                   |
| ---------- | ---------------------------------------- |
| name       | required, string, max:255                |
| email      | required, email, unique:users,email,{id} |
| password   | nullable, string, min:8                  |
| role       | required, in:admin,user                  |

### 5.6 API Resource設計

#### TaskResource レスポンス例

```json
{
  "id": 1,
  "user_id": 2,
  "title": "タスクタイトル",
  "description": "説明文",
  "status": "todo",
  "priority": "high",
  "due_date": "2026-03-14",
  "created_at": "2026-03-07T00:00:00.000000Z",
  "updated_at": "2026-03-07T00:00:00.000000Z"
}
```

#### UserResource レスポンス例

```json
{
  "id": 1,
  "name": "管理者太郎",
  "email": "admin@example.com",
  "role": "admin",
  "deleted_at": null,
  "created_at": "2026-03-07T00:00:00.000000Z",
  "updated_at": "2026-03-07T00:00:00.000000Z"
}
```

---

## 6. 認証・認可設計

### 認証フロー

```
1. フロント → GET /sanctum/csrf-cookie（CSRFトークン取得）
2. フロント → POST /api/login（メール・パスワード送信）
3. Laravel → 認証成功時、Sessionに認証情報を保存
4. フロント → 以降のリクエストにCookieが自動付与される
5. フロント → GET /api/user（認証状態確認）
```

### 認可ルール

| リソース     | 操作       | 許可条件                                     |
| ------------ | ---------- | -------------------------------------------- |
| Task         | 一覧取得   | 認証済みユーザー（自分のタスクのみ）         |
| Task         | 作成       | 認証済みユーザー                             |
| Task         | 更新・削除 | 認証済みユーザー かつ タスクの所有者         |
| Admin/User   | 全操作     | 認証済みユーザー かつ role = 'admin'         |
| ログイン禁止 | -          | deleted_at が NULL でないユーザー            |

### AdminMiddleware

```php
public function handle(Request $request, Closure $next)
{
    if ($request->user()?->role !== 'admin') {
        return response()->json(['message' => 'アクセス権限がありません。'], 403);
    }
    return $next($request);
}
```

### TaskPolicy

```php
public function update(User $user, Task $task): bool
{
    return $user->id === $task->user_id;
}

public function delete(User $user, Task $task): bool
{
    return $user->id === $task->user_id;
}
```

---

## 7. エラーハンドリング設計

### HTTPステータスコード一覧

| ステータス | 状況                 | 説明                             |
| ---------- | -------------------- | -------------------------------- |
| 200        | OK                   | 取得・更新成功                   |
| 201        | Created              | 作成成功                         |
| 204        | No Content           | 削除成功                         |
| 401        | Unauthorized         | 未認証                           |
| 403        | Forbidden            | 認可エラー                       |
| 404        | Not Found            | リソースが存在しない             |
| 422        | Unprocessable Entity | バリデーションエラー             |
| 500        | Internal Server Error| サーバーエラー                   |

### エラーレスポンス共通フォーマット

```json
{
  "message": "エラーメッセージ",
  "errors": {
    "field_name": ["バリデーションエラー詳細"]
  }
}
```

> `errors` フィールドはバリデーションエラー（422）時のみ付与される。

### バックエンド エラーレスポンス例

| ステータス | レスポンス例                                                |
| ---------- | ----------------------------------------------------------- |
| 401        | `{"message": "Unauthenticated."}`                           |
| 403        | `{"message": "アクセス権限がありません。"}`                 |
| 404        | `{"message": "リソースが見つかりません。"}`                 |
| 422        | `{"message": "入力内容を確認してください。", "errors": {}}` |
| 500        | `{"message": "サーバーエラーが発生しました。"}`             |

### フロントエンド エラー処理方針

| ステータス | 処理内容                                    |
| ---------- | ------------------------------------------- |
| 401        | ログイン画面へリダイレクト（Axiosインターセプター） |
| 403        | アクセス拒否メッセージを表示                |
| 422        | フォーム内にフィールドごとのエラーを表示    |
| その他     | トースト通知でユーザーにエラーを伝える      |

---

## 改訂履歴

| 版  | 日付       | 内容                                         |
| --- | ---------- | -------------------------------------------- |
| 1.0 | 2026-03-08 | 初版作成（docs/design.md より移動・再構成）  |
