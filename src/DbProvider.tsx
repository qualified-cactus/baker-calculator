import { Database } from "@qualified-cactus/promised-db";
import { BakerRatioCalcDbDef } from "./data/BakerRatioCalcDb";
import { FormulaRepo } from "./data/FormulaRepo";

export namespace AppDatabase {
    interface Container {
        formulaDao: FormulaRepo
    }
    let instance: Database|null = null
    let container: Container|null = null
    export function getInstance(): Container {
        return container!
    }

    export async function openDb() {
        instance = await BakerRatioCalcDbDef.open()
        container = {
            formulaDao: new FormulaRepo(instance)
        }
    }
}