// Styling and structure for the Scrabble board
import clsx from 'clsx';
import { PREMIUM, LETTER_POINTS } from '../lib/gameSetup';

interface Props {
	board: string[][];
	onTileClick?: (row: number, col: number) => void;
	selectedRow?: number | null;
	selectedCol?: number | null;
}

export default function Board({
	board,
	onTileClick,
	selectedRow,
	selectedCol,
}: Props) {
	const getSquareClass = (r: number, c: number) => {
		{
			if (PREMIUM.TW.some((p) => p[0] === r && p[1] === c))
				return 'bg-red-600 text-white text-xs font-bold';
			if (PREMIUM.DW.some((p) => p[0] === r && p[1] === c))
				return 'bg-orange-300';
			if (PREMIUM.TL.some((p) => p[0] === r && p[1] === c))
				return 'bg-blue-600 text-white text-xs font-bold';
			if (PREMIUM.DL.some((p) => p[0] === r && p[1] === c))
				return 'bg-cyan-400';
			if (r === 7 && c === 7) return 'bg-orange-400'; // centre star
			return 'bg-green-700'; // classic dark green board squares
		}
	};

	return (
		<div
			className="grid gap-1 p-4 bg-green-800 rounded overflow-visible"
			style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
		>
			{board.map((row, r) =>
				row.map((letter, c) => {
					return (
						<div
							key={`${r}-${c}`}
							onClick={() => onTileClick?.(r, c)}
							className={clsx(
								'w-10 h-10 flex items-center justify-center rounded-sm font-bold text-lg shadow-md relative transition-all cursor-pointer',
								letter
									? 'bg-amber-100 text-black border-2 border-amber-600 shadow-inner'
									: clsx(
											getSquareClass(r, c),
											'border border-green-900 hover:ring-4 hover:ring-yellow-300 hover:z-10',
											selectedRow === r &&
												selectedCol === c &&
												'ring-4 ring-yellow-300 z-10'
									  )
							)}
						>
							{letter}
							{letter && (
								<span className="absolute text-[8px] bottom-0.5 right-0.5 font-bold text-black opacity-90">
									{LETTER_POINTS[letter]}
								</span>
							)}
							{!letter && r === 7 && c === 7 && (
								<span className="absolute text-yellow-900 text-xl select-none">
									★
								</span>
							)}
						</div>
					);
				})
			)}
		</div>
	);
}
