import { Field, Form, setInput, useForm } from "@formisch/react";
import type * as v from "valibot";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeckCreationSchema, PlayerCreationSchema } from "@/schemas";
import type { Deck, Player } from "@/schemas";
import { useState } from "react";
import { useCreatePlayer } from "@/hooks/usePlayers";
import { useCreateDeck } from "@/hooks/useDecks";
import { Spinner } from "../ui/spinner";

type Step =
    | { step: "player-form" }
    | { step: "player-created"; player: Player }
    | { step: "deck-form"; player: Player }
    | { step: "deck-created"; player: Player; deck: Deck };

interface PlayerDeckCreationDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    player?: Player;
    onPlayerCreated?: (playerId: number) => void;
    onDeckCreated?: (deckId: number) => void;
}

export const PlayerDeckCreationDialog = ({
    isOpen,
    onOpenChange,
    player,
    onPlayerCreated,
    onDeckCreated,
}: PlayerDeckCreationDialogProps) => {
    const [currentStep, setCurrentStep] = useState<Step>(() =>
        player ? { step: "deck-form", player } : { step: "player-form" },
    );

    const { createPlayer, isPending: isPendingPlayer } = useCreatePlayer();
    const { createDeck, isPending: isPendingDeck } = useCreateDeck();

    const playerForm = useForm({ schema: PlayerCreationSchema });
    const deckForm = useForm({
        schema: DeckCreationSchema,
        initialInput: { ownerId: player?.id },
    });

    const handlePlayerSubmit = async (
        values: v.InferOutput<typeof PlayerCreationSchema>,
    ) => {
        await createPlayer(values).then((p) => {
            onPlayerCreated?.(p.id);
            setInput(deckForm, { path: ["ownerId"], input: p.id });
            setCurrentStep({ step: "player-created", player: p });
        });
    };

    const handleDeckSubmit = async (
        values: v.InferOutput<typeof DeckCreationSchema>,
    ) => {
        if (currentStep.step !== "deck-form") {
            console.error(
                `Unable to create deck: Current step'${currentStep.step}' does not match expected 'deck-form'`,
            );
            return;
        }
        const player = currentStep.player;
        await createDeck(values).then((deck) => {
            onDeckCreated?.(deck.id);
            setCurrentStep({ step: "deck-created", player, deck });
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl lg:max-w-2xl">
                <div
                    className="contents"
                    onSubmit={(e) => e.stopPropagation()}
                    key={currentStep.step}
                >
                    {currentStep.step === "player-form" && (
                        <Form
                            of={playerForm}
                            onSubmit={handlePlayerSubmit}
                            className="flex h-full flex-col gap-4"
                        >
                            <DialogHeader>
                                <DialogTitle>Player Creation</DialogTitle>
                            </DialogHeader>

                            <Field of={playerForm} path={["name"]}>
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
                                <Button
                                    type="submit"
                                    disabled={isPendingPlayer}
                                >
                                    {isPendingPlayer && (
                                        <Spinner data-icon="inline-start" />
                                    )}
                                    Create Player
                                </Button>
                            </DialogFooter>
                        </Form>
                    )}
                    {currentStep.step === "player-created" && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Player Creation</DialogTitle>
                            </DialogHeader>
                            <div className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                    {currentStep.player.name}
                                </span>{" "}
                                was successfully created.
                            </div>
                            <DialogFooter className="mt-auto">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Use Existing Deck
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() =>
                                        setCurrentStep({
                                            step: "deck-form",
                                            player: currentStep.player,
                                        })
                                    }
                                >
                                    Create New Deck
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                    {currentStep.step === "deck-form" && (
                        <Form
                            of={deckForm}
                            onSubmit={handleDeckSubmit}
                            className="flex h-full flex-col gap-4"
                        >
                            <DialogHeader>
                                <DialogTitle>Deck Creation</DialogTitle>
                                <DialogDescription>
                                    Create a deck for {currentStep.player.name}
                                </DialogDescription>
                            </DialogHeader>
                            <Field of={deckForm} path={["name"]}>
                                {(field) => (
                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="deck-name"
                                            className="text-sm font-medium text-foreground"
                                        >
                                            Name
                                        </label>
                                        <Input
                                            id="deck-name"
                                            placeholder="Deck name"
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
                                <Button type="submit" disabled={isPendingDeck}>
                                    {isPendingDeck && (
                                        <Spinner data-icon="inline-start" />
                                    )}
                                    Create Deck
                                </Button>
                            </DialogFooter>
                        </Form>
                    )}
                    {currentStep.step === "deck-created" && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Deck Creation</DialogTitle>
                            </DialogHeader>
                            <div className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                    {currentStep.deck.name} was created for{" "}
                                    {currentStep.player.name}
                                </span>
                                .
                            </div>
                            <DialogFooter className="mt-auto">
                                <Button
                                    type="button"
                                    variant="default"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Close
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
