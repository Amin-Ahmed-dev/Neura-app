import { Model } from "@nozbe/watermelondb";
import { field, date, readonly, text } from "@nozbe/watermelondb/decorators";

export class ChatMessage extends Model {
  static table = "chat_messages";

  @text("role") role!: "user" | "assistant";
  @text("content") content!: string;
  @text("subject") subject!: string | null;
  @text("server_id") serverId!: string | null;
  @field("synced") synced!: boolean;
  @readonly @date("created_at") createdAt!: Date;
}
