"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet } from "lucide-react";

export function ResponsiveDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentBreakpoint, setCurrentBreakpoint] = useState("");

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCurrentBreakpoint("Mobile (0-640px)");
      } else if (width < 768) {
        setCurrentBreakpoint("Small Tablet (640-768px)");
      } else if (width < 1024) {
        setCurrentBreakpoint("Tablet (768-1024px)");
      } else if (width < 1280) {
        setCurrentBreakpoint("Small Desktop (1024-1280px)");
      } else {
        setCurrentBreakpoint("Desktop (1280px+)");
      }
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);

    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 mobile-touch-target"
      >
        <Monitor className="h-4 w-4 mr-2" />
        Debug
      </Button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed bottom-20 left-4 z-50 bg-background border rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold mb-3 text-responsive-sm">Responsive Debug</h3>
          
          <div className="space-y-2 text-responsive-xs">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>Current: {currentBreakpoint}</span>
            </div>
            
            <div className="border-t pt-2">
              <div className="font-medium mb-1">Breakpoints:</div>
              <div className="space-y-1 text-muted-foreground">
                <div>• Mobile: 0-640px</div>
                <div>• Small Tablet: 640-768px</div>
                <div>• Tablet: 768-1024px</div>
                <div>• Small Desktop: 1024-1280px</div>
                <div>• Desktop: 1280px+</div>
              </div>
            </div>
            
            <div className="border-t pt-2">
              <div className="font-medium mb-1">Utilities:</div>
              <div className="space-y-1 text-muted-foreground">
                <div>• .text-responsive-*</div>
                <div>• .grid-responsive-*</div>
                <div>• .mobile-touch-target</div>
                <div>• .container-responsive</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 