import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Chess } from 'chess.js';
import 'react-toastify/dist/ReactToastify.css'; // Ensure this import is needed for styles only, or remove it if not used.

const chess = new Chess();

interface Piece {
  color: 'w' | 'b';
  type: string;
  position?: string;
}

interface DragItem {
  id: string;
  piece: Piece;
  type: string;
}

const Square = ({ piece, position, handleMove }: { piece: Piece | null, position: string, handleMove: (from: string, to: string) => void }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'piece',
    item: { id: position, piece } as DragItem,
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item: DragItem, monitor) => {
      const dropResult = monitor.getDropResult() as { id?: string } | null;
      if (item && dropResult && dropResult.id && item.id !== dropResult.id) {
        handleMove(item.id, dropResult.id);
      }
    }
  }, [piece, position]);

  const [, drop] = useDrop({
    accept: 'piece',
    drop: () => ({ id: position }),
  });

  return (
    <div ref={drop} style={{
      width: '80px',
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: ((parseInt(position[1], 10) + position.charCodeAt(0)) % 2) ? '#b58863' : '#f0d9b5',
      opacity: isDragging ? 0.5 : 1,
    }}>
      {piece && <div ref={drag} style={{ cursor: 'move' }}>
        {piece.type.toUpperCase() + (piece.color === 'w' ? '♕' : '♛')}
      </div>}
    </div>
  );
};

const ChessBoardComponent: React.FC = () => {
  const [board, setBoard] = useState<any[]>(chess.board());
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    setBoard(chess.board());
  }, []);

  const handleMove = (from: string, to: string) => {
    // Check if the piece exists at the 'from' location
    const piece = chess.get(from as any);  // Using 'any' to bypass type checking temporarily
    if (!piece) {
      console.error(`No piece at position ${from}`);
      setStatus(`Invalid move: No piece at starting position ${from}.`);
      return;
    }
  
    // Construct the move object, possibly including promotion
    const isPromotion = piece.type === 'p' &&
                        ((piece.color === 'w' && to.charAt(1) === '8') ||
                         (piece.color === 'b' && to.charAt(1) === '1'));
    const move = {
      from,
      to,
      promotion: isPromotion ? 'q' : undefined  // Assume queen promotion for simplicity
    };
  
    // Check if the move is legal before making it
    if (!chess.moves({ verbose: true }).some(m => m.from === move.from && m.to === move.to && m.promotion === move.promotion)) {
      setStatus(`Invalid move from ${from} to ${to}. Please try again.`);
      return;
    }
  
    // Try to execute the move
    try {
      const result = chess.move(move);
      if (result) {
        setBoard(chess.board());
        setStatus("");
        checkGameStatus();
      } else {
        throw new Error(`Failed to move from ${from} to ${to}`);
      }
    } catch (error) {
      console.error('Error executing move:', error);
      setStatus('Error during move. Please try again.');
      setBoard(chess.board()); // Refresh board state to previous valid state
    }
  };
  
  
  const checkGameStatus = () => {
    if (chess.isCheckmate()) {
      setStatus("Checkmate - Game over.");
    } else if (chess.isCheck()) {
      setStatus("You are in check.");
    } else if (chess.isStalemate()) {
      setStatus("Stalemate - Game over.");
    } else if (chess.isDraw()) {
      let message = "Draw - ";
      if (chess.isStalemate()) {
        message += "Stalemate";
      } else if (chess.isInsufficientMaterial()) {
        message += "Insufficient material";
      } else if (chess.isThreefoldRepetition()) {
        message += "Threefold repetition";
      } else if (chess.isDraw()) { // This is the updated line
        // Now check specifically for the fifty-move rule within the draw condition
        const history = chess.history({ verbose: true });
        if (history.length >= 100) {
          const lastMove = history[history.length - 1];
          if (lastMove && lastMove.flags.includes('j')) { // Check for fifty-move rule flag
            message += "Fifty-move rule";
          }
        }
      }
      setStatus(message + " - No more legal moves available.");
    }
  };
  

  const resetGame = () => {
    chess.reset();
    setBoard(chess.board());
    setStatus("");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 80px)', gap: '1px' }}>
        {board.map((row, rowIndex) => row.map((piece: { color: any; type: any; }, colIndex: number) => {
          const position = `${String.fromCharCode('a'.charCodeAt(0) + colIndex)}${8 - rowIndex}`;
          const pieceData = piece ? { color: piece.color, type: piece.type, position } : null;
          return <Square key={position} piece={pieceData} position={position} handleMove={handleMove} />;
        }))}
      </div>
      {status && <p style={{ color: 'red', fontWeight: 'bold' }}>{status}</p>}
      <button onClick={resetGame} style={{ marginTop: '20px' }}>Reset Game</button>
    </DndProvider>
  );
};

export default ChessBoardComponent;
