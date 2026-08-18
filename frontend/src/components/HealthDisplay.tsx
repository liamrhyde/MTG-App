import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon } from "./ui/input-group";

interface HealthDisplayProps {
    label?: string;
    value: number;
    changeValue: number | undefined;
    onChange: (value: number) => void;
    editable?: boolean;
}

export const HealthDisplay = ({
    label,
    value,
    changeValue,
    onChange,
    editable = false,
}: HealthDisplayProps) => {
    const handleDecrement = () => onChange((changeValue ?? 0) - 1);
    const handleIncrement = () => onChange((changeValue ?? 0) + 1);
    return (
        <div className="flex flex-1 gap-2 items-center">
            {label && <p>{label}</p>}
            <InputGroup className="flex justify-between">
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
