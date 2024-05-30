import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Image from "next/image";

interface Winner {
	id: string;
	count: number;
	position: number;
	totalWinPercentage: number;
	participationWinPercentage: number;
	totalParticipations: number;
}

const Leaderboard = ({ topWinners, sortCriteria }: { topWinners: Winner[]; sortCriteria: string }) => {
	let sortedWinners = [...topWinners];

	if (sortedWinners.length === 3) {
		const firstPlace = sortedWinners.find(winner => winner.position === 1);
		const others = sortedWinners.filter(winner => winner.position !== 1);

		if (firstPlace && others.length === 2) {
			sortedWinners = [others[0], firstPlace, others[1]];
		}
	}

	const getScale = (position: number) => {
		if (position === 1) return "scale-125";
		if (position === 2) return "scale-110";
		if (position === 3) return "scale-105";
		return "";
	};

	const getColor = (position: number) => {
		if (position === 1) return "text-yellow-400";
		if (position === 2) return "text-yellow-gray-300";
		if (position === 3) return "text-yellow-800";
		return "";
	};

	return (
		<div className='flex justify-center space-x-4 py-5'>
			{sortedWinners.map((winner, index) => (
				<div key={winner.id} className={`flex flex-col items-center w-28 ${getScale(winner.position)}`}>
					<div className='relative w-24 h-24'>
						<Image
							src={`https://robohash.org/${winner.id}`}
							alt={`Avatar of ${winner.id}`}
							height={100}
							width={100}
							className='rounded-full'
						/>
						<div className='absolute -top-8 left-1/2 -translate-x-1/2 bg-transparent rounded-full p-1'>
							{/* add position */}
							<div className='absolute text-sm left-1/2 top-2 -translate-x-1 font-bold text-white'>
								{winner.position}
							</div>
							<EmojiEventsIcon className={getColor(winner.position)} style={{ fontSize: "2.5rem" }} />
						</div>
					</div>
					<div className='text-center mt-2'>
						<div className='text-xl font-bold'>#{winner.id}</div>
						{sortCriteria === "totalWins" && <div className='text-sm text-white'>{winner.count} Wins</div>}
						{sortCriteria === "participationWinPercentage" && (
							<div className='text-sm text-white'>{winner.participationWinPercentage.toFixed(1)}%</div>
						)}
					</div>
				</div>
			))}
		</div>
	);
};

export default Leaderboard;
