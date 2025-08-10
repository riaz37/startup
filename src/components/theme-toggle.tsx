"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

// Add custom CSS for View Transition API with expand animation only
const addViewTransitionStyles = () => {
  if (typeof document === "undefined") return;

  const existingStyle = document.getElementById("theme-transition-styles");
  if (existingStyle) return;

  const style = document.createElement("style");
  style.id = "theme-transition-styles";
  style.textContent = `
    /* View Transition API styles */
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation-duration: 0.8s;
      animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    /* Expand animation for all theme changes */
    @keyframes theme-expand {
      from {
        clip-path: circle(0% at 90% 10%);
      }
      to {
        clip-path: circle(150% at 90% 10%);
      }
    }

    /* Apply expand animation to new theme */
    ::view-transition-new(root) {
      animation-name: theme-expand;
    }

    ::view-transition-old(root) {
      animation-name: none;
      opacity: 1;
    }

    /* Fallback animation for browsers without View Transition API */
    .theme-transition-expand {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      pointer-events: none;
      background: var(--new-theme-bg);
      clip-path: circle(0% at 90% 10%);
      transition: clip-path 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .theme-transition-expand.animate {
      clip-path: circle(150% at 90% 10%);
    }
  `;
  document.head.appendChild(style);
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isAnimating, setIsAnimating] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    addViewTransitionStyles();
  }, []);

  const toggleTheme = async () => {
    if (isAnimating) return;

    setIsAnimating(true);

    const newTheme = theme === "dark" ? "light" : "dark";

    // Check if View Transition API is supported
    if ("startViewTransition" in document) {
      // Use View Transition API with expand animation
      const transition = (document as unknown).startViewTransition(() => {
        setTheme(newTheme);
      });

      try {
        await transition.finished;
      } catch {
        console.log("View transition was skipped");
      }

      setIsAnimating(false);
    } else {
      // Fallback for browsers without View Transition API
      const newThemeBg =
        newTheme === "dark" ? "hsl(222.2 84% 4.9%)" : "hsl(0 0% 100%)";

      // Set CSS variable for the new theme background
      document.documentElement.style.setProperty("--new-theme-bg", newThemeBg);

      const overlay = document.createElement("div");
      overlay.className = "theme-transition-expand";
      document.body.appendChild(overlay);

      // Start expand animation
      requestAnimationFrame(() => {
        overlay.classList.add("animate");
      });

      // Change theme when expansion is halfway
      setTimeout(() => {
        setTheme(newTheme);
      }, 400);

      // Clean up after animation completes
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
        }
        setIsAnimating(false);
      }, 800);
    }
  };

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      size="icon"
      className="relative cursor-pointer overflow-hidden transition-all duration-200 hover:scale-105 active:scale-95"
      onClick={toggleTheme}
      disabled={isAnimating}
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-300 ease-in-out dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-300 ease-in-out dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
