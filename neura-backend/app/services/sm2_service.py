"""
SM-2 Spaced Repetition Algorithm for Neura flashcards.
Quality scale: 0 = Again, 3 = Hard, 5 = Easy
"""
from datetime import date, timedelta
from app.models.flashcard import Flashcard


def update_card(card: Flashcard, quality: int) -> Flashcard:
    """
    Applies the SM-2 algorithm to a flashcard based on recall quality.
    Mutates and returns the card (caller must commit to DB).
    """
    if quality < 3:
        # Failed recall — reset
        card.repetitions = 0
        card.interval_days = 1
    else:
        if card.repetitions == 0:
            card.interval_days = 1
        elif card.repetitions == 1:
            card.interval_days = 6
        else:
            card.interval_days = round(card.interval_days * card.ease_factor)
        card.repetitions += 1

    # Update ease factor (clamp to minimum 1.3)
    card.ease_factor = max(
        1.3,
        card.ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
    )
    card.next_review_date = date.today() + timedelta(days=card.interval_days)
    return card
