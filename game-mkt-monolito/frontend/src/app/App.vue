<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-primary">GAME MKT</h1>
          </div>
          <div class="flex items-center gap-4">
            <router-link to="/" class="text-gray-600 hover:text-gray-900">Dashboard</router-link>
            <router-link to="/command-center" class="text-gray-600 hover:text-gray-900">Command Center</router-link>
            <router-link to="/leads" class="text-gray-600 hover:text-gray-900">Leads</router-link>
            <router-link to="/campaigns" class="text-gray-600 hover:text-gray-900">Campaigns</router-link>
            <router-link to="/bundles" class="text-gray-600 hover:text-gray-900">Bundles</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
</style>
