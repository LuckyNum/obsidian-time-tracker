import {defineStore} from 'pinia';
import {DailyNotesSettings, FileMetadata, Query, TimeEntry, TimerPluginSettings} from "@/types.ts";
import type {TimerService} from '@/obsidian/TimerService.ts';
import {t} from "@/i18n/helpers.ts";
import {COLORS, DEFAULT_SETTINGS} from "@/lib/constants.ts";
import ObsidianTimeTrackerPlugin from "@/index.ts";
import * as LocalForage from "localforage";

export const useTimerStore = defineStore({
    id: 'timerStore',
    state: () => ({
        todayEntries: [] as TimeEntry[],
        activeEntry: null as TimeEntry | null,
        timerService: null as TimerService | null,
        settings: DEFAULT_SETTINGS as TimerPluginSettings,
        dailyNotesSettings: null as DailyNotesSettings | null,
        initialized: false,
        entriesDB: LocalForage,
    }),
    getters: {
        totalDuration: (state) =>
            state.todayEntries.reduce((acc, entry) => acc + entry.duration, 0) + (state.activeEntry?.duration || 0),
        totalDurationNoActive: (state) =>
            state.todayEntries.reduce((acc, entry) => acc + entry.duration, 0),
    },
    actions: {
        async init(plugin: ObsidianTimeTrackerPlugin): Promise<void> {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
            // @ts-ignore
            this.dailyNotesSettings = await plugin.app.internalPlugins.getPluginById('daily-notes').instance.options;
            this.entriesDB = LocalForage.createInstance({
                // @ts-ignore
                name: `obsidiantimetracker/entriesDB/${plugin.app.appId}`,
            });
            this.timerService = plugin.timerService;
            await this.refresh();
        },
        async setEntriesDB(key: string, value: FileMetadata) {
            await this.entriesDB.setItem(key, value);
        },
        async getEntriesDB(key: string): Promise<FileMetadata> {
            return await this.entriesDB.getItem(key) as FileMetadata;
        },
        async removeEntriesDB(key: string) {
            await this.entriesDB.removeItem(key);
        },
        async getTimeRangeEntries(query: Query): Promise<Map<string, TimeEntry[]>> {
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

            for (const path of possiblePaths) {
                const metadata = await this.getEntriesDB(path);
                if (metadata) {
                    const filterTimeEntry = metadata.timeEntry?.filter(item => {
                        let result = true;
                        if (query.includedTags) {
                            result = result && query.includedTags?.includes(item.tag)
                        }
                        if (query.excludedTags) {
                            result = result && !query.excludedTags?.includes(item.tag);
                        }
                        return result;
                    });
                    // @ts-ignore
                    result.set(path, filterTimeEntry);
                }
            }
            return result;
        },
        async refresh() {
            this.todayEntries = await this.getTodayEntries();
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
                    this.todayEntries = await this.getTodayEntries();
                    if (created) {
                        return true;
                    }
                }
            }
            return false;
        },
        async getTodayEntries(): Promise<TimeEntry[]> {
            if (this.initialized) {
                const dailyNotesSettings = useTimerStore().dailyNotesSettings;
                const filePath = `${dailyNotesSettings?.folder}/${window.moment().format(dailyNotesSettings?.format)}.md`
                const metadata = await useTimerStore().getEntriesDB(filePath);
                return metadata.timeEntry || [];
            }
            return [];
        },
        updateActiveDuration() {
            if (this.activeEntry) {
                this.activeEntry.duration = Math.floor((Date.now() - this.activeEntry.startTime) / 1000);
                setTimeout(() => this.updateActiveDuration(), 1000);
            }
        },
    },
});