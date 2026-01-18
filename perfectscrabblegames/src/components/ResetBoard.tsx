// A button component to clear the Scrabble board
interface Props {
	onClear: () => void;
}

export default function ResetBoard({ onClear }: Props) {
	return (
		<button
			onClick={onClear}
			className="px-4 py-4 bg-gray-700 hover:bg-gray-800 text-white text-2xl font-bold rounded-full shadow-2xl transition"
		>
			Reset Board
		</button>
	);
}
