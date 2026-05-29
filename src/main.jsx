import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PageWrapper } from './components/PageWrapper.jsx'
import { GlobalEffects } from './components/global.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PageWrapper>
      <GlobalEffects />
      <App />
    </PageWrapper>
  </StrictMode>,
)
