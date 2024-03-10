import { AppBar, Box, Container, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Menu, MenuItem, Toolbar, Typography, styled, useMediaQuery, useTheme } from "@mui/material";
import { ReactElement, ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { Outlet, Link as RouterLink, matchPath, useLocation } from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';
import { AppUiText } from "./AppUiText";
import { Paths } from "../Paths";
import MoreVertIcon from '@mui/icons-material/MoreVert';



export type AppBarOptionMenu = {
    label: ReactNode,
    onClick: () => void
}[]

interface ILayoutContext {
    setTitle: (s: string) => void
    setAppBarOptionsMenu: (value: AppBarOptionMenu | null) => void
}
const LayOutContext = createContext<ILayoutContext>(null!)


export function useMainLayoutCtx() {
    const layoutCtx = useContext(LayOutContext)

    useEffect(() => {
        return () => {
            layoutCtx.setTitle("")
            layoutCtx.setAppBarOptionsMenu(null)
        }
    }, []);
    return layoutCtx;
}



export function MainLayout(): ReactElement {
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false)
    const uiText = AppUiText.useCtx().text.layout
    const location = useLocation()
    const theme = useTheme()
    const isLargeScreen = useMediaQuery(theme.breakpoints.up("md"))

    //states
    const [appTitle, setAppTitle] = useState<string>(uiText.appBarTitle)
    const [appBarOptionsMenu, setAppBarOptionsMenu] = useState<null | AppBarOptionMenu>(null)
    const [showAppBarOptionsMenu, setShowAppBarOptionsMenu] = useState<HTMLElement | null>(null)

    const appBarOptionsMenu2 = useMemo(() => {
        return appBarOptionsMenu?.map((item) => ({
            ...item,
            onClick: () => {
                setShowAppBarOptionsMenu(null);
                item.onClick();
            }
        })) ?? null
    }, [appBarOptionsMenu])

    const layoutContext: ILayoutContext = useMemo(() => {
        return {
            setTitle: (title: string) => {
                window.document.title = `${uiText.appBarTitle} - ${title}` 
                setAppTitle(title)
            },
            setAppBarOptionsMenu: (menu: null | AppBarOptionMenu) => {
                setAppBarOptionsMenu(menu)
                setShowAppBarOptionsMenu(null)
            },
        }
    }, [setAppTitle])


    const sideItems: {
        name: string, link: string, match: boolean
    }[] = useMemo(() => {
        return [
            {
                name: uiText.home, link: Paths.HOME_PAGE,
                match: Boolean(matchPath(location.pathname, Paths.HOME_PAGE))
            },
            {
                name: uiText.createFormula, link: Paths.CREATE_FORMULA,
                match: Boolean(matchPath(location.pathname, Paths.CREATE_FORMULA))
            },
            {
                name: uiText.formula, link: Paths.FORMULA_LIST,
                match: Boolean(matchPath(location.pathname, Paths.FORMULA_LIST))
            },
        ]
    }, [uiText, location])


    const onDrawerClose = () => {
        setDrawerOpen(false)
    }
    const onOpenDrawer = () => {
        setDrawerOpen(true)
    }
    const onOpenAppBarOptionsMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (appBarOptionsMenu !== null) {
            setShowAppBarOptionsMenu(e.target as HTMLButtonElement)
        }
    }
    const onCloseAppBarOptionsMenu = () => {
        setShowAppBarOptionsMenu(null)
    }


    const drawerItems = <List>
        {sideItems.map((sideItem, i) =>
            <ListItem key={i}>
                <ListItemButton component={RouterLink} to={sideItem.link} selected={sideItem.match}>
                    <ListItemText primary={sideItem.name} />
                </ListItemButton>
            </ListItem>
        )}
    </List>

    return <Box sx={{ height: "max-content" }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
                {!isLargeScreen &&
                    <IconButton size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2 }}
                        onClick={onOpenDrawer}
                    >
                        <MenuIcon />
                    </IconButton>
                }
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    {appTitle}
                </Typography>
                {appBarOptionsMenu2 !== null &&
                    <>
                        <IconButton type="button" onClick={onOpenAppBarOptionsMenu} color="inherit">
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            anchorEl={showAppBarOptionsMenu}
                            open={Boolean(showAppBarOptionsMenu) && Boolean(appBarOptionsMenu2)}
                            onClose={onCloseAppBarOptionsMenu}
                        >
                            {appBarOptionsMenu2.map((menuItem, i) =>
                                <MenuItem key={i} onClick={menuItem.onClick}>
                                    {menuItem.label}
                                </MenuItem>
                            )}

                        </Menu>
                    </>
                }

            </Toolbar>
        </AppBar>

        <Box display={"flex"} sx={{ height: "100%" }}>
            {isLargeScreen ?
                <Drawer sx={{ flexShrink: 0 }} variant="permanent" anchor="left"
                >
                    <Toolbar />
                    {drawerItems}
                </Drawer>
                :
                <Drawer anchor={"left"}
                    variant={"temporary"}
                    open={drawerOpen}
                    onClose={onDrawerClose}
                    sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
                >
                    {drawerItems}
                </Drawer>
            }
            <Container maxWidth="sm" sx={(theme) => ({
                paddingTop: theme.spacing(3),
                position: "relative",
                display: "flex", flexDirection: "column",
                height: "100vh"
            })}>
                <Toolbar />
                <LayOutContext.Provider value={layoutContext}>
                    <Outlet />
                </LayOutContext.Provider>
            </Container>
        </Box>
    </Box>
}


