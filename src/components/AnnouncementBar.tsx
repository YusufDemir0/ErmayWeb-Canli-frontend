import React, { useState, useEffect } from 'react';

const ANNOUNCEMENTS = [
  '10.000 TL üzeri alışverişlerde ücretsiz teslimat ve kurulum',
  'Özel koleksiyonlarda vade farksız 6 taksit imkanı',
  'Doğrudan üreticiden, fabrikadan birinci el satış ve teslimat'
];

export const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % ANNOUNCEMENTS.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      id="announcement-bar" 
      className="bg-[#C5A880] text-white text-[11px] md:text-xs font-semibold tracking-widest py-2 px-4 border-b border-[#B4966E] shadow-xs"
    >
      <div className="max-w-7xl mx-auto flex justify-center items-center h-5 overflow-hidden relative">
        {ANNOUNCEMENTS.map((text, idx) => (
          <div
            key={idx}
            className={`absolute transition-all duration-700 ease-in-out transform ${
              idx === currentIndex
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
            }`}
          >
            <span className="uppercase">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
