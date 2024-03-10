
export type IUiText = typeof EnUiText
export const EnUiText = {
    layout: {
        appBarTitle: "Baker's Calculator",
        home: "Pinned result(s)",
        createFormula: "Create Formula",
        formula: "Formula",
        appData: "App Data",
        about: "About"
    },
    home: {
        pageTitle: "Pinned Result(s)"
    },
    createFormulaPage: {
        pageTitle: "Create Formula",

        createByRatio: "Create By Ratio",
        createByAmount: "Create By Amount",
        measurementType: "Measurement type",
        mass: "Mass",
        volume: "Volume",

        // input label
        formulaName: "Formula's name",
        note: "Note",
        baseIngredientName: "Base ingredient name",
        otherIngredients: "Other Ingredients",
        askGoToCreatedFormula: (formulaName: string)=> 
            `Formula \"${formulaName}\" have been created, use it now ?`,

        baseIngredient: "Base ingredient",
        baseIngredientAmount: "Base ingredient's amount",
        baseIngredientUnit: "Base ingredient's unit",
        ingredient: "Ingredient",
        amount: "Amount",
        unit: "Unit",
        ratio: "Ratio",

        createFormula: "Create Formula",
    },
    formulaDetailPage: {
        editFormula: "Edit formula",
        deleteFormula: "Delete formula",
        confirmDeleteFormula: "Delete formula?",
        formulaDeleted: "Formula deleted",
        totalAmount: "Total amount",
        saveCurrentResult: "Save current result",
        formulaResultSaved: "Formula's result saved",
        confirmSavingResultToRecipe: "Save current formula's result to recipe?",
        viewSavedResults: "View saved results",
    },
    formulaListPage: {
        pageTitle: "Your formula(s)",

        sortOrderSlct: "Sort order",
        sortBySlct: "Sort by",
        createdAtOpt: "Created at",
        nameOpt: "Name",
        ascendingOpt: "Ascending",
        descendingOpt: "Descending",
    },
    recipeListPage: {
        pageTitle: (formulaName: string)=> `\"${formulaName}\" 's result(s)`,
        savedResult: "Saved result(s)",

        createdAtTxt: (s: string) => `Created at: ${s}`,

        sortOrderSlct: "Sort order",
        sortBySlct: "Sort by",
        createdAtOpt: "Created at:",
        amountOpt: "Amount",
        ascendingOpt: "Ascending",
        descendingOpt: "Descending",
    },
    recipeDetailPage: {
        confirmDeletingRecipe: "Delete formula's result ?",
        deletingRecipe: "Deleting saved result",
        recipePinned: "Result is pinned",

        // table
        ingredientHd: "Ingredient",
        amountHd: "Amount"
    },
    editFormulaDialog: {
        dialogTitle: "Edit Formula",
        warning: "Warning: Editing a formula will delete all of its saved result(s)",
        formulaNotFoundError: "Can't edit formula. Formula not found.",

        editByRatio: "By Ratio",
        editByAmount: "By Amount",


        // inputs
        formulaName: "Formula's name",
        note: "Note",
        baseIngredient: "Base Ingredient",
        ingredient: "Ingredient",
        amount: "Amount",
        measurement: "Measurement",
        ratio: "Ratio",
        addIngredient: "Add Ingredient",

        // validation
        formulaNameAlreadyExists: "Formula name already exists",

        //buttons
        editFormulaBtn: "Edit"
    }
}
