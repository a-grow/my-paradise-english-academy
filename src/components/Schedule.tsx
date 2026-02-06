const scheduleRows = [
	{
		level: "Level 1 – Starters",
		days: "Mon / Wed / Fri",
		time: "4:00 PM – 5:00 PM",
		age: "6–8",
		focus: "Phonics, speaking, games",
	},
	{
		level: "Level 2 – Explorers",
		days: "Tue / Thu",
		time: "4:30 PM – 6:00 PM",
		age: "8–10",
		focus: "Reading, grammar, projects",
	},
	{
		level: "Level 3 – Adventurers",
		days: "Mon / Wed",
		time: "6:30 PM – 7:45 PM",
		age: "10–12",
		focus: "Writing, presentations",
	},
	{
		level: "Level 4 – Champions",
		days: "Tue / Thu",
		time: "6:30 PM – 8:00 PM",
		age: "12–14",
		focus: "Debate, comprehension",
	},
	{
		level: "Conversation Club",
		days: "Sat",
		time: "10:00 AM – 11:30 AM",
		age: "All ages",
		focus: "Fluency, confidence",
	},
];

const Schedule = () => {
	return (
		<div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50 py-16">
			<div className="container mx-auto px-4 max-w-6xl">
				<div className="text-center mb-10">
					<span className="inline-flex items-center gap-2 rounded-full bg-pink-100 text-pink-700 px-4 py-1 text-sm font-semibold">
						Class Schedule
					</span>
					<h1 className="mt-4 text-4xl md:text-5xl font-display font-bold text-pink-900">
						Class Schedule
					</h1>
					<p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
						A clear and friendly overview of our class times. Contact us to reserve a seat or request a level check.
					</p>
				</div>

				<div className="rounded-2xl border border-pink-100 bg-white/80 backdrop-blur-md shadow-xl overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full text-left">
							<thead className="bg-pink-600 text-white">
								<tr>
									<th className="px-6 py-4 text-sm font-semibold">Level</th>
									<th className="px-6 py-4 text-sm font-semibold">Days</th>
									<th className="px-6 py-4 text-sm font-semibold">Time</th>
									<th className="px-6 py-4 text-sm font-semibold">Age</th>
									<th className="px-6 py-4 text-sm font-semibold">Focus</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-pink-100">
								{scheduleRows.map((row) => (
									<tr key={row.level} className="hover:bg-pink-50/60 transition-colors">
										<td className="px-6 py-4 font-semibold text-pink-900">{row.level}</td>
										<td className="px-6 py-4 text-slate-700">{row.days}</td>
										<td className="px-6 py-4 text-slate-700">{row.time}</td>
										<td className="px-6 py-4 text-slate-700">{row.age}</td>
										<td className="px-6 py-4 text-slate-700">{row.focus}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<div className="px-6 py-4 bg-pink-50 text-sm text-pink-900/80 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
						<span>Need a custom time? We can arrange private sessions.</span>
						<span className="font-semibold">Email: hello@myparadiseenglish.com</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Schedule;
