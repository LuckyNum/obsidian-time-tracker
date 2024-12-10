import {Keyword, Token} from "@/types.ts";

export function tokenize(query: string): Token[] {
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