import Vue from 'vue';
import Router from 'vue-router';
import About from 'components/About';
// import Blog from 'components/Blog';
import Page404 from 'components/Page404';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/about',
    },
    {
      path: '/about',
      name: 'About',
      component: About,
    },
    // {
    //   path: '/blog',
    //   redirect: '/about',
    //   name: 'Blog',
    //   component: Blog,
    // },
    {
      path: '/404',
      name: 'Page404',
      component: Page404,
    },
    {
      path: '*',
      redirect: '/404',
    },
  ],
});
