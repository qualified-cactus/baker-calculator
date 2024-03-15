import { Box, Button, IconButton, Paper, TextField, Typography } from "@mui/material";
import React, { ReactElement, useState } from "react";
import { AppUiText } from "../../AppUiText";
import { DefaultMassUnit, DefaultVolumeUnit, MassUnit, UnitType, VolumeUnit } from "../../../data/Measurement";
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import { FormulaCreationInputByAmount } from "../../../data/FormulaRepo";
import { UnitSelector } from "../../common/unitSelectors";
import { CreateFormulaFormProps, TextFieldChangeEvent, toBaseUnit } from "./CreateFormulaPage";
import { Column, Row } from "../../common/columnAndRows";



export function CreateFormulaByAmountForm({
    initialState, onCreate, formId,
}: CreateFormulaFormProps<FormulaCreationInputByAmount>): ReactElement {

    const uiText = AppUiText.useCtx().text.createFormulaPage;


    // states
    const [formulaName, setFormulaName] = useState<string>(initialState?.name ?? "");
    const [formulaNote, setFormulaNote] = useState<string>(initialState?.note ?? "");

    const [baseIngredientName, setBaseIngredientName] = useState<string>(initialState?.name ?? "");
    const [baseIngredientAmount, setBaseIngredientAmount] = useState<string>(initialState?.baseIngredient.amount?.toString() ?? "0");
    const [baseIngredientUnitType, setBaseIngredientUnitType] = useState<UnitType>(initialState?.baseIngredient.unitType ?? "mass");
    const [baseIngredientMassUnit, setBaseIngredientMassUnit] = useState<MassUnit>(() => (initialState && initialState.baseIngredient.unitType === "mass") ?
        initialState.baseIngredient.baseUnit as MassUnit : DefaultMassUnit
    );
    const [baseIngredientVolumeUnit, setBaseIngredientVolumeUnit] = useState<VolumeUnit>(() => (initialState && initialState.baseIngredient.unitType === "volume") ?
        initialState.baseIngredient.baseUnit as VolumeUnit : DefaultVolumeUnit
    );

    const [otherIngredients, setOtherIngredients] = useState<{
        name: string; amount: string; unitType: UnitType;
        massUnit: MassUnit; volumeUnit: VolumeUnit;
    }[]>(() => {
        if (initialState) {
            return initialState.otherIngredients.map((o) => ({
                name: o.name,
                amount: o.amount.toString(),
                unitType: o.unitType,
                massUnit: o.unitType === "mass" ? o.baseUnit as MassUnit : DefaultMassUnit,
                volumeUnit: o.unitType === "volume" ? o.baseUnit as VolumeUnit : DefaultVolumeUnit,
            }));
        }
        return [];
    });


    // events
    const onChangeFormulaName = (e: TextFieldChangeEvent) => {
        setFormulaName(e.target.value);
    };
    const onChangeFormulaNote = (e: TextFieldChangeEvent) => {
        setFormulaNote(e.target.value);
    };

    const onChangeBaseIngredientName = (e: TextFieldChangeEvent) => {
        setBaseIngredientName(e.target.value);
    };
    const onChangeBaseIngredientAmount = (e: TextFieldChangeEvent) => {
        setBaseIngredientAmount(e.target.value);
    };
    const onChangeBaseIngredientUnitType = (e: TextFieldChangeEvent) => {
        setBaseIngredientUnitType(e.target.value as UnitType);
    };
    const onChangeBaseIngredientMassUnit = (e: TextFieldChangeEvent) => {
        setBaseIngredientMassUnit(e.target.value as MassUnit);
    };
    const onChangeBaseIngredientVolumeUnit = (e: TextFieldChangeEvent) => {
        setBaseIngredientVolumeUnit(e.target.value as VolumeUnit);
    };

    const onAddOtherIngredient = () => {
        setOtherIngredients([...otherIngredients, {
            name: "", amount: "0",
            unitType: "mass",
            massUnit: DefaultMassUnit,
            volumeUnit: DefaultVolumeUnit
        }]);
    };
    const onRemoveOtherIngredient = (index: number) => () => {
        setOtherIngredients(otherIngredients.toSpliced(index, 1));
    };
    const onChangeOtherIngredientName = (index: number) => (e: TextFieldChangeEvent) => {
        setOtherIngredients(otherIngredients.toSpliced(
            index, 1,
            { ...otherIngredients[index], name: e.target.value }
        ));
    };
    const onChangeOtherIngredientAmount = (index: number) => (e: TextFieldChangeEvent) => {
        setOtherIngredients(otherIngredients.toSpliced(
            index, 1,
            { ...otherIngredients[index], amount: e.target.value }
        ));
    };
    const onChangeOtherIngredientUnitType = (index: number) => (e: TextFieldChangeEvent) => {
        setOtherIngredients(otherIngredients.toSpliced(
            index, 1,
            { ...otherIngredients[index], unitType: e.target.value as UnitType }
        ));
    };
    const onChangeOtherIngredientMassUnit = (index: number) => (e: TextFieldChangeEvent) => {
        setOtherIngredients(otherIngredients.toSpliced(
            index, 1,
            { ...otherIngredients[index], massUnit: e.target.value as MassUnit }
        ));
    };
    const onChangeOtherIngredientVolumeUnit = (index: number) => (e: TextFieldChangeEvent) => {
        setOtherIngredients(otherIngredients.toSpliced(
            index, 1,
            { ...otherIngredients[index], volumeUnit: e.target.value as VolumeUnit }
        ));
    };
    const onSubmitForm: React.FormEventHandler = (e) => {
        e.preventDefault();

        onCreate({
            name: formulaName,
            baseIngredient: {
                name: baseIngredientName,
                amount: Number(baseIngredientAmount),
                unitType: baseIngredientUnitType,
                baseUnit: toBaseUnit(baseIngredientUnitType, baseIngredientMassUnit, baseIngredientVolumeUnit),
            },
            otherIngredients: otherIngredients.map((o) => ({
                name: o.name,
                amount: Number(o.amount),
                unitType: o.unitType,
                baseUnit: toBaseUnit(o.unitType, o.massUnit, o.volumeUnit)
            })),
            note: formulaNote,
        });
    };


    return <Box component={"form"}
        sx={(theme) => ({
            alignSelf: "stretch",
            display: "flex", flexDirection: "column",
            alignItems: "stretch", gap: theme.spacing(2)
        })}
        onSubmit={onSubmitForm}
        id={formId}
    >
        <TextField required
            label={uiText.formulaName}
            value={formulaName}
            onChange={onChangeFormulaName} />
        <TextField multiline fullWidth
            label={uiText.note}
            value={formulaNote}
            onChange={onChangeFormulaNote} />

        <TextField required
            label={uiText.baseIngredientName}
            value={baseIngredientName}
            onChange={onChangeBaseIngredientName} />
        <TextField required
            label={uiText.baseIngredientAmount}
            value={baseIngredientAmount}
            onChange={onChangeBaseIngredientAmount}
            type="number"
            inputProps={{ min: 0 }} />
        <UnitSelector
            unitType={baseIngredientUnitType}
            onChangeUnitType={onChangeBaseIngredientUnitType}
            massUnit={baseIngredientMassUnit}
            onChangeMassUnit={onChangeBaseIngredientMassUnit}
            volumeUnit={baseIngredientVolumeUnit}
            onChangeVolumeUnit={onChangeBaseIngredientVolumeUnit} />

        <Paper elevation={1} sx={(theme) => ({ padding: theme.spacing(1), display: "flex", flexDirection: "column", gap: theme.spacing(2) })}>
            <Typography variant="body1">
                {uiText.otherIngredients}
            </Typography>
            {otherIngredients.map((ingredient, i) =>
                <Row key={i} spacing={1} sx={{alignItems: "center"}}>
                    <Column spacing={1} sx={{ flexGrow: 1, alignItems: "stretch"}}>
                        <TextField required size="small" multiline
                            label={uiText.ingredient}
                            value={ingredient.name}
                            onChange={onChangeOtherIngredientName(i)} />
                        <TextField required size="small" type="number"
                            inputProps={{ step: "1", min: 0 }}
                            label={uiText.amount}
                            value={ingredient.amount}
                            onChange={onChangeOtherIngredientAmount(i)} />
                        <UnitSelector
                            unitType={ingredient.unitType}
                            onChangeUnitType={onChangeOtherIngredientUnitType(i)}
                            massUnit={ingredient.massUnit}
                            onChangeMassUnit={onChangeOtherIngredientMassUnit(i)}
                            volumeUnit={ingredient.volumeUnit}
                            onChangeVolumeUnit={onChangeOtherIngredientVolumeUnit(i)}
                            size="small" />
                    </Column>
                    <div>
                        <IconButton onClick={onRemoveOtherIngredient(i)} type="button" size="small">
                            <ClearIcon />
                        </IconButton>
                    </div>
                </Row>
            )}
            <div>
                <Button variant="contained" size="small" type="button" onClick={onAddOtherIngredient}>
                    <AddIcon />
                </Button>
            </div>
        </Paper>
    </Box>;
}
