import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export const Homepage = () => {
    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Main content - scrollable */}
            <div className="flex-1 overflow-y-auto">
                {/* Ladder section */}
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-6">MTG Deck Tracker</h1>
                    <div className="bg-muted rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold mb-4">Ladder</h2>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex justify-between p-3 bg-background rounded">
                                <span>1. Player One</span>
                                <span>1250 pts</span>
                            </div>
                            <div className="flex justify-between p-3 bg-background rounded">
                                <span>2. Player Two</span>
                                <span>1100 pts</span>
                            </div>
                            <div className="flex justify-between p-3 bg-background rounded">
                                <span>3. Player Three</span>
                                <span>950 pts</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed bottom nav - safe area aware */}
            <div className="border-t bg-background/80 backdrop-blur-sm sticky bottom-0">
                <div className="p-4 space-y-2 md:space-y-0 md:flex md:gap-3 max-w-screen-xl mx-auto">
                    <Button className="w-full md:flex-1" size="lg">
                        Start Game
                    </Button>

                    {/* Split button: Join Game (default) + dropdown */}
                    <div className="flex w-full md:flex-1 gap-0">
                        <Button className="flex-1 rounded-r-none" variant="outline" size="lg">
                            Join Game
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="rounded-l-none border-l-0 px-2 w-auto"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>Record Game</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Manage Decks</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                {/* Safe area spacer for iOS notch/home indicator */}
                <div className="h-safe-bottom" style={{ height: 'max(0.5rem, env(safe-area-inset-bottom))' }} />
            </div>
        </div>
    );
};
