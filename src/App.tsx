import './App.css'
import Home from './pages/home'
import Blogs from './pages/blogs'
import { Route, Router } from './router'

function App() {
	return (
		<Router>
			<Route path='/'>
				<Home />
			</Route>
			<Route path='/blogs/:id'>
				<Blogs />
			</Route>
		</Router>
	)
}

export default App
