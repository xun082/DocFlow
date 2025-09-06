import { all, createLowlight } from 'lowlight';
import { toHtml } from 'hast-util-to-html';
import 'highlight.js/styles/github.css';
import './SyntaxHighlight.scss';

const lowlight = createLowlight(all);

const SyntaxHighlight = ({ className, children, ...props }: any) => {
  const language = className?.replace('language-', '') || 'plaintext';
  const codeContent = typeof children === 'string' ? children : String(children);
  const highlightedResult = lowlight.highlight(language, codeContent);
  const htmlString = toHtml(highlightedResult);

  return (
    <pre className="m-0 p-5 bg-[#0d1117] text-[#e6edf3] text-sm leading-relaxed overflow-x-auto whitespace-pre font-normal border-none">
      <code
        className="font-inherit text-inherit bg-transparent p-0 outline-none caret-[#58a6ff] shadow-none"
        dangerouslySetInnerHTML={{
          __html: htmlString,
        }}
        {...props}
      />
    </pre>
  );
};

export default SyntaxHighlight;
