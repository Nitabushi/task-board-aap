<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTaskStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(['todo', 'in_progress', 'done'])],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'ステータスは必須です。',
            'status.in' => '無効なステータスです。',
        ];
    }
}
