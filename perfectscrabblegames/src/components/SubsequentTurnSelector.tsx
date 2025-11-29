// Generates an 8-letter word and finds a place for it
import { useState } from 'react';
import { LETTER_POINTS } from '../lib/setup';

interface Props {
	eightLetterWords: string[];
	onCancel?: () => void;
}

export default function SubsequentBingoSelector({
	eightLetterWords,
	onCancel,
}: Props) {
	const [word, setWord] = useState<string>(
		() =>
			eightLetterWords[
				Math.floor(Math.random() * eightLetterWords.length)
			]
	);
	const drawNewWord = () => {
		setWord(
			eightLetterWords[
				Math.floor(Math.random() * eightLetterWords.length)
			]
		);
	};

	return (
		<div className="bg-white rounded-2xl shadow-2xl p-10 mt-12 max-w-5xl mx-auto space-y-10">
			<h2 className="text-5xl font-bold text-green-900 text-center">
				Next Bingo: <span className="text-red-600">{word}</span>
			</h2>

			<div className="flex justify-center gap-4 flex-wrap">
				{word.split('').map((letter, i) => (
					<div
						key={i}
						className="relative w-20 h-20 bg-amber-100 border-4 border-amber-600 rounded-lg shadow-xl 
                 flex items-center justify-center"
					>
						<span className="text-6xl font-bold">{letter}</span>

						{/* Point value – small, dark, bottom-right */}
						<span className="absolute bottom-2 right-2 text-sm font-bold">
							{LETTER_POINTS[letter]}
						</span>
					</div>
				))}
			</div>

			<div className="flex justify-center gap-12">
				<button
					onClick={drawNewWord}
					className="px-12 py-5 bg-orange-600 hover:bg-orange-700 text-white text-3xl font-bold rounded-full shadow-xl 
                     transform hover:scale-105 transition"
				>
					New Word
				</button>

				{onCancel && (
					<button
						onClick={onCancel}
						className="px-12 py-5 bg-gray-600 hover:bg-gray-700 text-white text-3xl font-bold rounded-full shadow-xl"
					>
						Cancel
					</button>
				)}
			</div>
		</div>
	);
}
