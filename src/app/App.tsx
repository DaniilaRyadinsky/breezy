import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './App.css'
import AppRouter from './routes/AppRouter'
import { useSync } from '@/entities/note/sync';
import { useSession } from '@/features/auth';

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
