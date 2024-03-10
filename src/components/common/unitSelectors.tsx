import { Box, SxProps, TextField, TextFieldProps, Theme } from "@mui/material";
import { MassUnit, UnitType, VolumeUnit } from "../../data/Measurement";
import { ReactElement } from "react";

const volumeUnitOptions: VolumeUnit[] = ["mL", "cL", "dL", "L", "daL", "hL", "kL"]

export function VolumeUnitSelector(props: TextFieldProps) {
    return <TextField {...props}
        SelectProps={{ native: true }}
        select
    >
        {volumeUnitOptions.map((unit, i) =>
            <option key={i} value={unit}>{unit}</option>
        )}
    </TextField>
}

const massUnitOptions: MassUnit[] = ["mg", "cg", "dg", "g", "dag", "hg", "kg", "t"]
export function MassUnitSelector(props: TextFieldProps) {
    return <TextField
        {...props}
        SelectProps={{ native: true }}
        select
    >
        {massUnitOptions.map((unit, i) =>
            <option key={i} value={unit}>{unit}</option>
        )}
    </TextField>
}


export interface UnitSelectorProps {
    unitType: UnitType
    onChangeUnitType: React.ChangeEventHandler<HTMLInputElement>
    massUnit: MassUnit
    onChangeMassUnit: React.ChangeEventHandler<HTMLInputElement>
    volumeUnit: VolumeUnit
    onChangeVolumeUnit: React.ChangeEventHandler<HTMLInputElement>
    sx?: SxProps<Theme>
    size?: "small"|"medium"
}
const unitTypeOptions: UnitType[] = ["mass", "volume"]
const inputWidth = "7rem"
export function UnitSelector(props: UnitSelectorProps): ReactElement {
    return <Box sx={props.sx}>
        <Box sx={{ display: "flex", width: "100%", height: "100%" }}>
            <TextField select SelectProps={{ native: true }}
                value={props.unitType} onChange={props.onChangeUnitType}
                sx={{ width: "50%" }}
                size={props.size}
            >
                {unitTypeOptions.map((u, i) =>
                    <option key={i} value={u}>{u}</option>
                )}
            </TextField>
            {props.unitType === "mass" &&
                <MassUnitSelector
                    value={props.massUnit}
                    onChange={props.onChangeMassUnit}
                    sx={{ width: "50%" }}
                    size={props.size}
                />
            }
            {props.unitType === "volume" &&
                <VolumeUnitSelector
                    value={props.volumeUnit}
                    onChange={props.onChangeVolumeUnit}
                    sx={{ width: "50%" }}
                    size={props.size}
                />
            }
        </Box>
    </Box>

}