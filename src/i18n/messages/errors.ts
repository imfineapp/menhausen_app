import { i18n } from '../setup'

export const errorsMessages = i18n('errors', {
  somethingWentWrong: "Something went wrong",
  unexpected: "We're sorry, but something unexpected happened. Please try reloading the app.",
  reloadApp: "Reload App",
  tryAgain: "Try Again",
  contentUnavailable: "Content is unavailable",
  themeNotFound: "Theme not found",
  themeListLoadingError: "Failed to load themes",
  loadingDataError: "Failed to load data"
} as any)
