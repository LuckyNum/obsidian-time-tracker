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
            .setDesc(
                t('settingDailyNoteFolderDesc')
                    // @ts-ignore
                    .concat('当前格式为[', this.plugin.app.internalPlugins.getPluginById('daily-notes').instance.options.format, ']，目录为[', this.plugin.app.internalPlugins.getPluginById('daily-notes').instance.options.folder, ']。')
                    // @ts-ignore
                    .concat(`今日日记路径：${this.plugin.app.internalPlugins.getPluginById('daily-notes').instance.options.folder}/${window.moment().format(this.plugin.app.internalPlugins.getPluginById('daily-notes').instance.options.format)}`))


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
            .setName('首行/末行')
            .setDesc('首行/末行')
            .addToggle(toggle => toggle
                .setValue(timerStore.settings.isFirstLine)
                .onChange(async (value) => {
                    timerStore.settings.isFirstLine = value;
                    await this.plugin.saveData(timerStore.settings);
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