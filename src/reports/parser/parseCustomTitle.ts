import {Parser} from "@/reports/parser/Parser.ts";
import {Keyword, Query, Token, UserInput} from "@/types.ts";
import parseList from "@/reports/parser/parseList.ts";

export class CustomTitleParser extends Parser {
    public parse(tokens: Token[], query: Query): Token[] {
        this.test(tokens, true);

        let _tokens = [...tokens.slice(1)];

        let list: UserInput[];

        try {
            [list, _tokens] = parseList(_tokens, 1);
        } catch (err) {
            console.log(
                '"TITLE" must be followed by a string wrapped in double quotes. For example: \'TITLE "Work Projects"\'',
            );
        }

        // @ts-ignore
        query.customTitle = list[0] as string;

        return _tokens;
    }

    get _acceptedTokens(): Token[] {
        return [Keyword.TITLE];
    }
}
