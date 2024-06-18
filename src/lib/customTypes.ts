export type Concept = { name: string; count: number }
export type SearchConfig = { appName: string; concepts: Concept[] }
export type LinkType = { label: string; value: boolean }
export type LinkTypes = LinkType[] 