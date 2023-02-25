import type { AstroInstance } from "astro";

export async function loadGamePages(): Promise<GamePage[]> {
  const astroInstances = await globAstroInstances()
  const gamePages = astroInstances.filter<GamePage>(isGamePage)

  astroInstances.forEach((astroInstance) => {
    if (!gamePages.includes(astroInstance as GamePage)) {
      console.warn(`\x1b[93mWARNING:\x1b[0m The page "${astroInstance.url}" is missing a header export. It is not shown in the GameSidebar.`)
    }
  })

  gamePages.sort(gamePageComparator)

  return gamePages
}

function gamePageComparator(
  {header: lHeader, priority: lPriority}: GamePage,
  {header: rHeader, priority: rPriority}: GamePage
): number {
  if (lPriority === rPriority) {
    if (lHeader < rHeader) return -1
    if (lHeader === rHeader) return 0
    return 1
  }
  if (rPriority === undefined) return -1
  if (lPriority === undefined) return 1
  if (lPriority < rPriority) return -1
  return 1
}

async function globAstroInstances(): Promise<AstroInstance[]> {
  const globResult = import.meta.glob<AstroInstance>("../pages/games/*.astro")

  const paths = Object.keys(globResult)
  const importPromises = await Promise.allSettled(paths.map((path) => {
    return globResult[path]()
  }))

  return importPromises.map((promise, i) => {
    if (promise.status === "rejected") {
      throw new Error(`\x1b[93mERROR:\x1b[0m Could not load file "${paths[i]}"`)
    }
    return promise.value
  })
}

export function isGamePage(astroInstance: AstroInstance): astroInstance is GamePage {
  const casted = astroInstance as GamePage
  return typeof casted.header === "string"
    && (casted.priority === undefined
      || typeof casted.priority === "number")
}

export type GamePage = AstroInstance & {
  header: string,
  priority?: number
}