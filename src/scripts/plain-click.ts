// A click with the main button and no modifier key: the click a script takes
// over from an in-page link. Any other click keeps the browser's own handling,
// such as opening the link in a new tab.
export function isPlainClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}
