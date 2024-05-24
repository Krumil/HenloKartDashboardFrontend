"use client";

import Image from "next/image";
import clsx from "clsx";
import CopyIcon from "../public/icons/copy.svg";

import { AnimatedCounter } from "react-animated-counter";
import { useEffect, useState } from "react";

interface RaceResult {
	race_id: number;
	winning_token_id: string;
	winner_address: string;
}

interface Winner {
	id: string;
	address: string;
	count: number;
	position: number;
}

const ITEMS_PER_PAGE = 10;

export default function Home() {
	const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
	const [winners, setWinners] = useState<Winner[]>([]);
	const [filteredWinners, setFilteredWinners] = useState<Winner[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalRaces, setTotalRaces] = useState(0);

	useEffect(() => {
		const ws = new WebSocket("ws://localhost:8000/ws");

		ws.onopen = () => {
			console.log("WebSocket connection opened");
		};

		ws.onmessage = event => {
			try {
				const data = JSON.parse(event.data);
				const newResults: RaceResult[] = data.data;
				setRaceResults(prevResults => [...prevResults, ...newResults]);
				setTotalRaces(prevTotalRaces => prevTotalRaces + newResults.length);
			} catch (error) {
				console.error("Error parsing WebSocket message:", error);
			}
		};

		ws.onerror = error => {
			console.error("WebSocket error:", error);
		};

		ws.onclose = event => {
			console.log("WebSocket connection closed:", event);
		};

		return () => {
			ws.close();
		};
	}, []);

	useEffect(() => {
		const raceCount: Record<string, { address: string; count: number }> = {};
		raceResults.forEach(result => {
			const id = result.winning_token_id;
			if (!raceCount[id]) {
				raceCount[id] = { address: result.winner_address, count: 0 };
			}
			raceCount[id].count += 1;
		});

		const sortedWinners = Object.entries(raceCount)
			.map(([id, { address, count }]) => ({
				id,
				address,
				count,
				position: 0
			}))
			.sort((a, b) => b.count - a.count); // Sort by count descending

		sortedWinners.forEach((winner, index) => {
			winner.position = index + 1;
		});

		setWinners(sortedWinners);
	}, [raceResults]);

	useEffect(() => {
		const filtered = winners.filter(
			winner =>
				winner.address.toLowerCase().includes(searchQuery.toLowerCase()) || winner.id.includes(searchQuery)
		);
		setFilteredWinners(filtered);
		setCurrentPage(1); // Reset to first page on new filter
	}, [searchQuery, winners]);

	const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
	const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
	const currentItems = filteredWinners.slice(indexOfFirstItem, indexOfLastItem);

	// const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
	// const topWinner = winners[0];

	return (
		<main className='min-h-screen bg-slate-800 text-custom-200'>
			<div className='container mx-auto p-4'>
				{/* image avatar */}
				<div className='flex items-center space-x-4 mb-6'>
					<Image
						src='https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/61343f2b-5ef4-441b-fc06-1770e92b6500/rectcrop3'
						alt='avatar'
						width={50}
						height={50}
						className='rounded-full'
					/>
					<div>
						<h1 className='text-3xl font-bold'>HenloKarts Stats</h1>
					</div>
				</div>
				<div className='flex flex-col justify-start bg-custom-600 text-white p-4 shadow rounded-lg mb-6'>
					<h2 className='text-2xl font-semibold mb-2'>Total Races</h2>
					<AnimatedCounter
						value={totalRaces}
						color='white'
						fontSize='2rem'
						includeDecimals={false}
						containerStyles={{ margin: "0", width: "fit-content", textAlign: "center" }}
					/>
				</div>
				{/* {topWinner && (
					<div className='bg-custom-600 p-6 shadow rounded-lg mb-6 text-white'>
						<h2 className='text-lg font-semibold'>Top Winner: {topWinner.address}</h2>
						<p className='text-3xl'>{topWinner.count} Wins</p>
					</div>
				)} */}

				<input
					type='text'
					placeholder='Search by ID or address...'
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					className='mb-4 px-4 py-2 border rounded-lg text-black min-w-full'
				/>

				<div className='grid grid-cols-1 gap-4 max-h-[500px] overflow-y-scroll'>
					{filteredWinners.map((winner, index) => (
						<div
							key={index}
							className={clsx(
								"py-4 px-6 rounded-lg shadow-md text-center text-white flex justify-between",
								{
									"bg-yellow-500": winner.position === 0, // Gold
									"bg-gray-400": winner.position === 1, // Silver
									"bg-amber-700": winner.position === 2, // Bronze
									"bg-custom-600": winner.position > 2 // Default color for others
								}
							)}>
							<div className='flex items-center  text-2xl'>
								{winner.position === 1
									? "🥇"
									: winner.position === 2
									? "🥈"
									: winner.position === 3
									? "🥉"
									: `${winner.position + 1}th`}
							</div>
							<div className='flex flex-col items-start'>
								<h3 className='text-2xl font-semibold'>#{winner.id}</h3>
								<div className='flex items-center justify-center'>
									{winner.address.slice(0, 4)}...{winner.address.slice(-4)}
									<button
										className='bg-transparent text-white rounded-lg ml-1'
										onClick={() => navigator.clipboard.writeText(winner.address)}>
										{" "}
										<Image src={CopyIcon} alt='copy' width={20} height={20} />
									</button>
								</div>
							</div>
							<p className='flex items-center text-2xl'>{winner.count} Wins</p>
						</div>
					))}
				</div>

				{/* Pagination */}
				{/* <div className='py-4 flex justify-between items-center'>
					<button
						onClick={() => paginate(currentPage - 1)}
						disabled={currentPage === 1}
						className='px-3 py-1 bg-custom-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'>
						Previous
					</button>

					<button
						onClick={() => paginate(currentPage + 1)}
						disabled={currentItems.length < ITEMS_PER_PAGE}
						className='px-3 py-1 bg-custom-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'>
						Next
					</button>
				</div> */}
			</div>
		</main>
	);
}
