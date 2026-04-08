import { Highlight, themes } from 'prism-react-renderer'

export default function CodeHighlighter({ code, language = 'javascript', activeLine = -1 }) {
  const codeString = Array.isArray(code) ? code.join('\n') : code

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border-glass">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-rose/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-neon-amber/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-neon-green/60" />
        </div>
        <span className="text-xs text-text-muted font-mono ml-2">pseudocode</span>
      </div>
      <Highlight theme={themes.nightOwl} code={codeString} language={language}>
        {({ tokens, getLineProps, getTokenProps }) => (
          <pre className="p-4 overflow-x-auto text-sm font-mono leading-relaxed">
            {tokens.map((line, i) => {
              const lineProps = getLineProps({ line, key: i })
              const isActive = i === activeLine
              return (
                <div
                  key={i}
                  {...lineProps}
                  className={`px-3 py-0.5 -mx-3 rounded transition-colors duration-200
                    ${isActive ? 'bg-neon-purple/20 border-l-2 border-neon-purple' : 'border-l-2 border-transparent'}`}
                >
                  <span className={`inline-block w-8 text-right mr-4 select-none text-xs
                    ${isActive ? 'text-neon-purple' : 'text-text-muted'}`}>
                    {i + 1}
                  </span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </div>
              )
            })}
          </pre>
        )}
      </Highlight>
    </div>
  )
}
