import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx'
import { I18nextProvider } from "react-i18next";
import i18n from "./component/i18n";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <I18nextProvider i18n={i18n}>

    <App />
  </I18nextProvider>
  </BrowserRouter>,
)