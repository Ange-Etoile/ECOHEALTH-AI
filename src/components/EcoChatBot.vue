<template>
  <div class="fixed bottom-5 right-5 z-[999]">

    <!-- Toggle button -->
    <button
      @click="toggleChat"
      class="
        relative flex items-center justify-center
        w-14 h-14 rounded-2xl
        bg-primary text-white
        shadow-[0_8px_30px_-5px_rgba(var(--v-theme-primary),0.6)]
        transition-all duration-300 ease-out
        hover:scale-110 hover:shadow-[0_12px_35px_-5px_rgba(var(--v-theme-primary),0.7)]
        active:scale-95
      "
    >
      <span
        v-if="!isOpen"
        class="absolute inset-0 rounded-2xl bg-primary opacity-30 animate-ping"
      ></span>
      <v-icon size="26">{{ isOpen ? 'mdi-close' : 'mdi-robot-excited-outline' }}</v-icon>
    </button>
    <Transition name="chat-pop">
      <div
        v-if="isOpen"
        class="
          chat-window
          absolute bottom-[72px] right-0
          flex flex-col overflow-hidden
          rounded-[22px]
          bg-[#0d0f18]/98 backdrop-blur-2xl
          border border-white/[0.08]
          shadow-[0_24px_70px_-10px_rgba(0,0,0,0.7),0_0_0_1px_rgba(var(--v-theme-primary),0.12)]
        "
      >
        <div class="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60 rounded-t-[22px]"></div>
        <div class="relative flex items-center gap-3 px-5 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div class="absolute left-4 w-10 h-10 rounded-xl bg-primary/30 blur-xl"></div>

          <div class="relative w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <v-icon color="primary" size="22">mdi-leaf</v-icon>
          </div>

          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-black text-white leading-none tracking-tight">ECO-AI</h4>
            <span class="text-[10px] text-emerald-400 flex items-center gap-1.5 mt-1 font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
              En ligne
            </span>
          </div>

          <button
            @click="toggleChat"
            class="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center text-white/40 transition-all duration-200 hover:text-white hover:bg-white/10 flex-shrink-0"
          >
            <v-icon size="16">mdi-close</v-icon>
          </button>
        </div>
        <div
          ref="chatBox"
          class="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scroll min-h-0"
        >
          <TransitionGroup name="msg">
            <div
              v-for="(msg, i) in messages"
              :key="i"
              :class="['flex items-end gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start']"
            >
              <div
                v-if="msg.role === 'bot'"
                class="w-6 h-6 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center flex-shrink-0 mb-0.5"
              >
                <v-icon color="primary" size="14">mdi-leaf</v-icon>
              </div>

              <div
                :class="[
                  'max-w-[78%] px-4 py-2.5 text-[13px] leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-[16px] rounded-br-[4px] shadow-[0_4px_15px_-3px_rgba(var(--v-theme-primary),0.4)]'
                    : 'bg-white/[0.06] text-white/85 rounded-[16px] rounded-bl-[4px] border border-white/[0.07]'
                ]"
              >
                {{ msg.text }}
              </div>
            </div>
          </TransitionGroup>
          <Transition name="msg">
            <div v-if="isTyping" class="flex items-end gap-2 justify-start">
              <div class="w-6 h-6 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <v-icon color="primary" size="14">mdi-leaf</v-icon>
              </div>
              <div class="bg-white/[0.06] border border-white/[0.07] px-4 py-3 rounded-[16px] rounded-bl-[4px]">
                <div class="flex gap-1 items-center h-4">
                  <span class="typing-dot"></span>
                  <span class="typing-dot [animation-delay:0.2s]"></span>
                  <span class="typing-dot [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
        <div class="px-4 pb-4 pt-3 border-t border-white/[0.06] flex-shrink-0">
          <div class="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 transition-all duration-200 focus-within:border-primary/40 focus-within:bg-primary/[0.04]">
            <input
              v-model="userInput"
              @keyup.enter="sendMessage"
              placeholder="Posez une question…"
              class="flex-1 bg-transparent text-[13px] text-white placeholder-white/25 focus:outline-none min-w-0"
            />
            <button
              @click="sendMessage"
              :disabled="!userInput.trim() || isTyping"
              class="
                flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0
                bg-primary text-white
                transition-all duration-200
                hover:brightness-110 hover:scale-105
                active:scale-95
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
              "
            >
              <v-icon size="16">mdi-send</v-icon>
            </button>
          </div>
          <p class="text-[10px] text-white/15 text-center mt-2">ECO-AI · 2026</p>
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const isOpen = ref(false)
const userInput = ref('')
const isTyping = ref(false)
const chatBox = ref<HTMLElement | null>(null)

const messages = ref([
  { role: 'bot', text: "Bonjour ! Je suis ECO-AI. Comment puis-je vous aider à préserver l'environnement aujourd'hui ?" }
])

const toggleChat = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) scrollBottom()
}

const scrollBottom = async () => {
  await nextTick()
  if (chatBox.value) {
    chatBox.value.scrollTop = chatBox.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isTyping.value) return

  messages.value.push({ role: 'user', text: userInput.value })
  const tempInput = userInput.value
  userInput.value = ''
  await scrollBottom()

  isTyping.value = true
  await scrollBottom()

  setTimeout(async () => {
    isTyping.value = false
    messages.value.push({
      role: 'bot',
      text: `Bonne question sur "${tempInput}". En tant qu'IA d'EcoHealth, je recommande d'agir localement pour maximiser l'impact sur la biodiversité.`
    })
    await scrollBottom()
  }, 2000)
}
</script>

<style scoped>
.chat-window {
  width: calc(100vw - 40px);
  max-width: 380px;
  height: clamp(420px, 65vh, 540px);
}

@media (max-width: 400px) {
  .chat-window {
    right: -8px;
    width: calc(100vw - 24px);
    height: 70svh;
    border-radius: 20px;
  }
}
.chat-pop-enter-active,
.chat-pop-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom right;
}
.chat-pop-enter-from,
.chat-pop-leave-to {
  opacity: 0;
  transform: scale(0.88) translateY(16px);
}
.msg-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.msg-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.96);
}
.typing-dot {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  animation: bounce 1s infinite ease-in-out;
}
@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40%            { transform: translateY(-5px); opacity: 1; }
}
.custom-scroll::-webkit-scrollbar { width: 3px; }
.custom-scroll::-webkit-scrollbar-track { background: transparent; }
.custom-scroll::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.2);
  border-radius: 10px;
}
</style>