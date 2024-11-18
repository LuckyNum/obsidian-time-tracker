import {PluginSettingTab, Setting, Plugin} from 'obsidian';
import {useTimerStore} from "@/store/TimerStore.ts";
import {t} from "@/i18n/helpers.ts";


export class TimerSettingTab extends PluginSettingTab {
    plugin: Plugin;

    constructor(plugin: Plugin) {
        super(plugin.app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const {containerEl} = this;
        const timerStore = useTimerStore();

        containerEl.empty();

        containerEl.createEl('h2', {text: t('settingHeader')});

        new Setting(containerEl)
            .setName(t('settingDailyNoteFolder'))
            .setDesc(t('settingDailyNoteFolderDesc'))
            .addText(text => text
                .setPlaceholder('Daily Notes')
                .setValue(timerStore.settings.dailyNotesFolder)
                .onChange(async (value) => {
                    timerStore.settings.dailyNotesFolder = value;
                    await this.plugin.saveData(timerStore.settings);
                }));

        new Setting(containerEl)
            .setName(t('settingDailyNoteHeading'))
            .setDesc(t('settingDailyNoteHeadingDesc'))
            .addText(text => text
                .setPlaceholder('## Day planner')
                .setValue(timerStore.settings.timeEntryHeading)
                .onChange(async (value) => {
                    timerStore.settings.timeEntryHeading = value;
                    await this.plugin.saveData(timerStore.settings);
                }));

        new Setting(containerEl)
            .setName(t('settingPrefix'))
            .setDesc(t('settingPrefixDesc'))
            .addDropdown(dropdown => dropdown
                .addOption('-', 'List mode (-)')
                .addOption('- [ ]', 'Todo mode (- [ ])')
                .setValue(timerStore.settings.timeEntryPrefix)
                .onChange(async (value: string) => {
                    if (value == '-' || value == '- [ ]') {
                        timerStore.settings.timeEntryPrefix = value;
                        await this.plugin.saveData(timerStore.settings);
                    }
                }));

        new Setting(containerEl)
            .setName(t('settingEnableCelebration'))
            .setDesc(t('settingEnableCelebrationDesc'))
            .addToggle(toggle => toggle
                .setValue(timerStore.settings.enableCelebration)
                .onChange(async (value) => {
                    timerStore.settings.enableCelebration = value;
                    await this.plugin.saveData(timerStore.settings);
                }));

        new Setting(containerEl)
            .setName(t('settingEnableCreateNoteFirst'))
            .setDesc(t('settingEnableCreateNoteFirstDesc'))
            .addToggle(toggle => toggle
                .setValue(timerStore.settings.enableCreateNote)
                .onChange(async (value) => {
                    timerStore.settings.enableCreateNote = value;
                    await this.plugin.saveData(timerStore.settings);
                }));
    }
}