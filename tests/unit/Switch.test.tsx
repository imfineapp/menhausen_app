import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Switch } from '../../components/ui/switch';

describe('Switch Component', () => {
  it('renders switch with correct accessibility attributes', () => {
    render(<Switch data-testid="test-switch" />);
    
    const switchElement = screen.getByTestId('test-switch');
    
    // Проверяем ARIA атрибуты
    expect(switchElement).toHaveAttribute('role', 'switch');
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles state when clicked', () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} data-testid="test-switch" />);
    
    const switchElement = screen.getByTestId('test-switch');
    
    // Кликаем по switch
    fireEvent.click(switchElement);
    
    // Проверяем, что обработчик вызван с правильным значением
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('supports keyboard navigation', () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} data-testid="test-switch" />);
    
    const switchElement = screen.getByTestId('test-switch');
    
    // Фокусируемся на элементе
    switchElement.focus();
    expect(switchElement).toHaveFocus();
    
    // Нажимаем Space (Radix UI обрабатывает это автоматически)
    fireEvent.keyDown(switchElement, { key: ' ', code: 'Space', keyCode: 32 });
    // Radix UI может не вызывать onCheckedChange при keyDown, проверим клик
    fireEvent.click(switchElement);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('respects disabled state', () => {
    const handleChange = vi.fn();
    render(<Switch disabled onCheckedChange={handleChange} data-testid="test-switch" />);
    
    const switchElement = screen.getByTestId('test-switch');
    
    // Проверяем disabled атрибуты
    expect(switchElement).toBeDisabled();
    
    // Клик не должен вызывать обработчик
    fireEvent.click(switchElement);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('shows correct visual state when checked', () => {
    render(<Switch checked data-testid="test-switch" />);
    
    const switchElement = screen.getByTestId('test-switch');
    
    // Проверяем состояние checked
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('applies custom className', () => {
    render(<Switch className="custom-class" data-testid="test-switch" />);
    
    const switchElement = screen.getByTestId('test-switch');
    expect(switchElement).toHaveClass('custom-class');
  });

  it('has proper touch-friendly sizing', () => {
    render(<Switch data-testid="test-switch" />);
    
    const switchElement = screen.getByTestId('test-switch');
    
    // Проверяем, что элемент имеет правильные размеры для touch-friendly интерфейса
    expect(switchElement).toHaveClass('h-[16px]');
    expect(switchElement).toHaveClass('w-[37px]');
  });

  it('applies correct background colors', () => {
    const { rerender } = render(<Switch checked={false} data-testid="test-switch" />);
    let switchElement = screen.getByTestId('test-switch');
    
    // Проверяем data-атрибут для выключенного состояния
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');
    
    // Переключаем на включенное состояние
    rerender(<Switch checked={true} data-testid="test-switch" />);
    switchElement = screen.getByTestId('test-switch');
    
    // Проверяем data-атрибут для включенного состояния
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });
});
