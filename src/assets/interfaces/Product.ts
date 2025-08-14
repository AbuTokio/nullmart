import type { IRating } from "./Rating"

export interface IProduct {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: IRating
}
