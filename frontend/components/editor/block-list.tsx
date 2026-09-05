"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { BlockCard } from "@/components/editor/block-card";
import type { Block } from "@/types";

export function BlockList({
  blocks,
  onReorder,
  onPatch,
  onRemove,
  onDuplicate,
}: {
  blocks: Block[];
  onReorder: (orderedIds: string[]) => void;
  onPatch: (id: string, patch: Partial<Block>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const sorted = [...blocks].sort((a, b) => a.position - b.position);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sorted.findIndex((b) => b.id === active.id);
    const newIndex = sorted.findIndex((b) => b.id === over.id);
    const next = arrayMove(sorted, oldIndex, newIndex);
    onReorder(next.map((b) => b.id));
  };

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-sm text-muted-foreground">
        No blocks yet. Add your first link or block below.
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sorted.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {sorted.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              onPatch={(patch) => onPatch(block.id, patch)}
              onRemove={() => onRemove(block.id)}
              onDuplicate={() => onDuplicate(block.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
