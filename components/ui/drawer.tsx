"use client"

import * as React from "react"
import * as DrawerPrimitive from "vaul"

import { cn } from "@/lib/utils"

const Drawer = DrawerPrimitive.Root

const DrawerPortal = DrawerPrimitive.Portal

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[1000002] bg-black/40 backdrop-blur-sm",
      className
    )}
    {...props}
  />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
    roundedClassName?: string
  }
>(({ className, children, roundedClassName = "rounded-t-2xl", ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <DrawerPrimitive.Content
      ref={ref}
      className={cn(
        "fixed inset-x-0 bottom-0 z-[1000003] flex flex-col overflow-hidden border border-white/20 bg-white/90 p-4 shadow-2xl",
        "backdrop-blur-xl supports-[backdrop-filter]:bg-white/70",
        roundedClassName,
        className
      )}
      style={{
        ...(props as any)?.style,
        // Keep the drawer below the top chrome/header; adjust top gap via CSS var
        // Includes safe-area inset to avoid underlapping the notch on iOS
        ['--drawer-top-gap' as any]: 'calc(120px + env(safe-area-inset-top))',
        top: 'var(--drawer-top-gap)',
        bottom: 0,
        // Slightly shorter sheet on mobile so it never feels full-screen; content will scroll
        height: 'min(78svh, calc(100svh - var(--drawer-top-gap)))',
        maxHeight: 'calc(100svh - var(--drawer-top-gap))',
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
      }}
      {...props}
      onOpenAutoFocus={(e) => {
        // Prevent auto-focus from scrolling the container to bottom on open (iOS/Safari)
        e.preventDefault();
      }}
    >
      <div className="mx-auto mb-3 h-2 w-16 rounded-full bg-black/15" />
      <div
        data-drawer-scroll
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>
    </DrawerPrimitive.Content>
  </DrawerPortal>
))
DrawerContent.displayName = DrawerPrimitive.Content.displayName

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid gap-1.5 p-4 text-center", className)} {...props} />
)

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
)

const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
  )
)
DrawerTitle.displayName = "DrawerTitle"

const DrawerDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
DrawerDescription.displayName = "DrawerDescription"

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}


