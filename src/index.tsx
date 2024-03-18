import { createRoot } from "react-dom/client"
import { App } from "./components/App"
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { AppDatabase } from "./DbProvider"
import "./favicon_512x512.png"


if ('serviceWorker' in window.navigator) {
    window.addEventListener("load", () => {
        window.navigator.serviceWorker
            .register("/serviceWorker.js", { updateViaCache: "none" })
            .then((result) => console.log(result))
            .catch(e => console.error(e))
    })
}

window.document.body.style.margin = "0"
window.document.body.style.padding = "0"
AppDatabase.openDb().then(() => {
    const rootElement = window.document.createElement("div")
    window.document.body.append(rootElement)
    createRoot(rootElement).render(<App />)
})
