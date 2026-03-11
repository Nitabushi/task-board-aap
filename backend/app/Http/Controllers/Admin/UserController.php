<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::withTrashed()->orderBy('created_at', 'asc')->get();

        return UserResource::collection($users);
    }

    public function store(StoreUserRequest $request)
    {
        $user = User::create($request->validated());

        return (new UserResource($user))->response()->setStatusCode(201);
    }

    public function update(UpdateUserRequest $request, int $id)
    {
        $user = User::withTrashed()->find($id);

        if (! $user || $user->deleted_at !== null) {
            return response()->json(['message' => 'リソースが見つかりません。'], 404);
        }

        $data = $request->validated();

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->update($data);

        return new UserResource($user->fresh());
    }

    public function destroy(Request $request, int $id)
    {
        $user = User::withTrashed()->find($id);

        if (! $user || $user->deleted_at !== null) {
            return response()->json(['message' => 'リソースが見つかりません。'], 404);
        }

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => '自分自身を削除することはできません。'], 403);
        }

        $user->tasks()->delete();
        $user->delete();

        return response()->noContent();
    }
}
