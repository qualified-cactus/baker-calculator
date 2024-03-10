import { PropsWithChildren, ReactElement, createContext, useCallback, useContext, useState } from "react";
import { UiTextMap } from "../uiText/uiTextMap";
import { IUiText } from "../uiText/uiText.en";
import { LocalStorageKeys } from "../LocalStorageKeys";

export namespace AppUiText {
    const DEFAULT_LANGUAGE = "en"

    export interface ContextType {
        language: keyof typeof UiTextMap
        text: IUiText
        setLanguage: (l: keyof typeof UiTextMap) => void
    }

    const Context = createContext<ContextType>(null!)

    export function useCtx() {
        return useContext(Context)
    }

    export function Provider({ children }: PropsWithChildren): ReactElement {
        const [language, setLanguage] = useState<keyof typeof UiTextMap>(defaultLanguage)
        return <Context.Provider value={{
            language,
            text: UiTextMap[language],
            setLanguage: useCallback((newValue: keyof typeof UiTextMap) => {
                window.localStorage.setItem(LocalStorageKeys.APP_LANGUAGE, newValue)
                setLanguage(newValue)
            }, [setLanguage])
        }}>
            {children}
        </Context.Provider>
    }


    function defaultLanguage(): keyof typeof UiTextMap {
        const preferedLanguage = window.navigator.language
        const savedLanguageOption = window.localStorage.getItem(LocalStorageKeys.APP_LANGUAGE)

        const choosenLanguage = savedLanguageOption || preferedLanguage
        if (choosenLanguage in UiTextMap) {
            return choosenLanguage as keyof typeof UiTextMap
        } else {
            return DEFAULT_LANGUAGE
        }
    }
}

