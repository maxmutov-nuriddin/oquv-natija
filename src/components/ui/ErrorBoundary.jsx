import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Noma'lum xato" };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          padding: "24px"
        }}>
          <div style={{
            maxWidth: "420px",
            width: "100%",
            background: "#fff",
            border: "2px solid #fecaca",
            borderRadius: "16px",
            padding: "32px 24px",
            textAlign: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
            <h2 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: 800, color: "#dc2626" }}>
              Xato yuz berdi
            </h2>
            <p style={{ margin: "0 0 20px", fontSize: "13px", color: "#64748b", lineHeight: 1.6 }}>
              {this.state.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 24px",
                background: "#1cb0f6",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Sahifani yangilash
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
