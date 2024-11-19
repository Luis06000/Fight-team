import React from 'react';
import ReactDOM from 'react-dom/client';
import { Router, createBrowserHistory } from 'react-router-dom';
import './index.css';
import App from './Pages/App/App';
import reportWebVitals from './reportWebVitals';

const history = createBrowserHistory();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router history={history} futureFlags={{ v7_startTransition: true }}>
      <App />
    </Router>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
