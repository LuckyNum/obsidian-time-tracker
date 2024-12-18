import {tokenize} from "@/reports/parser/Tokenize.ts";
import {QueryTypeParser} from "@/reports/parser/parseQueryType.ts";
import {Query, QueryType} from "@/types.ts";
import {QueryIntervalParser} from "@/reports/parser/parseQueryInterval.ts";
import {QueryTitleParser} from "@/reports/parser/parseQueryTitle.ts";
import {SortParser} from "@/reports/parser/parseSort.ts";
import {GroupByParser} from "@/reports/parser/parseGroupBy.ts";
import {CustomTitleParser} from "@/reports/parser/parseCustomTitle.ts";
import {QueryFilterParser} from "@/reports/parser/parseQueryFilter.ts";

export async function parse(queryString: string) {
    let tokens = tokenize(queryString);
    const query: Query = {
        from: '',
        to: '',
        type: QueryType.NULL,
    };
    // 0、默认标题
    tokens = new QueryTitleParser().parse(tokens, query);
    // 1、类型
    tokens = new QueryTypeParser().parse(tokens, query);
    // 2、时间范围
    tokens = new QueryIntervalParser().parse(tokens, query);
    // 3、过滤
    const filterParser = new QueryFilterParser();
    while (filterParser.test(tokens)) {
        tokens = filterParser.parse(tokens, query);
    }
    // 4、排序分组
    const groupByParser = new GroupByParser();
    const sortParser = new SortParser();
    tokens = groupByParser.test(tokens) ? groupByParser.parse(tokens, query) : tokens;
    tokens = sortParser.test(tokens) ? sortParser.parse(tokens, query) : tokens;
    // 5、视图配置
    const customTitleParser = new CustomTitleParser();
    tokens = customTitleParser.test(tokens) ? customTitleParser.parse(tokens, query) : tokens;
    return query;
}