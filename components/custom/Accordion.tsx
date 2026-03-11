"use client";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AccordionItem = {
  id: number;
  title: React.ReactNode;
  content: React.ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  className?: string;
  itemClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;

  multiple?: boolean
  defaultOpen?: number[]

  icon?: ({ selected }: { selected: boolean }) => React.ReactNode;
  title?: ({ title, selected }: { title: any; selected: boolean }) => React.ReactNode;
  content?: ({ content, selected }: { content: any; selected: boolean }) => React.ReactNode;
};

export const Accordion: React.FC<AccordionProps> = ({
  items,
  className,
  itemClassName,
  triggerClassName,
  contentClassName,
  icon,
  title,
  content,
  multiple = false,
  defaultOpen = [],
}) => {

  const [selected, setSelected] = useState<number[]>(
    multiple ? defaultOpen : defaultOpen.slice(0, 1)
  );

  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    refs.current.forEach((ref, index) => {
      if (ref) {
        ref.style.maxHeight = selected.includes(index)
          ? `${ref.scrollHeight}px`
          : "0px";
      }
    });
  }, [selected]);

  const handleClick = (index: number) => {

    if (multiple) {
      setSelected(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      );
    } else {
      setSelected(prev =>
        prev.includes(index) ? [] : [index]
      );
    }

  };

  return (
    <div className={cn("w-full mx-auto", className)}>
      {items.map((item, index) => {

        const isOpen = selected.includes(index)

        return (
          <div key={item.id} className={cn("border border-gray-200 rounded-[8px] w-full", itemClassName)}>
            
            <div
              className={cn(
                "w-full px-8 py-6 text-left cursor-pointer",
                triggerClassName
              )}
              onClick={() => handleClick(index)}
            >
              <>
                {title && title({ title: item.title, selected: isOpen })}
                {icon && icon({ selected: isOpen })}
              </>
            </div>

            <div
              ref={(el) => {
                refs.current[index] = el;
              }}
              className={cn(
                "overflow-hidden transition-all duration-700 ease-in-out",
                contentClassName
              )}
              style={{
                maxHeight: 0,
                borderTop: !isOpen ? "1px solid transparent" : undefined
              }}
            >
              {content && content({ content: item.content, selected: isOpen })}
            </div>

          </div>
        );
      })}
    </div>
  );
};