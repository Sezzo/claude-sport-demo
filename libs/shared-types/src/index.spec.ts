import { calculateHRMax, calculateZoneRange, getZoneForBPM, ZONES } from './index';

describe('Shared Types Utils', () => {
  describe('calculateHRMax', () => {
    it('should calculate max HR for age 30', () => {
      expect(calculateHRMax(30)).toBe(192);
    });

    it('should calculate max HR for age 40', () => {
      expect(calculateHRMax(40)).toBe(186);
    });

    it('should calculate max HR for age 25', () => {
      expect(calculateHRMax(25)).toBe(195);
    });

    it('should calculate max HR for age 50', () => {
      expect(calculateHRMax(50)).toBe(179);
    });
  });

  describe('calculateZoneRange', () => {
    it('should calculate white zone range for HR max 190', () => {
      const [min, max] = calculateZoneRange(190, ZONES.white);
      expect(min).toBe(0);
      expect(max).toBe(95);
    });

    it('should calculate blue zone range for HR max 190', () => {
      const [min, max] = calculateZoneRange(190, ZONES.blue);
      expect(min).toBe(114);
      expect(max).toBe(131);
    });

    it('should calculate red zone range for HR max 190', () => {
      const [min, max] = calculateZoneRange(190, ZONES.red);
      expect(min).toBe(171);
      expect(max).toBe(190);
    });
  });

  describe('getZoneForBPM', () => {
    const hrMax = 190;

    it('should return white for 50 BPM', () => {
      const zone = getZoneForBPM(50, hrMax);
      expect(zone.code).toBe('white');
    });

    it('should return grey for 100 BPM', () => {
      const zone = getZoneForBPM(100, hrMax);
      expect(zone.code).toBe('grey');
    });

    it('should return blue for 120 BPM', () => {
      const zone = getZoneForBPM(120, hrMax);
      expect(zone.code).toBe('blue');
    });

    it('should return green for 140 BPM', () => {
      const zone = getZoneForBPM(140, hrMax);
      expect(zone.code).toBe('green');
    });

    it('should return yellow for 160 BPM', () => {
      const zone = getZoneForBPM(160, hrMax);
      expect(zone.code).toBe('yellow');
    });

    it('should return red for 180 BPM', () => {
      const zone = getZoneForBPM(180, hrMax);
      expect(zone.code).toBe('red');
    });

    it('should return white for BPM below zones', () => {
      const zone = getZoneForBPM(20, hrMax);
      expect(zone.code).toBe('white');
    });
  });

  describe('ZONES', () => {
    it('should have all 6 zones defined', () => {
      expect(Object.keys(ZONES)).toHaveLength(6);
      expect(ZONES.white).toBeDefined();
      expect(ZONES.grey).toBeDefined();
      expect(ZONES.blue).toBeDefined();
      expect(ZONES.green).toBeDefined();
      expect(ZONES.yellow).toBeDefined();
      expect(ZONES.red).toBeDefined();
    });

    it('should have correct zone ranges', () => {
      expect(ZONES.white.minPercent).toBe(0);
      expect(ZONES.white.maxPercent).toBe(50);
      expect(ZONES.red.minPercent).toBe(90);
      expect(ZONES.red.maxPercent).toBe(100);
    });

    it('should have emojis for all zones', () => {
      Object.values(ZONES).forEach(zone => {
        expect(zone.emoji).toBeTruthy();
        expect(zone.name).toBeTruthy();
        expect(zone.color).toBeTruthy();
      });
    });
  });
});
