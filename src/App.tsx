import { Analytics } from "@vercel/analytics/react";
import "./App.css";
import Home from "./components/Home";

function App() {
	return (
		<>
			<Home />
			<Analytics />
		</>
	);
}

export default App;
