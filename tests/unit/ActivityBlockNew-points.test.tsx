import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ActivityBlockNew } from '../../components/ActivityBlockNew';
import { PointsManager } from '../../utils/PointsManager';

// Simple providers mock wrappers if needed from existing tests
import { ContentProvider } from '../../components/ContentContext';
import { LanguageProvider } from '../../components/LanguageContext';

describe('ActivityBlockNew points display', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows total earned and next target (5863 / 6000)', async () => {
    PointsManager.earn(5863);

    render(
      <LanguageProvider>
        <ContentProvider>
          <ActivityBlockNew />
        </ContentProvider>
      </LanguageProvider>
    );

    // Ждём загрузку данных с увеличенным таймаутом для стабильности на CI
    await new Promise(resolve => setTimeout(resolve, 100));

    // Числа могут содержать неразрывные пробелы; нормализуем пробельные символы
    const currentAll = await screen.findAllByText((_, node) => {
      const text = node?.textContent || '';
      const normalized = text.replace(/\s/g, '');
      return normalized.includes('5863');
    }, {}, { timeout: 3000 });
    const targetAll = await screen.findAllByText((_, node) => {
      const text = node?.textContent || '';
      const normalized = text.replace(/\s/g, '');
      return normalized.includes('/6000');
    }, {}, { timeout: 3000 });
    expect(currentAll.length).toBeGreaterThan(0);
    expect(targetAll.length).toBeGreaterThan(0);
  });
});


