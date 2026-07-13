/** Queued prompts submitted while the agent is still processing (codex Tab). */
export class MessageQueue {
    items = [];
    enqueue(text) {
        const trimmed = text.trim();
        if (!trimmed)
            return false;
        this.items.push(trimmed);
        return true;
    }
    dequeue() {
        return this.items.shift();
    }
    peekAll() {
        return [...this.items];
    }
    get length() {
        return this.items.length;
    }
    clear() {
        this.items.length = 0;
    }
}
//# sourceMappingURL=message-queue.js.map