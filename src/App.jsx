import AuthForm from './components/AuthForm'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <AuthForm />
    </ErrorBoundary>
  )
}

export default App
