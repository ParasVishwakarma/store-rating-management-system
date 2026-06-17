import { useState } from 'react';
import './StarRating.css';

function StarRating({ rating = 0, onRate, readonly = false, size = 24 }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [clicked, setClicked] = useState(false);

  const handleClick = (starValue) => {
    if (readonly || !onRate) return;
    setClicked(true);
    onRate(starValue);
    setTimeout(() => setClicked(false), 400);
  };

  const handleMouseEnter = (starValue) => {
    if (readonly) return;
    setHoverRating(starValue);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={`star-rating ${readonly ? 'star-rating-readonly' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= displayRating ? 'star-filled' : 'star-empty'} ${
            !readonly && hoverRating >= star ? 'star-hover' : ''
          } ${clicked && star <= rating ? 'star-clicked' : ''}`}
          style={{ fontSize: `${size}px` }}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          role={readonly ? 'img' : 'button'}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          {star <= displayRating ? '★' : '☆'}
        </span>
      ))}
      {rating > 0 && (
        <span className="star-rating-value">{Number(rating).toFixed(1)}</span>
      )}
    </div>
  );
}

export default StarRating;
