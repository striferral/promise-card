# Christmas Promise Card App 🎄

A festive app where users can create and share Christmas wish lists, and friends/family can make promises to fulfill those wishes!

## Features

-   ✨ **Magic Link Authentication** - Simple email-based sign-in
-   🎁 **Create Wish Lists** - Add items you'd like to receive
-   🔗 **Share Cards** - Get a unique link to share with loved ones
-   💝 **Make Promises** - Others can promise to give you items
-   🎅 **Traditional Christmas Theme** - Red and green festive design

## Getting Started

### Prerequisites

-   Node.js 18+
-   PostgreSQL database (local)
-   Gmail account for sending emails

### Installation

1. **Clone and install dependencies:**

```bash
pnpm install
```

2. **Set up environment variables:**

Edit `.env` file with your details:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/promise_card?schema=public"

# Email (Gmail)
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"  # Get this from Google App Passwords
EMAIL_FROM="Christmas Promise Card <your-email@gmail.com>"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Gmail Setup:**

-   Go to Google Account → Security → 2-Step Verification → App Passwords
-   Generate an app password for "Mail"
-   Use that password in `EMAIL_SERVER_PASSWORD`

3. **Set up the database:**

Make sure PostgreSQL is running, then:

```bash
pnpm prisma migrate dev --name init
```

4. **Generate Prisma Client:**

```bash
pnpm prisma generate
```

5. **Run the development server:**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎄

## Usage

### Creating a Card

1. Enter your email on the homepage
2. Check your email for the magic link
3. Click the link to sign in
4. Create a new Christmas card
5. Add items to your wish list

### Making a Promise

1. Receive a card link from a friend
2. Click on an item you want to promise
3. Fill in your details
4. Submit your promise!

## Tech Stack

-   **Next.js 16** - React framework with App Router
-   **PostgreSQL** - Database
-   **Prisma** - ORM
-   **Nodemailer** - Email sending
-   **Tailwind CSS** - Styling
-   **Server Actions** - Server-side mutations

## Project Structure

```
app/
├── actions/          # Server actions
│   ├── auth.ts      # Authentication logic
│   ├── cards.ts     # Card CRUD operations
│   └── promises.ts  # Promise creation
├── components/       # React components
├── c/[code]/        # Public card view
├── card/            # Card management pages
├── auth/verify/     # Magic link verification
└── dashboard/       # User dashboard

lib/
├── db.ts            # Prisma client
└── email.ts         # Email utilities

prisma/
└── schema.prisma    # Database schema
```

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables
4. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
5. Use a hosted PostgreSQL (Vercel Postgres, Neon, Supabase, etc.)

## License

MIT

---

Built with ❤️ for a Merry Christmas! 🎅🎄

# or

pnpm dev

# or

bun dev

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
```
