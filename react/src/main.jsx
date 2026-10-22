import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '../../js/carrito.js'
import App from './App.jsx'

const pagina = document.body.dataset.pagina || 'inicio'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App pagina={pagina} />
  </StrictMode>,
)
