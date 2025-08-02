#!/bin/bash
set -e

echo "Starting database setup..."

# Generate Prisma client
npx prisma generate

# Try to deploy migrations, if it fails, reset and migrate
if ! npx prisma migrate deploy 2>/dev/null; then
    echo "Migration deploy failed, attempting to reset database..."
    npx prisma migrate reset --force --skip-seed
    npx prisma migrate deploy
fi

echo "Database setup completed successfully!"
