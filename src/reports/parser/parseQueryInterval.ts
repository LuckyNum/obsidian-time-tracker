import {Parser} from "@/reports/parser/Parser.ts";
import {ISODate, Keyword, Query, Token} from "@/types.ts";
import {ISODateFormat} from "@/lib/constants.ts";
import {moment} from "obsidian";

export class QueryIntervalParser extends Parser {
    public parse(tokens: Token[], query: Query): Token[] {
        const _tokens = [...tokens];

        let _from: moment.Moment = moment();
        let _to: moment.Moment = moment();

        const pos = 0;

        switch (_tokens[pos]) {
            case Keyword.TODAY:
                _from = moment();
                _tokens.splice(0, 1);
                break;
            case Keyword.WEEK:
                _from = moment().startOf("isoWeek");
                _to = moment().endOf("isoWeek");
                _tokens.splice(0, 1);
                break;
            case Keyword.MONTH:
                _from = moment().startOf("month");
                _to = moment().endOf("month");
                _tokens.splice(0, 1);
                break;
            case Keyword.FROM:
                // FROM
                _from = moment(_tokens[pos + 1], ISODateFormat, true);
                if (!_from.isValid()) {
                    console.log(Keyword.FROM, _tokens[pos + 1]);
                }
                // TO
                if (_tokens[pos + 2] != Keyword.TO) {
                    console.log(_tokens[pos + 2], [Keyword.TO]);
                }
                _to =
                    _tokens[pos + 3] === Keyword.TODAY
                        ? moment()
                        : moment(_tokens[pos + 3], ISODateFormat, true);
                if (!_to.isValid()) {
                    console.log(Keyword.TO, _tokens[pos + 3]);
                }
                _tokens.splice(0, 4);
                break;
            case Keyword.PAST: {
                const accepted: Token[] = [Keyword.DAYS, Keyword.WEEKS, Keyword.MONTHS];
                if (typeof _tokens[pos + 1] != "number") {
                    console.log(_tokens[pos + 1], ["decimal number"]);
                }
                if (!accepted.includes(_tokens[pos + 2])) {
                    console.log(_tokens[pos + 2], accepted);
                }
                const span = _tokens[pos + 1] as number;
                const unit = _tokens[pos + 2];
                switch (unit) {
                    case Keyword.DAYS:
                        _to = moment();
                        _from = moment().subtract(span - 1, "days"); // sub 1 to include current day
                        break;
                    case Keyword.WEEKS:
                        _to = moment().endOf("isoWeek");
                        _from = moment()
                            .startOf("isoWeek")
                            .subtract(span - 1, "weeks");
                        break;
                    case Keyword.MONTHS:
                        _to = moment().endOf("month");
                        _from = moment()
                            .startOf("month")
                            .subtract(span - 1, "months");
                        break;
                }

                _tokens.splice(0, 3);
                break;
            }
            default: {
                const defaultDate = moment(_tokens[pos], ISODateFormat, true);
                if (defaultDate.isValid()) {
                    _from = defaultDate;
                    _to = _from.clone();
                    _tokens.splice(0, 1);
                }
            }
        }

        if (_from && _to && _to.diff(_from) < 0) {
            console.log()
        }

        if (
            (_from && _to && _to.diff(_from, "days") > 366) ||
            (_from && !_to && moment().diff(_from) > 366)
        ) {
            console.log();
        }

        let from: ISODate = '';
        let to: ISODate = '';

        if (_from != null) {
            from = _from.format("YYYY-MM-DD");
        }

        if (_to != null) {
            to = _to.format("YYYY-MM-DD");
        }

        if (from == null && to == null) {
            console.log();
        }

        query.from = from;
        query.to = to;

        return _tokens;
    }

    get _acceptedTokens(): Token[] {
        return [
            Keyword.TODAY,
            Keyword.WEEK,
            Keyword.MONTH,
            Keyword.FROM,
            Keyword.PAST,
        ];
    }
}