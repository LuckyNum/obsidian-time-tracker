<template>
    <div v-if="useTimerStore().initialized" class="activity-container">
        <!-- 遍历getListData()返回的Map对象 -->
        <div v-for="(entries,index) in getListData()" :key="entries[0]" class="activity-group">
            <div class="activity-title">
                <div v-if="props.query.groupBy === GroupBy.TAG"
                     class="tag-circle"
                     :style="{ backgroundColor:COLORS[index] }"/>
                {{
                    props.query.groupBy === GroupBy.TAG ? entries[0] :
                        moment(entries[0], `${useTimerStore().dailyNotesSettings?.folder}/${useTimerStore().dailyNotesSettings?.format}`).format(useTimerStore().dailyNotesSettings?.format)
                }}
            </div>
            <div class="activity-content">
                <div v-for="entry in entries[1]" :key="entry.id" class="activity-item">
                    <!-- 左侧内容区 -->
                    <div class="activity-item-description">
                        <!-- 如果有标签，显示标签颜色圆点 -->
                        <div v-if="!entry.count"
                             class="tag-circle"
                             :style="{ backgroundColor: entry.color || 'var(--text-muted)' }"
                             :aria-label="entry.tag"/>
                        <!-- 如果有计数，显示计数 -->
                        <div v-if="entry.count && entry.count !== 1"
                             class="activity-item-count">
                            <span>{{ entry.count }}</span>
                        </div>
                        <!-- 标题 -->
                        <div class="activity-item-title">{{ entry.title }}</div>
                        <!-- 标签 -->
                        <span v-if="entry.tag && !entry.count" class="activity-item-tag">{{ entry.tag }}</span>
                    </div>
                    <!-- 右侧时间显示 -->
                    <div class="activity-item-duration">
                        {{ formatDuration(moment.duration(entry.duration * 1000)) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <LoadingSpinner v-if="!useTimerStore().initialized"></LoadingSpinner>
</template>

<script setup lang="ts">
import {defineProps} from "vue";
import {GroupBy, Query, TimeEntry} from "@/types.ts";
import {useTimerStore} from "@/store/TimerStore.ts";
import LoadingSpinner from "@/components/LoadingSpinner.vue";
import {moment} from "obsidian";
import {formatDuration} from "../lib/utils.ts";
import {COLORS} from "@/lib/constants.ts";

const props = defineProps<{
    query: Query
}>();

function getListData(): Map<string, TimeEntry[]> {
    if (props.query.groupBy && props.query.groupBy === GroupBy.TAG) {
        // 标签分组
        return Array.from(useTimerStore().getTimeRangeEntries(props.query).values()).flat().reduce((acc, current) => {
            // 查找已经合并的元素，如果存在则更新duration和count
            const existing = acc.find(item => item.title === current.title && item.tag === current.tag);
            if (existing) {
                existing.duration += current.duration;
                existing.count = (existing.count || 0) + 1;
            } else {
                // 如果不存在，则添加新元素到累加器数组
                acc.push({
                    ...current,
                    count: (current.count || 0) + 1
                });
            }
            return acc;
        }, [] as TimeEntry[]).reduce((acc, item) => {
            const groupKey = item.tag;
            if (!acc.has(groupKey)) {
                acc.set(groupKey, []);
            }
            acc.get(groupKey)!.push(item);
            return acc;
        }, new Map<string, TimeEntry[]>());
    } else {
        // 默认时间分组
        return useTimerStore().getTimeRangeEntries(props.query);
    }
}
</script>

<style scoped>
.activity-container {
    background-color: var(--background-primary);
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.activity-group {
    margin-bottom: 0.5rem;
}

.activity-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 1.1em;
    padding-bottom: 4px;
    border-bottom: 2px solid var(--background-modifier-border);
}

.activity-content {
    padding: 10px 0;
}

.activity-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem
}

.activity-item-description {
    display: flex;
    align-items: center;
    text-align: center;
    flex-wrap: wrap;
    gap: 8px;
}

.tag-circle {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
}

.activity-item-count {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: 0.7em;
    text-align: center;
    border-radius: 50%;
    border: 1px solid var(--background-modifier-border);
    height: 1.75em;
    width: 1.75em;
}

.activity-item-title {
    color: var(--text-normal);
}

.activity-item-tag {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: 0.7em;
    text-align: center;
    border-radius: 0.6em;
    border: 1px solid var(--background-modifier-border);
    height: 1.75em;
    padding: 0px 5px ;
}

.activity-item-duration {
    color: var(--text-muted);
    font-size: 0.9em;
    margin-left: 12px;
    flex-shrink: 0;
}
</style>