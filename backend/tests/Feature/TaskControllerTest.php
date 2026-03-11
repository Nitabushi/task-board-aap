<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'user']);
        $this->otherUser = User::factory()->create(['role' => 'user']);
    }

    private function taskData(array $overrides = []): array
    {
        return array_merge([
            'title' => 'テストタスク',
            'description' => 'テスト説明文',
            'status' => 'todo',
            'priority' => 'medium',
            'due_date' => null,
        ], $overrides);
    }

    // ── GET /api/tasks ──

    // 1. 自分のタスクのみ返される
    public function test_get_tasks_returns_only_own_tasks(): void
    {
        Task::factory()->create(['user_id' => $this->user->id]);
        Task::factory()->create(['user_id' => $this->otherUser->id]);

        $response = $this->actingAs($this->user)->getJson('/api/tasks');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    // 2. 他ユーザーのタスクが含まれない
    public function test_get_tasks_does_not_include_other_user_tasks(): void
    {
        $otherTask = Task::factory()->create(['user_id' => $this->otherUser->id]);

        $response = $this->actingAs($this->user)->getJson('/api/tasks');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertNotContains($otherTask->id, $ids);
    }

    // 3. レスポンス構造が正しい
    public function test_get_tasks_returns_correct_structure(): void
    {
        Task::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)->getJson('/api/tasks');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'user_id', 'title', 'description', 'status', 'priority', 'due_date', 'created_at', 'updated_at']],
            ]);
    }

    // 4. 未認証で拒否
    public function test_get_tasks_when_unauthenticated(): void
    {
        $this->getJson('/api/tasks')->assertStatus(401);
    }

    // 5. タスク0件でも空配列を返す
    public function test_get_tasks_returns_empty_when_no_tasks(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/tasks');

        $response->assertStatus(200)->assertJson(['data' => []]);
    }

    // ── POST /api/tasks ──

    // 6. タスク作成成功
    public function test_create_task_with_valid_data(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/tasks', $this->taskData());

        $response->assertStatus(201);
        $this->assertDatabaseHas('tasks', ['title' => 'テストタスク', 'user_id' => $this->user->id]);
    }

    // 7. user_idがログインユーザーに設定される
    public function test_create_task_assigns_to_authenticated_user(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/tasks', $this->taskData());

        $response->assertStatus(201);
        $this->assertEquals($this->user->id, $response->json('data.user_id'));
    }

    // 8. タイトルなしで422
    public function test_create_task_without_title(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/tasks', $this->taskData(['title' => '']))
            ->assertStatus(422);
    }

    // 9. タイトル256文字で422
    public function test_create_task_with_title_exceeding_max_length(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/tasks', $this->taskData(['title' => str_repeat('a', 256)]))
            ->assertStatus(422);
    }

    // 10. タイトル255文字でOK
    public function test_create_task_with_title_at_max_length(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/tasks', $this->taskData(['title' => str_repeat('a', 255)]))
            ->assertStatus(201);
    }

    // 11. 不正なstatusで422
    public function test_create_task_with_invalid_status(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/tasks', $this->taskData(['status' => 'invalid']))
            ->assertStatus(422);
    }

    // 12. 不正なpriorityで422
    public function test_create_task_with_invalid_priority(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/tasks', $this->taskData(['priority' => 'invalid']))
            ->assertStatus(422);
    }

    // 13. 説明文1001文字で422
    public function test_create_task_with_description_exceeding_max(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/tasks', $this->taskData(['description' => str_repeat('a', 1001)]))
            ->assertStatus(422);
    }

    // 14. descriptionはnull許容
    public function test_create_task_with_null_description(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/tasks', $this->taskData(['description' => null]))
            ->assertStatus(201);
    }

    // 15. due_dateはnull許容
    public function test_create_task_with_null_due_date(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/tasks', $this->taskData(['due_date' => null]))
            ->assertStatus(201);
    }

    // 16. 不正な日付形式で422
    public function test_create_task_with_invalid_due_date_format(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/tasks', $this->taskData(['due_date' => 'not-a-date']))
            ->assertStatus(422);
    }

    // 17. 未認証で拒否
    public function test_create_task_when_unauthenticated(): void
    {
        $this->postJson('/api/tasks', $this->taskData())->assertStatus(401);
    }

    // ── PUT /api/tasks/{id} ──

    // 18. 自分のタスク更新成功
    public function test_update_own_task_with_valid_data(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/tasks/{$task->id}", $this->taskData(['title' => '更新後タイトル']));

        $response->assertStatus(200);
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'title' => '更新後タイトル']);
    }

    // 19. 他ユーザーのタスク更新は拒否
    public function test_update_other_user_task_is_forbidden(): void
    {
        $task = Task::factory()->create(['user_id' => $this->otherUser->id]);

        $this->actingAs($this->user)
            ->putJson("/api/tasks/{$task->id}", $this->taskData())
            ->assertStatus(403);
    }

    // 20. 存在しないタスクは404
    public function test_update_nonexistent_task(): void
    {
        $this->actingAs($this->user)
            ->putJson('/api/tasks/9999', $this->taskData())
            ->assertStatus(404);
    }

    // 21. バリデーションエラー
    public function test_update_task_validation_errors(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->putJson("/api/tasks/{$task->id}", ['title' => ''])
            ->assertStatus(422);
    }

    // 22. 未認証で拒否
    public function test_update_task_when_unauthenticated(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $this->putJson("/api/tasks/{$task->id}", $this->taskData())->assertStatus(401);
    }

    // ── PATCH /api/tasks/{id}/status ──

    // 23. ステータス更新成功
    public function test_update_status_with_valid_status(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id, 'status' => 'todo']);

        $response = $this->actingAs($this->user)
            ->patchJson("/api/tasks/{$task->id}/status", ['status' => 'in_progress']);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'status' => 'in_progress']);
    }

    // 24. 他ユーザーのタスクは拒否
    public function test_update_status_of_other_user_task_is_forbidden(): void
    {
        $task = Task::factory()->create(['user_id' => $this->otherUser->id]);

        $this->actingAs($this->user)
            ->patchJson("/api/tasks/{$task->id}/status", ['status' => 'done'])
            ->assertStatus(403);
    }

    // 25. 不正なstatusは拒否
    public function test_update_status_with_invalid_status(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->patchJson("/api/tasks/{$task->id}/status", ['status' => 'invalid'])
            ->assertStatus(422);
    }

    // 26. 存在しないタスクは404
    public function test_update_status_of_nonexistent_task(): void
    {
        $this->actingAs($this->user)
            ->patchJson('/api/tasks/9999/status', ['status' => 'done'])
            ->assertStatus(404);
    }

    // 27. 未認証で拒否
    public function test_update_status_when_unauthenticated(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $this->patchJson("/api/tasks/{$task->id}/status", ['status' => 'done'])->assertStatus(401);
    }

    // ── DELETE /api/tasks/{id} ──

    // 28. 自分のタスク削除成功
    public function test_delete_own_task(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $this->actingAs($this->user)
            ->deleteJson("/api/tasks/{$task->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    // 29. 他ユーザーのタスク削除は拒否
    public function test_delete_other_user_task_is_forbidden(): void
    {
        $task = Task::factory()->create(['user_id' => $this->otherUser->id]);

        $this->actingAs($this->user)
            ->deleteJson("/api/tasks/{$task->id}")
            ->assertStatus(403);
    }

    // 30. 存在しないタスクは404
    public function test_delete_nonexistent_task(): void
    {
        $this->actingAs($this->user)
            ->deleteJson('/api/tasks/9999')
            ->assertStatus(404);
    }

    // 31. 未認証で拒否
    public function test_delete_task_when_unauthenticated(): void
    {
        $task = Task::factory()->create(['user_id' => $this->user->id]);

        $this->deleteJson("/api/tasks/{$task->id}")->assertStatus(401);
    }
}
