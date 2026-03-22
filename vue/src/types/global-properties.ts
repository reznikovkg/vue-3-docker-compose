import { ROUTES } from '@/router'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $routes: typeof ROUTES
  }
}