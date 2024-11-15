<script setup lang="ts">
import {defineProps} from 'vue';
import {storeToRefs} from 'pinia';
import {Play, Pause} from 'lucide-vue-next';
import {useTimerStore} from '@/store/TimerStore';
import type {TimerService} from '@/obsidian/TimerService';
import confetti from 'canvas-confetti';
import {COLORS} from "@/types.ts";
import {t} from '@/i18n/helpers.ts'

const props = defineProps<{
    timerService: TimerService
}>();

const timerStore = useTimerStore();
const {entries, activeEntry, totalDuration, totalDurationNoActive, settings} = storeToRefs(timerStore);

const getEntryColor = (index: number) => {
    return COLORS[index % COLORS.length];
};

const formatActiveTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}${t('hour')}${minutes.toString().padStart(2, '0')}${t('minute')}${secs.toString().padStart(2, '0')}${t('second')}`;
};

const formatEntryTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const toggleTimer = async () => {
    if (activeEntry.value) {
        await timerStore.stopTimer();
        if (settings.value.enableCelebration) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: {y: 0.6}
            });
        }
    } else {
        const result = await props.timerService.showNewEntryDialog();
        if (result) {
            await timerStore.startTimer(result.title, result.tag);
        }
    }
};
</script>

<template>
    <div class="timer-container">
        <div class="timer-header">
            <div class="timer-info">
                <h2 class="timer-title">
                    {{ activeEntry ? activeEntry.title : t('noActive') }}
                </h2>
                <p class="timer-subtitle" v-if="!activeEntry">
                    {{ t('start') }}
                </p>
                <p class="timer-subtitle" v-else>
                    <span class="timer-tag" :style="{ backgroundColor: getEntryColor(entries.length) }">
                        {{ activeEntry.tag || t('noTag') }}
                    </span> ·
                    {{ formatActiveTime(activeEntry.duration) }}
                </p>
            </div>
            <button
                @click="toggleTimer"
                class="timer-button"
                :class="{ 'active': activeEntry }"
            >
                <Play v-if="!activeEntry" class="timer-icon"/>
                <Pause v-else class="timer-icon"/>
            </button>
        </div>

        <div class="timer-summary">
            <div class="timer-summary-header">
                <h3 class="timer-summary-title">{{ t('today') }}</h3>
                <span class="timer-summary-total">{{ formatTotalTime(totalDuration) }}</span>
            </div>

            <div class="timer-progress-bar">
                <div
                    v-for="(entry, index) in entries"
                    :key="entry.id"
                    :style="{
                        width: `${(entry.duration / totalDurationNoActive) * 100}%`,
                        backgroundColor: getEntryColor(index)
                    }"
                    class="timer-progress-segment"
                ></div>
            </div>

            <div v-if="entries.length > 0" class="timer-entries-list">
                <div
                    v-for="(entry, index) in entries"
                    :key="entry.id"
                    class="timer-entry"
                >
                    <div class="timer-entry-info">
                        <div
                            class="timer-entry-color"
                            :style="{ backgroundColor: getEntryColor(index) }"
                        ></div>
                        <span class="timer-entry-title">{{ entry.title }}</span>
                        <span v-if="entry.tag" class="timer-entry-tag">{{ entry.tag }}</span>
                    </div>
                    <span class="timer-entry-duration">{{ formatEntryTime(entry.duration) }}</span>
                </div>
            </div>
            <div v-else class="timer-no-entries">
                {{ t('noEntries') }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.timer-container {
    padding: 16px;
    background-color: transparent;
    position: relative;
    overflow: hidden;
}

.timer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.timer-info {
    flex-grow: 1;
}

.timer-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-normal);
    margin: 0;
}

.timer-subtitle {
    font-size: 14px;
    color: var(--text-muted);
    margin: 4px 0 0 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.timer-tag {
    color: var(--text-on-accent);
    background-color: var(--interactive-accent);
    padding: 2px 6px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
    opacity: 0.9;
    transition: opacity 0.2s ease;
}

.timer-tag:hover {
    opacity: 1;
}

.timer-button {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--interactive-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    outline: none;
    transition: background-color 0.3s ease;
}

.timer-button:hover {
    background-color: var(--interactive-accent-hover);
}

.timer-icon {
    width: 24px;
    height: 24px;
    color: var(--text-on-accent);
}

.timer-summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.timer-summary-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-normal);
    margin: 0;
}

.timer-summary-total {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-normal);
}

.timer-progress-bar {
    height: 20px;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    margin-bottom: 16px;
    background-color: var(--background-secondary);
}

.timer-progress-segment {
    height: 100%;
    transition: width 0.3s ease;
}

.timer-entries-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.timer-entry {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2px;
}

.timer-entry-info {
    display: flex;
    align-items: center;
}

.timer-entry-color {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

.timer-entry-title {
    font-size: 14px;
    color: var(--text-normal);
}

.timer-entry-tag {
    font-size: 11px;
    color: var(--text-muted);
    background-color: var(--background-modifier-border);
    padding: 1px 5px;
    border-radius: 10px;
    opacity: 0.8;
    transition: opacity 0.2s ease;
}

.timer-entry-tag:hover {
    opacity: 1;
}

.timer-entry-duration {
    font-size: 14px;
    color: var(--text-muted);
}

.timer-no-entries {
    text-align: center;
    color: var(--text-muted);
    font-size: 14px;
    font-style: italic;
    padding: 16px;
    background-color: var(--background-secondary);
    border-radius: 4px;
}
</style>