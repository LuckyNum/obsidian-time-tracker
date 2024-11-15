import {PluginSettingTab, Setting, Plugin} from 'obsidian';
import {useTimerStore} from "@/store/TimerStore.ts";


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

        containerEl.createEl('h2', {text: 'Timer Plugin Settings'});

        new Setting(containerEl)
            .setName('Daily Notes Folder')
            .setDesc('The folder where your daily notes are stored')
            .addText(text => text
                .setPlaceholder('Daily Notes')
                .setValue(timerStore.settings.dailyNotesFolder)
                .onChange(async (value) => {
                    timerStore.settings.dailyNotesFolder = value;
                    await this.plugin.saveData(timerStore.settings);
                }));

        new Setting(containerEl)
            .setName('Time Entry Heading')
            .setDesc('The heading under which time entries will be added')
            .addText(text => text
                .setPlaceholder('## Day planner')
                .setValue(timerStore.settings.timeEntryHeading)
                .onChange(async (value) => {
                    timerStore.settings.timeEntryHeading = value;
                    await this.plugin.saveData(timerStore.settings);
                }));

        new Setting(containerEl)
            .setName('Time Entry Prefix')
            .setDesc('The prefix for each time entry')
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
            .setName('Enable Celebration')
            .setDesc('Show confetti animation when completing a task')
            .addToggle(toggle => toggle
                .setValue(timerStore.settings.enableCelebration)
                .onChange(async (value) => {
                    timerStore.settings.enableCelebration = value;
                    await this.plugin.saveData(timerStore.settings);
                }));
    }
}