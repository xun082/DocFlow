import { all, createLowlight } from 'lowlight';
import { toHtml } from 'hast-util-to-html';

const lowlight = createLowlight(all);

const SyntaxHighlight = ({ className, children, ...props }: any) => {
  const language = className?.replace('language-', '') || 'plaintext';
  const codeContent = typeof children === 'string' ? children : String(children);
  const highlightedResult = lowlight.highlight(language, codeContent);
  const htmlString = toHtml(highlightedResult);

  return (
    <pre className="syntax-highlight">
      <code
        dangerouslySetInnerHTML={{
          __html: htmlString,
        }}
        {...props}
      />
    </pre>
  );
};

export default SyntaxHighlight;
