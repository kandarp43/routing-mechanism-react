import { useState, useContext, createContext, Children, useEffect, useRef, ComponentProps, ReactElement } from 'react'
import type { Dispatch, SetStateAction } from 'react'

type optionsType = {
	state?: any
}

function getDynamicPath(url: string, newPath: string) {
	const oDynamicPaths: any = {}
	const aPaths: string[] = url?.split('/').filter((path) => path)
	const aNewPath: string[] = newPath?.split('/').filter((path) => path)
	let isPathMatch: boolean = false
	if (aPaths.length === aNewPath.length) {
		for (const index in aPaths) {
			const sPath: string = aPaths[index]
			const sNewPath: string = aNewPath[index]
			if (sPath.startsWith(':')) {
				oDynamicPaths[sPath.slice(1)] = Number(sNewPath) || sNewPath
			} else if (sPath === sNewPath) {
				isPathMatch = true
			} else {
				sPath
				isPathMatch = false
				break
			}
		}
	}
	return isPathMatch ? oDynamicPaths : isPathMatch
}

export function useParams(): any {
	const { getPathData } = useRouter()
	return getPathData(location.pathname) || {}
}

export function useNavigation() {
	const { handlePathChange } = useRouter()

	function redirect(url: string | undefined, options?: optionsType) {
		const path = url?.toLowerCase()?.trim()
		history.pushState(options?.state, '', path)

		//  here will come a subscriber method route change will be called when the setPath through only from redirect function
		handlePathChange(path)
	}
	return redirect
}

export function Link({ children, href, onClick, ...props }: ComponentProps<'a'>): ReactElement {
	const redirect = useNavigation()
	function handleNavigate(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
		e.preventDefault()
		onClick && onClick(e)
		redirect(href)
	}
	// delete props.href
	return (
		<a
			onClick={handleNavigate}
			href={href}
			{...props}>
			{children}
		</a>
	)
}

type RouterContextType = {
	children: JSX.Element[]
}

type RouteContext = {
	children: JSX.Element
	path: string
}
// type LinkType = {
// 	children: JSX.Element | string
// 	href: string | '' | undefined
// 	onClick: (e?: any) => void
// }

type contextDetails = {
	handlePathChange: (d: string | undefined) => void
	getPathData: (d: string | undefined) => {}
	path: string
}

const RouterContext: any = createContext(null)

function useRouter(): contextDetails {
	return useContext<contextDetails>(RouterContext)
}

export function Router({ children }: RouterContextType): ReactElement {
	const [path, setPath]: [string, Dispatch<SetStateAction<string>>] = useState<string>(location.pathname + location.search + location.hash)
	let oRoutes: any = useRef({}).current

	function handlePathChange(url: string) {
		setPath(url)
	}

	function validRoute(oChild: JSX.Element): JSX.Element | false {
		const [routePath] = path?.split('?')
		if (oChild.type?.name !== 'Route') throw Error('you can only use Route Component inside Router')
		oRoutes = { [routePath]: getDynamicPath(oChild.props.path, routePath) }
		const bIsRouteFound = oChild.props.path === routePath || oRoutes[routePath]
		return bIsRouteFound ? oChild : false
	}

	function getPathData(url: string): {} {
		return oRoutes[url] || {}
	}

	useEffect(() => {
		function handlePopState(e: PopStateEvent) {
			const { pathname, search, hash } = location
			handlePathChange(`${pathname}${search}${hash}`)
		}
		window.addEventListener('popstate', handlePopState)
		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	}, [])

	return (
		<RouterContext.Provider value={{ path, handlePathChange, getPathData }}>{Children?.map(children, validRoute)}</RouterContext.Provider>
	)
}

export function Outlet() {
	
}
