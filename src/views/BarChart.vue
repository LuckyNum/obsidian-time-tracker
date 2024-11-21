<template>
    <div class="chart-container">
        <div class="chart-row">
            <div ref="barChart" class="bar-chart"></div>
            <div ref="donutChart" class="donut-chart"></div>
        </div>
        <div class="project-list">
            <div class="list-header">
                <span>Project</span>
                <span>Time</span>
                <span>Percent</span>
            </div>
            <div v-for="(item, index) in projectData" :key="index" class="project-item">
                <span class="project-color" :style="{ backgroundColor: item.color }"></span>
                <span class="project-name">{{ item.name }}</span>
                <span class="project-time">{{ item.time }}</span>
                <span class="project-percent">{{ item.percent.toFixed(1) }}%</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import * as d3 from 'd3'

interface ProjectData {
    name: string;
    time: string;
    percent: number;
    color: string;
}

interface DailyData {
    date: string;
    totalTime: number;
}

const projectData: ProjectData[] = [
    {name: '系统架构师', time: '0:00:17', percent: 54.8, color: '#a05d56'},
    {name: '运动健康', time: '0:00:14', percent: 45.2, color: '#6b486b'},
]

const dailyData: DailyData[] = [
    {date: 'Fri 15-11', totalTime: 0.008},
    {date: 'Sat 16-11', totalTime: 0},
    {date: 'Sun 17-11', totalTime: 0},
    {date: 'Mon 18-11', totalTime: 0},
    {date: 'Tue 19-11', totalTime: 0},
    {date: 'Wed 20-11', totalTime: 0},
    {date: 'Thu 21-11', totalTime: 0},
]

const barChart = ref<HTMLElement | null>(null)
const donutChart = ref<HTMLElement | null>(null)

const drawBarChart = () => {
    const width = 400
    const height = 200
    const margin = {top: 20, right: 20, bottom: 40, left: 40}

    const svg = d3.select(barChart.value)
        .append('svg')
        .attr('width', width)
        .attr('height', height)

    const x = d3.scaleBand()
        .domain(dailyData.map(d => d.date))
        .range([margin.left, width - margin.right])
        .padding(0.1)

    const y = d3.scaleLinear()
        .domain([0, 0.008])
        .range([height - margin.bottom, margin.top])

    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)')

    // Add Y axis
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d} h`))

    // Add horizontal grid lines
    svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y)
            .ticks(5)
            .tickSize(-width + margin.left + margin.right)
            .tickFormat('')
        )

    // Add bars
    svg.selectAll('rect')
        .data(dailyData)
        .enter()
        .append('rect')
        .attr('x', d => x(d.date) || 0)
        .attr('y', d => y(d.totalTime))
        .attr('width', x.bandwidth())
        .attr('height', d => height - margin.bottom - y(d.totalTime))
        .attr('fill', '#a05d56')
}

const drawDonutChart = () => {
    const width = 200
    const height = 200
    const radius = Math.min(width, height) / 2

    const svg = d3.select(donutChart.value)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`)

    const color = d3.scaleOrdinal<string>()
        .domain(projectData.map(d => d.name))
        .range(projectData.map(d => d.color))

    const pie = d3.pie<ProjectData>()
        .value(d => d.percent)

    const arc = d3.arc<d3.PieArcDatum<ProjectData>>()
        .innerRadius(radius * 0.6)
        .outerRadius(radius)

    const arcs = svg.selectAll('arc')
        .data(pie(projectData))
        .enter()
        .append('g')
        .attr('class', 'arc')

    arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => color(d.data.name))
}

onMounted(() => {
    drawBarChart()
    drawDonutChart()
})
</script>

<style scoped>
.chart-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    border: 1px solid var(--background-modifier-border);
}

.chart-row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.bar-chart, .donut-chart {
    flex: 1;
}

.bar-chart {
    border-bottom: 1px solid var(--background-modifier-border);
}

.project-list {
    margin-top: 1rem;
    border-top: 1px solid var(--background-modifier-border);
    padding-top: 1rem;
}

.project-list h3 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    font-size: 1.2em;
    color: var(--text-normal);
}

.list-header {
    display: flex;
    justify-content: flex-end;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: var(--text-muted);
}

.list-header span:first-child {
    margin-right: 2rem;
}

.project-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.25rem;
}

.project-color {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
    margin-right: 0.5rem;
}

.project-name {
    flex: 1;
    color: var(--text-normal);
}

.project-time, .project-percent {
    color: var(--text-muted);
}

.project-time {
    margin-right: 2rem;
}

:deep(.grid line) {
    stroke: var(--background-modifier-border);
    stroke-opacity: 0.5;
    shape-rendering: crispEdges;
}

:deep(.grid path) {
    stroke-width: 0;
}

:deep(.tick line) {
    stroke: var(--background-modifier-border);
}

:deep(.tick text) {
    fill: var(--text-muted);
}

:deep(.domain) {
    stroke: var(--background-modifier-border);
}
</style>