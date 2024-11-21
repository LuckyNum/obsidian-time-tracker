<template>
    <div class="chart-container">
        <div ref="chart"></div>
    </div>
</template>

<script setup lang="ts">
import {ref, onMounted, defineProps} from 'vue'
import * as d3 from 'd3'

const props = defineProps<{
    title: string
}>();

const chart = ref(null)

const data = [
    {name: 'A', value: 30},
    {name: 'B', value: 50},
    {name: 'C', value: 20},
    {name: 'D', value: 40},
    {name: 'E', value: 60},
]

const drawChart = () => {
    const width = 400
    const height = 300
    const margin = {top: 50, right: 20, bottom: 30, left: 40}

    // 清除之前的图表
    d3.select(chart.value).selectAll('*').remove()

    const svg = d3.select(chart.value)
        .append('svg')
        .attr('width', width)
        .attr('height', height)

    const x = d3.scaleBand()
        .range([margin.left, width - margin.right])
        .padding(0.1)

    const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])

    x.domain(data.map(d => d.name))
    y.domain([0, d3.max(data, d => d.value)])

    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => x(d.name))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => height - margin.bottom - y(d.value))
        .attr('fill', '#69b3a2')

    // 添加标题
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(props.title)
}

onMounted(drawChart)
</script>

<style scoped>
.chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border-radius: 8px;
}
</style>