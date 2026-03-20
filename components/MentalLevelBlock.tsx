import React, { useEffect, useState, useMemo, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis } from 'recharts';
import { ChartContainer } from './ui/chart';
import { useContent } from './ContentContext';
import { DailyCheckinManager, CheckinData } from '../utils/DailyCheckinManager';
import { buildMentalLevelChartData } from '@/src/domain/mentalLevel.domain';

/**
 * Блок для отображения истории чекинов за последние 14 дней
 * Визуализация в виде area chart с желтым акцентным цветом
 */
export function MentalLevelBlock() {
  const { getUI } = useContent();
  const ui = getUI();
  const [checkins, setCheckins] = useState<CheckinData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Получаем данные чекинов
  useEffect(() => {
    const allCheckins = DailyCheckinManager.getAllCheckins();
    setCheckins(allCheckins);
  }, []);

  // Формируем данные за последние 14 дней
  const chartData = useMemo(() => {
    return buildMentalLevelChartData({ checkins, daysCount: 14 });
  }, [checkins]);

  // Получаем заголовок
  const title = ui.profile?.mentalLevel || 'Твои чекины';

  return (
    <div 
      ref={containerRef}
      className="relative rounded-xl p-4 sm:p-5 md:p-6 w-full" 
      data-name="Mental level block"
    >
      {/* Фон блока */}
      <div className="absolute inset-0" data-name="mental_level_block_background">
        <div className="absolute bg-[rgba(217,217,217,0.04)] inset-0 rounded-xl" data-name="Block">
          <div
            aria-hidden="true"
            className="absolute border border-[#212121] border-solid inset-0 pointer-events-none rounded-xl"
          />
        </div>
      </div>
      
      {/* Контент блока */}
      <div className="relative z-10 flex flex-col gap-4 w-full">
        {/* Заголовок в верхнем левом углу */}
        <div className="text-left">
          <h3 className="text-[#e1ff00] text-base sm:text-lg font-semibold">
            {title}
          </h3>
        </div>
        
        {/* График */}
        <div className="ml-4 sm:ml-5 md:ml-6 w-[calc(100%-1rem)] sm:w-[calc(100%-1.25rem)] md:w-[calc(100%-1.5rem)]" style={{ minHeight: '200px' }}>
          {chartData.length > 0 ? (
            <ChartContainer
              config={{
                value: {
                  label: 'Value',
                  color: '#e1ff00'
                }
              }}
              className="w-full h-[200px] !flex !justify-start !items-start !aspect-auto [&_.recharts-surface]:overflow-visible [&_.recharts-responsive-container]:!w-full [&_.recharts-responsive-container]:!h-full [&_.recharts-responsive-container]:!m-0 [&_.recharts-responsive-container]:!p-0 [&_.recharts-wrapper]:!m-0 [&_.recharts-wrapper]:!p-0 [&_.recharts-wrapper]:!left-0 [&_.recharts-wrapper]:!top-0 [&_.recharts-cartesian-axis]:!left-0"
            >
              <AreaChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e1ff00" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#e1ff00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#696969', fontSize: 12 }}
                  axisLine={{ stroke: '#212121' }}
                  tickLine={{ stroke: '#212121' }}
                />
                <YAxis 
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fill: '#696969', fontSize: 12 }}
                  axisLine={{ stroke: '#212121' }}
                  tickLine={{ stroke: '#212121' }}
                  width={30}
                  orientation="left"
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#e1ff00"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
              {ui.common?.loading || 'Нет данных для отображения'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

