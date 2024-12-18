<script setup lang="ts">
import {defineProps, onMounted, ref} from "vue";
import SummaryReport from "@/views/SummaryReport.vue";
import {Query, QueryType} from "@/types.ts";
import ListReport from "@/views/ListReport.vue";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import {MarkdownPostProcessorContext} from "obsidian";
import {parse} from "@/reports/parser";

const props = defineProps<{
    source: string,
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext
}>();

const query = ref<Query>({from: "", to: "", type: QueryType.NULL});

onMounted(async () => {
    query.value = await parse(props.source);
})
</script>

<template>
    <SummaryReport
        v-if="query.type === QueryType.SUMMARY"
        :query="query"
    ></SummaryReport>
    <ListReport
        v-else-if="query.type === QueryType.LIST"
        :query="query"
    ></ListReport>
    <LoadingSpinner v-else></LoadingSpinner>
</template>

<style scoped>
.container {
    white-space: normal;
}
</style>

