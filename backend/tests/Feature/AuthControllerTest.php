<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);
    }

    // 1. 正しい認証情報でログイン成功
    public function test_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200);
    }

    // 2. ログインでユーザー情報が返る
    public function test_login_returns_user_data(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['id', 'name', 'email', 'role'])
            ->assertJsonFragment(['email' => 'test@example.com']);
    }

    // 3. 誤ったパスワードでログイン失敗
    public function test_login_with_wrong_password(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
    }

    // 4. 存在しないメールアドレスでログイン失敗
    public function test_login_with_nonexistent_email(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'nobody@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(422);
    }

    // 5. 論理削除済みユーザーはログイン不可
    public function test_login_with_soft_deleted_user(): void
    {
        $this->user->delete();

        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(422);
    }

    // 6. メールアドレスなしでログイン失敗
    public function test_login_with_missing_email(): void
    {
        $response = $this->postJson('/api/login', [
            'password' => 'password',
        ]);

        $response->assertStatus(422);
    }

    // 7. パスワードなしでログイン失敗
    public function test_login_with_missing_password(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
        ]);

        $response->assertStatus(422);
    }

    // 8. 認証済みでログアウト成功
    public function test_logout_when_authenticated(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/logout');

        $response->assertStatus(204);
    }

    // 9. 未認証でログアウト失敗
    public function test_logout_when_unauthenticated(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    // 10. 認証済みでログインユーザー情報取得
    public function test_get_current_user_when_authenticated(): void
    {
        $response = $this->actingAs($this->user)->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJsonStructure(['id', 'name', 'email', 'role'])
            ->assertJsonFragment(['email' => $this->user->email]);
    }

    // 11. 未認証でログインユーザー情報取得失敗
    public function test_get_current_user_when_unauthenticated(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }
}
