# Ramah Digital web design system

The executable source of truth is `styles/rebuild.css`, imported after the compatibility styles. It changes web presentation only and does not alter Expo tokens.

## Direction

Ramah is presented as a calm, contemporary travel company: human, editorial, commercially clear and visually led. White space and photography carry the experience. Founder treatment is a deliberate charcoal/brass moment, not a theme applied to every page.

## Tokens

| Purpose | Value |
|---|---|
| White | `#FFFFFF` |
| Paper | `#F6F6F4` |
| Mist | `#ECECE8` |
| Ink | `#171A18` |
| Muted text | `#505651` |
| Border | `#D9DCD8` |
| Brass | `#A18259` |
| Charcoal | `#202522` |
| Success | `#2F6A4F` |
| Error | `#9B3D35` |

Typography uses the system-first modern-sans stack `DM Sans`, `Avenir Next`, `Avenir`, `Segoe UI`, Arial, sans-serif. This avoids a blocking external font request and keeps the first render fast on constrained networks. Display scale is fluid but controlled; long commercial headings use tighter limits than the image-led Home hero.

The content grid is capped at 1280px with a fluid gutter. Public sections use generous editorial rhythm; authenticated workspaces use the same tokens at a higher density.

## Components

- Global header with audience-first navigation and a distinct Founding Era action.
- Full-width image hero, split hero and editorial intro patterns.
- Audience path rows, feature rails, proof/media compositions and quiet CTA sections.
- Founder allocation and commercial-boundary sections.
- Public directory, Creator profile, Circle page, plan comparison and disabled checkout components.
- Responsive footer with audience, Partner, company and account groups.
- Workspace sidebar/mobile section selector, metrics, lists, forms, status and empty states.
- Founder Portal and Founding Admin surfaces retain their functional components but inherit the new type, surface, border and focus rules.

## Interaction and accessibility

- Primary targets are at least 44px high.
- Keyboard focus uses a visible 3px brass outline.
- Mobile navigation is keyboard operable and uses a full-width constrained panel.
- Reduced-motion preferences collapse transitions and animation durations.
- Status is expressed with text as well as color.
- Content images have meaningful alt text; decorative identity marks use empty alt text.
- Disabled commercial controls explain the unresolved dependency rather than appearing broken.

## Responsive behavior

- 1120px: public primary navigation becomes a menu and large rows simplify.
- 860px: split compositions stack, dashboard sidebar becomes a purpose-built section selector, and two-column editorial regions collapse.
- 560px: actions become full-width, feature rails become single-column and dashboard/forms use one column.
- Validated viewport families: 1440 desktop, 1280 laptop, 768 tablet, Pixel 5 and iPhone 13.

## Media

Only repository-owned project images and current Ramah product captures are shipped. Unlicensed Downloads imagery and private-person images are excluded. See `../docs/website/MEDIA_MANIFEST.md` for the full decision record.
