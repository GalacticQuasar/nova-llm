import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface props {
  markdown: string;
}

const MarkdownRenderer = ({ markdown }: props) => {
    return (
        <article className="prose dark:prose-invert max-w-none">
            <Markdown
                components={{
                    code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                            <SyntaxHighlighter className="not-prose border-1 !rounded-lg" language={match[1]} style={oneDark}>
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