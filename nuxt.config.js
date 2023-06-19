import colors from 'vuetify/es5/util/colors'

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  router: {
    middleware: ["auth"],
    extendRoutes(routes, _) {
      routes.push({
        path: '/',
        redirect: '/login' // Redirect the root URL to the login page
      })
    }
  },
  head: {
    titleTemplate: '%s - mobiliAR',
    title: 'mobiliAR',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      { src: 'https://aframe.io/releases/1.4.2/aframe.min.js', mode: 'client' },
      // we import arjs version without NFT but with marker + location based support
      { src: 'https://raw.githack.com/AR-js-org/AR.js/dev/aframe/build/aframe-ar.js', mode: 'client' },
      { src: '/js/gesture-detector.js', mode: 'client' },
      { src: '/js/gesture-handler.js', mode: 'client' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    "@/assets/main.css"
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/aframe-arjs.js', mode: 'client' },
    { src: '~/plugins/maz-ui.js', mode: 'client' },
    { src: '~/plugins/swiper.js', mode: 'client' }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/proxy',
    '@nuxtjs/auth',
    ['cookie-universal-nuxt', { alias: 'cookies' }]
  ],



  axios: {
    proxy: true
  },


  proxy: {
    '/api': {
      target: 'http://localhost:8080', // Change this to your Spring Boot server URL
      // target: 'https://mobiliar-backend.up.railway.app/', // Change this to your Spring Boot server URL
      changeOrigin: true
    }
  },

  auth: {
    redirect: {
      login: '/login',
      logout: '/login',
      home: '/furniture-list'
    },
    strategies: {
      local: {
        scheme: 'refresh',
        token: {
          property: 'access_token',
          maxAge: 7200, // Access token lifetime in seconds
          global: true
        },
        refreshToken: {
          property: 'refresh_token',
          data: 'refresh_token',
          maxAge: 60 * 60 * 24 * 30 // Refresh token lifetime in seconds
        },
        user: {
          property: false,
          autoFetch: false
        },
        endpoints: {
          login: { url: '/api/auth/login', method: 'post' },
          refresh: { url: '/api/auth/refresh', method: 'post', propertyName: 'token' },
          user: { url: '/api/auth/user', method: 'get', propertyName: false},
          logout: false,
          autoFetchUser: true
        }
      }
    },
    resetOnError: true
  },


  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [
      'defu'
    ],
    babel: {
      plugins: [
        [
          'component', {
          libraryName: 'maz-ui',
          styleLibraryName: 'css'
        }
        ]
      ]
    }
  }
}
