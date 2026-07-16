import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  info: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, info: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error, info: "" };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("APP CRASHED:", error, info);
    this.setState({ error, info: info.componentStack });
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          position: "fixed", inset: 0, background: "#111", color: "#fff",
          padding: "40px", fontFamily: "monospace", overflow: "auto", zIndex: 99999
        }}>
          <h1 style={{ color: "#ff5555", fontSize: "24px", marginBottom: "20px" }}>
            Apple & Oak — Error Detected
          </h1>
          <p style={{ color: "#aaa", marginBottom: "20px" }}>
            The app crashed. Send this info to fix it:
          </p>
          <div style={{ background: "#222", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
            <p style={{ color: "#ff5555", fontSize: "16px", fontWeight: "bold" }}>
              {this.state.error.name}: {this.state.error.message}
            </p>
            <pre style={{ color: "#ccc", fontSize: "13px", marginTop: "10px", whiteSpace: "pre-wrap" }}>
              {this.state.error.stack}
            </pre>
          </div>
          {this.state.info && (
            <div style={{ background: "#222", padding: "20px", borderRadius: "8px" }}>
              <p style={{ color: "#888" }}>Component Stack:</p>
              <pre style={{ color: "#aaa", fontSize: "12px", whiteSpace: "pre-wrap" }}>
                {this.state.info}
              </pre>
            </div>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
