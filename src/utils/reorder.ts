import { onScopeDispose, ref, type Ref } from "vue"

/**
 * Pointer-based drag-to-reorder for a vertical list. Works with mouse and touch
 * (via Pointer Events). The list must render its items in array order, each item
 * element carrying a `data-reorder-item` attribute, inside `container`.
 *
 * Reordering is live: as the pointer crosses a neighbour's midpoint, `reorder`
 * is called to move the dragged item, and the list re-renders in the new order.
 */
export function useDragReorder(opts: {
  container: Ref<HTMLElement | null>
  getIds: () => string[]
  reorder: (from: number, to: number) => void
}) {
  const draggingId = ref<string | null>(null)

  // Insertion index (in current DOM order) for the given pointer Y.
  function indexFromPoint(clientY: number): number {
    const el = opts.container.value
    if (!el) return -1
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-reorder-item]"))
    for (let i = 0; i < items.length; i++) {
      const r = items[i].getBoundingClientRect()
      if (clientY < r.top + r.height / 2) return i
    }
    return items.length
  }

  function onMove(e: PointerEvent): void {
    const id = draggingId.value
    if (id == null) return
    const ids = opts.getIds()
    const from = ids.indexOf(id)
    if (from === -1) return
    let to = indexFromPoint(e.clientY)
    if (to === -1) return
    // The dragged item still occupies its slot, so an insertion point below it
    // shifts down by one once it's removed.
    if (from < to) to--
    if (to !== from) opts.reorder(from, to)
  }

  function stop(): void {
    draggingId.value = null
    window.removeEventListener("pointermove", onMove)
    window.removeEventListener("pointerup", stop)
    window.removeEventListener("pointercancel", stop)
  }

  function startDrag(e: PointerEvent, id: string): void {
    e.preventDefault()
    draggingId.value = id
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", stop)
    window.addEventListener("pointercancel", stop)
  }

  onScopeDispose(stop)

  return { draggingId, startDrag }
}
