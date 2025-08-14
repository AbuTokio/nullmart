import { Sort } from "../enums/Sort"
import type { IProduct } from "../interfaces/Product"
import "../styles/style.css"

const FAKESTORE_API_BASE_URL = "https://fakestoreapi.com"
let products: IProduct[] = getProducts()
let categories: string[] = getCategories()
let activeFilter: HTMLButtonElement | null

const htmlElements = {
  searchInput: document.querySelector("#search-input") as HTMLInputElement,
  sortBy: document.querySelector("#sort-input") as HTMLSelectElement,
  filterButtonsWrapper: document.querySelector(".filter-buttons-wrapper") as HTMLDivElement,
  filterButtons: [] as HTMLButtonElement[],
  productsSection: document.querySelector(".products-section") as HTMLDivElement,
}

function getProducts(): IProduct[] {
  let productsArray: IProduct[] = []

  fetch(FAKESTORE_API_BASE_URL + "/products")
    .then((response: Response) => {
      if (!response.ok) {
        console.error(`Could not fetch from ${FAKESTORE_API_BASE_URL + "/products"}`)
        return
      }
      return response.json()
    })
    .then((products: IProduct[]) => {
      // console.log(products) // note: Debug
      products.forEach((product: IProduct) => {
        productsArray.push(product)
      })
    })
    .finally(() => {
      console.log("All products fetched!") // note: Debug
    })
  return productsArray
}

function getCategories(): string[] {
  let categoriesArray: string[] = []

  fetch(FAKESTORE_API_BASE_URL + "/products/categories")
    .then((response: Response) => {
      if (!response.ok) {
        console.error(`Could not fetch from ${FAKESTORE_API_BASE_URL + "/products/categories"}`)
        return
      }
      return response.json()
    })
    .then((categories: string[]) => {
      categories.forEach((category: string) => {
        categoriesArray.push(cleanString(category))
      })
    })
    .finally(() => {
      console.log("All categories fetched!") // note: Debug
    })
  categoriesArray.sort()
  return categoriesArray
}

function cleanString(inputString: string): string {
  const outputString = inputString.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "")
  return outputString
}

function addFilterButtons(categories: string[]): void {
  categories.forEach((categorie: string) => {
    const newFilterButton: HTMLButtonElement = document.createElement("button")
    newFilterButton.textContent = categorie
    newFilterButton.id = categorie.replace(" ", "-") + "-button"
    newFilterButton.classList.add("filter-button")
    htmlElements.filterButtonsWrapper.appendChild(newFilterButton)

    htmlElements.filterButtons = Array.from(document.querySelectorAll(".filter-button"))
  })
}

function printProducts(products: IProduct[]): void {
  htmlElements.productsSection.innerHTML = ""

  products.forEach((product: IProduct) => {
    const productCard: string = `
    <div class="product-card">
      <div class="image-wrapper">
        <img src="${product.image}" alt="product-image" />
      </div>
      <h2>${product.title}</h2>
      <div class="price-cart-wrapper">
        <p>$ ${product.price.toFixed(2)}</p>
        <button type="button">Add to cart</button>
      </div>
    </div>
    `

    htmlElements.productsSection.innerHTML += productCard
  })
}

function filteredProducts(category: string): IProduct[] {
  const filteredArray: IProduct[] = products.filter((product: IProduct) => {
    return cleanString(product.category) === category
  })
  return filteredArray
}

function sortedProducts(sortingCondition: string, filteredProducts?: IProduct[]): IProduct[] {
  const sortedProducts: IProduct[] = filteredProducts ? [...filteredProducts] : [...products]
  switch (sortingCondition) {
    case Sort.PRICE_LOWEST_TO_HIGHEST:
      return sortedProducts.sort((productA: IProduct, productB: IProduct) => productA.price - productB.price)
      break
    case Sort.PRICE_HIGHEST_TO_LOWEST:
      return sortedProducts.sort((productA: IProduct, productB: IProduct) => productB.price - productA.price)
      break
    case Sort.RATING:
      return sortedProducts.sort(
        (productA: IProduct, productB: IProduct) => productA.rating.rate - productB.rating.rate
      )
      break
    default:
      return products
  }
}

function searchedProducts(search: string): IProduct[] {
  if (activeFilter) {
    return filteredProducts(activeFilter.textContent).filter((product: IProduct) =>
      product.title.toLowerCase().includes(search.toLowerCase())
    )
  } else {
    return products.filter((product: IProduct) => product.title.toLowerCase().includes(search.toLowerCase()))
  }
}

setTimeout(() => {
  addFilterButtons(categories)
  printProducts(products)

  htmlElements.filterButtons.forEach((button: HTMLButtonElement) => {
    button.addEventListener("click", () => {
      activeFilter = button
      htmlElements.sortBy.selectedIndex = 0
      htmlElements.filterButtons.forEach((button: HTMLButtonElement) => {
        if (button !== activeFilter) {
          button.classList.remove("active-filter")
        }
      })
      if (button.classList.contains("active-filter")) {
        activeFilter = null
        button.classList.remove("active-filter")
        htmlElements.searchInput.value
          ? printProducts(searchedProducts(htmlElements.searchInput.value))
          : printProducts(products)
      } else {
        button.classList.add("active-filter")
        htmlElements.searchInput.value
          ? printProducts(searchedProducts(htmlElements.searchInput.value))
          : printProducts(filteredProducts(button.textContent))
      }
    })
  })

  htmlElements.sortBy.addEventListener("change", () => {
    htmlElements.searchInput.value
      ? printProducts(sortedProducts(htmlElements.sortBy.value, searchedProducts(htmlElements.searchInput.value)))
      : printProducts(sortedProducts(htmlElements.sortBy.value))
  })

  htmlElements.searchInput.addEventListener("input", () => {
    htmlElements.sortBy.selectedIndex = 0
    printProducts(searchedProducts(htmlElements.searchInput.value))
  })
}, 200)
