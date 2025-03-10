import { Analytics } from "@vercel/analytics/react";
import "./App.css";
import Home from "./components/Home";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
	return (
		<ThemeProvider>
			<Home />
			<Analytics />
		</ThemeProvider>
	);
}

export default App;
