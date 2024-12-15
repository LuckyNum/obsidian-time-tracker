import {TFile, CachedMetadata, Component} from 'obsidian';
import {FileMetadata, TimeEntry} from "@/types.ts";
import {useTimerStore} from "@/store/TimerStore.ts";
import {COLORS} from "@/lib/constants.ts";
import ObsidianTimeTrackerPlugin from "@/index.ts";

export class ObsidianDirectoryIndexer extends Component {
    //@ts-ignore
    private initialized: boolean;
    private rootPath: string;
    private store;

    constructor(
        private plugin: ObsidianTimeTrackerPlugin,
        rootPath: string = "/"
    ) {
        super();
        this.initialized = false;
        this.rootPath = rootPath;
        this.store = useTimerStore();
    }

    /**
     * 初始化索引系统
     */
    public async initialize(): Promise<void> {
        try {
            this.plugin.addStatusBarItem().setText(`开始初始化目录: ${this.rootPath}`)
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
            const metadata = this.plugin.app.metadataCache.getFileCache(file);
            const content = await this.plugin.app.vault.read(file);
            const fileMetadata: FileMetadata = {
                path: file.path,
                mtime: file.stat.mtime,
                tags: this.extractTags(metadata),
                links: this.extractLinks(metadata),
                content: content,
                frontmatter: metadata?.frontmatter,
                headers: this.extractHeaders(metadata),
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
     * 提取标签
     */
    private extractTags(metadata: CachedMetadata | null): string[] {
        const tags: Set<string> = new Set();
        // 从 frontmatter 中提取标签
        if (metadata?.frontmatter?.tags) {
            const frontmatterTags = Array.isArray(metadata.frontmatter.tags)
                ? metadata.frontmatter.tags
                : [metadata.frontmatter.tags];
            frontmatterTags.forEach(tag => tags.add(tag));
        }
        // 从内联标签中提取
        if (metadata?.tags) {
            metadata.tags.forEach(tag => tags.add(tag.tag));
        }
        return Array.from(tags);
    }

    /**
     * 提取链接
     */
    private extractLinks(metadata: CachedMetadata | null): string[] {
        if (!metadata?.links) return [];

        return metadata.links.map(link => {
            const dest = this.plugin.app.metadataCache.getFirstLinkpathDest(link.link, link.link);
            return dest ? dest.path : link.link;
        });
    }

    /**
     * 提取标题
     */
    private extractHeaders(metadata: CachedMetadata | null): string[] {
        if (!metadata?.headings) return [];
        return metadata.headings.map(h => h.heading);
    }

    /**
     * 判断文件是否应该被索引
     */
    private shouldIndexFile(file: TFile): boolean {
        // 检查路径是否在根目录下
        if (!file.path.startsWith(this.rootPath)) return false;

        // 检查文件是否已存在且未修改
        const existingFile = this.store.allEntries?.get(file.path);
        if (existingFile && existingFile.mtime === file.stat.mtime) {
            return false;
        }

        return true;
    }

    /**
     * 查询方法
     */
    public getFileMetadata(path: string): FileMetadata | undefined {
        return this.store.allEntries?.get(path);
    }

    public getAllTags(): Set<string> {
        const tags = new Set<string>();
        this.store.allEntries?.forEach(file => {
            file.tags.forEach(tag => tags.add(tag));
        });
        return tags;
    }

    public findFilesByTag(tag: string): FileMetadata[] {
        return Array.from(this.store.allEntries?.values() || [])
            .filter(file => file.tags.includes(tag));
    }

    public findFilesWithLink(targetPath: string): FileMetadata[] {
        return Array.from(this.store.allEntries?.values() || [])
            .filter(file => file.links.includes(targetPath));
    }

    public searchByContent(query: string): FileMetadata[] {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.store.allEntries?.values() || [])
            .filter(file => file.content?.toLowerCase().includes(lowerQuery));
    }

    public getFrontmatterValue(path: string, key: string): any {
        const metadata = this.store.allEntries?.get(path);
        return metadata?.frontmatter?.[key];
    }
}