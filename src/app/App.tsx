import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import AppRouter from './routes/AppRouter'
import { useSession } from './useSession';
import { useSync } from './useSync';

const queryClient = new QueryClient();

function App() {
  useSession();
  useSync();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  )
}

export default App
