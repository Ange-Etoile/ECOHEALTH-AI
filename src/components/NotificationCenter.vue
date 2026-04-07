<template>
  <div class="notification-wrapper">
    <v-btn
      icon
      variant="text"
      color="on-surface"
      class="opacity-70 hover:opacity-100 transition-opacity"
      @click="showNotificationPanel = !showNotificationPanel"
    >
      <v-badge
        :content="unreadCount"
        :model-value="unreadCount > 0"
        color="error"
        dot
        offset-x="3"
        offset-y="3"
      >
        <v-icon size="24">{{ unreadCount > 0 ? 'mdi-bell-ring-outline' : 'mdi-bell-outline' }}</v-icon>
      </v-badge>
    </v-btn>

    <v-navigation-drawer
      v-model="showNotificationPanel"
      location="end"
      temporary
      app
      width="380"
      class="notification-drawer border-l border-on-surface/5"
      elevation="10"
    >
      <div class="p-6 border-b border-on-surface/5 bg-surface">
        <div class="flex items-center justify-between mb-1">
          <h2 class="text-xl font-black uppercase tracking-tighter text-primary">Alertes</h2>
          <v-btn 
            icon="mdi-close" 
            variant="text" 
            size="small" 
            @click="showNotificationPanel = false"
          ></v-btn>
        </div>
        <p class="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em]">Surveillance en temps réel</p>
      </div>

      <div class="notification-content custom-scrollbar px-4 py-6">
        <div v-if="notifications.length === 0" class="text-center py-20">
          <v-icon size="64" class="opacity-10 mb-4">mdi-shield-check-outline</v-icon>
          <p class="text-sm font-bold opacity-40 uppercase tracking-widest">Tout est normal</p>
          <p class="text-[10px] opacity-30 mt-1">Aucune menace détectée dans votre zone.</p>
        </div>

        <div v-else class="space-y-4">
          <v-card
            v-for="(notif, index) in notifications"
            :key="'notif-' + index"
            :color="getNotificationColor(notif.data.type)"
            variant="tonal"
            class="rounded-2xl border-none overflow-hidden transition-all hover:scale-[1.02]"
            @click="markAsRead(index)"
          >
            <div class="p-4">
              <div class="flex justify-between items-start mb-2">
                <v-icon :color="getNotificationColor(notif.data.type)" size="20">
                  {{ getNotificationIcon(notif.data.type) }}
                </v-icon>
                <span class="text-[9px] font-black opacity-50 uppercase">{{ formatTime(notif.timestamp) }}</span>
              </div>
              
              <h4 class="text-sm font-black leading-tight mb-1 uppercase tracking-tight">
                {{ notif.title }}
              </h4>
              <p class="text-xs font-medium opacity-80 leading-snug">
                {{ notif.body }}
              </p>
              
              <div class="flex justify-end mt-3">
                <v-btn
                  variant="text"
                  size="x-small"
                  class="text-[10px] font-black opacity-40"
                  @click.stop="removeNotification(index)"
                >Supprimer</v-btn>
              </div>
            </div>
          </v-card>
        </div>
      </div>

      <template v-slot:append>
        <div class="p-4 bg-surface border-t border-on-surface/5">
          <v-btn
            v-if="notifications.length > 0"
            block
            variant="flat"
            color="primary"
            class="rounded-xl font-black uppercase text-xs h-12"
            @click="clearAllNotifications"
          >
            Tout marquer comme lu
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-snackbar
      v-model="showToast"
      :color="toastColor"
      location="top right"
      vertical
      class="mt-14"
    >
      <div class="text-subtitle-2 font-black uppercase tracking-widest mb-1">{{ toastTitle }}</div>
      <p class="text-xs font-medium">{{ toastMessage }}</p>
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showToast = false">Fermer</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getNotificationHistory } from '@/services/notificationService';

const showNotificationPanel = ref(false);
const showToast = ref(false);
const toastTitle = ref('');
const toastMessage = ref('');
const toastColor = ref('info');
const notifications = ref([]);
const readNotifications = ref(new Set());

const unreadCount = computed(() => {
  return notifications.value.filter((_, index) => !readNotifications.value.has(index)).length;
});

const getNotificationColor = (type) => {
  const colorMap = { temperature: 'error', rain: 'info', pm25: 'warning' };
  return colorMap[type] || 'secondary';
};

const getNotificationIcon = (type) => {
  const iconMap = { temperature: 'mdi-thermometer-alert', rain: 'mdi-weather-pouring', pm25: 'mdi-face-mask' };
  return iconMap[type] || 'mdi-alert';
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const loadNotifications = () => {
  const history = getNotificationHistory() || [];
  notifications.value = [...history].sort((a, b) => b.timestamp - a.timestamp);
};

const markAsRead = (index) => { readNotifications.value.add(index); };
const removeNotification = (index) => { notifications.value.splice(index, 1); };
const clearAllNotifications = () => {
  notifications.value.forEach((_, i) => readNotifications.value.add(i));
  showNotificationPanel.value = false;
};

const showNotificationToast = (notif) => {
  toastTitle.value = notif.title;
  toastMessage.value = notif.body;
  toastColor.value = getNotificationColor(notif.data.type);
  showToast.value = true;
};

onMounted(() => {
  loadNotifications();
  setInterval(() => {
    const oldCount = notifications.value.length;
    loadNotifications();
    if (notifications.value.length > oldCount) showNotificationToast(notifications.value[0]);
  }, 5000);
});
</script>

<style scoped>
.notification-drawer {
  background: rgba(var(--v-theme-surface), 0.98) !important;
  backdrop-blur: 10px;
}
.notification-content { height: calc(100vh - 180px); overflow-y: auto; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--v-theme-on-surface), 0.1); border-radius: 10px; }
</style>