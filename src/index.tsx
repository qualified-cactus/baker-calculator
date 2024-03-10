import { createRoot } from "react-dom/client"
import { App } from "./components/App"
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { AppDatabase } from "./DbProvider"


if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

window.document.body.style.margin = "0"
window.document.body.style.padding = "0"
AppDatabase.openDb().then(() => {
    const rootElement = window.document.createElement("div")
    window.document.body.append(rootElement)
    createRoot(rootElement).render(<App />)
})
