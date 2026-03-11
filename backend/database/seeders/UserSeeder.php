<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => '管理者太郎',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        $user1 = User::create([
            'name' => '一般花子',
            'email' => 'user1@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        User::create([
            'name' => '一般次郎',
            'email' => 'user2@example.com',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        // 一般花子のサンプルタスク
        $user1->tasks()->createMany([
            [
                'title' => 'プロジェクト計画書の作成',
                'description' => '第1四半期のプロジェクト計画を作成する',
                'status' => 'todo',
                'priority' => 'high',
                'due_date' => now()->addDays(7)->format('Y-m-d'),
            ],
            [
                'title' => 'ミーティング資料の準備',
                'description' => '週次ミーティングの資料を準備する',
                'status' => 'in_progress',
                'priority' => 'medium',
                'due_date' => now()->addDays(3)->format('Y-m-d'),
            ],
            [
                'title' => '週次レポートの提出',
                'description' => null,
                'status' => 'done',
                'priority' => 'low',
                'due_date' => now()->subDay()->format('Y-m-d'),
            ],
        ]);
    }
}
