import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import App from './App.jsx'
import { I18nextProvider } from "react-i18next";
import i18n from "./component/i18n";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <I18nextProvider i18n={i18n}>

    <App />
    <ToastContainer />
  </I18nextProvider>
  </BrowserRouter>,
)