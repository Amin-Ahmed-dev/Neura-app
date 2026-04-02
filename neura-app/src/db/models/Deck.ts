// Temporarily disabled for UI testing with mock data
export class Deck {
  static table = "decks";
}

/*
import { Model } from "@nozbe/watermelondb";
import { field, date, readonly, text } from "@nozbe/watermelondb/decorators";

export class Deck extends Model {
  static table = "decks";

  @text("title") title: string;
  @text("subject") subject: string;
  @text("material_server_id") materialServerId: string | null;
  @text("server_id") serverId: string | null;
  @field("synced") synced: boolean;
  @readonly @date("created_at") createdAt: Date;
}
*/
