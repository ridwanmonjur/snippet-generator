import React, { useState, useCallback, useMemo, memo } from 'react';
import { Plus, Trash2, Download } from 'lucide-react';
import parseVSCode from '../parseVSCode';
import parseAtom from '../parseAtom';
import parseSublimeText from '../parseSublimeText';
import { exportToTextFile, exportToTextFileSingle, importFromTextFile } from '../exportImport';
import { SnippetBlock, SnippetInput, Block, BlockHookResult, BlockInputProps, BlockOutputProps } from '../types';


interface ExportButtonProps {
  onExport: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExport }) => (
  <button
    onClick={() => onExport()}
    className="bg-blue-500 text-white px-3 py-1 rounded"
    type="button"
  >
    Export Text
  </button>
);

interface ImportButtonProps {
  onImport: (blocks: SnippetInput[]) => void;
}

const ImportButton: React.FC<ImportButtonProps> = ({ onImport }) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const newBlocks = importFromTextFile(text);
      onImport(newBlocks);
      e.target.value = '';
    } catch (error) {
      console.error('Failed to import file:', error);
      alert('Failed to import file. Please check the format.');
    }
  };

  return (
    <label className="bg-green-500 text-white px-3 py-1 rounded cursor-pointer">
      Import
      <input
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="hidden"
      />
    </label>
  );
};

// Custom hook for managing blocks
const useBlocks = (initialBlocks: Block[]): BlockHookResult => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  
  const removeBlock = useCallback((id: number): void => {
    setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== id));
  }, []);

  const updateBlock = useCallback((id: number, field: keyof Block, value: string): void => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === id ? { ...block, [field]: value } : block
      )
    );
  }, []);

  const addBlocks = useCallback((count: number): void => {
    setBlocks(prevBlocks => {
      const lastId = Math.max(...prevBlocks.map(b => b.id));
      const newBlocks: Block[] = Array(count).fill(0).map((_, index) => ({
        id: lastId + index + 1,
        description: '',
        trigger: '',
        snippet: ''
      }));
      return [...prevBlocks, ...newBlocks];
    });
  }, []);

  const removeBlocks = useCallback((targetCount: number): void => {
    setBlocks(prevBlocks => prevBlocks.slice(0, targetCount));
  }, []);

  return {
    setBlocks,
    blocks,
    removeBlock,
    updateBlock,
    addBlocks,
    removeBlocks
  };
};

// Memoized Block Output component
// Helper function to download content as a file
const downloadFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const BlockOutput: React.FC<BlockOutputProps> = memo(({ block }) => {
  const vscodeOutput = useMemo(() => parseVSCode(block), [block]);
  const atomOutput = useMemo(() => parseAtom(block), [block]);
  const sublimeOutput = useMemo(() => parseSublimeText(block), [block]);
  const textOutput = useMemo(() => exportToTextFileSingle(block), [block]);

  // Export handlers
  const handleExportVSCodeText = useCallback(() => {
    downloadFile(textOutput, `${block.trigger || 'snippet'}.txt`);
  }, [vscodeOutput, block.trigger]);

  const handleExportVSCodeJSON = useCallback(() => {
    const snippetObj = {
      [block.trigger || 'untitled']: {
        prefix: block.trigger,
        body: block.snippet.split('\n'),
        description: block.description
      }
    };
    const jsonContent = JSON.stringify(snippetObj, null, 2);
    downloadFile(jsonContent, `${block.trigger || 'snippet'}.code-snippets`);
  }, [block]);

  return (
    <div className="bg-gray-100 p-4 rounded">
      <h3 className="font-medium mb-2">Converted Snippets:</h3>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm text-gray-600">VSCode:</label>
            <div className="flex gap-2">
              <button
                onClick={handleExportVSCodeText}
                className="flex items-center gap-1 text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                title="Export as Text"
              >
                <Download size={14} />
                <span>Text</span>
              </button>
              <button
                onClick={handleExportVSCodeJSON}
                className="flex items-center gap-1 text-sm px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                title="Export as JSON"
              >
                <Download size={14} />
                <span>JSON</span>
              </button>
            </div>
          </div>
          <div className="bg-white p-2 rounded border">{vscodeOutput}</div>
        </div>
        <div>
          <label className="text-sm text-gray-600">Atom:</label>
          <div className="bg-white p-2 rounded border">{atomOutput}</div>
        </div>
        <div>
          <label className="text-sm text-gray-600">Sublime:</label>
          <div className="bg-white p-2 rounded border">{sublimeOutput}</div>
        </div>
      </div>
    </div>
  );
});

BlockOutput.displayName = 'BlockOutput';

// Memoized Block Input component
const BlockInput: React.FC<BlockInputProps> = memo(({ block, onUpdate, onRemove }) => {
  const handleInputChange = useCallback((field: keyof Block, value: string) => {
    onUpdate(block.id, field, value);
  }, [block.id, onUpdate]);

  const handleRemove = useCallback(() => {
    onRemove(block.id);
  }, [block.id, onRemove]);

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Block {block.id}</h2>
        <button
          onClick={handleRemove}
          className="text-red-500 hover:text-red-700"
          type="button"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={block.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trigger</label>
            <input
              type="text"
              value={block.trigger}
              onChange={(e) => handleInputChange('trigger', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter trigger"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Snippet</label>
          <textarea
            value={block.snippet}
            onChange={(e) => handleInputChange('snippet', e.target.value)}
            className="w-full p-2 border rounded h-32"
            placeholder="Enter your snippet here"
          />
        </div>

        <BlockOutput block={block} />
      </div>
    </div>
  );
});

BlockInput.displayName = 'BlockInput';

// Main component
const SnippetConverter: React.FC = () => {
  const {
    blocks,
    removeBlock,
    updateBlock,
    addBlocks,
    removeBlocks,
    setBlocks,
  } = useBlocks([{
    id: 1,
    description: '',
    trigger: '',
    snippet: ''
  }]);

  const handleExportText = () => {
    const content = exportToTextFile(blocks);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snippet.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleImport = (newBlocks: SnippetInput[]) => {
    setBlocks((prev) => [
      ...prev,
      ...newBlocks.map((block, index) => ({
        ...block,
        id: Math.max(...prev.map(b => b.id)) + index + 1
      }))
    ]);
  };

  const handleBlockCountChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCount = parseInt(e.target.value, 10);
    if (newCount > blocks.length) {
      addBlocks(newCount - blocks.length);
    } else {
      removeBlocks(newCount);
    }
  }, [blocks.length, addBlocks, removeBlocks]);

  const blockOptions = useMemo(() => 
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 50].map(num => (
      <option key={num} value={num}>{num}</option>
    )), 
  []);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Snippet Converter</h1>
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <ExportButton onExport={handleExportText} />
            <ImportButton onImport={handleImport} />
          </div>
          <label className="font-medium">Number of Blocks:</label>
          <select 
            className="p-2 border rounded"
            value={blocks.length}
            onChange={handleBlockCountChange}
          >
            {blockOptions}
          </select>
        </div>
      </div>
      
      <div className="space-y-6">
        {blocks.map((block) => (
          <BlockInput
            key={block.id}
            block={block}
            onUpdate={updateBlock}
            onRemove={removeBlock}
          />
        ))}
      </div>
    </div>
  );
};

export default SnippetConverter;