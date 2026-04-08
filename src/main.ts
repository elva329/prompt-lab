import { createApp } from 'vue';

import App from './App.vue';
import { router } from './router';
import './styles/index.css';
import './design-system.css'

// Send logs to parent frame (like a preview system)
function postToParent(level: string, ...args: unknown[]): void {
  if (window.parent !== window) {
    window.parent.postMessage(
      {
        type: 'iframe-console',
        level,
        args,
      },
      '*'
    );
  }
}

window.onerror = function (message, source, lineno, colno, error) {
  postToParent('error', '[Meku_Error_Caught]', {
    message,
    source,
    lineno,
    colno,
    stack: error?.stack,
  });
};

window.onunhandledrejection = function (event) {
  postToParent('error', '[Meku_Error_Caught]', { reason: event.reason });
};

(['log', 'warn', 'info', 'error'] as const).forEach((level) => {
  const original = console[level];
  console[level] = (...args: unknown[]) => {
    postToParent(level, ...args);
    original(...args);
  };
});

createApp(App).use(router).mount('#app');
