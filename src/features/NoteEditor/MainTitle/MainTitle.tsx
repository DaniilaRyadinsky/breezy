import {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
  type KeyboardEvent,
} from 'react'

import styles from './MainTitle.module.css'
import { useActiveNoteStore } from '@/entities/note/model/store'
import { useNoteMutations } from '@/entities/note/lib/useNoteMuttion'

export interface MainTitleHandle {
  focus: () => void
}

interface MainTitleProps {
  onEnter?: () => void
}

const MainTitle = forwardRef<MainTitleHandle, MainTitleProps>(({ onEnter }, ref) => {
  const activeNote = useActiveNoteStore((state) => state.activeNote)

  const { createNote, patchTitle } = useNoteMutations()

  const titleRef = useRef<HTMLDivElement>(null)
  const skipNextBlurSaveRef = useRef(false)

  const [isTitleEmpty, setIsTitleEmpty] = useState(true)

  useImperativeHandle(ref, () => ({
    focus: () => {
      titleRef.current?.focus()
    },
  }))

  useEffect(() => {
    if (activeNote && titleRef.current) {
      if (document.activeElement !== titleRef.current) {
        const title = activeNote.title || ''

        
        if (title === "Untitled") {
          titleRef.current.textContent = '';
          setIsTitleEmpty(true);
        }
        else {
          titleRef.current.textContent = title
          setIsTitleEmpty(title.trim().length === 0)
        }
      }
    }
  }, [activeNote?.id, activeNote?.title])

  const saveTitle = useCallback(
    (afterSave?: () => void) => {
      if (!activeNote || !titleRef.current) {
        afterSave?.()
        return
      }

      const currentTitle = titleRef.current.textContent || ''

      setIsTitleEmpty(currentTitle.trim().length === 0)

      patchTitle(currentTitle, activeNote.id)
      afterSave?.()
    },
    [activeNote, createNote, patchTitle]
  )

  const handleBlur = useCallback(() => {
    if (skipNextBlurSaveRef.current) {
      skipNextBlurSaveRef.current = false
      return
    }

    saveTitle()
  }, [saveTitle])

  const handleInput = useCallback(() => {
    const currentTitle = titleRef.current?.textContent || ''
    setIsTitleEmpty(currentTitle.trim().length === 0)
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Enter') return

      event.preventDefault()

      skipNextBlurSaveRef.current = true

      saveTitle(() => {
        requestAnimationFrame(() => {
          onEnter?.()
        })
      })
    },
    [saveTitle, onEnter]
  )

  return (
    <div className={styles.title_container}>
      <div
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        className={styles.title}
        onBlur={handleBlur}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-empty={isTitleEmpty}
        data-placeholder="Название заметки"
      />
    </div>
  )
})

export default MainTitle