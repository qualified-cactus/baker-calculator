const pathPrefix = "/app";

function query(key: string, value?: string) {

    return value === undefined ?
        "" : `${key}=${value}`
}


export let Paths = Object.freeze({
    HOME_PAGE: pathPrefix,
    FORMULA_LIST: `${pathPrefix}/formula`,
    FORMULA_DETAIL: (formulaId: string, resultId?: string) =>
        `${pathPrefix}/formula/${formulaId}?${query("resultId", resultId)}`,
    EDIT_FORMULA: (formulaId: string) => `${pathPrefix}/formula/${formulaId}/edit`,
    RECIPE_LIST: (formulaId: string) => `${pathPrefix}/formula/${formulaId}/recipe`,
    RECIPE_DETAIL: (recipeId: string) => `${pathPrefix}/recipe/${recipeId}`,
    CREATE_FORMULA: `${pathPrefix}/createFormula`,

    APP_DATA: `${pathPrefix}/data`,
    ABOUT: `${pathPrefix}/about`
});


