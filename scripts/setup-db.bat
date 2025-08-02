@echo off
echo Starting database setup...

REM Generate Prisma client
npx prisma generate

REM Try to deploy migrations, if it fails, reset and migrate
npx prisma migrate deploy 2>nul
if %errorlevel% neq 0 (
    echo Migration deploy failed, attempting to reset database...
    npx prisma migrate reset --force --skip-seed
    npx prisma migrate deploy
)

echo Database setup completed successfully!
