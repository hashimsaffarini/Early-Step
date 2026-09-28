# Design System

**Visual source of truth: the existing Early Step Replit application.**

The current tokens in `src/styles/tokens.css` are **neutral placeholders**. Do not design new
branding. Before implementing any major UI screen, Claude must inspect the provided Replit
version and record the real values below, then update `tokens.css`.

## Process

1. Inspect the Replit app (live UI and/or its source/CSS) for the screen being built.
2. Extract values into this document (replace TBD).
3. Update `src/styles/tokens.css` — components only consume tokens.
4. Build reusable primitives in `src/components/ui/` only when a pattern appears in 2+ places.
5. Check RTL, responsiveness, keyboard focus, and contrast.

## Tokens

| Category      | Values                                                                                      | Status                                                 |
| ------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Colors        | primary, secondary, background, surface, text, border, states (success/warning/danger/info) | TBD                                                    |
| Fonts         | Arabic font family, weights, source (self-hosted / Google Fonts)                            | TBD                                                    |
| Font sizes    | scale                                                                                       | TBD                                                    |
| Spacing       | scale                                                                                       | TBD                                                    |
| Border radius | sm / md / lg / pill                                                                         | TBD                                                    |
| Shadows       | elevation levels                                                                            | TBD                                                    |
| Breakpoints   | mobile / tablet / laptop / desktop                                                          | TBD (currently one `64rem` breakpoint in `layout.css`) |

## Components

| Component            | Notes                                         | Status |
| -------------------- | --------------------------------------------- | ------ |
| Buttons              | variants, sizes, states                       | TBD    |
| Cards                |                                               | TBD    |
| Forms / inputs       | labels, errors, RTL alignment                 | TBD    |
| Tables               | responsive behavior on mobile                 | TBD    |
| Navigation / sidebar |                                               | TBD    |
| Dashboards           | per role                                      | TBD    |
| Modals / toasts      |                                               | TBD    |
| Icons                | icon set; RTL mirroring for directional icons | TBD    |

## Child-facing UI

TBD after Replit inspection. Known considerations to verify: large touch targets, minimal
text, clear feedback, audio/visual cues, no distracting navigation, safe exit controls,
`prefers-reduced-motion`.

## Rules

- RTL-first; logical properties only.
- No hardcoded colors/sizes in components — tokens only.
- Accessibility: visible focus, WCAG AA contrast, semantic elements, labeled controls.
