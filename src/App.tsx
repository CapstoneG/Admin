import { AuthProvider } from './components';
import AppRouter from './routes/AppRouter';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRouter />
      </Router>
    </AuthProvider>
  );
}

export default App
