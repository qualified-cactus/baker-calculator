import { Box, BoxProps, SxProps, Theme, styled } from "@mui/material";
import { forwardRef, useRef } from "react";
import { mergeSx } from "./util";

export interface ColumnProps extends BoxProps {
    spacing?: number
}

export interface RowProps {
    spacing?: number
}



export const Column = forwardRef(({ spacing, sx, ...boxProps }: ColumnProps, ref: any) => {
    return <Box
        {...boxProps}
        ref={ref}
        sx={mergeSx({
            display: "flex", flexDirection: "column",
            alignItems: "flex-start", gap: (theme) => theme.spacing(spacing ?? 0),
        }, sx)}
    />
})

export const Row = forwardRef(({ spacing, sx, ...boxProps }: ColumnProps, ref: any) => {
    return <Box
        {...boxProps}
        ref={ref}
        sx={mergeSx({
            display: "flex", flexDirection: "row",
            alignItems: "flex-start", gap: (theme) => theme.spacing(spacing ?? 0),
        }, sx)}
    />
})

