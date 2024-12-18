import {Modal, Notice} from 'obsidian';
import {PresetItem, TimeEntry} from "@/types.ts";
import {useTimerStore} from "@/store/TimerStore.ts";
import {t} from "@/i18n/helpers.ts";
import confetti from "canvas-confetti";
import ObsidianTimeTrackerPlugin from "@/index.ts";
import {createApp} from "vue";
import PresetItemDialog from "@/components/PresetItemDialog.vue";
import StartTimerDialog from "@/components/StartTimerDialog.vue";

export class TimerService {
    plugin: ObsidianTimeTrackerPlugin;

    constructor(plugin: ObsidianTimeTrackerPlugin) {
        this.plugin = plugin;
    }

    async toggleTimer() {
        if (useTimerStore().activeEntry) {
            const created = await useTimerStore().stopTimer();
            if (created) {
                if (useTimerStore().settings.enableCelebration) {
                    confetti({
                        particleCount: 100,
                        spread: 80,
                        origin: {y: 0.8}
                    });
                }
            }
        } else {
            this.showStartTimerDialog();
        }
    }

    showStartTimerDialog() {
        const modal = new Modal(this.plugin.app);
        modal.containerEl.addClass('start-timer-modal');
        modal.containerEl.toggleClass('custom-next', true);
        modal.titleEl.setText('开始做');

        const vueApp = createApp(StartTimerDialog, {
            timerService: this,
            modal: modal
        });

        vueApp.mount(modal.contentEl);

        modal.onClose = () => {
            vueApp.unmount();
        };

        modal.open();
    }

    showPresetItemDialog(): void {
        const modal = new Modal(this.plugin.app);
        modal.containerEl.addClass('preset-item-modal');
        modal.containerEl.toggleClass('custom-next', true);
        modal.titleEl.setText('预置事项');

        const vueApp = createApp(PresetItemDialog, {
            timerService: this
        });

        vueApp.mount(modal.contentEl);

        modal.onClose = () => {
            vueApp.unmount();
        };

        modal.open();
    }

    async addTimeEntryToDailyNote(entry: TimeEntry): Promise<Boolean> {
        // @ts-ignore
        const dailyNotesSettings = await this.plugin.app.internalPlugins.getPluginById('daily-notes').instance.options;
        const filePath = `${dailyNotesSettings.folder}/${window.moment().format(dailyNotesSettings.format)}.md`
        const isExist = await this.plugin.app.vault.adapter.exists(filePath);
        if (!isExist) {
            if (useTimerStore().settings.enableCreateNote) {
                await this.plugin.app.vault.adapter.mkdir(filePath.substring(0, filePath.lastIndexOf("/")));
                await this.plugin.app.vault.adapter.write(filePath, `${useTimerStore().settings.timeEntryHeading}\n`);
            } else {
                this.notice(t('createNoteFirst'));
                return false;
            }
        }
        const startTimeStr = window.moment(entry.startTime).format('HH:mm');
        const endTimeStr = window.moment(entry.endTime).format('HH:mm');
        const tagStr = entry.tag ? ` #${entry.tag}` : '';
        const newEntryText = `${useTimerStore().settings.timeEntryPrefix} ${startTimeStr} - ${endTimeStr} ${entry.title}${tagStr}`;

        const content = await this.plugin.app.vault.adapter.read(filePath);
        const lines = content.split('\n');

        const headingIndex = lines.findIndex(line => line.trim() === useTimerStore().settings.timeEntryHeading);
        if (headingIndex !== -1) {
            let insertIndex;
            if (useTimerStore().settings.isFirstLine) {
                insertIndex = headingIndex + 1;
            } else {
                insertIndex = headingIndex + 1;
                while (insertIndex < lines.length && lines[insertIndex].startsWith("-")) {
                    insertIndex++;
                }
            }

            lines.splice(insertIndex, 0, newEntryText);
        } else {
            lines.push('', useTimerStore().settings.timeEntryHeading, newEntryText);
        }

        await this.plugin.app.vault.adapter.write(filePath, lines.join('\n'));
        return true;
    }

    async addPresetItem(item: PresetItem): Promise<void> {
        useTimerStore().settings.presetItems.push(item);
        await this.plugin.saveData(useTimerStore().settings);
    }

    async removePresetItem(index: number): Promise<void> {
        useTimerStore().settings.presetItems.splice(index, 1);
        await this.plugin.saveData(useTimerStore().settings);
    }

    notice(message: string) {
        new Notice(message);
    }

    async getTags(): Promise<string[]> {
        // @ts-ignore
        const tags = await this.plugin.app.metadataCache.getTags();
        return Object.keys(tags).map(tag => tag.slice(1));
    }
}