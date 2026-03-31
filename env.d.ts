/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// On élargit la déclaration pour inclure les types de thèmes
declare module "vuetify" {
  import { createVuetify } from "vuetify";
  export { createVuetify };
  export { useDisplay, useTheme } from 'vuetify'
  export interface ThemeDefinition {
    dark?: boolean;
    colors?: {
      [key: string]: string | undefined;
      background?: string;
      surface?: string;
      primary?: string;
      secondary?: string;
      success?: string;
      warning?: string;
      error?: string;
      info?: string;
    };
  }
}

declare module "vuetify/components";
declare module "vuetify/directives";
declare module "vuetify/styles";
declare module "@mdi/font/css/materialdesignicons.css";