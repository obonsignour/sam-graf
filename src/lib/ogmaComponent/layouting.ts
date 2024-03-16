import type Ogma from "@linkurious/ogma"
import type { ForceLayoutOptions, ForceLinkOptions, HierarchicalLayoutOptions, LocateOptions } from "@linkurious/ogma"

export const defaultLocateOptions: LocateOptions = {
  duration: 300,
  easing: 'quadraticIn',
  maxNodeSizeOnScreen: 100,
  padding: 1
}

export const defaultForceOptions: ForceLayoutOptions = {
  locate: true,
  charge: 3
}

export const defaultForceLinkOptions: ForceLinkOptions = {
  locate: true
}

export const defaultHierarchicalOptions: HierarchicalLayoutOptions = {
  locate: true
}

export const LayoutType = { Force: 'force', ForceLink: 'forceLink', Hierarchical: 'hierarchical' } as const
type ValLayoutType = (typeof LayoutType)[keyof typeof LayoutType]

export const applyLayout = (ogma: Ogma, layout: ValLayoutType, options: ForceLayoutOptions | ForceLinkOptions | HierarchicalLayoutOptions = {}) => {
  const layouts = [
    {
      type: LayoutType.Force,
      layoutFunction: (options: ForceLayoutOptions) => ogma.layouts.force(options ? options : defaultForceOptions)
    },
    {
      type: LayoutType.ForceLink,
      layoutFunction: (options: ForceLinkOptions) => ogma.layouts.forceLink(options ? options : defaultForceLinkOptions)
    },
    {
      type: LayoutType.Hierarchical,
      layoutFunction: (options: HierarchicalLayoutOptions) => ogma.layouts.hierarchical(options ? options : defaultHierarchicalOptions)
    }
  ]
  return layouts
    .find((l) => l.type === layout)
    ?.layoutFunction(options)
    .then(() => ogma.view.locateGraph(defaultLocateOptions))
}