"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Rectangle,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
  Legend as RechartsLegend,
  TooltipProps,
} from "recharts"

import { cn } from "@/lib/utils"
import { cva, VariantProps } from "class-variance-authority"

// #region Chart Types
type ChartContainerProps = React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ReactElement
}

interface ChartContextProps {
  config: ChartConfig
  chartId: string
}

type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | {
        color?: string
        theme?: never
      }
    | {
        color?: never
        theme: {
          [k in "light" | "dark"]?: string
        }
      }
  )
}

type ChartStyleConfig = {
  [k in keyof ChartConfig]: {
    [key in "line" | "area" | "bar" | "pie" | "radar" | "radial"]?: {
      [key in keyof React.CSSProperties]?: string | number
    }
  }
}

type AxisConfig = {
  color?: string
  label?: string
  labelProps?: Omit<React.ComponentProps<typeof Label>, "children">
  tickMargin?: number
  tickFormatter?: (value: any, index: number) => string
  hide?: boolean
} & Omit<React.ComponentProps<typeof XAxis>, "scale">

type PieSector<T> = Omit<React.ComponentProps<typeof Sector>, "payload"> & {
  payload: T
}

// #endregion

// #region Legend
const legendVariants = cva("flex items-center gap-2 text-sm text-muted-foreground", {
  variants: {
    align: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    },
  },
  defaultVariants: {
    align: "center",
  },
})

type ChartLegendContent = React.ComponentProps<"div"> &
  VariantProps<typeof legendVariants> & {
    payload?: any[]
    nameKey?: string
  }

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  ChartLegendContent
>(({ className, align, payload, nameKey = "dataKey", ...props }, ref) => {
  const { config } = useChart()

  if (!payload || !payload.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(legendVariants({ align }), className)}
      {...props}
    >
      {payload.map((item) => {
        const key = `${item[nameKey]}`
        const entry = config[key]

        if (!entry) {
          return null
        }

        return (
          <div key={item.value} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{
                backgroundColor: entry.color,
              }}
            />
            {entry.label}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegend"
// #endregion

// #region Tooltip
type ChartTooltipContent = TooltipProps<any, any> & {
  label?: string
  hideLabel?: boolean
  hideIndicator?: boolean
  indicator?: "line" | "dot" | "dashed"
  nameKey?: string
  labelKey?: string
}

const ChartTooltipContent = ({
  active,
  payload,
  label,
  className,
  labelClassName,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  labelKey,
  nameKey = "name",
}: ChartTooltipContent) => {
  const { config } = useChart()

  if (!active || !payload || payload.length === 0) {
    return null
  }

  const [item] = payload
  const key = `${item?.[nameKey]}`
  const entry = config?.[key]

  return (
    <div
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!hideLabel && (
        <div className={cn("font-medium", labelClassName)}>
          {labelKey ? item.payload[labelKey] : label}
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, i) => {
          const key = `${item?.[nameKey]}`
          const entry = config?.[key]

          return (
            <div
              key={item.dataKey}
              className={cn("flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                hideIndicator && "items-center"
              )}
            >
              {!hideIndicator && (
                <div
                  className="flex w-2.5 shrink-0 items-center justify-center"
                >
                  {indicator === "dot" ? (
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                      style={{
                        backgroundColor: entry?.color,
                      }}
                    />
                  ) : indicator === "line" ? (
                    <div
                      className="h-full w-[3px] rounded-full"
                      style={{
                        backgroundColor: entry?.color,
                      }}
                    />
                  ) : indicator === "dashed" ? (
                    <div
                      className="w-full border-t-[3px] border-dashed"
                      style={{
                        borderColor: entry?.color,
                      }}
                    />
                  ) : null}
                </div>
              )}
              <div
                className={cn(
                  "flex flex-1 justify-between leading-none",
                )}
              >
                <div className="grid gap-1.5">
                  <span className="text-muted-foreground">{entry?.label}</span>
                </div>
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {item.value.toLocaleString()}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
// #endregion


const ChartContainer = React.forwardRef<
  HTMLDivElement,
  ChartContainerProps
>(({ id, className, style, config, children, ...props }, ref) => {
  const chartId = `chart-${id ?? React.useId()}`

  return (
    <div
      data-chart={chartId}
      ref={ref}
      style={
        {
          "--chart-font-family": "var(--font-sans)",
          "--chart-font-size": "12px",
          ...style,
        } as React.CSSProperties
      }
      className={className}
      {...props}
    >
      <ChartProvider
        value={{
          chartId,
          config: {
            ...config,
            // Add internal CSS variables
            __theme: {
              ...config?.theme,
              base: {
                ...config?.theme?.base,
                color:
                  config?.theme?.base?.color ??
                  "hsl(var(--chart-foreground))",
                fontFamily:
                  config?.theme?.base?.fontFamily ??
                  "var(--chart-font-family)",
                fontSize:
                  config?.theme?.base?.fontSize ??
                  "var(--chart-font-size)",
              },
            },
          },
        }}
      >
        {children}
      </ChartProvider>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}
const ChartProvider = ChartContext.Provider

const ChartTooltip = Tooltip

const ChartLegend = RechartsLegend

const ChartStyle = ({
  id,
  config,
}: {
  id: string
  config: ChartStyleConfig
}) => {
  const css = React.useMemo(() => {
    return Object.entries(config)
      .map(([chartType, chartConfig]) => {
        return Object.entries(chartConfig)
          .map(([series, seriesConfig]) => {
            const seriesId = `[data-chart=${id}] .recharts-${chartType}-${series}`

            return Object.entries(seriesConfig)
              .map(([prop, value]) => {
                // Generate CSS for the series
                return `${seriesId} { --${prop}: ${value}; }`
              })
              .join("\n")
          })
          .join("\n")
      })
      .join("\n")
  }, [id, config])

  return <style>{css}</style>
}

// Helper to get the CSS variable for a color
function getVarColor(name: string, config: ChartConfig) {
  return `var(--color-${name}, ${config[name]?.color ?? "hsl(var(--chart-foreground))"})`
}

export {
  ChartContainer,
  ChartProvider,
  useChart,
  ChartTooltip,
  ChartLegend,
  ChartStyle,
  getVarColor,
  ChartLegendContent,
  ChartTooltipContent,
  // Re-export all of Recharts
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Rectangle,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
}
export type {
  AxisConfig,
  ChartConfig,
  ChartContainerProps,
  ChartContextProps,
  ChartLegendContent as ChartLegendContentProps,
  ChartStyleConfig,
  ChartTooltipContent as ChartTooltipContentProps,
  PieSector as PieSectorProps,
}
