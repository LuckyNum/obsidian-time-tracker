import {Parser} from "@/reports/parser/Parser.ts";
import {Keyword, Query, QueryType, Token} from "@/types.ts";

export class QueryTypeParser extends Parser {
    parse(tokens: Token[], query: Query): Token[] {
        this.test(tokens, true);

        const queryTypeToken = tokens[0];

        switch (queryTypeToken) {
            case Keyword.SUMMARY:
                query.type = QueryType.SUMMARY;
                break;
            case Keyword.LIST:
                query.type = QueryType.LIST;
                break;
        }

        return [...tokens].slice(1);
    }

    get _acceptedTokens() {
        return [Keyword.SUMMARY, Keyword.LIST];
    }
}