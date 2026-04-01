import { Model } from "@nozbe/watermelondb";
import { field, date, readonly, text } from "@nozbe/watermelondb/decorators";

export class SyncQueueItem extends Model {
  static table = "sync_queue";

  @text("entity_type") entityType!: string;
  @text("entity_local_id") entityLocalId!: string;
  @text("action") action!: "create" | "update" | "delete";
  @text("payload") payload!: string; // JSON string
  @field("retry_count") retryCount!: number;
  @readonly @date("created_at") createdAt!: Date;
}
