# CSS File Organization Guide

## Current File: src/styles.css (4,275 lines)

### Proposed Section Structure with Line Numbers

#### SECTION 1: GLOBAL STYLES & VARIABLES (Lines 1-150)
```
Lines 1-150: Imports, :root variables, base HTML/body, typography, global utilities
```

#### SECTION 2: APP LAYOUT & NAVIGATION (Lines 151-280)
```
Lines 151-180: .app-shell, .app-marketing-shell, .app-fullscreen
Lines 181-220: .sidebar-desktop, .sidebar-nav, .nav-item-link
Lines 221-280: .auth-topbar, .auth-nav-*, .avatar-pill, marketing classes
```

#### SECTION 3: LANDING PAGE (Lines 281-842)
```
Lines 281-334:   .landing-stage, backgrounds, brand pill
Lines 335-450:   .landing-hero-*, .landing-brand-*, .landing-title, buttons
Lines 451-545:   .landing-process-*, .landing-preview-*
Lines 546-842:   .landing-market-*, all remaining .landing-* classes
```

#### SECTION 4: AUTH & MARKETING (Lines 843-1170)  
```
Lines 843-990:   .login-page, form styles, input fields
Lines 991-1100:  .register-page, .auth-page-* styles
Lines 1101-1170: Marketing footer, footer-copy, brand blocks
```

#### SECTION 5: DASHBOARD HOME & KPI (Lines 1171-1450)
```
Lines 1171-1250: .dashboard-home-*, .dashboard-kpi-card
Lines 1251-1350: .page-header-*, .page-surface, .page-content-*
Lines 1351-1450: .metric-card, .analytics-metric-card styles
```

#### SECTION 6: PROMPTS PAGE (Lines 1451-1900)
```
Lines 1451-1550: .prompts-page, .prompts-grid layout
Lines 1551-1700: .prompt-card, .prompt-card-modern styles
Lines 1701-1850: .prompts-scrollable-*, .prompts-load-more-*
Lines 1851-1900: .prompt-pre, response styles
```

#### SECTION 7: EXPERIMENTS PAGE (Lines 1901-2100)
```
Lines 1901-2050: .experiments-page layout, .experiment-card-modern
Lines 2051-2100: Experiment-specific styles
```

#### SECTION 8: FAVORITES PAGE (Lines 2101-2300)
```
Lines 2101-2200: .favorites-page, .favorite-card-modern
Lines 2201-2300: Favorite-specific components
```

#### SECTION 9: ANALYTICS DASHBOARD (Lines 2301-2800)
```
Lines 2301-2450: .dashboard-* general styles, menu links
Lines 2451-2600: Chart container styles, chart line animations
Lines 2601-2750: Quality dimension cards, trends, rankings
Lines 2751-2800: Token usage, response time, pass rate cards
```

#### SECTION 10: MODAL & UNIVERSAL COMPONENTS (Lines 2801-3170)
```
Lines 2801-2900: .modal-card, .modal-header, .modal-footer
Lines 2901-3050: .badge-*, .pill-*, .tooltip-*
Lines 3051-3170: Common component utilities
```

#### SECTION 11: RESPONSIVE DESIGN & MEDIA QUERIES (Lines 3171-4130)
```
Lines 3171-3500: Mobile-first responsive adjustments (<768px)
Lines 3501-3800: Tablet responsive adjustments (768px-1199px)
Lines 3801-4130: Desktop optimizations (1200px+)
```

#### SECTION 12: LOADING & ANIMATIONS (Lines 4131-4275)
```
Lines 4131-4200: .loading-container, .loading-spinner
Lines 4201-4260: Spinner animations, loading dots
Lines 4261-4275: Animated text, keyframe definitions
```

---

## Recommended Next Steps

### Phase 1: Add Section Comments (Quick Win)
Add comment headers at each section boundary in styles.css:
```css
/* ===============================================
   SECTION X: [NAME]
   Lines XXX-XXX: Description
   =============================================== */
```

### Phase 2: Extract Individual Modules  (Future)
Create separate files one-by-one:
1. ✅ 00-global.css (already created)
2. ✅ 01-layout.css (already created)
3. 02-landing.css - Extract lines 281-842
4. 03-auth.css - Extract lines 843-1170
5. 04-dashboard-home.css - Extract lines 1171-1450
6. 05-pages-prompts.css - Extract lines 1451-1900
7. 06-pages-experiments.css - Extract lines 1901-2100
8. 07-pages-favorites.css - Extract lines 2101-2300
9. 08-analytics.css - Extract lines 2301-2800
10. 09-components.css - Extract lines 2801-3170
11. 10-responsive.css - Extract lines 3171-4130
12. 11-animations.css - Extract lines 4131-4275

### Phase 3: Create Main Import File
Replace styles.css content with imports from modular files.

---

## File Size Reference

| Section | Est. Lines | Est. KB |
|---------|-----------|--------|
| Global | 150 | 3 |
| Layout | 130 | 4 |
| Landing | 562 | 18 |
| Auth | 328 | 11 |
| Dashboard Home | 280 | 9 |
| Prompts Page | 450 | 14 |
| Experiments | 200 | 6 |
| Favorites | 200 | 6 |
| Analytics | 500 | 16 |
| Components | 370 | 12 |
| Responsive | 960 | 28 |
| Animations | 145 | 4 |
| **TOTAL** | **4,275** | **131** |

---

## Tools to Help

### Using grep to find sections:
```bash
# Find all landing classes with line numbers
grep -n "^\.landing-" src/styles.css

# Count classes by prefix
grep -o "^\.[a-z-]*" src/styles.css | sort | uniq -c | sort -rn

# Extract lines 284-842 (landing section)
sed -n '284,842p' src/styles.css > src/styles/02-landing.css
```

### Using sed to extract and replace:
```bash
# Extract all .prompts-page styles
sed -n '/^\.prompts-page/,/^[\.@]/p' src/styles.css

# Remove extracted section from main file
sed -i '/^\.landing-/,/^@keyframes/d' src/styles.css
```

---

## Migration Checklist

- [ ] Add section comment headers to styles.css
- [ ] Create 02-landing.css from lines 281-842
- [ ] Create 03-auth.css from lines 843-1170
- [ ] Create 04-dashboard-home.css from lines 1171-1450
- [ ] Create 05-pages-prompts.css from lines 1451-1900
- [ ] Create 06-pages-experiments.css from lines 1901-2100
- [ ] Create 07-pages-favorites.css from lines 2101-2300
- [ ] Create 08-analytics.css from lines 2301-2800
- [ ] Create 09-components.css from lines 2801-3170
- [ ] Create 10-responsive.css from lines 3171-4130
- [ ] Create 11-animations.css from lines 4131-4275
- [ ] Create main imports file in src/main.css
- [ ] Update src/main.ts to import from src/main.css
- [ ] Run npm run build to verify
- [ ] Test all pages and components
- [ ] Delete original src/styles.css

---

**TIP**: Focus on Phase 1 (adding comments) first - it provides immediate readability improvements without breaking anything!
