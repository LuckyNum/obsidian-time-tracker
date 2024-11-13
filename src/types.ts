export interface TimeEntry {
    id: number;
    title: string;
    tag: string;
    startTime: number;
    endTime?: number;
    duration: number;
    color: string;
}

export interface TimerPluginSettings {
    dailyNotesFolder: string;
    timeEntryHeading: string;
    timeEntryPrefix: '-' | '- [ ]';
}

export const DEFAULT_SETTINGS: TimerPluginSettings = {
    dailyNotesFolder: 'Daily Notes',
    timeEntryHeading: '## Day planner',
    timeEntryPrefix: '-'
};

export const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F06292', '#AED581', '#FFD54F', '#4DB6AC', '#7986CB',
    '#9575CD', '#4DD0E1', '#81C784', '#DCE775', '#FFB74D',
    '#F06292', '#BA68C8', '#4FC3F7', '#4DB6AC', '#FFF176'
];