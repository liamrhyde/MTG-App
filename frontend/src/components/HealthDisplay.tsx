import { Plus, Minus } from "lucide-react";
import {
    ButtonGroup,
    ButtonGroupAddon,
    ButtonGroupButton,
    ButtonGroupText,
} from "@/components/ui/button-group";

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
        <ButtonGroup>
            {editable && (
                <ButtonGroupAddon align="inline-start">
                    <ButtonGroupButton
                        onClick={handleDecrement}
                        disabled={value <= min}
                        aria-label="Decrease health"
                    >
                        <Minus className="size-4" />
                    </ButtonGroupButton>
                </ButtonGroupAddon>
            )}
            <ButtonGroupText className="font-semibold text-lg">
                {value}
            </ButtonGroupText>
            {editable && (
                <ButtonGroupAddon align="inline-end">
                    <ButtonGroupButton
                        onClick={handleIncrement}
                        disabled={value >= max}
                        aria-label="Increase health"
                    >
                        <Plus className="size-4" />
                    </ButtonGroupButton>
                </ButtonGroupAddon>
            )}
        </ButtonGroup>
    );
};
