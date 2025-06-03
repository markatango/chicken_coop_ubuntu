import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Chickencoop from "./pages/chickencoop"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Chickencoop />
  </StrictMode>,
)
