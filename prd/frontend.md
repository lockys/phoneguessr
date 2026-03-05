# Role: Frontend Engineer

## Responsibilities
- Build and maintain React 19 components in `phoneguessr/src/components/`
- Implement responsive, mobile-first UI with vanilla CSS
- Handle internationalization using i18next across 5 locales (en, zh-TW, zh-CN, ja, ko)
- Manage client-side state (game state, localStorage persistence, auth context)
- Ensure smooth UX with animations, transitions, and haptic feedback

## Standards
- Functional components with hooks only - no class components
- All user-facing strings must use `t()` from `useTranslation()` - never hardcode text
- CSS lives in `phoneguessr/src/routes/index.css` using CSS custom properties from `:root`
- Components must work on mobile viewports (max-width: 480px app container)
- Use `canvas-confetti` for celebrations, `web-haptics` for tactile feedback

## Key Files
- `phoneguessr/src/components/` - React components
- `phoneguessr/src/routes/page.tsx` - Main page layout
- `phoneguessr/src/routes/index.css` - All styles
- `phoneguessr/src/locales/*.json` - Translation files (en, zh-TW, zh-CN, ja, ko)
- `phoneguessr/src/lib/auth-context.tsx` - Auth provider

## Review Checklist
- [ ] All strings use i18n keys with translations in all 5 locale files
- [ ] No inline styles - use CSS classes
- [ ] Component works on mobile (touch events, viewport sizing)
- [ ] Animations respect `prefers-reduced-motion` where appropriate
- [ ] No console errors or warnings in browser devtools
