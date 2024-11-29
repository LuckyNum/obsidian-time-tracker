<template>
    <div class="time-entry-list">
        <div class="time-entry-group-header">
            <div class="header-left">
                <span>标签</span>
            </div>
            <div class="header-right">
                <div class="header-right-item time">时间</div>
                <div class="header-right-item percent">占比</div>
            </div>
        </div>
        <div class="group-items">
            <div v-for="d in data" :key="d.title" class="group-item">
                <div class="item-left">
                    <div v-if="d.hex" class="project-circle" :style="{ backgroundColor: d.hex }"></div>
                    <span>{{ d.title || '(无数据)' }}</span>
                </div>
                <div class="item-right">
                    <div class="group-item-time time">{{ d.totalTime }}</div>
                    <div class="group-item-time percent">{{ d.percent.toFixed(1) }}%</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ProjectSummaryItem} from "@/types.ts";

defineProps<{
    data: ProjectSummaryItem[];
}>();
</script>

<style scoped>
.time-entry-list {
    width: 100%;
}

.time-entry-group-header {
    display: flex;
    justify-content: space-between;
    padding-bottom: 0.25rem;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid var(--interactive-accent);
}

.header-left, .header-right,
.item-left, .item-right {
    display: flex;
    align-items: center;
}

.header-left, .item-left {
    flex: 1;
    min-width: 0;
}

.header-right, .item-right {
    display: flex;
    justify-content: flex-end;
}

.header-right-item,
.group-item-time {
    text-align: right;
}

.time {
    width: 6rem;
}

.percent {
    width: 4rem;
}

.group-items {
    display: flex;
    flex-direction: column;
}

.group-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.project-circle {
    flex-shrink: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 0.5rem;
}

.item-left span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

@media (max-width: 640px) {
    .percent {
        display: none;
    }
}
</style>

