# Database Setup Instructions

## Before running the app, you need to:

### 1. Start PostgreSQL

Make sure PostgreSQL is running on your machine on port 5432.

### 2. Create the database

You can either:

**Option A: Using psql command line:**

```bash
psql -U postgres
CREATE DATABASE promise_card;
\q
```

**Option B: Using pgAdmin:**

-   Open pgAdmin
-   Right-click on Databases
-   Create → Database
-   Name it: `promise_card`

### 3. Update .env file

Make sure your `.env` file has the correct database credentials:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/promise_card?schema=public"
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

### 4. Run Prisma migrations

Once the database is created, run:

```bash
pnpm prisma migrate dev --name init
```

This will:

-   Create all the tables (User, Card, CardItem, Promise, MagicToken)
-   Set up relationships
-   Generate the Prisma Client

### 5. Verify the setup

You can verify the tables were created by running:

```bash
pnpm prisma studio
```

This opens Prisma Studio in your browser where you can view your database.

---

## Gmail Setup for Magic Links

1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Enable "2-Step Verification" if not already enabled
4. After enabling 2FA, go back to Security
5. Click on "App passwords"
6. Create a new app password:
    - App: Mail
    - Device: Your computer
7. Copy the generated password (16 characters)
8. Add it to your `.env` file:

```env
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-16-char-app-password"
EMAIL_FROM="Christmas Promise Card <your-email@gmail.com>"
```

---

## Ready to run!

Once everything is set up:

```bash
pnpm dev
```

Visit http://localhost:3000 🎄
