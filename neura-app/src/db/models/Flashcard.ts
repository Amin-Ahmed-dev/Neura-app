import { Model } from "@nozbe/watermelondb";
import { field, date, readonly, text } from "@nozbe/watermelondb/decorators";

export class Flashcard extends Model {
  static table = "flashcards";

  @text("deck_id") deckId!: string;
  @text("question") question!: string;
  @text("answer") answer!: string;
  @field("ease_factor") easeFactor!: number;
  @field("interval_days") intervalDays!: number;
  @text("next_review_date") nextReviewDate!: string;
  @field("repetitions") repetitions!: number;
  @text("server_id") serverId!: string | null;
  @field("synced") synced!: boolean;
  @readonly @date("created_at") createdAt!: Date;
}
