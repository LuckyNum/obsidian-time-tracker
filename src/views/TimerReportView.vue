<script setup lang="ts">
import {defineProps, onMounted, ref,} from "vue";
import {MarkdownPostProcessorContext} from "obsidian";
import SummaryReport from "@/views/SummaryReport.vue";
import {parse} from "@/reports/parser";

const props = defineProps<{
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
}>();

const title = ref('');

onMounted(async () => {
    title.value = parseQuery(props.source).customTitle || '';
})

function parseQuery(source: string) {
    return parse(source)
}
</script>

<template>
    <div class="container">
        <SummaryReport :title="title"></SummaryReport>
    </div>
</template>

<style scoped>
.container {
    white-space: normal;
}
</style>