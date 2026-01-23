import { useState, useCallback } from 'react';
import sevenletterbingos from './assets/SevenLetterBingos.txt?raw';
import eightletterbingos from './assets/EightLetterBingos.txt?raw';
import Board from './components/Board';
import OpeningBingoSelector from './components/OpeningBingoSelector';
import SubsequentTurnSelector from './components/SubsequentTurnSelector';
import ResetBoard from './components/ResetBoard';
import { BOARD_SIZE, INITIAL_TILEBAG } from './lib/gameSetup';
import { styleWithBlanks } from './lib/styleWithBlanks';
import { updateTileBag } from './lib/api/updateTileBag';
import { scoreTurn } from './lib/api/scoreTurn';
import { getTilesString } from './lib/utils';
import type { Turn } from './lib/utils';

const SEVENS = sevenletterbingos
	.trim()
	.split('\n')
	.map((w) => w.trim().toUpperCase())
	.filter((w) => w.length === 7);

const EIGHTS = eightletterbingos
	.trim()
	.split('\n')
	.map((w) => w.trim().toUpperCase())
	.filter((w) => w.length === 8);

export default function App() {
	const [board, setBoard] = useState<string[][]>(
		Array(BOARD_SIZE)
			.fill(null)
			.map(() => Array(BOARD_SIZE).fill('')),
	);

	const [tileBag, setTileBag] =
		useState<Record<string, number>>(INITIAL_TILEBAG);

	const [isPlacingOpening, setIsPlacingOpening] = useState(false);
	const [isFirstTurnDone, setIsFirstTurnDone] = useState(false);
	const [startSquareHandler, setStartSquareHandler] = useState<
		((r: number, c: number) => void) | null
	>(null);
	const [selectedRow, setSelectedRow] = useState<number | null>(null);
	const [selectedCol, setSelectedCol] = useState<number | null>(null);

	const handleStartSquareSelected = useCallback(
		(handler: (r: number, c: number) => void): (() => void) => {
			setStartSquareHandler(() => handler);
			return () => {
				setStartSquareHandler(null);
			};
		},
		[],
	);

	const handleSquareSelected = useCallback(
		(r: number | null, c: number | null) => {
			setSelectedRow(r);
			setSelectedCol(c);
		},
		[],
	);

	const handleBoardClick = (r: number, c: number) => {
		startSquareHandler?.(r, c);
	};

	const [turns, setTurns] = useState<Turn[]>([]);
	const [showHowItWorks, setShowHowItWorks] = useState(false);

	return (
		<div className="min-h-screen bg-gray-50 py-4 px-4">
			<div className="bg-white p-4 rounded-lg shadow-2xl mx-auto text-center">
				<div className="flex justify-center gap-8 items-start w-full">
					<div className="flex flex-col items-center">
						<div className="bg-green-900 p-2 rounded-lg shadow-2xl max-w-xl">
							<Board
								board={board}
								onTileClick={handleBoardClick}
								selectedRow={selectedRow}
								selectedCol={selectedCol}
							/>
						</div>
						<div
							className={`mt-2 flex items-center justify-between h-[16rem] relative ${isFirstTurnDone || isPlacingOpening ? 'w-[44rem]' : 'w-[30rem]'}`}
						>
							<div className="flex flex-col items-center">
								{isFirstTurnDone ?
									<SubsequentTurnSelector
										eightLetterWords={EIGHTS}
										turns={turns}
										board={board}
										setBoard={setBoard}
										setTurns={setTurns}
									/>
								:	<>
										{!isPlacingOpening ?
											<button
												onClick={() =>
													setIsPlacingOpening(true)
												}
												className="px-12 py-4 bg-red-600 hover:bg-red-700 text-white text-2xl font-bold rounded-full shadow-xl transform hover:scale-105 transition"
											>
												Random Opening
												<br />
												Bingo
											</button>
										:	<OpeningBingoSelector
												sevenLetterWords={SEVENS}
												onPlace={async (
													newBoard,
													bingo,
													row,
													col,
													direction,
												) => {
													try {
														const openingBingoTileBagResult =
															await updateTileBag(
																bingo,
																tileBag,
																0, // Force blanksRemaining to 0 for opening turn
															);
														const styleWithBlanksResult =
															styleWithBlanks(
																newBoard,
																bingo,
																row,
																col,
																direction,
																openingBingoTileBagResult.blanks,
															);
														if (
															!styleWithBlanksResult
														) {
															alert(
																'Error in blank styling!',
															);
															return;
														}
														setTileBag(
															openingBingoTileBagResult.tileBag,
														);
														setBoard(
															styleWithBlanksResult.board,
														);
														const newTurn = {
															id:
																turns.length +
																1,
															bingo,
															row,
															col,
															direction,
															blanks: styleWithBlanksResult.blanks,
															tileBag:
																openingBingoTileBagResult.tileBag,
															tilesLeft:
																Object.values(
																	openingBingoTileBagResult.tileBag,
																).reduce(
																	(a, b) =>
																		a + b,
																	0,
																),
															score: 0,
															overlap: null,
														};
														// Score the opening turn
														try {
															const scoreResponse =
																await scoreTurn(
																	JSON.stringify(
																		newTurn,
																	),
																);
															if (
																scoreResponse.success &&
																scoreResponse.score !==
																	undefined
															) {
																newTurn.score =
																	scoreResponse.score;
															} else {
																console.error(
																	'Failed to score opening turn:',
																	scoreResponse.error,
																);
															}
														} catch (err) {
															console.error(
																'Error scoring opening turn:',
																err,
															);
														}
														const newTurns = [
															...turns,
															newTurn,
														];
														setTurns(newTurns);
														console.log(
															JSON.stringify(
																newTurns,
															),
														);
													} catch (err) {
														console.error(err);
														if (
															err instanceof
																Error &&
															err.message ===
																'CANNOT-FORM-WORD'
														) {
															alert(
																'This word requires a blank tile. Please choose a new bingo.',
															);
														} else {
															alert(
																'API Failure!',
															);
														}
														return;
													}
													setIsPlacingOpening(false);
													setIsFirstTurnDone(true);
													setSelectedRow(null);
													setSelectedCol(null);
												}}
												onSquareSelected={
													handleSquareSelected
												}
												onStartSquareSelected={
													handleStartSquareSelected
												}
											/>
										}
									</>
								}
							</div>

							<ResetBoard
								onClear={() => {
									setBoard(
										Array(BOARD_SIZE)
											.fill(null)
											.map(() =>
												Array(BOARD_SIZE).fill(''),
											),
									);
									setTurns([]);
									setTileBag(INITIAL_TILEBAG);
									setIsPlacingOpening(false);
									setIsFirstTurnDone(false);
									setSelectedRow(null);
									setSelectedCol(null);
									console.clear();
								}}
							/>
						</div>
						<div className="mt-4 relative">
							<button
								onMouseEnter={() => setShowHowItWorks(true)}
								onMouseLeave={() => setShowHowItWorks(false)}
								className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded shadow-lg"
							>
								How it Works
							</button>
							{showHowItWorks && (
								<div className="absolute bottom-full mb-2 left-0 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
									<p className="text-sm text-gray-700">
										A Perfect Scrabble Game is one in which
										every turn is a bingo! Assuming perfect
										word knowledge and very lucky tiles, two
										players can have seven bingos each!
										Start with a random seven-letter opening
										bingo, then take turns with eight-letter
										words that overlap with exactly one
										existing tile. One blank is allowed on
										turn 13 and 14 only. The game uses a
										Wolfram Language back-end API to find
										viable plays and calculate scores. Have
										fun!
									</p>
								</div>
							)}
						</div>
						<footer className="mt-8 text-gray-600 text-sm">
							Perfect Scrabble Games • Joseph Brennan 2026
						</footer>
					</div>
					<div className="w-96 bg-white rounded-xl shadow-xl p-2 text-left">
						<h2 className="text-xl font-bold mb-4 text-green-900">
							Scoreboard
						</h2>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<h3 className="text-lg font-bold mb-2 text-green-900">
									Player A
								</h3>
								{(
									turns.filter((m) => m.id % 2 === 1)
										.length === 0
								) ?
									<p className="text-gray-500">No Turns</p>
								:	<ul className="space-y-1">
										{turns
											.filter((m) => m.id % 2 === 1)
											.map((m, i) => {
												return (
													<li
														key={i}
														className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded"
													>
														<div>{m.bingo}</div>
														<div>
															Row: {m.row + 1},
															Col:{' '}
															{String.fromCharCode(
																65 + m.col,
															)}
														</div>
														<div>
															Dir: {m.direction}
														</div>
														{m.blanks && (
															<div>
																Blanks:{' '}
																{m.blanks.tile}
															</div>
														)}
														<div>
															Score: {m.score}
														</div>
													</li>
												);
											})}
									</ul>
								}
								<div className="mt-4 text-lg font-bold text-green-900">
									Total:{' '}
									{turns
										.filter((m) => m.id % 2 === 1)
										.reduce((sum, m) => sum + m.score, 0)}
								</div>
							</div>
							<div>
								<h3 className="text-lg font-bold mb-2 text-green-900">
									Player B
								</h3>
								{(
									turns.filter((m) => m.id % 2 === 0)
										.length === 0
								) ?
									<p className="text-gray-500">No Turns</p>
								:	<ul className="space-y-1">
										{turns
											.filter((m) => m.id % 2 === 0)
											.map((m, i) => {
												return (
													<li
														key={i}
														className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded"
													>
														<div>{m.bingo}</div>
														<div>
															Row: {m.row + 1},
															Col:{' '}
															{String.fromCharCode(
																65 + m.col,
															)}
														</div>
														<div>
															Dir: {m.direction}
														</div>
														{m.blanks && (
															<div>
																Blanks:{' '}
																{m.blanks.tile}
															</div>
														)}
														<div>
															Score: {m.score}
														</div>
													</li>
												);
											})}
									</ul>
								}
								<div className="mt-4 text-lg font-bold text-green-900">
									Total:{' '}
									{turns
										.filter((m) => m.id % 2 === 0)
										.reduce((sum, m) => sum + m.score, 0)}
								</div>
							</div>
						</div>
						<div className="mt-4 text-left">
							<p className="text-lg font-semibold break-words">
								Tile Bag:{' '}
								<span className="font-mono">
									{getTilesString(
										turns.length > 0 ?
											turns[turns.length - 1].tileBag
										:	tileBag,
									)}
								</span>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
