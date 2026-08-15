import { Button } from "@/components/ui/button";
import {
    DeckSelector,
    type Deck,
    type Player,
    type DeckSelection,
} from "@/components/DeckSelector";

import {
    Field,
    FieldArray,
    Form,
    insert,
    remove,
    replace,
    useForm,
} from "@formisch/react";
import * as v from "valibot";

const GameSelectionSchema = v.object({
    selectedDecks: v.pipe(
        v.array(
            v.object({
                player: v.object({
                    id: v.pipe(v.string(), v.nonEmpty()),
                    name: v.pipe(v.string(), v.nonEmpty()),
                }),
                deck: v.optional(
                    v.object({
                        id: v.pipe(v.string(), v.nonEmpty()),
                        name: v.pipe(v.string(), v.nonEmpty()),
                        player: v.pipe(v.string(), v.nonEmpty()),
                    }),
                ),
            }),
        ),
        v.maxLength(8),
        v.minLength(2, "Minumum 2 players required"),
    ),
});

const MOCK_PLAYERS: Player[] = [
    { id: "a1", name: "Alice" },
    { id: "b2", name: "Bob" },
    { id: "c3", name: "Charlie" },
    { id: "d4", name: "Dana" },
    { id: "l5", name: "Liam" },
];

const MOCK_DECKS: Deck[] = [
    { id: "d-a1-1", name: "Mono Red Aggro", player: "a1" },
    { id: "d-a1-2", name: "Golgari Midrange", player: "a1" },
    { id: "d-b2-1", name: "Azorius Control", player: "b2" },
    { id: "d-c3-1", name: "Gruul Stompy", player: "c3" },
    { id: "d-c3-2", name: "Boros Aggro", player: "c3" },
    { id: "d-c3-3", name: "Simic Ramp", player: "c3" },
    { id: "d-d4-1", name: "Dimir Mill", player: "d4" },
    { id: "d-d4-2", name: "Selesnya Tokens", player: "d4" },
];

export const NewGame = () => {
    const newGameForm = useForm({ schema: GameSelectionSchema });

    const removeItem = (index: number) =>
        remove(newGameForm, { path: ["selectedDecks"], at: index });

    const changeItem = (index: number, selection: DeckSelection) => {
        replace(newGameForm, {
            path: ["selectedDecks"],
            at: index,
            initialInput: selection,
        });
    };

    const addSelection = () =>
        insert(newGameForm, {
            path: ["selectedDecks"],
        });

    const handleSubmit = (values: v.InferOutput<typeof GameSelectionSchema>) =>
        console.log(values);

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
                                                        players={MOCK_PLAYERS}
                                                        decks={MOCK_DECKS}
                                                        onRemove={removeItem}
                                                        onChange={changeItem}
                                                        value={field.input as DeckSelection | undefined}
                                                    />
                                                )}
                                            </Field>
                                        ))}
                                    </div>
                                    {/* Add Player Button */}
                                    <Button
                                        onClick={addSelection}
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
