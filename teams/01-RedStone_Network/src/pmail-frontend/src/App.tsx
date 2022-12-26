import Index from '@/router'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function App() {
  return (
    <div>
      <div className="w-screen h-screen bg-background">
        <ToastContainer />
        <Index />
      </div>
    </div>
  )
}
