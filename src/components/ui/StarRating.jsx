import { useState } from 'react';
import { Star } from 'lucide-react';
import './StarRating.css';

export default function StarRating({ rating = 0, maxStars = 5, interactive = false, onRate, size = 20 }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="star-rating" role="group" aria-label="Rating">
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const isFilled = interactive
          ? starValue <= (hovered || rating)
          : starValue <= rating;

        return (
          <button
            key={i}
            type="button"
            className={`star ${isFilled ? 'star-filled' : 'star-empty'} ${interactive ? 'star-interactive' : ''}`}
            onClick={() => interactive && onRate?.(starValue)}
            onMouseEnter={() => interactive && setHovered(starValue)}
            onMouseLeave={() => interactive && setHovered(0)}
            disabled={!interactive}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
          >
            <Star size={size} fill={isFilled ? 'currentColor' : 'none'} />
          </button>
        );
      })}
      {!interactive && rating > 0 && (
        <span className="star-value">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
