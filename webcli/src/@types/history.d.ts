// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Histroy from 'history';

declare module 'history' {
  interface History {
    goBack(): void;
    goForward(): void;
  }
}
