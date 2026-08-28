import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeckSelector, type DeckSelectionIds } from "@/components/DeckSelector";
import type { Deck, Player, UUID } from "./schemas";

import {
    Field,
    FieldArray,
    Form,
    getErrors,
    insert,
    remove,
    replace,
    useForm,
} from "@formisch/react";
import * as v from "valibot";
import { useCallback } from "react";
import { AlertCircleIcon } from "lucide-react";
import { GameSelectionSchema } from "./schemas";
import { navigate } from "wouter/use-browser-location";

const MOCK_PLAYERS: Record<UUID, Player> = {
    a1: { id: "a1", name: "Alice" },
    b2: { id: "b2", name: "Bob" },
    c3: { id: "c3", name: "Charlie" },
    d4: { id: "d4", name: "Dana" },
    l5: { id: "l5", name: "Liam" },
};

const MOCK_DECKS: Record<UUID, Deck> = {
    "d-a1-1": { id: "d-a1-1", name: "Mono Red Aggro", player: "a1" },
    "d-a1-2": { id: "d-a1-2", name: "Golgari Midrange", player: "a1" },
    "d-b2-1": { id: "d-b2-1", name: "Azorius Control", player: "b2" },
    "d-c3-1": { id: "d-c3-1", name: "Gruul Stompy", player: "c3" },
    "d-c3-2": { id: "d-c3-2", name: "Boros Aggro", player: "c3" },
    "d-c3-3": { id: "d-c3-3", name: "Simic Ramp", player: "c3" },
    "d-d4-1": { id: "d-d4-1", name: "Dimir Mill", player: "d4" },
    "d-d4-2": { id: "d-d4-2", name: "Selesnya Tokens", player: "d4" },
};

export const NewGame = () => {
    const newGameForm = useForm({ schema: GameSelectionSchema });

    const removeItem = (index: number) =>
        remove(newGameForm, { path: ["selectedDecks"], at: index });
    const changeItem = (index: number, selection: DeckSelectionIds) =>
        replace(newGameForm, {
            path: ["selectedDecks"],
            at: index,
            initialInput: selection,
        });

    const addEmptyItem = () =>
        insert(newGameForm, {
            path: ["selectedDecks"],
            initialInput: {},
        });

    const handleSubmit = (
        values: v.InferOutput<typeof GameSelectionSchema>,
    ) => {
        console.log(values);
        navigate("/game/abcd");
    };

    const getFormErrors = useCallback(
        (index: number, fieldName: "playerId" | "deckId") => {
            return getErrors(newGameForm, {
                path: ["selectedDecks", index, fieldName],
            });
        },
        [newGameForm],
    );

    const fieldArrayErrors = getErrors(newGameForm, {
        path: ["selectedDecks"],
    });

    return (
        <div className="flex flex-col h-screen bg-background">
            <Form of={newGameForm} onSubmit={handleSubmit}>
                {/* Main content - scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 max-w-screen-xl mx-auto">
                        <h1 className="text-3xl font-bold mb-8">New Game</h1>

                        {/* Player/Deck Selectors */}
                        <FieldArray of={newGameForm} path={["selectedDecks"]}>
                            {(fieldArray) => (
                                <>
                                    <div className="space-y-4 mb-6">
                                        {fieldArray.items.map((item, index) => (
                                            <Field
                                                key={item}
                                                of={newGameForm}
                                                path={["selectedDecks", index]}
                                            >
                                                {(field) => (
                                                    <DeckSelector
                                                        index={index}
                                                        playersById={
                                                            MOCK_PLAYERS
                                                        }
                                                        decksById={MOCK_DECKS}
                                                        onRemove={removeItem}
                                                        onChange={changeItem}
                                                        value={
                                                            field.input as
                                                                | DeckSelectionIds
                                                                | undefined
                                                        }
                                                        getFormErrors={
                                                            getFormErrors
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        ))}
                                    </div>
                                    {/* Add Player Button */}
                                    <Button
                                        onClick={addEmptyItem}
                                        variant="outline"
                                        disabled={fieldArray.items.length >= 8}
                                    >
                                        + Add Player
                                    </Button>
                                </>
                            )}
                        </FieldArray>
                    </div>
                </div>

                {/* Error alerts - floating above footer */}
                {(newGameForm.errors?.[0] || fieldArrayErrors?.[0]) && (
                    <div className="fixed left-0 right-0 bottom-24 pointer-events-none px-4 flex justify-center">
                        <div className="w-full max-w-screen-xl pointer-events-auto">
                            <Alert variant="destructive">
                                <AlertCircleIcon />
                                <AlertDescription>
                                    {newGameForm.errors?.[0] ||
                                        fieldArrayErrors?.[0]}
                                </AlertDescription>
                            </Alert>
                        </div>
                    </div>
                )}

                {/* Fixed bottom nav - safe area aware */}
                <div className="border-t bg-background/80 backdrop-blur-sm fixed left-0 right-0 bottom-0">
                    <div className="p-4 space-y-2 md:space-y-0 md:flex md:gap-3 max-w-screen-xl mx-auto">
                        <Button
                            className="w-full md:flex-1"
                            size="lg"
                            type="submit"
                        >
                            Start Game
                        </Button>
                    </div>
                    {/* Safe area spacer for iOS notch/home indicator */}
                    <div
                        className="h-safe-bottom"
                        style={{
                            height: "max(0.5rem, env(safe-area-inset-bottom))",
                        }}
                    />
                </div>
            </Form>
        </div>
    );
};
