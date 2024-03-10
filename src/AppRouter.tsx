import { Navigate, createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import { Paths } from "./Paths";
import { CreateFormulaPage } from "./components/pages/createFormula/CreateFormulaPage";
import { FormulaDetailPage } from "./components/pages/formulaDetail/FormulaDetailPage";
import { FormulaListPage } from "./components/pages/formulaList/FormulaListPage";
import { HomePage } from "./components/pages/home/HomePage";



export const AppRouter = createBrowserRouter([
    {
        path: "",
        element: <Navigate to={Paths.HOME_PAGE} replace />
    },
    {
        path: "",
        element: <MainLayout />,
        children: [
            {
                path: Paths.HOME_PAGE,
                element: <HomePage />,
            },
            {
                path: Paths.FORMULA_LIST,
                element: <FormulaListPage />,
            },
            {
                path: Paths.FORMULA_DETAIL(":formulaId"),
                element: <FormulaDetailPage />
            },
            {
                path: Paths.CREATE_FORMULA,
                element: <CreateFormulaPage />
            },
        ]
    },
    { path: "*", element: <Navigate to={Paths.HOME_PAGE} replace /> }
])