import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MainPage } from './pages/MainPage';

// Initialize the QueryClient for caching and data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Avoid refetching when user switches tabs
      retry: false, // Don't spam retries on error
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainPage />
    </QueryClientProvider>
  );
}

export default App;
