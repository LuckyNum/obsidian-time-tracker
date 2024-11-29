<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import DonutChart from "@/components/DonutChart.vue";
import BarChart from "@/components/BarChart.vue";
import ProjectSummaryList from "@/components/ProjectSummaryList.vue";
import {ChartData, ProjectSummaryItem} from "@/types.ts";
import {moment} from "obsidian";
import {minuteToTimeString, secondsToTimeString} from '@/lib/utils.ts'
import {useTimerStore} from "@/store/TimerStore.ts";
import {COLORS} from "@/lib/constants.ts";

const widthElement = ref(null);
const width = ref(0);

const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        width.value = entry.contentRect.width;
    }
});

onMounted(async () => {
    if (widthElement.value) {
        resizeObserver.observe(widthElement.value);
    }
})

onBeforeUnmount(() => {
    resizeObserver.disconnect();
});

const BREAKPOINT = 500;
const DONUT_WIDTH = 190;
const barWidth = computed(() => computeBarWidth(width.value));

function computeBarWidth(width: number): number {
    if (width >= BREAKPOINT) {
        return Math.max(0, width - DONUT_WIDTH - 24);
    }
    return width;
}

/**
 * 返回结果为分钟
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
function calculateDuration(startTime: number, endTime: number): number {
    return (endTime - startTime) / 60000;
}

function getPieData(): ChartData[] {
    const tagTotals: Record<string, number> = {};
    useTimerStore().sevenDayEntries.forEach(note => {
        note.tasks.forEach(task => {
            const duration = calculateDuration(task.startTime, task.endTime);
            tagTotals[task.tag] = (tagTotals[task.tag] || 0) + duration;
        });
    });

    return Object.entries(tagTotals).map(([tag, minutes], index): ChartData => {
        return {
            name: tag,
            value: minutes,
            hex: COLORS[index],
            displayValue: `${tag} (${secondsToTimeString(minutes * 60)})`,
        }
    });
}

function getBarData(): ChartData[] {
    return useTimerStore().sevenDayEntries.map(note => {
        const totalMinutes = note.tasks.reduce((acc, task) =>
            acc + calculateDuration(task.startTime, task.endTime), 0);
        return {
            name: moment(note.date).format("ddd MM-DD").replace(" ", "\n"),
            value: totalMinutes / 60,
            displayValue: `${note.date} (${secondsToTimeString(totalMinutes * 60)})`,
        };
    }).reverse();
}

function getListData(): ProjectSummaryItem[] {
    const tagTotals: Record<string, number> = {};
    let totalMinutes = 0;
    useTimerStore().sevenDayEntries.forEach(note => {
        note.tasks.forEach(task => {
            const duration = calculateDuration(task.startTime, task.endTime);
            totalMinutes += duration;
            tagTotals[task.tag] = (tagTotals[task.tag] || 0) + duration;
        });
    });

    return Object.entries(tagTotals)
        .map(([tag, minutes], index): ProjectSummaryItem => ({
            title: tag,
            hex: COLORS[index],
            totalTime: minuteToTimeString(minutes * 60),
            percent: (minutes / totalMinutes) * 100,
        }))
        .sort((a, b) => b.percent - a.percent);
}
</script>

<template>
    <div ref="widthElement" class="summary-container">
        <BarChart v-if="barWidth && getBarData()" :data="getBarData()" :width="barWidth"/>
        <DonutChart
            v-if="width >= BREAKPOINT && getPieData()"
            :data="getPieData()"
            :width="DONUT_WIDTH"
        />
    </div>
    <ProjectSummaryList :data="getListData()"/>
</template>

<style scoped>
.summary-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>