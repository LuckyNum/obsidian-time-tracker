<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {Button} from "@/components/ui/button";
import {Input} from '@/components/ui/input'
</script>

<template>
  <main class="@container">
    <Input type="email" placeholder="Email"/>
    <Button>click me</Button>
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        Card Content
      </CardContent>
      <CardFooter>
        Card Footer
      </CardFooter>
    </Card>
  </main>
</template>

<style scoped>
</style>
