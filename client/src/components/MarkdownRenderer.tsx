import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface props {
  markdown: string;
}

const MarkdownRenderer = ({ markdown }: props) => {
    return (
        <article className="prose dark:prose-invert prose-img:rounded-lg max-w-none prose-p:text-neutral-300 prose-p:my-2 prose-ul:my-0 prose-li:my-0">
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