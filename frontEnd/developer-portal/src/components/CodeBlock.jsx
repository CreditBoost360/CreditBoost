import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const CodeBlock = ({ language, children }) => {
  return (
    <div className="code-block">
      <SyntaxHighlighter 
        language={language} 
        style={vscDarkPlus}
        showLineNumbers={true}
        wrapLongLines={true}
      >
        {children}
      </SyntaxHighlighter>
      <button 
        className="copy-button"
        onClick={() => navigator.clipboard.writeText(children)}
      >
        Copy
      </button>
    </div>
  )
}

export default CodeBlock

