import {defineStore} from 'pinia';
import {DailyNotesSettings, FileMetadata, Query, TimeEntry, TimerPluginSettings} from "@/types.ts";
import type {TimerService} from '@/obsidian/TimerService.ts';
import {t} from "@/i18n/helpers.ts";
import {COLORS, DEFAULT_SETTINGS} from "@/lib/constants.ts";
import ObsidianTimeTrackerPlugin from "@/index.ts";

export const useTimerStore = defineStore({
    id: 'timerStore',
    state: () => ({
        todayEntries: [] as TimeEntry[],
        allEntries: new Map() as Map<string, FileMetadata>,
        activeEntry: null as TimeEntry | null,
        timerService: null as TimerService | null,
        settings: DEFAULT_SETTINGS as TimerPluginSettings,
        dailyNotesSettings: null as DailyNotesSettings | null,
        initialized: false
    }),
    getters: {
        totalDuration: (state) =>
            state.todayEntries.reduce((acc, entry) => acc + entry.duration, 0) + (state.activeEntry?.duration || 0),
        totalDurationNoActive: (state) =>
            state.todayEntries.reduce((acc, entry) => acc + entry.duration, 0),
    },
    actions: {
        getTimeRangeEntries(query: Query): Map<string, TimeEntry[]> {
            const result = new Map<string, TimeEntry[]>();
            // @ts-ignore
            if (!query.from || !query.to || !this.dailyNotesSettings) {
                return result;
            }
            const fromDate = window.moment(query.from).startOf('day');
            const toDate = window.moment(query.to).endOf('day');

            // 生成日期范围内的所有可能文件路径
            const possiblePaths = new Set<string>();
            let currentDate = fromDate.clone();

            while (currentDate.isSameOrBefore(toDate)) {
                const filePath = `${this.dailyNotesSettings.folder}/${currentDate.format(this.dailyNotesSettings.format)}.md`;
                possiblePaths.add(filePath);
                currentDate.add(1, 'day');
            }

            // 遍历 allEntries，只检查可能的文件路径
            for (const [filePath, metadata] of this.allEntries.entries()) {
                if (possiblePaths.has(filePath)) {
                    if (metadata.timeEntry && metadata.timeEntry.length > 0) {
                        result.set(filePath, metadata.timeEntry);
                    }
                }
            }
            return result;
        },
        async init(plugin: ObsidianTimeTrackerPlugin): Promise<void> {
            this.timerService = plugin.timerService;
            this.settings = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
            this.todayEntries = await this.timerService.getTodayEntries();
            // @ts-ignore
            this.dailyNotesSettings = await this.timerService?.plugin.app.internalPlugins.getPluginById('daily-notes').instance.options;
        },
        async refreshToday() {
            if (this.timerService) {
                this.todayEntries = await this.timerService.getTodayEntries();
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
                color: COLORS[(this.todayEntries.length + 1) % COLORS.length],
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
                    this.todayEntries = this.timerService ? await this.timerService.getTodayEntries() : [];
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