import { useEffect, useState, useRef } from 'react';
import './StatCard.css';

function StatCard({ title, value, icon, gradient = 'primary' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef(null);

  useEffect(() => {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue) || numericValue === 0) {
      setDisplayValue(0);
      return;
    }

    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * numericValue);
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [value]);

  const gradientClass = `stat-card-gradient-${gradient}`;

  return (
    <div className={`stat-card glass-card ${gradientClass}`} ref={cardRef}>
      <div className="stat-card-shimmer"></div>
      <div className="stat-card-content">
        <div className="stat-card-info">
          <span className="stat-card-title">{title}</span>
          <span className="stat-card-value">{displayValue}</span>
        </div>
        <div className={`stat-card-icon stat-card-icon-${gradient}`}>
          <span>{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
