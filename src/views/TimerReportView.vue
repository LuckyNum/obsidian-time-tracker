<script setup lang="ts">
import {defineProps, onMounted} from "vue";
import {MarkdownPostProcessorContext, moment} from "obsidian";
import {ISODateFormat, Keyword, Token} from "@/types.ts";
import BarChart from "@/views/BarChart.vue";

const props = defineProps<{
    source: string,
    ctx: MarkdownPostProcessorContext
}>();

onMounted(async () => {
    parseQuery(props.source)
})

function parseQuery(source: string) {
    const tokens = tokenize(source);
    console.log(tokens)
    const title = getTitle(tokens);
    console.log(title)
    return title
}

function tokenize(query: string): Token[] {
    // @ts-ignore split into array of tokens
    let match: RegExpMatchArray | [] = query.match(
        /(?:[^\s"',]+|"[^"]*"|'[^']*')+/g,
    );
    match = match || [];

    // only use double quotes to signify user-strings
    for (const i in match) {
        match[i] = match[i].replace(/[']+/g, '"');
    }

    // Validate tokens
    const results: Token[] = [];
    for (const token of match) {
        if (
            !(token.toUpperCase() in Keyword) && // a keyword
            !/".*"/g.test(token) && // a string
            !/\d{4}-\d{2}-\d{2}/g.test(token) && // a ISO-formatted date
            !/(#.*)/g.test(token) && // a tag of the format "#tag"
            !/^\d+$/g.test(token) // an integer (for project or client IDs)
        ) {
            console.log('error keyword: ', token)
        }

        if (/^\d+$/g.test(token)) {
            // Convert to number type
            results.push(parseInt(token));
        } else if (/(#.*)/g.test(token)) {
            // Normalize all tags to lowercase, remove pound sign
            results.push(token.slice(1).toLowerCase());
        } else if (!/".*"/g.test(token)) {
            // Uppercase all non-string tokens for normalization
            results.push(token.toUpperCase());
        } else {
            results.push(token);
        }
    }

    return results;
}

function getTitle(tokens: Token[]): string {
    switch (tokens[1]) {
        case Keyword.TODAY:
            return "Today";
        case Keyword.WEEK:
            return "This week";
        case Keyword.MONTH:
            return "This month";
        case Keyword.FROM:
            return `${tokens[2]} to ${(tokens[4] as string).toLowerCase()}`;
        case Keyword.PAST:
            return `Past ${tokens[2]} ${(<string>tokens[3]).toLowerCase()}`;
        default:
            const defaultDate = moment(tokens[1], ISODateFormat, true);
            if (defaultDate.isValid()) {
                return defaultDate.format("LL");
            }
            return "Untitled Toggl Report";
    }
}
</script>

<template>
    <BarChart :title="parseQuery(props.source)"></BarChart>
</template>

<style scoped>

</style>