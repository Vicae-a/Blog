<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

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
        try {
            $data = $request->validated();
            $data['user_id'] = Auth::id();
        
            // Handle image upload
            if ($request->hasFile('image')) {
                try {
                    $imagePath = $request->file('image')->store('posts', 'public');
                    $data['image_path'] = $imagePath;
                    
                    // Check if storage directory exists and is writable
                    $storagePath = public_path("storage/{$imagePath}");
                    $storageDir = dirname($storagePath);
                    
                    if (!file_exists($storageDir)) {
                        mkdir($storageDir, 0755, true);
                    }
                    
                    // Resize image for optimization
                    $image = Image::make($storagePath)->resize(800, null, function ($constraint) {
                        $constraint->aspectRatio();
                        $constraint->upsize();
                    });
                    $image->save();
                } catch (\Exception $e) {
                    // Log the image processing error but continue
                    Log::error('Image processing failed: ' . $e->getMessage());
                    // Remove the image path from data if processing failed
                    if (isset($data['image_path'])) {
                        Storage::disk('public')->delete($data['image_path']);
                        unset($data['image_path']);
                    }
                }
            }
        
            $post = Post::create($data);
        
            return response()->json([
                'status' => 'success',
                'message' => 'Post created successfully',
                'data' => [
                    'id' => $post->id, 
                    'title' => $post->title,
                    'content' => $post->content,
                    'image_path' => $post->image_path ?? null,
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Post creation failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create post',
                'error' => $e->getMessage()
            ], 500);
        }
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
        try {
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
        } catch (\Exception $e) {
            Log::error('Post update failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Post $post)
    {
        // Authorization check
        if (Auth::id() !== $post->user_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized action'
            ], 403);
        }

        try {
            // Delete the image if it exists
            if ($post->image_path) {
                Storage::disk('public')->delete($post->image_path);
            }
            
            $post->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Post deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Post deletion failed: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete post',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}