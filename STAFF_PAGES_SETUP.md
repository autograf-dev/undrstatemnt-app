# Staff Pages Setup Guide for Plasmic

## Overview

This guide explains how to use the staff components in Plasmic and set up staff profile pages.

## Components Available

### 1. **StaffGrid** Component
- **Purpose**: Displays a grid of all staff members
- **Behavior**: Clicking a staff card navigates to `/staff/[slug]` (e.g., `/staff/daniel`)
- **Use Case**: Use on your main staff listing page (e.g., `/barbers` or `/staff`)

### 2. **StaffProfilePage** Component
- **Purpose**: Displays individual staff profile with bio and services
- **Behavior**: Shows staff info and opens booking drawer when service is clicked
- **Use Case**: Automatically rendered by Next.js route `/staff/[slug]`

## How It Works

### Current Setup (Recommended)

The staff pages are **automatically handled** by Next.js dynamic routing:

1. **StaffGrid** is used in Plasmic pages (e.g., `/barbers`)
2. When a user clicks a staff member, they navigate to `/staff/[slug]`
3. Next.js automatically renders the `/staff/[slug]` route
4. The route uses `StaffProfilePage` component internally

**You don't need to create individual pages in Plasmic for each staff member!**

## Setting Up in Plasmic

### Step 1: Create a Staff Listing Page

1. In Plasmic Studio, create a new page (e.g., `/barbers` or `/staff`)
2. Add the **StaffGrid** component to the page
3. Configure the props:
   - Set `apiPath` to `/api/supabasestaff`
   - Customize title, colors, layout as needed
   - Set columns for mobile/tablet/desktop

### Step 2: Verify Dynamic Route (Already Done)

The dynamic route `/staff/[slug]` is already set up in:
- `app/staff/[slug]/page.tsx`

This route automatically handles URLs like:
- `/staff/daniel`
- `/staff/aj-samson`
- `/staff/john-doe`

**No action needed** - it works automatically!

### Step 3: Test the Flow

1. Deploy your Plasmic page with `StaffGrid`
2. Click a staff member card
3. You should navigate to `/staff/[staff-name-slug]`
4. The staff profile page should load automatically

## Creating Staff Profile Pages in Plasmic

Yes! You can create staff pages in Plasmic with dynamic paths like `/staff/{name}` or `/staff/[slug]`.

### Method 1: Using StaffProfilePageWrapper (Recommended for Plasmic)

This component automatically extracts the slug from the URL, so you don't need to manually bind it.

1. **In Plasmic Studio:**
   - Click **"Pages"** in the left sidebar
   - Click **"+"** to create a new page
   - Set the **Path** to: `/staff/[slug]`
     - Plasmic uses `[slug]` syntax for dynamic segments
     - Or you can use `/staff/:slug` (both work)

2. **Add the Component:**
   - Drag **StaffProfilePageWrapper** component onto the page
   - No props needed - it automatically reads the slug from the URL!

3. **Design Your Layout:**
   - Add headers, footers, or other elements around the component
   - Customize the page layout as needed

### Method 2: Using StaffProfilePage with Manual Slug Binding

If you want more control or need to bind the slug from Plasmic's page params:

1. **In Plasmic Studio:**
   - Create a page with path: `/staff/[slug]`

2. **Add StaffProfilePage Component:**
   - Drag **StaffProfilePage** component onto the page
   - For the `slug` prop:
     - Use Plasmic's **"Dynamic value"** or **"Variable"**
     - Bind to the page's path parameter: `$ctx.params.slug` or `$state.params.slug`
     - Or use Plasmic's URL parameter binding

### How Plasmic Dynamic Paths Work

- **Path Pattern**: `/staff/[slug]` or `/staff/:slug`
- **URL Examples**: 
  - `/staff/daniel` → `slug = "daniel"`
  - `/staff/aj-samson` → `slug = "aj-samson"`
- **Accessing the Parameter**: Plasmic automatically provides path parameters to your components

### Important Notes

⚠️ **Route Priority**: 
- Your Next.js App Router route at `app/staff/[slug]/page.tsx` will take precedence
- If you create a Plasmic page with the same path, you may need to:
  - Either remove/rename the App Router route, OR
  - Use a different path pattern (e.g., `/staff-profile/[slug]`)

**Recommended Approach:**
- Keep the Next.js route for automatic handling (current setup)
- OR create Plasmic pages if you want to design custom layouts in Plasmic
- Use `StaffProfilePageWrapper` for easiest setup in Plasmic

## Component Props

### StaffGrid Props
- `apiPath`: API endpoint (default: `/api/supabasestaff`)
- `title`: Section title
- `titleColor`, `titleSizeMobile`, `titleSizeTablet`, `titleSizeDesktop`
- `breadcrumb`, `breadcrumbColor`, `showBreadcrumb`
- `cardBgColor`, `cardHoverColor`
- `cardImageHeightMobile`, `cardImageHeightTablet`, `cardImageHeightDesktop`
- `nameColor`, `nameFontSize`
- `columnsMobile`, `columnsTablet`, `columnsDesktop`
- `bgColor`, `paddingMobile`, `paddingTablet`, `paddingDesktop`
- `maxWidth`

### StaffProfilePage Props
- `slug`: Staff member slug (required) - e.g., "daniel", "aj-samson"
- `apiPath`: API endpoint (default: `/api/supabasestaff`)

## URL Slug Format

The slug is automatically generated from the staff member's name:
- "Daniel" → `/staff/daniel`
- "AJ Samson" → `/staff/aj-samson`
- "John Doe" → `/staff/john-doe`

The slug is lowercase, spaces become hyphens, special characters are removed.

## Troubleshooting

### Staff page shows 404
- Check that the staff member exists in your API
- Verify the slug matches the staff name (lowercase, hyphenated)
- Check browser console for errors

### Staff profile not loading
- Ensure `apiPath` is correct
- Check that `/api/supabasestaff` and `/api/data_barbers` are working
- Verify staff member has a `ghl_id` or `id` that matches in `data_barbers`

### Booking drawer not opening
- Ensure `PageShellWithHeader` is wrapping your pages (provides drawer context)
- Check that `BookingContext` is available (should be in `PageShellWithHeader`)

## Example Plasmic Page Structure

```
/barbers (Plasmic Page)
├── PageShellWithHeader
│   └── StaffGrid
│       ├── title: "Our Professionals"
│       ├── apiPath: "/api/supabasestaff"
│       └── ... other props
```

When user clicks a staff card:
```
/staff/daniel (Next.js Dynamic Route)
└── StaffProfilePage (automatically rendered)
    ├── slug: "daniel"
    └── apiPath: "/api/supabasestaff"
```

