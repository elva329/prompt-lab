# CSS Refactoring Guide - Modular Organization

## Current Issue
- **src/styles.css**: 4,275 lines - Too large for readability and maintenance

## Solution: Modular CSS Architecture

### New Structure
```
src/styles/
├── 00-global.css        (~100 lines)    - Variables, base styles, animations
├── 01-layout.css        (~150 lines)    - Shell, sidebar, layout utilities
├── 02-landing.css       (~1200 lines)   - All .landing-* styles
├── 03-pages.css         (~800 lines)    - Page-specific: prompts, favorites, experiments
├── 04-dashboard.css     (~600 lines)    - Dashboard, analytics, metric cards
├── 05-components.css    (~800 lines)    - Reusable: cards, badges, modals, buttons
├── 06-auth.css          (~200 lines)    - Login, register page styles
└── 07-animations.css    (~200 lines)    - Loading states, spinners, transitions
```

### File Contents

#### **00-global.css**
- CSS variables (colors, spacing, shadows, radii)
- HTML/body base styles
- Typography defaults
- Global utilities (.card, .btn, .backdrop-blur)
- Core animations (@keyframes)

#### **01-layout.css**
- .app-shell, .app-marketing-shell
- .app-fullscreen, .app-main-fullscreen
- .sidebar-desktop, sidebar navigation
- .nav-item-link styles
- .avatar-pill
- Authentication navigation (.auth-topbar, .auth-nav-*)
- Marketing brand styles

#### **02-landing.css** (Largest)
- .landing-stage background
- .landing-hero-section, .landing-content
- Landing form elements
- .landing-matrix-* (evaluation matrix)
- .landing-workflow-* (workflow section)
- .landing-signals-* (quality signals)
- .landing-brand-*, .landing-title, .landing-subtitle
- .landing-process-*, landing-cta-*
- All landing page responsive adjustments

#### **03-pages.css**
- .prompts-page (main + grid + cards)
- .favorites-page styles
- .experiments-page styles
- .page-header-row, .page-content-*
- .prompts-grid, .prompts-scrollable-grid
- .prompts-load-more-panel
- All page-specific layouts

#### **04-dashboard.css**
- .analytics-page styles
- .dashboard-* classes
- .metric-card styles
- .dashboard-kpi-card
- Quality dimension cards
- Response time cards
- Trend chart containers
- Token usage cards

#### **05-components.css**
- .prompt-card, .prompt-card-modern
- .experiment-card-modern
- .favorite-card-modern
- .modal-card, .modal-* elements
- .prompt-badge-* (category, score, muted)
- Tooltip styles
- Badge and pill styles
- Form input styles
- .response-text-scroll

#### **06-auth.css**
- Login page (.login-page)
- Register page styles
- Form labels and inputs
- Auth-specific buttons
- Auth page backgrounds
- Error message styling

#### **07-animations.css**
- Loading container
- Spinner animations
- Animated dots
- Loading text styles
- Pulse animations
- Smooth transitions

### Migration Steps

1. **Cut/Paste**: Extract relevant CSS sections from the current 4,275-line file into appropriate modules
2. **Update src/styles.css**: Replace all content with import statements:
   ```css
   @import "./styles/00-global.css";
   @import "./styles/01-layout.css";
   @import "./styles/02-landing.css";
   @import "./styles/03-pages.css";
   @import "./styles/04-dashboard.css";
   @import "./styles/05-components.css";
   @import "./styles/06-auth.css";
   @import "./styles/07-animations.css";
   ```
3. **Test**: Run `npm run build` to verify no CSS is lost
4. **Check**: Verify all page layouts work correctly

### Benefits

✅ **Readability**: Each file is 100-1200 lines instead of 4,275
✅ **Maintainability**: Easy to locate styles by feature/component
✅ **Scalability**: Simple to add/modify features
✅ **Organization**: Logical grouping by purpose
✅ **Performance**: Browser loads modular CSS efficiently
✅ **Collaboration**: Easier for team members to work on specific components

### Next Steps

Extract sections systematically using grep and create the modular files.
Then verify with a production build.

---

**Created by**: CSS Refactoring Assistant
**Date**: April 8, 2026
