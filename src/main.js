import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
//import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
//import NProgress from 'nprogress'
//import 'nprogress/nprogress.css'
import routes from './routes'
// import Mock from './mock'
//禁用mock mock不会拦截请求
// Mock.bootstrap();
import 'font-awesome/css/font-awesome.min.css'
import  axios from 'axios'

// 引用axios，并设置基础URL为后端服务api地址
axios.defaults.baseURL = 'http://localhost:1299/services'  //对应后端网关统一地址 基本的url 后端的所有请求都会拼接这个前缀
// 将API方法绑定到全局  /plat/login
Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)



//NProgress.configure({ showSpinner: false });
//路由镜像
const router = new VueRouter({
  routes
})
//每次路由之前做的事情
router.beforeEach((to, from, next) => {
  //NProgress.start();
    // 如果跳转到登录界面，从前端session中删除存储的用户信息
  if (to.path == '/login') {
    sessionStorage.removeItem('user');
  }
  let user = JSON.parse(sessionStorage.getItem('user'));
  if (!user && to.path != '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
})

//router.afterEach(transition => {
//NProgress.done();
//});

new Vue({
  //el: '#app',
  //template: '<App/>',
  router,
  store,
  //components: { App }
  render: h => h(App)
}).$mount('#app')

