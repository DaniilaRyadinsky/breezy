import React, { useState } from 'react'
import { TextSegmentType } from '@/entities/note/model/blockTypes'

const TextInput = ({text}: {text: TextSegmentType[]}) => {
  const [value, setValue] = useState(text.map(item => item.text).join(''))
  // const alltext = text.map(item => item.text).join('')
  return (
    <input type="text" placeholder="TextInput" value={value} onChange={(e)=> setValue(e.target.value)} />
  )
}

export default TextInput