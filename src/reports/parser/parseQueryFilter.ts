import {Parser} from "@/reports/parser/Parser.ts";
import {FilterMode, Keyword, Query, Token, UserInput} from "@/types.ts";
import parseList from "@/reports/parser/parseList.ts";

export class QueryFilterParser extends Parser {
    parse(tokens: Token[], query: Query): Token[] {
        this.test(tokens, true);
        let _tokens = [...tokens];

        let mode: FilterMode;
        switch (_tokens[0]) {
            case Keyword.INCLUDE:
                mode = FilterMode.INCLUDE;
                break;
            case Keyword.EXCLUDE:
                mode = FilterMode.EXCLUDE;
                break;
            default:
                mode = FilterMode.NULL;
        }
        _tokens.splice(0, 1);

        if (_tokens[0] === Keyword.TAGS) {
            _tokens.splice(0, 1);
        } else {
            query.error = '';
        }

        let list: UserInput[];

        [list, _tokens] = parseList(_tokens);

        let excludedTags: string[] = []
        let includedTags: string[] = []
        list.forEach(item => {
            if (mode == FilterMode.EXCLUDE) {
                excludedTags.push(item as string);
            }
            if (mode == FilterMode.INCLUDE) {
                includedTags.push(item as string);
            }
        })
        query.excludedTags = excludedTags.length > 0 ? excludedTags : query.excludedTags;
        query.includedTags = includedTags.length > 0 ? includedTags : query.includedTags;
        return _tokens;
    }

    get _acceptedTokens() {
        return [Keyword.INCLUDE, Keyword.EXCLUDE, Keyword.TAGS];
    }
}