<template>
  <div id="app" class="app-container">
    <Navbar/>
    <router-view/>
  </div>
</template>

<script>
import Navbar from './components/NavFoo/Navbar.vue'

export default {
  name: 'App',
  components: {
    Navbar,
  }
}
</script>

<style>
.app-container {
  /* padding-top: 50px; */
}
</style>