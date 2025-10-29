# Header Component - Modern Glassy Design

## Overview
This is a modern, professional header component with a glassy transparent design as an alternative to the sidebar layout.

## Components Created

### 1. `MainHeader.tsx`
The main header component with:
- **Glassy transparent background** with blur effect
- **Rounded corners** design
- **Responsive design**:
  - Desktop: Floating header at top with horizontal navigation
  - Mobile: Top bar + Bottom navigation bar with icons
- **Smooth animations** and transitions
- **Customizable colors** and styling

### 2. `PageShellWithHeader.tsx`
The page wrapper component that includes:
- Header integration
- Main content area with proper spacing
- Consistent layout across pages

### 3. `HeaderExample.tsx`
Example implementations showing:
- Light theme (white glassy)
- Dark theme (black glassy)
- How to use with icons

## Usage

### Basic Example

```tsx
import PageShellWithHeader from "@/components/PageShellWithHeader";
import { Home, Users, Scissors } from "lucide-react";

export default function MyPage() {
  return (
    <PageShellWithHeader
      logoSrc="/logo.png"
      title="UNDERSTATEMENT"
      headerItems={[
        {
          label: "Home",
          href: "/",
          icon: <Home className="w-5 h-5" />,
        },
        {
          label: "Barbers",
          href: "/barbers",
          icon: <Users className="w-5 h-5" />,
        },
        {
          label: "Services",
          href: "/services",
          icon: <Scissors className="w-5 h-5" />,
        },
      ]}
      activeHref="/"
      signInLabel="Sign In"
      signInHref="/signin"
      // Glassy white transparent
      headerBgColor="rgba(255, 255, 255, 0.8)"
      headerTextColor="#1a1a1a"
      buttonBgColor="#000000"
      buttonTextColor="#ffffff"
    >
      {/* Your page content */}
      <h1>My Page Content</h1>
    </PageShellWithHeader>
  );
}
```

## Key Features

### 🎨 Glassy Design
- `backdropFilter: blur(12px)` for glassy effect
- Semi-transparent background
- Modern rounded corners
- Subtle shadow and border

### 📱 Mobile Responsive
**Desktop:**
- Floating header at top (fixed position)
- Horizontal navigation menu
- Logo + Title on left
- Navigation in center
- Sign-in button on right

**Mobile:**
- Top bar with logo and hamburger menu
- Bottom navigation bar with icons (like iOS/modern apps)
- Expandable menu dropdown
- Touch-friendly tap targets

### 🎯 Professional Look
- Clean, minimalist design
- Smooth hover effects
- Active state highlighting
- Professional spacing and typography

## Props

### PageShellWithHeader Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logoSrc` | string | '/logo.png' | Logo image URL |
| `logoWidth` | number | 50 | Logo width in pixels |
| `logoHeight` | number | 50 | Logo height in pixels |
| `title` | string | 'UNDERSTATEMENT' | Business name |
| `headerItems` | HeaderNavItem[] | [] | Navigation items |
| `activeHref` | string | - | Current active page URL |
| `signInLabel` | string | 'Sign In' | Sign-in button text |
| `signInHref` | string | '/signin' | Sign-in page URL |
| `headerBgColor` | string | 'rgba(255,255,255,0.8)' | Header background (use rgba for transparency) |
| `headerTextColor` | string | '#1a1a1a' | Text color |
| `headerActiveColor` | string | '#000000' | Active item color |
| `headerHoverColor` | string | 'rgba(0,0,0,0.05)' | Hover background color |
| `buttonBgColor` | string | '#000000' | Sign-in button background |
| `buttonTextColor` | string | '#ffffff' | Sign-in button text |
| `children` | ReactNode | - | Page content |

### HeaderNavItem Interface
```typescript
interface HeaderNavItem {
  label: string;    // Display text
  href: string;     // Link URL
  icon?: ReactNode; // Optional icon (use lucide-react icons)
}
```

## Color Themes

### Light Theme (White Glassy)
```tsx
headerBgColor="rgba(255, 255, 255, 0.8)"
headerTextColor="#1a1a1a"
headerActiveColor="#000000"
headerHoverColor="rgba(0, 0, 0, 0.05)"
buttonBgColor="#000000"
buttonTextColor="#ffffff"
```

### Dark Theme (Black Glassy)
```tsx
headerBgColor="rgba(0, 0, 0, 0.8)"
headerTextColor="#ffffff"
headerActiveColor="#ffffff"
headerHoverColor="rgba(255, 255, 255, 0.1)"
buttonBgColor="#ffffff"
buttonTextColor="#000000"
```

### Colored Glass (Blue Example)
```tsx
headerBgColor="rgba(59, 130, 246, 0.8)"
headerTextColor="#ffffff"
headerActiveColor="#ffffff"
headerHoverColor="rgba(255, 255, 255, 0.1)"
buttonBgColor="#ffffff"
buttonTextColor="#1e40af"
```

## Icons

### In Code (React/TypeScript)
Use `lucide-react` icons for navigation items:

```tsx
import { Home, Users, Scissors, Mail, Settings, Calendar } from "lucide-react";

headerItems={[
  { label: "Home", href: "/", icon: <Home className="w-5 h-5" /> },
  { label: "Barbers", href: "/barbers", icon: <Users className="w-5 h-5" /> },
  { label: "Services", href: "/services", icon: <Scissors className="w-5 h-5" /> },
  { label: "Bookings", href: "/bookings", icon: <Calendar className="w-5 h-5" /> },
  { label: "Support", href: "/support", icon: <Mail className="w-5 h-5" /> },
]}
```

### In Plasmic Studio
When using these components in Plasmic, icons are selected from a dropdown menu:
- Choose from preset icon names: "home", "barbers", "services", "calendar", etc.
- The component automatically converts these strings to the appropriate Lucide icons
- No need to import or write JSX - just select from the dropdown!

## Comparison: Sidebar vs Header

### Sidebar (PageShellShadcn)
- Fixed left sidebar
- Vertical navigation
- Always visible
- Traditional layout
- Better for desktop-heavy apps

### Header (PageShellWithHeader)
- Floating top header
- Horizontal navigation
- Modern glassy design
- Better for mobile-first apps
- More content space
- Trendy professional look

## Migration from Sidebar to Header

Replace:
```tsx
<PageShellShadcn
  sidebarItems={items}
  ...
>
```

With:
```tsx
<PageShellWithHeader
  headerItems={items}
  ...
>
```

## Browser Support
- ✅ Chrome/Edge (full support)
- ✅ Safari (full support)
- ✅ Firefox (full support)
- ⚠️ Older browsers may not show blur effect (graceful degradation)

## Tips
1. Use `rgba()` colors for transparency
2. Adjust blur amount by changing `backdropFilter` value
3. For mobile, limit headerItems to 5 for bottom nav
4. Test on actual mobile devices for tap target sizes
5. Use high contrast colors for accessibility

## Screenshots Reference
- Desktop: Floating glassy header at top
- Mobile: Top bar + Bottom navigation (like modern mobile apps)
- Smooth animations on hover/tap
- Professional and unique design

---

Created as a modern alternative to the sidebar layout. Perfect for clients who want a more unique, professional, and contemporary look! 🚀

