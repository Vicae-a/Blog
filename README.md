# Blog

# Installation Guide

## Prerequisites
Ensure you have the following installed on your system:
- PHP 8+
- Composer
- Laravel 10+
- MySQL or PostgreSQL
- Node.js & npm
- Vite (included with React)
- Git

---

## Backend Installation (Laravel API)

1. **Clone the repository**
   ```sh
   git clone https://github.com/Vicae-a/Blog.git
   cd Blog/backend
   ```

2. **Install dependencies**
   ```sh
   composer install
   ```

3. **Set up environment variables**
   ```sh
   cp .env.example .env
   ```
   Edit the `.env` file and configure database settings.

4. **Generate application key**
   ```sh
   php artisan key:generate
   ```

5. **Run database migrations and seeders**
   ```sh
   php artisan migrate --seed
   ```

6. **Run the Laravel development server**
   ```sh
   php artisan serve
   ```

---

## Frontend Installation (React)

1. **Navigate to the frontend directory**
   ```sh
   cd ../frontend
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Start the development server**
   ```sh
   npm run dev
   ```

---

## Running the Application
- Access the backend API at: `http://127.0.0.1:8000/api`
- Open the frontend at: `http://localhost:5173`

Finito! 🚀

