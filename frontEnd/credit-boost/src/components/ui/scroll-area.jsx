import * as React from "react"

/**
 * Simple ScrollArea component that doesn't rely on Radix UI
 */
const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <div className="h-full w-full overflow-auto">
        {children}
      </div>
    </div>
  )
})
ScrollArea.displayName = "ScrollArea"

const ScrollBar = React.forwardRef(({ orientation = "vertical", className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`flex touch-none select-none transition-colors ${
        orientation === "horizontal" 
          ? "h-2.5 flex-col border-t" 
          : "w-2.5 flex-row border-l"
      } ${className}`}
      {...props}
    >
      <div className="relative flex-1">
        <div className="absolute bg-border hover:bg-foreground/50 rounded-full transition-colors 
          ${orientation === "horizontal" ? "h-full w-32" : "h-32 w-full"}"
        />
      </div>
    </div>
  )
})
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }