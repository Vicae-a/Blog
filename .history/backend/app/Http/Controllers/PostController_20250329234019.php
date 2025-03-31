<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    public function index(Request $request)
    {
        $query = Post::query()->with('user');

        // Search by title
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        // Filter by author
        if ($request->has('author')) {
            $query->whereHas('user', function ($q) use ($request) {
                $q->where('id', $request->author);
            });
        }

        $posts = $query->latest()->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => $posts
        ]);
    }

    public function store(StorePostRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = Auth::id();

        // Handle image upload
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts', 'public');
            $data['image_path'] = $imagePath;
            
            // Resize image for optimization
            $image = Image::make(public_path("storage/{$imagePath}"))->resize(800, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
            $image->save();
        }

        $post = Post::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Post created successfully',
            'data' => $post
        ], 201);
    }

    public function show(Post $post)
    {
        $post->load('comments.user');
        
        return response()->json([
            'status' => 'success',
            'data' => $post
        ]);
    }

    public function update(UpdatePostRequest $request, Post $post)
    {
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($post->image_path) {
                Storage::disk('public')->delete($post->image_path);
            }
            
            $imagePath = $request->file('image')->store('posts', 'public');
            $data['image_path'] = $imagePath;
            
            // Resize image for optimization
            $image = Image::make(public_path("storage/{$imagePath}"))->resize(800, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
            $image->save();
        }

        $post->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Post updated successfully',
            'data' => $post
        ]);
    }

    public function destroy(Post $post)
    {
        // Authorization check
        if id() !== $post->user_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized action'
            ], 403);
        }

        $post->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Post deleted successfully'
        ]);
    }
}
