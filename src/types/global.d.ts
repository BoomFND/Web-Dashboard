declare global {
  interface Window {
    ethereum: any // You can replace 'any' with a more specific type if needed
    onTelegramAuth?: (user: any) => void
    Telegram: any
  }
}

// This line is necessary to make this file a module
export {}
