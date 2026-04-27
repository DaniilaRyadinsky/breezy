import { refractor } from 'refractor/core'
import js from 'refractor/javascript'
import ts from 'refractor/typescript'
import json from 'refractor/json'
import css from 'refractor/css'
import markup from 'refractor/markup'
import { useMemo } from 'react'
import type { RootContent } from 'hast'
import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import styles from './CodeBlock.module.css'
import { CodeBlockType } from '@/entities/note/model/blockTypes'

let registered = false

if (!registered) {
  refractor.register(js)
  refractor.register(ts)
  refractor.register(json)
  refractor.register(css)
  refractor.register(markup)
  registered = true
}

type CodeLang =
  | 'javascript'
  | 'typescript'
  | 'json'
  | 'css'
  | 'html'

type Props = {
  code: string
  lang: CodeLang
  onLangChange: (lang: CodeLang) => void
}

const LANGUAGE_OPTIONS: Array<{ value: CodeLang; label: string }> = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'json', label: 'JSON' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
]

const materialYouTokenStyle = (classNames: string[]) => {
  const has = (name: string) => classNames.includes(name)

  if (has('comment') || has('prolog') || has('doctype') || has('cdata')) {
    return { color: 'var(--md-sys-color-outline)' }
  }

  if (has('keyword') || has('atrule')) {
    return { color: 'var(--md-sys-color-primary)', fontWeight: 500 as const }
  }

  if (has('string') || has('char') || has('attr-value') || has('inserted')) {
    return { color: 'var(--md-sys-color-tertiary)' }
  }

  if (has('number') || has('boolean') || has('constant')) {
    return { color: 'var(--md-sys-color-secondary)' }
  }

  if (has('function')) {
    return { color: 'var(--md-sys-color-primary)' }
  }

  if (has('class-name')) {
    return { color: 'var(--md-sys-color-secondary)', fontWeight: 500 as const }
  }

  if (has('operator') || has('entity') || has('url')) {
    return { color: 'var(--md-sys-color-on-surface)' }
  }

  if (has('property') || has('parameter') || has('variable')) {
    return { color: 'var(--md-sys-color-on-surface-variant)' }
  }

  if (has('punctuation')) {
    return { color: 'var(--md-sys-color-outline)' }
  }

  if (has('tag') || has('selector') || has('attr-name')) {
    return { color: 'var(--md-sys-color-secondary)' }
  }

  if (has('important') || has('regex')) {
    return { color: 'var(--md-sys-color-error)' }
  }

  return { color: 'inherit' }
}

function renderNode(node: RootContent, key: string): React.ReactNode {
  if (node.type === 'text') {
    return node.value
  }

  if (node.type === 'element') {
    const classNames = Array.isArray(node.properties?.className)
      ? node.properties.className.map(String)
      : []

    return (
      <span
        key={key}
        className={classNames.join(' ')}
        style={materialYouTokenStyle(classNames)}
      >
        {node.children.map((child, i) => renderNode(child, `${key}.${i}`))}
      </span>
    )
  }

  return null
}

export const CodeBlock = ({ data }: CodeBlockType) => {
  const { text, lang } = data
  const lineCount = Math.max(text.split('\n').length, 1)

  const tree = useMemo(() => {
    try {
      return refractor.highlight(text || ' ', 'js')
    } catch {
      return null
    }
  }, [text, lang])

  const handleLangChange = (e: SelectChangeEvent<CodeLang>) => {
    // onLangChange(e.target.value as CodeLang)
  }

  return (
    <Box className={styles.root} data-block-content>
      <Box
        className={styles.langMenu}
        contentEditable={false}
        suppressContentEditableWarning
      >
        <FormControl size="small" variant="outlined">
          <InputLabel id="code-lang-select-label">Язык</InputLabel>
          <Select
            labelId="code-lang-select-label"
            // value={lang}
            label="Язык"
            onChange={handleLangChange}
            MenuProps={{
              disableScrollLock: true,
            }}
            sx={{
              minWidth: 148,
              borderRadius: '999px',
              backgroundColor: 'var(--md-sys-color-surface-container-high)',
              color: 'var(--md-sys-color-on-surface)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--md-sys-color-outline-variant)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--md-sys-color-outline)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--md-sys-color-primary)',
                borderWidth: '2px',
              },
              '& .MuiSelect-select': {
                paddingTop: '10px',
                paddingBottom: '10px',
              },
            }}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <div className={styles.gutter} contentEditable={false} aria-hidden="true">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i} className={styles.lineNumber}>
            {i + 1}
          </div>
        ))}
      </div>

      <pre className={styles.pre}>
        <code className={styles.code}>
          {tree
            ? tree.children.map((node, i) => renderNode(node, String(i)))
            : text}
        </code>
      </pre>
    </Box>
  )
}