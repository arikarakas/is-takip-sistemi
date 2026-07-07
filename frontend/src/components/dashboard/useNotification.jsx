import { useCallback } from 'react';

export function useNotification() {
  
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }, []);

  const triggerNotification = useCallback(async (title, options = {}) => {
    if (!('Notification' in window)) return;

    // İzin durumunu kontrol et, default ise tekrar iste
    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await requestPermission();
    }

    if (permission === 'granted') {
      const notification = new Notification(title, {
        body: options.body,
      });

      notification.onclick = (e) => {
        e.preventDefault();
        window.focus(); // Sekmeyi öne getir
        if (options.onClickAction) options.onClickAction();
        notification.close();
      };
    }
  }, [requestPermission]);

  return { triggerNotification, requestPermission };
}