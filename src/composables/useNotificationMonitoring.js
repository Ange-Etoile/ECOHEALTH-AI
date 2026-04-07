import { onMounted, onUnmounted } from 'vue';
import { requestNotificationPermissions, startBackgroundMonitoring, checkAndTriggerNotifications } from '@/services/notificationService';
import { App as CapacitorApp } from '@capacitor/app';

let monitoringInterval = null;

export function useNotificationMonitoring() {
  onMounted(async () => {
    const permGranted = await requestNotificationPermissions();
    
    if (permGranted) {
      await checkAndTriggerNotifications();
      startBackgroundMonitoring();
      CapacitorApp.addListener('appStateChange', async (state) => {
        if (state.isActive) {
          console.log("App revendue au premier plan, vérification des notifications...");
          await checkAndTriggerNotifications();
        }
      });
    }
  });

  onUnmounted(() => {
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }
  });
}
