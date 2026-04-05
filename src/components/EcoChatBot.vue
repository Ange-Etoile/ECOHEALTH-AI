<template>
  <div class="fixed bottom-5 right-5 z-[999]">
    <button
      @click="toggleChat"
      class="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-[0_8px_30px_-5px_rgba(var(--v-theme-primary),0.6)] transition-all duration-300 ease-out hover:scale-110 active:scale-95"
    >
      <span v-if="!isOpen" class="absolute inset-0 rounded-2xl bg-primary opacity-30 animate-ping"></span>
      <v-icon size="26">{{ isOpen ? 'mdi-close' : 'mdi-robot-excited-outline' }}</v-icon>
    </button>

    <Transition name="chat-pop">
      <div v-if="isOpen" class="chat-window absolute bottom-[72px] right-0 flex flex-col overflow-hidden rounded-[22px] chat-bg backdrop-blur-2xl border border-outline-variant shadow-2xl">
        <div class="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
        
        <div class="relative flex items-center gap-3 px-5 py-4 border-b border-outline-variant flex-shrink-0">
          <div class="relative w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <v-icon color="primary" size="22">mdi-leaf</v-icon>
          </div>
          <div class="flex-1">
            <h4 class="text-sm font-black chat-text-main leading-none">ECO-AI</h4>
            <span class="text-[10px] text-emerald-500 flex items-center gap-1.5 mt-1 font-bold">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Expert Climat & Santé
            </span>
          </div>
        </div>

        <div ref="chatBox" class="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scroll">
          <TransitionGroup name="msg">
            <div v-for="(msg, i) in messages" :key="i" :class="['flex items-end gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start']">
              <div v-if="msg.role === 'bot'" class="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center mb-1">
                <v-icon color="primary" size="14">mdi-leaf</v-icon>
              </div>
              <div :class="[
                'max-w-[85%] px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap',
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-[16px] rounded-br-[4px]' 
                  : 'chat-bubble-bot rounded-[16px] rounded-bl-[4px] border border-outline-variant'
              ]">
                {{ msg.text }}
              </div>
            </div>
          </TransitionGroup>

          <div v-if="isTyping" class="flex items-end gap-2">
            <div class="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
              <v-icon color="primary" size="14">mdi-leaf</v-icon>
            </div>
            <div class="chat-bubble-bot px-4 py-3 rounded-[16px] rounded-bl-[4px] border border-outline-variant">
              <div class="flex gap-1">
                <span class="typing-dot"></span>
                <span class="typing-dot [animation-delay:0.2s]"></span>
                <span class="typing-dot [animation-delay:0.4s]"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="px-4 pb-4 pt-3 border-t border-outline-variant">
          <div class="flex items-center gap-2 bg-surface-variant/10 border border-outline-variant rounded-xl px-3 py-2 focus-within:border-primary/40">
            <input
              v-model="userInput"
              @keyup.enter="handleSend"
              placeholder="Posez une question sur le climat..."
              class="flex-1 bg-transparent text-[13px] chat-text-main focus:outline-none"
              :disabled="isTyping"
            />
            <button 
              @click="handleSend" 
              :disabled="!userInput.trim() || isTyping"
              class="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-30"
            >
              <v-icon size="16">mdi-send</v-icon>
            </button>
          </div>
          <p class="text-[10px] chat-text-muted text-center mt-2 font-bold tracking-tighter">INDABAX CAMEROON · ANALYSE PRÉDICTIVE 2026</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { sendChatMessage } from '@/services/dataService'

const isOpen = ref(false);
const userInput = ref('');
const isTyping = ref(false);
const chatBox = ref<HTMLElement | null>(null);

const messages = ref([
  { 
    role: 'bot', 
    text: "Bonjour ! Je suis ECO-AI. Je peux analyser les données de 42 villes du Cameroun (2020-2025) et répondre à vos questions sur les risques climatiques. Que souhaitez-vous savoir ?" 
  }
]);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) scrollBottom();
};

const scrollBottom = async () => {
  await nextTick();
  if (chatBox.value) {
    chatBox.value.scrollTo({
      top: chatBox.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

const handleSend = async () => {
  if (!userInput.value.trim() || isTyping.value) return;

  const userMsg = userInput.value;
  messages.value.push({ role: 'user', text: userMsg });
  userInput.value = '';
  isTyping.value = true;
  await scrollBottom();

  try {
    // APPEL API RÉEL
    const data = await sendChatMessage(userMsg);
    
    messages.value.push({
      role: 'bot',
      text: data.response
    });
  } catch (error) {
    messages.value.push({
      role: 'bot',
      text: "Désolé, j'ai une petite difficulté de connexion avec mon cerveau de données. Pouvez-vous réessayer ? ✨"
    });
  } finally {
    isTyping.value = false;
    await scrollBottom();
  }
};
</script>

<style scoped>
/* Conserve tes styles précédents, ils sont parfaits */
.chat-bg {
  background: rgba(var(--v-theme-surface), 0.98);
}
.chat-bubble-bot {
  background: rgba(var(--v-theme-on-surface), 0.05);
}
.chat-text-main { color: rgb(var(--v-theme-on-surface)); }
.chat-text-muted { color: rgb(var(--v-theme-on-surface)); opacity: 0.5; }
.chat-window {
  width: calc(100vw - 40px);
  max-width: 400px;
  height: clamp(450px, 75vh, 600px);
}
.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  animation: bounce 1.4s infinite ease-in-out;
}
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 10px;
}

/* Animations de messages */
.msg-enter-active { transition: all 0.3s ease-out; }
.msg-enter-from { opacity: 0; transform: translateY(15px); }

.chat-pop-enter-active, .chat-pop-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: bottom right;
}
.chat-pop-enter-from, .chat-pop-leave-to {
  opacity: 0;
  transform: scale(0.5) translateY(40px);
}
</style>