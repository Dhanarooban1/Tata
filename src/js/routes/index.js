import SearchPage from "../../components/sections/SearchPage/SearchPage"
import ResultsPage from "../../components/sections/ResultPage/ResultsPage"
const routes = [
    {
        path: "/",
        end: true,
        component: SearchPage,
    },
    {
        path: "/results",
        end: true,
        component: ResultsPage,
    },
]

export default routes
