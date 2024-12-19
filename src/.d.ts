// In a .d.ts file, e.g., chess-js.d.ts
declare module 'chess.js' {
    // Define the Piece type used by the ChessInstance.get method
    interface Piece {
        type: string; // 'p', 'n', 'b', 'r', 'q', 'k'
        color: 'w' | 'b'; // 'w' for white, 'b' for black
        // Add other properties as needed
    }

    interface ChessInstance {
        get(square: string): Piece | null;
        // Define other methods and properties...
    }

    export function Chess(): ChessInstance;
    // Export other entities as needed
}
