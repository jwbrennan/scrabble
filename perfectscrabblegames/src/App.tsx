import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import CollectionViewer from './components/CollectionViewer';

function App() {
	return (
		<Router>
			<Routes>
				<Route path="/" element={<MainPage />} />
				<Route path="/collection" element={<CollectionViewer />} />
			</Routes>
		</Router>
	);
}

export default App;
