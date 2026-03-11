<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\AuthUserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'メールアドレスまたはパスワードが正しくありません。',
            ], 422);
        }

        $user = Auth::user();

        if ($user->deleted_at !== null) {
            Auth::logout();

            return response()->json([
                'message' => 'メールアドレスまたはパスワードが正しくありません。',
            ], 422);
        }

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return new AuthUserResource($user);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->noContent();
    }

    public function user(Request $request)
    {
        return new AuthUserResource($request->user());
    }
}
