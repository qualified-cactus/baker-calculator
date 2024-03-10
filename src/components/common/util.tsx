import { SxProps, Theme } from "@mui/material";


export function mergeSx(sx: SxProps<Theme>, another?: SxProps<Theme>): SxProps<Theme> {
    return [
        ...(Array.isArray(sx) ? sx : [sx]),
        ...(Array.isArray(another) ? another : [another])
    ]
}