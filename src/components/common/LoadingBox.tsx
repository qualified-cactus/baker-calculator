import { Box, BoxProps, CircularProgress } from "@mui/material";
import { mergeSx } from "./util";


export function LoadingBox({ children, sx, ...boxProps }: BoxProps) {
    return <Box {...boxProps}
        sx={mergeSx({ display: "flex", alignItems: "center", justifyItems: "center" }, sx)}
    >
        <CircularProgress />
    </Box>
}