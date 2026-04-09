const fs = require('fs')
const path = require('path')

const mainPath = path.join(__dirname, 'src', 'main.jsx')

const newContent = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import AgencyDashboard from './AgencyDashboard'

const pathname = window.location.pathname

let Component = App
if (pathname === '/admin' || pathname === '/admin/') {
  Component = AdminDashboard
} else if (pathname === '/agency' || pathname === '/agency/') {
  Component = AgencyDashboard
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Component />
  </StrictMode>,
)
`

fs.writeFileSync(mainPath, newContent, 'utf8')
console.log('SUCCESS: main.jsx を書き換えました！')
