<template>
    <div>
        <div class="item-header">新事项</div>
        <div class="new-item">
            <input
                v-model="newItemTitle"
                :placeholder="t('presetItemTitlePlaceholder')"
                class="preset-item-input"
                type="text"
            />
            <select v-model="newItemTag" class="preset-item-select dropdown">
                <option value="">{{ t('noTag') }}</option>
                <option v-for="tag in tags" :key="tag" :value="tag">{{ tag }}</option>
            </select>
        </div>
        <div class="item-header">预置事项</div>
        <div class="preset-item">
            <select v-model="checkedItem" class="preset-item-select dropdown">
                <option v-for="(item, index) in presetItems" :key="index" :value="index">
                    {{
                        `${item.title}（#${item.tag ? item.tag : t('noTag')}）`
                    }}
                </option>
            </select>
        </div>
        <div class="item-footer">
            <button @click="startTimer()" class="mod-cta start-btn">开始计时</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {t} from '@/i18n/helpers';
import {useTimerStore} from "@/store/TimerStore.ts";
import {TimerService} from "@/obsidian/TimerService.ts";
import {Modal} from "obsidian";

const props = defineProps<{
    timerService: TimerService;
    modal: Modal
}>();

const newItemTitle = ref('');
const newItemTag = ref('');
const tags = ref<string[]>([]);

const checkedItem = ref<number>(-1);
const presetItems = useTimerStore().settings.presetItems;

const startTimer = function () {
    if (newItemTitle.value && presetItems[checkedItem.value]) {
        props.timerService.notice("只能选择一个事项");
        return;
    }
    if (!newItemTitle.value && !presetItems[checkedItem.value]) {
        props.timerService.notice("请填写事项");
        return;
    }
    if (newItemTitle.value) {
        useTimerStore().startTimer(newItemTitle.value, newItemTag.value)
    } else {
        useTimerStore().startTimer(presetItems[checkedItem.value].title, presetItems[checkedItem.value].tag)
    }
    props.modal.close();
}

onMounted(async () => {
    tags.value = await props.timerService.getTags();
});
</script>

<style scoped>
.item-header {
    width: 100%;
    margin: 10px 0;
    font-weight: bold;
}

.item-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.new-item {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 8px;
    margin-bottom: 15px;
}

.preset-item {
    display: grid;
    gap: 8px;
    margin-bottom: 15px;
}
</style>

