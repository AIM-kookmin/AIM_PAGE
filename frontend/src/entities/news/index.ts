export type { News, NewsInsert, NewsUpdate, NewsCategory } from './model/types'
export { NEWS_CATEGORIES } from './model/types'
export {
  getAllNews,
  getActiveNews as getActiveNewsClient,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from './api/queries'
export { getActiveNews } from './api/queries.server'
