<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'status' => ['required', Rule::in(['todo', 'in_progress', 'done'])],
            'priority' => ['required', Rule::in(['high', 'medium', 'low'])],
            'due_date' => ['nullable', 'date'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'タイトルは必須です。',
            'title.max' => 'タイトルは255文字以内で入力してください。',
            'description.max' => '説明文は1000文字以内で入力してください。',
            'status.required' => 'ステータスは必須です。',
            'status.in' => '無効なステータスです。',
            'priority.required' => '優先度は必須です。',
            'priority.in' => '無効な優先度です。',
            'due_date.date' => '有効な日付形式で入力してください。',
        ];
    }
}
