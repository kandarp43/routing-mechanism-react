import { Link } from '../../router'
import { style } from '../../style'

export default function Home() {
	return (
		<Link
			style={style()}
			href={`/blogs/${parseInt(Math.random() * 100 + '')}?page=${parseInt(Math.random() * 100 + '')}`}>
			Blogs
		</Link>
	)
}
