import { Field, Form, useForm } from "@formisch/react";
import type * as v from "valibot";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerCreationSchema } from "@/views/NewGame/schemas";

interface PlayerCreationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const PlayerCreationDialog = ({
    open,
    onOpenChange,
}: PlayerCreationDialogProps) => {
    const form = useForm({ schema: PlayerCreationSchema });

    const handleSubmit = (
        values: v.InferOutput<typeof PlayerCreationSchema>,
    ) => {
        // TODO: submit the new player through the API hook (added later), then
        // advance the dialog to the Deck creation step.
        console.log("Create player", values);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl lg:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Player Creation</DialogTitle>
                </DialogHeader>

                {/* Stop the submit event bubbling through the React tree to
                    the outer Game <Form> (this dialog renders in a portal but
                    events still propagate up the React parent chain). */}
                <div className="contents" onSubmit={(e) => e.stopPropagation()}>
                    <Form
                        of={form}
                        onSubmit={handleSubmit}
                        className="flex h-full flex-col gap-4"
                    >
                        <Field of={form} path={["name"]}>
                            {(field) => (
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="player-name"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Name
                                    </label>
                                    <Input
                                        id="player-name"
                                        placeholder="Player name"
                                        aria-invalid={!!field.errors}
                                        {...field.props}
                                    />
                                    {field.errors && (
                                        <p className="text-sm text-destructive">
                                            {field.errors[0]}
                                        </p>
                                    )}
                                </div>
                            )}
                        </Field>

                        <DialogFooter className="mt-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Create Player</Button>
                        </DialogFooter>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
};
