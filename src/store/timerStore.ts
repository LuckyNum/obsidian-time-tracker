import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import type {TimerService} from '@/obsidian/TimerService.ts';
import {COLORS, TimeEntry} from "@/types.ts";

export const useTimerStore = defineStore('timer', () => {
    // 状态
    const entries = ref<TimeEntry[]>([]);
    const activeEntry = ref<TimeEntry | null>(null);
    const obsidianService = ref<TimerService | null>(null);

    // 计算属性
    const totalDuration = computed(() =>
        entries.value.reduce((acc, entry) => acc + entry.duration, 0) + (activeEntry.value?.duration || 0)
    );

    // 方法
    async function init(service: TimerService) {
        obsidianService.value = service;
        await refreshToday();
    }

    async function refreshToday() {
        if (obsidianService.value) {
            entries.value = await obsidianService.value.getTodayEntries();
        }
    }

    async function startTimer(title: string, tag: string) {
        activeEntry.value = {
            id: Date.now(),
            title,
            tag,
            startTime: Date.now(),
            duration: 0,
            color: COLORS[entries.value.length + 1 % COLORS.length],
        };
        updateActiveDuration();
    }

    async function stopTimer() {
        if (activeEntry.value) {
            const endTime = Date.now();
            const duration = Math.floor((endTime - activeEntry.value.startTime) / 1000);
            const newEntry: TimeEntry = {
                ...activeEntry.value,
                endTime,
                duration,
                color: '',
            };
            await obsidianService.value?.addTimeEntryToDailyNote(newEntry);
            activeEntry.value = null;
            await refreshToday();
        }
    }

    function updateActiveDuration() {
        if (activeEntry.value) {
            activeEntry.value.duration = Math.floor((Date.now() - activeEntry.value.startTime) / 1000);
            setTimeout(updateActiveDuration, 1000);
        }
    }

    return {
        entries,
        activeEntry,
        obsidianService,
        totalDuration,
        init,
        refreshToday,
        startTimer,
        stopTimer,
    };
});