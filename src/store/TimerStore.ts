import {defineStore} from 'pinia';
import {DailyTask, TimeEntry, TimerPluginSettings} from "@/types.ts";
import type {TimerService} from '@/obsidian/TimerService.ts';
import {t} from "@/i18n/helpers.ts";
import {COLORS, DEFAULT_SETTINGS} from "@/lib/constants.ts";
import ObsidianTimeTrackerPlugin from "@/index.ts";

export const useTimerStore = defineStore('timerStore', {
    state: () => ({
        entries: [] as TimeEntry[],
        sevenDayEntries: [] as DailyTask[],
        activeEntry: null as TimeEntry | null,
        timerService: null as TimerService | null,
        settings: DEFAULT_SETTINGS as TimerPluginSettings,
    }),
    getters: {
        totalDuration: (state) =>
            state.entries.reduce((acc, entry) => acc + entry.duration, 0) + (state.activeEntry?.duration || 0),
        totalDurationNoActive: (state) =>
            state.entries.reduce((acc, entry) => acc + entry.duration, 0),
    },
    actions: {
        async init(plugin: ObsidianTimeTrackerPlugin): Promise<void> {
            this.timerService = plugin.timerService;
            this.settings = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
            this.entries = await this.timerService.getTodayEntries();
            this.sevenDayEntries = await this.timerService.getRecent7DayEntries();
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
                endTime: 0,
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
                    this.activeEntry = null;
                } else {
                    const created = await this.timerService?.addTimeEntryToDailyNote(newEntry);
                    this.activeEntry = null;
                    this.entries = this.timerService ? await this.timerService.getTodayEntries() : [];
                    if (created) {
                        return true;
                    }
                }
            }
            return false;
        },
        updateActiveDuration() {
            if (this.activeEntry) {
                this.activeEntry.duration = Math.floor((Date.now() - this.activeEntry.startTime) / 1000);
                setTimeout(() => this.updateActiveDuration(), 1000);
            }
        },
    },
});