import {Query, QueryType, TimerPluginSettings} from "@/types.ts";

export const CODEBLOCK_LANG = "time-tracker";

export const DEFAULT_SETTINGS: TimerPluginSettings = {
    dailyNotesFolder: 'Daily Notes',
    timeEntryHeading: '## Day planner',
    timeEntryPrefix: '- [ ]',
    isFirstLine: false,
    enableCelebration: true,
    enableCreateNote: false,
    presetItems: []
};

export const DEFAULT_QUERY: Query = {
    from: '',
    to: '',
    type: QueryType.SUMMARY,
};

export const COLORS = [
    '#4ECDC4', '#45B7D1', '#BA68C8', '#98D8C8', '#FFA07A',
    '#F06292', '#AED581', '#FFD54F', '#4DB6AC', '#7986CB',
    '#9575CD', '#4DD0E1', '#81C784', '#DCE775', '#FFB74D',
    '#F06292', '#FFF176', '#4FC3F7', '#4DB6AC', '#FF6B6B',
];

export const ISODateFormat = "YYYY-MM-DD";