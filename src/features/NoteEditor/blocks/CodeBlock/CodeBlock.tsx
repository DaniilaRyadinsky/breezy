import { refractor } from 'refractor/core'
import js from 'refractor/javascript'
import ts from 'refractor/typescript'
import { useMemo } from 'react'
import type { RootContent } from 'hast'
import styles from './CodeBlock.module.css'
import { CodeBlockType } from '@/entities/note/model/blockTypes'

import 'prismjs/themes/prism.css'

let languagesRegistered = false

if (!languagesRegistered) {
  refractor.register(js)
  refractor.register(ts)
  languagesRegistered = true
}

function renderNode(node: RootContent, key: string): React.ReactNode {
  if (node.type === 'text') {
    return node.value
  }

  if (node.type === 'element') {
    const className = Array.isArray(node.properties?.className)
      ? node.properties.className.join(' ')
      : ''

    return (
      <span key={key} className={className}>
        {node.children.map((child, i) => renderNode(child, `${key}.${i}`))}
      </span>
    )
  }

  return null
}

const normalizeLanguage = (lang: string) => {
  switch (lang) {
    case 'js':
      return 'javascript'
    case 'ts':
      return 'typescript'
    default:
      return lang || 'javascript'
  }
}



export const CodeBlock = ({ data }: CodeBlockType) => {
  const language = normalizeLanguage(data.lang)
  const lineCount = Math.max(data.text.split('\n').length, 1)

  const tree = useMemo(() => {
    try {
      return refractor.highlight(data.text || ' ', language)
    } catch {
      return null
    }
  }, [data.text, language])

  return (
   <div className={styles.root} data-block-content>
  <div className={styles.gutter} contentEditable={false} aria-hidden="true">
    {Array.from({ length: lineCount }, (_, i) => (
      <div key={i} className={styles.lineNumber}>
        {i + 1}
      </div>
    ))}
  </div>

  <pre className={styles.pre}>
    <code>
      {tree
        ? tree.children.map((node, i) => renderNode(node, String(i)))
        : data.text}
    </code>
  </pre>
</div>
  )
}