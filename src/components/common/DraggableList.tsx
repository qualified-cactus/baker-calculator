import { Box, IconButton, Paper, Theme, styled } from "@mui/material"
import { PointerEvent as ReactPointerEvent, ReactElement, useCallback, useEffect, useState, useRef, PropsWithChildren } from "react"
import { AppZIndex } from "../AppZIndex"
import { CSSObject } from "@emotion/react"
import { DragIndicator } from "@mui/icons-material"

export interface DragableListProps<T> {
    items: T[]
    onSwitch: (fromIndex: number, toIndex: number) => void
    children: (item: T, index: number) => ReactElement
    sx?: CSSObject
}
type SxFunc = (t: Theme) => CSSObject


const rowStyle: SxFunc = (theme) => ({
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(1),
})

const HiddenRow = styled(Box)(({ theme }) => ({
    ...rowStyle(theme),
    visibility: "hidden"
}))

interface DraggedRowProps extends PropsWithChildren {
    pointerId: number
    initialX: number
    initialY: number
}
function DraggedRow({
    pointerId, initialX, initialY, children
}: DraggedRowProps): ReactElement {
    const [curPointerPosition, setCurPointerPosition] = useState<{ x: number, y: number }>(() => ({ x: initialX, y: initialY }))
    useEffect(() => {
        const trackPointer = (e: PointerEvent) => {
            if (e.pointerId === pointerId) {
                setCurPointerPosition({ x: e.clientX, y: e.clientY })
            }
        }
        window.document.addEventListener("pointermove", trackPointer)
        return () => {
            window.document.removeEventListener("pointermove", trackPointer)
        }

    }, [pointerId, setCurPointerPosition])

    const hiddenRef = useRef<HTMLDivElement>()
    return <>
        <HiddenRow ref={hiddenRef}>
            {children}
        </HiddenRow>
        <Paper variant="outlined" square
            sx={(theme) => {
                const og = {
                    ...rowStyle(theme),
                    position: "fixed",
                    left: curPointerPosition.x - 15,
                    top: curPointerPosition.y - 15,
                    zIndex: AppZIndex.drawer,
                    pointerEvents: "none"
                }
                if (hiddenRef.current) [
                    og["width"] = hiddenRef.current.offsetWidth
                ]
                return og
            }}
        >{children}</Paper>
    </>
}

interface HoverableRowProps2 extends PropsWithChildren {
    pointerId: number | null
    onSwitch: () => void
}
function HoverableRow2({
    pointerId,
    onSwitch,
    children,
}: HoverableRowProps2): ReactElement {
    const [isHovered, setHovered] = useState<boolean>(false)

    const onHovered = useCallback((e: ReactPointerEvent<unknown>) => {
        if (e.pointerId === pointerId) {
            setHovered(true)
        }
    }, [pointerId, setHovered])
    const onStopHovered = useCallback((e: ReactPointerEvent<unknown>) => {
        if (e.pointerId === pointerId) {
            setHovered(false)
        }
    }, [pointerId, setHovered])
    const onPointerUp = useCallback((e: ReactPointerEvent<unknown>) => {
        if (e.pointerId === pointerId) {
            e.stopPropagation()
            setHovered(false)
            onSwitch()
        }
    }, [pointerId, setHovered])

    return <Paper variant="outlined" square component={"div"}
        sx={(theme) => {
            const og = rowStyle(theme)
            if (isHovered && pointerId !== null) {
                og["backgroundColor"] = theme.palette.info.main
            }
            return og
        }}

        onPointerEnter={onHovered}
        onPointerLeave={onStopHovered}
        onPointerUp={onPointerUp}
    >
        {children}
    </Paper>

}

function setBodyStyleWhenDragging() {
    window.document.body.style.touchAction = "none"
    window.document.body.style.cursor = "grabbing"
}

function setBodyStyleWhenNotDragging() {
    window.document.body.style.touchAction = "auto"
    window.document.body.style.cursor = "auto"
}

/**
 * No key is needed on item
 * @param param0 
 * @returns 
 */
export function DragableList<T>({ items, children, onSwitch, sx }: DragableListProps<T>): ReactElement {

    const [draggedItem, setDraggedItem] = useState<{
        index: number, pointerId: number,
        initialX: number, initialY: number,
    } | null>(null)


    function onBeginDragging(itemIndex: number) {
        return (e: ReactPointerEvent<unknown>) => {
            if (draggedItem === null) {
                setBodyStyleWhenDragging()
                setDraggedItem({
                    index: itemIndex, pointerId: e.pointerId,
                    initialX: e.clientX, initialY: e.clientY
                })
            }
        }
    }
    // track when pointer is cancelled
    useEffect(() => {
        if (draggedItem?.pointerId !== undefined) {
            const cancelPointer = (e: PointerEvent) => {
                if (draggedItem.pointerId === e.pointerId) {
                    setBodyStyleWhenNotDragging()
                    setDraggedItem(null)
                }
            }
            window.document.addEventListener("pointerup", cancelPointer)
            window.document.addEventListener("pointercancel", cancelPointer)
            return () => {
                window.document.removeEventListener("pointerup", cancelPointer)
                window.document.removeEventListener("pointercancel", cancelPointer)
            }
        }
    }, [
        draggedItem?.pointerId, setDraggedItem,
    ])

    return <Box sx={{
        ...sx,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
    }}>
        {items.map((item, i) => {

            const rowContent = <>
                <Box>
                    <IconButton size="small" type="button" onPointerDown={onBeginDragging(i)}>
                        <DragIndicator />
                    </IconButton>
                </Box>
                <Box sx={{ alignSelf: "stretch", width: "100%" }}>
                    {children(item, i)}
                </Box>
            </>

            // if this item is being dragged
            if (draggedItem && draggedItem.index === i) {
                return <DraggedRow key={i} pointerId={draggedItem.pointerId}
                    initialX={draggedItem.initialX} initialY={draggedItem.initialY}
                >
                    {rowContent}
                </DraggedRow>
            } else {
                return <HoverableRow2 key={i}
                    pointerId={draggedItem?.pointerId ?? null}
                    onSwitch={() => {
                        onSwitch(i, draggedItem!.index)
                        setBodyStyleWhenNotDragging()
                        setDraggedItem(null)
                    }}
                >
                    {rowContent}
                </HoverableRow2>
            }
        })}
    </Box>
}
