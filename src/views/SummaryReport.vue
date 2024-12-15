<script setup lang="ts">
import {computed, defineProps, onBeforeUnmount, onMounted, ref} from "vue";
import DonutChart from "@/components/DonutChart.vue";
import BarChart from "@/components/BarChart.vue";
import ProjectSummaryList from "@/components/ProjectSummaryList.vue";
import {ChartData, ProjectSummaryItem, Query, TimeEntry} from "@/types.ts";
import {moment} from "obsidian";
import {minuteToTimeString, secondsToTimeString} from '@/lib/utils.ts'
import {useTimerStore} from "@/store/TimerStore.ts";
import {COLORS} from "@/lib/constants.ts";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

const props = defineProps<{
    query: Query,
}>();

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
    useTimerStore().getTimeRangeEntries(props.query).forEach((timeEntries: TimeEntry[]) => {
        timeEntries.forEach(entry => {
            const duration = calculateDuration(entry.startTime, entry.endTime);
            tagTotals[entry.tag] = (tagTotals[entry.tag] || 0) + duration;
        });
    });
    console.log(11111)
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
    const result: ChartData[] = [];
    useTimerStore().getTimeRangeEntries(props.query).forEach((timeEntries: TimeEntry[], fileName: string) => {
        const totalMinutes = timeEntries.reduce((acc, task) =>
            acc + calculateDuration(task.startTime, task.endTime), 0);

        result.push({
            name: moment(fileName, `${useTimerStore().dailyNotesSettings?.folder}/${useTimerStore().dailyNotesSettings?.format}`).format("ddd MM-DD").replace(" ", "\n"),
            value: totalMinutes / 60,
            displayValue: `${fileName} (${secondsToTimeString(totalMinutes * 60)})`,
        });
    });
    console.log(11111)
    return result.reverse();
}

function getListData(): ProjectSummaryItem[] {
    const tagTotals: Record<string, number> = {};
    let totalMinutes = 0;
    useTimerStore().getTimeRangeEntries(props.query).forEach((timeEntries: TimeEntry[]) => {
        timeEntries.forEach(entry => {
            const duration = calculateDuration(entry.startTime, entry.endTime);
            totalMinutes += duration;
            tagTotals[entry.tag] = (tagTotals[entry.tag] || 0) + duration;
        });
    })
    console.log(11111)
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
    <span class="summary-header">{{ props.query.customTitle }}</span>
    <div ref="widthElement" class="summary-container">
        <BarChart v-if="useTimerStore().initialized && barWidth && getBarData()" :data="getBarData()"
                  :width="barWidth"/>
        <DonutChart
            v-if="useTimerStore().initialized && width >= BREAKPOINT && getPieData()"
            :data="getPieData()"
            :width="DONUT_WIDTH"
        />
    </div>
    <ProjectSummaryList v-if="useTimerStore().initialized && getListData()" :data="getListData()"/>
    <LoadingSpinner v-if="!useTimerStore().initialized"></LoadingSpinner>
</template>

<style scoped>
.summary-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.summary-header {
    font-weight: 600;
    font-size: 1.25rem;
}
</style>