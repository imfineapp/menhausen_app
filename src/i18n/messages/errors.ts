import { i18n } from '../setup'

export const errorsMessages = i18n('errors', {
  somethingWentWrong: "Something went wrong",
  unexpected: "We're sorry, but something unexpected happened. Please try reloading the app.",
  reloadApp: "Reload App",
  tryAgain: "Try Again",
  contentUnavailable: "Content is unavailable",
  themeNotFound: "Theme not found",
  themeListLoadingError: "Failed to load themes",
  loadingDataError: "Failed to load data",
  syncIncrementalErrorTitle: "Couldn't sync your latest changes",
  syncIncrementalErrorHint: "We'll retry automatically. If this keeps happening, try reloading the app.",
  syncIncrementalErrorDismiss: "Dismiss"
} as any)
