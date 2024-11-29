<template>
    <div ref="chartRef"></div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import * as d3 from 'd3';
import {ChartData} from "@/types.ts";

const props = defineProps<{
    width: number;
    data: ChartData[];
}>();

const chartRef = ref<HTMLElement | null>(null);

const defaultData: ChartData[] = [
    {
        name: "",
        value: 1,
        hex: "var(--background-primary-alt)",
        displayValue: "",
    },
];

const render = (data: ChartData[], width: number, height: number): void => {
    if (!chartRef.value) return;

    const chartData = data.length ? data : defaultData;

    const margin = {
        top: 16,
        right: 0,
        bottom: 48,
        left: 0,
    };
    const radius = Math.min(
        width - margin.left - margin.right,
        height - margin.top - margin.bottom,
    ) / 2;

    d3.select(chartRef.value).selectAll("*").remove();

    const svg = d3
        .select(chartRef.value)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr(
            "transform",
            `translate(${(width - margin.left - margin.right) / 2 + margin.left}, ${
                (height - margin.top - margin.bottom) / 2 + margin.top
            })`,
        );

    const arcs = d3.pie<ChartData>().value((d) => d.value)(chartData);

    const arc = d3.arc<d3.PieArcDatum<ChartData>>()
        .innerRadius(0.7 * radius)
        .outerRadius(radius);

    const pieChart = svg
        .selectAll("path")
        .data(arcs)
        .enter()
        .append("path")
        .attr("d", arc)
        // @ts-ignore
        .attr("fill", (d) => d.data.hex)
        .attr("stroke", "var(--background-primary)")
        .style("stroke-width", "1px")
        .style("opacity", 1);

    pieChart.on("mouseover", function () {
        d3.select(this).style("opacity", "0.85");
    });

    pieChart.on("mouseout", function () {
        d3.select(this).style("opacity", "1");
    });

    if (chartData[0].displayValue) {
        pieChart.attr("aria-label", (d) => d.data.displayValue || '');
    }
};

onMounted(() => {
    render(props.data, props.width, 250);
});

watch(() => [props.data, props.width], () => {
    render(props.data,
        props.width,
        250);
});
</script>