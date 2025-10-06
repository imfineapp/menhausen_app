import { useState } from 'react';
import { Light } from './Light';
import { MiniStripeLogo } from './ProfileLayoutComponents';
import { useTranslation } from './LanguageContext';

interface DonationsScreenProps {
	onBack: () => void;
}

export function DonationsScreen({ onBack: _onBack }: DonationsScreenProps) {
	const [copied, setCopied] = useState(false);
    const { t } = useTranslation();

	// Адреса кошельков
	const tonAddress = 'UQDbAzauqW8a6eAmbIhl6G5VuvC_op6PVAkhJ6hcZC6epLbk';
	const usdtTonAddress = 'UQDbAzauqW8a6eAmbIhl6G5VuvC_op6PVAkhJ6hcZC6epLbk';

	const handleCopy = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
			if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
				window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
			}
		} catch (e) {
			console.error('Copy failed', e);
		}
	};

	return (
		<div className="bg-[#111111] relative size-full min-h-screen overflow-x-hidden" data-name="Donations Page">
			<Light />
			<MiniStripeLogo />

			{/* Контейнер */}
			<div className="absolute top-[141px] left-0 right-0 bottom-0 overflow-y-auto">
				<div className="px-4 sm:px-6 md:px-[21px] py-5 pb-[120px]">
					<div className="w-full max-w-[351px] mx-auto flex flex-col gap-6">
						<h1 className="typography-h1 text-left text-white">{t('donations_title')}</h1>
						<p className="typography-subtitle text-left text-[#ADADAD]">
							{t('donations_description')}
						</p>

						{/* TON */}
						<div className="flex flex-col gap-3">
							<label className="typography-caption text-[#ADADAD]">{t('donations_currency_ton')}</label>
							<div className="flex items-center gap-2">
								<input
									readOnly
									value={tonAddress}
									className="flex-1 bg-[#1A1A1A] text-white rounded-[12px] px-3 py-3 border border-[#2A2A2A]"
								/>
								<button
									onClick={() => handleCopy(tonAddress)}
									className="min-w-[112px] px-4 py-3 rounded-[12px] bg-[#e1ff00] text-black font-medium active:opacity-80"
								>
									{copied ? t('copied') : t('copy')}
								</button>
							</div>
						</div>

						{/* USDT (TON) */}
						<div className="flex flex-col gap-3">
							<label className="typography-caption text-[#ADADAD]">{t('donations_currency_usdt_ton')}</label>
							<div className="flex items-center gap-2">
								<input
									readOnly
									value={usdtTonAddress}
									className="flex-1 bg-[#1A1A1A] text-white rounded-[12px] px-3 py-3 border border-[#2A2A2A]"
								/>
								<button
									onClick={() => handleCopy(usdtTonAddress)}
									className="min-w-[112px] px-4 py-3 rounded-[12px] bg-[#e1ff00] text-black font-medium active:opacity-80"
								>
									{copied ? t('copied') : t('copy')}
								</button>
							</div>
						</div>

						{/* Кнопка назад удалена: используется глобальная BackButton Telegram */}
					</div>
				</div>
			</div>
		</div>
	);
}


