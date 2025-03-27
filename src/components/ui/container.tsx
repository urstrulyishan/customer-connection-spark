
import { cn } from "@/lib/utils";
import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export const PageContainer = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <Container
        ref={ref}
        className={cn("py-6 sm:py-8 animate-fade-in", className)}
        {...props}
      >
        {children}
      </Container>
    );
  }
);

PageContainer.displayName = "PageContainer";

export const SectionContainer = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("w-full py-6", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SectionContainer.displayName = "SectionContainer";
