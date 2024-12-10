export interface TimeEntry {
    id: number;
    title: string;
    tag: string;
    startTime: number;
    endTime: number;
    duration: number;
    color: string;
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

export enum QueryType {
    SUMMARY = "SUMMARY",
    LIST = "LIST",
}

export type ISODate = string;
export type tag = string;
export enum SortOrder {
    /**
     * Order dates in chronological order,
     * or order projects by ascending total time.
     */
    ASC = "ASC",
    /**
     * Order dates in reverse chronological order,
     * or order projects by descending total time.
     */
    DESC = "DESC",
}
export enum GroupBy {
    /** Group list of time entries by client. */
    PROJECT = "PROJECT",
    /** Group list of time entries by project. */
    CLIENT = "CLIENT",
    /** Group list of time entries by date. */
    DATE = "DATE",
}
export interface Query {
    type: QueryType;
    /** Start of query time interval. */
    from: ISODate;
    /** End of query time interval. */
    to: ISODate;
    /** Optional, list of Toggl project IDs or names to include/exclude. */
    projectSelection?: Selection;
    /** Optional, list of Toggl client IDs or names to include/exclude. */
    clientSelection?: Selection;
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
}
/////// report parser type