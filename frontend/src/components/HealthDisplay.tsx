import { Plus, Minus, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon } from "./ui/input-group";
import { cn } from "@/lib/utils";

interface HealthDisplayProps {
    value: number;
    changeValue?: number;
    onChange?: (value: number) => void;
    editable?: boolean;
    icon?: LucideIcon;
    label?: string;
    className?: string;
}

export const HealthDisplay = ({
    value,
    changeValue,
    onChange,
    editable = false,
    icon: Icon,
    label,
    className,
}: HealthDisplayProps) => {
    const handleDecrement = () => onChange?.((changeValue ?? 0) - 1);
    const handleIncrement = () => onChange?.((changeValue ?? 0) + 1);
    return (
        <div className={cn("flex flex-2 gap-2 items-center", className)}>
            {Icon && <Icon className="size-4" />}
            <InputGroup className="flex flex-1 justify-between h-full">
                <InputGroupAddon align="inline-start">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDecrement}
                        hidden={!editable}
                        aria-label="Decrease health"
                    >
                        <Minus className="size-4" />
                    </Button>
                </InputGroupAddon>
                <div className="flex flex-1 justify-center">
                    <span className="relative flex">
                        {label && (
                            <p className="absolute right-full top-0 mr-1 text-sm font-extralight text-ellipsis whitespace-nowrap">
                                {label}
                            </p>
                        )}
                        <p className="text-md">{value}</p>
                        {!!changeValue && (
                            <p className="absolute left-full top-0 ml-1 font-semibold text-md">
                                {changeValue && changeValue > 0 && "+"}
                                {changeValue}
                            </p>
                        )}
                    </span>
                </div>
                <InputGroupAddon align="inline-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleIncrement}
                        hidden={!editable}
                        aria-label="Increase health"
                    >
                        <Plus className="size-4" />
                    </Button>
                </InputGroupAddon>
            </InputGroup>
        </div>
    );
};
