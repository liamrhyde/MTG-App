import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon } from "./ui/input-group";

interface HealthDisplayProps {
    value: number;
    onChange: (value: number) => void;
    editable?: boolean;
    min?: number;
    max?: number;
}

export const HealthDisplay = ({
    value,
    onChange,
    editable = false,
    min = 0,
    max = 40,
}: HealthDisplayProps) => {
    const handleDecrement = () => {
        const newValue = Math.max(value - 1, min);
        onChange(newValue);
    };

    const handleIncrement = () => {
        const newValue = Math.min(value + 1, max);
        onChange(newValue);
    };

    return (
        <InputGroup className="flex justify-between">
            <InputGroupAddon align="inline-start">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDecrement}
                    disabled={value <= min}
                    hidden={!editable}
                    aria-label="Decrease health"
                >
                    <Minus className="size-4" />
                </Button>
            </InputGroupAddon>
            <p className="font-semibold text-md">{value}</p>
            <InputGroupAddon align="inline-end">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleIncrement}
                    disabled={value >= max}
                    hidden={!editable}
                    aria-label="Increase health"
                >
                    <Plus className="size-4" />
                </Button>
            </InputGroupAddon>
        </InputGroup>
    );
};
