"use client";

import Image from "next/image";
import Leaderboard from "@/components/Leaderboard";
import SortIcon from "@mui/icons-material/Sort";
import clsx from "clsx";

import { AnimatedCounter } from "react-animated-counter";
import { Menu, MenuItem, IconButton } from "@mui/material";
import { useEffect, useState } from "react";

interface Winner {
	id: string;
	count: number;
	position: number;
	totalWinPercentage: number;
	participationWinPercentage: number;
	totalParticipations: number;
}

export default function Home() {
	const [winners, setWinners] = useState<Winner[]>([]);
	const [topWinners, setTopWinners] = useState<Winner[]>([]);
	const [filteredWinners, setFilteredWinners] = useState<Winner[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [totalRaces, setTotalRaces] = useState(0);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortCriteria, setSortCriteria] = useState("totalWins");

	const open = Boolean(anchorEl);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetch("http://localhost:8000/api/stats/tokens");
				let data = await response.json();
				data = data.data;
				const totalRaces = data.reduce((acc: number, token: any) => acc + token.total_races, 0);
				setTotalRaces(totalRaces);

				const formattedWinners = data.map((token: any, index: number) => ({
					id: token.token_id,
					count: token.total_wins,
					position: index + 1,
					totalWinPercentage: (token.total_wins / totalRaces) * 100,
					participationWinPercentage: (token.total_wins / token.total_races) * 100,
					totalParticipations: token.total_races
				}));

				const sortedWinners = [...formattedWinners];
				switch (sortCriteria) {
					case "totalWins":
						sortedWinners.sort((a, b) => b.count - a.count);
						break;
					case "totalWinPercentage":
						sortedWinners.sort((a, b) => b.totalWinPercentage - a.totalWinPercentage);
						break;
					case "participationWinPercentage":
						sortedWinners.sort((a, b) => b.participationWinPercentage - a.participationWinPercentage);
						break;
				}
				sortedWinners.forEach((winner, index) => {
					winner.position = index + 1;
				});
				setWinners(sortedWinners);
				setTopWinners(sortedWinners.slice(0, 3));
			} catch (error) {
				console.error("Error fetching token stats:", error);
			}
		}

		fetchData();
	}, [sortCriteria]);

	useEffect(() => {
		const filtered = winners.filter(winner => winner.id.toString().includes(searchQuery));
		setFilteredWinners(filtered);
	}, [searchQuery, winners]);

	const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleSortClose = (criteria: string) => {
		setSortCriteria(criteria);
		setAnchorEl(null);
	};

	return (
		<main className='min-h-screen bg-slate-800 text-custom-200'>
			<div className='max-w-5xl mx-auto p-4'>
				{/* image avatar */}
				<div className='flex items-center space-x-4 mb-12'>
					{/* <Image
						unoptimized
						src='https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/61343f2b-5ef4-441b-fc06-1770e92b6500/rectcrop3'
						alt='avatar'
						width={50}
						height={50}
						className='rounded-full'
					/> */}
					<div>
						<h1 className='text-3xl font-bold'>HenloKart Dashboard</h1>
					</div>
				</div>
				{/* <div className='flex flex-col justify-start bg-custom-600 text-white p-4 shadow rounded-lg mb-6'>
					<h2 className='text-2xl font-semibold mb-2'>Total Races</h2>
					<AnimatedCounter
						value={totalRaces}
						color='white'
						fontSize='2rem'
						includeDecimals={false}
						containerStyles={{ margin: "0", width: "fit-content", textAlign: "center" }}
					/>
				</div> */}
				<Leaderboard topWinners={topWinners} sortCriteria={sortCriteria} />
				<div className='flex min-w-full justify-between items-center my-4'>
					<input
						type='text'
						placeholder='Search by ID...'
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
						className='p-2 border rounded-lg text-black grow'
					/>
					<IconButton onClick={handleSortClick}>
						<SortIcon className='text-white' />
					</IconButton>
					<Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
						<MenuItem onClick={() => handleSortClose("totalWins")}>Total Wins</MenuItem>
						{/* <MenuItem onClick={() => handleSortClose("totalWinPercentage")}>Total Win Percentage</MenuItem> */}
						<MenuItem onClick={() => handleSortClose("participationWinPercentage")}>
							Participation Win Percentage
						</MenuItem>
					</Menu>
				</div>
				<div className='grid grid-cols-1 gap-4 max-h-[500px] overflow-y-scroll'>
					{filteredWinners.map((winner, index) => (
						<div
							key={index}
							className={clsx(
								"py-4 px-6 rounded-lg shadow-md text-center text-white flex justify-between",
								{
									"bg-yellow-500": winner.position === 1, // Gold
									"bg-gray-400": winner.position === 2, // Silver
									"bg-amber-700": winner.position === 3, // Bronze
									"bg-custom-600": winner.position > 3 // Default color for others
								}
							)}>
							<div className='flex items-center'>
								<div className='flex items-center text-2xl'>
									{winner.position === 1
										? "🥇"
										: winner.position === 2
										? "🥈"
										: winner.position === 3
										? "🥉"
										: `${winner.position}`}
								</div>
								<div className='flex flex-col items-start px-6'>
									<h3 className='text-2xl font-semibold'>#{winner.id}</h3>
								</div>
							</div>
							<div className='flex flex-col items-center'>
								<p className='text-2xl'>{winner.count} Wins</p>
								<p className='text-md'>{winner.participationWinPercentage.toFixed(2)}%</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</main>
	);
}
