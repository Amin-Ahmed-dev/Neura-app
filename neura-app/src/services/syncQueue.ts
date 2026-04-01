/**
 * Sync Queue — offline-first write buffer.
 * Enqueues local mutations to be replayed against the server when online.
 */
import { database, syncQueueCollection } from "@/db/database";

export type EntityType = "task" | "session" | "flashcard_review";
export type SyncAction = "create" | "update" | "delete";

export interface QueueEntry {
  id: string;
  entityType: EntityType;
  entityLocalId: string;
  action: SyncAction;
  payload: Record<string, unknown>;
  retryCount: number;
  createdAt: Date;
}

/** Add an item to the sync queue. */
export async function enqueue(
  entityType: EntityType,
  entityLocalId: string,
  action: SyncAction,
  payload: Record<string, unknown>
): Promise<void> {
  await database.write(async () => {
    await syncQueueCollection.create((item) => {
      item.entityType = entityType;
      item.entityLocalId = entityLocalId;
      item.action = action;
      item.payload = JSON.stringify(payload);
      item.retryCount = 0;
    });
  });
}

/** Return all pending queue items ordered by creation time (FIFO). */
export async function getQueue(): Promise<QueueEntry[]> {
  const items = await syncQueueCollection.query().fetch();
  return items
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((item) => ({
      id: item.id,
      entityType: item.entityType as EntityType,
      entityLocalId: item.entityLocalId,
      action: item.action as SyncAction,
      payload: (() => {
        try { return JSON.parse(item.payload); } catch { return {}; }
      })(),
      retryCount: item.retryCount,
      createdAt: item.createdAt,
    }));
}

/** Remove a successfully synced item from the queue. */
export async function markSynced(id: string): Promise<void> {
  try {
    const item = await syncQueueCollection.find(id);
    await database.write(async () => {
      await item.destroyPermanently();
    });
  } catch {
    // Already removed — ignore
  }
}

/** Increment retry count for a failed item. */
export async function incrementRetry(id: string): Promise<void> {
  try {
    const item = await syncQueueCollection.find(id);
    await database.write(async () => {
      await item.update((i: any) => {
        i.retryCount = (i.retryCount ?? 0) + 1;
      });
    });
  } catch {}
}

/** Return the number of items currently in the queue. */
export async function getQueueCount(): Promise<number> {
  const items = await syncQueueCollection.query().fetch();
  return items.length;
}
