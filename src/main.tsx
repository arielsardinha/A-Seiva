import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles/base.css'
import './styles/radio.css'
import './styles/teleprompter.css'

const raiz = document.getElementById('root')
if (!raiz) throw new Error('Elemento #root não encontrado')

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
