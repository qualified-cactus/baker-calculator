import { Dialog, DialogTitle, IconButton, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Formula, SavedResult } from "../../../data/BakerRatioCalcDb";
import { ReactNode, useEffect, useState } from "react";
import { AppDatabase } from "../../../DbProvider";
import { LoadingBox } from "../../common/LoadingBox";
import DeleteIcon from '@mui/icons-material/Delete';

export interface SavedResultDialogProps {
    open: boolean
    formula: Formula.Type
    onSelectResult: (resultId: number) => void
    onClose: () => void
}

export function SavedResultDialog({
    open, formula, onSelectResult, onClose
}: SavedResultDialogProps) {
    const formulaDao = AppDatabase.getInstance().formulaDao

    //states
    const [results, setResults] = useState<SavedResult.Type[] | undefined>(undefined)

    //effects
    useEffect(() => {
        setResults(undefined)
        if (open) {
            formulaDao.getFormulaSavedResults(formula.id).then(setResults)
        }
    }, [formula, open])

    let content: ReactNode

    if (results === undefined) {
        content = <LoadingBox />
    } else {
        //events
        const onDeleteResult = (index: number) => () => {
            formulaDao.deleteFormulaResult(results[index].id)
            setResults(results.toSpliced(index, 1))
        }
        const onSelectOneResult = (index: number) => () => {
            onSelectResult(results[index].id)
        }

        content = <List>
            {results.map((result, i) =>
                <ListItem key={i}
                    secondaryAction={
                        <IconButton type="button" onClick={onDeleteResult(i)}>
                            <DeleteIcon />
                        </IconButton>
                    }
                >
                    <ListItemButton onClick={onSelectOneResult(i)}>
                        <ListItemText>
                            {result.baseIngredientAmount}&nbsp;{formula.baseIngredient.baseUnit}
                        </ListItemText>
                    </ListItemButton>
                </ListItem>
            )}
        </List>
    }

    return <Dialog open={open} onClose={onClose}>
        <DialogTitle>{formula.baseIngredient.name}</DialogTitle>
        {content}
    </Dialog>
}