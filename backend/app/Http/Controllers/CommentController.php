<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use App\Http\Requests\StoreCommentRequest;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, Post $post)
    {
        $comment = $post->comments()->create([
            'user_id' => auth()->id(),
            'content' => $request->content
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Comment added successfully',
            'data' => $comment->load('user')
        ], 201);
    }

    public function destroy(Comment $comment)
    {
        // Authorization check
        if (auth()->id() !== $comment->user_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized action'
            ], 403);
        }

        $comment->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Comment deleted successfully'
        ]);
    }
}