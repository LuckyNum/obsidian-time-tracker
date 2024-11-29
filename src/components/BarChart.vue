<template>
    <div ref="chartRef" class="is-flex-grow-2"></div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import * as d3 from 'd3';

interface ChartData {
    name: string;
    value: number;
    displayValue?: string;
}

const props = defineProps<{
    width: number;
    data: ChartData[];
}>();

const chartRef = ref<HTMLElement | null>(null);

const maxValue = (data: ChartData[]) => {
    return Math.max(...data.map((e) => e.value));
};

const render = (data: ChartData[], width: number, height: number): void => {
    if (!chartRef.value) return;

    const margin = {
        top: 24,
        right: 0,
        bottom: 48,
        left: 24
    };

    const ticks = {
        size: '0.8rem',
        textColor: 'var(--text-muted)',
        strokeColor: 'var(--background-modifier-border)',
        weight: '300',
        textHeight: margin.bottom - 24
    };

    d3.select(chartRef.value).selectAll("*").remove();

    const svg = d3
        .select(chartRef.value)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const xScale = d3
        .scaleBand()
        .domain(data.map((e) => e.name))
        .range([margin.left, width - margin.right])
        .padding(0.5);

    const yScale = d3
        .scaleLinear()
        .domain([0, maxValue(data)])
        .range([height - margin.bottom, margin.top]);

    const getXTickLabelOffset = (labels: SVGTextElement[]) => {
        let maxWidth = 0;
        for (const label of labels) {
            const width = label.getBoundingClientRect().width;
            if (width > maxWidth) {
                maxWidth = width;
            }
        }
        return 8 + maxWidth;
    };

    svg
        .append('g')
        .call(
            d3
                .axisLeft(yScale)
                .ticks(5)
                .tickSize(-width + margin.right)
                .tickFormat((d) => `${d} h`)
        )
        .style('color', ticks.strokeColor)
        .call((g) => g.select('.domain').remove())
        .call((g) =>
            g
                .selectAll('.tick text')
                .style('color', ticks.textColor)
                .style('font-size', ticks.size)
                .style('font-family', 'var(--default-font)')
                .style('font-weight', ticks.weight)
                .attr(
                    'transform',
                    // @ts-ignore
                    (val, index, nodes) => {
                        return `translate(${getXTickLabelOffset(nodes as SVGTextElement[])}, -10)`;
                    }
                )
        );

    const bars = svg.selectAll('rect').data(data).enter();

    const rects = bars
        .append('rect')
        .attr('x', (d) => xScale(d.name) || 0)
        .attr('y', (d) => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .style('fill', 'var(--interactive-accent)')
        .attr('height', (d) =>
            d.value > 0 ? height - margin.bottom - yScale(d.value) : 0
        );

    rects.on('mouseover', function () {
        d3.select(this).style('fill', 'var(--interactive-accent-hover)');
    });

    rects.on('mouseout', function () {
        d3.select(this).style('fill', 'var(--interactive-accent)');
    });

    if (data) {
        rects.attr('aria-label', (d) => d.displayValue || 0);
    }

    const show_label = (text: string, index: number, length: number) => {
        if (text.length > 5) {
            if (length > 15) {
                return index % 3 == 0;
            }
            if (length > 7) {
                return index % 2 == 0;
            }
        } else {
            if (length > 21) {
                return index % 3 == 0;
            }
            if (length > 10) {
                return index % 2 == 0;
            }
        }
        return true;
    };

    const get_label_top = (data: ChartData, index: number, series: SVGTextElement[] | ArrayLike<SVGTextElement>) => {
        return show_label(data.name.split('\n')[0], index, series.length)
            ? data.name.split('\n')[0]
            : '';
    };

    const get_label_bottom = (data: ChartData, index: number, series: SVGTextElement[] | ArrayLike<SVGTextElement>) => {
        return show_label(data.name.split('\n')[0], index, series.length)
            ? data.name.includes('\n')
                ? data.name.split('\n')[1]
                : ''
            : '';
    };

    bars
        .append('text')
        .text((d, i, nodes) => get_label_top(d, i, nodes))
        .attr('x', (d) => (xScale(d.name) || 0) + xScale.bandwidth() / 2)
        .attr('y', () => height - ticks.textHeight)
        .attr('dy', '0em')
        .style('text-anchor', 'middle')
        .style('fill', ticks.textColor)
        .style('font-size', ticks.size)
        .style('font-weight', ticks.weight);

    bars
        .append('text')
        .text((d, i, nodes) => get_label_bottom(d, i, nodes))
        .attr('x', (d) => (xScale(d.name) || 0) + xScale.bandwidth() / 2)
        .attr('y', () => height - ticks.textHeight)
        .attr('dy', '1.2em')
        .style('text-anchor', 'middle')
        .style('fill', ticks.textColor)
        .style('font-size', ticks.size)
        .style('font-weight', ticks.weight);
};

onMounted(() => {
    render(props.data, props.width, 250);
});

watch(() => [props.data, props.width], () => {
    render(props.data, props.width, 250);
});
</script>