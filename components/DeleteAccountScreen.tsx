import { useState } from 'react';
// import WarningIcon from "../imports/Frame-6-24";
import warningIconPaths from "../imports/svg-iawz1hhk6y";
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { Light } from './Light';
import { useContent } from './ContentContext';

/**
 * Компонент страницы удаления аккаунта
 * Основан на импортированном дизайне 005DeletePage.tsx
 * Включает предупреждение, подтверждение и функциональность удаления
 */

interface DeleteAccountScreenProps {
  onBack: () => void;
  onDeleteAccount: () => void;
}

/**
 * Декоративный световой эффект в верхней части экрана
 */
// Light переиспользуется из общего компонента

/**
 * Кнопка удаления аккаунта с состоянием загрузки
 */
function DeleteButton({ onDelete, isLoading, buttonText, deletingText }: { 
  onDelete: () => void; 
  isLoading: boolean;
  buttonText: string;
  deletingText: string;
}) {
  return (
    <button
      onClick={onDelete}
      disabled={isLoading}
      className={`bg-[#e1ff00] h-[46px] relative rounded-xl shrink-0 w-full min-h-[44px] min-w-[44px] hover:bg-[#d1ef00] ${
        isLoading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
      data-name="Delete Button"
    >
      <div className="flex flex-row items-center justify-center relative size-full">
        <div className="box-border content-stretch flex flex-row gap-2.5 h-[46px] items-center justify-center px-[126px] py-[15px] relative w-full">
          <div className="typography-button text-[#2d2b2b] text-center">
            <p className="block">
              {isLoading ? deletingText : buttonText}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

/**
 * Блок с предупреждением и кнопкой удаления
 */
function ButtonBlock({ 
  onDelete, 
  isLoading, 
  warningText, 
  buttonText, 
  deletingText 
}: { 
  onDelete: () => void; 
  isLoading: boolean;
  warningText: string;
  buttonText: string;
  deletingText: string;
}) {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-10 items-start justify-start left-1/2 -translate-x-1/2 p-0 bottom-4 sm:bottom-6 md:bottom-8 w-[351px]"
      data-name="button block"
    >
      <div className="typography-caption text-[#e1ff00] text-center w-full">
        <p className="block">
          {warningText}
        </p>
      </div>
      <DeleteButton onDelete={onDelete} isLoading={isLoading} buttonText={buttonText} deletingText={deletingText} />
    </div>
  );
}

/**
 * Иконка предупреждения над основным контентом
 */
function WarningIconComponent() {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 top-[370px] w-20 h-20 flex items-center justify-center"
      data-name="warning_icon"
    >
      <div className="w-16 h-16">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 256 256">
          <g id="Frame">
            <path
              d={warningIconPaths.p71a7ef0}
              id="Vector"
              stroke="var(--stroke-0, #E1FF00)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="21.3333"
            />
            <path
              d="M128 96V138.667"
              id="Vector_2"
              stroke="var(--stroke-0, #E1FF00)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="21.3333"
            />
            <path
              d="M128 181.333H128.107"
              id="Vector_3"
              stroke="var(--stroke-0, #E1FF00)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="21.3333"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

/**
 * Основной контент с заголовком и описанием
 */
function MainContent({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="absolute box-border content-stretch flex flex-col gap-10 items-start justify-start leading-[0] left-1/2 -translate-x-1/2 p-0 text-center top-[470px] w-[351px]"
      data-name="main_content"
    >
      <div className="typography-h1 text-[#e1ff00] w-full">
        <h1 className="block">{title}</h1>
      </div>
      <div className="typography-body text-[#ffffff] w-full">
        <p className="block">
          {description}
        </p>
      </div>
    </div>
  );
}



/**
 * Основной компонент экрана удаления аккаунта
 */
export function DeleteAccountScreen({ onBack: _onBack, onDeleteAccount }: DeleteAccountScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { content, getLocalizedText } = useContent();

  // Получаем переводы для экрана удаления аккаунта
  const deleteAccountTexts = content?.ui?.deleteAccount;
  const title = deleteAccountTexts ? getLocalizedText(deleteAccountTexts.title) : 'Danger zone';
  const description = deleteAccountTexts ? getLocalizedText(deleteAccountTexts.description) : 'In this section you can delete all information about yourself and your account from the application';
  const warning = deleteAccountTexts ? getLocalizedText(deleteAccountTexts.warning) : 'By clicking the button I understand that all data about me will be deleted without the possibility of return';
  const buttonText = deleteAccountTexts ? getLocalizedText(deleteAccountTexts.button) : 'Delete';
  const deletingText = deleteAccountTexts ? getLocalizedText(deleteAccountTexts.buttonDeleting) : 'Deleting...';
  const confirmMessage = deleteAccountTexts ? getLocalizedText(deleteAccountTexts.confirmMessage) : 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.';
  const successMessage = deleteAccountTexts ? getLocalizedText(deleteAccountTexts.successMessage) : 'Your account has been successfully deleted. You will be redirected to the welcome screen.';
  const errorMessage = deleteAccountTexts ? getLocalizedText(deleteAccountTexts.errorMessage) : 'An error occurred while deleting your account. Please try again.';

  /**
   * Обработчик удаления аккаунта с подтверждением
   */
  const handleDelete = async () => {
    try {
      // Подтверждение действия
      const confirmed = confirm(confirmMessage);

      if (!confirmed) {
        return;
      }

      console.log('Starting account deletion process...');
      setIsLoading(true);

      // Добавляем тактильную обратную связь если доступна
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
      }

      // Имитация API запроса на удаление аккаунта
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Account deletion completed');
      
      // Показываем уведомление об успешном удалении
      alert(successMessage);

      // Вызываем callback для удаления аккаунта
      onDeleteAccount();

    } catch (error) {
      console.error('Error deleting account:', error);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] relative size-full" data-name="Delete Account Screen">
      <Light />
      
      {/* Логотип */}
      <MiniStripeLogo />
      
      <ButtonBlock 
        onDelete={handleDelete} 
        isLoading={isLoading} 
        warningText={warning}
        buttonText={buttonText}
        deletingText={deletingText}
      />
      <WarningIconComponent />
      <MainContent title={title} description={description} />
    </div>
  );
}