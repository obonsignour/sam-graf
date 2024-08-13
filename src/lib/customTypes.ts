import type { RawGraph } from "@linkurious/ogma"

export type Concept = { name: string; count: number }
export type SearchConfig = { appName: string; concepts: Concept[] }
export type LinkType = { label: string; value: boolean }
export type LinkTypes = LinkType[]
export type Thread = { id: number, label: string, startDate: number }
export type GraphListRow = { id: string, graphName: string, modelNames: string[] }
export type GraphData = { rawGraph: RawGraph; id: string }