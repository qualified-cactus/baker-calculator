import { PropsWithChildren, createContext, useContext, useMemo, useState } from "react";
import { ReactElement } from "react";
import { Backdrop, CircularProgress, Typography } from "@mui/material";
import { AppZIndex } from "./AppZIndex";


export namespace LoadingCover {
    export interface Type {
        loading: <T>(loadingText: string, f: () => Promise<T>) => Promise<T>
    }

    const Context = createContext<Type>(null!!)

    export function useLoadingCoverContext() {
        return useContext(Context)
    }

    export function Component({ children }: PropsWithChildren): ReactElement {
        const [isLoading, setLoading] = useState<string | null>(null)
        const value: Type = useMemo(() => ({
            loading: async (loadingText, f) => {
                setLoading(loadingText)
                try {
                    const result = await f()
                    setLoading(null)
                    return result
                } catch (e) {
                    throw e
                }

            }
        }), [setLoading])

        return <>
            <Backdrop open={isLoading !== null} sx={{ zIndex: AppZIndex.loadingCover }}>
                <CircularProgress color="inherit" />
                <Typography variant="h5">{isLoading}</Typography>
            </Backdrop>

            <Context.Provider value={value}>
                {children}
            </Context.Provider>
        </>
    }

}
