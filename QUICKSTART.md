# 🎄 Quick Start Guide

## Step-by-Step Setup (5 minutes)

### 1️⃣ Database Setup

**Start PostgreSQL** and create the database:

```bash
# Using psql
psql -U postgres
CREATE DATABASE promise_card;
\q
```

### 2️⃣ Update Environment Variables

Edit `.env` file - **Replace these values**:

```env
# Update your PostgreSQL password
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/promise_card?schema=public"

# Add your Gmail
EMAIL_SERVER_USER="youremail@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password-here"
EMAIL_FROM="Christmas Promise Card <youremail@gmail.com>"
```

**Get Gmail App Password:**

1. Go to: https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to: https://myaccount.google.com/apppasswords
4. Create "Mail" app password
5. Copy the 16-character password to `.env`

### 3️⃣ Run Database Migration

```bash
pnpm db:setup
```

This will:
✅ Generate Prisma Client
✅ Create all database tables
✅ Set up relationships

### 4️⃣ Start the App

```bash
pnpm dev
```

### 5️⃣ Test It Out!

1. Open: http://localhost:3000
2. Enter your email
3. Check email for magic link
4. Click link to sign in
5. Create your Christmas card! 🎁

---

## 🎯 That's It!

Your app is now running. You can:

-   Create cards
-   Add wish list items
-   Share your card link
-   Receive promises

## 📚 Need More Help?

-   **Detailed Setup**: See `SETUP.md`
-   **Full Documentation**: See `PROJECT_SUMMARY.md`
-   **Database Issues**: Make sure PostgreSQL is running
-   **Email Issues**: Check Gmail app password

---

Merry Christmas! 🎅🎄
