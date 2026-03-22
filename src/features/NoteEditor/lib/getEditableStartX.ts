export function getEditableStartX(element: HTMLElement): number {
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  const paddingLeft = parseFloat(styles.paddingLeft || "0");

  return rect.left + paddingLeft + 1;
}