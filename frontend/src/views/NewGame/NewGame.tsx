import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DeckSelector, type DeckSelectionIds } from "@/components/DeckSelector";

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
import { GameSelectionSchema } from "@/schemas";
import { navigate } from "wouter/use-browser-location";
import { usePlayers } from "@/hooks/usePlayers";
import { useDecks } from "@/hooks/useDecks";

export const NewGame = () => {
    const { players } = usePlayers();
    const { decks } = useDecks();
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
                                                        playersById={players}
                                                        decksById={decks}
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
