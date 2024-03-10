import { DatabaseDef, IndexDef, ObjectStoreDef } from "@qualified-cactus/promised-db"
import { nsPrefix } from "../LocalStorageKeys"
import { MassUnit, UnitType, VolumeUnit } from "./Measurement"

export namespace Formula {
    export interface TypeWithoutKey {
        name: string
        baseIngredient: {
            name: string
            defaultAmount?: number
            unitType: UnitType
            baseUnit: MassUnit | VolumeUnit
        }
        otherIngredients: {
            name: string
            ratio: number
            unitType: UnitType
            baseUnit: MassUnit | VolumeUnit
        }[]
        note: string
        createdAt: number
    }
    export interface Type extends TypeWithoutKey {
        id: number
    }
    export const ObjectStore: ObjectStoreDef<Type, number, TypeWithoutKey> = {
        name: `${nsPrefix}formula`,
        options: {
            keyPath: "id",
            autoIncrement: true
        },
    }
    export const NameIndex = new IndexDef<string>(
        "name", "name"
    )
    export const CreatedAtIndex = new IndexDef<number>(
        "createdAt", "createdAt"
    )
}

export namespace SavedResult {
    export interface TypeWithoutId {
        formulaId: number
        baseIngredientAmount: number
        createdAt: number
    }
    export interface Type extends TypeWithoutId {
        id: number
    }
    export const ObjectStore: ObjectStoreDef<Type, number, TypeWithoutId> = {
        name: `${nsPrefix}saved-result`,
        options: {
            keyPath: "id",
            autoIncrement: true,
        },
    }
    export const FormulaIdIndex = new IndexDef<number>(
        "formulaId", "formulaId"
    )
    export const CreatedAtIndex = new IndexDef<number>(
        "createdAt", "createdAt"
    )
}


const sampleFormula: Formula.TypeWithoutKey = {
    name: "Sandwich bread",
    baseIngredient: {
        name: "White flour (13% protein)",
        defaultAmount: 300,
        unitType: "mass",
        baseUnit: "g"
    },
    note: "A basic white sandwich.",
    createdAt: Date.now(),
    otherIngredients: [
        {
            name: "Water",
            ratio: 0.6,
            unitType: "mass",
            baseUnit: "g"
        },
        {
            name: "Butter",
            ratio: 0.06,
            unitType: "mass",
            baseUnit: "g"
        },
        {
            name: "Vinegar",
            ratio: 0.05,
            unitType: "mass",
            baseUnit: "g"
        },
        {
            name: "Sugar",
            ratio: 0.02,
            unitType: "mass",
            baseUnit: "g"
        },
        {
            name: "Salt",
            ratio: 0.01,
            unitType: "mass",
            baseUnit: "g"
        },
        {
            name: "Yeast",
            ratio: 0.01,
            unitType: "mass",
            baseUnit: "g"
        },

    ]
}

export const BakerRatioCalcDbDef = new DatabaseDef(
    `${nsPrefix}database`, 1,
    (db, oldVersion, _) => {
        if (oldVersion < 1) {
            const formulaOs = db.createObjectStore(Formula.ObjectStore)
            formulaOs.createIndex(Formula.NameIndex)
            formulaOs.createIndex(Formula.CreatedAtIndex)
            formulaOs.add(sampleFormula)
            
            const savedResultOs = db.createObjectStore(SavedResult.ObjectStore)
            savedResultOs.createIndex(SavedResult.FormulaIdIndex)
            savedResultOs.createIndex(SavedResult.CreatedAtIndex)
        }
    }
)


