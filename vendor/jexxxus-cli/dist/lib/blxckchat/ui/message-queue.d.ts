/** Queued prompts submitted while the agent is still processing (codex Tab). */
export declare class MessageQueue {
    private readonly items;
    enqueue(text: string): boolean;
    dequeue(): string | undefined;
    peekAll(): string[];
    get length(): number;
    clear(): void;
}
//# sourceMappingURL=message-queue.d.ts.map