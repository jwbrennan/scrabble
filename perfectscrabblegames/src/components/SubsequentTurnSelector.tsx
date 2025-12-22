import { useState, useEffect, useCallback } from 'react';
import type { Turn } from '../lib/utils';
import { findViablePlays } from '../lib/api/findViablePlays';

interface CandidatePlay extends Turn {
	overlapTile: string;
	tileBag: Record<string, number>;
}

interface Props {
	eightLetterWords: string[];
	turns: Turn[];
	board: string[][];
	tileBag: Record<string, number>;
	setBoard: (b: string[][]) => void;
	setTurns: (t: Turn[]) => void;
	onCancel?: () => void;
}

export default function SubsequentTurnSelector({
	eightLetterWords,
	turns,
	board,
	tileBag,
	setBoard,
	setTurns,
	onCancel,
}: Props) {
	const [bingo, setBingo] = useState<string>('');
	const [candidates, setCandidates] = useState<CandidatePlay[]>([]);
	const [currentIndex, setCurrentIndex] = useState<number>(0);
	// Store the original board before previewing
	const [originalBoard, setOriginalBoard] = useState<string[][] | null>(null);

	// Generate a random 8-letter bingo
	const drawNewBingo = useCallback(() => {
		// Restore original board if we were previewing
		if (originalBoard) {
			setBoard(originalBoard);
			setOriginalBoard(null);
		}

		const newWord =
			eightLetterWords[
				Math.floor(Math.random() * eightLetterWords.length)
			];
		setBingo(newWord);
		setCandidates([]);
		setCurrentIndex(0);
	}, [eightLetterWords, originalBoard, setBoard]);

	// Fetch viable plays
	const findPlays = async () => {
		if (!bingo) return;
		try {
			const blanksRemaining = tileBag['?'] || 0;
			const response = await findViablePlays(
				bingo,
				turns,
				tileBag,
				blanksRemaining
			);
			if (!response.viablePlays || response.viablePlays.length === 0) {
				alert('No viable plays found for this bingo.');
				return;
			}
			const mappedCandidates: CandidatePlay[] = response.viablePlays.map(
				(r) => ({
					bingo: r.bingo,
					row: r.row,
					col: r.col,
					direction: r.direction,
					score: 0,
					overlapTile: r.overlapTile,
					tileBag: r.tileBag,
				})
			);
			setCandidates(mappedCandidates);
			setCurrentIndex(0);
		} catch (err) {
			console.error(err);
			alert('Failed to find viable plays.');
		}
	};

	// Update board preview when candidate changes
	useEffect(() => {
		if (candidates.length > 0) {
			// Save original board on first preview
			if (!originalBoard) {
				setOriginalBoard(board.map((r) => [...r]));
			}

			const candidate = candidates[currentIndex];
			const previewBoard = (originalBoard || board).map((r) => [...r]);

			for (let i = 0; i < candidate.bingo.length; i++) {
				const row =
					candidate.direction === 'H'
						? candidate.row
						: candidate.row + i;
				const col =
					candidate.direction === 'H'
						? candidate.col + i
						: candidate.col;
				previewBoard[row][col] = candidate.bingo[i];
			}

			setBoard(previewBoard);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [candidates, currentIndex]);

	// Accept the current candidate
	const acceptCandidate = () => {
		if (candidates.length === 0) return;
		const candidate = candidates[currentIndex];

		// The board is already showing the preview, we want to keep it
		// Add the turn and clear preview state
		setTurns([...turns, candidate]);
		setOriginalBoard(null);

		// Draw new bingo without restoring the board
		const newWord =
			eightLetterWords[
				Math.floor(Math.random() * eightLetterWords.length)
			];
		setBingo(newWord);
		setCandidates([]);
		setCurrentIndex(0);
	};

	// Next candidate
	const nextCandidate = () => {
		if (candidates.length === 0) return;
		setCurrentIndex((prev) => (prev + 1) % candidates.length);
	};

	useEffect(() => {
		if (eightLetterWords.length > 0 && !bingo) {
			drawNewBingo();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="bg-white rounded-2xl shadow-2xl p-10 mt-12 max-w-3xl mx-auto space-y-6">
			<h2 className="text-4xl font-bold text-green-900 text-center">
				Next Bingo:{' '}
				<span className="text-red-600 font-extrabold">{bingo}</span>
			</h2>

			{candidates.length > 0 && (
				<div className="text-center space-y-2 bg-blue-50 p-4 rounded-lg">
					<p className="text-2xl font-semibold text-gray-700">
						Viewing Option {currentIndex + 1} of {candidates.length}
					</p>
					<p className="text-lg text-gray-600">
						Overlaps on tile:{' '}
						<span className="font-bold text-blue-600">
							{candidates[currentIndex].overlapTile}
						</span>{' '}
						at position (Row {candidates[currentIndex].row + 1}, Col{' '}
						{candidates[currentIndex].col + 1})
					</p>
					<p className="text-sm text-gray-500 italic">
						Preview shown on board above
					</p>
				</div>
			)}

			<div className="flex justify-center gap-12">
				{candidates.length > 0 ? (
					<>
						<button
							onClick={nextCandidate}
							className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white text-3xl font-bold rounded-full shadow-xl transform hover:scale-105 transition"
						>
							Next
						</button>
						<button
							onClick={acceptCandidate}
							className="px-12 py-5 bg-green-600 hover:bg-green-700 text-white text-3xl font-bold rounded-full shadow-xl transform hover:scale-105 transition"
						>
							Accept
						</button>
						<button
							onClick={drawNewBingo}
							className="px-12 py-5 bg-orange-600 hover:bg-orange-700 text-white text-3xl font-bold rounded-full shadow-xl transform hover:scale-105 transition"
						>
							New Bingo
						</button>
					</>
				) : (
					<>
						<button
							onClick={findPlays}
							className="px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white text-3xl font-bold rounded-full shadow-xl transform hover:scale-105 transition"
						>
							Find Viable Plays
						</button>
						<button
							onClick={drawNewBingo}
							className="px-12 py-5 bg-orange-600 hover:bg-orange-700 text-white text-3xl font-bold rounded-full shadow-xl transform hover:scale-105 transition"
						>
							New Bingo
						</button>
						{onCancel && (
							<button
								onClick={onCancel}
								className="px-12 py-5 bg-gray-600 hover:bg-gray-700 text-white text-3xl font-bold rounded-full shadow-xl"
							>
								Cancel
							</button>
						)}
					</>
				)}
			</div>
		</div>
	);
}
