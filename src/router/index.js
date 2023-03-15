import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../views/LoginView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'login',
    component: Login
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/inicial',
    name: 'inicial',
    component: () => import(/* webpackChunkName: "principal" */ '../views/InicialView.vue')
  },
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  if (localStorage.getItem('token') == 'null' && to.path == '/inicial')
      next('/')
  else
      next()
})

export default router
