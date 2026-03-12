import React from 'react';
import { Light } from './Light';
import { MiniStripeLogo } from './ProfileLayoutComponents';

interface FormScreenLayoutProps {
  children: React.ReactNode;
  bottomActions?: React.ReactNode;
  dataName?: string;
}

/**
 * Общий layout для экранов с формами и нижними кнопками.
 * Обеспечивает:
 * - полноэкранный контейнер;
 * - скроллируемую область контента;
 * - нижний паддинг под блок кнопок;
 * - фиксированный блок действий внизу.
 */
export function FormScreenLayout({
  children,
  bottomActions,
  dataName,
}: FormScreenLayoutProps) {
  return (
    <div
      className="w-full h-screen max-h-screen relative overflow-hidden overflow-x-hidden bg-[#111111] flex flex-col"
      data-name={dataName}
    >
      <Light />

      <div className="relative" style={{ zIndex: 1 }}>
        <MiniStripeLogo />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] sm:px-[20px] md:px-[21px] pt-[140px] pb-[200px]">
          <div className="max-w-[351px] mx-auto">{children}</div>
        </div>
      </div>

      {bottomActions && (
        <div className="relative" style={{ zIndex: 2 }}>
          {bottomActions}
        </div>
      )}
    </div>
  );
}

