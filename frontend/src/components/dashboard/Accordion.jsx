import { createContext, useCallback, useContext, useId, useMemo, useState } from 'react';

const AccordionContext = createContext(null);
const AccordionItemContext = createContext(null);

function useAccordionContext() {
    const context = useContext(AccordionContext);
    if (!context) {
        throw new Error('Accordion bileşenleri yalnızca <Accordion> içinde kullanılabilir.');
    }
    return context;
}

function useAccordionItemContext() {
    const context = useContext(AccordionItemContext);
    if (!context) {
        throw new Error('AccordionTrigger ve AccordionContent yalnızca <AccordionItem> içinde kullanılabilir.');
    }
    return context;
}

const ACCORDION_TRANSITION_CLASS = 'grid transition-[grid-template-rows] duration-200 ease-out';

function AnimatedCollapse({
    open,
    className = '',
    innerClassName = '',
    children,
    onTransitionEnd,
}) {
    return (
        <div
            data-state={open ? 'open' : 'closed'}
            onTransitionEnd={(event) => {
                if (event.propertyName === 'grid-template-rows') {
                    onTransitionEnd?.(event);
                }
            }}
            className={`${ACCORDION_TRANSITION_CLASS} ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'} ${className}`}
        >
            <div className={`overflow-hidden ${innerClassName}`}>
                {children}
            </div>
        </div>
    );
}

function ChevronDownIcon({ className }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M6 9l6 6 6-6" />
        </svg>
    );
}

function Accordion({
    type = 'single',
    collapsible = true,
    value: controlledValue,
    defaultValue,
    onValueChange,
    className = '',
    children,
}) {
    const isControlled = controlledValue !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = useState(() => {
        if (defaultValue === undefined) return type === 'multiple' ? [] : '';
        return defaultValue;
    });

    const value = isControlled ? controlledValue : uncontrolledValue;

    const setValue = useCallback((nextValue) => {
        if (!isControlled) {
            setUncontrolledValue(nextValue);
        }
        onValueChange?.(nextValue);
    }, [isControlled, onValueChange]);

    const isItemOpen = useCallback((itemValue) => {
        if (type === 'multiple') {
            return Array.isArray(value) && value.includes(itemValue);
        }
        return value === itemValue;
    }, [type, value]);

    const toggleItem = useCallback((itemValue) => {
        if (type === 'multiple') {
            const current = Array.isArray(value) ? value : [];
            const isOpen = current.includes(itemValue);
            setValue(isOpen ? current.filter((v) => v !== itemValue) : [...current, itemValue]);
            return;
        }

        const isOpen = value === itemValue;
        if (isOpen) {
            if (collapsible) setValue('');
            return;
        }
        setValue(itemValue);
    }, [collapsible, setValue, type, value]);

    const contextValue = useMemo(() => ({
        type,
        isItemOpen,
        toggleItem,
    }), [isItemOpen, toggleItem, type]);

    return (
        <AccordionContext.Provider value={contextValue}>
            <div className={`flex flex-col gap-1 ${className}`}>
                {children}
            </div>
        </AccordionContext.Provider>
    );
}

function AccordionItem({
    value,
    disabled = false,
    className = '',
    children,
}) {
    const itemId = useId();
    const contextValue = useMemo(() => ({
        value,
        disabled,
        triggerId: `${itemId}-trigger`,
        contentId: `${itemId}-content`,
    }), [disabled, itemId, value]);

    return (
        <AccordionItemContext.Provider value={contextValue}>
            <div
                className={`overflow-hidden rounded-xl border border-slate-200/80 bg-white ${disabled ? 'opacity-60' : ''} ${className}`}
            >
                {children}
            </div>
        </AccordionItemContext.Provider>
    );
}

function AccordionTrigger({
    className = '',
    iconClassName = '',
    hideIcon = false,
    children,
}) {
    const { isItemOpen, toggleItem } = useAccordionContext();
    const { value, disabled, triggerId, contentId } = useAccordionItemContext();
    const open = isItemOpen(value);

    return (
        <button
            type="button"
            id={triggerId}
            disabled={disabled}
            aria-expanded={open}
            aria-controls={contentId}
            onClick={() => toggleItem(value)}
            className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:hover:bg-transparent ${className}`}
        >
            <span className="min-w-0 flex-1">{children}</span>
            {!hideIcon && (
                <ChevronDownIcon
                    className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${iconClassName}`}
                />
            )}
        </button>
    );
}

function AccordionContent({
    className = '',
    contentClassName = '',
    children,
}) {
    const { isItemOpen } = useAccordionContext();
    const { value, triggerId, contentId } = useAccordionItemContext();
    const open = isItemOpen(value);

    return (
        <AnimatedCollapse open={open} className={className}>
            <div
                id={contentId}
                role="region"
                aria-labelledby={triggerId}
                className={`border-t border-slate-100 px-4 py-3 text-sm text-slate-600 ${contentClassName}`}
            >
                {children}
            </div>
        </AnimatedCollapse>
    );
}

export {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
    AnimatedCollapse,
};
