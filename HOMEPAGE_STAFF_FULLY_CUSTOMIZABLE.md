# HomepageStaff Component - Fully Customizable Guide

## 🎯 Overview
The `HomepageStaff` component is now **fully customizable** from Plasmic Studio with complete responsive controls for Mobile, Tablet, and Desktop views.

---

## ✅ What's New

### 1. **Responsive Breakpoint Controls**
Every visual property now has **separate controls for each breakpoint**:
- 📱 **Mobile** (< 768px)
- 📱 **Tablet** (768px - 1024px)
- 💻 **Desktop** (> 1024px)

### 2. **API Path Selection**
- **Dropdown menu** to select which API endpoint to fetch staff data from
- Options include:
  - `/api/supabasestaff` (default)
  - `/api/staff`
  - `/api/appointment`
  - `/api/services`
  - `/api/customer`
- Data automatically refreshes when API path changes

### 3. **Complete Font Size Control**
- **Title**: Separate font sizes for Mobile/Tablet/Desktop
- **See All Link**: Separate font sizes for Mobile/Tablet/Desktop
- **Staff Name**: Single font size control
- **Staff Subtitle**: Single font size control

### 4. **Card Dimension Controls**
- **Card Width**: Separate controls for Mobile/Tablet/Desktop (in pixels)
- **Card Image Height**: Separate controls for Mobile/Tablet/Desktop (in pixels)

### 5. **Carousel Behavior**
- **Cards Per View**: Control how many cards show at once
  - Mobile: 1 card (default)
  - Tablet: 2 cards (default)
  - Desktop: 4 cards (default)

### 6. **Section Padding**
- **Responsive padding** for Mobile/Tablet/Desktop
- Format: `"2rem 1rem"` (vertical horizontal)

---

## 🎨 Plasmic Studio Controls

### API Configuration
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `apiPath` | Dropdown | API endpoint to fetch staff | `/api/supabasestaff` |

### Title Controls
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `title` | Text | Section heading | "Our Professionals" |
| `titleColor` | Color | Title text color | #1a1a1a |
| `titleSizeMobile` | Text | Font size for mobile | 1.5rem |
| `titleSizeTablet` | Text | Font size for tablet | 1.875rem |
| `titleSizeDesktop` | Text | Font size for desktop | 2.25rem |

### See All Link
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `showSeeAll` | Boolean | Show/hide link | true |
| `seeAllHref` | Text | Link destination | /staff |
| `seeAllColor` | Color | Link color | #D97639 |
| `seeAllSizeMobile` | Text | Font size for mobile | 0.875rem |
| `seeAllSizeTablet` | Text | Font size for tablet | 1rem |
| `seeAllSizeDesktop` | Text | Font size for desktop | 1.125rem |

### Card Appearance
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `cardBgColor` | Color | Card background | white |
| `cardHoverColor` | Color | Hover background | #f9fafb |
| `cardWidthMobile` | Number | Card width mobile (px) | 280 |
| `cardWidthTablet` | Number | Card width tablet (px) | 300 |
| `cardWidthDesktop` | Number | Card width desktop (px) | 320 |
| `cardImageHeightMobile` | Number | Image height mobile (px) | 250 |
| `cardImageHeightTablet` | Number | Image height tablet (px) | 280 |
| `cardImageHeightDesktop` | Number | Image height desktop (px) | 300 |
| `nameColor` | Color | Staff name color | #1a1a1a |
| `nameFontSize` | Text | Staff name size | 1.25rem |
| `subtitleColor` | Color | Subtitle color | #6b7280 |
| `subtitleFontSize` | Text | Subtitle size | 0.875rem |

### Section Style
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `bgColor` | Color | Section background | #f9fafb |
| `paddingMobile` | Text | Padding mobile | "2rem 1rem" |
| `paddingTablet` | Text | Padding tablet | "2.5rem 1.5rem" |
| `paddingDesktop` | Text | Padding desktop | "3rem 2rem" |

### Carousel Controls
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `cardsPerViewMobile` | Number | Cards shown mobile | 1 |
| `cardsPerViewTablet` | Number | Cards shown tablet | 2 |
| `cardsPerViewDesktop` | Number | Cards shown desktop | 4 |
| `showArrows` | Boolean | Show nav arrows | true |
| `arrowColor` | Color | Arrow icon color | #D97639 |
| `arrowBgColor` | Color | Arrow background | white |
| `showScrollDots` | Boolean | Show indicator dots | true |

---

## 📱 Responsive Behavior

### Mobile (< 768px)
- Shows 1 card at a time (customizable)
- Navigation arrows hidden
- Scroll indicator dots shown
- Swipe/scroll to navigate
- Smaller font sizes
- Smaller card dimensions

### Tablet (768px - 1024px)
- Shows 2 cards at a time (customizable)
- Navigation arrows visible
- Medium font sizes
- Medium card dimensions

### Desktop (> 1024px)
- Shows 4 cards at a time (customizable)
- Navigation arrows visible
- Larger font sizes
- Larger card dimensions

---

## 💡 Usage Examples

### Example 1: Mobile-First Design
```
Title Size Mobile: 1.25rem
Title Size Tablet: 1.75rem
Title Size Desktop: 2.5rem

Cards Per View Mobile: 1
Cards Per View Tablet: 2
Cards Per View Desktop: 5
```

### Example 2: Large Card Style
```
Card Width Mobile: 320px
Card Width Tablet: 350px
Card Width Desktop: 400px

Card Image Height Mobile: 300px
Card Image Height Tablet: 350px
Card Image Height Desktop: 450px
```

### Example 3: Custom Padding
```
Padding Mobile: "1.5rem 0.75rem"
Padding Tablet: "2rem 1.25rem"
Padding Desktop: "4rem 3rem"
```

---

## 🔧 Technical Details

### Font Size Formats
- Use `rem` units: `1.5rem`, `2rem`
- Use `px` units: `24px`, `32px`
- Use `em` units: `1.5em`, `2em`

### Padding Format
- Format: `"vertical horizontal"`
- Examples: `"2rem 1rem"`, `"3rem 2rem"`, `"40px 20px"`

### Carousel Logic
- Automatically adjusts to screen size
- Cards scroll smoothly
- Indicator dots show current position
- Navigation arrows respect `cardsPerView` setting

---

## 🎯 Key Features

✅ **Zero Breaking Changes** - All existing implementations work as before  
✅ **Live Preview** - Changes update instantly in Plasmic Studio  
✅ **Fully Responsive** - Every property has mobile/tablet/desktop controls  
✅ **API Flexibility** - Easy dropdown to switch data sources  
✅ **Touch Optimized** - Smooth scrolling on mobile devices  
✅ **Performance** - Efficient rendering with React hooks  
✅ **Type Safe** - Full TypeScript support  

---

## 🚀 Next Steps

1. Open your project in Plasmic Studio
2. Add the `HomepageStaff` component to your page
3. Use the right panel to customize all properties
4. Preview on different devices using Plasmic's responsive preview
5. Publish when satisfied

---

## 📝 Notes

- All default values match the previous component behavior
- No changes needed to existing pages - they'll continue working
- Window resize is tracked automatically for responsive behavior
- API fetch happens on mount and when `apiPath` changes

---

**Last Updated**: October 29, 2025  
**Component Version**: 2.0 - Fully Customizable  
**Status**: ✅ Production Ready

