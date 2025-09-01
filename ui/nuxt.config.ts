// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxtjs/tailwindcss'],
  nitro: {
    routeRules: {
      '/log/**': { proxy: 'http://localhost:4000/log/**' },
      '/auth/**': { proxy: 'http://localhost:4000/auth/**' },
      '/pixel/**': { proxy: 'http://localhost:4000/pixel/**' }
    }
  }
})
