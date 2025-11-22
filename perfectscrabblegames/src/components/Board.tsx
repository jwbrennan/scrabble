import clsx from 'clsx';
import { PREMIUM, LETTER_POINTS } from '../lib/tiles';

interface Props {
	board: string[][];
	onTileClick?: (row: number, col: number) => void;
}

export default function Board({ board, onTileClick }: Props) {
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
			className="grid gap-1 p-4 bg-green-800 rounded"
			style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}
		>
			{board.map((row, r) =>
				row.map((letter, c) => {
					return (
						<div
							key={`${r}-${c}`}
							onClick={() => onTileClick?.(r, c)}
							className={clsx(
								'w-10 h-10 md:w-16 md:h-16 flex items-center justify-center rounded-sm font-bold text-3xl md:text-5xl shadow-md relative transition-all cursor-pointer',
								letter
									? 'bg-amber-100 text-black border-2 border-amber-600 shadow-inner'
									: clsx(
											getSquareClass(r, c),
											'border border-green-900 hover:ring-4 hover:ring-yellow-300'
									  )
							)}
						>
							{letter}
							{letter && (
								<span className="absolute text-[12px] md:text-s bottom-1 right-1 font-bold text-black opacity-90">
									{LETTER_POINTS[letter]}
								</span>
							)}
							{!letter && r === 7 && c === 7 && (
								<span className="absolute text-yellow-900 text-2xl md:text-4xl select-none">
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
