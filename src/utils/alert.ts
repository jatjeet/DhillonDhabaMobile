import { Alert, Platform } from 'react-native';

/**
 * Cross-platform confirmation dialog that works reliably on both Mobile and Web.
 * On React Native Web, Alert.alert is an empty no-op, so we fallback to window.confirm.
 */
export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm) {
      const ok = window.confirm(`${title}\n\n${message}`);
      if (ok) {
        onConfirm();
      }
    } else {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: cancelText, style: 'cancel' },
    {
      text: confirmText,
      style: 'destructive',
      onPress: () => {
        onConfirm();
      },
    },
  ]);
}

/**
 * Cross-platform alert popup that falls back to window.alert on Web.
 */
export function showAlert(title: string, message?: string, onOk?: () => void) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(message ? `${title}\n\n${message}` : title);
      onOk?.();
    } else {
      onOk?.();
    }
    return;
  }

  if (onOk) {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  } else {
    Alert.alert(title, message);
  }
}
