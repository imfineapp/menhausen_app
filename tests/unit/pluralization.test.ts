import { describe, it, expect } from 'vitest';
import { 
  pluralizeRussian, 
  pluralizeEnglish, 
  getRussianDayForm, 
  getEnglishDayForm 
} from '../../utils/pluralization';

describe('Pluralization Utils', () => {
  describe('pluralizeRussian', () => {
    it('should return correct form for 1', () => {
      expect(pluralizeRussian(1, ['день', 'дня', 'дней'])).toBe('день');
    });

    it('should return correct form for 2-4', () => {
      expect(pluralizeRussian(2, ['день', 'дня', 'дней'])).toBe('дня');
      expect(pluralizeRussian(3, ['день', 'дня', 'дней'])).toBe('дня');
      expect(pluralizeRussian(4, ['день', 'дня', 'дней'])).toBe('дня');
    });

    it('should return correct form for 5+', () => {
      expect(pluralizeRussian(5, ['день', 'дня', 'дней'])).toBe('дней');
      expect(pluralizeRussian(10, ['день', 'дня', 'дней'])).toBe('дней');
      expect(pluralizeRussian(21, ['день', 'дня', 'дней'])).toBe('день');
      expect(pluralizeRussian(22, ['день', 'дня', 'дней'])).toBe('дня');
      expect(pluralizeRussian(25, ['день', 'дня', 'дней'])).toBe('дней');
    });

    it('should handle 11-19 correctly', () => {
      expect(pluralizeRussian(11, ['день', 'дня', 'дней'])).toBe('дней');
      expect(pluralizeRussian(15, ['день', 'дня', 'дней'])).toBe('дней');
      expect(pluralizeRussian(19, ['день', 'дня', 'дней'])).toBe('дней');
    });
  });

  describe('pluralizeEnglish', () => {
    it('should return singular for 1', () => {
      expect(pluralizeEnglish(1, 'day', 'days')).toBe('day');
    });

    it('should return plural for 0 and 2+', () => {
      expect(pluralizeEnglish(0, 'day', 'days')).toBe('days');
      expect(pluralizeEnglish(2, 'day', 'days')).toBe('days');
      expect(pluralizeEnglish(10, 'day', 'days')).toBe('days');
    });
  });

  describe('getRussianDayForm', () => {
    it('should return correct Russian day forms', () => {
      expect(getRussianDayForm(1)).toBe('день');
      expect(getRussianDayForm(2)).toBe('дня');
      expect(getRussianDayForm(5)).toBe('дней');
      expect(getRussianDayForm(21)).toBe('день');
      expect(getRussianDayForm(22)).toBe('дня');
    });
  });

  describe('getEnglishDayForm', () => {
    it('should return correct English day forms', () => {
      expect(getEnglishDayForm(1)).toBe('day');
      expect(getEnglishDayForm(0)).toBe('days');
      expect(getEnglishDayForm(2)).toBe('days');
      expect(getEnglishDayForm(10)).toBe('days');
    });
  });
});
