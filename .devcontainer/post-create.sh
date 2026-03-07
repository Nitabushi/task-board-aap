#!/bin/bash
set -e

echo "=== DevContainer post-create setup ==="

# Backend setup
if [ -d "/workspace/backend" ]; then
    echo "--- Setting up Laravel backend ---"
    cd /workspace/backend
    composer install
    if [ ! -f ".env" ]; then
        cp .env.example .env
        php artisan key:generate
    fi
fi

# Frontend setup
if [ -d "/workspace/frontend" ]; then
    echo "--- Setting up Vue.js frontend ---"
    cd /workspace/frontend
    npm install
fi

echo "=== Setup complete ==="
echo ""
echo "To start the app:"
echo "  Backend:  cd backend && php artisan serve --host=0.0.0.0 --port=8000"
echo "  Frontend: cd frontend && npm run dev"
