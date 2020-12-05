import React from "react"
import logo from "./logo.svg"
import "./App.css"

import Counter from "./counter"
import CancelPromiseTest from "./cancelPromise/test"

function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        <section>
          decorator
          <Counter />
        </section>
        <section>
          cancelPromise
          <CancelPromiseTest />
        </section>
      </header>
    </div>
  )
}

export default App
