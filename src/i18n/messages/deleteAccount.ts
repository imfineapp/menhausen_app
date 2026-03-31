import { i18n } from '../setup'

export const deleteAccountMessages = i18n('deleteAccount', {
  title: "Danger zone",
  description: "In this section you can delete all information about yourself and your account from the application",
  warning: "By clicking the button I understand that all data about me will be deleted without the possibility of return",
  button: "Delete",
  buttonDeleting: "Deleting...",
  confirmTitle: "Are you sure?",
  confirmMessage: "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.",
  successTitle: "Account deleted",
  successMessage: "Your account has been successfully deleted. You will be redirected to the welcome screen.",
  errorTitle: "Error",
  errorMessage: "An error occurred while deleting your account. Please try again.",
  serverDeleteFailedMessage:
    "Local data was cleared. We could not confirm deletion on the server — contact support if your account should be fully removed."
} as any)
