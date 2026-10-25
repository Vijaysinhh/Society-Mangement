# UI/UX Issues - PropertyResidentsUnified vs Other Pages

## Problems Identified

### 1. Layout Structure Inconsistency
**PropertyResidentsUnified** uses sticky header inside max-w-md container:
```
- <div> sticky top-0 (entire sticky div inside max-w-md)
  - max-w-md mx-auto
    - Title + Search + Filters + Stats
```

**Other Pages (DashboardMobile, FinancialsMobile)** use full-width sticky header:
```
- <div> sticky top-0 (full width container)
  - Dedicated header with z-index management
- Main content in separate wrapper with proper spacing
```

**Issue**: Stats dashboard is cramped and squeezed into sticky header alongside title/search

### 2. Stats Card Placement
**PropertyResidentsUnified**:
- Stats cards (4-card grid) placed INSIDE sticky header
- Takes up valuable header space
- Competes for attention with search

**Best Practice** (FinancialsMobile):
- Header is minimal (title + action button)
- Stats cards are BELOW header in scrollable content
- Full breathing room, no cramping

### 3. Container Width Issues
**PropertyResidentsUnified**:
- Everything constrained to `max-w-md` (28rem = 448px)
- Stats cards use `grid grid-cols-2 gap-2` inside tight container
- Property cards feel squeezed

**Other Pages**:
- Full width for header (`className="w-full"`)
- Content area properly spaced
- Better use of mobile screen real estate

### 4. Navigation & Content Flow
**PropertyResidentsUnified**:
1. Sticky header with search + filters + stats
2. Tab navigation below
3. Property cards
= Too many sections competing in limited space

**Better Pattern** (DashboardMobile):
1. Greeting/context section (space-y-6)
2. Metrics grid (space-y-6 between sections)
3. Focused content sections
4. Clear visual hierarchy with spacing

### 5. Scrolling Experience
**PropertyResidentsUnified**:
- Stats locked at top with sticky header
- Can't scroll away from stats
- Users must scroll past stats to see properties
- Disorienting with all elements in one sticky area

**Better Approach**:
- Header is truly sticky (just title/search)
- Stats are immediately below (part of scrollable content)
- Property cards start naturally after stats
- Cleaner scrolling flow

## Recommended Fixes

### Fix 1: Restructure Header
- Make header full-width
- Header contains ONLY: Title + Search bar
- Move filters button to top-right
- Remove stats from header

### Fix 2: Create Distinct Sections
- Header section (sticky)
- Stats dashboard (scrollable, right after header)
- Tab navigation (sticky or below stats)
- Property list (scrollable)

### Fix 3: Proper Spacing
- Use DashboardMobile's `space-y-6` pattern
- Create breathing room between sections
- Stats cards use full container width

### Fix 4: Content Container
- Main content uses `w-full` not `max-w-md`
- Proper max-width for readability
- Consistent with other pages

## Layout Comparison

```
CURRENT (PropertyResidentsUnified) - WRONG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ ┌─────────────────────────────┐ ┃  } Sticky
┃ │ Title                       │ ┃  } Inside
┃ │ [Search...................]  │ ┃  } max-w-md
┃ │ [Filters] [Stats Grid]       │ ┃  } (CRAMPED)
┃ └─────────────────────────────┘ ┃  }
┃ ┌─────────────────────────────┐ ┃
┃ │ [Tabs]                      │ ┃
┃ └─────────────────────────────┘ ┃
┃ ┌─────────────────────────────┐ ┃
┃ │ [Property Cards...]         │ ┃
┃ │ [Scrollable]                │ ┃
┃ └─────────────────────────────┘ ┃
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BETTER (FinancialsMobile Pattern) - RIGHT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃ ┌───────────────────────────────────┐ ┃  } Full-width
┃ │ Title              [Action Btn]   │ ┃  } Sticky
┃ └───────────────────────────────────┘ ┃  } (CLEAN)
┃ ┌───────────────────────────────────┐ ┃
┃ │ [Search.................] [Filter]│ ┃
┃ └───────────────────────────────────┘ ┃
┃                                       ┃
┃ ┌─────────┐  ┌─────────┐            ┃
┃ │Stats 1  │  │Stats 2  │            ┃
┃ └─────────┘  └─────────┘            ┃  } Scrollable
┃ ┌─────────┐  ┌─────────┐            ┃
┃ │Stats 3  │  │Stats 4  │            ┃
┃ └─────────┘  └─────────┘            ┃
┃                                       ┃
┃ [Tabs]                               ┃
┃                                       ┃
┃ [Property Cards...]                  ┃
┃ [Scrollable]                         ┃
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Solution Summary

The Properties page feels "odd one out" because:
1. Stats are in sticky header (should be scrollable content)
2. Everything squeezed into max-w-md inside sticky area
3. Doesn't follow DashboardMobile/FinancialsMobile pattern
4. Poor visual hierarchy and spacing

Fix: Restructure to match established pattern with full-width header and scrollable content sections.
