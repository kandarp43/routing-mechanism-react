import { useState, useContext, createContext, Children, useEffect, useRef, ComponentProps, ReactElement } from 'react'
import type { Dispatch, SetStateAction } from 'react'

type optionsType = {
	state?: any
}

function getDynamicPath(sUrl: string, sDynamicPath: string) {
	const oDynamicPaths: any = {}
	const aNaturalPath: string[] = sUrl?.split('/').filter((path) => path)
	const aDynamicPath: string[] = sDynamicPath?.split('/').filter((path) => path)
	let doesPathMatch: boolean = false
	if (aNaturalPath.length === aDynamicPath.length) {
		for (const index in aNaturalPath) {
			const sPath: string = aNaturalPath[index]
			const sNewPath: string = aDynamicPath[index]
			if (sPath.startsWith(':')) {
				oDynamicPaths[sPath.slice(1)] = Number(sNewPath) || sNewPath
			} else if (sPath === sNewPath) {
				doesPathMatch = true
			} else {
				doesPathMatch = false
				break
			}
		}
	}
	return doesPathMatch ? oDynamicPaths : doesPathMatch
}

export function useParams(): any {
	const { getPathData } = useRouter()
	return getPathData(location.pathname) || {}
}
export function useLocation(): Location {
	const { oLocation } = useRouter()
	return oLocation as Location
}

export const parseSearchParams = (sParams?: string) => {
	const { search } = useLocation()
	const params = decodeURIComponent(sParams || search)
	const urlParams = new URLSearchParams(params)
	const rawParams = params.replace('?', '').split('&')

	const paramsValue: any = {}
	if (rawParams?.length) {
		rawParams.forEach((item) => {
			const [key] = item.split('=')
			paramsValue[key] = urlParams.has(key) ? urlParams.get(key) : ''
		})
	}
	return paramsValue
}
type paramsType = { [key: string]: any }

export function changeSearchParams(value: paramsType) {
	const redirect = useNavigation()
	const { path } = useRouter()
	const [routePath] = path?.split('?')
	const data: paramsType = { ...value } as paramsType
	data.search = encodeURIComponent(data?.search || '')
	for (const key in data) {
		if (data[key] === '' || typeof data[key] === 'object' || !data[key]?.toString().length) delete data[key]
	}
	const sSearchParams: string = new URLSearchParams(data).toString()
	redirect(`${routePath}?${sSearchParams}`)
}

export function useNavigation() {
	const { handlePathChange } = useRouter()

	function redirect(url: string | undefined, options?: optionsType) {
		const path = url?.toLowerCase()?.trim()
		history.pushState(options?.state, '', path)

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

type contextDetails = {
	handlePathChange: (d: string | undefined) => void
	getPathData: (d: string | undefined) => {}
	oLocation: Location & {}
	path: string
}

const RouterContext: any = createContext(null)

function useRouter(): contextDetails {
	return useContext<contextDetails>(RouterContext)
}

export function Router({ children }: RouterContextType): ReactElement {
	const [path, setPath]: [string, Dispatch<SetStateAction<string>>] = useState<string>(location.pathname + location.search + location.hash)
	const oRoutes: any = useRef({})
	const oLocation: any = useRef(handleLocation())

	function handlePathChange(url: string) {
		setPath(url)
	}

	function handleLocation() {
		const { host, hostname, href, origin, pathname, port, protocol, search = '' } = location
		return { host, hostname, href, origin, pathname, port, protocol, search }
	}

	function validRoute(oChild: JSX.Element): JSX.Element | false {
		const [routePath] = path?.split('?')
		if (oChild.type?.name !== 'Route') throw Error('you can only use Route Component inside Router')
		oLocation.current = handleLocation()
		oRoutes.current = { [routePath]: getDynamicPath(oChild.props.path, routePath) }
		const bIsRouteFound = oChild.props.path === routePath || oRoutes.current[routePath]
		return bIsRouteFound ? oChild : false
	}

	function getPathData(url: string): {} {
		return oRoutes.current[url] || {}
	}

	useEffect(() => {
		function handlePopState(e: PopStateEvent) {
			e.preventDefault()
			const { pathname, search, hash } = location
			handlePathChange(`${pathname}${search}${hash}`)
		}
		window.addEventListener('popstate', handlePopState)
		return () => {
			window.removeEventListener('popstate', handlePopState)
		}
	}, [])

	return (
		<RouterContext.Provider value={{ path, handlePathChange, getPathData, oLocation: oLocation.current }}>
			{Children?.map(children, validRoute)}
		</RouterContext.Provider>
	)
}

export function Route({ children }: RouteContext): ReactElement {
	return children
}

// export function Outlet() {

// }
