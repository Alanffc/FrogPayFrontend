import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // <-- 1. Importamos el enrutador
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. Envolvemos la App para habilitar las rutas en todo el proyecto */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)