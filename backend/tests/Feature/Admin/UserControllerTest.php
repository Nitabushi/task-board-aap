<?php

namespace Tests\Feature\Admin;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->regularUser = User::factory()->create(['role' => 'user']);
    }

    private function userData(array $overrides = []): array
    {
        return array_merge([
            'name' => 'テストユーザー',
            'email' => 'newuser@example.com',
            'password' => 'password123',
            'role' => 'user',
        ], $overrides);
    }

    // ── GET /api/admin/users ──

    // 1. 管理者は全ユーザーを取得できる
    public function test_admin_can_get_all_users(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/users');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    // 2. 論理削除済みユーザーも含まれる
    public function test_admin_can_get_soft_deleted_users(): void
    {
        $this->regularUser->delete();

        $response = $this->actingAs($this->admin)->getJson('/api/admin/users');

        $response->assertStatus(200);
        $ids = collect($response->json('data'))->pluck('id');
        $this->assertContains($this->regularUser->id, $ids);
    }

    // 3. 一般ユーザーは拒否
    public function test_regular_user_cannot_access_user_list(): void
    {
        $this->actingAs($this->regularUser)
            ->getJson('/api/admin/users')
            ->assertStatus(403);
    }

    // 4. 未認証は拒否
    public function test_get_user_list_when_unauthenticated(): void
    {
        $this->getJson('/api/admin/users')->assertStatus(401);
    }

    // 5. レスポンス構造が正しい
    public function test_user_list_returns_correct_structure(): void
    {
        $response = $this->actingAs($this->admin)->getJson('/api/admin/users');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [['id', 'name', 'email', 'role', 'deleted_at', 'created_at', 'updated_at']],
            ]);
    }

    // ── POST /api/admin/users ──

    // 6. 管理者はユーザーを作成できる
    public function test_admin_can_create_user(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/admin/users', $this->userData());

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'newuser@example.com']);
    }

    // 7. パスワードがハッシュ化される
    public function test_created_user_password_is_hashed(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/admin/users', $this->userData(['password' => 'plainpassword']));

        $user = User::where('email', 'newuser@example.com')->first();
        $this->assertNotEquals('plainpassword', $user->password);
    }

    // 8. 重複メールアドレスは拒否
    public function test_create_user_with_duplicate_email(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/admin/users', $this->userData(['email' => $this->regularUser->email]))
            ->assertStatus(422);
    }

    // 9. 無効なメール形式は拒否
    public function test_create_user_with_invalid_email_format(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/admin/users', $this->userData(['email' => 'not-an-email']))
            ->assertStatus(422);
    }

    // 10. 7文字以下のパスワードは拒否
    public function test_create_user_with_short_password(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/admin/users', $this->userData(['password' => '1234567']))
            ->assertStatus(422);
    }

    // 11. 必須項目なしは拒否
    public function test_create_user_with_missing_required_fields(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/admin/users', [])
            ->assertStatus(422);
    }

    // 12. 不正なroleは拒否
    public function test_create_user_with_invalid_role(): void
    {
        $this->actingAs($this->admin)
            ->postJson('/api/admin/users', $this->userData(['role' => 'superadmin']))
            ->assertStatus(422);
    }

    // 13. 一般ユーザーは拒否
    public function test_regular_user_cannot_create_user(): void
    {
        $this->actingAs($this->regularUser)
            ->postJson('/api/admin/users', $this->userData())
            ->assertStatus(403);
    }

    // 14. 未認証は拒否
    public function test_create_user_when_unauthenticated(): void
    {
        $this->postJson('/api/admin/users', $this->userData())->assertStatus(401);
    }

    // ── PUT /api/admin/users/{id} ──

    // 15. 管理者はユーザーを編集できる
    public function test_admin_can_update_user(): void
    {
        $response = $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->regularUser->id}", [
                'name' => '更新後の名前',
                'email' => $this->regularUser->email,
                'password' => '',
                'role' => 'user',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $this->regularUser->id, 'name' => '更新後の名前']);
    }

    // 16. パスワードが更新される
    public function test_update_user_password_when_provided(): void
    {
        $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->regularUser->id}", [
                'name' => $this->regularUser->name,
                'email' => $this->regularUser->email,
                'password' => 'newpassword',
                'role' => $this->regularUser->role,
            ])
            ->assertStatus(200);

        $user = $this->regularUser->fresh();
        $this->assertTrue(password_verify('newpassword', $user->password));
    }

    // 17. パスワード空欄で変更なし
    public function test_update_user_password_unchanged_when_empty(): void
    {
        $oldPasswordHash = $this->regularUser->password;

        $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->regularUser->id}", [
                'name' => $this->regularUser->name,
                'email' => $this->regularUser->email,
                'password' => '',
                'role' => $this->regularUser->role,
            ])
            ->assertStatus(200);

        $this->assertEquals($oldPasswordHash, $this->regularUser->fresh()->password);
    }

    // 18. 論理削除済みユーザーの編集は404
    public function test_update_soft_deleted_user_returns_not_found(): void
    {
        $this->regularUser->delete();

        $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->regularUser->id}", [
                'name' => '名前',
                'email' => 'new@example.com',
                'password' => '',
                'role' => 'user',
            ])
            ->assertStatus(404);
    }

    // 19. 他ユーザーと重複するメールは拒否
    public function test_update_user_with_duplicate_email(): void
    {
        $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->regularUser->id}", [
                'name' => $this->regularUser->name,
                'email' => $this->admin->email,
                'password' => '',
                'role' => 'user',
            ])
            ->assertStatus(422);
    }

    // 20. 自分自身のメールアドレスへの更新はOK
    public function test_update_user_email_same_as_own_is_allowed(): void
    {
        $this->actingAs($this->admin)
            ->putJson("/api/admin/users/{$this->regularUser->id}", [
                'name' => $this->regularUser->name,
                'email' => $this->regularUser->email,
                'password' => '',
                'role' => 'user',
            ])
            ->assertStatus(200);
    }

    // 21. 一般ユーザーは拒否
    public function test_regular_user_cannot_update_user(): void
    {
        $this->actingAs($this->regularUser)
            ->putJson("/api/admin/users/{$this->admin->id}", [
                'name' => '名前',
                'email' => $this->admin->email,
                'password' => '',
                'role' => 'admin',
            ])
            ->assertStatus(403);
    }

    // 22. 未認証は拒否
    public function test_update_user_when_unauthenticated(): void
    {
        $this->putJson("/api/admin/users/{$this->regularUser->id}", [
            'name' => '名前',
            'email' => $this->regularUser->email,
            'password' => '',
            'role' => 'user',
        ])->assertStatus(401);
    }

    // ── DELETE /api/admin/users/{id} ──

    // 23. 管理者はユーザーを論理削除できる
    public function test_admin_can_soft_delete_user(): void
    {
        $this->actingAs($this->admin)
            ->deleteJson("/api/admin/users/{$this->regularUser->id}")
            ->assertStatus(204);

        $this->assertSoftDeleted('users', ['id' => $this->regularUser->id]);
    }

    // 24. 関連タスクが物理削除される
    public function test_soft_delete_user_cascades_tasks(): void
    {
        $task = Task::factory()->create(['user_id' => $this->regularUser->id]);

        $this->actingAs($this->admin)
            ->deleteJson("/api/admin/users/{$this->regularUser->id}")
            ->assertStatus(204);

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    // 25. 自分自身の削除は拒否
    public function test_admin_cannot_delete_self(): void
    {
        $this->actingAs($this->admin)
            ->deleteJson("/api/admin/users/{$this->admin->id}")
            ->assertStatus(403);
    }

    // 26. 存在しないユーザーは404
    public function test_delete_nonexistent_user(): void
    {
        $this->actingAs($this->admin)
            ->deleteJson('/api/admin/users/9999')
            ->assertStatus(404);
    }

    // 27. 削除済みユーザーはログイン不可
    public function test_soft_deleted_user_cannot_login(): void
    {
        $password = 'password';
        $user = User::factory()->create(['password' => bcrypt($password), 'role' => 'user']);
        $user->delete();

        $this->postJson('/api/login', ['email' => $user->email, 'password' => $password])
            ->assertStatus(422);
    }

    // 28. 一般ユーザーは拒否
    public function test_regular_user_cannot_delete_user(): void
    {
        $this->actingAs($this->regularUser)
            ->deleteJson("/api/admin/users/{$this->admin->id}")
            ->assertStatus(403);
    }

    // 29. 未認証は拒否
    public function test_delete_user_when_unauthenticated(): void
    {
        $this->deleteJson("/api/admin/users/{$this->regularUser->id}")->assertStatus(401);
    }
}
