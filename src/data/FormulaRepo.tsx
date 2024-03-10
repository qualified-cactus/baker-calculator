import { Database, Transaction } from "@qualified-cactus/promised-db";
import { Formula, SavedResult } from "./BakerRatioCalcDb";
import { MassUnit, UnitType, VolumeUnit } from "./Measurement";
import BigNumber from "bignumber.js";

export class FormulaRepo {
    private db: Database
    constructor(db: Database) {
        this.db = db
    }


    async addFormulaByRatio(value: FormulaCreationInputByRatio): Promise<number> {
        return await this.db.transaction([Formula.ObjectStore], "readwrite", async (transaction) => {
            const formula = transaction.objectStore(Formula.ObjectStore)
            return await formula.add({
                ...value,
                createdAt: Date.now()
            })
        })
    }

    async addFormulaByAmount(value: FormulaCreationInputByAmount): Promise<number> {
        let ratioList: number[] = value.otherIngredients.map((otherIngredient) =>
            BigNumber(otherIngredient.amount).dividedBy(value.baseIngredient.amount).toNumber()
        )
        const objToAdd: Formula.TypeWithoutKey = {
            name: value.name,
            baseIngredient: {
                name: value.baseIngredient.name,
                defaultAmount: value.baseIngredient.amount,
                unitType: value.baseIngredient.unitType,
                baseUnit: value.baseIngredient.baseUnit
            },
            otherIngredients: value.otherIngredients.map((o, i) => ({
                name: o.name, ratio: ratioList[i],
                unitType: o.unitType, baseUnit: o.baseUnit
            })),
            note: value.note,
            createdAt: Date.now()
        }

        return await this.db.transaction([Formula.ObjectStore], "readwrite", async (transaction) => {
            return await transaction.objectStore(Formula.ObjectStore).add(objToAdd)
        })
    }

    async getFormula(formulaId: number): Promise<Formula.Type | undefined> {
        return await this.db.transaction([Formula.ObjectStore], "readonly", async (transaction) => {
            return await transaction.objectStore(Formula.ObjectStore).get(formulaId)
        })
    }

    async getFormulaSavedResults(formulaId: number): Promise<SavedResult.Type[]> {
        return await this.db.transaction([SavedResult.ObjectStore], "readonly", async (transaction) => {
            let results = await transaction.objectStore(SavedResult.ObjectStore)
                .index(SavedResult.FormulaIdIndex)
                .getAll(formulaId)
            results = results.sort((o1, o2)=> (o1.createdAt - o2.createdAt) * -1)
            return results
        })
    }

    async getSavedResult(resultId: number): Promise<SavedResult.Type | undefined> {
        return await this.db.transaction([SavedResult.ObjectStore], "readonly", async (transaction) => {
            return await transaction.objectStore(SavedResult.ObjectStore).get(resultId)
        })
    }

    async getAllSavedResult(): Promise<SavedResultWithFormula[]> {
        return await this.db.transaction([SavedResult.ObjectStore, Formula.ObjectStore], "readonly", async (transaction) => {
            const savedResultOs = transaction.objectStore(SavedResult.ObjectStore)
            const formulaOs = transaction.objectStore(Formula.ObjectStore)

            const results = Array<SavedResultWithFormula>()
            const formulaMap = new Map<number, Formula.Type>()

            savedResultOs.index(SavedResult.CreatedAtIndex)
                .iterator.iterateValues(async (cValue) => {
                    const savedResult = cValue.value
                    let formula = formulaMap.get(savedResult.formulaId)
                    if (formula === undefined) {
                        formula = await formulaOs.requireGet(savedResult.formulaId)
                        formulaMap.set(formula.id, formula)
                    }
                    results.push({ result: savedResult, formula: formula })
                }, { direction: "prev" })
            return results
        })
    }

    async saveFormulaResult(
        formulaId: number, baseIngredientAmount: number,
    ): Promise<number> {
        return await this.db.transaction([Formula.ObjectStore, SavedResult.ObjectStore], "readwrite", async (transaction) => {
            const formulaOS = transaction.objectStore(Formula.ObjectStore)
            const savedResultOS = transaction.objectStore(SavedResult.ObjectStore)

            if (await formulaOS.getPrimaryKey(formulaId) === undefined) {
                throw new FormulaNotExistError()
            }

            return await savedResultOS.add({
                formulaId: formulaId,
                baseIngredientAmount: baseIngredientAmount,
                createdAt: Date.now(),
            })
        })
    }

    async deleteFormulaResult(resultId: number) {
        return await this.db.transaction([SavedResult.ObjectStore], "readwrite", async (transaction) => {
            const savedResultOS = transaction.objectStore(SavedResult.ObjectStore)
            await savedResultOS.delete(resultId)
        })
    }

    async getFormulaList(sortBy: FormulaListSort): Promise<Formula.Type[]> {
        return await this.db.transaction([Formula.ObjectStore], "readonly", async (transaction) => {
            const list: Formula.Type[] = []

            if (sortBy.key === FormulaListSortKey.createdAt) {
                transaction.objectStore(Formula.ObjectStore)
                    .index(Formula.CreatedAtIndex).iterator
                    .iterateValues(async (v) => { list.push(v.value) }, { direction: sortBy.direction as "next" | "prev" })
            } else if (sortBy.key === FormulaListSortKey.name) {
                transaction.objectStore(Formula.ObjectStore)
                    .index(Formula.NameIndex).iterator
                    .iterateValues(async (v) => { list.push(v.value) }, { direction: sortBy.direction as "next" | "prev" })
            }
            return list
        })
    }

    async deleteFormula(formulaId: number): Promise<void> {
        await this.db.transaction([Formula.ObjectStore, SavedResult.ObjectStore], "readwrite", async (transaction) => {
            await this.deleteAllSavedResult(transaction, formulaId)
            await transaction.objectStore(Formula.ObjectStore).delete(formulaId)
        })
    }


    /**
     * 
     * @throws {FormulaNotExistError}
     */
    async editFormulaByRatio(formulaId: number, value: FormulaCreationInputByRatio): Promise<void> {
        await this.db.transaction([Formula.ObjectStore, SavedResult.ObjectStore], "readwrite", async (transaction) => {
            const formulaOs = transaction.objectStore(Formula.ObjectStore)

            await this.checkValidFormulaId(transaction, formulaId)
            await this.deleteAllSavedResult(transaction, formulaId)


            await formulaOs.put({
                ...value,
                id: formulaId,
                createdAt: Date.now()
            })
        })
    }

    /**
     * 
     * @throws {FormulaNotExistError}
     */
    async editFormulaByAmount(formulaId: number, value: FormulaCreationInputByAmount): Promise<void> {
        let ratioList: number[] = value.otherIngredients.map((otherIngredient) =>
            BigNumber(otherIngredient.amount).dividedBy(value.baseIngredient.amount).toNumber()
        )
        const objToUpdate: Formula.Type = {
            id: formulaId,
            name: value.name,
            baseIngredient: {
                name: value.baseIngredient.name,
                defaultAmount: value.baseIngredient.amount,
                unitType: value.baseIngredient.unitType,
                baseUnit: value.baseIngredient.baseUnit
            },
            otherIngredients: value.otherIngredients.map((o, i) => ({
                name: o.name, ratio: ratioList[i],
                unitType: o.unitType, baseUnit: o.baseUnit
            })),
            note: value.note,
            createdAt: Date.now()
        }

        await this.db.transaction([Formula.ObjectStore, SavedResult.ObjectStore], "readwrite", async (transaction) => {
            const formulaOs = transaction.objectStore(Formula.ObjectStore)
            await this.checkValidFormulaId(transaction, formulaId)
            await this.deleteAllSavedResult(transaction, formulaId)
            await formulaOs.put(objToUpdate)
        })
    }

    private async checkValidFormulaId(transaction: Transaction, formulaId: number) {
        if ((await transaction.objectStore(Formula.ObjectStore).getPrimaryKey(formulaId)) === undefined) {
            throw new FormulaNotExistError()
        }
    }

    private async deleteAllSavedResult(transaction: Transaction, formulaId: number) {
        const savedResultOs = transaction.objectStore(SavedResult.ObjectStore)
        // delete all saved results
        const deleteTasks = new Array<Promise<void>>()
        savedResultOs.index(SavedResult.FormulaIdIndex).iterator.iterateValues(async (cValue) => {
            deleteTasks.push(cValue.delete())
        }, {
            query: SavedResult.FormulaIdIndex.only(formulaId)
        })
        await Promise.all(deleteTasks)
    }
}


export class DataError extends Error {
}
export class FormulaNotExistError extends DataError {
}
export class InputError extends Error {
}
export class DuplicateFormulaNameError extends InputError {
}
export interface SavedResultWithFormula {
    result: SavedResult.Type
    formula: Formula.Type
}

export interface FormulaCreationInputByRatio {
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
}


export interface FormulaCreationInputByAmount {
    name: string
    baseIngredient: {
        name: string,
        amount: number,
        unitType: UnitType
        baseUnit: MassUnit | VolumeUnit
    }
    otherIngredients: {
        name: string,
        amount: number,
        unitType: UnitType
        baseUnit: MassUnit | VolumeUnit
    }[]
    note: string

}

export interface FormulaEditableDetail {
    name: string
    baseIngredient: {
        name: string
        measurement: string
    }
    otherIngredients: {
        name: string
        ratio: number
        measurement: string
    }[]
    note: string
}

export interface HomePageData {
    formulaCount: number
    pinnedRecipes: SavedResult.Type[]
    formulas: Formula.Type[]
}

export interface FormulaListSort {
    key: FormulaListSortKey
    direction: ResultSortDirection
}
export enum FormulaListSortKey {
    name = "name",
    createdAt = "createdAt"
}
export enum ResultSortDirection {
    next = "next",
    prev = "prev"
}

export interface RecipeListSort {
    key: RecipeListSortKey
    direction: ResultSortDirection
}

export enum RecipeListSortKey {
    createdAt = "createdAt",
    amount = "amount"
}

export interface RecipeDetail {
    formula: Formula.Type,
    recipe: SavedResult.Type
}