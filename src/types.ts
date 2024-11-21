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
    enableCelebration: boolean;
    enableCreateNote: boolean;
}

export const DEFAULT_SETTINGS: TimerPluginSettings = {
    dailyNotesFolder: 'Daily Notes',
    timeEntryHeading: '## Day planner',
    timeEntryPrefix: '-',
    enableCelebration: false,
    enableCreateNote: true
};

export const COLORS = [
        '#4ECDC4', '#45B7D1', '#BA68C8', '#98D8C8', '#FFF176',
        '#F06292', '#AED581', '#FFD54F', '#4DB6AC', '#7986CB',
        '#9575CD', '#4DD0E1', '#81C784', '#DCE775', '#FFB74D',
        '#F06292', '#FFA07A', '#4FC3F7', '#4DB6AC', '#FF6B6B',
    ]
;

export enum Keyword {
    // query type keywords
    SUMMARY = "SUMMARY",
    LIST = "LIST",

    // query time interval keywords
    TODAY = "TODAY",
    WEEK = "WEEK",
    MONTH = "MONTH",
    PAST = "PAST",
    DAYS = "DAYS",
    WEEKS = "WEEKS",
    MONTHS = "MONTHS",
    FROM = "FROM",
    TO = "TO",

    // inclusion/exclusion keywords
    INCLUDE = "INCLUDE",
    EXCLUDE = "EXCLUDE",
    PROJECTS = "PROJECTS",
    CLIENTS = "CLIENTS",
    TAGS = "TAGS",

    // Group lists by
    GROUP = "GROUP",
    BY = "BY",
    DATE = "DATE",
    PROJECT = "PROJECT",
    CLIENT = "CLIENT",

    // Sort lists by
    SORT = "SORT",
    ASC = "ASC",
    DESC = "DESC",

    // Customize report
    TITLE = "TITLE",
}

/**
 * User input token in the form of a string or integer.
 */
export type UserInput = string | number;

/**
 * A query language token. Can be a Keyword or a UserInput
 */
export type Token = Keyword | UserInput;

export const ISODateFormat = "YYYY-MM-DD";