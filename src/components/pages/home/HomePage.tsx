import { ReactElement, useEffect, useState } from "react";
import { SavedResultWithFormula } from "../../../data/FormulaRepo";
import { LoadingCover } from "../../LoadingCover";
import { AppDatabase } from "../../../DbProvider";
import { Column } from "../../common/columnAndRows";
import { Card, CardHeader } from "@mui/material";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom"
import { Paths } from "../../../Paths";
import { useMainLayoutCtx } from "../../MainLayout";
import { AppUiText } from "../../AppUiText";

export function HomePage(): ReactElement {
    const loading = LoadingCover.useLoadingCoverContext().loading
    const formulaDao = AppDatabase.getInstance().formulaDao
    const layoutCtx = useMainLayoutCtx()
    const uiText = AppUiText.useCtx().text.home
    const [searchParams, _] = useSearchParams()
    const navigate = useNavigate()

    // states
    const [savedResults, setSavedResults] = useState<SavedResultWithFormula[] | undefined>(undefined)

    // effects
    useEffect(() => {
        // gh 404 support
        const redirect = searchParams.get("redirect")
        if (redirect !== null) {
            navigate(redirect, {replace: true})
            return
        }

        setSavedResults(undefined)
        loading("", async () => {
            setSavedResults(await formulaDao.getAllSavedResult())
        })
    }, [searchParams])
    
    useEffect(() => {
        layoutCtx.setTitle(uiText.pageTitle)
    }, [uiText])

    
    useEffect(()=>{
        
    },[searchParams])


    if (savedResults === undefined) {
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