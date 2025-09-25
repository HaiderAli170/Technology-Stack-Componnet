"use client";
import React, { useState, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

// --- TextHighlighter Component ---
import {
  ElementType,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState as useState2,
} from "react";

type HighlightDirection = "ltr" | "rtl" | "ttb" | "btt";

type UseInViewOptions = {
  once?: boolean;
  initial?: boolean;
  amount?: number;
  margin?: string;
};

type Transition = {
  duration?: number;
  delay?: number;
  type?: "spring" | "ease" | "linear";
  bounce?: number;
};

type TextHighlighterProps = {
  children: React.ReactNode;
  as?: ElementType;
  triggerType?: "hover" | "ref" | "inView" | "auto";
  transition?: Transition;
  useInViewOptions?: UseInViewOptions;
  className?: string;
  highlightColor?: string;
  useTailwindClasses?: boolean;
  direction?: HighlightDirection;
  rounded?: string;
} & React.HTMLAttributes<HTMLElement>;

export type TextHighlighterRef = {
  animate: (direction?: HighlightDirection) => void;
  reset: () => void;
};

const useInView = (
  ref: React.RefObject<HTMLElement | null>,
  options: UseInViewOptions = {}
) => {
  const [isInView, setIsInView] = useState2(options.initial || false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (options.once) {
            observer.unobserve(element);
          }
        } else if (!options.once) {
          setIsInView(false);
        }
      },
      {
        threshold: options.amount || 0.1,
        rootMargin: options.margin || "0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, options.amount, options.margin, options.once]);

  return isInView;
};

export const TextHighlighter = forwardRef<
  TextHighlighterRef,
  TextHighlighterProps
>(
  (
    {
      children,
      as = "span",
      triggerType = "inView",
      transition = { type: "spring", duration: 0.8, delay: 0.2, bounce: 0 },
      useInViewOptions = {
        once: true,
        initial: false,
        amount: 0.1,
      },
      className,
      highlightColor = "linear-gradient(rgb(253 141 62), rgb(250, 196, 158))",
      useTailwindClasses = false,
      direction = "ltr",
      rounded = "rounded-md",
      ...props
    },
    ref
  ) => {
    const componentRef = React.useRef<HTMLDivElement>(null);
    const [isAnimating, setIsAnimating] = useState2(false);
    const [isHovered, setIsHovered] = useState2(false);
    const [currentDirection, setCurrentDirection] =
      useState2<HighlightDirection>(direction);

    useEffect(() => {
      setCurrentDirection(direction);
    }, [direction]);

    const inViewResult = useInView(componentRef, useInViewOptions);
    const isInView = triggerType === "inView" ? inViewResult : false;

    useImperativeHandle(ref, () => ({
      animate: (animationDirection?: HighlightDirection) => {
        if (animationDirection) {
          setCurrentDirection(animationDirection);
        }
        setIsAnimating(true);
      },
      reset: () => setIsAnimating(false),
    }));

    const shouldAnimate =
      triggerType === "hover"
        ? isHovered
        : triggerType === "inView"
        ? isInView
        : triggerType === "ref"
        ? isAnimating
        : triggerType === "auto"
        ? true
        : false;

    const ElementTag = as || "span";

    const animatedSize = useMemo(() => {
      switch (currentDirection) {
        case "ltr":
          return shouldAnimate ? "100% 100%" : "0% 100%";
        case "rtl":
          return shouldAnimate ? "100% 100%" : "0% 100%";
        case "ttb":
          return shouldAnimate ? "100% 100%" : "100% 0%";
        case "btt":
          return shouldAnimate ? "100% 100%" : "100% 0%";
        default:
          return shouldAnimate ? "100% 100%" : "0% 100%";
      }
    }, [shouldAnimate, currentDirection]);

    const initialSize = useMemo(() => {
      switch (currentDirection) {
        case "ltr":
          return "0% 100%";
        case "rtl":
          return "0% 100%";
        case "ttb":
          return "100% 0%";
        case "btt":
          return "100% 0%";
        default:
          return "0% 100%";
      }
    }, [currentDirection]);

    const backgroundPosition = useMemo(() => {
      switch (currentDirection) {
        case "ltr":
          return "0% 0%";
        case "rtl":
          return "100% 0%";
        case "ttb":
          return "0% 0%";
        case "btt":
          return "0% 100%";
        default:
          return "0% 0%";
      }
    }, [currentDirection]);

    const getTimingFunction = (type: string = "spring") => {
      switch (type) {
        case "spring":
          return "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        case "ease":
          return "ease-out";
        case "linear":
          return "linear";
        default:
          return "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      }
    };

    const getHighlightStyles = (): React.CSSProperties => {
      const baseStyles: React.CSSProperties = {
        backgroundSize: shouldAnimate ? animatedSize : initialSize,
        backgroundPosition: backgroundPosition,
        transition: `background-size ${
          transition.duration || 1
        }s ${getTimingFunction(transition.type)} ${transition.delay || 0}s`,
      };

      if (useTailwindClasses) {
        return baseStyles;
      } else {
        const backgroundImage = highlightColor.includes("gradient")
          ? highlightColor
          : `linear-gradient(${highlightColor}, ${highlightColor})`;

        return {
          ...baseStyles,
          backgroundImage,
          backgroundRepeat: "no-repeat",
          boxDecorationBreak: "clone" as const,
          WebkitBoxDecorationBreak: "clone" as const,
        };
      }
    };

    const highlightStyle = getHighlightStyles();

    const getTailwindClasses = () => {
      if (!useTailwindClasses) return `${rounded} px-1`;

      const defaultGradient =
        "bg-gradient-to-r from-orange-400 to-orange-200 dark:from-orange-500 dark:to-orange-300";
      const gradientClass = highlightColor.includes("bg-")
        ? highlightColor
        : defaultGradient;

      return `${gradientClass} ${rounded} px-1`;
    };

    return (
      <ElementTag
        ref={componentRef}
        onMouseEnter={() => triggerType === "hover" && setIsHovered(true)}
        onMouseLeave={() => triggerType === "hover" && setIsHovered(false)}
        {...props}
      >
        <span
          className={`inline ${getTailwindClasses()} ${className || ""}`}
          style={highlightStyle}
        >
          {children}
        </span>
      </ElementTag>
    );
  }
);

TextHighlighter.displayName = "TextHighlighter";

// --- Types ---
interface FileTreeItem {
  name: string;
  type: "file" | "folder";
  children?: FileTreeItem[];
}
interface ChevronIconProps {
  isOpen: boolean;
}
interface TreeIconProps {
  item: FileTreeItem;
  isOpen: boolean;
}
interface ImageDisplayProps {
  selectedItem: FileTreeItem | null;
}
interface TreeNodeProps {
  item: FileTreeItem;
  selectedItem: FileTreeItem | null;
  onItemSelect: (item: FileTreeItem) => void;
  openFolders: Record<string, boolean>;
  toggleFolder: (name: string) => void;
}

// --- Data ---
const technologyTreeData: FileTreeItem[] = [
  {
    name: "Frontend",
    type: "folder",
    children: [
      { name: "React", type: "file" },
      { name: "Next.js", type: "file" },
      { name: "TypeScript", type: "file" },
      { name: "Tailwind CSS", type: "file" },
      { name: "Redux", type: "file" },
    ],
  },
  {
    name: "Backend",
    type: "folder",
    children: [
      { name: "Node.js", type: "file" },
      { name: "Express", type: "file" },
      { name: "NestJS", type: "file" },
      { name: "GraphQL", type: "file" },
    ],
  },
  {
    name: "Cloud",
    type: "folder",
    children: [
      { name: "AWS", type: "file" },
      { name: "Vercel", type: "file" },
      { name: "Netlify", type: "file" },
      { name: "Azure", type: "file" },
      { name: "Cloudflare", type: "file" },
    ],
  },
  {
    name: "Database",
    type: "folder",
    children: [
      { name: "PostgreSQL", type: "file" },
      { name: "MongoDB", type: "file" },
      { name: "MySQL", type: "file" },
      { name: "Redis", type: "file" },
      { name: "Prisma", type: "file" },
    ],
  },
  {
    name: "Polyglot",
    type: "folder",
    children: [
      { name: "Python", type: "file" },
      { name: "Go", type: "file" },
      { name: "Rust", type: "file" },
      { name: "Java", type: "file" },
      { name: "C#", type: "file" },
    ],
  },
];

// --- SVG Icon Components (all SVG, no external images) ---
const ChevronIcon = ({ isOpen }: ChevronIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 shrink-0 ${
      isOpen ? "rotate-90" : ""
    }`}
  >
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const FileIcon = () => (
  <svg
    className="w-5 h-5 mr-2 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
  </svg>
);

// --- SVGs for all files ---
const fileSVGs: Record<string, JSX.Element> = {
  React: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="2.5" fill="#61DAFB" />
      <g stroke="#61DAFB" strokeWidth="2" fill="none">
        <ellipse rx="11" ry="4.2" transform="matrix(.866 .5 -.866 .5 16 16)" />
        <ellipse rx="11" ry="4.2" transform="matrix(-.866 .5 .866 .5 16 16)" />
        <ellipse rx="11" ry="4.2" transform="matrix(0 1 1 0 16 16)" />
      </g>
    </svg>
  ),
  "Next.js": (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#fff" />
      <path d="M10 22L22 10" stroke="#000" strokeWidth="2" />
      <text
        x="16"
        y="20"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="8"
        fill="#000"
        fontFamily="sans-serif"
      >
        Next
      </text>
    </svg>
  ),
  TypeScript: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#3178C6" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="11"
        fill="#fff"
        fontFamily="sans-serif"
      >
        TS
      </text>
    </svg>
  ),
  "Tailwind CSS": (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#38BDF8" />
      <path
        d="M8 20c2-4 4-6 8-6s6 2 8 6"
        stroke="#fff"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M8 24c2-4 4-6 8-6s6 2 8 6"
        stroke="#fff"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
    </svg>
  ),
  Redux: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#fff" />
      <path
        d="M10 22c2-4 10-4 12 0"
        stroke="#764ABC"
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="16"
        cy="16"
        r="6"
        stroke="#764ABC"
        strokeWidth="2"
        fill="none"
      />
      <circle cx="16" cy="16" r="2" fill="#764ABC" />
    </svg>
  ),
  "Node.js": (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <polygon points="16,4 28,10 28,22 16,28 4,22 4,10" fill="#3C873A" />
      <text
        x="16"
        y="20"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="8"
        fill="#fff"
        fontFamily="sans-serif"
      >
        Node
      </text>
    </svg>
  ),
  Express: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#fff" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="10"
        fill="#000"
        fontFamily="serif"
      >
        Ex
      </text>
    </svg>
  ),
  NestJS: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#E0234E" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="10"
        fill="#fff"
        fontFamily="sans-serif"
      >
        Nest
      </text>
    </svg>
  ),
  GraphQL: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#fff" />
      <polygon
        points="16,6 28,24 4,24"
        fill="none"
        stroke="#E10098"
        strokeWidth="2"
      />
      <circle cx="16" cy="16" r="4" fill="#E10098" />
    </svg>
  ),
  AWS: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#fff" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="10"
        fill="#F90"
        fontFamily="sans-serif"
      >
        AWS
      </text>
    </svg>
  ),
  Vercel: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <polygon points="16,8 28,24 4,24" fill="#000" />
    </svg>
  ),
  Netlify: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#00C7B7" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="10"
        fill="#fff"
        fontFamily="sans-serif"
      >
        Netlify
      </text>
    </svg>
  ),
  Azure: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#0078D4" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="10"
        fill="#fff"
        fontFamily="sans-serif"
      >
        Azure
      </text>
    </svg>
  ),
  Cloudflare: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <ellipse cx="16" cy="20" rx="10" ry="4" fill="#F38020" />
      <ellipse cx="16" cy="16" rx="6" ry="2" fill="#F38020" />
    </svg>
  ),
  PostgreSQL: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <ellipse cx="16" cy="16" rx="14" ry="10" fill="#336791" />
      <ellipse cx="16" cy="16" rx="8" ry="4" fill="#fff" />
      <ellipse cx="16" cy="16" rx="4" ry="2" fill="#336791" />
    </svg>
  ),
  MongoDB: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#fff" />
      <path d="M16 8C16 8 12 16 16 24C20 16 16 8 16 8Z" fill="#47A248" />
      <circle cx="16" cy="20" r="2" fill="#47A248" />
    </svg>
  ),
  MySQL: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <ellipse cx="16" cy="16" rx="14" ry="10" fill="#00758F" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="8"
        fill="#fff"
        fontFamily="sans-serif"
      >
        MySQL
      </text>
    </svg>
  ),
  Redis: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#fff" />
      <rect x="8" y="12" width="16" height="8" rx="2" fill="#D82C20" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="8"
        fill="#fff"
        fontFamily="sans-serif"
      >
        Redis
      </text>
    </svg>
  ),
  Prisma: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <polygon
        points="16,6 26,26 6,26"
        fill="#fff"
        stroke="#0C344B"
        strokeWidth="2"
      />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="8"
        fill="#0C344B"
        fontFamily="sans-serif"
      >
        Prisma
      </text>
    </svg>
  ),
  Python: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#fff" />
      <rect x="8" y="10" width="16" height="6" rx="2" fill="#3776AB" />
      <rect x="8" y="16" width="16" height="6" rx="2" fill="#FFD43B" />
      <circle cx="12" cy="13" r="1" fill="#fff" />
      <circle cx="20" cy="19" r="1" fill="#fff" />
    </svg>
  ),
  Go: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#00ADD8" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="10"
        fill="#fff"
        fontFamily="sans-serif"
      >
        Go
      </text>
    </svg>
  ),
  Rust: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="14" fill="#fff" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="10"
        fill="#000"
        fontFamily="monospace"
      >
        Rust
      </text>
    </svg>
  ),
  Java: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#fff" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="10"
        fill="#007396"
        fontFamily="sans-serif"
      >
        Java
      </text>
    </svg>
  ),
  "C#": (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#fff" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="10"
        fill="#68217A"
        fontFamily="sans-serif"
      >
        C#
      </text>
    </svg>
  ),
};

// --- Folder SVGs ---
const folderSVGs: Record<string, JSX.Element> = {
  Frontend: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#F1F5F9" />
      <rect x="8" y="10" width="16" height="12" rx="2" fill="#38BDF8" />
      <rect x="10" y="12" width="12" height="8" rx="1" fill="#fff" />
    </svg>
  ),
  Backend: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#F1F5F9" />
      <rect x="8" y="10" width="16" height="12" rx="2" fill="#3C873A" />
      <rect x="10" y="12" width="12" height="8" rx="1" fill="#fff" />
    </svg>
  ),
  Cloud: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#F1F5F9" />
      <ellipse cx="16" cy="20" rx="10" ry="4" fill="#F38020" />
      <ellipse cx="16" cy="16" rx="6" ry="2" fill="#F38020" />
    </svg>
  ),
  Database: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <ellipse cx="16" cy="16" rx="14" ry="10" fill="#336791" />
      <ellipse cx="16" cy="16" rx="8" ry="4" fill="#fff" />
      <ellipse cx="16" cy="16" rx="4" ry="2" fill="#336791" />
    </svg>
  ),
  Polyglot: (
    <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="6" fill="#F1F5F9" />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fontWeight="bold"
        fontSize="11"
        fill="#6366F1"
        fontFamily="sans-serif"
      >
        多
      </text>
    </svg>
  ),
};

// --- TreeIcon Component (SVG only) ---
const TreeIcon = ({ item }: TreeIconProps) => {
  if (item.type === "folder") {
    return folderSVGs[item.name] || <FileIcon />;
  }
  return fileSVGs[item.name] || <FileIcon />;
};

// --- TreeNode Component (stateless open/close, controlled by parent) ---
const TreeNode = React.memo(function TreeNode({
  item,
  selectedItem,
  onItemSelect,
  openFolders,
  toggleFolder,
}: TreeNodeProps) {
  const isFolder = item.type === "folder";
  const isOpen = isFolder ? !!openFolders[item.name] : false;
  const isSelected = selectedItem?.name === item.name;

  const handleClick = useCallback(() => {
    onItemSelect(item);
    if (isFolder) {
      toggleFolder(item.name);
    }
  }, [item, isFolder, onItemSelect, toggleFolder]);

  return (
    <div className="text-gray-700 dark:text-gray-300 relative">
      <div
        className={`flex items-center py-1.5 px-2 rounded-md cursor-pointer transition-colors duration-150 ${
          isSelected
            ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-white"
            : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center flex-grow">
          {isFolder ? (
            <ChevronIcon isOpen={isOpen} />
          ) : (
            <div className="w-4 shrink-0"></div>
          )}
          <div className="flex items-center ml-1">
            <TreeIcon item={item} isOpen={isOpen} />
            <span className="text-sm ml-1.5">{item.name}</span>
          </div>
        </div>
      </div>
      <div
        className={`pl-4 relative overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[1000px]" : "max-h-0"
        }`}
      >
        <div className="absolute left-[13px] top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-800"></div>
        {isFolder &&
          isOpen &&
          item.children?.map((child) => (
            <TreeNode
              key={child.name}
              item={child}
              selectedItem={selectedItem}
              onItemSelect={onItemSelect}
              openFolders={openFolders}
              toggleFolder={toggleFolder}
            />
          ))}
      </div>
    </div>
  );
});
TreeNode.displayName = "TreeNode";

// --- Technology Details Data ---
const technologyDetails: Record<string, { description: React.ReactNode }> = {
  React: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #4D4A54 0%, #403D48 100%)"
          className="font-semibold text-center"
        >
          Why we use React:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #CBCACE 0%, #CBCACE 100%)"
              className="font-semibold text-black"
            >
              Component-Based Architecture:
            </TextHighlighter>{" "}
            React enables you to build encapsulated components that manage their
            own state, then compose them to make complex UIs.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #CBCACE 0%, #CBCACE 100%)"
              className="font-semibold text-black"
            >
              Virtual DOM:
            </TextHighlighter>{" "}
            Efficiently updates and renders just the right components when your
            data changes, leading to high performance.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #CBCACE 0%, #CBCACE 100%)"
              className="font-semibold text-black"
            >
              Unidirectional Data Flow:
            </TextHighlighter>{" "}
            Makes the code more predictable and easier to debug.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #CBCACE 0%, #CBCACE 100%)"
              className="font-semibold text-black"
            >
              Rich Ecosystem:
            </TextHighlighter>{" "}
            Huge community, lots of libraries, and great tooling for building
            modern web apps.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #CBCACE 0%, #CBCACE 100%)"
              className="font-semibold text-black"
            >
              Server-Side Rendering (SSR) & SEO:
            </TextHighlighter>{" "}
            With frameworks like Next.js, React supports SSR for better SEO and
            performance.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          React is a{" "}
          <span className="font-bold text-blue-600 dark:text-blue-300">
            powerful
          </span>{" "}
          and{" "}
          <span className="font-bold text-blue-600 dark:text-blue-300">
            flexible
          </span>{" "}
          library for building interactive user interfaces efficiently and at
          scale.
        </p>
      </div>
    ),
  },
  "Next.js": {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #222 0%, #444 100%)"
          className="font-semibold text-center"
        >
          Why we use Next.js:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E5E7EB 0%, #E5E7EB 100%)"
              className="font-semibold text-black"
            >
              Hybrid Rendering:
            </TextHighlighter>{" "}
            Supports both static site generation (SSG) and server-side rendering (SSR) for optimal performance and SEO.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E5E7EB 0%, #E5E7EB 100%)"
              className="font-semibold text-black"
            >
              File-based Routing:
            </TextHighlighter>{" "}
            Easy and intuitive routing system based on your file structure.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E5E7EB 0%, #E5E7EB 100%)"
              className="font-semibold text-black"
            >
              API Routes:
            </TextHighlighter>{" "}
            Build backend endpoints alongside your frontend code.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E5E7EB 0%, #E5E7EB 100%)"
              className="font-semibold text-black"
            >
              Built-in CSS & Image Optimization:
            </TextHighlighter>{" "}
            Automatic image, font, and CSS optimization for faster load times.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Next.js is a{" "}
          <span className="font-bold text-black dark:text-white">
            production-grade
          </span>{" "}
          React framework for building fast, scalable, and SEO-friendly web applications.
        </p>
      </div>
    ),
  },
  TypeScript: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #3178C6 0%, #285A8D 100%)"
          className="font-semibold text-center"
        >
          Why we use TypeScript:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #D1E8FF 0%, #D1E8FF 100%)"
              className="font-semibold text-black"
            >
              Static Typing:
            </TextHighlighter>{" "}
            Catches errors at compile time, making code more robust and maintainable.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #D1E8FF 0%, #D1E8FF 100%)"
              className="font-semibold text-black"
            >
              Great Tooling:
            </TextHighlighter>{" "}
            Autocompletion, refactoring, and navigation are improved in editors.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #D1E8FF 0%, #D1E8FF 100%)"
              className="font-semibold text-black"
            >
              Large Ecosystem:
            </TextHighlighter>{" "}
            Works seamlessly with JavaScript libraries and frameworks.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          TypeScript is a{" "}
          <span className="font-bold text-blue-600 dark:text-blue-300">
            powerful
          </span>{" "}
          superset of JavaScript that helps you write safer, more maintainable code.
        </p>
      </div>
    ),
  },
  "Tailwind CSS": {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #38BDF8 0%, #0EA5E9 100%)"
          className="font-semibold text-center"
        >
          Why we use Tailwind CSS:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0F2FE 0%, #E0F2FE 100%)"
              className="font-semibold text-black"
            >
              Utility-First:
            </TextHighlighter>{" "}
            Compose any design directly in your markup with utility classes.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0F2FE 0%, #E0F2FE 100%)"
              className="font-semibold text-black"
            >
              Customizable:
            </TextHighlighter>{" "}
            Easily extend and configure to fit your brand and design system.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0F2FE 0%, #E0F2FE 100%)"
              className="font-semibold text-black"
            >
              Responsive by Default:
            </TextHighlighter>{" "}
            Build responsive interfaces with minimal effort.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Tailwind CSS is a{" "}
          <span className="font-bold text-sky-600 dark:text-sky-300">
            flexible
          </span>{" "}
          utility-first CSS framework for rapidly building modern UIs.
        </p>
      </div>
    ),
  },
  Redux: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #764ABC 0%, #4B2C7A 100%)"
          className="font-semibold text-center"
        >
          Why we use Redux:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #EDE9FE 0%, #EDE9FE 100%)"
              className="font-semibold text-black"
            >
              Centralized State:
            </TextHighlighter>{" "}
            Manage application state in a single, predictable store.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #EDE9FE 0%, #EDE9FE 100%)"
              className="font-semibold text-black"
            >
              Debuggable:
            </TextHighlighter>{" "}
            Time-travel debugging and logging make it easy to track state changes.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #EDE9FE 0%, #EDE9FE 100%)"
              className="font-semibold text-black"
            >
              Ecosystem:
            </TextHighlighter>{" "}
            Integrates with React, middleware, and dev tools.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Redux is a{" "}
          <span className="font-bold text-purple-600 dark:text-purple-300">
            robust
          </span>{" "}
          state management library for predictable and scalable apps.
        </p>
      </div>
    ),
  },
  "Node.js": {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #3C873A 0%, #1A4D22 100%)"
          className="font-semibold text-center"
        >
          Why we use Node.js:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #D1FAE5 0%, #D1FAE5 100%)"
              className="font-semibold text-black"
            >
              Non-blocking I/O:
            </TextHighlighter>{" "}
            Handles many connections efficiently with event-driven architecture.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #D1FAE5 0%, #D1FAE5 100%)"
              className="font-semibold text-black"
            >
              JavaScript Everywhere:
            </TextHighlighter>{" "}
            Use the same language on both client and server.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #D1FAE5 0%, #D1FAE5 100%)"
              className="font-semibold text-black"
            >
              Large Ecosystem:
            </TextHighlighter>{" "}
            NPM provides access to thousands of libraries and tools.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Node.js is a{" "}
          <span className="font-bold text-green-700 dark:text-green-300">
            fast
          </span>{" "}
          and{" "}
          <span className="font-bold text-green-700 dark:text-green-300">
            scalable
          </span>{" "}
          runtime for building modern server-side applications.
        </p>
      </div>
    ),
  },
  Express: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #fff 0%, #eee 100%)"
          className="font-semibold text-center"
        >
          Why we use Express:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #F3F4F6 0%, #F3F4F6 100%)"
              className="font-semibold text-black"
            >
              Minimal & Flexible:
            </TextHighlighter>{" "}
            Lightweight framework for building web servers and APIs.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #F3F4F6 0%, #F3F4F6 100%)"
              className="font-semibold text-black"
            >
              Middleware Support:
            </TextHighlighter>{" "}
            Easily add features and handle requests with middleware.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #F3F4F6 0%, #F3F4F6 100%)"
              className="font-semibold text-black"
            >
              Large Community:
            </TextHighlighter>{" "}
            Well-documented and widely used in the Node.js ecosystem.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Express is a{" "}
          <span className="font-bold text-black dark:text-white">
            simple
          </span>{" "}
          and{" "}
          <span className="font-bold text-black dark:text-white">
            flexible
          </span>{" "}
          framework for building web servers and APIs.
        </p>
      </div>
    ),
  },
  NestJS: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #E0234E 0%, #B3123C 100%)"
          className="font-semibold text-center"
        >
          Why we use NestJS:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #FECACA 0%, #FECACA 100%)"
              className="font-semibold text-black"
            >
              Modular Architecture:
            </TextHighlighter>{" "}
            Organize code into modules for scalability and maintainability.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #FECACA 0%, #FECACA 100%)"
              className="font-semibold text-black"
            >
              TypeScript First:
            </TextHighlighter>{" "}
            Built with and for TypeScript, ensuring type safety.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #FECACA 0%, #FECACA 100%)"
              className="font-semibold text-black"
            >
              Dependency Injection:
            </TextHighlighter>{" "}
            Powerful DI system for managing dependencies.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          NestJS is a{" "}
          <span className="font-bold text-rose-700 dark:text-rose-300">
            scalable
          </span>{" "}
          and{" "}
          <span className="font-bold text-rose-700 dark:text-rose-300">
            maintainable
          </span>{" "}
          framework for building efficient server-side applications.
        </p>
      </div>
    ),
  },
  MongoDB: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #10AA50 0%, #0C7A36 100%)"
          className="font-semibold text-center"
        >
          Why we use MongoDB:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #D1FAE5 0%, #D1FAE5 100%)"
              className="font-semibold text-black"
            >
              Flexible Schema:
            </TextHighlighter>{" "}
            Store data in JSON-like documents for easy iteration.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #D1FAE5 0%, #D1FAE5 100%)"
              className="font-semibold text-black"
            >
              Scalable:
            </TextHighlighter>{" "}
            Built-in sharding and replication for horizontal scaling.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #D1FAE5 0%, #D1FAE5 100%)"
              className="font-semibold text-black"
            >
              Great for Prototyping:
            </TextHighlighter>{" "}
            Quickly build and iterate on new features.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          MongoDB is a{" "}
          <span className="font-bold text-green-700 dark:text-green-300">
            flexible
          </span>{" "}
          NoSQL database for modern applications.
        </p>
      </div>
    ),
  },
  MySQL: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #00758F 0%, #005F73 100%)"
          className="font-semibold text-center"
        >
          Why we use MySQL:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0E7FF 0%, #E0E7FF 100%)"
              className="font-semibold text-black"
            >
              Reliable:
            </TextHighlighter>{" "}
            Proven, stable, and widely used relational database.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0E7FF 0%, #E0E7FF 100%)"
              className="font-semibold text-black"
            >
              ACID Compliant:
            </TextHighlighter>{" "}
            Ensures data integrity and transactional safety.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0E7FF 0%, #E0E7FF 100%)"
              className="font-semibold text-black"
            >
              Open Source:
            </TextHighlighter>{" "}
            Free to use and supported by a large community.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          MySQL is a{" "}
          <span className="font-bold text-sky-700 dark:text-sky-300">
            reliable
          </span>{" "}
          open-source relational database for structured data.
        </p>
      </div>
    ),
  },
  Redis: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #DC382D 0%, #A81D1D 100%)"
          className="font-semibold text-center"
        >
          Why we use Redis:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #FECACA 0%, #FECACA 100%)"
              className="font-semibold text-black"
            >
              In-memory Store:
            </TextHighlighter>{" "}
            Extremely fast data access for caching and real-time apps.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #FECACA 0%, #FECACA 100%)"
              className="font-semibold text-black"
            >
              Versatile Data Structures:
            </TextHighlighter>{" "}
            Supports strings, hashes, lists, sets, and more.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #FECACA 0%, #FECACA 100%)"
              className="font-semibold text-black"
            >
              Pub/Sub Messaging:
            </TextHighlighter>{" "}
            Enables real-time communication between services.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Redis is a{" "}
          <span className="font-bold text-red-700 dark:text-red-300">
            high-performance
          </span>{" "}
          in-memory data store for caching and real-time applications.
        </p>
      </div>
    ),
  },
  Prisma: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #0C344B 0%, #1B4965 100%)"
          className="font-semibold text-center"
        >
          Why we use Prisma:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0E7FF 0%, #E0E7FF 100%)"
              className="font-semibold text-black"
            >
              Type-safe ORM:
            </TextHighlighter>{" "}
            Ensures type safety and autocompletion for database queries.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0E7FF 0%, #E0E7FF 100%)"
              className="font-semibold text-black"
            >
              Easy Migrations:
            </TextHighlighter>{" "}
            Manage schema changes with simple migration tools.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0E7FF 0%, #E0E7FF 100%)"
              className="font-semibold text-black"
            >
              Works with Many DBs:
            </TextHighlighter>{" "}
            Supports PostgreSQL, MySQL, SQLite, SQL Server, and more.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Prisma is a{" "}
          <span className="font-bold text-blue-900 dark:text-blue-300">
            modern
          </span>{" "}
          ORM for type-safe and efficient database access.
        </p>
      </div>
    ),
  },
  Python: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #3776AB 0%, #FFD43B 100%)"
          className="font-semibold text-center"
        >
          Why we use Python:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0E7FF 0%, #E0E7FF 100%)"
              className="font-semibold text-black"
            >
              Readable Syntax:
            </TextHighlighter>{" "}
            Easy to learn and write, great for rapid development.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0E7FF 0%, #E0E7FF 100%)"
              className="font-semibold text-black"
            >
              Versatile:
            </TextHighlighter>{" "}
            Used for web, data science, automation, and more.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0E7FF 0%, #E0E7FF 100%)"
              className="font-semibold text-black"
            >
              Huge Ecosystem:
            </TextHighlighter>{" "}
            Thousands of libraries for every use case.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Python is a{" "}
          <span className="font-bold text-blue-700 dark:text-yellow-400">
            versatile
          </span>{" "}
          and{" "}
          <span className="font-bold text-blue-700 dark:text-yellow-400">
            beginner-friendly
          </span>{" "}
          language for a wide range of applications.
        </p>
      </div>
    ),
  },
  Go: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #00ADD8 0%, #007D9C 100%)"
          className="font-semibold text-center"
        >
          Why we use Go:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0F2FE 0%, #E0F2FE 100%)"
              className="font-semibold text-black"
            >
              Fast & Efficient:
            </TextHighlighter>{" "}
            Compiles to native code and runs with low memory overhead.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0F2FE 0%, #E0F2FE 100%)"
              className="font-semibold text-black"
            >
              Concurrency:
            </TextHighlighter>{" "}
            Goroutines make concurrent programming easy and safe.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0F2FE 0%, #E0F2FE 100%)"
              className="font-semibold text-black"
            >
              Simple Syntax:
            </TextHighlighter>{" "}
            Easy to learn and maintain.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Go is a{" "}
          <span className="font-bold text-sky-700 dark:text-sky-300">
            fast
          </span>{" "}
          and{" "}
          <span className="font-bold text-sky-700 dark:text-sky-300">
            efficient
          </span>{" "}
          language for scalable backend systems.
        </p>
      </div>
    ),
  },
  Rust: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #fff 0%, #000 100%)"
          className="font-semibold text-center"
        >
          Why we use Rust:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E5E7EB 0%, #E5E7EB 100%)"
              className="font-semibold text-black"
            >
              Memory Safety:
            </TextHighlighter>{" "}
            Prevents bugs and security issues at compile time.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E5E7EB 0%, #E5E7EB 100%)"
              className="font-semibold text-black"
            >
              High Performance:
            </TextHighlighter>{" "}
            As fast as C/C++ with no garbage collector.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E5E7EB 0%, #E5E7EB 100%)"
              className="font-semibold text-black"
            >
              Modern Tooling:
            </TextHighlighter>{" "}
            Cargo and crates.io make dependency management easy.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Rust is a{" "}
          <span className="font-bold text-black dark:text-white">
            safe
          </span>{" "}
          and{" "}
          <span className="font-bold text-black dark:text-white">
            high-performance
          </span>{" "}
          language for systems programming.
        </p>
      </div>
    ),
  },
  Java: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #007396 0%, #005F73 100%)"
          className="font-semibold text-center"
        >
          Why we use Java:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0E7FF 0%, #E0E7FF 100%)"
              className="font-semibold text-black"
            >
              Platform Independent:
            </TextHighlighter>{" "}
            Runs anywhere with the Java Virtual Machine (JVM).
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0E7FF 0%, #E0E7FF 100%)"
              className="font-semibold text-black"
            >
              Mature Ecosystem:
            </TextHighlighter>{" "}
            Huge number of libraries, frameworks, and tools.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0E7FF 0%, #E0E7FF 100%)"
              className="font-semibold text-black"
            >
              Strong Typing:
            </TextHighlighter>{" "}
            Helps catch errors early and maintain large codebases.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Java is a{" "}
          <span className="font-bold text-blue-700 dark:text-blue-300">
            reliable
          </span>{" "}
          and{" "}
          <span className="font-bold text-blue-700 dark:text-blue-300">
            widely-used
          </span>{" "}
          language for enterprise and cross-platform development.
        </p>
      </div>
    ),
  },
  "C#": {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #68217A 0%, #3C1053 100%)"
          className="font-semibold text-center"
        >
          Why we use C#:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #EDE9FE 0%, #EDE9FE 100%)"
              className="font-semibold text-black"
            >
              Modern Language:
            </TextHighlighter>{" "}
            Combines power and productivity with modern features.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #EDE9FE 0%, #EDE9FE 100%)"
              className="font-semibold text-black"
            >
              .NET Ecosystem:
            </TextHighlighter>{" "}
            Build web, desktop, mobile, and cloud apps with .NET.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #EDE9FE 0%, #EDE9FE 100%)"
              className="font-semibold text-black"
            >
              Strong Typing:
            </TextHighlighter>{" "}
            Helps catch errors early and maintain large codebases.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          C# is a{" "}
          <span className="font-bold text-purple-700 dark:text-purple-300">
            modern
          </span>{" "}
          and{" "}
          <span className="font-bold text-purple-700 dark:text-purple-300">
            versatile
          </span>{" "}
          language for building applications on the .NET platform.
        </p>
      </div>
    ),
  },
  AWS: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #FF9900 0%, #FFB84D 100%)"
          className="font-semibold text-center"
        >
          Why we use AWS:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #FFF7ED 0%, #FFF7ED 100%)"
              className="font-semibold text-black"
            >
              Scalability:
            </TextHighlighter>{" "}
            Easily scale infrastructure up or down to meet demand.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #FFF7ED 0%, #FFF7ED 100%)"
              className="font-semibold text-black"
            >
              Global Reach:
            </TextHighlighter>{" "}
            Deploy applications in multiple regions worldwide.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #FFF7ED 0%, #FFF7ED 100%)"
              className="font-semibold text-black"
            >
              Rich Ecosystem:
            </TextHighlighter>{" "}
            Wide range of services for compute, storage, databases, and more.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          AWS is a{" "}
          <span className="font-bold text-yellow-700 dark:text-yellow-400">
            leading
          </span>{" "}
          cloud platform for building, deploying, and scaling modern applications.
        </p>
      </div>
    ),
  },
  Vercel: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #000 0%, #666 100%)"
          className="font-semibold text-center"
        >
          Why we use Vercel:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E5E7EB 0%, #E5E7EB 100%)"
              className="font-semibold text-black"
            >
              Instant Deployments:
            </TextHighlighter>{" "}
            Push to Git and deploy automatically in seconds.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E5E7EB 0%, #E5E7EB 100%)"
              className="font-semibold text-black"
            >
              Serverless Functions:
            </TextHighlighter>{" "}
            Easily add backend logic with zero configuration.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E5E7EB 0%, #E5E7EB 100%)"
              className="font-semibold text-black"
            >
              Optimized for Next.js:
            </TextHighlighter>{" "}
            First-class support for Next.js and frontend frameworks.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Vercel is a{" "}
          <span className="font-bold text-black dark:text-white">
            seamless
          </span>{" "}
          platform for deploying and scaling modern web apps.
        </p>
      </div>
    ),
  },
  Netlify: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #00C7B7 0%, #00E6D3 100%)"
          className="font-semibold text-center"
        >
          Why we use Netlify:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0FCF9 0%, #E0FCF9 100%)"
              className="font-semibold text-black"
            >
              Continuous Deployment:
            </TextHighlighter>{" "}
            Automatic builds and deploys from Git.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0FCF9 0%, #E0FCF9 100%)"
              className="font-semibold text-black"
            >
              Serverless Functions:
            </TextHighlighter>{" "}
            Add backend logic without managing servers.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E0FCF9 0%, #E0FCF9 100%)"
              className="font-semibold text-black"
            >
              Easy Custom Domains:
            </TextHighlighter>{" "}
            Free SSL and instant domain setup.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Netlify is a{" "}
          <span className="font-bold text-teal-700 dark:text-teal-300">
            developer-friendly
          </span>{" "}
          platform for deploying static and JAMstack sites.
        </p>
      </div>
    ),
  },
  Azure: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #0072C6 0%, #5EA9DD 100%)"
          className="font-semibold text-center"
        >
          Why we use Azure:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E6F0FA 0%, #E6F0FA 100%)"
              className="font-semibold text-black"
            >
              Enterprise-Ready:
            </TextHighlighter>{" "}
            Trusted by large organizations for mission-critical workloads.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E6F0FA 0%, #E6F0FA 100%)"
              className="font-semibold text-black"
            >
              Hybrid Cloud:
            </TextHighlighter>{" "}
            Seamless integration with on-premises and cloud resources.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E6F0FA 0%, #E6F0FA 100%)"
              className="font-semibold text-black"
            >
              Broad Service Range:
            </TextHighlighter>{" "}
            Offers compute, AI, analytics, and DevOps tools.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Azure is a{" "}
          <span className="font-bold text-blue-700 dark:text-blue-300">
            robust
          </span>{" "}
          cloud platform for building, deploying, and managing applications.
        </p>
      </div>
    ),
  },
  Cloudflare: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #F38020 0%, #F7B267 100%)"
          className="font-semibold text-center"
        >
          Why we use Cloudflare:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #FFF7ED 0%, #FFF7ED 100%)"
              className="font-semibold text-black"
            >
              Global CDN:
            </TextHighlighter>{" "}
            Delivers content quickly to users worldwide.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #FFF7ED 0%, #FFF7ED 100%)"
              className="font-semibold text-black"
            >
              Security:
            </TextHighlighter>{" "}
            Protects against DDoS, bots, and other threats.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #FFF7ED 0%, #FFF7ED 100%)"
              className="font-semibold text-black"
            >
              Edge Computing:
            </TextHighlighter>{" "}
            Run code at the edge for low-latency experiences.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          Cloudflare is a{" "}
          <span className="font-bold text-orange-700 dark:text-orange-300">
            fast
          </span>{" "}
          and{" "}
          <span className="font-bold text-orange-700 dark:text-orange-300">
            secure
          </span>{" "}
          platform for web performance and protection.
        </p>
      </div>
    ),
  },
  PostgreSQL: {
    description: (
      <div className="mt-4 text-xs max-w-xl">
        <TextHighlighter
          as="span"
          highlightColor="linear-gradient(90deg, #336791 0%, #6CA0DC 100%)"
          className="font-semibold text-center"
        >
          Why we use PostgreSQL:
        </TextHighlighter>
        <ul className="list-disc pl-6 mt-2 space-y-1">
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E3EFFF 0%, #E3EFFF 100%)"
              className="font-semibold text-black"
            >
              Advanced Features:
            </TextHighlighter>{" "}
            Supports complex queries, indexing, and full-text search.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E3EFFF 0%, #E3EFFF 100%)"
              className="font-semibold text-black"
            >
              Reliability:
            </TextHighlighter>{" "}
            ACID-compliant and proven for mission-critical workloads.
          </li>
          <li>
            <TextHighlighter
              highlightColor="linear-gradient(90deg, #E3EFFF 0%, #E3EFFF 100%)"
              className="font-semibold text-black"
            >
              Extensibility:
            </TextHighlighter>{" "}
            Add custom functions, types, and extensions.
          </li>
        </ul>
        <p className="mt-3">
          <TextHighlighter
            highlightColor="linear-gradient(90deg, #f472b6 0%, #5A1E62 100%)"
            className="font-semibold"
          >
            In summary:
          </TextHighlighter>{" "}
          PostgreSQL is a{" "}
          <span className="font-bold text-blue-700 dark:text-blue-300">
            powerful
          </span>{" "}
          open-source database for modern applications.
        </p>
      </div>
    ),
  },
};

// --- Image Display Component (SVG only) ---
const ImageDisplay = ({ selectedItem }: ImageDisplayProps) => {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const svgIcon =
    selectedItem && fileSVGs[selectedItem.name]
      ? fileSVGs[selectedItem.name]
      : selectedItem && folderSVGs[selectedItem.name]
      ? folderSVGs[selectedItem.name]
      : null;

  useGSAP(
    () => {
      gsap.fromTo(
        imageContainerRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { opacity: 1, scale: 1.4, y: 0, duration: 0.5, ease: "power2.out" }
      );
    },
    { dependencies: [selectedItem], scope: imageContainerRef }
  );

  return (
    <div className="w-full h-full flex items-start justify-center p-32 rounded-lg">
      <div ref={imageContainerRef} className="opacity-0">
        {svgIcon ? (
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 flex items-center justify-center">
              {React.cloneElement(svgIcon as React.ReactElement, {
                className: "w-full h-full",
              })}
            </div>
            <div className="mt-2 text-gray-700 dark:text-gray-200 font-semibold">
              {selectedItem?.name}
            </div>
            {/* Show details below the SVG if available */}
            {selectedItem?.name &&
              technologyDetails[selectedItem.name]?.description && (
                <div>{technologyDetails[selectedItem.name].description}</div>
              )}
          </div>
        ) : (
          <div className="text-gray-400">Select a technology to view</div>
        )}
      </div>
    </div>
  );
};

// --- Main Export Component ---
export default function TechnologyTree() {
  // Find initial item (React)
  const findInitialItem = () =>
    technologyTreeData
      .flatMap((folder) => folder.children || [])
      .find((file) => file.name === "React");

  const [selectedItem, setSelectedItem] = useState<FileTreeItem | null>(
    findInitialItem() || null
  );

  // Open all folders by default
  const defaultOpenFolders: Record<string, boolean> = {};
  technologyTreeData.forEach((folder) => {
    if (folder.type === "folder") defaultOpenFolders[folder.name] = true;
  });

  const [openFolders, setOpenFolders] =
    useState<Record<string, boolean>>(defaultOpenFolders);

  const handleItemSelect = useCallback((item: FileTreeItem) => {
    setSelectedItem(item);
  }, []);

  const toggleFolder = useCallback((name: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }, []);

  return (
    <div className="font-mono px-4  bg-[#18171c] rounded-lg border border-gray-200 dark:border-gray-800 w-full">
      <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-100">
        Technology Stack
      </h2>
      <div className="flex flex-col md:flex-row gap-8 w-full min-h-[550px]">
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-800 pr-4">
          {technologyTreeData.map((item) => (
            <TreeNode
              key={item.name}
              item={item}
              selectedItem={selectedItem}
              onItemSelect={handleItemSelect}
              openFolders={openFolders}
              toggleFolder={toggleFolder}
            />
          ))}
        </div>
        <div className="w-full md:w-2/3 lg:w-3/4 flex justify-center items-start">
          <div className="sticky top-4 w-full flex justify-center items-start" style={{ maxHeight: "1050px" }}>
            <ImageDisplay selectedItem={selectedItem} />
          </div>
        </div>
      </div>
    </div>
  );
}
