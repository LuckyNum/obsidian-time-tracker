<script setup lang="ts">
import {defineProps, onMounted, ref} from "vue";
import {MarkdownPostProcessorContext} from "obsidian";
import SummaryReport from "@/views/SummaryReport.vue";
import {parse} from "@/reports/parser";
import {DEFAULT_QUERY} from "@/lib/constants.ts";
import {QueryType} from "@/types.ts";
import ListReport from "@/views/ListReport.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const props = defineProps<{
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
}>();

const query = ref(DEFAULT_QUERY);
const ready = ref(false);

onMounted(async () => {
    query.value = await parseQuery(props.source);
    if (query.value.type != QueryType.NULL) {
        ready.value = true;
    }
});

async function parseQuery(source: string) {
    return await parse(source);
}
</script>

<template>
    <SummaryReport
        v-if="ready && query.type === QueryType.SUMMARY"
        :query="query"
    ></SummaryReport>
    <ListReport
        v-else-if="ready && query.type === QueryType.LIST"
        :query="query"
    ></ListReport>
    <LoadingSpinner v-if="!ready"></LoadingSpinner>
</template>

<style scoped>
.container {
    white-space: normal;
}
</style>

