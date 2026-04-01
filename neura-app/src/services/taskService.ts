import AsyncStorage from "@react-native-async-storage/async-storage";
import { database, tasksCollection } from "@/db/database";
import { apiClient } from "@/services/apiClient";
import { enqueue } from "@/services/syncQueue";

const ROLLOVER_KEY = "neura_last_rollover_date";

export interface LocalTask {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  dueDate: string;
  completed: boolean;
  rolledOver: boolean;
}

/** Fetch tasks for a given date from WatermelonDB */
export async function getTasksForDate(dateStr: string): Promise<LocalTask[]> {
  const all = await tasksCollection.query().fetch();
  return all
    .filter((t) => t.dueDate === dateStr)
    .map((t) => ({
      id: t.id,
      title: t.title,
      subject: t.subject,
      estimatedMinutes: t.estimatedMinutes,
      dueDate: t.dueDate,
      completed: t.completed,
      rolledOver: t.rolledOver,
    }));
}

/** Mark a task complete in WatermelonDB and queue server sync */
export async function completeTaskLocal(taskId: string): Promise<void> {
  const task = await tasksCollection.find(taskId);
  await database.write(async () => {
    await task.update((t: any) => {
      t.completed = true;
      t.synced = false;
    });
  });
  // Queue for server sync (works offline)
  await enqueue("task", taskId, "update", {
    server_id: task.serverId || taskId,
    completed: true,
  });
}

/** Delete a task (soft delete locally + queue server sync) */
export async function deleteTaskLocal(taskId: string): Promise<void> {
  const task = await tasksCollection.find(taskId);
  const serverId = task.serverId || taskId;
  await database.write(async () => {
    await task.destroyPermanently();
  });
  if (serverId) {
    await enqueue("task", taskId, "delete", { server_id: serverId });
  }
}

/** Reschedule a task to a new date */
export async function rescheduleTaskLocal(taskId: string, newDate: string): Promise<void> {
  const task = await tasksCollection.find(taskId);
  await database.write(async () => {
    await task.update((t: any) => {
      t.dueDate = newDate;
      t.synced = false;
    });
  });
  await enqueue("task", taskId, "update", {
    server_id: task.serverId || taskId,
    due_date: newDate,
  });
}

/**
 * Midnight rollover: move all incomplete past tasks to today.
 * Runs on app foreground if last rollover wasn't today.
 */
export async function runRolloverIfNeeded(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const lastRollover = await AsyncStorage.getItem(ROLLOVER_KEY);
  if (lastRollover === today) return 0;

  const all = await tasksCollection.query().fetch();
  const overdue = all.filter(
    (t) => !t.completed && t.dueDate < today
  );

  if (overdue.length > 0) {
    await database.write(async () => {
      for (const task of overdue) {
        await task.update((t: any) => {
          t.dueDate = today;
          t.rolledOver = true;
          t.synced = false;
        });
      }
    });
    // Background server sync
    apiClient.post("/tasks/rollover").catch(() => {});
  }

  await AsyncStorage.setItem(ROLLOVER_KEY, today);
  return overdue.length;
}

/** Create a new task in WatermelonDB and queue server sync */
export async function createTask(params: {
  title: string;
  subject: string;
  estimatedMinutes: number;
  dueDate: string;
}): Promise<void> {
  // Generate a simple local ID
  const localId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await database.write(async () => {
    await tasksCollection.create((t: any) => {
      t._raw.id = localId;
      t.title = params.title;
      t.subject = params.subject;
      t.estimatedMinutes = params.estimatedMinutes;
      t.dueDate = params.dueDate;
      t.completed = false;
      t.rolledOver = false;
      t.synced = false;
    });
  });
  await enqueue("task", localId, "create", {
    title: params.title,
    subject: params.subject,
    estimated_minutes: params.estimatedMinutes,
    due_date: params.dueDate,
  });
}

// Named export alias for default import compatibility
export const taskService = {
  createTask,
  getTasksForDate,
  completeTaskLocal,
  deleteTaskLocal,
  rescheduleTaskLocal,
  runRolloverIfNeeded,
};
