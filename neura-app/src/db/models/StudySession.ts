import { Model } from "@nozbe/watermelondb";
import { field, date, readonly, text } from "@nozbe/watermelondb/decorators";

export class StudySession extends Model {
  static table = "study_sessions";

  @field("duration_minutes") durationMinutes!: number;
  @text("subject") subject!: string;
  @field("neurons_earned") neuronsEarned!: number;
  @text("phase") phase!: "work" | "break";
  @field("completed") completed!: boolean;
  @text("server_id") serverId!: string | null;
  @field("synced") synced!: boolean;
  @readonly @date("created_at") createdAt!: Date;
}
