export interface SnippetBlock {
    id: number;
    description: string;
    trigger: string;
    snippet: string;
}

export type SnippetInput = Omit<SnippetBlock, 'id'>;
// Types
export interface Block {
    id: number;
    description: string;
    trigger: string;
    snippet: string;
}
export type SetBlocksFunction = React.Dispatch<React.SetStateAction<SnippetBlock[]>>;

export interface BlockHookResult {
    blocks: Block[];
    setBlocks: SetBlocksFunction;
    removeBlock: (id: number) => void;
    updateBlock: (id: number, field: keyof Block, value: string) => void;
    addBlocks: (count: number) => void;
    removeBlocks: (targetCount: number) => void;
}

export interface BlockInputProps {
    block: Block;
    onUpdate: (id: number, field: keyof Block, value: string) => void;
    onRemove: (id: number) => void;
}

export interface BlockOutputProps {
    block: Block;
}