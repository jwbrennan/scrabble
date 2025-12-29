import { useState, useEffect } from 'react';
import type { Turn } from '../lib/utils';
import { findViablePlays } from '../lib/api/findViablePlays';
import { styleWithBlanks } from '../lib/styleWithBlanks';
import CandidatePlayDisplay, {
	type CandidatePlay,
} from './CandidatePlayDisplay';
interface Props {
	eightLetterWords: string[];
	turns: Turn[];
	board: string[][];
	setBoard: (b: string[][]) => void;
	setTurns: React.Dispatch<React.SetStateAction<Turn[]>>;
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
	const [shuffledWords] = useState<string[]>(() =>
		[...eightLetterWords].sort(() => Math.random() - 0.5)
	);

	const [candidates, setCandidates] = useState<CandidatePlay[]>([]);
	const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
	const [originalBoard, setOriginalBoard] = useState<string[][] | null>(null);
	const [isSearching, setIsSearching] = useState(false);
	const [currentCheckingWord, setCurrentCheckingWord] = useState<string>('');

	const findNextViablePlay = async () => {
		setIsSearching(true);
		const randomIndex = Math.floor(Math.random() * shuffledWords.length);
		const word = shuffledWords[randomIndex];
		setCurrentCheckingWord(word);

		try {
			const response = await findViablePlays(word, turns);
			if (response.viablePlays && response.viablePlays.length > 0) {
				const mapped: CandidatePlay[] = response.viablePlays.map(
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(p: any) => ({
						id: turns.length + 1,
						bingo: p.bingo,
						row: p.row,
						col: p.col,
						direction: p.direction,
						blanks: p.blanks || [],
						overlapTile: p.overlapTile,
						tileBag: p.tileBag,
						tilesLeft: p.tilesLeft,
						score: 0,
					})
				);
				setCandidates(mapped);
				setCurrentCandidateIndex(0);
				setOriginalBoard(board.map((row) => [...row]));
				setIsSearching(false);
				setCurrentCheckingWord('');
			} else {
				// No plays, just reset
				setIsSearching(false);
				setCurrentCheckingWord('');
			}
		} catch (err) {
			console.error('Error finding viable plays:', err);
			setIsSearching(false);
			setCurrentCheckingWord('');
		}
	};

	// Reset search when turns change (e.g. after accepting a play)
	useEffect(() => {
		if (turns.length > 0) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setCandidates([]);
			setCurrentCandidateIndex(0);
			setOriginalBoard(null);
			setIsSearching(false);
			setCurrentCheckingWord('');
		}
	}, [turns.length]);

	const acceptCandidate = async (candidate: CandidatePlay) => {
		try {
			const styledResult = styleWithBlanks(
				board,
				candidate.bingo,
				candidate.row,
				candidate.col,
				candidate.direction,
				candidate.blanks
			);

			if (!styledResult) {
				alert('Error applying word to board!');
				return;
			}

			setBoard(styledResult.board);

			setTurns((prev) => [
				...prev,
				{
					id: prev.length + 1,
					bingo: candidate.bingo,
					row: candidate.row,
					col: candidate.col,
					direction: candidate.direction,
					score: 0,
					blanks: styledResult.blanks,
					tileBag: candidate.tileBag,
					tilesLeft: candidate.tilesLeft,
				},
			]);

			// Reset for next search
			setCandidates([]);
			setCurrentCandidateIndex(0);
			setOriginalBoard(null);
		} catch (err) {
			console.error(err);
			alert('Failed to accept play');
		}
	};

	const skipWord = () => {
		setCandidates([]);
		setCurrentCandidateIndex(0);
		setOriginalBoard(null);
		if (originalBoard) setBoard(originalBoard);
	};

	const goToPreviousCandidate = () => {
		setCurrentCandidateIndex((i) => Math.max(0, i - 1));
	};

	const goToNextCandidate = () => {
		setCurrentCandidateIndex((i) => Math.min(candidates.length - 1, i + 1));
	};

	// Loading state: searching through words
	if (candidates.length === 0) {
		if (isSearching) {
			return (
				<div className="text-center py-12">
					<p className="text-2xl text-gray-700">
						Searching for viable 8-letter bingo using{' '}
						<span className="font-bold text-amber-600">
							{currentCheckingWord}
						</span>
						...
					</p>
					<p className="text-lg text-gray-500 mt-4">
						Checking overlaps with existing plays...
					</p>
				</div>
			);
		} else {
			return (
				<div className="text-center py-12">
					<p className="text-2xl text-gray-700 mb-6">
						Ready to find the next viable 8-letter bingo
					</p>
					<button
						onClick={findNextViablePlay}
						className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-lg"
					>
						Find Next Viable Play
					</button>
				</div>
			);
		}
	}

	return (
		<CandidatePlayDisplay
			candidates={candidates}
			currentCandidateIndex={currentCandidateIndex}
			setBoard={setBoard}
			originalBoard={originalBoard}
			onAccept={acceptCandidate}
			onSkip={skipWord}
			onPrevious={goToPreviousCandidate}
			onNext={goToNextCandidate}
			onCancel={onCancel}
		/>
	);
}
