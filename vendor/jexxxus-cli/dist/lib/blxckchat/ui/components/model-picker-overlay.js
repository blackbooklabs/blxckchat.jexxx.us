import { upsertProvider } from "../../config.js";
import { listModelOptions } from "../../providers/models.js";
import { resolveProvider } from "../../providers/registry.js";
import { createPickerOverlay } from "./picker-overlay.js";
function toPickerItems(options, active) {
    return options.map((opt) => {
        const activeMarker = opt.id === active.model && opt.provider === active.provider ? "▸ " : "";
        return {
            id: `${opt.provider}/${opt.id}`,
            label: `${activeMarker}${opt.label}`,
            description: opt.source,
        };
    });
}
function findActiveIndex(options, active) {
    const idx = options.findIndex((o) => o.id === active.model && o.provider === active.provider);
    return idx >= 0 ? idx : 0;
}
export function createModelPickerOverlay(screen, opts) {
    const picker = createPickerOverlay(screen);
    picker.setOnPick((item) => {
        const slash = item.id.indexOf("/");
        if (slash === -1)
            return;
        const provider = item.id.slice(0, slash);
        const model = item.id.slice(slash + 1);
        const active = opts.getActiveConfig();
        const updated = {
            ...active,
            provider,
            model,
        };
        upsertProvider(updated);
        opts.setActiveConfig(updated, resolveProvider(updated));
        opts.onApplied(`Model → ${provider}/${model}`);
    });
    picker.setOnCancel(() => { });
    return {
        async open() {
            const active = opts.getActiveConfig();
            const options = await listModelOptions(active);
            const items = toPickerItems(options, active);
            picker.open(items, {
                title: "░ models ░",
                selectedIndex: findActiveIndex(options, active),
            });
        },
        close() {
            picker.close();
        },
        isVisible() {
            return picker.isVisible();
        },
    };
}
//# sourceMappingURL=model-picker-overlay.js.map