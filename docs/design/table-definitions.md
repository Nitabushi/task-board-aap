# テーブル定義書

ER図は [er-diagram.md](er-diagram.md) を参照。

---

## 目次

- [1. users テーブル](#1-users-テーブル)
- [2. tasks テーブル](#2-tasks-テーブル)
- [3. インデックス設計](#3-インデックス設計)
- [4. Laravelマイグレーション設計](#4-laravelマイグレーション設計)

---

## 1. users テーブル

### テーブル概要

| 項目         | 値          |
| ------------ | ----------- |
| テーブル名   | users       |
| 説明         | 認証ユーザー情報。論理削除（SoftDeletes）を使用。 |
| Laravel Model| `App\Models\User` |

### カラム定義

| カラム名   | 型                      | NULL | デフォルト | 制約                   | 説明                                              |
| ---------- | ----------------------- | ---- | ---------- | ---------------------- | ------------------------------------------------- |
| id         | bigint unsigned         | NO   | -          | PK, AUTO_INCREMENT     | ユーザーID                                        |
| name       | varchar(255)            | NO   | -          |                        | ユーザー名                                        |
| email      | varchar(255)            | NO   | -          | UNIQUE                 | メールアドレス                                    |
| password   | varchar(255)            | NO   | -          |                        | bcryptハッシュ化パスワード                        |
| role       | enum('admin', 'user')   | NO   | 'user'     |                        | 役割（admin: 管理者 / user: 一般ユーザー）        |
| deleted_at | timestamp               | YES  | NULL       |                        | 論理削除日時（NULLの場合は有効ユーザー）          |
| created_at | timestamp               | YES  | NULL       |                        | 作成日時（Laravelが自動管理）                     |
| updated_at | timestamp               | YES  | NULL       |                        | 更新日時（Laravelが自動管理）                     |

### 補足

- `deleted_at` が NULL のユーザーのみ有効とみなす（Laravel SoftDeletes）
- 論理削除済みユーザーはログイン不可
- 論理削除済みユーザーのメールアドレスは一意制約の対象から除外しない（再登録不可）
- `password` は bcrypt でハッシュ化して保存

---

## 2. tasks テーブル

### テーブル概要

| 項目          | 値          |
| ------------- | ----------- |
| テーブル名    | tasks       |
| 説明          | タスク情報。ユーザーに紐づく。 |
| Laravel Model | `App\Models\Task` |

### カラム定義

| カラム名    | 型                                    | NULL | デフォルト | 制約                           | 説明                                     |
| ----------- | ------------------------------------- | ---- | ---------- | ------------------------------ | ---------------------------------------- |
| id          | bigint unsigned                       | NO   | -          | PK, AUTO_INCREMENT             | タスクID                                 |
| user_id     | bigint unsigned                       | NO   | -          | FK(users.id), CASCADE DELETE   | 所有ユーザーID                           |
| title       | varchar(255)                          | NO   | -          |                                | タイトル（最大255文字）                  |
| description | text                                  | YES  | NULL       |                                | 説明文（最大1000文字、アプリ側で制限）   |
| status      | enum('todo','in_progress','done')     | NO   | 'todo'     |                                | ステータス                               |
| priority    | enum('high','medium','low')           | NO   | 'medium'   |                                | 優先度                                   |
| due_date    | date                                  | YES  | NULL       |                                | 期限日                                   |
| created_at  | timestamp                             | YES  | NULL       |                                | 作成日時（Laravelが自動管理）            |
| updated_at  | timestamp                             | YES  | NULL       |                                | 更新日時（Laravelが自動管理）            |

### 補足

- `user_id` は `users.id` への外部キー。ユーザーが物理削除された場合、関連タスクはカスケード物理削除される。
- users テーブルは SoftDeletes を使用するため、論理削除ではカスケードは発火しない。
  ユーザー論理削除時は `Admin\UserController::destroy` 内で `$user->tasks()->delete()` を明示的に呼ぶ。
- `status` の値: `todo`（TODO）/ `in_progress`（進行中）/ `done`（完了）
- `priority` の値: `high`（高）/ `medium`（中）/ `low`（低）

---

## 3. インデックス設計

| テーブル | インデックス名          | カラム  | 種別         | 目的                                     |
| -------- | ----------------------- | ------- | ------------ | ---------------------------------------- |
| users    | PRIMARY                 | id      | PRIMARY KEY  | -                                        |
| users    | users_email_unique      | email   | UNIQUE INDEX | メールアドレスの一意性保証・ログイン検索 |
| tasks    | PRIMARY                 | id      | PRIMARY KEY  | -                                        |
| tasks    | tasks_user_id_index     | user_id | INDEX        | 自分のタスク絞り込みクエリの高速化       |

---

## 4. Laravelマイグレーション設計

### マイグレーションファイル構成

```
database/migrations/
├── xxxx_xx_xx_000000_create_users_table.php    # usersテーブル（SoftDeletes対応）
└── xxxx_xx_xx_000001_create_tasks_table.php    # tasksテーブル（外部キー含む）
```

### create_users_table.php

```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('password');
    $table->enum('role', ['admin', 'user'])->default('user');
    $table->softDeletes();   // deleted_at カラムを追加
    $table->timestamps();    // created_at, updated_at
});
```

### create_tasks_table.php

```php
Schema::create('tasks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')
          ->constrained('users')
          ->cascadeOnDelete();  // 物理削除時のカスケード
    $table->string('title');
    $table->text('description')->nullable();
    $table->enum('status', ['todo', 'in_progress', 'done'])->default('todo');
    $table->enum('priority', ['high', 'medium', 'low'])->default('medium');
    $table->date('due_date')->nullable();
    $table->timestamps();
});
```

---

## 改訂履歴

| 版  | 日付       | 内容     |
| --- | ---------- | -------- |
| 1.0 | 2026-03-08 | 初版作成 |
