# ER図

要件定義書「5.3 ER図」および テーブル定義書（[table-definitions.md](table-definitions.md)）と対応する。

---

## ER図（Mermaid記法）

```mermaid
erDiagram
    users ||--o{ tasks : "has many"

    users {
        bigint      id          PK  "AUTO_INCREMENT"
        varchar255  name            "NOT NULL"
        varchar255  email       UK  "NOT NULL, UNIQUE"
        varchar255  password        "NOT NULL (bcrypt)"
        enum        role            "NOT NULL, DEFAULT 'user' (admin|user)"
        timestamp   deleted_at      "NULL = 有効, 値あり = 論理削除済み"
        timestamp   created_at      "NULL"
        timestamp   updated_at      "NULL"
    }

    tasks {
        bigint      id          PK  "AUTO_INCREMENT"
        bigint      user_id     FK  "NOT NULL, CASCADE DELETE"
        varchar255  title           "NOT NULL"
        text        description     "NULL"
        enum        status          "NOT NULL, DEFAULT 'todo' (todo|in_progress|done)"
        enum        priority        "NOT NULL, DEFAULT 'medium' (high|medium|low)"
        date        due_date        "NULL"
        timestamp   created_at      "NULL"
        timestamp   updated_at      "NULL"
    }
```

---

## リレーション説明

| リレーション       | 説明                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| users → tasks      | 1対多。1人のユーザーが複数のタスクを持つ。                                 |
| CASCADE DELETE     | usersレコードが物理削除された場合、紐づくtasksも物理削除される。           |
| SoftDeletes の注意 | usersは論理削除（deleted_at）を使用するため、論理削除ではCASCADEは発火しない。Controller内で明示的にタスクを物理削除する。 |

---

## 改訂履歴

| 版  | 日付       | 内容     |
| --- | ---------- | -------- |
| 1.0 | 2026-03-08 | 初版作成 |
