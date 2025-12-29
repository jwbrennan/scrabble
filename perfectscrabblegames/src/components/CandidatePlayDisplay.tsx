import { useEffect } from 'react';
import type { Turn } from '../lib/utils';
import { styleWithBlanks } from '../lib/styleWithBlanks';
import { LETTER_POINTS } from '../lib/setup';

export interface CandidatePlay extends Turn {
	overlapTile: string;
}

interface Props {
	candidates: CandidatePlay[];
	currentCandidateIndex: number;
	setBoard: (b: string[][]) => void;
	originalBoard: string[][] | null;
	onAccept: (candidate: CandidatePlay) => void;
	onSkip: () => void;
	onPrevious: () => void;
	onNext: () => void;
	onCancel?: () => void;
}

export default function CandidatePlayDisplay({
	candidates,
	currentCandidateIndex,
	setBoard,
	originalBoard,
	onAccept,
	onSkip,
	onPrevious,
	onNext,
	onCancel,
}: Props) {
	// Preview current candidate on board
	useEffect(() => {
		if (!originalBoard || candidates.length === 0) return;

		const candidate = candidates[currentCandidateIndex];
		const styledResult = styleWithBlanks(
			originalBoard,
			candidate.bingo,
			candidate.row,
			candidate.col,
			candidate.direction,
			candidate.blanks
		);

		if (styledResult) {
			setBoard(styledResult.board);
		}
	}, [currentCandidateIndex, candidates, originalBoard, setBoard]);

	if (candidates.length === 0) return null;

	const currentCandidate = candidates[currentCandidateIndex];

	return (
		<div className="bg-white rounded-2xl shadow-2xl p-8 mt-12 max-w-4xl mx-auto space-y-8">
			<div className="text-center space-y-4">
				<h2 className="text-3xl font-bold text-gray-800">
					{currentCandidate.bingo}
				</h2>
				<div className="flex justify-center gap-5 flex-wrap">
					{currentCandidate.bingo.split('').map((l, i) => (
						<div
							key={i}
							className="relative w-16 h-16 bg-amber-100 border-2 border-amber-600 rounded-lg shadow-xl flex items-center justify-center"
						>
							<span className="text-2xl font-bold">{l}</span>
							<span className="absolute bottom-1 right-1 text-xs font-bold">
								{LETTER_POINTS[l] || 0}
							</span>
						</div>
					))}
				</div>

				<div className="text-center space-y-2 bg-blue-50 p-6 rounded-lg">
					<p className="text-2xl font-semibold text-gray-700">
						Option {currentCandidateIndex + 1} of{' '}
						{candidates.length}
					</p>
					<p className="text-lg text-gray-600">
						Overlaps on:{' '}
						<span className="font-bold">
							{currentCandidate.overlapTile}
						</span>
					</p>
					{currentCandidate.blanks.length > 0 && (
						<p className="text-md text-amber-700">
							Uses {currentCandidate.blanks.length} blank(s) as:{' '}
							{currentCandidate.blanks.join(', ')}
						</p>
					)}
				</div>
			</div>

			<div className="flex justify-center gap-6 flex-wrap">
				<button
					onClick={onPrevious}
					disabled={currentCandidateIndex === 0}
					className="px-6 py-3 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Previous
				</button>

				<button
					onClick={() => onAccept(currentCandidate)}
					className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-lg"
				>
					Accept This Play
				</button>

				<button
					onClick={onSkip}
					className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg"
				>
					Skip This Word
				</button>

				<button
					onClick={onNext}
					disabled={currentCandidateIndex === candidates.length - 1}
					className="px-6 py-3 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Next
				</button>
			</div>

			{onCancel && (
				<div className="text-center">
					<button
						onClick={onCancel}
						className="text-gray-500 hover:text-gray-700 underline"
					>
						Cancel
					</button>
				</div>
			)}
		</div>
	);
}
