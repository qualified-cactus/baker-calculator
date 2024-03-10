import { AppBar, Button, Container, Dialog, IconButton, Slide, ToggleButton, ToggleButtonGroup, Toolbar, Typography } from "@mui/material";
import { Formula } from "../../../data/BakerRatioCalcDb";
import React, { useMemo, useState } from "react";
import { TransitionProps } from "@mui/material/transitions";
import CloseIcon from '@mui/icons-material/Close';
import { AppUiText } from "../../AppUiText";
import { CreateMode } from "../createFormula/CreateFormulaPage";
import { CreateFormulaByAmountForm } from "../createFormula/CreateFormulaByAmountForm";
import { CreateFormulaByRatioForm } from "../createFormula/CreateFormulaByRatioForm";
import { Column } from "../../common/columnAndRows";
import { FormulaCreationInputByAmount, FormulaCreationInputByRatio } from "../../../data/FormulaRepo";
import BigNumber from "bignumber.js";

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});


export interface EditFormulaDialogProps {
    openDialog: boolean
    formula: Formula.Type
    onCloseDialog: () => void
    onEditByRatio: (input: FormulaCreationInputByRatio) => void
    onEditByAmount: (input: FormulaCreationInputByAmount) => void
}

const editFormulaFormId = "edit-formula-form"
export function EditFormulaDialog({
    openDialog,
    onCloseDialog,
    formula,
    onEditByAmount,
    onEditByRatio
}: EditFormulaDialogProps) {

    const uiText = AppUiText.useCtx().text
    const editFormulaDialogUiText = uiText.editFormulaDialog


    const createByRatioInitialState: FormulaCreationInputByRatio = useMemo(() => ({
        name: formula.name,
        note: formula.note,
        baseIngredient: {
            name: formula.baseIngredient.name,
            defaultAmount: formula.baseIngredient.defaultAmount,
            unitType: formula.baseIngredient.unitType,
            baseUnit: formula.baseIngredient.baseUnit
        },
        otherIngredients: formula.otherIngredients.map((otherIngredient) => ({
            name: otherIngredient.name,
            ratio: otherIngredient.ratio,
            unitType: otherIngredient.unitType,
            baseUnit: otherIngredient.baseUnit
        }))
    }), [formula])

    const createByAmountInitialState: FormulaCreationInputByAmount = useMemo(() => {
        const baseAmount = BigNumber(formula.baseIngredient.defaultAmount ?? 1) 
        return ({
            name: formula.name,
            note: formula.note,
            baseIngredient: {
                name: formula.baseIngredient.name,
                amount: baseAmount.toNumber(),
                unitType: formula.baseIngredient.unitType,
                baseUnit: formula.baseIngredient.baseUnit
            },
            otherIngredients: formula.otherIngredients.map((otherIngredient) => ({
                name: otherIngredient.name,
                amount: baseAmount.multipliedBy(otherIngredient.ratio).toNumber(),
                unitType: otherIngredient.unitType,
                baseUnit: otherIngredient.baseUnit
            }))
        })
    }, [formula])

    // states
    const [createMode, setCreateMode] = useState<CreateMode>(() =>
        formula.baseIngredient.defaultAmount === undefined ? CreateMode.ByRatio : CreateMode.ByAmount
    )

    // events
    const onChangeCreateMode = (_event: React.MouseEvent<unknown>, value: CreateMode) => {
        setCreateMode(value)
    }

    return <Dialog open={openDialog} fullScreen onClose={onCloseDialog} TransitionComponent={Transition} sx={{maxHeight: "100vh"}}>
        <AppBar sx={{ position: "relative" }}>

            <Toolbar>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={onCloseDialog}
                    aria-label="close"
                >
                    <CloseIcon />
                </IconButton>
                <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                    {editFormulaDialogUiText.dialogTitle}
                </Typography>
                <Button autoFocus color="inherit" type="submit" form={editFormulaFormId}>
                    {editFormulaDialogUiText.editFormulaBtn}
                </Button>
            </Toolbar>
        </AppBar>
        <Container maxWidth="sm" sx={(theme) => ({ paddingY: theme.spacing(1), flexGrow: 1, overflow: "scroll" })}>
            <Column spacing={3}>

                <ToggleButtonGroup sx={{ alignSelf: "center" }}
                    exclusive
                    value={createMode}
                    onChange={onChangeCreateMode}
                >
                    <ToggleButton value={CreateMode.ByRatio}>
                        {editFormulaDialogUiText.editByRatio}
                    </ToggleButton>
                    <ToggleButton value={CreateMode.ByAmount}>
                        {editFormulaDialogUiText.editByAmount}
                    </ToggleButton>
                </ToggleButtonGroup>

                {createMode === CreateMode.ByRatio &&
                    <CreateFormulaByRatioForm
                        onCreate={onEditByRatio}
                        formId={editFormulaFormId}
                        initialState={createByRatioInitialState}
                    />
                }

                {createMode === CreateMode.ByAmount &&
                    <CreateFormulaByAmountForm
                        onCreate={onEditByAmount}
                        formId={editFormulaFormId}
                        initialState={createByAmountInitialState}
                    />
                }

            </Column>
        </Container>
    </Dialog>

}