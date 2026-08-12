export const Homepage = () => {
    return (
        <div style={{ padding: '2rem' }}>
            <h1>MTG Tracker</h1>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button>Start Game</button>
                <button>Join Game</button>
                <button>Add Deck</button>
            </div>
        </div>
    );
};
