import { useState, useEffect } from 'react';
import type { Turn } from '../lib/utils';
import {
	findNextViablePlay as findNextViablePlayUtil,
	acceptCandidate as acceptCandidateUtil,
	skipWord as skipWordUtil,
	goToPreviousCandidate as goToPreviousCandidateUtil,
	goToNextCandidate as goToNextCandidateUtil,
	type CandidatePlay,
} from '../lib/candidatePlays';
import CandidatePlayDisplay from './CandidatePlayDisplay';
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
	const [words, setWords] = useState<string[]>(() =>
		[...eightLetterWords].sort(() => Math.random() - 0.5)
	);
	const [currentWordIndex, setCurrentWordIndex] = useState(0);

	const [candidates, setCandidates] = useState<CandidatePlay[]>([]);
	const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
	const [originalBoard, setOriginalBoard] = useState<string[][] | null>(null);
	const [isSearching, setIsSearching] = useState(false);
	const [noMoreFound, setNoMoreFound] = useState(false);

	const findNextViablePlay = async () => {
		console.log(
			'findNextViablePlay called, words.length:',
			words.length,
			'currentWordIndex:',
			currentWordIndex
		);
		setIsSearching(true);
		const result = await findNextViablePlayUtil(
			words,
			currentWordIndex,
			turns
		);
		if (result) {
			setCandidates(result.candidates);
			setCurrentCandidateIndex(0);
			setOriginalBoard(board.map((row) => [...row]));
			setCurrentWordIndex(result.nextIndex);
			setNoMoreFound(false);
		} else {
			setCurrentWordIndex(0); // Reset for next time
			setNoMoreFound(true);
		}
		setIsSearching(false);
	};

	// Reset search when turns change (e.g. after accepting a play)
	useEffect(() => {
		if (turns.length > 0) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setCandidates([]);
			setCurrentCandidateIndex(0);
			setOriginalBoard(null);
			setIsSearching(false);
			setCurrentWordIndex(0);
			setNoMoreFound(false);
		}
	}, [turns.length]);

	// Automatically start searching for next play when ready
	useEffect(() => {
		if (
			candidates.length === 0 &&
			!isSearching &&
			turns.length > 0 &&
			turns.length < 14 &&
			!noMoreFound
		) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			findNextViablePlay();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [candidates.length, isSearching, turns.length, noMoreFound]);

	const acceptCandidate = async (candidate: CandidatePlay) => {
		const result = acceptCandidateUtil(candidate, board, turns, words, eightLetterWords);
		if (!result) {
			alert('Error applying word to board!');
			return;
		}
		setBoard(result.board);
		setTurns(result.turns);
		setWords(result.words);
		// Reset for next search
		setCandidates([]);
		setCurrentCandidateIndex(0);
		setOriginalBoard(null);
		setCurrentWordIndex(0); // Ensure we start from the beginning of the new culled list
	};

	const skipWord = () => {
		const result = skipWordUtil(originalBoard);
		setCandidates(result.candidates);
		setCurrentCandidateIndex(result.currentCandidateIndex);
		if (result.board) setBoard(result.board);
	};

	const goToPreviousCandidate = () => {
		setCurrentCandidateIndex(
			goToPreviousCandidateUtil(currentCandidateIndex)
		);
	};

	const goToNextCandidate = () => {
		setCurrentCandidateIndex(
			goToNextCandidateUtil(currentCandidateIndex, candidates.length)
		);
	};

	// Loading state: searching through words
	if (candidates.length === 0) {
		if (turns.length >= 14) {
			return (
				<div className="text-center py-12">
					<p className="text-2xl text-gray-700 mb-6">
						🎉 Game Complete! 🎉
					</p>
					<p className="text-lg text-gray-500">
						You've successfully played 14 perfect Scrabble turns!
					</p>
					<p className="text-lg text-gray-500 mt-4">
						No more API calls will be made.
					</p>
				</div>
			);
		}
		if (isSearching) {
			return (
				<div className="text-center py-12">
					<p className="text-2xl text-gray-700">
						Searching for viable 8-letter bingo...
					</p>
					<p className="text-lg text-gray-500 mt-4">
						Checking overlaps with existing plays...
					</p>
				</div>
			);
		} else if (noMoreFound) {
			return (
				<div className="text-center py-12">
					<p className="text-2xl text-gray-700 mb-6">
						No more viable 8-letter bingos found for the current
						board state.
					</p>
					{onCancel && (
						<button
							onClick={onCancel}
							className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
						>
							Cancel
						</button>
					)}
				</div>
			);
		} else {
			return (
				<div className="text-center py-12">
					<p className="text-2xl text-gray-700 mb-6">
						Automatically finding the next viable 8-letter bingo
					</p>
					<p className="text-lg text-gray-500">
						This may take a moment as we check multiple words...
					</p>
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
