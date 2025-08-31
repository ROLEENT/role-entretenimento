import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[APP ERROR]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: 16, color: '#ef4444' }}>Algo deu errado.</h2>
          <p style={{ marginBottom: 16, color: '#6b7280' }}>Ocorreu um erro inesperado na aplicação.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              marginRight: '8px'
            }}
          >
            Recarregar página
          </button>
          <button 
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload();
            }}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#6b7280', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer'
            }}
          >
            Limpar cache
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}