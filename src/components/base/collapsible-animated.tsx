"use client";

import type { Transition } from "motion/react";
import type { AnalyticsProperties } from "@/lib/analytics";
import type { AnalyticsEvent } from "@/lib/analytics-events";
import type {
  ChevronDownIconHandle,
  ChevronDownIconProps,
} from "@/components/animated-icons/chevron-down-icon";

import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/animated-icons/chevron-down-icon";
import { Collapsible as CollapsibleRoot } from "@/components/base/ui/collapsible";
import {
  ChevronsUpDownIcon,
  type ChevronsUpDownIconHandle,
  type ChevronsUpDownIconProps,
} from "@/components/chevrons-up-down-icon";

type CollapsibleContextType = {
  open: boolean;
};

const CollapsibleContext = createContext<CollapsibleContextType | null>(null);

const useCollapsible = () => {
  const context = useContext(CollapsibleContext);

  if (!context) {
    throw new Error(
      "Collapsible components must be used within a CollapsibleWithContext",
    );
  }

  return context;
};

function CollapsibleWithContext({
  defaultOpen,
  open: controlledOpen,
  onOpenChange,
  openEvent,
  closeEvent,
  eventProperties,
  ...props
}: React.ComponentProps<typeof CollapsibleRoot> & {
  /** Sent when opened or closed. Serializable, so server components can set them. */
  openEvent?: AnalyticsEvent;
  closeEvent?: AnalyticsEvent;
  eventProperties?: AnalyticsProperties;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(
    defaultOpen ?? false,
  );
  const open = controlledOpen ?? uncontrolledOpen;

  return (
    <CollapsibleContext.Provider value={{ open }}>
      <CollapsibleRoot
        open={open}
        onOpenChange={(open, eventDetails) => {
          if (controlledOpen === undefined) {
            setUncontrolledOpen(open);
          }
          const event = open ? openEvent : closeEvent;
          if (event && eventProperties) {
            trackEvent(event, eventProperties);
          }
          onOpenChange?.(open, eventDetails);
        }}
        {...props}
      />
    </CollapsibleContext.Provider>
  );
}

function useCollapsibleAnimation<
  T extends { startAnimation: () => void; stopAnimation: () => void },
>(ref: React.RefObject<T | null>) {
  const { open } = useCollapsible();

  useEffect(() => {
    const controls = ref.current;
    if (!controls) return;

    if (open) {
      controls.startAnimation();
    } else {
      controls.stopAnimation();
    }
  }, [open, ref]);
}

function CollapsibleChevronsUpDownIcon(
  props: Omit<ChevronsUpDownIconProps, "ref">,
) {
  const ref = useRef<ChevronsUpDownIconHandle>(null);
  useCollapsibleAnimation(ref);
  return <ChevronsUpDownIcon ref={ref} {...props} />;
}

function CollapsibleChevronDownIcon(props: Omit<ChevronDownIconProps, "ref">) {
  const ref = useRef<ChevronDownIconHandle>(null);
  useCollapsibleAnimation(ref);
  return <ChevronDownIcon ref={ref} {...props} />;
}

const COLLAPSIBLE_ENTER_TRANSITION: Transition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],
};

const COLLAPSIBLE_EXIT_TRANSITION: Transition = {
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1],
};

function CollapsibleMotionContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useCollapsible();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="collapsible-motion-content"
          className={cn("overflow-hidden", className)}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={
            reduceMotion
              ? { height: 0, opacity: 0, transition: { duration: 0 } }
              : {
                  height: 0,
                  opacity: 0,
                  transition: COLLAPSIBLE_EXIT_TRANSITION,
                }
          }
          transition={
            reduceMotion ? { duration: 0 } : COLLAPSIBLE_ENTER_TRANSITION
          }
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export {
  CollapsibleWithContext as Collapsible,
  CollapsibleChevronDownIcon,
  CollapsibleChevronsUpDownIcon,
  CollapsibleMotionContent,
  useCollapsible,
  useCollapsibleAnimation,
};
