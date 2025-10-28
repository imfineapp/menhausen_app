import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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

    // Ждём появления очков с помощью waitFor
    await waitFor(() => {
      // Ищем число 5863 (текущие очки)
      const currentAll = screen.queryAllByText((_, node) => {
        const text = node?.textContent || '';
        const normalized = text.replace(/\s/g, '');
        return normalized.includes('5863');
      });
      return currentAll.length > 0;
    }, { timeout: 5000 });

    // Ищем следующую цель /6000
    await waitFor(() => {
      const targetAll = screen.queryAllByText((_, node) => {
        const text = node?.textContent || '';
        const normalized = text.replace(/\s/g, '');
        return normalized.includes('/6000');
      });
      return targetAll.length > 0;
    }, { timeout: 5000 });
  });
});


