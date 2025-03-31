<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->string('content', 500);
            $table->timestamps();
            $table->softDeletes(); // Implementing soft deletes (bonus feature)
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};