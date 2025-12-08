# Dynamic OG Image Generator

## Overview

The application now uses **dynamic Open Graph image generation** instead of static image files. Images are generated on-the-fly using Next.js's `@vercel/og` library, eliminating the need to create and maintain static OG image files.

## How It Works

### API Route: `/api/og`

**Location**: `app/api/og/route.tsx`

This Edge Function generates beautiful, Christmas-themed Open Graph images dynamically based on URL parameters.

### URL Parameters

-   `title` - Main heading text (default: "Christmas Promise Card")
-   `description` - Subtitle text (default: "Create and share your Christmas wish list")
-   `type` - Image style variant: `default`, `home`, or `card`

### Example URLs

```
# Default homepage image
/api/og?type=default&title=Christmas Promise Card&description=Create and share your wish list

# Home page variant
/api/og?type=home&title=Share Your Christmas Wishes&description=Create and share your wish list with friends and family

# Individual card image
/api/og?type=card&title=John's Wish List&description=by John Doe
```

## Image Features

### Design Elements

✅ **Christmas Gradient Background**

-   Red → Green → Gold gradient
-   Festive and eye-catching

✅ **Decorative Emojis**

-   Snowflakes ❄️
-   Snowman ⛄
-   Santa 🎅
-   Gifts 🎁
-   Positioned around edges for depth

✅ **Main Content Card**

-   White background with transparency
-   Rounded corners with gold border
-   Drop shadow for depth
-   Centered and responsive

✅ **Dynamic Icon**

-   🎄 for home page
-   🎁 for card pages
-   ✨ for default

✅ **Typography**

-   Large, bold title (64px)
-   Readable description (32px)
-   Brand footer with Christmas trees

✅ **Standard Dimensions**

-   1200x630 pixels
-   Optimized for all social platforms

## Usage in Code

### Default Site Metadata

```typescript
// lib/metadata.ts
const siteConfig = {
	ogImage:
		'/api/og?type=default&title=Christmas Promise Card&description=...',
};
```

### Home Page

```typescript
// lib/metadata.ts
export const homeMetadata: Metadata = {
	openGraph: {
		images: [
			{
				url: '/api/og?type=home&title=Share Your Christmas Wishes&description=...',
				width: 1200,
				height: 630,
			},
		],
	},
};
```

### Dynamic Card Pages

```typescript
// lib/metadata.ts
export function generateCardMetadata(title, description, ownerName) {
	const ogImageUrl = `/api/og?type=card&title=${encodeURIComponent(
		title
	)}&description=${encodeURIComponent(`by ${ownerName}`)}`;

	return {
		openGraph: {
			images: [{ url: ogImageUrl, width: 1200, height: 630 }],
		},
	};
}
```

## Benefits Over Static Images

### ✅ Advantages

1. **No Design Required**

    - No need for Photoshop, Canva, or Figma
    - No manual image creation

2. **Dynamic Content**

    - Each card gets unique, personalized image
    - Automatically includes card title and owner name
    - Always up-to-date

3. **Zero Maintenance**

    - No image file management
    - No storage space needed
    - No outdated images

4. **Perfect Consistency**

    - All images follow same design system
    - Brand colors always correct
    - Consistent spacing and typography

5. **SEO Optimized**

    - Proper dimensions (1200x630)
    - Fast edge rendering
    - Works with all social platforms

6. **Shareable Cards**
    - Each shared card (`/c/[code]`) gets custom preview
    - Shows card title and owner
    - More engaging when shared on social media

## Testing

### View Generated Images

1. **Start dev server**:

    ```bash
    pnpm dev
    ```

2. **Test URLs in browser**:

    ```
    http://localhost:3000/api/og
    http://localhost:3000/api/og?type=home&title=My Title&description=My Description
    http://localhost:3000/api/og?type=card&title=John's Christmas Wishes&description=by John
    ```

3. **View in social media debuggers**:
    - [Facebook Debugger](https://developers.facebook.com/tools/debug/)
    - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
    - [LinkedIn Inspector](https://www.linkedin.com/post-inspector/)

### What You Should See

Beautiful Christmas-themed image with:

-   Red/green/gold gradient background
-   White content card in center
-   Christmas emoji decorations
-   Your custom title and description
-   Brand footer

## Customization

### Change Colors

Edit `app/api/og/route.tsx`:

```typescript
const colors = {
	primary: '#dc2626', // red
	secondary: '#16a34a', // green
	accent: '#eab308', // gold
	background: '#ffffff',
	text: '#1f2937',
};
```

### Change Layout

Modify the JSX in the `ImageResponse`:

```typescript
return new ImageResponse(
	(
		<div
			style={
				{
					/* your custom layout */
				}
			}
		>
			{/* your content */}
		</div>
	),
	{ width: 1200, height: 630 }
);
```

### Add Custom Fonts

```typescript
// Add to GET function
const fontData = await fetch(
	new URL('./path/to/font.ttf', import.meta.url)
).then((res) => res.arrayBuffer());

return new ImageResponse(
	// ... JSX
	{
		width: 1200,
		height: 630,
		fonts: [
			{
				name: 'CustomFont',
				data: fontData,
				style: 'normal',
			},
		],
	}
);
```

## Edge Runtime

The route uses `export const runtime = 'edge'` which means:

✅ **Fast**: Runs on edge network (near users)
✅ **Scalable**: Handles high traffic automatically
✅ **Efficient**: Lower latency than serverless
⚠️ **Note**: Can't use Node.js APIs (fs, etc.)

## Troubleshooting

### Images Not Appearing

1. Check URL encoding:

    ```typescript
    encodeURIComponent(title); // ✅ Correct
    title; // ❌ Wrong (breaks with spaces)
    ```

2. Verify route is accessible:

    ```bash
    curl http://localhost:3000/api/og
    ```

3. Check browser console for errors

### Styling Issues

-   Flexbox works differently in Satori (OG renderer)
-   Use `display: 'flex'` explicitly
-   Avoid complex CSS (gradients as background only)
-   Test with simple layouts first

### Performance

Edge functions have limits:

-   Max execution: 30 seconds
-   Keep images simple
-   Avoid heavy computations

## Social Platform Support

### Supported Platforms

✅ Facebook - Uses Open Graph
✅ Twitter - Uses Twitter Cards
✅ LinkedIn - Uses Open Graph
✅ WhatsApp - Uses Open Graph
✅ Telegram - Uses Open Graph
✅ Discord - Uses Open Graph
✅ Slack - Uses Open Graph

### Image Requirements Met

-   Dimensions: 1200x630 ✅
-   Aspect ratio: 1.91:1 ✅
-   Format: PNG ✅
-   Max size: <8MB ✅ (generated images ~200KB)

## Production Deployment

### Vercel (Recommended)

Edge functions work out-of-the-box:

```bash
vercel deploy
```

### Other Platforms

Ensure edge runtime is supported:

-   Cloudflare Pages ✅
-   Netlify Edge ✅
-   AWS Lambda@Edge ✅

### Environment Variables

No special config needed! URLs work automatically:

-   Dev: `http://localhost:3000/api/og`
-   Prod: `https://yourdomain.com/api/og`

## Examples

### Shared Card Preview

When someone shares: `https://yourdomain.com/c/ABC123`

Social media shows:

-   Image: Dynamic OG image with card title
-   Title: "John's Christmas Wishes - Christmas Wishes by john"
-   Description: Card description or default text

Perfect for viral sharing! 🎄

### Testing Different Types

```bash
# Default/brand image
curl https://yourdomain.com/api/og > default.png

# Home page
curl 'https://yourdomain.com/api/og?type=home&title=Welcome' > home.png

# Card page
curl 'https://yourdomain.com/api/og?type=card&title=My%20Wishes&description=by%20Jane' > card.png
```

## Next Steps

1. ✅ **Dynamic OG images working** - No manual image creation needed!
2. 🎯 **Test sharing** - Share a card on WhatsApp/Facebook
3. 📊 **Monitor** - Check which cards get most shares
4. 🎨 **Customize** - Adjust colors/layout if needed
5. 🚀 **Deploy** - Push to production

---

**Status**: ✅ Fully Implemented
**No Images Needed**: All OG images generated dynamically
**Ready to Share**: Each card has unique social preview
