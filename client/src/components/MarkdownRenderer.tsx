import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {tomorrow} from 'react-syntax-highlighter/dist/esm/styles/prism'

interface props {
  markdown: string;
}

const MarkdownRenderer = ({ markdown }: props) => {
    return (
        <article className="prose dark:prose-invert prose-md max-w-none">
            <Markdown
              components={{
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '')
                  return match ? (
                    <SyntaxHighlighter language={match[1]} style={tomorrow}>
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {markdown}
            </Markdown>
          </article>
      )
}

export default MarkdownRenderer