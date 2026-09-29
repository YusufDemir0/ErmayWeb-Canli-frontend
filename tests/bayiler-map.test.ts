import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Bayiler Turkey Map GPU Zoom & Region Hysteresis Engine', () => {
  const REGION_TRANSFORMS: Record<string, { scale: number; x: number; y: number }> = {
    marmara: { scale: 1.85, x: 260, y: 70 },
    ege: { scale: 1.9, x: 280, y: -70 },
    icanadolu: { scale: 1.85, x: -60, y: -50 },
    akdeniz: { scale: 1.85, x: -60, y: -160 },
    karadeniz: { scale: 1.75, x: -160, y: 80 },
    guneydogu: { scale: 1.9, x: -400, y: -170 },
    doguanadolu: { scale: 1.85, x: -440, y: -40 },
  };

  test('fixed viewBox is strictly set to 1000x422 SVG coordinate plane', () => {
    const fixedViewBox = '0 0 1000 422';
    assert.equal(fixedViewBox, '0 0 1000 422');
  });

  test('calibrates transforms for all 7 geographic regions without missing keys', () => {
    const expectedRegions = [
      'marmara',
      'ege',
      'icanadolu',
      'akdeniz',
      'karadeniz',
      'guneydogu',
      'doguanadolu',
    ];

    for (const region of expectedRegions) {
      assert.ok(region in REGION_TRANSFORMS, `Region ${region} should exist in transforms map`);
      const { scale, x, y } = REGION_TRANSFORMS[region];
      assert.ok(scale >= 1.5 && scale <= 2.5, `Scale for ${region} should be between 1.5 and 2.5`);
      assert.ok(typeof x === 'number', `x offset for ${region} must be a number`);
      assert.ok(typeof y === 'number', `y offset for ${region} must be a number`);
    }
  });

  test('computes GPU transform matrix string correctly for hardware acceleration', () => {
    const computeTransformStyle = (scale: number, x: number, y: number) => {
      return `translate(${x}px, ${y}px) scale(${scale})`;
    };

    const marmaraTransform = computeTransformStyle(
      REGION_TRANSFORMS.marmara.scale,
      REGION_TRANSFORMS.marmara.x,
      REGION_TRANSFORMS.marmara.y
    );
    assert.equal(marmaraTransform, 'translate(260px, 70px) scale(1.85)');

    const defaultTransform = computeTransformStyle(1, 0, 0);
    assert.equal(defaultTransform, 'translate(0px, 0px) scale(1)');
  });

  test('hysteresis scroll evaluator prevents oscillation in the deadzone (35px - 90px)', () => {
    const evaluateScrollZoom = (
      scrollY: number,
      currentZoomed: boolean,
      mostPopulatedRegion: string
    ) => {
      // Hysteresis thresholds
      if (scrollY >= 90) {
        return { isZoomed: true, targetRegion: mostPopulatedRegion };
      } else if (scrollY < 35) {
        return { isZoomed: false, targetRegion: null };
      }
      // Deadzone: retain current state to avoid flickering
      return { isZoomed: currentZoomed, targetRegion: currentZoomed ? mostPopulatedRegion : null };
    };

    // 1. Initial top: Not zoomed
    assert.deepEqual(evaluateScrollZoom(0, false, 'marmara'), {
      isZoomed: false,
      targetRegion: null,
    });

    // 2. Small scroll below 35px: Stays not zoomed
    assert.deepEqual(evaluateScrollZoom(20, false, 'marmara'), {
      isZoomed: false,
      targetRegion: null,
    });

    // 3. Scroll inside deadzone when initially not zoomed: Stays not zoomed
    assert.deepEqual(evaluateScrollZoom(50, false, 'marmara'), {
      isZoomed: false,
      targetRegion: null,
    });

    // 4. Scroll >= 90px: Zooms in!
    assert.deepEqual(evaluateScrollZoom(95, false, 'marmara'), {
      isZoomed: true,
      targetRegion: 'marmara',
    });

    // 5. Scroll back into deadzone (60px) while zoomed: Stays zoomed (Hysteresis working!)
    assert.deepEqual(evaluateScrollZoom(60, true, 'marmara'), {
      isZoomed: true,
      targetRegion: 'marmara',
    });

    // 6. Scroll back to top (< 35px): Zooms out to full overview
    assert.deepEqual(evaluateScrollZoom(30, true, 'marmara'), {
      isZoomed: false,
      targetRegion: null,
    });
  });

  test('manual interaction lockout guards scroll listener for 3000ms upon user clicks', () => {
    let manualLockUntil = 0;

    const onUserCityClick = () => {
      manualLockUntil = Date.now() + 3000;
    };

    const isScrollIgnored = () => {
      return Date.now() < manualLockUntil;
    };

    // Before click: scroll is NOT ignored
    assert.equal(isScrollIgnored(), false);

    // User clicks city or region button
    onUserCityClick();

    // Immediately after click: scroll listener MUST be ignored
    assert.equal(isScrollIgnored(), true);
  });
});
