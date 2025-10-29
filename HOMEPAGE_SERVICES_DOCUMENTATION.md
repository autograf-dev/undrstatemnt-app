# HomepageServices Component - Complete Documentation

## 🎯 Overview
The **HomepageServices** component is a powerful, fully customizable services showcase with search, filtering, and category grouping capabilities. It's better than the old version with complete Plasmic Studio integration!

---

## ✨ Key Features

### 🔍 **Search & Filter System**
- ✅ Real-time search functionality
- ✅ Category-based filtering with checkboxes
- ✅ Filter counter badge
- ✅ Clear filters option
- ✅ Responsive modal filter UI

### 📂 **Category Management**
- ✅ Automatic grouping by service category
- ✅ Category titles with "See All" links
- ✅ Separate carousels for each category
- ✅ Option to disable grouping (show all services)

### 🎨 **Full Responsive Control**
- ✅ Mobile/Tablet/Desktop breakpoints for all properties
- ✅ Font sizes for each breakpoint
- ✅ Card dimensions for each breakpoint
- ✅ Section padding for each breakpoint
- ✅ Cards per view for each breakpoint

### 🎴 **Service Cards**
- ✅ Service image with fallback initial
- ✅ Display price (e.g., "FROM $50.00")
- ✅ Service name
- ✅ Duration display (toggleable)
- ✅ Hover effects
- ✅ Clickable with customizable link template

### 🔄 **Carousel Navigation**
- ✅ Left/Right arrow buttons (desktop only)
- ✅ Smooth scrolling
- ✅ Touch/swipe support on mobile
- ✅ Scroll indicator dots (optional)
- ✅ Snap-to-card scrolling

---

## 📊 Data Source

### API Endpoint: `/api/supabaseservices`

**Fetches from**: `Data_Services` table in Supabase

**Fields Mapped**:
```typescript
{
  id: "🔒 Row ID",
  name: "Service/Name",
  displayName: "Service/Display Name",
  duration: "Service/Duration",
  durationDisplay: "Service/Display Duration",
  price: "Service/Default Price",
  displayPrice: "Service/Display Price",
  photo: "Service/Photo",
  category: "Service/Category",
  available: "Service/Available"
}
```

**Filter**: Only services with `Service/Available = "true"` are shown

---

## 🎨 Plasmic Studio Controls (50+ Fields!)

### 1. API Configuration
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `apiPath` | Dropdown | API endpoint to fetch services | `/api/supabaseservices` |

### 2. Title Controls
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `title` | Text | Section heading | "Our Services" |
| `titleColor` | Color | Title text color | #1a1a1a |
| `titleSizeMobile` | Text | Font size for mobile | 1.5rem |
| `titleSizeTablet` | Text | Font size for tablet | 1.875rem |
| `titleSizeDesktop` | Text | Font size for desktop | 2.25rem |

### 3. Search & Filter
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `showSearch` | Boolean | Show search bar | true |
| `searchPlaceholder` | Text | Search input placeholder | "Search" |
| `showFilter` | Boolean | Show filter button | true |
| `filterButtonText` | Text | Filter button label | "Filter" |
| `searchBgColor` | Color | Search/Filter background | #f3f4f6 |
| `searchTextColor` | Color | Search/Filter text | #6b7280 |
| `searchBorderColor` | Color | Search/Filter border | #e5e7eb |

### 4. Category Display
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `groupByCategory` | Boolean | Group services by category | true |
| `showCategoryTitles` | Boolean | Show category headings | true |
| `categoryTitleColor` | Color | Category title color | #1a1a1a |
| `categoryTitleSize` | Text | Category title font size | 1.5rem |
| `showSeeAll` | Boolean | Show "See All" links | true |
| `seeAllColor` | Color | See All link color | #D97639 |
| `seeAllSizeMobile` | Text | See All size - Mobile | 0.875rem |
| `seeAllSizeTablet` | Text | See All size - Tablet | 1rem |
| `seeAllSizeDesktop` | Text | See All size - Desktop | 1.125rem |
| `seeAllHrefTemplate` | Text | Link template (use {category}) | `/services?category={category}` |

### 5. Card Appearance
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `cardBgColor` | Color | Card background | white |
| `cardHoverColor` | Color | Hover background | #f9fafb |
| `cardWidthMobile` | Number | Card width mobile (px) | 280 |
| `cardWidthTablet` | Number | Card width tablet (px) | 300 |
| `cardWidthDesktop` | Number | Card width desktop (px) | 320 |
| `cardImageHeightMobile` | Number | Image height mobile (px) | 200 |
| `cardImageHeightTablet` | Number | Image height tablet (px) | 220 |
| `cardImageHeightDesktop` | Number | Image height desktop (px) | 240 |
| `nameColor` | Color | Service name color | #1a1a1a |
| `nameFontSize` | Text | Service name size | 1rem |
| `priceColor` | Color | Price text color | #D97639 |
| `priceFontSize` | Text | Price text size | 0.875rem |
| `durationColor` | Color | Duration text color | #6b7280 |
| `durationFontSize` | Text | Duration text size | 0.875rem |
| `showDuration` | Boolean | Show duration text | true |

### 6. Section Style
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `bgColor` | Color | Section background | white |
| `paddingMobile` | Text | Padding mobile | "2rem 1rem" |
| `paddingTablet` | Text | Padding tablet | "2.5rem 1.5rem" |
| `paddingDesktop` | Text | Padding desktop | "3rem 2rem" |

### 7. Carousel Controls
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `cardsPerViewMobile` | Number | Cards shown mobile | 1 |
| `cardsPerViewTablet` | Number | Cards shown tablet | 2 |
| `cardsPerViewDesktop` | Number | Cards shown desktop | 4 |
| `showArrows` | Boolean | Show nav arrows | true |
| `arrowColor` | Color | Arrow icon color | #D97639 |
| `arrowBgColor` | Color | Arrow background | white |
| `showScrollDots` | Boolean | Show indicator dots | true |
| `scrollDotsColor` | Color | Scroll dots color | #D97639 |

### 8. Card Click Behavior
| Property | Type | Description | Default |
|----------|------|-------------|---------|
| `cardLinkTemplate` | Text | Link template (use {id}) | `/booking?serviceId={id}` |

---

## 📱 Responsive Behavior

### Mobile (< 768px)
- Shows 1 card at a time (customizable)
- Search bar full width
- Filter button compact
- Navigation arrows hidden
- Swipe/scroll to navigate
- Filter modal full width
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
- Filter modal fixed width
- Larger font sizes
- Larger card dimensions

---

## 🎯 Use Cases

### Example 1: Barber Shop Services
```
Title: "Our Services"
Group By Category: true
Show Category Titles: true
Show Search: true
Show Filter: true
Cards Per View Desktop: 4
Cards Per View Mobile: 1
```

### Example 2: Spa Services (No Categories)
```
Title: "All Spa Services"
Group By Category: false
Show Category Titles: false
Cards Per View Desktop: 5
Cards Per View Mobile: 1.5
```

### Example 3: Salon Services (Large Cards)
```
Card Width Mobile: 320px
Card Width Desktop: 400px
Card Image Height Mobile: 250px
Card Image Height Desktop: 350px
```

### Example 4: Custom Booking Flow
```
Card Link Template: "/book/{id}"
See All Href Template: "/all-services?filter={category}"
```

---

## 🔧 Advanced Customization

### Search Functionality
- Real-time filtering as you type
- Searches in: service name, display name, category
- Case-insensitive matching
- Works alongside category filters

### Filter Modal
- Shows all unique categories from services
- Checkbox for each category
- Multiple categories can be selected
- "Clear all" button to reset
- "Done" button to close modal
- Shows count badge on filter button

### Category Grouping
When `groupByCategory = true`:
- Services are grouped by their category
- Each category gets its own carousel
- "See All" link for each category
- Category title before each group

When `groupByCategory = false`:
- All services shown in one list
- Single "All Services" section
- No category titles

### Link Templates
Use placeholders in links:
- `{id}` - Service ID
- `{category}` - Service category (URL encoded)

Examples:
```
/booking?serviceId={id}
/services/{id}
/book?service={id}&staff=auto
/services?category={category}
```

---

## 🎨 Design Tips

### Professional Look
```
Card BG: white
Card Hover: #f9fafb
Price Color: #D97639 (accent)
Name Color: #1a1a1a (dark)
Arrow Color: #D97639 (accent)
```

### Modern Minimalist
```
Card BG: #f9fafb
Card Hover: white
Price Color: #000000
Name Color: #6b7280
Arrow Color: #000000
```

### Dark Mode
```
BG Color: #1a1a1a
Card BG: #2d2d2d
Card Hover: #3d3d3d
Price Color: #fbbf24
Name Color: #ffffff
Arrow Color: #fbbf24
```

---

## 🚀 What Makes This Better

Compared to the old version:

✅ **50+ Plasmic controls** vs limited customization  
✅ **Full responsive breakpoints** for every property  
✅ **Search & filter system** built-in  
✅ **Category grouping** with separate carousels  
✅ **Smooth carousel navigation** with arrows & dots  
✅ **Mobile-optimized** with touch support  
✅ **Link templates** for flexible routing  
✅ **Type-safe** with full TypeScript  
✅ **Performance optimized** with React hooks  
✅ **Zero breaking changes** - works out of the box  

---

## 📝 Implementation Steps

1. **Open Plasmic Studio**
2. **Add HomepageServices component** to your page
3. **Configure API endpoint** (default: `/api/supabaseservices`)
4. **Customize appearance** using the right panel
5. **Test responsive behavior** using device preview
6. **Adjust card dimensions** for each breakpoint
7. **Set up link templates** for routing
8. **Publish** your changes

---

## 🐛 Troubleshooting

### Services not loading?
- Check API endpoint is correct
- Verify Supabase credentials in `.env.local`
- Check browser console for errors
- Ensure services have `Service/Available = "true"`

### Cards too wide/narrow?
- Adjust `cardWidthMobile/Tablet/Desktop`
- Adjust `cardsPerView` for each breakpoint
- Check section padding settings

### Filter not showing categories?
- Ensure services have `Service/Category` field
- Check `groupByCategory` is enabled
- Verify services are loading correctly

### Search not working?
- Ensure `showSearch` is enabled
- Check services have name/displayName fields
- Clear browser cache

---

## 🎉 Summary

The **HomepageServices** component is production-ready with:
- ✅ Complete API integration
- ✅ Search & filter system
- ✅ Category-based grouping
- ✅ Full responsive controls
- ✅ 50+ Plasmic customization fields
- ✅ Professional carousel navigation
- ✅ Mobile-optimized experience

**Ready to use in Plasmic Studio!** 🚀

---

**Last Updated**: October 29, 2025  
**Component Version**: 1.0 - Initial Release  
**Status**: ✅ Production Ready  
**Build**: ✅ Passed

