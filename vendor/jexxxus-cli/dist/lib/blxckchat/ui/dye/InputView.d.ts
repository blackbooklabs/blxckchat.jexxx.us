import React from "react";
interface InputViewProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
    onEscape: () => void;
    placeholder?: string;
    disabled?: boolean;
    slashVisible?: boolean;
    messageFocus?: boolean;
}
export declare const InputView: React.FC<InputViewProps>;
export {};
//# sourceMappingURL=InputView.d.ts.map