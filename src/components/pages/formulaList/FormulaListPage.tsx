import { ReactElement, useEffect, useState } from "react";
import { Formula } from "../../../data/BakerRatioCalcDb";
import { FormulaListSort, FormulaListSortKey, ResultSortDirection } from "../../../data/FormulaRepo";
import { LocalStorageKeys } from "../../../LocalStorageKeys";
import { AppUiText } from "../../AppUiText";
import { LoadingCover } from "../../LoadingCover";
import { AppDatabase } from "../../../DbProvider";
import { Card, CardHeader, TextField } from "@mui/material";
import { Column, Row } from "../../common/columnAndRows";
import { Link as RouterLink } from "react-router-dom"
import { Paths } from "../../../Paths";
import { useMainLayoutCtx } from "../../MainLayout";


export function FormulaListPage(): ReactElement {
    const formulaDao = AppDatabase.getInstance().formulaDao
    const loading = LoadingCover.useLoadingCoverContext().loading
    const uiText = AppUiText.useCtx().text.formulaListPage
    const layoutCtx = useMainLayoutCtx()

    // states
    const [formulaList, setFormulaList] = useState<Formula.Type[] | null>(null)
    const [sortBy, setSortBy] = useState<FormulaListSort>(defaultFormulaFilter)

    // effects
    useEffect(() => {
        setFormulaList(null)
        loading("", async () => {
            setFormulaList(new Array(100).fill((await formulaDao.getFormulaList(sortBy))[0]))
            // setFormulaList(await formulaDao.getFormulaList(sortBy))
        })
    }, [sortBy])

    useEffect(() => {
        layoutCtx.setTitle(uiText.pageTitle)
    }, [layoutCtx, uiText])

    // events
    const onChangeSortKey = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value as FormulaListSortKey
        window.localStorage.setItem(
            LocalStorageKeys.FORMULA_LIST_SORT_BY,
            value
        )
        setSortBy({ ...sortBy, key: value })
    }
    const onChangeSortDirection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value as ResultSortDirection
        window.localStorage.setItem(
            LocalStorageKeys.FORMULA_LIST_SORT_DIRECTION,
            value
        )
        setSortBy({ ...sortBy, direction: value })
    }

    return <>
        <Row spacing={2} sx={{ marginBottom: (theme) => theme.spacing(3) }}>
            <TextField variant="outlined"
                label={uiText.sortBySlct}
                select SelectProps={{ native: true }}
                size="small"
                disabled={!Boolean(formulaList)}
                value={sortBy.key}
                onChange={onChangeSortKey}
            >
                <option value={FormulaListSortKey.createdAt}>{uiText.createdAtOpt}</option>
                <option value={FormulaListSortKey.name}>{uiText.nameOpt}</option>
            </TextField>

            <TextField variant="outlined"
                label={uiText.sortOrderSlct}
                select SelectProps={{ native: true }}
                size="small"
                disabled={!Boolean(formulaList)}
                value={sortBy.direction}
                onChange={onChangeSortDirection}
            >
                <option value={ResultSortDirection.next}>{uiText.ascendingOpt}</option>
                <option value={ResultSortDirection.prev}>{uiText.descendingOpt}</option>
            </TextField>

        </Row>
        <Column spacing={2} sx={(theme) => ({
            flexGrow: 1, overflow: "scroll",
            alignItems: "stretch", paddingX: theme.spacing(0.5)
        })}>
            {formulaList && formulaList.map((formula, i) => {
                return <Card key={i} component={RouterLink}
                    to={Paths.FORMULA_DETAIL(formula.id.toString())}
                    sx={{ textDecoration: "none", flexShrink: 0 }}
                >
                    <CardHeader
                        title={formula.name}
                        subheader={new Date(formula.createdAt).toUTCString()}
                    />
                </Card>
            })}
        </Column>
    </>
}


function defaultFormulaFilter(): FormulaListSort {
    const sortByPref = window.localStorage.getItem(LocalStorageKeys.FORMULA_LIST_SORT_BY) as FormulaListSortKey | null
    const sortDirectionPref = window.localStorage.getItem(LocalStorageKeys.FORMULA_LIST_SORT_DIRECTION) as ResultSortDirection | null
    return {
        key: sortByPref ?? FormulaListSortKey.createdAt,
        direction: sortDirectionPref ?? ResultSortDirection.prev,
    }
}