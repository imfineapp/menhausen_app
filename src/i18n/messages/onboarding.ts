import { i18n } from '../setup'

export const onboardingMessages = i18n('onboarding', {
  screen01: {
    title: "You don't have to cope alone",
    subtitle: "Anonymous digital self-help tool for men. Effective exercises based on scientific methods. Right in Telegram, no registration required.",
    buttonText: "Start",
    privacyText: "Privacy Policy",
    termsText: "Terms of Use",
    agreementText: "By clicking the button you agree to the"
  },
  screen02: {
    title: "What makes Menhausen special?",
    benefits: ["No personal data, no traces", "Data privacy", "Always with you", "Based on scientifically proven practices"],
    buttonText: "Continue",
    descriptions: ["Works directly in Telegram. No accounts, no email required", "Stored locally on your device. We don't collect or store your data — fewer risks, more privacy.", "In your pocket, in Telegram. Help available 24/7, when you need it", "CBT, ACT, MBCT, positive psychology — scientifically proven methods. No fluff. Straight, honest, to the point. Man to man."]
  }
} as any)
