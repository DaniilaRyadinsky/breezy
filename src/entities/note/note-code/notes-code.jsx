import React from 'react'

const NotesCode = () => {
const content = `async function fetchLogin() {
    setInputModeLog('')
    setInputModePass('')
    if (username === '') {
      setInputModeLog('none')
      loginRef.current.focus()
    }
      
    else if (password === '') {
      setInputModePass('none')
      passwordRef.current.focus()
    }

    else {
      fetch(login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      }).then((response) => response.json()).then((result)=> {
        if(result.access_token) {
          localStorage.setItem('access_token', result.access_token);
          navigate('/main')
        }
        else {
          console.log(result.error)
          setInputModePass('err')
          setInputModeLog('err')
        }
      })
    }
  }`

  return (
    <div>
        <pre>
            <code>
            
            {content}
            </code>
        </pre>
    </div>
  )
}

export default NotesCode