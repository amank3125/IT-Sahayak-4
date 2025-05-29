import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ContentArea from './components/ContentArea'
import './App.css'

// Sample avatar URLs (replace with actual avatars)
const USER_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
const AGENT_AVATAR = 'https://api.dicebear.com/7.x/bottts/svg?seed=agent'

const App = () => {
  const [selectedSection, setSelectedSection] = useState('network')

  useEffect(() => {
    console.log('App mounted')
    console.log('Electron API available:', !!window.electron)
    
    if (window.electron) {
      window.electron.checkFirstRun()
    } else {
      console.error('Electron API not found!')
    }
  }, [])

  return (
    <div className="app">
      <Sidebar 
        selectedSection={selectedSection}
        onSectionChange={setSelectedSection}
      />
      <ContentArea selectedSection={selectedSection} />
    </div>
  )
}

export default App 