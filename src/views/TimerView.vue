<template>
    <div class="timer-container">
        <div class="timer-header">
            <div class="timer-info">
                <h2 class="timer-title" :class="{ 'active': activeEntry }">
                    {{ activeEntry ? activeEntry.title : '无活动计时' }}
                </h2>
                <p class="timer-subtitle" :class="{ 'active': activeEntry }">
                    {{
                        activeEntry ? `${activeEntry.tag || '无标签'} · ${formatActiveTime(activeEntry.duration)}` : '点击开始新计时'
                    }}
                </p>
            </div>
            <button
                @click="toggleTimer"
                class="timer-button"
                :class="{ 'active': activeEntry }"
            >
                <Transition name="fade" mode="out-in">
                    <Play v-if="!activeEntry" key="play" class="timer-icon"/>
                    <Pause v-else key="pause" class="timer-icon"/>
                </Transition>
            </button>
        </div>

        <div class="timer-summary">
            <div class="timer-summary-header">
                <h3 class="timer-summary-title">今日</h3>
                <span class="timer-summary-total">{{
                        formatTotalTime(totalDuration)
                    }}</span>
            </div>

            <div class="timer-progress-bar">
                <div
                    v-for="entry in entries"
                    :key="entry.id"
                    :style="{
                    width: `${(entry.duration / totalDuration) * 100}%`,backgroundColor: entry.color}"
                    class="timer-progress-segment"
                ></div>
            </div>

            <div v-if="entries.length > 0" class="timer-entries-list">
                <div
                    v-for="entry in entries"
                    :key="entry.id"
                    class="timer-entry"
                >
                    <div class="timer-entry-info">
                        <div
                            class="timer-entry-color"
                            :style="{ backgroundColor: entry.color }"
                        ></div>
                        <span class="timer-entry-title">{{ entry.title }}</span>
                        <span v-if="entry.tag" class="timer-entry-tag">{{ entry.tag }}</span>
                    </div>
                    <span class="timer-entry-duration">{{ formatEntryTime(entry.duration) }}</span>
                </div>
            </div>
            <div v-else class="timer-no-entries">
                今日无记录
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {onMounted} from 'vue';
import {storeToRefs} from 'pinia';
import {Play, Pause} from 'lucide-vue-next';
import {useTimerStore} from '@/store/timerStore';
import type {TimerService} from '@/obsidian/TimerService';

const props = defineProps<{
    obsidianService: TimerService
}>();

const timerStore = useTimerStore();
const {entries, activeEntry, totalDuration} = storeToRefs(timerStore);

onMounted(async () => {
    await timerStore.init(props.obsidianService);
});

// Format active timer: HH:mm:ss
const formatActiveTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Format total time: HH时mm分ss秒
const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}时${minutes.toString().padStart(2, '0')}分${secs.toString().padStart(2, '0')}秒`;
};

// Format entry time: HH:mm
const formatEntryTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const toggleTimer = async () => {
    if (activeEntry.value) {
        await timerStore.stopTimer();
    } else {
        const result = await props.obsidianService.showNewEntryDialog();
        if (result) {
            await timerStore.startTimer(result.title, result.tag);
        }
    }
};
</script>

<style scoped>
.timer-container {
    padding: 4px;
    max-width: 400px;
    margin: 0 auto;
}

.timer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.timer-info {
    transition: all 0.3s ease;
}

.timer-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-normal);
    margin: 0;
    transition: all 0.3s ease;
}

.timer-title.active {
    color: var(--interactive-accent);
}

.timer-subtitle {
    font-size: 13px;
    color: var(--text-muted);
    margin: 2px 0 0 0;
    transition: all 0.3s ease;
}

.timer-subtitle.active {
    color: var(--interactive-accent);
}

.timer-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: var(--interactive-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    outline: none;
}

.timer-button:hover {
    background-color: var(--interactive-accent-hover);
    transform: scale(1.05);
}

.timer-button.active {
    background-color: var(--text-error);
}

.timer-icon {
    width: 20px;
    height: 20px;
    color: var(--text-on-accent);
}

.timer-summary {
    background-color: var(--background-primary);
    border-radius: 8px;
    padding: 12px;
}

.timer-summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.timer-summary-title {
    font-size: 16px;
    font-weight: 500;
    color: var(--text-normal);
    margin: 0;
}

.timer-summary-total {
    font-size: 14px;
    color: var(--text-muted);
}

.timer-progress-bar {
    height: 10px;
    background-color: var(--background-secondary);
    border-radius: 2px;
    overflow: hidden;
    display: flex;
    margin-bottom: 12px;
}

.timer-progress-segment {
    height: 100%;
    transition: width 0.3s ease;
}

.timer-entries-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.timer-entry {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.timer-entry-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.timer-entry-color {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}

.timer-entry-title {
    font-size: 13px;
    color: var(--text-normal);
}

.timer-entry-tag {
    font-size: 12px;
    color: var(--text-muted);
    background-color: var(--background-secondary);
    padding: 1px 6px;
    border-radius: 4px;
}

.timer-entry-duration {
    font-size: 13px;
    color: var(--text-muted);
}

.timer-no-entries {
    text-align: center;
    color: var(--text-muted);
    font-size: 13px;
    font-style: italic;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>