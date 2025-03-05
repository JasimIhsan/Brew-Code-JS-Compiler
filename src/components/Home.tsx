import CodeEditor from "./CodeEditor";
import Header from "./Header";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col">
			<Header />
			<CodeEditor />
		</main>
	);
}
