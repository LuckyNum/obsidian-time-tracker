import {TFile} from "obsidian";

export interface TimeEntry {
    id: number;
    title: string;
    tag: string;
    startTime: number;
    endTime: number;
    duration: number;
    color: string;
    count?: number;
}

export interface PresetItem {
    title: string;
    tag: string;
}

export interface TimerPluginSettings {
    dailyNotesFolder: string;
    timeEntryHeading: string;
    timeEntryPrefix: '-' | '- [ ]';
    isFirstLine: boolean;
    enableCelebration: boolean;
    enableCreateNote: boolean;
    presetItems: PresetItem[];
}

export interface DailyNotesSettings {
    folder: string;
    format: string;
}

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

/////// report parser type
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
    TAGS = "TAGS",
    // Group lists by
    GROUP = "GROUP",
    BY = "BY",
    DATE = "DATE",
    TAG = "TAG",
    // Sort lists by
    SORT = "SORT",
    ASC = "ASC",
    DESC = "DESC",
    // Customize report
    TITLE = "TITLE",
}

export type UserInput = string | number;

export type Token = Keyword | UserInput;

export enum QueryType {
    SUMMARY = "SUMMARY",
    LIST = "LIST",
    NULL = "NULL"
}

export type ISODate = string;
export type tag = string;

export enum SortOrder {
    ASC = "ASC",
    DESC = "DESC",
}

export enum GroupBy {
    TAG = "TAG",
    DATE = "DATE",
}

export enum FilterMode {
    INCLUDE = "INCLUDE",
    EXCLUDE = "EXCLUDE",
    NULL = "NULL",
}

export interface Query {
    type: QueryType;
    /** Start of query time interval. */
    from: ISODate;
    /** End of query time interval. */
    to: ISODate;
    /** Optional, tags to include in the report. */
    includedTags?: tag[];
    /** Optional, tags to exclude in the report. */
    excludedTags?: tag[];
    /** Optional, indicates a sort order for rendered results. */
    sort?: SortOrder;
    /** Optional, indicates a grouping for list reports. */
    groupBy?: GroupBy;
    /** User-defined title for the rendered report. */
    customTitle?: string;
    error?: string;
}

/////// report parser type

export interface FileMetadata {
    path: string;
    mtime: number;
    frontmatter?: any;
    tags?: string[];
    links?: string[];
    content?: string;
    headers?: string[];
    timeEntry?: TimeEntry[];
}

export type EntryChangeCallback = (type: string, file: TFile) => void;