/* eslint-disable vars-on-top */
/* eslint-disable no-var */
// for vite.config.ts
declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
export {};
