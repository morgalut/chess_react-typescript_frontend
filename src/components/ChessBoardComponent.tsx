import React, { useEffect, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Chess } from 'chess.js';
import 'react-toastify/dist/ReactToastify.css';

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

interface PromotionState {
  isPromoting: boolean;
  from: string;
  to: string;
  color: 'w' | 'b';
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

const PromotionDialog: React.FC<{
  promotion: PromotionState;
  onComplete: (from: string, to: string, piece: 'q' | 'r' | 'b' | 'n') => void;
}> = ({ promotion, onComplete }) => {
  const pieces: ('q' | 'r' | 'b' | 'n')[] = ['q', 'r', 'b', 'n'];
  return (
    <div className="promotion-dialog">
      <h3>Choose piece for promotion:</h3>
      {pieces.map(piece => (
        <button key={piece} onClick={() => onComplete(promotion.from, promotion.to, piece)}>
          {piece.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

const ChessBoardComponent: React.FC = () => {
  const [board, setBoard] = useState<any[]>(chess.board());
  const [status, setStatus] = useState<string>("");
  const [promotion, setPromotion] = useState<PromotionState | null>(null);

  useEffect(() => {
    setBoard(chess.board());
  }, []);

  const handleMove = (from: string, to: string) => {
const piece = chess.get(from as any);  // Using 'any' to override TypeScript's type system temporarily
    if (!piece) {
      console.error(`No piece at position ${from}`);
      setStatus(`Invalid move: No piece at starting position ${from}.`);
      return;
    }

    const isPromotion = piece.type === 'p' &&
                        ((piece.color === 'w' && to.charAt(1) === '8') ||
                         (piece.color === 'b' && to.charAt(1) === '1'));

    if (isPromotion) {
      setPromotion({ isPromoting: true, from, to, color: piece.color });
    } else {
      performMove(from, to);
    }
  };

  const performMove = (from: string, to: string, promotionPiece: 'q' | 'r' | 'b' | 'n' | null = null) => {
    interface MoveOptions {
        from: string;
        to: string;
        promotion?: 'q' | 'r' | 'b' | 'n';  // Optional promotion property
    }

    try {
        const moveOptions: MoveOptions = { from, to };
        if (promotionPiece) {
            moveOptions.promotion = promotionPiece; // Add promotion piece to the move options if present
        }
        const result = chess.move(moveOptions);
        if (result) {
            updateGameState();
        } else {
            console.error(`Failed to move from ${from} to ${to}`);
            setStatus(`Invalid move from ${from} to ${to}. Please try again.`);
        }
    } catch (error) {
        console.error(error);
        setStatus(`Invalid move: ${error instanceof Error ? error.message : String(error)}`);
    }
    setBoard(chess.board()); // Refresh board state regardless of move validity
};

  
  const updateGameState = () => {
    setBoard(chess.board());
    setStatus("");
    checkGameStatus();
    if (promotion) {
      setPromotion(null);
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
      } else if (chess.isThreefoldRepetition()) {  // Corrected function name
        message += "Threefold repetition";
      } else if (chess.isDraw()) {
        const history = chess.history({ verbose: true });
        if (history.length >= 100) {
          const lastMove = history[history.length - 1];
          if (lastMove && lastMove.flags.includes('j')) {
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
      {promotion && 
        <PromotionDialog promotion={promotion} onComplete={(from, to, piece) => {
          performMove(from, to, piece);
        }} />
      }
    </DndProvider>
  );
};

export default ChessBoardComponent;
