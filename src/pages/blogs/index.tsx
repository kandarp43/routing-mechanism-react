import { parseSearchParams, useNavigation, useParams } from '../../router'
import { style } from '../../style'

export default function Blogs() {
	const redirect = useNavigation()
	const { id } = useParams()
	console.log(parseSearchParams())
	return (
		<div
			style={style({ background: '#d06cff' })}
			onClick={() => redirect('/')}>
			Home {id}
		</div>
	)
}
