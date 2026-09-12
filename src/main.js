import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import NavbarComponent from './components/NavbarComponent.vue'
import FooterComponent from './components/FooterComponent.vue'

const app = createApp(App).use(router);

app.component("NavbarComponent", NavbarComponent);
app.component("FooterComponent", FooterComponent);

app.mount('#app');
