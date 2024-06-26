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
	const [listWinners, setListWinners] = useState<Winner[]>([]);
	const [filteredWinners, setFilteredWinners] = useState<Winner[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [totalRaces, setTotalRaces] = useState(0);
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortCriteria, setSortCriteria] = useState("totalWins");

	const open = Boolean(anchorEl);

	useEffect(() => {
		async function fetchData() {
			try {
				const response = await fetch("https://henlokartdashboard.onrender.com/api/stats/tokens");
				let data = await response.json();
				data = data.data;
				const totalRaces = data.reduce((acc: number, token: any) => acc + token.total_wins, 0);
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
				setListWinners(sortedWinners.slice(3));
			} catch (error) {
				console.error("Error fetching token stats:", error);
			}
		}

		fetchData();
	}, [sortCriteria]);

	useEffect(() => {
		const filtered = listWinners.filter(winner => winner.id.toString().includes(searchQuery));
		setFilteredWinners(filtered);
	}, [searchQuery, listWinners]);

	const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleSortClose = (criteria: string) => {
		setSortCriteria(criteria);
		setAnchorEl(null);
	};

	if (!winners.length) {
		return "";
	}

	return (
		<main className='h-screen bg-slate-800 text-custom-200 flex flex-col items-center'>
			<div className='h-screen max-w-5xl lg:max-w-screen-lg lg:w-[1024px] p-4 flex flex-col flex-grow'>
				<div className='flex items-center space-x-4 mb-2'>
					<div>
						<h1 className='text-3xl font-bold'>HenloKart Dashboard</h1>
					</div>
				</div>
				<div className='flex justify-between bg-custom-600 text-white p-4 shadow rounded-lg mb-16'>
					<h2 className='text-2xl font-semibold'>Total Races</h2>
					<AnimatedCounter
						value={totalRaces}
						color='white'
						fontSize='1.5rem'
						includeDecimals={false}
						containerStyles={{
							margin: "0",
							width: "fit-content",
							textAlign: "center",
							marginTop: "0.25rem",
							fontWeight: "bold"
						}}
					/>
				</div>
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
						<MenuItem onClick={() => handleSortClose("participationWinPercentage")}>
							Participation Win Percentage
						</MenuItem>
					</Menu>
				</div>
				<div className='flex-1 overflow-y-auto'>
					<div className='grid grid-cols-1 gap-4'>
						{filteredWinners.map((winner, index) => (
							<div
								key={index}
								className={clsx(
									"p-4 rounded-lg shadow-md text-center text-white flex justify-between",
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
									<div className='flex items-center px-3'>
										<Image
											src={`https://robohash.org/${winner.id}`}
											alt={`Avatar of ${winner.id}`}
											height={50}
											width={50}
											className='rounded-full bg-custom-300 mr-2'
										/>
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
			</div>
		</main>
	);
}
