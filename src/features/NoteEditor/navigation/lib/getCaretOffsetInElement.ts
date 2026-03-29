export function getCaretOffsetInElement(element: HTMLElement): number | null {
  const selection = window.getSelection()

  if (!selection || selection.rangeCount === 0) {
    return null
  }

  const range = selection.getRangeAt(0)

  if (!range.collapsed) {
    return null
  }

  if (!element.contains(range.startContainer)) {
    return null
  }

  const preCaretRange = range.cloneRange()
  preCaretRange.selectNodeContents(element)
  preCaretRange.setEnd(range.startContainer, range.startOffset)

  return preCaretRange.toString().length
}