import { Box, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import React, { ReactElement, ReactNode, useEffect, useState } from "react";
import { AppUiText } from "../../AppUiText";
import { LoadingCover } from "../../LoadingCover";
import { MassUnit, UnitType, VolumeUnit } from "../../../data/Measurement";
import { AppDatabase } from "../../../DbProvider";
import { useNavigate } from "react-router-dom";
import { Paths } from "../../../Paths";
import { FormulaCreationInputByAmount, FormulaCreationInputByRatio } from "../../../data/FormulaRepo";
import { CreateFormulaByRatioForm } from "./CreateFormulaByRatioForm";
import { CreateFormulaByAmountForm } from "./CreateFormulaByAmountForm";
import { Column } from "../../common/columnAndRows";
import { useMainLayoutCtx } from "../../MainLayout";

export enum CreateMode {
    ByRatio,
    ByAmount,
}

const createFormulaFormId = "create-formula-form"
export function CreateFormulaPage(): ReactElement {
    const uiText = AppUiText.useCtx().text.createFormulaPage
    const navigate = useNavigate()
    const layoutCtx = useMainLayoutCtx()
    const loadingIndicator = LoadingCover.useLoadingCoverContext().loading
    const formulaDao = AppDatabase.getInstance().formulaDao


    //states
    const [createMode, setCreateMode] = useState<CreateMode>(CreateMode.ByRatio)
    const [formVersion, setFormVersion] = useState<number>(0)
    const handleChangeCreateMode = (_event: React.MouseEvent<unknown>, value: CreateMode) => {
        setCreateMode(value)
    }

    useEffect(()=>{
        layoutCtx.setTitle(uiText.pageTitle)
    }, [layoutCtx, uiText])


    //events
    const onFormulaCreated = (formulaName: string, formulaId: number) => {
        if (window.confirm(uiText.askGoToCreatedFormula(formulaName))) {
            navigate(Paths.FORMULA_DETAIL(formulaId.toString()))
        }
        setFormVersion(o => o + 1)
    }
    const onCreateByRatio = (input: FormulaCreationInputByRatio) => {
        loadingIndicator("", async () => {
            onFormulaCreated(
                input.name,
                await formulaDao.addFormulaByRatio(input)
            )
        })
    }
    const onCreateByAmount = (input: FormulaCreationInputByAmount) => {
        loadingIndicator("", async () => {
            onFormulaCreated(
                input.name,
                await formulaDao.addFormulaByAmount(input)
            )
        })
    }

    return <Column spacing={3}>
        <ToggleButtonGroup sx={{ alignSelf: "center" }}
            exclusive
            value={createMode}
            onChange={handleChangeCreateMode}
        >
            <ToggleButton value={CreateMode.ByRatio}>
                {uiText.createByRatio}
            </ToggleButton>
            <ToggleButton value={CreateMode.ByAmount}>
                {uiText.createByAmount}
            </ToggleButton>
        </ToggleButtonGroup>

        {createMode === CreateMode.ByRatio &&
            <CreateFormulaByRatioForm
                formId={createFormulaFormId}
                key={formVersion}
                onCreate={onCreateByRatio}
            />
        }
        {createMode === CreateMode.ByAmount &&
            <CreateFormulaByAmountForm
                formId={createFormulaFormId}
                key={formVersion}
                onCreate={onCreateByAmount}
            />
        }
        <div>
            <Button variant="contained" type="submit" form={createFormulaFormId}>
                {uiText.createFormula}
            </Button>
        </div>
    </Column>
}


export type TextFieldChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

export interface CreateFormulaFormProps<T> {
    initialState?: T,
    /**
     * Return true to reset the form
     */
    onCreate: (input: T) => void
    formId: string
}
export function toBaseUnit(unitType: UnitType, massUnit: MassUnit, volumeUnit: VolumeUnit): MassUnit | VolumeUnit {
    switch (unitType) {
        case "mass": return massUnit
        case "volume": return volumeUnit
    }
}



