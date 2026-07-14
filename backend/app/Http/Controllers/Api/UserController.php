<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Hash;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(): JsonResponse
    {
        $authUser = auth()->user();

        $users = User::where('agency_id', $authUser->agency_id)
            ->when(
                $authUser->isAdmin(),
                fn($q) =>
                $q->where('role', 'employee')
            )
            ->when(
                $authUser->isOwner(),
                fn($q) =>
                $q->whereIn('role', ['admin', 'employee'])
            )
            ->select('id', 'name', 'email', 'role', 'is_active', 'created_at')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
        ;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request): JsonResponse
    {
        $authUser = auth()->user();

        // ============================================================
        // Only owner can create users
        // ============================================================
        if (!$authUser->isOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only the owner can create users.',
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:admin,employee', 
        ]);

        $generatedPassword = \Str::random(10);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($generatedPassword),
            'role' => $validated['role'],
            'is_active' => true,
            'agency_id' => $authUser->agency_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'isActive' => $user->is_active,
                'agencyId' => $user->agency_id,
                'generatedPassword' => $generatedPassword,
            ],
        ], 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $authUser = auth()->user();

        // Check belongs to same agency
        if ($user->agency_id !== $authUser->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'This user does not belong to your agency.',
            ], 403);
        }

        // admin cannot update another admin or owner
        if ($authUser->isAdmin() && !$user->isEmployee()) {
            return response()->json([
                'success' => false,
                'message' => 'Admins can only update employees.',
            ], 403);
        }

        $validated = $request->validate([
            'name'  => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'role'  => [
                'sometimes',
                $authUser->isOwner()
                    ? 'in:admin,employee'
                    : 'in:employee',
            ],
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data'    => [
                'id'       => $user->id,
                'name'     => $user->name,
                'email'    => $user->email,
                'role'     => $user->role,
                'isActive' => $user->is_active,
            ],
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    public function resetPassword(Request $request, User $user): JsonResponse
    {
        // Check user belongs to the authenticated user's agency
        if ($user->agency_id !== auth()->user()->agency_id) {
            return response()->json([
                'success' => false,
                'message' => 'This user does not belong to your agency.',
            ], 403);
        }

        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully.',
        ]);
    }

    public function toggleStatus(User $user): JsonResponse
{
    $authUser = auth()->user();

    // Check belongs to same agency
    if ($user->agency_id !== $authUser->agency_id) {
        return response()->json([
            'success' => false,
            'message' => 'This user does not belong to your agency.',
        ], 403);
    }

    // Only owner can toggle accounts
    if (!$authUser->isOwner()) {
        return response()->json([
            'success' => false,
            'message' => 'Only the owner can activate or suspend user accounts.',
        ], 403);
    }

    // Owner cannot suspend himself
    if ($user->id === $authUser->id) {
        return response()->json([
            'success' => false,
            'message' => 'You cannot suspend your own account.',
        ], 422);
    }

    // Toggle status
    $user->update([
        'is_active' => !$user->is_active,
    ]);

    return response()->json([
        'success' => true,
        'message' => $user->is_active
            ? 'User account activated successfully.'
            : 'User account suspended successfully.',
        'data' => [
            'id'       => $user->id,
            'name'     => $user->name,
            'role'     => $user->role,
            'isActive' => $user->is_active,
        ],
    ]);
}
}
