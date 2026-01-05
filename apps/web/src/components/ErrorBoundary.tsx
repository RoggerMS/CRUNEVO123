import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Algo salió mal.</h1>
          <p style={{ color: '#dc3545' }}>{this.state.error?.message}</p>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
                className="btn" 
                onClick={() => window.location.reload()}
            >
                Recargar Página
            </button>
            <Link to="/feed" className="btn btn-outline">
                Volver al Feed
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
