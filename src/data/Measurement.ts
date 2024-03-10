import BigNumber from "bignumber.js"



export type UnitType = "mass" | "volume"

/**
 * Reference: https://www.nist.gov/pml/owm/si-units-mass
 */
export type MassUnit =
    "mg"
    | "cg"
    | "dg"
    | "g" // <-- base unit
    | "dag"
    | "hg"
    | "kg"
    | "t"

/**
 * Reference: https://www.nist.gov/pml/owm/si-units-volume
 */
export type VolumeUnit =
    "mL" // <-- base unit
    | "cL"
    | "dL"
    | "L"
    | "daL"
    | "hL"
    | "kL"


export const DefaultVolumeUnit: VolumeUnit = "mL"
export const DefaultMassUnit: MassUnit = "g"

/**
 * Relative to gram
 */
const MassUnitTable: Readonly<Record<MassUnit, BigNumber>> = Object.freeze({
    "mg": BigNumber(1000),
    "cg": BigNumber(100),
    "dg": BigNumber(10),
    "g": BigNumber(1),
    "dag": BigNumber(0.1),
    "hg": BigNumber(0.01),
    "kg": BigNumber(0.001),
    "t": BigNumber(0.000001)
})

/**
 * Relative to milliliter
 */
const VolumeUnitTable: Readonly<Record<VolumeUnit, BigNumber>> = {
    "mL": BigNumber(1),
    "cL": BigNumber(10),
    "dL": BigNumber(100),
    "L": BigNumber(1_000),
    "daL": BigNumber(10_000),
    "hL": BigNumber(100_000),
    "kL": BigNumber(1_000_000)
}


export const AmountConverter = {
    convertMassAmount(amount: BigNumber, fromUnit: MassUnit, toUnit: MassUnit): BigNumber {
        return amount.dividedBy(MassUnitTable[fromUnit]).multipliedBy(MassUnitTable[toUnit])
    },
    convertVolumeAmount(amount: BigNumber, fromUnit: VolumeUnit, toUnit: VolumeUnit): BigNumber {
        return amount.dividedBy(VolumeUnitTable[fromUnit]).multipliedBy(VolumeUnitTable[toUnit])
    },
}
