/**
 * Sync Service — processes the offline sync queue when connectivity is restored.
 * Runs in the background; non-blocking.
 */
import { apiClient } from "./apiClient";
import { getQueue, markSynced, incrementRetry, getQueueCount } from "./syncQueue";
import type { QueueEntry } from "./syncQueue";

const MAX_RETRIES = 3;

// Endpoint map per entity type + action
function resolveEndpoint(entry: QueueEntry): { method: string; url: string; body?: unknown } | null {
  const { entityType, action, payload, entityLocalId } = entry;
  const serverId = (payload && typeof payload === 'object' && 'server_id' in payload) 
    ? payload.server_id 
    : entityLocalId;

  switch (entityType) {
    case "task":
      if (action === "create")
        return { method: "POST", url: "/tasks", body: payload };
      if (action === "update")
        return { method: "PATCH", url: `/tasks/${serverId}`, body: payload };
      if (action === "delete")
        return { method: "DELETE", url: `/tasks/${serverId}` };
      break;

    case "session":
      if (action === "create")
        return { method: "POST", url: "/study/session", body: payload };
      break;

    case "flashcard_review":
      if (action === "update")
        return {
          method: "POST",
          url: `/flashcards/${serverId}/review`,
          body: { 
            quality: (payload && typeof payload === 'object' && 'quality' in payload) 
              ? payload.quality 
              : 3 
          },
        };
      break;
  }
  return null;
}

async function processEntry(entry: QueueEntry): Promise<boolean> {
  const req = resolveEndpoint(entry);
  if (!req) {
    // Unknown entry — remove it
    await markSynced(entry.id);
    return true;
  }

  try {
    if (req.method === "POST")
      await apiClient.post(req.url, req.body);
    else if (req.method === "PATCH")
      await apiClient.patch(req.url, req.body);
    else if (req.method === "DELETE")
      await apiClient.delete(req.url);

    await markSynced(entry.id);
    return true;
  } catch {
    await incrementRetry(entry.id);
    return false;
  }
}

let _running = false;

/**
 * Process all pending sync queue items.
 * Returns the number of successfully synced items.
 */
export async function processSyncQueue(): Promise<number> {
  if (_running) return 0;
  _running = true;
  let synced = 0;

  try {
    const queue = await getQueue();
    for (const entry of queue) {
      if (entry.retryCount >= MAX_RETRIES) {
        // Give up on this item — remove it to avoid blocking the queue
        await markSynced(entry.id);
        continue;
      }
      const ok = await processEntry(entry);
      if (ok) synced++;
    }
  } finally {
    _running = false;
  }

  return synced;
}

/** Returns true if there are items waiting to sync. */
export async function hasPendingSync(): Promise<boolean> {
  const count = await getQueueCount();
  return count > 0;
}
