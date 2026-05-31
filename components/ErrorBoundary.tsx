"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { captureException } from "@/lib/monitoring";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render errors in children (e.g. Mapbox) without white-screening the app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    captureException(error, { componentStack: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center bg-wc-surface p-6 text-center">
          <div>
            <p className="font-display text-lg tracking-wide text-white">
              {this.props.fallbackTitle ?? "Something went wrong"}
            </p>
            <p className="mt-1 text-sm text-wc-muted">
              The map could not be displayed. Try refreshing the page.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="mt-3 rounded-xl bg-wc-neon px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-wc-navy hover:brightness-110"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
