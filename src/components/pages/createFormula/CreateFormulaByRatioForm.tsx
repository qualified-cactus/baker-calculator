import { Box, Button, IconButton, Paper, TextField, Typography } from "@mui/material";
import React, { useState } from "react";
import { AppUiText } from "../../AppUiText";
import { DefaultMassUnit, DefaultVolumeUnit, MassUnit, UnitType, VolumeUnit } from "../../../data/Measurement";
import { DragableList } from "../../common/DraggableList";
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import { FormulaCreationInputByRatio } from "../../../data/FormulaRepo";
import { UnitSelector } from "../../common/unitSelectors";
import { CreateFormulaFormProps, TextFieldChangeEvent, toBaseUnit } from "./CreateFormulaPage";

/**
 * Form shared by "create formula" page and "edit formula" page.
 * To reset form, change {@link resetForm} or {@link initialState} props
 */
export function CreateFormulaByRatioForm({
    initialState, onCreate, formId
}: CreateFormulaFormProps<FormulaCreationInputByRatio>) {
    const uiText = AppUiText.useCtx().text.createFormulaPage;

    // states
    const [formulaName, setFormulaName] = useState<string>(initialState?.name ?? "");
    const [formulaNote, setFormulaNote] = useState<string>(initialState?.note ?? "");

    const [baseIngredientName, setBaseIngredientName] = useState<string>(initialState?.baseIngredient.name ?? "");
    const [baseIngredientUnitType, setBaseIngredientUnitType] = useState<UnitType>(initialState?.baseIngredient.unitType ?? "mass");
    const [baseIngredientMassUnit, setBaseIngredientMassUnit] = useState<MassUnit>(() => (initialState && initialState.baseIngredient.unitType === "mass") ?
        initialState.baseIngredient.baseUnit as MassUnit : DefaultMassUnit
    );
    const [baseIngredientVolumeUnit, setBaseIngredientVolumeUnit] = useState<VolumeUnit>(() => (initialState && initialState.baseIngredient.unitType === "volume") ?
        initialState.baseIngredient.baseUnit as VolumeUnit : DefaultVolumeUnit
    );

    const [otherIngredients, setOtherIngredients] = useState<{
        name: string; ratio: string; unitType: UnitType;
        massUnit: MassUnit; volumeUnit: VolumeUnit;
    }[]>(() => {
        if (initialState) {
            return initialState.otherIngredients.map((o) => ({
                name: o.name,
                ratio: o.ratio.toString(),
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
            name: "", ratio: "0",
            unitType: "mass",
            massUnit: DefaultMassUnit,
            volumeUnit: DefaultVolumeUnit
        }]);
    };
    const onRemoveOtherIngredient = (index: number) => () => {
        setOtherIngredients(otherIngredients.toSpliced(index, 1));
    };
    const onSwitchOtherIngredientsIndex = (fromIndex: number, toIndex: number) => {
        let i1: number;
        let i2: number;
        if (fromIndex <= toIndex) {
            i1 = fromIndex;
            i2 = toIndex;
        } else {
            i1 = toIndex;
            i2 = fromIndex;
        }
        setOtherIngredients([
            ...otherIngredients.slice(0, i1),
            otherIngredients[i2],
            ...otherIngredients.slice(i1 + 1, i2),
            otherIngredients[i1],
            ...otherIngredients.slice(i2 + 1)
        ]);
    };
    const onChangeOtherIngredientName = (index: number) => (e: TextFieldChangeEvent) => {
        setOtherIngredients(otherIngredients.toSpliced(
            index, 1,
            { ...otherIngredients[index], name: e.target.value }
        ));
    };
    const onChangeOtherIngredientRatio = (index: number) => (e: TextFieldChangeEvent) => {
        setOtherIngredients(otherIngredients.toSpliced(
            index, 1,
            { ...otherIngredients[index], ratio: e.target.value }
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
                unitType: baseIngredientUnitType,
                baseUnit: toBaseUnit(baseIngredientUnitType, baseIngredientMassUnit, baseIngredientVolumeUnit),
            },
            otherIngredients: otherIngredients.map((o) => ({
                name: o.name,
                ratio: Number(o.ratio),
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
            <DragableList
                items={otherIngredients}
                onSwitch={onSwitchOtherIngredientsIndex}
            >
                {(ingredient, i) => <Box sx={(theme) => ({ display: "flex", gap: theme.spacing(1), alignItems: "center" })}>
                    <Box sx={(theme) => ({
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "stretch",
                        gap: theme.spacing(1),
                        width: "100%"
                    })}>
                        <TextField required size="small" multiline
                            label={uiText.ingredient}
                            value={ingredient.name}
                            onChange={onChangeOtherIngredientName(i)} />
                        <TextField required size="small" type="number"
                            inputProps={{ step: "0.01", min: 0 }}
                            label={uiText.ratio}
                            value={ingredient.ratio}
                            onChange={onChangeOtherIngredientRatio(i)} />
                        <UnitSelector
                            unitType={ingredient.unitType}
                            onChangeUnitType={onChangeOtherIngredientUnitType(i)}
                            massUnit={ingredient.massUnit}
                            onChangeMassUnit={onChangeOtherIngredientMassUnit(i)}
                            volumeUnit={ingredient.volumeUnit}
                            onChangeVolumeUnit={onChangeOtherIngredientVolumeUnit(i)}
                            size="small" />
                    </Box>
                    <div>
                        <IconButton onClick={onRemoveOtherIngredient(i)} type="button" size="small">
                            <ClearIcon />
                        </IconButton>
                    </div>
                </Box>}
            </DragableList>
            <div>
                <Button variant="contained" size="small" type="button" onClick={onAddOtherIngredient}>
                    <AddIcon />
                </Button>
            </div>
        </Paper>
    </Box>;
}
