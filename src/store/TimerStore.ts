import {defineStore} from 'pinia';
import {COLORS, DEFAULT_SETTINGS, TimeEntry, TimerPluginSettings} from "@/types.ts";
import type {TimerService} from '@/obsidian/TimerService.ts';
import {Plugin} from 'obsidian'
import {t} from "@/i18n/helpers.ts";

export const useTimerStore = defineStore('timerStore', {
    state: () => ({
        entries: [] as TimeEntry[],
        activeEntry: null as TimeEntry | null,
        timerService: null as TimerService | null,
        settings: DEFAULT_SETTINGS as TimerPluginSettings
    }),
    getters: {
        totalDuration: (state) =>
            state.entries.reduce((acc, entry) => acc + entry.duration, 0) + (state.activeEntry?.duration || 0),
        totalDurationNoActive: (state) =>
            state.entries.reduce((acc, entry) => acc + entry.duration, 0),
    },
    actions: {
        setEntries(entries: TimeEntry[]) {
            this.entries = entries;
        },
        async init(service: TimerService, plugin: Plugin): Promise<void> {
            this.timerService = service;
            this.settings = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
            await this.refreshToday();
        },
        async refreshToday() {
            if (this.timerService) {
                this.entries = await this.timerService.getTodayEntries();
            }
        },
        async startTimer(title: string, tag: string) {
            this.activeEntry = {
                id: Date.now(),
                title,
                tag,
                startTime: Date.now(),
                duration: 0,
                color: COLORS[(this.entries.length + 1) % COLORS.length],
            };
            this.updateActiveDuration();
        },
        async stopTimer() {
            if (this.activeEntry) {
                const endTime = Date.now();
                const duration = Math.floor((endTime - this.activeEntry.startTime) / 1000);
                const newEntry: TimeEntry = {
                    ...this.activeEntry,
                    endTime,
                    duration,
                    color: '',
                };
                if (duration < 60) {
                    this.timerService?.notice(t('cantAdd'));
                } else {
                    await this.timerService?.addTimeEntryToDailyNote(newEntry);
                }
                this.activeEntry = null;
                await this.refreshToday();
            }
        },
        updateActiveDuration() {
            if (this.activeEntry) {
                this.activeEntry.duration = Math.floor((Date.now() - this.activeEntry.startTime) / 1000);
                setTimeout(() => this.updateActiveDuration(), 1000);
            }
        },
    },
});