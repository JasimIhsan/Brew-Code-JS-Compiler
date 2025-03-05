import { GitHub, LinkedIn } from "@mui/icons-material";

export default function Header() {
	return (
		<header className="flex items-center justify-between border-b bg-gray-800 border-gray-700 px-4 py-3">
			<div className="flex items-center gap-6">
				<span className="text-2xl font-bold text-blue-600" style={{ fontFamily: "Noto Sans Malayalam" }}>
					BrewCode
				</span>
				<span className="text-gray-300">JavaScript Online Compiler</span>
			</div>
			<div className="flex">
				<a href="https://github.com/JasimIhsan" target="_blank" className="flex items-center gap-1 rounded-md   px-4 py-2 ">
					<GitHub sx={{ color: "white" }} />
				</a>
				<a href="https://www.linkedin.com/in/jasim-ihsan-m/" target="_blank" className="flex items-center gap-1 rounded-md  px-4 py-2">
					<LinkedIn sx={{ color: "white" }} />
				</a>
			</div>
		</header>
	);
}
