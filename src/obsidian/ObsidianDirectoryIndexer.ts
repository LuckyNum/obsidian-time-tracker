import {TFile, Component} from 'obsidian';
import {FileMetadata, TimeEntry} from "@/types.ts";
import {useTimerStore} from "@/store/TimerStore.ts";
import {COLORS} from "@/lib/constants.ts";
import ObsidianTimeTrackerPlugin from "@/index.ts";

export class ObsidianDirectoryIndexer extends Component {
    //@ts-ignore
    private initialized: boolean;
    private store;

    constructor(
        private plugin: ObsidianTimeTrackerPlugin,
    ) {
        super();
        this.initialized = false;
        this.store = useTimerStore();
    }

    /**
     * 初始化索引系统
     */
    public async initialize(): Promise<void> {
        try {
            this.plugin.addStatusBarItem().setText(`开始初始化目录: ${useTimerStore().dailyNotesSettings?.folder}`)
            const startTime = Date.now();
            // 初始化事件监听器
            this.registerEventHandlers();
            // 初始索引
            const indexedSize = await this.indexInitialFiles();
            this.initialized = true;
            useTimerStore().initialized = true;
            const duration = (Date.now() - startTime) / 1000;
            this.plugin.addStatusBarItem().setText(`处理了 ${indexedSize} 个文件，耗时 ${duration}s`)
        } catch (error) {
            console.error('初始化失败:', error);
            throw error;
        }
    }

    /**
     * 注册事件处理器
     */
    private registerEventHandlers(): void {
        // 监听文件修改
        this.registerEvent(
            this.plugin.app.vault.on('modify', async (file) => {
                if (file instanceof TFile && this.shouldIndexFile(file)) {
                    await this.indexFile(file);
                }
            })
        );

        // 监听文件删除
        this.registerEvent(
            this.plugin.app.vault.on('delete', (file) => {
                if (file instanceof TFile) {
                    this.store.allEntries?.delete(file.path);
                }
            })
        );

        // 监听文件重命名
        this.registerEvent(
            this.plugin.app.vault.on('rename', (file, oldPath) => {
                if (file instanceof TFile) {
                    if (this.store.allEntries?.has(oldPath)) {
                        const metadata = this.store.allEntries?.get(oldPath);
                        this.store.allEntries?.delete(oldPath);
                        if (metadata) {
                            metadata.path = file.path;
                            this.store.allEntries?.set(file.path, metadata);
                        }
                    }
                }
            })
        );

        // 监听元数据变更
        this.registerEvent(
            this.plugin.app.metadataCache.on('changed', async (file) => {
                if (this.shouldIndexFile(file)) {
                    await this.indexFile(file);
                }
            })
        );
    }

    /**
     * 初始化所有文件的索引
     */
    private async indexInitialFiles(): Promise<number> {
        const files = this.plugin.app.vault.getMarkdownFiles()
            .filter(file => this.shouldIndexFile(file));

        for (const file of files) {
            await this.indexFile(file);
        }

        return files.length;
    }

    /**
     * 索引单个文件
     */
    private async indexFile(file: TFile): Promise<void> {
        try {
            const content = await this.plugin.app.vault.read(file);
            const fileMetadata: FileMetadata = {
                path: file.path,
                mtime: file.stat.mtime,
                timeEntry: this.extractTimeEntry(content)
            };
            this.store.allEntries.set(file.path, fileMetadata);
        } catch (error) {
            console.error(`索引文件失败 ${file.path}:`, error);
        }
    }

    /**
     * 提取时间戳
     */
    private extractTimeEntry(content: string): TimeEntry[] {
        const entries: TimeEntry[] = [];
        let isInTimeEntrySection = false;
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.trim() === this.store.settings.timeEntryHeading) {
                isInTimeEntrySection = true;
                continue;
            }
            if (isInTimeEntrySection) {
                const match = line?.trimEnd().match(/(\d{2}:\d{2}) - (\d{2}:\d{2}) (.*?)( #(\S+))?$/);
                if (match) {
                    const [, startTime, endTime, title, , tag] = match;
                    const entry: TimeEntry = {
                        id: Date.now() + entries.length,
                        title,
                        tag: tag || '',
                        startTime: window.moment(startTime, 'HH:mm').valueOf(),
                        endTime: window.moment(endTime, 'HH:mm').valueOf(),
                        duration: window.moment(endTime, 'HH:mm').diff(window.moment(startTime, 'HH:mm'), 'seconds'),
                        color: COLORS[entries.length % COLORS.length]
                    };
                    entries.push(entry);
                }
            }
        }
        return entries;
    }

    /**
     * 判断文件是否应该被索引
     */
    private shouldIndexFile(file: TFile): boolean {
        // 检查路径是否在根目录下
        if (!file.path.startsWith(useTimerStore().dailyNotesSettings?.folder || 'Obsidian Time Tracker Daily Note')) return false;
        // 检查文件是否已存在且未修改
        const existingFile = this.store.allEntries?.get(file.path);
        return !(existingFile && existingFile.mtime === file.stat.mtime);
    }
}