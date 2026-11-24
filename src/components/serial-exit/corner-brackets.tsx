/** Four brass corner ticks for image frames (decorative). */
export function CornerBrackets() {
  const c = "pointer-events-none absolute z-30 h-3 w-3 border-brass/70";
  return (
    <>
      <span aria-hidden="true" className={`${c} left-3 top-3 border-l border-t`} />
      <span aria-hidden="true" className={`${c} right-3 top-3 border-r border-t`} />
      <span aria-hidden="true" className={`${c} bottom-3 left-3 border-b border-l`} />
      <span aria-hidden="true" className={`${c} bottom-3 right-3 border-b border-r`} />
    </>
  );
}
