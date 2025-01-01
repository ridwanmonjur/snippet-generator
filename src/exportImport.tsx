// Add this to your parseVSCode.ts file

export const exportToTextFileSingle = (block: {
  description: string;
  trigger: string;
  snippet: string;
}): string => {
  return [
    `description: ${block.description}`,
    `trigger: ${block.trigger}`,
    `snippet: ${block.snippet}`,
    ''  // Add empty line at end
  ].join('\n');
};

export const exportToTextFile = (blocks: {
  description: string;
  trigger: string;
  snippet: string;
}[]): string => {
  return blocks
    .map(block => [
      `description: ${block.description}`,
      `trigger: ${block.trigger}`,
      `snippet: ${block.snippet}`
    ].join('\n'))
    .join('\n\n') + '\n'; // Add final newline
};

export const importFromTextFile = (content: string): {
  description: string;
  trigger: string;
  snippet: string;
}[] => {
  const blocks = content.split('\n\n');
  return blocks.map(block => {
    const lines = block.split('\n');
    const result: any = {};
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (!key || !valueParts.length) return;
      
      const value = valueParts.join(':').trim();
      result[key.trim()] = value;
    });

    return {
      description: result.description || '',
      trigger: result.trigger || '',
      snippet: result.snippet || ''
    };
  }).filter(block => block.description || block.trigger || block.snippet);
};