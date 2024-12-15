import {moment} from "obsidian";

export function millisecondsToTimeString(ms: number): string {
    const duration = moment.duration(ms);
    return formatSecondDuration(duration);
}

export function secondsToTimeString(seconds: number): string {
    const duration = moment.duration(seconds, 'seconds');
    return formatSecondDuration(duration);
}

export function minuteToTimeString(seconds: number): string {
    const duration = moment.duration(seconds, 'seconds');
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0')
    ].join(':');
}

export function formatSecondDuration(duration: moment.Duration): string {
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].join(':');
}

export function formatMinuteDuration(duration: moment.Duration): string {
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
    ].join(':');
}