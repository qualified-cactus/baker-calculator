import { ReactElement, useEffect, useState } from "react";
import { SavedResultWithFormula } from "../../../data/FormulaRepo";
import { LoadingCover } from "../../LoadingCover";
import { AppDatabase } from "../../../DbProvider";
import { Column } from "../../common/columnAndRows";
import { Card, CardHeader } from "@mui/material";
import { Link as RouterLink } from "react-router-dom"
import { Paths } from "../../../Paths";
import { useMainLayoutCtx } from "../../MainLayout";
import { AppUiText } from "../../AppUiText";

export function HomePage(): ReactElement {
    const loading = LoadingCover.useLoadingCoverContext().loading
    const formulaDao = AppDatabase.getInstance().formulaDao
    const layoutCtx = useMainLayoutCtx()
    const uiText = AppUiText.useCtx().text.home
    // states
    const [savedResults, setSavedResults] = useState<SavedResultWithFormula[] | null>(null)

    // effects
    useEffect(() => {
        setSavedResults(null)
        loading("", async () => {
            setSavedResults(await formulaDao.getAllSavedResult())
        })
    }, [])
    
    useEffect(() => {
        layoutCtx.setTitle(uiText.pageTitle)
    }, [uiText])


    if (savedResults === null) {
        return <></>
    }

    return <Column spacing={2}>
        {savedResults.map(({ result, formula }, i) =>
            <Card key={i} component={RouterLink}
                sx={{ textDecoration: "none", alignSelf: "stretch" }}
                to={Paths.FORMULA_DETAIL(formula.id.toString(), result.id.toString())}
            >
                <CardHeader
                    title={formula.name}
                    subheader={`${formula.baseIngredient.name} - ${result.baseIngredientAmount} ${formula.baseIngredient.baseUnit}`}
                />
            </Card>
        )}
    </Column>
}