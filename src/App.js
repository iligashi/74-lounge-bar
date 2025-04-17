import React, { useState } from 'react';
import { FaShoppingCart, FaUser, FaSearch, FaPhone, FaClock, FaMapMarkerAlt, FaPlus, FaMinus, FaTimes, FaCalendar, FaUserFriends } from 'react-icons/fa';
import './hero.css';

const menuCategories = ['All', 'Burger', 'Pizza', 'Pasta', 'Fries'];

const menuItems = [
  {
    id: 1,
    name: 'Classic Margherita',
    category: 'Pizza',
    price: 3.50,
    description: 'Fresh tomatoes, mozzarella cheese, basil, and extra virgin olive oil on our signature crust',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 2,
    name: 'Cheese Burger',
    category: 'Burger',
    price: 3.00,
    description: 'Juicy beef patty with melted cheddar, fresh lettuce, tomatoes, and our special sauce',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 3,
    name: 'Pepperoni Pizza',
    category: 'Pizza',
    price: 3.50,
    description: 'Classic pepperoni with mozzarella and our signature tomato sauce',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 4,
    name: 'Loaded Fries',
    category: 'Fries',
    price:1.50,
    description: 'Crispy fries topped with melted cheese, bacon bits, and green onions',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 5,
    name: 'BBQ Burger',
    category: 'Burger',
    price: 3.00,
    description: 'Grilled beef patty with BBQ sauce, crispy onion rings, and smoked cheddar',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: 6,
    name: 'Carbonara',
    category: 'Pasta',
    price: 3.50,
    description: 'Classic Italian pasta with creamy sauce, pancetta, and parmesan cheese',
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  }
];

function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [orderNote, setOrderNote] = useState('');
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
    specialRequests: ''
  });

  const [bookingErrors, setBookingErrors] = useState({});

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, change) => {
    setCartItems(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change;
          return newQuantity < 1 ? null : { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean)
    );
  };

  const cartTotal = cartItems.reduce((total, item) => 
    total + (item.price * item.quantity), 0
  );

  const handleSearch = (query) => {
    const results = menuItems.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const formatWhatsAppMessage = (type, details) => {
    const messages = {
      order: `Hello! I would like to place an order at 74 Lounge Bar. \n` +
        ` Order Details: \n` +
        `${details.items.map(item => `• ${item.quantity} ${item.name} \n`)}` ,
        // ` Special Instructions:${details.note }` +
        // ` Total Amount: $${details.total}` +
        // ` Order Time: ${details.timestamp}`

      booking: `Hello! I would like to make a reservation at *74 Lounge Bar*%0a%0a` +
        `*Reservation Details:*%0a` +
        `Name: ${details.name}%0a` +
        `Date: ${new Date(details.date).toLocaleDateString()}%0a` +
        `Time: ${details.time}%0a` +
        `Guests: ${details.guests}%0a` +
        `Phone: ${details.phone}%0a` +
        `Email: ${details.email}%0a%0a` +
        `*Special Requests:*%0a${details.specialRequests || 'None'}%0a%0a` +
        `*Booking Time:* ${new Date().toLocaleString()}`
    };

    return `https://wa.me/38349662128?text=${encodeURIComponent(messages[type])}`;
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const orderDetails = {
      items: cartItems,
      total: cartTotal.toFixed(2),
      note: orderNote,
      timestamp: new Date().toLocaleString()
    };

    // Create and open WhatsApp link
    const whatsappUrl = formatWhatsAppMessage('order', orderDetails);
    window.location.href = whatsappUrl; // Direct redirect instead of new tab

    // Clear cart after sending to WhatsApp
    setCartItems([]);
    setOrderNote('');
    setShowCart(false);
  };

  const handleNavigation = (section) => {
    const element = document.getElementById(section);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const validateBookingForm = () => {
    const errors = {};
    const today = new Date();
    const selectedDate = new Date(bookingForm.date);

    if (!bookingForm.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!bookingForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(bookingForm.email)) {
      errors.email = 'Invalid email format';
    }

    if (!bookingForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{8,}$/.test(bookingForm.phone)) {
      errors.phone = 'Invalid phone number';
    }

    if (!bookingForm.date) {
      errors.date = 'Date is required';
    } else if (selectedDate < today) {
      errors.date = 'Cannot book for past dates';
    }

    if (!bookingForm.time) {
      errors.time = 'Time is required';
    }

    return errors;
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    const errors = validateBookingForm();

    if (Object.keys(errors).length > 0) {
      setBookingErrors(errors);
      return;
    }

    // Create and open WhatsApp link
    const whatsappUrl = formatWhatsAppMessage('booking', bookingForm);
    window.location.href = whatsappUrl; // Direct redirect instead of new tab

    // Reset form and errors
    setBookingForm({
      name: '',
      email: '',
      phone: '',
      date: '',
      time: '',
      guests: '2',
      specialRequests: ''
    });
    setBookingErrors({});
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      {/* Navigation Bar */}
      <nav className="bg-transparent absolute w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <h1 className="text-3xl font-cursive text-white cursor-pointer" onClick={() => handleNavigation('home')}>74 Lounge Bar</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => handleNavigation('home')} className="text-white hover:text-primary">HOME</button>
              <button onClick={() => handleNavigation('menu')} className="text-white hover:text-primary">MENU</button>
              <button onClick={() => handleNavigation('about')} className="text-white hover:text-primary">ABOUT</button>
              <button onClick={() => handleNavigation('book')} className="text-white hover:text-primary">BOOK TABLE</button>
            </div>
            <div className="flex items-center space-x-6">
              <FaUser className="text-white hover:text-primary cursor-pointer w-5 h-5" />
              <div className="relative">
                <FaShoppingCart 
                  className="text-white hover:text-primary cursor-pointer w-5 h-5"
                  onClick={() => setShowCart(!showCart)}
                />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <FaSearch 
                className="text-white hover:text-primary cursor-pointer w-5 h-5"
                onClick={() => setShowSearch(!showSearch)}
              />
              <button 
                onClick={() => handleNavigation('menu')}
                className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary/90"
              >
                Order Online
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-[#222] p-6 rounded-xl w-full max-w-2xl mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-xl font-semibold">Search Menu</h2>
              <button onClick={() => setShowSearch(false)} className="text-white hover:text-primary">
                <FaTimes />
              </button>
            </div>
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search for dishes..."
                className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
              />
            </div>
            <div className="max-h-96 overflow-y-auto">
              {searchQuery && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map(item => (
                    <div key={item.id} className="bg-[#1a1a1a] p-4 rounded-lg flex items-center space-x-4">
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-full object-cover" />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{item.name}</h3>
                        <p className="text-gray-400 text-sm">{item.category}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-primary font-bold">E{item.price}</span>
                          <button
                            onClick={() => {
                              addToCart(item);
                              setShowSearch(false);
                            }}
                            className="bg-primary text-white px-3 py-1 rounded-full text-sm hover:bg-primary/90"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Cart Sidebar */}
      {showCart && (
        <div className="fixed right-0 top-0 h-full w-96 bg-secondary z-50 shadow-lg">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-white text-xl font-semibold">Your Cart</h2>
                <button onClick={() => setShowCart(false)} className="text-white hover:text-primary">
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cartItems.length === 0 ? (
                <p className="text-gray-400 text-center">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="bg-[#1a1a1a] p-4 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-full object-cover" />
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{item.name}</h3>
                          <p className="text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="text-white hover:text-primary"
                          >
                            <FaMinus />
                          </button>
                          <span className="text-white px-2">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="text-white hover:text-primary"
                          >
                            <FaPlus />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-400 ml-2"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t border-gray-700">
                <textarea
                  placeholder="Add special instructions..."
                  className="w-full bg-[#1a1a1a] text-white p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  rows="2"
                />
                <div className="flex justify-between items-center text-white mb-4">
                  <span className="font-semibold">Total:</span>
                  <span className="text-primary font-bold text-xl">${cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors duration-300"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div id="home" className="relative h-screen hero-section">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-6xl font-cursive mb-6">Fast Food Restaurant</h1>
            <p className="text-gray-300 mb-8">
              Doloremque, itaque aperiam facilis rerum, commodi, temporibus sapiente ad
              mollitia laborum quam quisquam esse error unde. Tempora ex doloremque, labore,
              sunt repellat dolore, iste magni quos nihil ducimus libero ipsam.
            </p>
            <button 
              onClick={() => handleNavigation('menu')}
              className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90"
            >
              Order Now
            </button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-primary"></div>
          <div className="w-3 h-3 rounded-full bg-white/50"></div>
          <div className="w-3 h-3 rounded-full bg-white/50"></div>
        </div>
      </div>

      {/* About Us Section */}
      <div id="about" className="py-20 bg-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-cursive text-white mb-6">About Us</h2>
              <p className="text-gray-300 leading-relaxed">
                Welcome to 74 Lounge Bar, where culinary excellence meets modern ambiance. 
                Established with a passion for exceptional dining experiences, we take pride 
                in serving you the finest selection of dishes crafted with premium ingredients.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Our chefs combine traditional techniques with innovative approaches to create 
                memorable flavors that will tantalize your taste buds. Every dish is prepared 
                with attention to detail and presented with artistic flair.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-[#1a1a1a] p-6 rounded-xl text-center">
                  <h3 className="text-primary text-4xl font-bold mb-2">10+</h3>
                  <p className="text-white">Years of Experience</p>
                </div>
                <div className="bg-[#1a1a1a] p-6 rounded-xl text-center">
                  <h3 className="text-primary text-4xl font-bold mb-2">50+</h3>
                  <p className="text-white">Menu Items</p>
                </div>
                <div className="bg-[#1a1a1a] p-6 rounded-xl text-center">
                  <h3 className="text-primary text-4xl font-bold mb-2">24/7</h3>
                  <p className="text-white">Fast Service</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                  alt="Restaurant interior" 
                  className="w-full h-[600px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-primary rounded-xl -z-10"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div id="menu" className="py-20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-cursive text-center text-white mb-12">Our Menu</h2>
          
          {/* Category Filters */}
          <div className="flex justify-center space-x-4 mb-12">
            {menuCategories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-3xl transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-[#222] text-white'
                    : 'text-white hover:bg-[#222]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-[#222] rounded-xl overflow-hidden transform transition-transform duration-300 hover:scale-105">
                <div className="bg-white p-8 flex justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-48 h-48 object-cover rounded-full"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{item.name}</h3>
                  <p className="text-gray-400 mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary font-bold text-xl">${item.price}</span>
                    <button 
                      onClick={() => addToCart(item)}
                      className="bg-primary p-3 rounded-full hover:bg-primary/90 transform transition-transform duration-300 hover:scale-110"
                    >
                      <FaShoppingCart className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Updated Book Table Section */}
      <div id="book" className="py-20 bg-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h2 className="text-4xl font-cursive text-center text-white mb-12">Book A Table</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-[#222] p-8 rounded-xl">
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Name"
                      className={`w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        bookingErrors.name ? 'ring-2 ring-red-500' : ''
                      }`}
                      value={bookingForm.name}
                      onChange={(e) => {
                        setBookingForm({...bookingForm, name: e.target.value});
                        setBookingErrors({...bookingErrors, name: ''});
                      }}
                    />
                    {bookingErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{bookingErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className={`w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        bookingErrors.email ? 'ring-2 ring-red-500' : ''
                      }`}
                      value={bookingForm.email}
                      onChange={(e) => {
                        setBookingForm({...bookingForm, email: e.target.value});
                        setBookingErrors({...bookingErrors, email: ''});
                      }}
                    />
                    {bookingErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{bookingErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className={`w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        bookingErrors.phone ? 'ring-2 ring-red-500' : ''
                      }`}
                      value={bookingForm.phone}
                      onChange={(e) => {
                        setBookingForm({...bookingForm, phone: e.target.value});
                        setBookingErrors({...bookingErrors, phone: ''});
                      }}
                    />
                    {bookingErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{bookingErrors.phone}</p>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                      value={bookingForm.guests}
                      onChange={(e) => setBookingForm({...bookingForm, guests: e.target.value})}
                    >
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                      ))}
                    </select>
                    <FaUserFriends className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="relative">
                      <input
                        type="date"
                        className={`w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                          bookingErrors.date ? 'ring-2 ring-red-500' : ''
                        }`}
                        value={bookingForm.date}
                        onChange={(e) => {
                          setBookingForm({...bookingForm, date: e.target.value});
                          setBookingErrors({...bookingErrors, date: ''});
                        }}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <FaCalendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    {bookingErrors.date && (
                      <p className="text-red-500 text-sm mt-1">{bookingErrors.date}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="time"
                      className={`w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        bookingErrors.time ? 'ring-2 ring-red-500' : ''
                      }`}
                      value={bookingForm.time}
                      onChange={(e) => {
                        setBookingForm({...bookingForm, time: e.target.value});
                        setBookingErrors({...bookingErrors, time: ''});
                      }}
                    />
                    {bookingErrors.time && (
                      <p className="text-red-500 text-sm mt-1">{bookingErrors.time}</p>
                    )}
                  </div>
                </div>

                <textarea
                  placeholder="Special Requests (Optional)"
                  className="w-full bg-[#1a1a1a] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows="3"
                  value={bookingForm.specialRequests}
                  onChange={(e) => setBookingForm({...bookingForm, specialRequests: e.target.value})}
                />

                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Book Now</span>
                </button>
              </form>
            </div>
            
            <div className="space-y-8">
              <div className="bg-[#222] p-6 rounded-xl flex items-start space-x-4">
                <div className="bg-primary p-3 rounded-full">
                  <FaPhone className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-semibold mb-2">Phone</h3>
                  <p className="text-gray-400">+1 234 567 8900</p>
                  <p className="text-gray-400">+1 234 567 8901</p>
                </div>
              </div>
              
              <div className="bg-[#222] p-6 rounded-xl flex items-start space-x-4">
                <div className="bg-primary p-3 rounded-full">
                  <FaClock className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-semibold mb-2">Opening Hours</h3>
                  <p className="text-gray-400">Monday - Friday: 10:00 AM - 11:00 PM</p>
                  <p className="text-gray-400">Saturday - Sunday: 10:00 AM - 12:00 AM</p>
                </div>
              </div>
              
              <div className="bg-[#222] p-6 rounded-xl flex items-start space-x-4">
                <div className="bg-primary p-3 rounded-full">
                  <FaMapMarkerAlt className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-semibold mb-2">Location</h3>
                  <p className="text-gray-400">123 Gourmet Street</p>
                  <p className="text-gray-400">Culinary District, Food City 12345</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 