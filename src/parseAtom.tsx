import { html } from "common-tags";

const parseAtom = ({
  description,
  trigger,
  snippet,
}: {
  description: string,
  trigger: string,
  snippet: string,
}) => {
  // prettier-ignore
  return html`
    '${description}':
      'prefix': '${trigger}'
      'body': """
        ${snippet}
      """
  `;
};

export default parseAtom;
