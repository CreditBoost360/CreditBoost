import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: "text" | "password" | "email" | "number" | "tel" | "url" | "search" | "date" | "time" | "datetime-local";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    // Add explicit patterns for different input types
    const patterns = {
      tel: "[0-9]*",
      email: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$",
      url: "https?://.*"
    };

    // Add appropriate inputMode for different types
    const inputModes = {
      number: "numeric" as const,
      tel: "tel" as const,
      search: "search" as const,
      email: "email" as const,
      url: "url" as const,
      text: "text" as const
    };

    // Add appropriate autocomplete attributes
    const getAutoComplete = (type: string) => {
      switch (type) {
        case "email":
          return "email";
        case "tel":
          return "tel";
        case "password":
          return "current-password";
        case "url":
          return "url";
        default:
          return props.name || "off";
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "touch-manipulation", // Better touch handling
          className
        )}
        pattern={patterns[type as keyof typeof patterns]}
        inputMode={inputModes[type as keyof typeof inputModes]}
        autoComplete={getAutoComplete(type)}
        spellCheck={type === "text" || type === "search"}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
