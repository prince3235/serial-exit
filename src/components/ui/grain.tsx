/**
 * Film grain — a static, low-opacity pre-rendered noise tile (see .se-grain).
 * Replaces the earlier runtime SVG feTurbulence + mix-blend-mode layer, which
 * forced a full-viewport re-blend on every scroll frame.
 */
export function Grain() {
  return <div aria-hidden="true" className="se-grain" />;
}
