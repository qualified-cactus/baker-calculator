
const attempedPath = window.location.pathname + window.location.search
window.location.replace(`/?redirect=${encodeURIComponent(attempedPath)}`)