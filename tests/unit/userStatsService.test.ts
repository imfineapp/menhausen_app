import { describe, it, expect, beforeEach } from 'vitest';
import { 
  loadUserStats, 
  resetUserStats,
  markCardAsOpened,
  markArticleRead,
  incrementCardsOpened
} from '../../services/userStatsService';
import { NON_ACHIEVEMENT_ARTICLE_IDS } from '../../utils/articlesList';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('userStatsService - markCardAsOpened', () => {
  beforeEach(() => {
    localStorageMock.clear();
    resetUserStats();
  });

  it('should mark card as opened and add to openedCardIds', () => {
    const cardId = 'STRESS-01';
    
    markCardAsOpened(cardId);
    
    const stats = loadUserStats();
    expect(stats.openedCardIds).toContain(cardId);
    expect(stats.openedCardIds?.length).toBe(1);
  });

  it('should not duplicate card in openedCardIds when called multiple times', () => {
    const cardId = 'STRESS-01';
    
    markCardAsOpened(cardId);
    markCardAsOpened(cardId);
    markCardAsOpened(cardId);
    
    const stats = loadUserStats();
    expect(stats.openedCardIds).toContain(cardId);
    expect(stats.openedCardIds?.length).toBe(1);
  });

  it('should mark multiple different cards as opened', () => {
    const cardId1 = 'STRESS-01';
    const cardId2 = 'STRESS-02';
    const cardId3 = 'STRESS-03';
    
    markCardAsOpened(cardId1);
    markCardAsOpened(cardId2);
    markCardAsOpened(cardId3);
    
    const stats = loadUserStats();
    expect(stats.openedCardIds).toContain(cardId1);
    expect(stats.openedCardIds).toContain(cardId2);
    expect(stats.openedCardIds).toContain(cardId3);
    expect(stats.openedCardIds?.length).toBe(3);
  });

  it('should initialize openedCardIds as empty array for new stats', () => {
    const stats = loadUserStats();
    expect(Array.isArray(stats.openedCardIds)).toBe(true);
    expect(stats.openedCardIds?.length).toBe(0);
  });

  it('should work with incrementCardsOpened - card should be marked as opened before incrementing', () => {
    const cardId = 'STRESS-01';
    const themeId = 'stress';
    
    // Сначала отмечаем карточку как открытую
    markCardAsOpened(cardId);
    
    // Затем увеличиваем счетчик
    incrementCardsOpened(themeId);
    
    const stats = loadUserStats();
    expect(stats.openedCardIds).toContain(cardId);
    expect(stats.cardsOpened[themeId]).toBe(1);
  });
});

describe('userStatsService - markArticleRead', () => {
  beforeEach(() => {
    localStorageMock.clear();
    resetUserStats();
  });

  it('should add article id to readArticleIds idempotently', () => {
    markArticleRead('stress-management');
    markArticleRead('stress-management');

    const stats = loadUserStats();
    expect(stats.readArticleIds).toContain('stress-management');
    expect(stats.readArticleIds?.length).toBe(1);
  });

  it('should NOT increase articlesRead for non-achievement (pinned) articles', () => {
    const pinnedId = NON_ACHIEVEMENT_ARTICLE_IDS[0];

    markArticleRead(pinnedId);

    const stats = loadUserStats();
    expect(stats.readArticleIds).toContain(pinnedId);
    expect(stats.articlesRead).toBe(0);
  });

  it('should increase articlesRead only for eligible articles', () => {
    // read 1 pinned + 2 eligible
    markArticleRead(NON_ACHIEVEMENT_ARTICLE_IDS[0]);
    markArticleRead('stress-management');
    markArticleRead('anxiety-coping');

    const stats = loadUserStats();
    expect(stats.readArticleIds).toContain('stress-management');
    expect(stats.readArticleIds).toContain('anxiety-coping');
    expect(stats.articlesRead).toBe(2);
  });
});

