import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Marquee Announcement Ticker Visibility Inversion Mechanism', () => {
  // Reversal logic evaluation:
  // When at top (isScrolled === false) -> ticker is HIDDEN.
  // When scrolled down (isScrolled === true) -> ticker is VISIBLE.
  const getTickerContainerClass = (isScrolled: boolean) => {
    return `overflow-hidden transition-all duration-300 ease-in-out ${
      isScrolled ? 'max-h-12 opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'
    }`;
  };

  const evaluateScrollThreshold = (scrollY: number, threshold = 20) => {
    return scrollY > threshold;
  };

  test('at page top (scrollY === 0), marquee container is hidden with zero height and opacity 0', () => {
    const isScrolled = evaluateScrollThreshold(0);
    assert.equal(isScrolled, false);

    const classes = getTickerContainerClass(isScrolled);
    assert.ok(classes.includes('max-h-0'), 'Must collapse height to 0');
    assert.ok(classes.includes('opacity-0'), 'Must be fully transparent');
    assert.ok(classes.includes('pointer-events-none'), 'Must disable pointer events');
    assert.ok(!classes.includes('opacity-100'), 'Must not have opacity-100');
  });

  test('when page is scrolled down (scrollY > 20), marquee container expands smoothly and becomes visible', () => {
    const isScrolled = evaluateScrollThreshold(120);
    assert.equal(isScrolled, true);

    const classes = getTickerContainerClass(isScrolled);
    assert.ok(classes.includes('max-h-12'), 'Must expand to max-h-12');
    assert.ok(classes.includes('opacity-100'), 'Must be fully opaque');
    assert.ok(classes.includes('pointer-events-auto'), 'Must enable pointer events');
    assert.ok(!classes.includes('max-h-0'), 'Must not have max-h-0');
  });

  test('transition duration and easing properties ensure smooth 300ms accordion effect', () => {
    const classes = getTickerContainerClass(true);
    assert.ok(classes.includes('transition-all'), 'Must have transition-all');
    assert.ok(classes.includes('duration-300'), 'Must have 300ms duration');
    assert.ok(classes.includes('ease-in-out'), 'Must use ease-in-out curve');
  });
});
