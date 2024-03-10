import { ReactElement } from "react";
import { LoadingCover } from "./LoadingCover";
import { RouterProvider } from "react-router-dom";
import { AppRouter } from "../AppRouter";
import { AppUiText } from "./AppUiText";
import { ThemeProvider } from "@mui/material";
import { StandardTheme } from "./theme/StandardTheme";




export function App(): ReactElement {
    return <ThemeProvider theme={StandardTheme}>
        <LoadingCover.Component>
            <AppUiText.Provider>
                <RouterProvider router={AppRouter} />
            </AppUiText.Provider>
        </LoadingCover.Component>
    </ThemeProvider>;
}