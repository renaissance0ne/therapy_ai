import 'next';

declare module 'next' {
  interface PageProps {
    params: {
      sessionId: string;
    };
  }
}