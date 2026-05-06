import React from 'react';
import ReactDOM from 'react-dom';
import App from '@/components/App';

// Enable language support.
import './i18n';

ReactDOM.render(<App />, document.getElementById('app'));

window.dispatchEvent(new Event('panel:ready'));
