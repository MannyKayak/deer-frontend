"use client";

type StarRatingProps = {
  value: number;
  onChange: (value: number) => void;
};

const STAR_COUNT = 5;

export function StarRating({ value, onChange }: StarRatingProps) {
  return (
    <div role="radiogroup" aria-label="Valuta la tua esperienza" className="flex gap-1">
      {Array.from({ length: STAR_COUNT }, (_, index) => index + 1).map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} ${star === 1 ? "stella" : "stelle"} su ${STAR_COUNT}`}
            onClick={() => onChange(star)}
            className={`text-3xl leading-none outline-none transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary ${
              filled ? "text-accent-gold" : "text-border-neutral"
            }`}
          >
            <span aria-hidden="true">★</span>
          </button>
        );
      })}
    </div>
  );
}
