export interface TimeEntry {
    id: number;
    title: string;
    tag: string;
    startTime: number;
    endTime: number;
    duration: number;
    color: string;
}

export interface TimerPluginSettings {
    dailyNotesFolder: string;
    timeEntryHeading: string;
    timeEntryPrefix: '-' | '- [ ]';
    isFirstLine: boolean;
    enableCelebration: boolean;
    enableCreateNote: boolean;
}

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

export type UserInput = string | number;

export type Token = Keyword | UserInput;

export interface ChartData {
    name: string;
    value: number;
    hex?: string;
    displayValue?: string;
}

export interface ProjectSummaryItem {
    hex: string;
    title: string;
    client_title?: string;
    totalTime: string;
    percent: number;
}

export interface DailyTask {
    date: string;
    tasks: TimeEntry[];
}

