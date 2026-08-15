import { Button } from "@/components/ui/button";
import {
    DeckSelector,
    type DeckSelectorValue,
    type Player,
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

const PlayerDeckSchema = v.object({
    players: v.pipe(
        v.array(
            v.object({
                playerName: v.pipe(v.string(), v.nonEmpty("Select a player")),
                deckName: v.pipe(v.string(), v.nonEmpty("Select a deck")),
            }),
        ),
        v.maxLength(8),
        v.minLength(2, "Minumum 2 players required"),
    ),
});

const MOCK_PLAYERS: Player[] = [
    { name: "Alice", decks: ["Mono Red Aggro", "Golgari Midrange"] },
    { name: "Bob", decks: ["Azorius Control"] },
    { name: "Charlie", decks: ["Gruul Stompy", "Boros Aggro", "Simic Ramp"] },
    { name: "Dana", decks: ["Dimir Mill", "Selesnya Tokens"] },
    { name: "Liam", decks: [] },
];

export const CreateGame = () => {
    const newGameForm = useForm({ schema: PlayerDeckSchema });

    const removeItem = (index: number) =>
        remove(newGameForm, { path: ["players"], at: index });

    const changeItem = (index: number, value: DeckSelectorValue) => {
        replace(newGameForm, {
            path: ["players"],
            at: index,
            initialInput: value,
        });
    };

    const addSelection = () =>
        insert(newGameForm, {
            path: ["players"],
            initialInput: { playerName: undefined, deckName: undefined },
        });

    const handleSubmit = (values: v.InferOutput<typeof PlayerDeckSchema>) =>
        console.log(values);

    return (
        <div className="flex flex-col h-screen bg-background">
            <Form of={newGameForm} onSubmit={handleSubmit}>
                {/* Main content - scrollable */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 max-w-screen-xl mx-auto">
                        <h1 className="text-3xl font-bold mb-8">Create Game</h1>

                        {/* Player/Deck Selectors */}
                        <FieldArray of={newGameForm} path={["players"]}>
                            {(fieldArray) => (
                                <>
                                    <div className="space-y-4 mb-6">
                                        {fieldArray.items.map((item, index) => (
                                            <Field
                                                key={item}
                                                of={newGameForm}
                                                path={["players", index]}
                                            >
                                                {(field) => (
                                                    <DeckSelector
                                                        index={index}
                                                        players={MOCK_PLAYERS}
                                                        onRemove={removeItem}
                                                        onChange={changeItem}
                                                        value={field.input}
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
