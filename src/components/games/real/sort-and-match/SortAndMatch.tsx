import { CircleCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';

import { cx } from '@/utils/classNames';

import { shuffle } from '../shuffle';
import type { EngineProps, SortLevel } from '../types';

import styles from './SortAndMatch.module.css';

interface Drag {
  itemId: string;
  pointerId: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
}

/** Pointer movement below this is a tap, not a drag. */
const DRAG_THRESHOLD_PX = 8;

/**
 * «رتّب وطابق» — drag every object into its place (or tap it, then tap the place: the keyboard /
 * touch alternative). A wrong place sends the object back gently; a right place locks it in with a
 * success mark. The game ends when every object is in place.
 */
export function SortAndMatch({ level, onComplete, random }: EngineProps<SortLevel>) {
  const items = useMemo(() => shuffle(level.items, random), [level, random]);
  const [placed, setPlaced] = useState<Readonly<Record<string, string>>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [bounced, setBounced] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [message, setMessage] = useState('اسحب كل صورة إلى مكانها، أو اضغطها ثم اضغط المكان.');
  const [drag, setDrag] = useState<Drag | null>(null);
  const finished = useRef(false);
  // A real drag ends with a click event too: it must not toggle the selection.
  const justDragged = useRef(false);

  const placedCount = Object.keys(placed).length;

  useEffect(() => {
    if (finished.current || placedCount !== level.items.length) return;
    finished.current = true;
    onComplete([
      {
        label: 'العناصر الصحيحة',
        value: `${placedCount.toString()} من ${level.items.length.toString()}`,
      },
      { label: 'المحاولات الخاطئة', value: mistakes.toString() },
    ]);
  }, [placedCount, mistakes, level.items.length, onComplete]);

  const drop = (itemId: string, zoneId: string) => {
    const item = level.items.find((candidate) => candidate.id === itemId);
    const zone = level.zones.find((candidate) => candidate.id === zoneId);
    if (!item || !zone || placed[itemId]) return;
    setSelected(null);
    if (item.zoneId === zoneId) {
      setPlaced((current) => ({ ...current, [itemId]: zoneId }));
      setMessage(`أحسنت! ${item.visual.label} في ${zone.label}.`);
      return;
    }
    setMistakes((value) => value + 1);
    setBounced(itemId);
    setMessage(`${item.visual.label} ليس هنا، جرّب مكاناً آخر.`);
  };

  const onPointerDown = (itemId: string, event: PointerEvent<HTMLButtonElement>) => {
    if (placed[itemId]) return;
    // Older engines (and jsdom) lack pointer capture; dragging still works without it.
    if (typeof event.currentTarget.setPointerCapture === 'function') {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setDrag({
      itemId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dx: 0,
      dy: 0,
    });
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag?.pointerId !== event.pointerId) return;
    setDrag({ ...drag, dx: event.clientX - drag.startX, dy: event.clientY - drag.startY });
  };

  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag?.pointerId !== event.pointerId) return;
    const moved = Math.hypot(drag.dx, drag.dy) > DRAG_THRESHOLD_PX;
    setDrag(null);
    if (!moved) return; // a tap: the click handler selects
    justDragged.current = true;
    const under =
      typeof document.elementsFromPoint === 'function'
        ? document.elementsFromPoint(event.clientX, event.clientY)
        : [];
    const target = under.find(
      (element) => element instanceof HTMLElement && element.dataset.zoneId,
    );
    const zoneId = target instanceof HTMLElement ? target.dataset.zoneId : undefined;
    if (zoneId) drop(drag.itemId, zoneId);
    else setBounced(drag.itemId);
  };

  const remaining = items.filter((item) => !placed[item.id]);

  return (
    <div className={styles.game}>
      <p className={styles.status} role="status">
        {message}
      </p>
      <div className={styles.zones} data-count={level.zones.length}>
        {level.zones.map((zone) => {
          const inZone = level.items.filter((item) => placed[item.id] === zone.id);
          return (
            <button
              key={zone.id}
              type="button"
              data-zone-id={zone.id}
              className={cx(styles.zone, selected && styles.zoneReady)}
              aria-label={`${zone.label}${selected ? ' — ضع الصورة المختارة هنا' : ''} (${inZone.length.toString()})`}
              onClick={() => {
                if (selected) drop(selected, zone.id);
              }}
            >
              <span className={styles.zoneHead} aria-hidden="true">
                <span className={styles.zoneEmoji}>{zone.emoji}</span>
                {zone.label}
              </span>
              <span className={styles.zoneItems} aria-hidden="true">
                {inZone.map((item) => (
                  <span key={item.id} className={styles.placed}>
                    {item.visual.emoji}
                    <CircleCheck />
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>
      <ul className={styles.tray} aria-label="الصور المتبقية">
        {remaining.map((item) => {
          const isDragging = drag?.itemId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={cx(
                  styles.item,
                  selected === item.id && styles.selected,
                  isDragging && styles.dragging,
                  bounced === item.id && styles.bounce,
                )}
                style={
                  isDragging
                    ? { transform: `translate(${drag.dx.toString()}px, ${drag.dy.toString()}px)` }
                    : undefined
                }
                aria-pressed={selected === item.id}
                aria-label={item.visual.label}
                onPointerDown={(event) => {
                  onPointerDown(item.id, event);
                }}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => {
                  setDrag(null);
                }}
                onAnimationEnd={() => {
                  setBounced(null);
                }}
                onClick={() => {
                  if (justDragged.current) {
                    justDragged.current = false;
                    return;
                  }
                  setSelected((current) => (current === item.id ? null : item.id));
                }}
              >
                <span className={styles.itemEmoji} aria-hidden="true">
                  {item.visual.emoji}
                </span>
                <span className={styles.itemLabel} aria-hidden="true">
                  {item.visual.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
