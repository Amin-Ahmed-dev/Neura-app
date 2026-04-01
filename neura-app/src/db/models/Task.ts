import { Model } from "@nozbe/watermelondb";
import { field, date, readonly, text, writer } from "@nozbe/watermelondb/decorators";

export class Task extends Model {
  static table = "tasks";

  @text("title") title!: string;
  @text("subject") subject!: string;
  @field("estimated_minutes") estimatedMinutes!: number;
  @text("due_date") dueDate!: string;
  @field("completed") completed!: boolean;
  @field("rolled_over") rolledOver!: boolean;
  @text("server_id") serverId!: string | null;
  @field("synced") synced!: boolean;
  @readonly @date("created_at") createdAt!: Date;
  @readonly @date("updated_at") updatedAt!: Date;

  @writer async markComplete() {
    await this.update((task) => {
      task.completed = true;
      task.synced = false;
    });
  }

  @writer async markRolledOver() {
    await this.update((task) => {
      task.rolledOver = true;
      task.synced = false;
    });
  }
}
