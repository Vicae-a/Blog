<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        // Create regular users
        $users = User::factory(5)->create();
        $allUsers = $users->merge([$admin]);

        // Create posts for each user
        $allUsers->each(function ($user) {
            Post::factory(3)->create([
                'user_id' => $user->id,
            ])->each(function ($post) use ($allUsers) {
                // Add 1-5 comments to each post
                $commenters = $allUsers->random(rand(1, 5));
                foreach ($commenters as $commenter) {
                    Comment::factory()->create([
                        'user_id' => $commenter->id,
                        'post_id' => $post->id,
                    ]);
                }
            });
        });
    }
}
