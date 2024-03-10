import { ReactNode, useEffect, useState } from "react";
import { AppDatabase } from "../../../DbProvider";
import { LoadingCover } from "../../LoadingCover";
import { Column } from "../../common/columnAndRows";
import { Formula, SavedResult } from "../../../data/BakerRatioCalcDb";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Paths } from "../../../Paths";
import { EditFormulaDialog } from "./EditFormulaDialog";
import { SavedResultDialog } from "./SavedResultsDialog";
import { FormulaDetail } from "./FormulaDetail";
import { LoadingBox } from "../../common/LoadingBox";
import BigNumber from "bignumber.js";
import { AppUiText } from "../../AppUiText";
import { useMainLayoutCtx } from "../../MainLayout";
import { FormulaCreationInputByAmount, FormulaCreationInputByRatio } from "../../../data/FormulaRepo";


const formulaDetailForm = "formula-detail-form"
export function FormulaDetailPage() {
    const formulaDao = AppDatabase.getInstance().formulaDao
    const loading = LoadingCover.useLoadingCoverContext().loading
    const navigate = useNavigate()
    const uiText = AppUiText.useCtx().text
    const formulaDetailUiText = uiText.formulaDetailPage
    const layoutCtx = useMainLayoutCtx()    
    const [searchParams, setSearchParams] = useSearchParams()
    const formulaId = Number(useParams().formulaId)


    //states
    const [formula, setFormula] = useState<Formula.Type | undefined>(undefined)
    const [initialResult, setInitialResult] = useState<SavedResult.Type | null | undefined>(undefined)
    const [showEditDialog, setShowEditDialog] = useState<boolean>(false)
    const [showSavedResult, setShowSavedResult] = useState<boolean>(false)
    const [refresh, setRefresh] = useState<boolean>(false)
    
    //effects
    useEffect(() => {
        setFormula(undefined)
        formulaDao.getFormula(formulaId).then((formula) => {
            if (formula === undefined) {
                navigate(Paths.FORMULA_LIST, { replace: true })
            } else {
                setFormula(formula)
            }
        })
    }, [formulaId, refresh])

    useEffect(() => {
        setInitialResult(undefined)
        const resultId = searchParams.get("resultId")
        if (resultId !== null) {
            const i = Number(resultId)
            if (Number.isNaN(i)) {
                setInitialResult(null)
            } else {
                formulaDao.getSavedResult(i).then((result) => {
                    if (result === undefined) {
                        setInitialResult(null)
                    } else {
                        setInitialResult(result)
                    }
                })
            }
        } else {
            setInitialResult(null)
        }
    }, [searchParams])

    // option menu on app bar
    useEffect(()=>{
        if (formula) {
            const onClickShowSavedResults = ()=>{
                setShowSavedResult(true)
            }
            const onClickSaveCurrentResult = ()=>{
                (document.getElementById(formulaDetailForm) as HTMLFormElement).requestSubmit()
            }
            const onClickEditFormula = ()=>{
                setShowEditDialog(true)
            }
            const onDeleteFormula = ()=>{
                loading("", async ()=>{
                    if (window.confirm(formulaDetailUiText.confirmDeleteFormula)) {
                        await formulaDao.deleteFormula(formula.id)
                        window.alert(formulaDetailUiText.formulaDeleted)
                        navigate(Paths.FORMULA_LIST, {replace: true})
                    }
                })
            }
            
            layoutCtx.setTitle(formula.name)
            layoutCtx.setAppBarOptionsMenu([
                {
                    label: formulaDetailUiText.saveCurrentResult,
                    onClick: onClickSaveCurrentResult
                },
                {
                    label: formulaDetailUiText.viewSavedResults,
                    onClick: onClickShowSavedResults
                },
                {
                    label: formulaDetailUiText.editFormula,
                    onClick: onClickEditFormula
                },
                {
                    label: formulaDetailUiText.deleteFormula,
                    onClick: onDeleteFormula
                }
            ])
        }
    },[formula, layoutCtx, formulaDetailUiText, navigate]);


    
    let content: ReactNode

    if (formula === undefined || initialResult === undefined) {
        content = <LoadingBox />
    } else {
        //events
        const onCloseEditFormula = ()=>{
            setShowEditDialog(false)
        }
        const onEditByRatio = (input: FormulaCreationInputByRatio)=>{
            loading("", async ()=>{
                await formulaDao.editFormulaByRatio(formula.id, input)
                setShowEditDialog(false)
                setRefresh(!refresh)
                setSearchParams(new URLSearchParams(), {replace: true})    
                
            })
        }
        const onEditByAmount = (input: FormulaCreationInputByAmount)=>{
            loading("", async ()=>{
                await formulaDao.editFormulaByAmount(formula.id, input)
                setShowEditDialog(false)
                setRefresh(!refresh)
                setSearchParams(new URLSearchParams(), {replace: true})                
            })
        }
        const onCloseSavedResult = ()=>{
            setShowSavedResult(false)
        }
        const onSelectSavedResult = (resultId: number)=>{
            setShowSavedResult(false)
            setSearchParams(new URLSearchParams({resultId: resultId.toString()}), {replace: true})
        }
        const onSaveResult = (amount: BigNumber)=>{
            loading("", async ()=>{
                await formulaDao.saveFormulaResult(formula.id, amount.toNumber())
                window.alert(formulaDetailUiText.formulaResultSaved)
            })
        }

        content = <>
            <EditFormulaDialog
                openDialog={showEditDialog}
                onCloseDialog={onCloseEditFormula}
                formula={formula}
                onEditByAmount={onEditByAmount}
                onEditByRatio={onEditByRatio}
            />
            <SavedResultDialog
                open={showSavedResult}
                onClose={onCloseSavedResult}
                formula={formula}
                onSelectResult={onSelectSavedResult}
            />

            <FormulaDetail
                formula={formula}
                initialResult={initialResult}
                formId={formulaDetailForm}
                onSubmit={onSaveResult}
            />
        </>
    }

    return <Column spacing={3} sx={{ alignItems: "stretch" }}>
        {content}
    </Column>


}