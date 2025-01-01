import { html } from "common-tags";

const parseVSCode = ({
  description,
  trigger,
  snippet,
}: {
  description: string,
  trigger: string,
  snippet: string,
}) => {
  // escape " with \"
  // split lines by line-break
  const separatedSnippet = snippet
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .split("\n");
  const separatedSnippetLength = separatedSnippet.length;

  // add double quotes around each line apart from the last one
  const newSnippet = separatedSnippet.map((line, index) => {
    return index === separatedSnippetLength - 1 ? `"${line}"` : `"${line}",`;
  });
  // prettier-ignore
  return html`
    "${description}": {
      "prefix": "${trigger}",
      "body": [
        ${newSnippet.join('\n')}
      ],
      "description": "${description}"
    }
  `;
};

export default parseVSCode;

