// Temporarily disabled for UI testing with mock data
export class SleepSession {
  static table = "sleep_sessions";
}

/*
import { Model } from "@nozbe/watermelondb";
import { field, date, readonly, text } from "@nozbe/watermelondb/decorators";

export class SleepSession extends Model {
  static table = "sleep_sessions";

  @field("sleep_start") sleepStart: number; // Unix ms
  @field("sleep_end") sleepEnd: number | null; // Unix ms
  @field("duration_minutes") durationMinutes: number | null;
  @text("server_id") serverId: string | null;
  @field("synced") synced: boolean;
  @readonly @date("created_at") createdAt: Date;
}
*/
