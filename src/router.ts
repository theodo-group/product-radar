import { createRouter, createWebHistory } from 'vue-router'
import RadarList from './views/RadarList.vue'
import RadarEditor from './views/RadarEditor.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'list', component: RadarList },
    { path: '/radar/:id', name: 'editor', component: RadarEditor, props: true },
  ],
})
