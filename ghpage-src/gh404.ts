import { Paths } from "../src/Paths"

const attempedPath = window.location.pathname + window.location.search
window.location.replace(`${Paths.HOME_PAGE}?redirect=${encodeURIComponent(attempedPath)}`)