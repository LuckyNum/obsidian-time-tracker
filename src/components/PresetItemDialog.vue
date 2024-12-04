<template>
    <div>
        <div class="add-preset-item">
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
            <button @click="addPresetItem" class="mod-cta" aria-label="Add preset item">
                新增
            </button>
        </div>
        <div class="preset-items-list">
            <div v-for="(item, index) in presetItems" :key="index" class="preset-item">
                <span class="preset-item-title">{{ item.title }}</span>
                <div>
                    <span class="preset-item-tag">{{ item.tag ? `#${item.tag}` : t('noTag') }}</span>
                </div>
                <div @click="removePresetItem(index)" class="clickable-icon extra-setting-button" aria-label="删除">
                    <Trash2 class="svg-icon"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue';
import {storeToRefs} from 'pinia';
import {useTimerStore} from '@/store/TimerStore';
import {PresetItem} from '@/types';
import {t} from '@/i18n/helpers';
import {Trash2} from 'lucide-vue-next'

const props = defineProps<{
    timerService: any;
}>();

const timerStore = useTimerStore();
const {presetItems} = storeToRefs(timerStore);

const newItemTitle = ref('');
const newItemTag = ref('');
const tags = ref<string[]>([]);

onMounted(async () => {
    tags.value = await props.timerService.getTags();
});

const addPresetItem = () => {
    if (newItemTitle.value) {
        const newItem: PresetItem = {
            title: newItemTitle.value,
            tag: newItemTag.value
        };
        props.timerService.addPresetItem(newItem);
        newItemTitle.value = '';
        newItemTag.value = '';
    }
};

const removePresetItem = (index: number) => {
    props.timerService.removePresetItem(index);
};
</script>

<style scoped>
.add-preset-item {
    display: grid;
    grid-template-columns: 2fr 1fr auto;
    gap: 8px;
    margin-bottom: 15px;
}

.preset-item-input,
.preset-item-select {
    width: 100%;
    padding: 8px;
}

.preset-items-list {
    border-top: 1px solid var(--background-modifier-border);
    padding-top: 15px;
}

.preset-item {
    display: grid;
    grid-template-columns: 2fr 1fr auto;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
}

.preset-item-title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.preset-item-tag {
    background-color: var(--tag-background);
    color: var(--tag-color);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    display: inline-block;
}

.clickable-icon {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>

