import blessed from "blessed";
export interface CrtBackdropHandle {
    element: blessed.Widgets.BoxElement;
    setGlitchSeed: (_seed: number) => void;
}
export interface CrtBackdropOptions {
    top: number;
    bottom: number;
}
/** Inset CRT/TV frame behind the message scroll area. */
export declare function createCrtBackdrop(screen: blessed.Widgets.Screen, options: CrtBackdropOptions): CrtBackdropHandle;
//# sourceMappingURL=crt-backdrop.d.ts.map