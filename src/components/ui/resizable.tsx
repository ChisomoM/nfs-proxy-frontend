"use client"

// Resizable components - placeholder for future implementation
// Requires react-resizable-panels integration

export const ResizablePanelGroup = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
)

export const ResizablePanel = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
)

export const ResizableHandle = ({ ...props }: any) => (
  <div {...props} />
)
