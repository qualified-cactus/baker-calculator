import { Paper, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Typography } from "@mui/material";
import { Formula, SavedResult } from "../../../data/BakerRatioCalcDb";
import { AppUiText } from "../../AppUiText";
import { Column } from "../../common/columnAndRows";
import { ReactNode, ReactElement, useMemo, useState } from "react";
import { MassUnit, VolumeUnit, UnitType, AmountConverter } from "../../../data/Measurement";
import { MassUnitSelector, VolumeUnitSelector } from "../../common/unitSelectors";
import BigNumber from "bignumber.js";

const unitSelectWidth = "7rem"

export function FormulaDetail({
    formula, initialResult, formId, onSubmit
}: {
    formula: Formula.Type,
    initialResult: SavedResult.Type | null,
    formId: string,
    onSubmit: (baseAmountInBaseUnit: BigNumber) => void
}) {
    const uiText = AppUiText.useCtx().text
    const formulaDetailUiText = uiText.formulaDetailPage

    const defaultBaseIngredientAmount = useMemo(() => {
        const out = initialResult ?
            initialResult.baseIngredientAmount : (formula.baseIngredient.defaultAmount ?? 0)
        return BigNumber(out)
    }, [formula, initialResult])

    const allMass = useMemo(() => {
        let allMass = formula.baseIngredient.unitType === "mass"
        if (allMass) {
            for (let otherIngredient of formula.otherIngredients) {
                if (otherIngredient.unitType !== "mass") {
                    allMass = false
                    break
                }
            }
        }
        return allMass
    }, [formula])



    // states
    type Amount = { amount: string, unit: MassUnit | VolumeUnit }
    const [baseIngredientAmount, setBaseIngredientAmount] = useState<Amount>(() => ({
        amount: defaultBaseIngredientAmount.toString(),
        unit: formula.baseIngredient.baseUnit
    }))

    const [otherIngredientsAmount, setOtherIngredientsAmount] = useState<Amount[]>(() =>
        formula.otherIngredients.map((otherIngredient) => ({
            amount: defaultBaseIngredientAmount.multipliedBy(otherIngredient.ratio).toString(),
            unit: otherIngredient.baseUnit
        }))
    )

    const [totalAmount, setTotalAmount] = useState<Amount | null>(() => {
        if (allMass) {
            if (defaultBaseIngredientAmount.isZero()) {
                return { amount: "0", unit: formula.baseIngredient.baseUnit }
            }
            const totalAmountBaseUnit = formula.baseIngredient.baseUnit as MassUnit
            const totalAmount = formula.otherIngredients.reduce((acc, otherIngredient) =>
                acc.plus(AmountConverter.convertMassAmount(
                    defaultBaseIngredientAmount.multipliedBy(otherIngredient.ratio),
                    otherIngredient.baseUnit as MassUnit,
                    totalAmountBaseUnit,
                )),
                defaultBaseIngredientAmount
            ).toString()
            return {
                amount: totalAmount,
                unit: totalAmountBaseUnit
            }
        } else {
            return null
        }
    })




    // events
    const onChangeBaseIngredientAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = BigNumber(e.target.value)
        let baseAmountInBaseUnit: BigNumber = convertAmount(
            newAmount,
            formula.baseIngredient.unitType,
            baseIngredientAmount.unit,
            formula.baseIngredient.baseUnit
        )

        const newOtherIngredientsAmount: BigNumber[] = otherIngredientsAmount.map((ingredientAmount, i) => {
            const otherIngredient = formula.otherIngredients[i]
            const otherAmountInBaseUnit = baseAmountInBaseUnit.multipliedBy(otherIngredient.ratio)

            let otherAmountInCurUnit: BigNumber = convertAmount(
                otherAmountInBaseUnit,
                otherIngredient.unitType,
                otherIngredient.baseUnit,
                ingredientAmount.unit,
            )
            return otherAmountInCurUnit
        })

        setBaseIngredientAmount({ ...baseIngredientAmount, amount: newAmount.toString() })
        setOtherIngredientsAmount(
            newOtherIngredientsAmount.map((amount, i) => ({
                amount: amount.toString(),
                unit: otherIngredientsAmount[i].unit,
            }))
        )
        if (totalAmount !== null) {
            const totalAmountInBaseUnit = newOtherIngredientsAmount.reduce(
                (acc, otherIngredientAmount, i) => {
                    return acc.plus(
                        AmountConverter.convertMassAmount(
                            otherIngredientAmount,
                            otherIngredientsAmount[i].unit as MassUnit,
                            totalAmount.unit as MassUnit,
                        )
                    )
                },
                AmountConverter.convertMassAmount(
                    baseAmountInBaseUnit,
                    formula.baseIngredient.baseUnit as MassUnit,
                    totalAmount.unit as MassUnit
                )
            )
            setTotalAmount({
                amount: totalAmountInBaseUnit.toString(),
                unit: totalAmount.unit
            })
        }
    }
    const onChangeBaseIngredientAmountUnit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUnit = e.target.value as MassUnit | VolumeUnit
        setBaseIngredientAmount({
            amount: convertAmount(
                BigNumber(baseIngredientAmount.amount),
                formula.baseIngredient.unitType,
                baseIngredientAmount.unit,
                newUnit,
            ).toString(),
            unit: newUnit,
        })
    }
    const onChangeOtherIngredientAmount = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const otherIngredient = formula.otherIngredients[index]
        const newOtherIngredientAmount = BigNumber(e.target.value)
        const newOtherIngredientAmountInBaseUnit = convertAmount(
            newOtherIngredientAmount,
            otherIngredient.unitType,
            otherIngredientsAmount[index].unit,
            otherIngredient.baseUnit
        )

        const newBaseIngredientAmountInBaseUnit = newOtherIngredientAmountInBaseUnit.dividedBy(otherIngredient.ratio)
        const newBaseIngredientAmountInCurrentUnit = convertAmount(
            newBaseIngredientAmountInBaseUnit,
            formula.baseIngredient.unitType,
            formula.baseIngredient.baseUnit,
            baseIngredientAmount.unit
        )

        const newOtherIngredientsAmount: BigNumber[] = formula.otherIngredients.map((otherIngredient, i) => {
            if (i === index) {
                return newOtherIngredientAmount
            } else {
                return convertAmount(
                    newBaseIngredientAmountInBaseUnit.multipliedBy(otherIngredient.ratio),
                    otherIngredient.unitType,
                    otherIngredient.baseUnit,
                    otherIngredientsAmount[i].unit
                )
            }
        })
        if (totalAmount !== null) {
            const totalAmountInBaseUnit = newOtherIngredientsAmount.reduce(
                (acc, otherIngredientAmount, i) => {
                    return acc.plus(
                        AmountConverter.convertMassAmount(
                            otherIngredientAmount,
                            otherIngredientsAmount[i].unit as MassUnit,
                            totalAmount.unit as MassUnit,
                        )
                    )
                },
                AmountConverter.convertMassAmount(
                    newBaseIngredientAmountInBaseUnit,
                    formula.baseIngredient.baseUnit as MassUnit,
                    totalAmount.unit as MassUnit
                )
            )
            setTotalAmount({
                amount: totalAmountInBaseUnit.toString(),
                unit: totalAmount.unit
            })
        }

        setOtherIngredientsAmount(otherIngredientsAmount.map((otherIngredientAmount, i) => ({
            unit: otherIngredientAmount.unit,
            amount: newOtherIngredientsAmount[i].toString(),
        })))
        setBaseIngredientAmount({
            unit: baseIngredientAmount.unit,
            amount: newBaseIngredientAmountInCurrentUnit.toString()
        })
    }
    const onChangeOtherIngredientAmountUnit = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUnit = e.target.value as MassUnit | VolumeUnit
        const oldAmount = otherIngredientsAmount[index]
        setOtherIngredientsAmount(
            otherIngredientsAmount.toSpliced(index, 1, {
                unit: newUnit,
                amount: convertAmount(
                    BigNumber(oldAmount.amount),
                    formula.otherIngredients[index].unitType,
                    oldAmount.unit,
                    newUnit
                ).toString()
            })
        )
    }
    const onChangeTotalAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
        const one = BigNumber(1)
        if (totalAmount !== null) {
            const newTotalAmount = BigNumber(e.target.value)

            const totalRatio = formula.otherIngredients.reduce(
                (acc, otherIngredient) => {
                    return acc.plus(
                        AmountConverter.convertMassAmount(
                            one,
                            otherIngredient.baseUnit as MassUnit,
                            totalAmount.unit as MassUnit,
                        ).multipliedBy(otherIngredient.ratio)
                    )
                },
                AmountConverter.convertMassAmount(
                    one,
                    formula.baseIngredient.baseUnit as MassUnit,
                    totalAmount.unit as MassUnit
                )
            )

            const newBaseAmountInBaseUnit = newTotalAmount.dividedBy(totalRatio)
            const newBaseAmountInCurUnit = AmountConverter.convertMassAmount(
                newBaseAmountInBaseUnit,
                formula.baseIngredient.baseUnit as MassUnit,
                baseIngredientAmount.unit as MassUnit,
            )
            const newOtherIngredientsAmount = formula.otherIngredients.map((otherIngredient, i) => {
                const otherIngredientAmount = otherIngredientsAmount[i]
                return {
                    unit: otherIngredientAmount.unit,
                    amount: AmountConverter.convertMassAmount(
                        newBaseAmountInBaseUnit.multipliedBy(otherIngredient.ratio),
                        otherIngredient.baseUnit as MassUnit,
                        otherIngredientAmount.unit as MassUnit
                    ).toString()
                }
            })

            setBaseIngredientAmount({ unit: baseIngredientAmount.unit, amount: newBaseAmountInCurUnit.toString() })
            setOtherIngredientsAmount(newOtherIngredientsAmount)
            setTotalAmount({ unit: totalAmount.unit, amount: newTotalAmount.toString() })
        }
    }
    const onChangeTotalAmountUnit = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (totalAmount !== null) {
            const newUnit = e.target.value as MassUnit
            setTotalAmount({
                unit: newUnit,
                amount: AmountConverter.convertMassAmount(
                    BigNumber(totalAmount.amount),
                    totalAmount.unit as MassUnit,
                    newUnit
                ).toString()
            })
        }
    }
    const onSaveCurrentResult = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(convertAmount(
            BigNumber(baseIngredientAmount.amount),
            formula.baseIngredient.unitType,
            baseIngredientAmount.unit, formula.baseIngredient.baseUnit)
        )
    }


    return <Column spacing={3}>
        <form id={formId} hidden onSubmit={onSaveCurrentResult} />
        <Typography>
            {formula.note}
        </Typography>

        <TableContainer component={Paper} elevation={3}>
            <Table>
                <TableBody>
                    <IngredientTableRow
                        required
                        ingredientName={formula.baseIngredient.name}
                        amount={baseIngredientAmount.amount}
                        onAmountChange={onChangeBaseIngredientAmount}
                        unit={baseIngredientAmount.unit}
                        onUnitChange={onChangeBaseIngredientAmountUnit}
                        unitType={formula.baseIngredient.unitType}
                        formId={formId}
                    />
                    {formula.otherIngredients.map((otherIngredient, i) => {
                        const amount = otherIngredientsAmount[i]
                        return <IngredientTableRow key={i}
                            ingredientName={otherIngredient.name}
                            amount={amount.amount}
                            onAmountChange={onChangeOtherIngredientAmount(i)}
                            unit={amount.unit}
                            onUnitChange={onChangeOtherIngredientAmountUnit(i)}
                            unitType={otherIngredient.unitType}
                            formId={formId}
                        />
                    })}
                    {totalAmount !== null &&
                        <IngredientTableRow
                            ingredientName={<b>{formulaDetailUiText.totalAmount}</b>}
                            amount={totalAmount.amount}
                            onAmountChange={onChangeTotalAmount}
                            unit={totalAmount.unit}
                            onUnitChange={onChangeTotalAmountUnit}
                            unitType={"mass"}
                            formId={formId}
                        />
                    }
                </TableBody>
            </Table>
        </TableContainer>
    </Column >

}


interface IngredientTableRowProps {
    ingredientName: ReactNode
    amount: string
    onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    unit: MassUnit | VolumeUnit
    onUnitChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    unitType: UnitType
    required?: boolean
    formId: string
}
function IngredientTableRow(props: IngredientTableRowProps): ReactElement {
    const uiText = AppUiText.useCtx().text.createFormulaPage
    return <TableRow>
        <TableCell>{props.ingredientName}</TableCell>
        <TableCell sx={{ display: "flex" }}>
            <TextField
                required={props.required}
                label={uiText.amount}
                type="number" size="small"
                inputProps={{ min: 0, form: props.formId, step: "any" }}
                value={props.amount}
                onChange={props.onAmountChange}
            />
            {props.unitType === "mass" &&
                <MassUnitSelector
                    sx={{ width: unitSelectWidth }} size="small"
                    label={uiText.unit}
                    value={props.unit}
                    onChange={props.onUnitChange}
                />
            }
            {props.unitType === "volume" &&
                <VolumeUnitSelector
                    sx={{ width: unitSelectWidth }} size="small"
                    label={uiText.unit}
                    value={props.unit}
                    onChange={props.onUnitChange}
                />
            }
        </TableCell>
    </TableRow>
}

function convertAmount(
    amount: BigNumber, unitType: UnitType,
    fromUnit: MassUnit | VolumeUnit, toUnit: MassUnit | VolumeUnit
): BigNumber {
    let out: BigNumber
    switch (unitType) {
        case "mass": out = AmountConverter.convertMassAmount(
            amount, fromUnit as MassUnit, toUnit as MassUnit
        ); break
        case "volume": out = AmountConverter.convertVolumeAmount(
            amount, fromUnit as VolumeUnit, toUnit as VolumeUnit
        ); break
    }
    return out
}