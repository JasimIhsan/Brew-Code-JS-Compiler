import { GitHub, LinkedIn } from "@mui/icons-material";
import { useTheme } from "../context/ThemeContext";
import { Switch, FormControlLabel } from "@mui/material";

export default function Header() {
	const { theme, toggleTheme } = useTheme();

	return (
		<header className={`${theme === "dark" 
			? "bg-gray-800 border-gray-700 text-gray-300" 
			: "bg-gray-200 border-gray-300 text-gray-900"} flex items-center justify-between border-b px-4 py-3`}>
			<div className="flex items-center gap-6">
				<span className="text-2xl font-bold text-blue-600" style={{ fontFamily: "Noto Sans Malayalam" }}>
					BrewCode
				</span>
				<span className={`${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>JavaScript Online Compiler</span>
			</div>

			<div className="flex items-center gap-4">
			<FormControlLabel
        control={
          <Switch
            checked={theme === "dark"}
            onChange={toggleTheme}
            sx={{
              "& .MuiSwitch-thumb": {
                backgroundColor: theme === "dark" ? "#fff" : "#000",
              },
              "& .MuiSwitch-track": {
                backgroundColor: theme === "dark" ? "#333" : "#ccc",
              },
            }}
          />
        }
        label={theme === "dark" ? "Dark Mode" : "Light Mode"}
        sx={{
          fontSize: "1.2rem",
          fontWeight: "bold",
        }}
      />

				<a href="https://github.com/JasimIhsan" target="_blank" className="flex items-center gap-1 rounded-md px-4 py-2">
					<GitHub sx={{ color: theme === "dark" ? "white" : "black" }} />
				</a>
				<a href="https://www.linkedin.com/in/jasim-ihsan-m/" target="_blank" className="flex items-center gap-1 rounded-md px-4 py-2">
					<LinkedIn sx={{ color: theme === "dark" ? "white" : "black" }} />
				</a>
			</div>
		</header>
	);
}
