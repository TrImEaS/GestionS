import Spinner from '../Spinner'
import { FaSearch } from 'react-icons/fa'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

export default function SearchInput() {
  const [keyword, setKeyword] = useState('')
  const [searchMenu, setSearchMenu] = useState(false)
  
  const inputRef = useRef(null)
  const navigate = useNavigate()
  
  const handleChange = (e) => setKeyword(e.target.value)
  
  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(`/search/?search=${keyword}`)
    setKeyword('')
  }

  const handleFocusMenu = () => setSearchMenu(true)

  const handleClickOutside = (e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
      setSearchMenu(false)
    }
  }

  useEffect(() => {
    setSearchMenu(false)
  }, [location.search, navigate])

  useEffect(() =>{
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  },[])

  return(
    <form 
      className='flex relative border bg-gray-100 rounded-full flex-col w-full text-black gap-2 justify-center items-center px-2 z-[9999]'
      onSubmit={handleSubmit}
      ref={inputRef}>
      <div className='flex w-full gap-2 mr-2 justify-center items-center px-2 bg-gray-100 rounded-full'>
        <FaSearch/>
        <input 
          type="text" 
          className='w-full placeholder:text-gray-500 rounded-full bg-gray-100 outline-none px-3 py-1'
          placeholder='Buscar'
          value={keyword}
          onChange={handleChange}
          onFocus={handleFocusMenu}/>
      </div>
      {searchMenu !== false && keyword !== '' && <SearchResults keyword={keyword} />}
    </form>
  )
}

function SearchResults({ keyword }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const maxNameLength = 50
  
  if(loading){
    return(
      <section className='flex flex-col absolute top-10 gap-2 w-full max-h-[500px] bg-white border-2 rounded-lg z-[9999] overflow-y-auto p-3 h-[500px]'>
        <Spinner />
      </section>
    )
  }

  const formattedPrice = (price) => 
    parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  
  const totalDiscount = (price, discount) => 
  {
    // Convertir los precios a números
    const normalPrice = parseFloat(price);
    const discountedPrice = parseFloat(discount);
  
    // Calcular el porcentaje de descuento
    const percentage = ((normalPrice - discountedPrice) / normalPrice) * 100;
  
    // Devolver el porcentaje como un número entero
    return Math.round(percentage);
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(keyword.toLowerCase()) ||
    product.sku.toLowerCase().includes(keyword.toLowerCase()) ||
    product.sub_category.toLowerCase().includes(keyword.toLowerCase())
  )

  return (
    <section className={`flex flex-col absolute top-10 gap-2 w-full max-h-[500px] bg-white border-2 rounded-lg z-[9999] overflow-y-auto p-3 ${filteredProducts.length === 0 ? 'h-50' : 'h-[500px]'}`}>
    {filteredProducts.length === 0 
    ? (
      <div>
        <p className='font-bold text-lg'>
          No se encontraron resultados...
        </p>
      </div>
    ) 
    : (
      filteredProducts.map((product) => (
        <NavLink 
          to={`/products/?product=${product.sku}`}
          key={product.id} 
          className="flex box-border items-center justify-between bg-white p-1 duration-500 border-2 rounded-sm hover:cursor-pointer z-[99999] w-full min-h-[150px] max-h-[150px] shadow-border">
          <header className="relative w-[50%] h-full box-border">
            {product.discount > 0
            ?
              <img className="absolute h-10 w-10 right-5" src={saleImg} alt="" />
            :
              ''
            }
            <img 
              src={product.img_base} 
              loading="eager"
              alt={product.name}
              onError={(e) => e.target.src = ''}
              className="w-full h-full object-contain" 
            />
          </header>

          <article className="w-[50%] h-full box-border flex flex-col justify-between">
            <p className='flex flex-col text-sm'>
              <span className='text-xs text-gray-500'>SKU: {product.sku}</span>
              <span>{product.name.length > maxNameLength ? `${product.name.substring(0, maxNameLength)}...`: product.name}</span>
            </p>
            {product.discount 
            ? 
              <div>
                <div className='flex items-center gap-x-1'>
                  <p className="text-sm line-through">${formattedPrice(product.price)}</p>
                  <span className='text-sm mb-1 bg-orange-400 text-white px-2 rounded-full'>{totalDiscount(product.price, product.discount)}% OFF</span>
                </div>
                <p className="font-bold text-2xl">${formattedPrice(product.discount)}</p>
              </div>
            : 
              <p className="font-bold text-2xl">${formattedPrice(product.price)}</p>
            }
          </article>
        </NavLink>
      ))
    )}
    </section>
  )
}