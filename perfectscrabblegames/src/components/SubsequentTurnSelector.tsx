import { useState, useEffect, useCallback } from 'react';
import Board from './Board';
import type { Turn } from '../lib/utils';
import { findViablePlays } from '../lib/api/findViablePlays';

interface CandidatePlay extends Turn {
	overlapTile: string;
}

interface Props {
	eightLetterWords: string[];
	turns: Turn[];
	board: string[][];
	setBoard: (b: string[][]) => void;
	setTurns: (t: Turn[]) => void;
	onCancel?: () => void;
}

export default function SubsequentTurnSelector({
	eightLetterWords,
	turns,
	board,
	setBoard,
	setTurns,
	onCancel,
}: Props) {
	const [bingo, setBingo] = useState<string>('');
	const [candidates, setCandidates] = useState<CandidatePlay[]>([]);
	const [currentIndex, setCurrentIndex] = useState<number>(0);

	// Generate a random 8-letter bingo
	const drawNewBingo = useCallback(() => {
		const newWord =
			eightLetterWords[
				Math.floor(Math.random() * eightLetterWords.length)
			];
		setBingo(newWord);
		setCandidates([]);
		setCurrentIndex(0);
	}, [eightLetterWords]);

	// Fetch viable plays
	const findPlays = async () => {
		if (!bingo) return;
		try {
			const response = await findViablePlays(bingo, turns);
			if (!response.viablePlays || response.viablePlays.length === 0) {
				alert('No viable plays found for this bingo.');
				return;
			}
			const mappedCandidates: CandidatePlay[] = response.viablePlays.map((r) => ({
				bingo: r.bingo,
				row: r.row,
				col: r.col,
				direction: r.direction,
				score: 0,
				overlapTile: r.overlapTile,
			}));
			setCandidates(mappedCandidates);
			setCurrentIndex(0);
		} catch (err) {
			console.error(err);
			alert('Failed to find viable plays.');
		}
	};

	// Derived preview board
	const previewBoard = candidates.length
		? (() => {
				const candidate = candidates[currentIndex];
				const newBoard = board.map((r) => [...r]);
				for (let i = 0; i < candidate.bingo.length; i++) {
					const row =
						candidate.direction === 'H'
							? candidate.row
							: candidate.row + i;
					const col =
						candidate.direction === 'H'
							? candidate.col + i
							: candidate.col;
					newBoard[row][col] = candidate.bingo[i];
				}
				return newBoard;
		  })()
		: board;

	// Accept the current candidate
	const acceptCandidate = () => {
		if (candidates.length === 0) return;
		const candidate = candidates[currentIndex];
		setBoard(previewBoard);
		setTurns([...turns, candidate]);
		drawNewBingo();
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
		<div className="bg-white rounded-2xl shadow-2xl p-10 mt-12 max-w-5xl mx-auto space-y-10">
			<h2 className="text-5xl font-bold text-green-900 text-center">
				Next Bingo:{' '}
				<span className="text-red-600 font-extrabold">{bingo}</span>
			</h2>

			{candidates.length > 0 && (
				<div className="text-center space-y-2">
					<p className="text-2xl font-semibold text-gray-700">
						Option {currentIndex + 1} of {candidates.length}
					</p>
					<p className="text-xl text-gray-600">
						Overlaps on tile:{' '}
						<span className="font-bold text-blue-600">
							{candidates[currentIndex].overlapTile}
						</span>{' '}
						at position ({candidates[currentIndex].row},{' '}
						{candidates[currentIndex].col})
					</p>
				</div>
			)}

			<div className="flex justify-center bg-green-900 p-4 rounded-xl shadow-xl">
				<Board board={previewBoard} />
			</div>

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
