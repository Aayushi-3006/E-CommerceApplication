(function(){
	"use strict";

	// ----- Authentication Protection -----
	// Check if user is authenticated before loading the application
	function checkAuthentication() {
		console.log('checkAuthentication called');
		console.log('window.Auth:', typeof window.Auth);
		
		// Wait for Auth module to be available
		if (typeof window.Auth === 'undefined') {
			console.log('Auth module not loaded yet, waiting...');
			// If Auth module is not loaded yet, wait a bit and try again
			setTimeout(checkAuthentication, 100);
			return;
		}
		
		console.log('Auth module loaded, checking user...');
		const user = window.Auth.getCurrentUser();
		console.log('Current user:', user);
		
		if (!user) {
			// User is not authenticated, redirect to login page
			console.log('User not authenticated, redirecting to login page');
			window.location.href = 'login.html?next=' + encodeURIComponent(window.location.pathname);
			return;
		}
		
		// User is authenticated, initialize the application
		console.log('User authenticated:', user);
		initializeApplication();
	}

	function initializeApplication() {
		// Reload user's cart
		reloadUserCart();
		
		// Clean up any corrupted cart data on initialization
		saveCart(); // This will save the cleaned cart data
		
		// Initialize wishlist count
		updateWishlistCount();
		
		// Initialize the application
		initTheme();
		setupThreeDotsMenu();
		renderCategories();
		setupCategoryHandlers();
		setupEventHandlers();
		setupPriceRangeSlider();
		initBannerCarousel();
		renderGrid();
		renderCart();
		updateWishlistUI();
		renderAuthArea();
	}

	// ----- Data -----

	window.products = [
		// Electronics
		{ id:"p1", title:"iPhone 15 Pro", category:"Electronics", brand:"Apple", price:82917, originalPrice:91217, rating:4.8, reviews: 2341, image:"https://tse1.explicit.bing.net/th/id/OIP.8ZDOKygJXbUYxqwg0JGLNgHaJG?rs=1&pid=ImgDetMain&o=7&rm=3", description:"Latest iPhone with titanium design, A17 Pro chip, and advanced camera system.", features:["Titanium Design", "A17 Pro Chip", "48MP Camera", "USB-C"] },
		{ id:"p2", title:"Samsung Galaxy S24", category:"Electronics", brand:"Samsung", price:66317, originalPrice:74617, rating:4.6, reviews: 1892, image:"https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6570/6570396_sd.jpg", description:"Premium Android smartphone with AI-powered features and exceptional camera quality.", features:["AI Features", "200MP Camera", "120Hz Display", "Wireless Charging"] },
		{ id:"p3", title:"MacBook Air M3", category:"Computers", brand:"Apple", price:99517, originalPrice:107817, rating:4.7, reviews: 1456, image:"https://cdn.mos.cms.futurecdn.net/gbho6bhS4xVL3gU2MVYx7U.jpg", description:"Ultra-thin laptop with M3 chip, 13-inch Liquid Retina display, and all-day battery life.", features:["M3 Chip", "13-inch Display", "18h Battery", "8GB RAM"] },
		{ id:"p4", title:"Dell XPS 13", category:"Computers", brand:"Dell", price:82917, originalPrice:99517, rating:4.4, reviews: 892, image:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=400&auto=format&fit=crop", description:"Premium Windows laptop with InfinityEdge display and Intel Core i7 processor.", features:["InfinityEdge Display", "Intel i7", "16GB RAM", "512GB SSD"] },
		{ id:"p5", title:"AirPods Pro 2", category:"Electronics", brand:"Apple", price:20667, originalPrice:24817, rating:4.7, reviews: 892, image:"https://www.iphoned.nl/wp-content/uploads/2025/09/airpods-pro-2-vs-airpods-pro-3.jpg", description:"Premium wireless earbuds with active noise cancellation and spatial audio.", features:["Noise Cancellation", "Spatial Audio", "6h Battery", "Wireless Charging"] },
		
		// Fashion - Men's Clothing
		{ id:"p6", title:"Men's Designer Jeans", category:"Fashion", brand:"Levi's", price:7469, originalPrice:9960, rating:4.3, reviews: 567, image:"https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=400&auto=format&fit=crop", description:"Classic fit men's jeans made from premium denim with comfortable stretch.", features:["Premium Denim", "Classic Fit", "Comfortable Stretch", "Machine Washable"] },
		{ id:"p7", title:"Men's Casual Shirt", category:"Fashion", brand:"Nike", price:4149, originalPrice:5809, rating:4.3, reviews: 567, image:"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=400&auto=format&fit=crop", description:"Comfortable men's cotton shirt perfect for casual wear.", features:["100% Cotton", "Comfortable Fit", "Machine Washable", "Multiple Colors"] },
		{ id:"p8", title:"Men's Leather Jacket", category:"Fashion", brand:"Zara", price:16599, originalPrice:24899, rating:4.2, reviews: 445, image:"https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400&auto=format&fit=crop", description:"Genuine leather men's jacket with modern fit and timeless style.", features:["Genuine Leather", "Modern Fit", "Timeless Style", "Inner Lining"] },
		
		// Fashion - Women's Clothing
		{ id:"p27", title:"Women's Summer Dress", category:"Fashion", brand:"Zara", price:6639, originalPrice:8299, rating:4.4, reviews: 892, image:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop", description:"Lightweight women's summer dress with floral pattern.", features:["Lightweight", "Floral Pattern", "Comfortable", "Machine Washable"] },
		{ id:"p28", title:"Women's Blouse", category:"Fashion", brand:"H&M", price:3319, originalPrice:4979, rating:4.2, reviews: 456, image:"https://cdnd.lystit.com/photos/2013/04/05/milly-emerald-ruffled-silk-blouse-product-1-7660508-362749259.jpeg", description:"Elegant women's blouse perfect for office or casual wear.", features:["Elegant Design", "Office Ready", "Comfortable", "Easy Care"] },
		{ id:"p29", title:"Women's Jeans", category:"Fashion", brand:"Levi's", price:6639, originalPrice:8299, rating:4.3, reviews: 678, image:"https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&auto=format&fit=crop", description:"Comfortable women's jeans with perfect fit and stretch.", features:["Perfect Fit", "Stretch Denim", "Comfortable", "Stylish"] },
		
		// Fashion - Men's Shoes
		{ id:"p32", title:"Men's Nike Air Max", category:"Fashion", brand:"Nike", price:129.99, originalPrice:160.00, rating:4.5, reviews: 1234, image:"https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_900,h_900/global/311767/01/sv01/fnd/IND/fmt/png/Galaxis-Pro-Men's-Performance-Boost-Running-Shoes", description:"Iconic men's sneakers with visible Air Max cushioning and breathable mesh upper.", features:["Air Max Cushioning", "Breathable Mesh", "Durable Outsole", "Lightweight"] },
		{ id:"p33", title:"Men's Adidas Sneakers", category:"Fashion", brand:"Adidas", price:89.99, originalPrice:120.00, rating:4.4, reviews: 789, image:"https://www.80scasualclassics.co.uk/images/adidas-350-trainers-white-blue-p10442-64802_medium.jpg", description:"Classic men's sneakers with comfortable fit and durable construction.", features:["Comfortable Fit", "Durable", "Classic Style", "Breathable"] },
		
		// Fashion - Women's Shoes
		{ id:"p34", title:"Women's Nike Air Max", category:"Fashion", brand:"Nike", price:119.99, originalPrice:150.00, rating:4.4, reviews: 654, image:"https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/4ff2fe4a-4f74-4189-82f0-3ea780f9389d/air-max-excee-womens-shoes-jKsgMj.png", description:"Stylish women's sneakers with Air Max cushioning and modern design.", features:["Air Max Cushioning", "Modern Design", "Comfortable", "Stylish"] },
		{ id:"p35", title:"Women's Heels", category:"Fashion", brand:"Zara", price:69.99, originalPrice:99.99, rating:4.2, reviews: 432, image:"https://tse2.mm.bing.net/th/id/OIP.SGS8GnYdd8QHzgC-jmnrJwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", description:"Elegant women's heels perfect for formal occasions.", features:["Elegant Design", "Comfortable Heel", "Formal Style", "Quality Material"] },
		
		// Home & Heels
		{ id:"p9", title:"Smart Coffee Maker", category:"Home & Kitchen", brand:"Breville", price:299.99, originalPrice:399.99, rating:4.6, reviews: 678, image:"https://th.bing.com/th/id/R.0d96f8fcec8375327f460e18b809ee3c?rik=q8YHdG5uEV5yHw&riu=http%3a%2f%2fimages.getprice.com.au%2fproducts%2fBrevilleSmartGrinder.jpg&ehk=l84DIZDXw3qs6HR8tY3MD%2fJlf8dgnuKPuxrboCsLokw%3d&risl=&pid=ImgRaw&r=0", description:"Programmable coffee maker with built-in grinder and precision temperature control.", features:["Built-in Grinder", "Programmable", "Temperature Control", "12-cup Capacity"] },
		{ id:"p10", title:"Air Fryer", category:"Home & Kitchen", brand:"Ninja", price:149.99, originalPrice:199.99, rating:4.4, reviews: 892, image:"https://i5.walmartimages.com/asr/d0da1bdc-ff7d-4735-b920-eab87af86578.d0902b47304e9faf8d6a3363f6b54565.png", description:"Digital air fryer with 4-quart capacity and multiple cooking functions.", features:["4-Quart Capacity", "Digital Display", "Multiple Functions", "Non-stick Basket"] },
		{ id:"p11", title:"Bed Sheet Set", category:"Home & Kitchen", brand:"IKEA", price:49.99, originalPrice:79.99, rating:4.1, reviews: 234, image:"https://www.ikea.com/sg/en/images/products/stenoert-5-piece-bedlinen-set-flower__0882804_pe710152_s5.jpg?f=xxxl", description:"Soft cotton bed sheet set with deep pockets and wrinkle-resistant fabric.", features:["100% Cotton", "Deep Pockets", "Wrinkle Resistant", "Machine Washable"] },
		
		// Books
		{ id:"p12", title:"The Psychology of Money", category:"Books", brand:"Morgan Housel", price:16.99, originalPrice:24.99, rating:4.8, reviews: 3456, image:"https://tse2.mm.bing.net/th/id/OIP.fxjCmo83Pc_DIbmaItlUrgHaFj?rs=1&pid=ImgDetMain&o=7&rm=3", description:"Timeless lessons on wealth, greed, and happiness by Morgan Housel.", features:["Hardcover", "256 Pages", "Financial Wisdom", "Best Seller"] },
		{ id:"p13", title:"Atomic Habits", category:"Books", brand:"James Clear", price:18.99, originalPrice:27.99, rating:4.7, reviews: 2890, image:"https://tse3.mm.bing.net/th/id/OIP.vauFmYohrf8Yp1CpFpOw-wHaLW?rs=1&pid=ImgDetMain&o=7&rm=3", description:"An easy and proven way to build good habits and break bad ones.", features:["Paperback", "320 Pages", "Self-Help", "Award Winning"] },
		
		// Beauty & Personal Care - Skincare
		{ id:"p14", title:"Skincare Set", category:"Beauty & Personal Care", brand:"The Ordinary", price:89.99, originalPrice:120.00, rating:4.5, reviews: 1234, image:"https://img.ricardostatic.ch/images/1f8764ff-dc4f-4288-a901-187f3bf30f37/t_1000x750/the-ordinary-set-niaciamide-hyaluron-caffein-serum-3er-set", description:"Complete skincare routine with cleanser, serum, and moisturizer.", features:["Complete Routine", "Dermatologist Tested", "Cruelty Free", "Fragrance Free"] },
		{ id:"p36", title:"CeraVe Moisturizer", category:"Beauty & Personal Care", brand:"CeraVe", price:24.99, originalPrice:34.99, rating:4.4, reviews: 892, image:"https://merryderma.com.pk/wp-content/uploads/2024/02/CeraVe-Moisturizing-Lotion-16oz.jpg", description:"Daily moisturizing lotion with hyaluronic acid and ceramides.", features:["Hyaluronic Acid", "Ceramides", "Daily Use", "Dermatologist Recommended"] },
		
		// Beauty & Personal Care - Hair Care
		{ id:"p15", title:"Hair Dryer", category:"Beauty & Personal Care", brand:"Dyson", price:399.99, originalPrice:499.99, rating:4.6, reviews: 567, image:"https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/products/hair-care/Q4-Gifting-2021/Supersonic/Gallery/Supersonic-1440x810-Gallery-Image-3.jpg?&cropPathE=desktop&fit=stretch,1&fmt=pjpeg&wid=1920", description:"Supersonic hair dryer with intelligent heat control and fast drying.", features:["Intelligent Heat Control", "Fast Drying", "Lightweight", "Ionic Technology"] },
		{ id:"p37", title:"Hair Straightener", category:"Beauty & Personal Care", brand:"Dyson", price:299.99, originalPrice:399.99, rating:4.5, reviews: 456, image:"https://m.media-amazon.com/images/I/716Aq96MW-L._SL1500_.jpg", description:"Professional hair straightener with ceramic plates and temperature control.", features:["Ceramic Plates", "Temperature Control", "Professional Quality", "Heat Protection"] },
		
		// Beauty & Personal Care - Makeup
		{ id:"p38", title:"Foundation Set", category:"Beauty & Personal Care", brand:"L'Oreal", price:29.99, originalPrice:39.99, rating:4.3, reviews: 678, image:"https://i5.walmartimages.com/seo/L-Oreal-Paris-True-Match-Cream-Foundation-Makeup-W6-Warm-Medium-1-fl-oz_81f83145-96eb-45a6-ad58-de58b3142f8f.26b39abb5ae00a925b8be5b72f5ebcb9.jpeg", description:"Full coverage foundation with natural finish and long-lasting formula.", features:["Full Coverage", "Natural Finish", "Long Lasting", "Multiple Shades"] },
		{ id:"p39", title:"Lipstick Set", category:"Beauty & Personal Care", brand:"MAC", price:49.99, originalPrice:69.99, rating:4.6, reviews: 543, image:"https://tse3.mm.bing.net/th/id/OIP.Y5mRxvii-l4mjdUHUGL4OQHaGZ?rs=1&pid=ImgDetMain&o=7&rm=3", description:"Premium lipstick set with 6 different shades and matte finish.", features:["6 Shades", "Matte Finish", "Premium Quality", "Long Wearing"] },
		{ id:"p46", title:"Eyeshadow Palette", category:"Beauty & Personal Care", brand:"L'Oreal", price:19.99, originalPrice:29.99, rating:4.2, reviews: 432, image:"https://tse2.mm.bing.net/th/id/OIP.KTpMixDDD7dPm7kuFfBo2AHaDf?rs=1&pid=ImgDetMain&o=7&rm=3", description:"12-color eyeshadow palette with matte and shimmer finishes.", features:["12 Colors", "Matte & Shimmer", "Long Lasting", "Blendable"] },
		{ id:"p47", title:"Mascara", category:"Beauty & Personal Care", brand:"MAC", price:24.99, originalPrice:34.99, rating:4.4, reviews: 321, image:"https://n.nordstrommedia.com/id/sr3/64ff9162-58c8-4f1a-915c-6a2523668bc7.jpeg?crop=pad&pad_color=FFF&format=jpeg&w=780&h=1196s", description:"Volumizing mascara for dramatic lashes with long-lasting formula.", features:["Volumizing", "Long Lasting", "Dramatic Look", "Waterproof"] },
		
		// Beauty & Personal Care - Personal Care
		{ id:"p48", title:"Electric Razor", category:"Beauty & Personal Care", brand:"Gillette", price:89.99, originalPrice:129.99, rating:4.3, reviews: 567, image:"https://th.bing.com/th/id/OIP.N1YurH-vka7u2I6m6iUY2AHaHa?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3", description:"Advanced electric razor with precision trimmer and wet/dry use.", features:["Precision Trimmer", "Wet/Dry Use", "Rechargeable", "Comfortable"] },
		{ id:"p49", title:"Shaving Cream", category:"Beauty & Personal Care", brand:"Gillette", price:8.99, originalPrice:12.99, rating:4.1, reviews: 234, image:"https://tse4.mm.bing.net/th/id/OIP.kqYnm8m7hsoWzugVxFo6JgAAAA?rs=1&pid=ImgDetMain&o=7&rm=3", description:"Rich lathering shaving cream for smooth, comfortable shave.", features:["Rich Lather", "Smooth Shave", "Moisturizing", "Classic Scent"] },
		
		// Fitness
		{ id:"p16", title:"Yoga Mat", category:"Fitness", brand:"Lululemon", price:78.00, originalPrice:98.00, rating:4.4, reviews: 678, image:"https://tse1.explicit.bing.net/th/id/OIP.qTj8NcR0n0MeLNsgV4UvZAHaI4?rs=1&pid=ImgDetMain&o=7&rm=3", description:"Premium yoga mat with excellent grip and cushioning for all yoga practices.", features:["Premium Material", "Excellent Grip", "5mm Thickness", "Lightweight"] },
		{ id:"p17", title:"Dumbbell Set", category:"Fitness", brand:"Bowflex", price:199.99, originalPrice:299.99, rating:4.3, reviews: 445, image:"https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=400&auto=format&fit=crop", description:"Adjustable dumbbell set with weight range from 5 to 52.5 pounds.", features:["Adjustable Weights", "Space Saving", "Quick Change", "Durable"] },
		
		// Additional Electronics (Mobiles moved to Electronics)
		{ id:"p18", title:"OnePlus 12", category:"Electronics", brand:"OnePlus", price:699.99, originalPrice:799.99, rating:4.5, reviews: 892, image:"https://www.oneplus.com/content/dam/oasis/page/2024/global/product/waffle/share.jpg", description:"Flagship Android smartphone with Snapdragon 8 Gen 3 and 100W fast charging.", features:["Snapdragon 8 Gen 3", "100W Charging", "144Hz Display", "50MP Camera"] },
		{ id:"p19", title:"Pixel 8 Pro", category:"Electronics", brand:"Google", price:899.99, originalPrice:999.99, rating:4.4, reviews: 567, image:"https://tse4.mm.bing.net/th/id/OIP.7WBYynKvCAbHmdo0F4GP8QHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", description:"Google's flagship phone with advanced AI features and exceptional camera system.", features:["Google AI", "Advanced Camera", "7 Years Updates", "Titan Security"] },
		
		
		// Additional Electronics for better categorization
		{ id:"p22", title:"Sony PlayStation 5", category:"Electronics", brand:"Sony", price:499.99, originalPrice:599.99, rating:4.8, reviews: 2345, image:"https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=400&auto=format&fit=crop", description:"Next-generation gaming console with 4K gaming and ray tracing.", features:["4K Gaming", "Ray Tracing", "SSD Storage", "DualSense Controller"] },
		{ id:"p23", title:"Apple Watch Series 9", category:"Electronics", brand:"Apple", price:399.99, originalPrice:449.99, rating:4.7, reviews: 1789, image:"https://www.apple.com/v/apple-watch-series-9/c/images/meta/watch_series_9_gps_lte__eopecolsebyq_og.png", description:"Smartwatch with health monitoring and fitness tracking features.", features:["Health Monitoring", "Fitness Tracking", "GPS", "Water Resistant"] },
		{ id:"p24", title:"Bose QuietComfort 45", category:"Electronics", brand:"Bose", price:329.99, originalPrice:379.99, rating:4.6, reviews: 1234, image:"https://tse1.mm.bing.net/th/id/OIP.h5F0Bz4MtwU72AZBWFQeXgHaGT?rs=1&pid=ImgDetMain&o=7&rm=3", description:"Premium noise-canceling headphones with exceptional sound quality.", features:["Noise Canceling", "24h Battery", "Comfortable", "Premium Sound"] },
		
		// Fashion - Men's Watches
		{ id:"p30", title:"Men's Watch", category:"Fashion", brand:"Apple", price:399.99, originalPrice:449.99, rating:4.7, reviews: 1789, image:"https://th.bing.com/th/id/R.e397f788b2d3bfa17ba9a679e5dd10a7?rik=iwhniOaXIIhvww&riu=http%3a%2f%2fwww.bhphotovideo.com%2fimages%2fimages2500x2500%2fapple_mj2x2ll_a_watch_sport_smartwatch_38mm_1187194.jpg&ehk=eOf8xtWwoF1fgsEnYQ7Mtu8zDfvnfn4AR8bDjh%2bevBs%3d&risl=&pid=ImgRaw&r=0", description:"Smart men's watch with health monitoring and fitness tracking.", features:["Health Monitoring", "Fitness Tracking", "GPS", "Water Resistant"] },
		{ id:"p40", title:"Men's Sports Watch", category:"Fashion", brand:"Samsung", price:299.99, originalPrice:399.99, rating:4.5, reviews: 1234, image:"https://cdn.mos.cms.futurecdn.net/9xfFUKxVDnxS8zufDvwhNN-970-80.jpg", description:"Advanced sports watch with GPS and heart rate monitoring.", features:["GPS", "Heart Rate Monitor", "Water Resistant", "Sports Tracking"] },
		
		// Fashion - Women's Watches
		{ id:"p31", title:"Women's Watch", category:"Fashion", brand:"Apple", price:399.99, originalPrice:449.99, rating:4.7, reviews: 1789, image:"https://tse1.mm.bing.net/th/id/OIP.nOdkuYUrxwqt5gi8YFJKUAAAAA?rs=1&pid=ImgDetMain&o=7&rm=3", description:"Smart women's watch with health monitoring and fitness tracking.", features:["Health Monitoring", "Fitness Tracking", "GPS", "Water Resistant"] },
		{ id:"p41", title:"Women's Elegant Watch", category:"Fashion", brand:"Samsung", price:249.99, originalPrice:349.99, rating:4.4, reviews: 987, image:"https://rukminim1.flixcart.com/image/1664/1664/smartwatch/t/p/y/sm-r7320zdainu-samsung-original-imaeh28gt6ggatbc.jpeg?q=90", description:"Elegant women's watch with classic design and smart features.", features:["Elegant Design", "Smart Features", "Classic Style", "Comfortable"] },
		
		// Home & Kitchen - Furniture
		{ id:"p42", title:"Modern Sofa", category:"Home & Kitchen", brand:"IKEA", price:599.99, originalPrice:799.99, rating:4.3, reviews: 456, image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400&auto=format&fit=crop", description:"Modern 3-seater sofa with comfortable cushions and contemporary design.", features:["3-Seater", "Comfortable", "Modern Design", "Easy Assembly"] },
		{ id:"p43", title:"Dining Table", category:"Home & Kitchen", brand:"Ashley", price:399.99, originalPrice:599.99, rating:4.2, reviews: 234, image:"https://th.bing.com/th/id/OIP.dO3kzCj4ZmC4FLZWrsg9qQAAAA?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3", description:"Solid wood dining table seating 6 people with elegant finish.", features:["Solid Wood", "Seats 6", "Elegant Finish", "Durable"] },
		
		// Books - Fiction
		{ id:"p44", title:"The Great Gatsby", category:"Books", brand:"Penguin Random House", price:12.99, originalPrice:18.99, rating:4.6, reviews: 2345, image:"https://cdn.penguin.co.uk/dam-assets/books/9780241341469/9780241341469-jacket-large.jpg", description:"Classic American novel by F. Scott Fitzgerald.", features:["Classic Literature", "Paperback", "192 Pages", "Timeless"] },
		{ id:"p45", title:"1984", category:"Books", brand:"Penguin Random House", price:14.99, originalPrice:22.99, rating:4.7, reviews: 3456, image:"https://http2.mlstatic.com/D_NQ_NP_904328-MLC31017915943_062019-O.webp", description:"Dystopian novel by George Orwell.", features:["Dystopian Fiction", "Paperback", "328 Pages", "Thought Provoking"] },
		
		// Additional products for better brand coverage
		{ id:"p54", title:"Running Shoes", category:"Fitness", brand:"Nike", price:129.99, originalPrice:159.99, rating:4.4, reviews: 567, image:"https://assetscdn1.paytm.com/images/catalog/product/F/FO/FOONIKE-RUNALLDSMAR262972E61C911/0..jpg", description:"Lightweight running shoes with responsive cushioning and breathable upper.", features:["Responsive Cushioning", "Breathable", "Lightweight", "Durable"] },
		{ id:"p55", title:"Workout Leggings", category:"Fitness", brand:"Lululemon", price:89.99, originalPrice:119.99, rating:4.6, reviews: 789, image:"https://media1.popsugar-assets.com/files/thumbor/tp5wMzEoF80bCFApP022e6nJtis=/fit-in/350x350/filters:format_auto():quality(70):extract_cover():upscale():fill(ffffff)/2020/05/20/797/n/1922729/c391d475922cc99d_LW5CQNS_042628_1.webp", description:"High-performance leggings with moisture-wicking fabric and four-way stretch.", features:["Moisture Wicking", "Four-Way Stretch", "High Waist", "Squat Proof"] },
		{ id:"p56", title:"Creatine Supplement", category:"Fitness", brand:"Optimum Nutrition", price:29.99, originalPrice:39.99, rating:4.3, reviews: 456, image:"https://tse4.mm.bing.net/th/id/OIP.354SuSfwzcc8CBWBH3MT4AHaHa?rs=1&pid=ImgDetMain&o=7&rm=3", description:"Pure creatine monohydrate for enhanced strength and power.", features:["Pure Creatine", "Enhanced Strength", "Unflavored", "Easy Mixing"] }
	];

	// ----- State -----
	let state = {
		searchQuery: "",
		category: "All",
		selectedBrands: [],
		priceRange: { min: 0, max: 150000 }, // Price range in INR
		cart: loadCart(),
		wishlist: loadWishlist(),
		recentlyViewed: loadRecentlyViewed(),
		notifications: loadNotifications(),
		userAddresses: loadUserAddresses(),
		paymentMethods: loadPaymentMethods(),
		orders: loadOrders()
	};

	function loadCart(){
		try{
		const currentUser = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		const cartKey = currentUser ? `cart_${currentUser.email}` : "cart";
			const raw = localStorage.getItem(cartKey);
			const cart = raw ? JSON.parse(raw) : {};
			
			// Clean up any corrupted data
			Object.keys(cart).forEach(id => {
				const item = cart[id];
				if (!item || typeof item !== 'object') {
					delete cart[id];
					return;
				}
				
				// Ensure required fields exist and are valid
				if (!item.id || !item.title || !item.price || item.qty === undefined) {
					delete cart[id];
					return;
				}
				
				// Ensure qty and price are valid numbers
				item.qty = Number(item.qty) || 0;
				item.price = Number(item.price) || 0;
				
				if (isNaN(item.qty) || isNaN(item.price) || item.qty < 0 || item.price < 0) {
					delete cart[id];
					return;
				}
			});
			
			return cart;
		}catch(err){ return {}; }
	}
	function saveCart(){
		const currentUser = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		const cartKey = currentUser ? `cart_${currentUser.email}` : "cart";
		localStorage.setItem(cartKey, JSON.stringify(state.cart));
	}
	
	function loadWishlist(){
		try{
			const raw = localStorage.getItem("wishlist");
			return raw ? JSON.parse(raw) : {};
		}catch(err){ return {}; }
	}
	function saveWishlist(){
		localStorage.setItem("wishlist", JSON.stringify(state.wishlist));
	}

	function loadRecentlyViewed(){
		try{
			const raw = localStorage.getItem("recentlyViewed");
			return raw ? JSON.parse(raw) : [];
		}catch(err){ return []; }
	}
	function saveRecentlyViewed(){
		localStorage.setItem("recentlyViewed", JSON.stringify(state.recentlyViewed));
	}

	function loadNotifications(){
		try{
			const raw = localStorage.getItem("notifications");
			return raw ? JSON.parse(raw) : [
				{
					id: "n1",
					title: "Order Confirmed",
					message: "Your order #ORD-123456 has been confirmed and will be shipped soon.",
					type: "order",
					read: false,
					timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
				},
				{
					id: "n2",
					title: "Flash Sale Alert",
					message: "Get up to 70% OFF on Electronics! Limited time offer.",
					type: "promotion",
					read: false,
					timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
				},
				{
					id: "n3",
					title: "New Arrivals",
					message: "Check out the latest products in our Fitness category.",
					type: "product",
					read: false,
					timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
				}
			];
		}catch(err){ return []; }
	}
	function saveNotifications(){
		localStorage.setItem("notifications", JSON.stringify(state.notifications));
	}

	function loadUserAddresses(){
		try{
			const raw = localStorage.getItem("userAddresses");
			return raw ? JSON.parse(raw) : [
				{
					id: "addr1",
					type: "home",
					name: "John Doe",
					address: "123 Main Street, Apt 4B",
					city: "New York",
					state: "NY",
					zip: "10001",
					phone: "+1 (555) 123-4567",
					isDefault: true
				}
			];
		}catch(err){ return []; }
	}
	function saveUserAddresses(){
		localStorage.setItem("userAddresses", JSON.stringify(state.userAddresses));
	}

	function loadPaymentMethods(){
		try{
			const raw = localStorage.getItem("paymentMethods");
			return raw ? JSON.parse(raw) : [
				{
					id: "pm1",
					type: "card",
					last4: "1234",
					brand: "Visa",
					expiry: "12/25",
					isDefault: true
				}
			];
		}catch(err){ return []; }
	}
	function savePaymentMethods(){
		localStorage.setItem("paymentMethods", JSON.stringify(state.paymentMethods));
	}

	function loadOrders(){
		try{
			const raw = localStorage.getItem("orders");
			const orders = raw ? JSON.parse(raw) : [];
			console.log('=== LOAD ORDERS DEBUG ===');
			console.log('Raw localStorage orders:', raw);
			console.log('Parsed orders:', orders);
			console.log('Orders count:', orders.length);
			console.log('=== END LOAD ORDERS DEBUG ===');
			return orders;
		}catch(err){ 
			console.log('Error loading orders:', err);
			return []; 
		}
	}
	function saveOrders(){
		console.log('=== SAVE ORDERS DEBUG ===');
		console.log('Saving orders:', state.orders);
		console.log('Orders count:', state.orders.length);
		localStorage.setItem("orders", JSON.stringify(state.orders));
		console.log('Orders saved to localStorage');
		console.log('Verification - localStorage orders:', localStorage.getItem('orders'));
		console.log('=== END SAVE ORDERS DEBUG ===');
	}

	// ----- Elements -----
	const appRoot = document.getElementById("app");
	appRoot.innerHTML = `
		<header class="header">
				<div class="header-inner container">
				<div class="brand" aria-label="Brand">
					<div class="brand-logo" aria-hidden="true">
						<svg width="32" height="32" viewBox="0 0 32 32" fill="none">
							<rect width="32" height="32" rx="8" fill="url(#gradient)"/>
							<path d="M8 12h16v2H8v-2zm0 4h16v2H8v-2zm0 4h12v2H8v-2z" fill="white"/>
							<defs>
								<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
									<stop offset="0%" style="stop-color:#6ea8fe"/>
									<stop offset="100%" style="stop-color:#9b8cff"/>
								</linearGradient>
							</defs>
						</svg>
					</div>
					<div class="brand-content">
						<div class="brand-title">ShopHub</div>
						<div class="brand-subtitle">Premium Shopping Experience</div>
					</div>
				</div>
				<div class="header-center">
					<div class="search-container">
						<div class="search">
							<span class="search-icon">🔍</span>
							<input id="search" type="search" placeholder="Search for products, brands and more..." autocomplete="off" aria-label="Search products">
							<button class="search-btn">Search</button>
						</div>
					</div>
				</div>
				<div class="header-actions">
					<button id="theme-toggle" class="theme-btn" title="Toggle theme">
						<span class="theme-icon">🌙</span>
					</button>
					<div id="auth-area" class="auth-area"></div>
					<button id="open-wishlist" class="action-btn wishlist-header-btn" aria-haspopup="dialog" aria-controls="wishlist-drawer">
						<span class="btn-icon">♡</span>
						<span class="btn-text">Wishlist</span>
						<span class="wishlist-count" id="wishlist-count">0</span>
					</button>
					<button id="open-cart" class="action-btn cart-btn" aria-haspopup="dialog" aria-controls="cart-drawer">
						<span class="btn-icon">🛒</span>
						<span class="btn-text">Cart</span>
						<span class="cart-count" id="cart-count">0</span>
					</button>
					<!-- Three dots menu -->
					<div class="three-dots-menu">
						<button id="three-dots-toggle" class="three-dots-btn" title="More options">
							<span class="dots-icon">⋯</span>
						</button>
						<div id="three-dots-dropdown" class="three-dots-dropdown">
							<div class="dropdown-section">
								<div class="dropdown-section-title">Account</div>
								<a href="#" class="dropdown-item" data-action="profile">
									<span class="dropdown-icon">👤</span>
									<span class="dropdown-text">Your Profile</span>
								</a>
							</div>
							
							<div class="dropdown-section">
								<div class="dropdown-section-title">Shopping</div>
								<a href="#" class="dropdown-item" data-action="notifications">
									<span class="dropdown-icon">🔔</span>
									<span class="dropdown-text">Notifications</span>
									<span class="notification-badge" id="notification-count">3</span>
								</a>
								<a href="#" class="dropdown-item" data-action="recommendations">
									<span class="dropdown-icon">💡</span>
									<span class="dropdown-text">Recommendations</span>
								</a>
								<a href="#" class="dropdown-item" data-action="orders">
									<span class="dropdown-icon">📦</span>
									<span class="dropdown-text">My Orders</span>
								</a>
							</div>
							
							<div class="dropdown-section">
								<div class="dropdown-section-title">Support</div>
								<a href="#" class="dropdown-item" data-action="help">
									<span class="dropdown-icon">❓</span>
									<span class="dropdown-text">Help & Support</span>
								</a>
								<a href="#" class="dropdown-item" data-action="view-feedback">
									<span class="dropdown-icon">💬</span>
									<span class="dropdown-text">Feedback</span>
								</a>
							</div>
							
							<div class="dropdown-section">
								<div class="dropdown-section-title">Preferences</div>
								<a href="#" class="dropdown-item" data-action="settings">
									<span class="dropdown-icon">⚙️</span>
									<span class="dropdown-text">Settings</span>
								</a>
							</div>
							
							<div class="dropdown-section">
								<a href="#" class="dropdown-item" data-action="logout">
									<span class="dropdown-icon">🚪</span>
									<span class="dropdown-text">Logout</span>
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
		<main>

			<!-- Main Content Layout -->
			<div class="main-layout">
				<!-- Sidebar Navigation -->
				<aside class="sidebar-nav">
					<div class="sidebar-header">
						<h3>Shop by Category</h3>
						<button id="reset-filters-btn" class="reset-filters-btn">
							<span class="reset-icon">🔄</span>
							<span class="reset-text">Reset</span>
						</button>
				</div>
					
					<div class="price-range-section">
						<h4 class="filter-title">Price Range</h4>
						<div class="price-range-container">
							<div class="price-inputs">
								<input type="number" id="price-min" class="price-input" placeholder="Min" min="0" max="150000" value="0">
								<span class="price-separator">to</span>
								<input type="number" id="price-max" class="price-input" placeholder="Max" min="0" max="150000" value="150000">
				</div>
							<div class="price-slider-container">
								<div class="price-slider">
									<div class="price-track"></div>
									<input type="range" id="price-slider-min" class="price-slider-input" min="0" max="150000" value="0">
									<input type="range" id="price-slider-max" class="price-slider-input" min="0" max="150000" value="150000">
									<div class="price-slider-progress"></div>
								</div>
								<div class="price-labels">
									<span class="price-label">₹0</span>
									<span class="price-label">₹1,50,000</span>
								</div>
							</div>
						</div>
					</div>
					
					<nav class="category-nav" id="categories-nav"></nav>
				</aside>

				<!-- Main Content Area -->
				<div class="main-content">
			<!-- Category Products -->
			<section class="category-products">
				<div class="container">
					<div class="section-header">
						<h2 class="section-title" id="current-category-title">All Products</h2>
					</div>
					<div id="products-container">
						<div id="grid" class="grid" aria-live="polite"></div>
						<div id="empty" class="empty" hidden>No products match your filters.</div>
					</div>
				</div>
			</section>
				</div>
			</div>
		</main>
		<div id="modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
			<div class="modal-card" role="document">
				<div class="modal-media"><img id="modal-img" alt=""></div>
				<div class="modal-body">
					<h3 id="modal-title"></h3>
					<p id="modal-meta" class="card-meta"></p>
					<div class="modal-actions">
						<button id="modal-close">Close</button>
						<button id="modal-add" class="add-btn">Add to Cart</button>
					</div>
				</div>
			</div>
		</div>
		<aside id="cart-drawer" class="cart-drawer" aria-hidden="true">
			<div class="cart-header">
				<strong>Your Cart</strong>
				<button id="cart-close" aria-label="Close cart">✕</button>
			</div>
			<div id="cart-items" class="cart-items"></div>
			<div class="cart-footer">
				<div class="summary"><span>Total</span><strong id="cart-total">₹0</strong></div>
				<button class="place-order" id="checkout-btn">Place Order</button>
			</div>
		</aside>
		
		<aside id="wishlist-drawer" class="wishlist-drawer" aria-hidden="true">
			<div class="wishlist-header">
				<strong>My Wishlist</strong>
				<button id="wishlist-close" aria-label="Close wishlist">✕</button>
			</div>
			<div id="wishlist-items" class="wishlist-items"></div>
			<div class="wishlist-footer">
				<div class="wishlist-summary">
					<span>Items: </span><strong id="wishlist-total">0</strong>
				</div>
				<button id="empty-wishlist-btn" class="empty-wishlist-btn" style="display:none;">
					<span class="btn-icon">🗑️</span>
					<span class="btn-text">Empty Wishlist</span>
				</button>
			</div>
		</aside>
		<div id="order-confirmation" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
			<div class="modal-card" style="max-width:500px">
				<div class="success-content">
					<div class="success-icon">✅</div>
					<h2>Order Placed Successfully!</h2>
					<p>Your order #<span id="order-number"></span> has been confirmed.</p>
					<p>You will receive an email confirmation shortly.</p>
					<button id="continue-shopping" class="checkout" onclick="clearCartFromContinueShopping()">Continue Shopping</button>
				</div>
			</div>
		</div>
		<div id="orders-modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
			<div class="modal-card" style="max-width:900px;width:95vw;max-height:90vh;overflow-y:auto">
				<div class="modal-header">
					<h2>My Orders</h2>
					<button id="orders-close" aria-label="Close orders">✕</button>
				</div>
				<div class="modal-body">
					<div id="orders-content"></div>
				</div>
			</div>
		</div>

		<!-- Notifications Modal -->
		<div id="notifications-modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
			<div class="modal-card" style="max-width:600px;width:95vw;max-height:80vh;overflow-y:auto">
				<div class="modal-header">
					<h2>Notifications</h2>
					<button id="notifications-close" aria-label="Close notifications">✕</button>
				</div>
				<div class="modal-body">
					<div id="notifications-list"></div>
				</div>
			</div>
		</div>

		<!-- Settings Modal -->
		<div id="settings-modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
			<div class="modal-card" style="max-width:700px;width:95vw;max-height:90vh;overflow-y:auto">
				<div class="modal-header">
					<h2>Settings</h2>
					<button id="settings-close" aria-label="Close settings">✕</button>
				</div>
				<div class="modal-body">
					<div id="settings-content"></div>
				</div>
			</div>
		</div>

		<!-- Help & Support Modal -->
		<div id="help-modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
			<div class="modal-card" style="max-width:800px;width:95vw;max-height:90vh;overflow-y:auto">
				<div class="modal-header">
					<h2>Help & Support</h2>
					<button id="help-close" aria-label="Close help">✕</button>
				</div>
				<div class="modal-body">
					<div id="help-content"></div>
				</div>
			</div>
		</div>

		<!-- Feedback Modal -->
		<div id="feedback-modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
			<div class="modal-card" style="max-width:600px;width:95vw;max-height:90vh;overflow-y:auto">
				<div class="modal-header">
					<h2>Feedback</h2>
					<button id="feedback-close" aria-label="Close feedback">✕</button>
				</div>
				<div class="modal-body">
					<div id="feedback-content"></div>
				</div>
			</div>
		</div>

		<!-- View Feedback Modal -->
		<div id="view-feedback-modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
			<div class="modal-card" style="max-width:800px;width:95vw;max-height:90vh;overflow-y:auto">
				<div class="modal-header">
					<h2>Shared Feedback</h2>
					<button id="view-feedback-close" aria-label="Close view feedback">✕</button>
				</div>
				<div class="modal-body">
					<div id="view-feedback-content"></div>
				</div>
			</div>
		</div>

		<!-- Profile Modal -->
		<div id="profile-modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
			<div class="modal-card" style="max-width:600px;width:95vw;max-height:90vh;overflow-y:auto">
				<div class="modal-header">
					<h2>Your Profile</h2>
					<button id="profile-close" aria-label="Close profile">✕</button>
				</div>
				<div class="modal-body">
					<div id="profile-content"></div>
				</div>
			</div>
		</div>

		<!-- Addresses Modal -->
		<div id="addresses-modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
			<div class="modal-card" style="max-width:700px;width:95vw;max-height:90vh;overflow-y:auto">
				<div class="modal-header">
					<h2>Your Addresses</h2>
					<button id="addresses-close" aria-label="Close addresses">✕</button>
				</div>
				<div class="modal-body">
					<div id="addresses-content"></div>
				</div>
			</div>
		</div>

		<!-- Recently Viewed Modal -->
		<div id="recently-viewed-modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
			<div class="modal-card" style="max-width:900px;width:95vw;max-height:90vh;overflow-y:auto">
				<div class="modal-header">
					<h2>Recently Viewed</h2>
					<button id="recently-viewed-close" aria-label="Close recently viewed">✕</button>
				</div>
				<div class="modal-body">
					<div id="recently-viewed-content"></div>
				</div>
			</div>
		</div>

		<!-- Recommendations Modal -->
		<div id="recommendations-modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
			<div class="modal-card" style="max-width:900px;width:95vw;max-height:90vh;overflow-y:auto">
				<div class="modal-header">
					<h2>Recommended for You</h2>
					<button id="recommendations-close" aria-label="Close recommendations">✕</button>
				</div>
				<div class="modal-body">
					<div id="recommendations-content"></div>
				</div>
			</div>
		</div>

		<!-- Checkout Modal -->
		<div id="checkout-modal" class="modal" role="dialog" aria-modal="true" aria-hidden="true">
			<div class="modal-card checkout-modal-card">
				<div class="checkout-header">
					<h2>Checkout</h2>
					<button id="checkout-close" aria-label="Close checkout">✕</button>
				</div>
				<div class="checkout-content" id="checkout-content">
					<!-- Checkout steps will be rendered here -->
				</div>
			</div>
		</div>

		<!-- Wishlist Drawer -->
		<div id="wishlist-drawer" class="wishlist-drawer" aria-hidden="true">
			<div class="wishlist-header">
				<strong>Wishlist (<span id="wishlist-total">0</span>)</strong>
				<button id="close-wishlist" aria-label="Close wishlist">✕</button>
			</div>
			<div id="wishlist-items" class="wishlist-items">
				<!-- Wishlist items will be populated here -->
			</div>
			<div class="wishlist-footer">
				<div class="wishlist-summary">
					<span>Total Items: <span id="wishlist-count">0</span></span>
				</div>
			</div>
		</div>
	`;

	const gridEl = document.getElementById("grid");
	const emptyEl = document.getElementById("empty");
	const searchEl = document.getElementById("search");
	const authArea = document.getElementById("auth-area");
	const modalEl = document.getElementById("modal");
	const modalImg = document.getElementById("modal-img");
	const modalTitle = document.getElementById("modal-title");
	const modalMeta = document.getElementById("modal-meta");
	const modalClose = document.getElementById("modal-close");
	const modalAdd = document.getElementById("modal-add");
	const cartDrawer = document.getElementById("cart-drawer");
	const cartItemsEl = document.getElementById("cart-items");
	const cartClose = document.getElementById("cart-close");
	const cartCount = document.getElementById("cart-count");
	const cartTotal = document.getElementById("cart-total");
	const openCartBtn = document.getElementById("open-cart");

	let currentModalProduct = null;

	// ----- Auth UI -----
	function renderAuthArea(){
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		console.log('renderAuthArea - user:', user);
		if(!authArea) return;
		if(user){
			console.log('User is authenticated, rendering user info');
			authArea.innerHTML = `
				<div class="user-info">
					<div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
					<div class="user-details">
						<div class="user-name">${user.name}</div>
						<div class="user-role">${user.role||"customer"}</div>
					</div>
					<button id="logout-btn" class="logout-btn" title="Logout">✕</button>
				</div>
			`;
			const ordersBtn = document.getElementById('orders-btn');
			if (ordersBtn) {
				ordersBtn.style.display = 'flex';
			}
			const logoutBtn = authArea.querySelector('#logout-btn');
			logoutBtn?.addEventListener('click', ()=>{ 
				window.Auth.logout(); 
				window.location.href = 'login.html';
			});
		}else{
			console.log('User is not authenticated, showing login/signup buttons');
			authArea.innerHTML = `
				<a class="action-btn login-btn" href="login.html?next=index.html">
					<span class="btn-icon">👤</span>
					<span class="btn-text">Login</span>
				</a>
				<a class="action-btn signup-btn primary" href="signup.html">
					<span class="btn-icon">✍️</span>
					<span class="btn-text">Sign Up</span>
				</a>
			`;
			const ordersBtn = document.getElementById('orders-btn');
			if (ordersBtn) {
				ordersBtn.style.display = 'none';
			}
		}
	}

	// ----- Filters -----
	// Filter functionality is now handled by the Shop by Category section

	// ----- Search -----
	searchEl.addEventListener("input", ()=>{
		state.searchQuery = searchEl.value.trim().toLowerCase();
		renderGrid();
	});

	// ----- Grid -----
	function getFiltered(){
		return products.filter(p=>{
			const matchesCat = state.category === "All" || p.category === state.category;
			const matchesText = !state.searchQuery || 
				p.title.toLowerCase().includes(state.searchQuery) ||
				p.brand.toLowerCase().includes(state.searchQuery) ||
				p.category.toLowerCase().includes(state.searchQuery);
			
			// Handle brand filtering
			let matchesBrands = true;
			if(state.selectedBrands && state.selectedBrands.length > 0) {
				matchesBrands = state.selectedBrands.some(selectedBrand => {
					const brandMatch = p.brand.toLowerCase().includes(selectedBrand.brand.toLowerCase());
					const categoryMatch = selectedBrand.category === "All" || p.category === selectedBrand.category;
					
					// Handle subcategory matching - this is the key fix
					let subcategoryMatch = true;
					if(selectedBrand.subcategory) {
						const title = p.title.toLowerCase();
						const brandName = p.brand.toLowerCase();
						
						// Specific subcategory matching logic
						if(selectedBrand.subcategory === "Smartphones") {
							subcategoryMatch = title.includes('iphone') || title.includes('galaxy') || title.includes('phone') || title.includes('mobile') || title.includes('pixel') || title.includes('oneplus');
						} else if(selectedBrand.subcategory === "Audio") {
							subcategoryMatch = title.includes('airpods') || title.includes('headphone') || title.includes('speaker') || title.includes('audio') || title.includes('earbud');
						} else if(selectedBrand.subcategory === "Wearables") {
							subcategoryMatch = title.includes('watch') || title.includes('fitbit') || title.includes('apple watch') || title.includes('wearable') || title.includes('band');
						} else if(selectedBrand.subcategory === "Computers") {
							subcategoryMatch = title.includes('macbook') || title.includes('laptop') || title.includes('desktop') || title.includes('pc') || title.includes('computer') || title.includes('xps') || title.includes('notebook');
						} else if(selectedBrand.subcategory === "Tablets") {
							subcategoryMatch = title.includes('ipad') || title.includes('tablet') || title.includes('tab');
						} else if(selectedBrand.subcategory === "Gaming") {
							subcategoryMatch = title.includes('gaming') || title.includes('nintendo') || title.includes('playstation') || title.includes('xbox') || title.includes('console');
						} else if(selectedBrand.subcategory === "Cameras") {
							subcategoryMatch = title.includes('camera') || title.includes('canon') || title.includes('nikon') || title.includes('sony') || title.includes('dslr');
						} else if(selectedBrand.subcategory === "Men's Clothing") {
							subcategoryMatch = (title.includes('men') || title.includes('male')) && (title.includes('shirt') || title.includes('pant') || title.includes('jacket') || title.includes('jeans') || title.includes('clothing')) && !title.includes('shoe') && !title.includes('watch');
						} else if(selectedBrand.subcategory === "Women's Clothing") {
							subcategoryMatch = (title.includes('women') || title.includes('female')) && (title.includes('dress') || title.includes('ladies') || title.includes('top') || title.includes('blouse') || title.includes('jeans') || title.includes('clothing')) && !title.includes('shoe') && !title.includes('watch');
						} else if(selectedBrand.subcategory === "Men's Shoes") {
							subcategoryMatch = (title.includes('men') || title.includes('male')) && (title.includes('shoe') || title.includes('sneaker') || title.includes('boot') || title.includes('sandal') || title.includes('heels'));
						} else if(selectedBrand.subcategory === "Women's Shoes") {
							subcategoryMatch = (title.includes('women') || title.includes('female')) && (title.includes('shoe') || title.includes('sneaker') || title.includes('boot') || title.includes('sandal') || title.includes('heels'));
						} else if(selectedBrand.subcategory === "Men's Watches") {
							subcategoryMatch = (title.includes('men') || title.includes('male')) && title.includes('watch');
						} else if(selectedBrand.subcategory === "Women's Watches") {
							subcategoryMatch = (title.includes('women') || title.includes('female')) && title.includes('watch');
						} else if(selectedBrand.subcategory === "Furniture") {
							subcategoryMatch = title.includes('sofa') || title.includes('table') || title.includes('chair') || title.includes('bed') || title.includes('furniture') || title.includes('dining');
						} else if(selectedBrand.subcategory === "Appliances") {
							subcategoryMatch = title.includes('coffee') || title.includes('air fryer') || title.includes('appliance') || title.includes('maker') || title.includes('fryer');
						} else if(selectedBrand.subcategory === "Home Decor") {
							subcategoryMatch = title.includes('decor') || title.includes('bed sheet') || title.includes('sheet') || title.includes('bedding');
						} else if(selectedBrand.subcategory === "Bedding") {
							subcategoryMatch = title.includes('bed') || title.includes('sheet') || title.includes('bedding') || title.includes('pillow');
						} else if(selectedBrand.subcategory === "Fiction") {
							subcategoryMatch = title.includes('gatsby') || title.includes('1984') || title.includes('fiction') || title.includes('novel');
						} else if(selectedBrand.subcategory === "Non-Fiction") {
							subcategoryMatch = title.includes('psychology') || title.includes('money') || title.includes('non-fiction') || title.includes('self-help');
						} else if(selectedBrand.subcategory === "Educational") {
							subcategoryMatch = title.includes('educational') || title.includes('textbook') || title.includes('learning');
						} else if(selectedBrand.subcategory === "Children's") {
							subcategoryMatch = title.includes('children') || title.includes('kids') || title.includes('child');
						} else if(selectedBrand.subcategory === "Skincare") {
							subcategoryMatch = title.includes('skincare') || title.includes('moisturizer') || title.includes('cream') || title.includes('serum');
						} else if(selectedBrand.subcategory === "Makeup") {
							subcategoryMatch = title.includes('foundation') || title.includes('lipstick') || title.includes('mascara') || title.includes('eyeshadow') || title.includes('makeup');
						} else if(selectedBrand.subcategory === "Hair Care") {
							subcategoryMatch = title.includes('hair') || title.includes('dryer') || title.includes('straightener') || title.includes('shampoo');
						} else if(selectedBrand.subcategory === "Personal Care") {
							subcategoryMatch = title.includes('razor') || title.includes('shaving') || title.includes('personal care') || title.includes('electric');
						} else if(selectedBrand.subcategory === "Equipment") {
							subcategoryMatch = title.includes('yoga mat') || title.includes('dumbbell') || title.includes('equipment') || title.includes('mat');
						} else if(selectedBrand.subcategory === "Clothing") {
							subcategoryMatch = title.includes('leggings') || title.includes('bra') || title.includes('clothing') || title.includes('athletic');
						} else if(selectedBrand.subcategory === "Accessories") {
							subcategoryMatch = title.includes('mouse') || title.includes('accessory') || title.includes('wireless');
						} else if(selectedBrand.subcategory === "Supplements") {
							subcategoryMatch = title.includes('protein') || title.includes('creatine') || title.includes('supplement') || title.includes('powder');
						} else {
							// For other subcategories, use general matching
							subcategoryMatch = true;
						}
					}
					
					// Handle gender filtering
					let genderMatch = true;
					if(selectedBrand.gender) {
						const title = p.title.toLowerCase();
						const brandName = p.brand.toLowerCase();
						if(selectedBrand.gender === 'men') {
							genderMatch = title.includes('men') || title.includes('male') || brandName.includes('men');
						} else if(selectedBrand.gender === 'women') {
							genderMatch = title.includes('women') || title.includes('female') || title.includes('ladies') || brandName.includes('women');
						}
					}
					
					return brandMatch && categoryMatch && subcategoryMatch && genderMatch;
				});
			}
			
			// Handle price range filtering (prices are now in INR)
			const matchesPrice = p.price >= state.priceRange.min && p.price <= state.priceRange.max;
			
			return matchesCat && matchesText && matchesBrands && matchesPrice;
		});
	}
	function renderGrid(){
		const list = getFiltered();
		gridEl.innerHTML = list.map(p=> cardHTML(p)).join("");
		emptyEl.hidden = list.length>0;
	}
	function cardHTML(p){
		const inCartQty = state.cart[p.id]?.qty || 0;
		const inWishlist = state.wishlist[p.id] ? true : false;
		const stars = generateStars(p.rating);
		const discount = p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
		const reviews = p.reviews || Math.floor(Math.random() * 1000) + 100;
		const savings = p.originalPrice ? (p.originalPrice - p.price) : 0;
		
		return `
			<article class="product-card" data-id="${p.id}">
				<div class="product-image-container">
					<img src="${p.image}" alt="${p.title}" class="product-image" loading="lazy">
					<div class="product-badges">
						${discount > 0 ? `<span class="discount-badge">${discount}% OFF</span>` : ''}
						<span class="category-badge">${p.category}</span>
					</div>
					<div class="product-actions">
						<button class="wishlist-btn ${inWishlist ? 'in-wishlist' : ''}" data-wishlist="${p.id}" title="${inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}">
							<span class="heart-icon">${inWishlist ? '❤️' : '🤍'}</span>
						</button>
						<button class="quick-view-btn" data-quick-view="${p.id}" title="Quick View">👁️</button>
					</div>
				</div>
				<div class="product-info">
					<div class="product-brand">${p.brand}</div>
					<h3 class="product-title">${p.title}</h3>
					<div class="product-rating">
						<div class="rating-stars">${stars}</div>
						<span class="rating-value">${p.rating}</span>
						<span class="rating-count">(${reviews.toLocaleString()})</span>
					</div>
					<div class="product-features">
						${p.features ? p.features.slice(0, 2).map(feature => `<span class="feature-tag">${feature}</span>`).join('') : ''}
					</div>
					<div class="product-pricing">
						<div class="price-container">
							<span class="current-price">₹${p.price.toLocaleString()}</span>
							${p.originalPrice ? `<span class="original-price">₹${p.originalPrice.toLocaleString()}</span>` : ''}
						</div>
						${savings > 0 ? `<div class="savings">You save ₹${savings.toLocaleString()}</div>` : ''}
					</div>
					<div class="product-delivery">
						<span class="delivery-info">🚚 Free delivery</span>
						<span class="delivery-time">Get it by tomorrow</span>
					</div>
					<button class="add-to-cart-btn" data-add="${p.id}">
						<span class="btn-icon">${inCartQty ? "➕" : "🛒"}</span>
						<span class="btn-text">${inCartQty ? "Add another" : "Add to Cart"}</span>
					</button>
				</div>
			</article>
		`;
	}
	
	function generateStars(rating){
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;
		const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
		
		let stars = '';
		for(let i = 0; i < fullStars; i++){
			stars += '<span class="star filled">★</span>';
		}
		if(hasHalfStar){
			stars += '<span class="star half">★</span>';
		}
		for(let i = 0; i < emptyStars; i++){
			stars += '<span class="star empty">★</span>';
		}
		return stars;
	}
	// Removed old grid event listener - now handled by setupEventHandlers

	// ----- Modal -----
	function openModal(product){
		currentModalProduct = product;
		modalImg.src = product.image;
		modalImg.alt = product.title;
		modalTitle.textContent = product.title;
		modalMeta.textContent = `${product.category} • ★ ${product.rating} • ₹${product.price.toLocaleString()}`;
		modalEl.classList.add("open");
		modalEl.setAttribute("aria-hidden","false");
	}
	function closeModal(){
		modalEl.classList.remove("open");
		modalEl.setAttribute("aria-hidden","true");
	}
	modalClose.addEventListener("click", closeModal);
	modalEl.addEventListener("click", e=>{ if(e.target===modalEl) closeModal(); });
	window.addEventListener("keydown", e=>{ if(e.key==="Escape") { closeModal(); closeCart(); }});
	modalAdd.addEventListener("click", ()=>{
		if(currentModalProduct) addToCart(currentModalProduct.id, 1);
		closeModal();
		openCart();
	});

	// ----- Cart -----
	function openCart(){
		cartDrawer.classList.add("open");
		cartDrawer.setAttribute("aria-hidden","false");
	}
	function closeCart(){
		cartDrawer.classList.remove("open");
		cartDrawer.setAttribute("aria-hidden","true");
	}
	openCartBtn.addEventListener("click", openCart);
	cartClose.addEventListener("click", closeCart);

	// ----- Order Process -----
	const orderConfirmation = document.getElementById('order-confirmation');
	
	
	// ----- Notification System -----
	function showNotification(message, type = 'info') {
		// Create notification element
		const notification = document.createElement('div');
		notification.className = `notification notification-${type}`;
		notification.textContent = message;
		notification.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
			color: white;
			padding: 12px 20px;
			border-radius: 8px;
			box-shadow: 0 4px 12px rgba(0,0,0,0.15);
			z-index: 10000;
			font-weight: 500;
			animation: slideIn 0.3s ease-out;
		`;
		
		// Add animation keyframes
		if (!document.querySelector('#notification-styles')) {
			const style = document.createElement('style');
			style.id = 'notification-styles';
			style.textContent = `
				@keyframes slideIn {
					from { transform: translateX(100%); opacity: 0; }
					to { transform: translateX(0); opacity: 1; }
				}
			`;
			document.head.appendChild(style);
		}
		
		document.body.appendChild(notification);
		
		// Remove after 3 seconds
		setTimeout(() => {
			notification.style.animation = 'slideIn 0.3s ease-out reverse';
			setTimeout(() => {
				if (notification.parentNode) {
					notification.parentNode.removeChild(notification);
				}
			}, 300);
		}, 3000);
	}

	// ----- Wishlist Functions -----
	function toggleWishlist(productId){
		console.log('toggleWishlist called with productId:', productId);
		const product = products.find(p => p.id === productId);
		if(!product) {
			console.log('Product not found:', productId);
			return;
		}
		
		console.log('Current wishlist state:', state.wishlist);
		
		if(state.wishlist[productId]){
			// Remove from wishlist
			delete state.wishlist[productId];
			console.log('Removed from wishlist');
			showNotification('Removed from wishlist', 'info');
		} else {
			// Add to wishlist
			state.wishlist[productId] = {
				id: productId,
				title: product.title,
				price: product.price,
				image: product.image,
				brand: product.brand,
				addedAt: new Date().toISOString()
			};
			console.log('Added to wishlist');
			showNotification('Added to wishlist', 'success');
		}
		
		saveWishlist();
		updateWishlistUI();
		updateWishlistCount(); // Update header count
		renderGrid(); // Update product cards to show wishlist status
		
		console.log('Updated wishlist state:', state.wishlist);
	}
	
	function addToCartFromWishlist(productId){
		const wishlistItem = state.wishlist[productId];
		if(!wishlistItem) return;
		
		// Add to cart
		addToCart(productId, 1);
		
		// Remove from wishlist
		delete state.wishlist[productId];
		saveWishlist();
		updateWishlistUI();
		updateWishlistCount();
		renderGrid();
		renderCart();
		
		showNotification('Added to cart and removed from wishlist', 'success');
	}
	
	function removeFromWishlist(productId){
		if(state.wishlist[productId]){
			delete state.wishlist[productId];
			saveWishlist();
			updateWishlistUI();
			updateWishlistCount();
			renderGrid();
			showNotification('Removed from wishlist', 'info');
		}
	}
	
	function emptyWishlist(){
		if(Object.keys(state.wishlist).length === 0){
			showNotification('Wishlist is already empty', 'info');
			return;
		}
		
		// Show confirmation dialog
		const confirmed = confirm('Are you sure you want to empty your wishlist? This action cannot be undone.');
		if(confirmed){
			state.wishlist = {};
			saveWishlist();
			updateWishlistUI();
			updateWishlistCount();
			renderGrid();
			showNotification('Wishlist emptied successfully', 'success');
		}
	}
	
	function updateWishlistCount(){
		const wishlistCount = document.getElementById('wishlist-count');
		const itemCount = Object.keys(state.wishlist).length;
		if(wishlistCount) {
			wishlistCount.textContent = itemCount;
			// Show/hide count badge
			if(itemCount > 0) {
				wishlistCount.style.display = 'flex';
			} else {
				wishlistCount.style.display = 'none';
			}
		}
	}
	
	
	function updateWishlistUI(){
		const wishlistCount = document.getElementById('wishlist-count');
		const wishlistTotal = document.getElementById('wishlist-total');
		const wishlistItems = document.getElementById('wishlist-items');
		const emptyWishlistBtn = document.getElementById('empty-wishlist-btn');
		
		const itemCount = Object.keys(state.wishlist).length;
		if(wishlistCount) wishlistCount.textContent = itemCount;
		if(wishlistTotal) wishlistTotal.textContent = itemCount;
		
		// Show/hide empty wishlist button based on item count
		if(emptyWishlistBtn) {
			emptyWishlistBtn.style.display = itemCount > 0 ? 'flex' : 'none';
		}
		
		if(itemCount === 0){
			wishlistItems.innerHTML = `
				<div class="empty-wishlist">
					<div class="empty-icon">💝</div>
					<h3>Your wishlist is empty</h3>
					<p>Add items you love to your wishlist and they'll appear here</p>
				</div>
			`;
		} else {
			wishlistItems.innerHTML = Object.values(state.wishlist).map(item => {
				const product = window.products.find(p => p.id === item.id);
				const price = item.price.toLocaleString();
				const originalPrice = product.originalPrice ? product.originalPrice.toLocaleString() : null;
				const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
				
				return `
					<div class="wishlist-item" data-id="${item.id}">
						<div class="wishlist-item-image-container">
							<img src="${item.image}" alt="${item.title}" class="wishlist-item-image">
							${discount > 0 ? `<span class="wishlist-discount-badge">${discount}% OFF</span>` : ''}
						</div>
						<div class="wishlist-item-details">
							<div class="wishlist-item-brand">${item.brand}</div>
							<h4 class="wishlist-item-title">${item.title}</h4>
							<div class="wishlist-item-rating">
								<span class="rating-stars">${generateStars(product.rating)}</span>
								<span class="rating-value">${product.rating}</span>
								<span class="rating-count">(${product.reviews || 0})</span>
							</div>
							<div class="wishlist-item-pricing">
								<span class="wishlist-current-price">₹${price}</span>
								${originalPrice ? `<span class="wishlist-original-price">₹${originalPrice}</span>` : ''}
								${discount > 0 ? `<span class="wishlist-savings">Save ₹${(product.originalPrice - product.price).toLocaleString()}</span>` : ''}
							</div>
						</div>
						<div class="wishlist-item-actions">
							<button class="add-to-cart-from-wishlist" data-add-from-wishlist="${item.id}">
								<span class="btn-icon">🛒</span>
								<span class="btn-text">Add to Cart</span>
							</button>
							<button class="remove-from-wishlist" data-remove-wishlist="${item.id}">
								<span class="btn-icon">🗑️</span>
								<span class="btn-text">Remove</span>
							</button>
						</div>
					</div>
				`;
			}).join('');
		}
	}
	
	function openWishlist(){
		const wishlistDrawer = document.getElementById('wishlist-drawer');
		wishlistDrawer.classList.add('open');
		wishlistDrawer.setAttribute('aria-hidden', 'false');
		updateWishlistUI();
	}
	
	function closeWishlist(){
		const wishlistDrawer = document.getElementById('wishlist-drawer');
		wishlistDrawer.classList.remove('open');
		wishlistDrawer.setAttribute('aria-hidden', 'true');
	}
	
	window.closeCheckout = function closeCheckout(){
		checkoutModal.classList.remove('open');
		checkoutModal.setAttribute('aria-hidden','true');
	}
	
	
	
	function validatePaymentMethod(){
		const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
		
		if(paymentMethod === 'card'){
			const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
			const expiry = document.getElementById('expiry').value;
			const cvv = document.getElementById('cvv').value;
			
			// Card number validation (Luhn algorithm)
			if(!validateCardNumber(cardNumber)){
				showCheckoutError('Please enter a valid card number');
				return false;
			}
			
			// Expiry validation
			if(!validateExpiry(expiry)){
				showCheckoutError('Please enter a valid expiry date (MM/YY)');
				return false;
			}
			
			// CVV validation
			if(!validateCVV(cvv)){
				showCheckoutError('Please enter a valid CVV (3-4 digits)');
				return false;
			}
		}
		
		return true;
	}
	
	function validateCardNumber(cardNumber){
		// Remove spaces and check if it's all digits
		if(!/^\d{13,19}$/.test(cardNumber)) return false;
		
		// Luhn algorithm
		let sum = 0;
		let isEven = false;
		
		for(let i = cardNumber.length - 1; i >= 0; i--){
			let digit = parseInt(cardNumber[i]);
			
			if(isEven){
				digit *= 2;
				if(digit > 9) digit -= 9;
			}
			
			sum += digit;
			isEven = !isEven;
		}
		
		return sum % 10 === 0;
	}
	
	function validateExpiry(expiry){
		const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
		if(!regex.test(expiry)) return false;
		
		const [month, year] = expiry.split('/');
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear() % 100;
		const currentMonth = currentDate.getMonth() + 1;
		
		const expYear = parseInt(year);
		const expMonth = parseInt(month);
		
		if(expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)){
			return false;
		}
		
		return true;
	}
	
	function validateCVV(cvv){
		return /^\d{3,4}$/.test(cvv);
	}
	
	function showCheckoutError(message){
		// Remove existing error
		const existingError = document.querySelector('.checkout-error');
		if(existingError) existingError.remove();
		
		// Add new error
		const errorDiv = document.createElement('div');
		errorDiv.className = 'checkout-error';
		errorDiv.style.cssText = 'color: var(--danger); margin: 8px 0; padding: 8px; background: rgba(239,68,68,.1); border-radius: 6px; border: 1px solid rgba(239,68,68,.2);';
		errorDiv.textContent = message;
		
		const checkoutContent = document.querySelector('.checkout-content');
		checkoutContent.insertBefore(errorDiv, checkoutContent.firstChild);
		
		// Auto-remove after 5 seconds
		setTimeout(() => {
			if(errorDiv.parentNode) errorDiv.remove();
		}, 5000);
	}
	
	
	function renderOrderSummary(){
		const entries = Object.values(state.cart);
		const subtotal = entries.reduce((s,i)=>s+i.qty*i.price,0);
		const shipping = 5.99;
		const tax = subtotal * 0.08; // 8% tax
		const total = subtotal + shipping + tax;
		
		document.getElementById('order-items').innerHTML = entries.map(item => `
			<div class="order-item">
				<img src="${item.image}" alt="${item.title}" onerror="this.src='${item.fallback}'" style="width:60px;height:60px;object-fit:cover;border-radius:8px">
				<div>
					<div style="font-weight:600">${item.title}</div>
					<div style="color:var(--subtle)">Qty: ${item.qty} × ₹${item.price.toLocaleString()}</div>
				</div>
				<div style="font-weight:600">₹${(item.qty * item.price).toLocaleString()}</div>
			</div>
		`).join('');
		
		document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString()}`;
		document.getElementById('shipping').textContent = `₹${shipping.toLocaleString()}`;
		document.getElementById('tax').textContent = `₹${tax.toLocaleString()}`;
		document.getElementById('final-total').textContent = `₹${total.toLocaleString()}`;
	}
	
	// Enhanced Checkout System
	let currentCheckoutStep = 1;
	const checkoutSteps = ['products', 'address', 'payment', 'review'];
	let selectedPaymentMethod = '';
	let selectedAddress = null;
	
	// Functions will be made globally accessible after they are defined
	
	function openCheckout() {
		if (Object.keys(state.cart).length === 0) {
			showNotification('Your cart is empty!', 'error');
			return;
		}
		
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		if (!user) {
			showNotification('Please login to continue checkout', 'error');
			window.location.href = 'login.html?next=checkout';
			return;
		}
		
		currentCheckoutStep = 1;
		selectedPaymentMethod = '';
		selectedAddress = null;
		renderCheckoutStep(currentCheckoutStep);
		document.getElementById('checkout-modal').classList.add('open');
		document.getElementById('checkout-modal').setAttribute('aria-hidden', 'false');
	}
	
	function closeCheckout() {
		document.getElementById('checkout-modal').classList.remove('open');
		document.getElementById('checkout-modal').setAttribute('aria-hidden', 'true');
	}
	
	function renderCheckoutStep(step) {
		const content = document.getElementById('checkout-content');
		
		switch(step) {
			case 1: // Products Review
				content.innerHTML = renderProductsStep();
				break;
			case 2: // Address Selection
				content.innerHTML = renderAddressStep();
				break;
			case 3: // Payment Method
				content.innerHTML = renderPaymentStep();
				setTimeout(() => {
					setupPaymentMethodHandlers();
				}, 10);
				break;
			case 4: // Order Confirmation
				content.innerHTML = renderConfirmationStep();
				break;
		}
	}
	
	function renderProductsStep() {
		const cartItems = Object.values(state.cart).filter(item => 
			item && item.id && item.title && item.price !== undefined && item.qty !== undefined
		);
		
		// Handle empty cart
		if (cartItems.length === 0) {
			return `
				<div class="checkout-step">
					<div class="empty-cart-message">
						<div class="empty-cart-icon">🛒</div>
						<h3>Your cart is empty</h3>
						<p>Add some items to your cart to proceed with checkout</p>
						<button class="btn-primary" onclick="closeCheckout()">Continue Shopping</button>
					</div>
				</div>
			`;
		}
		
		const subtotal = cartItems.reduce((sum, item) => {
			const qty = Number(item.qty) || 0;
			const price = Number(item.price) || 0;
			return sum + (qty * price);
		}, 0);
		const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
		const tax = Math.round(subtotal * 0.18); // 18% GST rounded
		const total = subtotal + shipping + tax;
		
		return `
			<div class="checkout-step">
				<div class="step-header">
					<div class="step-title">
						<h3>Review Your Order</h3>
						<p>Please review your items before proceeding to checkout</p>
					</div>
					<div class="step-indicator">
						<div class="step-item active">
							<div class="step-number">1</div>
							<div class="step-label">Review</div>
						</div>
						<div class="step-line"></div>
						<div class="step-item">
							<div class="step-number">2</div>
							<div class="step-label">Address</div>
						</div>
						<div class="step-line"></div>
						<div class="step-item">
							<div class="step-number">3</div>
							<div class="step-label">Payment</div>
						</div>
						<div class="step-line"></div>
						<div class="step-item">
							<div class="step-number">4</div>
							<div class="step-label">Confirm</div>
						</div>
					</div>
				</div>
				
				<div class="checkout-content-grid">
					<div class="order-items-section">
						<h4>Order Items</h4>
						<div class="order-items-list">
							${cartItems.map(item => {
								// Get fresh product data to ensure we have brand
								const product = window.products.find(p => p.id === item.id);
								const brand = product ? product.brand : (item.brand || 'Unknown Brand');
								
								console.log('Rendering cart item:', item, 'Product:', product, 'Brand:', brand);
								
								return `
									<div class="order-item">
										<div class="item-image">
											<img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEw1MCA1MEw0MCA2MEwzMCA1MEw0MCA0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+Cg=='">
										</div>
										<div class="item-details">
											<div class="item-title">${item.title}</div>
											<div class="item-brand">${brand}</div>
											<div class="item-quantity">Qty: ${item.qty}</div>
											<div class="item-price">₹${item.price.toLocaleString()} each</div>
										</div>
										<div class="item-total">
											₹${(item.qty * item.price).toLocaleString()}
										</div>
									</div>
								`;
							}).join('')}
						</div>
					</div>
				</div>
					
				<div class="order-summary-section">
						<div class="summary-card">
						
							<div class="summary-details">
								<div class="summary-row">
									<span>Subtotal (${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'})</span>
									<span>₹${subtotal.toLocaleString()}</span>
								</div>
								<div class="summary-row">
									<span>Delivery</span>
									<span class="${shipping === 0 ? 'free-shipping' : ''}">${shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
								</div>
								<div class="summary-row">
									<span>GST (18%)</span>
									<span>₹${tax.toLocaleString()}</span>
								</div>
								<div class="summary-divider"></div>
								<div class="summary-row total">
									<span>Total Amount</span>
									<span>₹${total.toLocaleString()}</span>
								</div>
							</div>
							${shipping === 0 ? '<div class="free-shipping-badge">🎉 You qualify for free shipping!</div>' : ''}
							
							<div class="checkout-actions">
								<button class="btn-secondary" onclick="closeCheckout()">
									<span class="btn-icon">←</span>
									Back To Cart
								</button>
								<button class="btn-primary" onclick="nextCheckoutStep()">
									Continue to Address
									<span class="btn-icon">→</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		`;
	}
	
	function renderPaymentStep() {
		return `
			<div class="checkout-step">
				<div class="step-header">
					<h3>Select Payment Method</h3>
					<p>Choose your preferred payment method</p>
				</div>
				
				<div class="payment-options">
					<div class="payment-method" data-method="card">
						<div class="payment-option">
							<input type="radio" name="payment" value="card" id="payment-card">
							<label for="payment-card" class="payment-label">
								<div class="payment-icon">💳</div>
								<div class="payment-info">
									<h4>Credit/Debit Card</h4>
									<p>Visa, Mastercard, RuPay</p>
								</div>
							</label>
						</div>
						<div class="payment-details" id="card-details" style="display:none;">
							<div class="form-group">
								<label for="cardNumber">Card Number *</label>
								<input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" required>
								<span class="field-error" id="cardNumber-error"></span>
							</div>
							<div class="form-row">
								<div class="form-group">
									<label for="expiry">Expiry Date *</label>
									<input type="text" id="expiry" placeholder="MM/YY" maxlength="5" required>
									<span class="field-error" id="expiry-error"></span>
								</div>
								<div class="form-group">
									<label for="cvv">CVV *</label>
									<input type="text" id="cvv" placeholder="123" maxlength="4" required>
									<span class="field-error" id="cvv-error"></span>
								</div>
							</div>
							<div class="form-group">
								<label for="cardName">Cardholder Name *</label>
								<input type="text" id="cardName" placeholder="John Doe" required>
								<span class="field-error" id="cardName-error"></span>
							</div>
						</div>
					</div>
					
					<div class="payment-method" data-method="upi">
						<div class="payment-option">
							<input type="radio" name="payment" value="upi" id="payment-upi">
							<label for="payment-upi" class="payment-label">
								<div class="payment-icon">📱</div>
								<div class="payment-info">
									<h4>UPI Payment</h4>
									<p>Google Pay, PhonePe, Paytm</p>
								</div>
							</label>
						</div>
						<div class="payment-details" id="upi-details" style="display:none;">
							<div class="form-group">
								<label for="upiId">UPI ID *</label>
								<input type="text" id="upiId" placeholder="yourname@paytm" required>
								<span class="field-error" id="upiId-error"></span>
								<p class="field-hint">Enter your UPI ID (e.g., yourname@paytm, yourname@phonepe)</p>
							</div>
						</div>
					</div>
					
					<div class="payment-method" data-method="cod">
						<div class="payment-option">
							<input type="radio" name="payment" value="cod" id="payment-cod">
							<label for="payment-cod" class="payment-label">
								<div class="payment-icon">💰</div>
								<div class="payment-info">
									<h4>Cash on Delivery</h4>
									<p>Pay when your order arrives</p>
								</div>
							</label>
						</div>
						<div class="payment-details" id="cod-details" style="display:none;">
							<div class="cod-info">
								<p>💰 You can pay with cash when your order is delivered</p>
								<p>📦 Please keep exact change ready</p>
							</div>
						</div>
					</div>
				</div>
				
				<div class="checkout-actions">
					<button class="btn-secondary" onclick="prevCheckoutStep()">Back</button>
					<button class="btn-primary" onclick="placeOrderFromCart(); nextCheckoutStep();">Confirm Order</button>
				</div>
			</div>
		`;
	}
	
	function setupPaymentMethodHandlers() {
		console.log('Setting up payment method handlers');
		
		// Handle payment method selection
		const paymentMethods = document.querySelectorAll('input[name="payment"]');
		console.log('Found payment methods:', paymentMethods.length);
		
		paymentMethods.forEach((method, index) => {
			console.log(`Method ${index + 1}:`, method.value, method.checked);
			// Remove any existing listeners
			method.removeEventListener('change', handlePaymentMethodChange);
			// Add new listener
			method.addEventListener('change', handlePaymentMethodChange);
		});
		
		// Add click handlers to labels as well
		const paymentLabels = document.querySelectorAll('.payment-label');
		console.log('Found payment labels:', paymentLabels.length);
		paymentLabels.forEach((label, index) => {
			console.log(`Label ${index + 1}:`, label);
			label.addEventListener('click', function(e) {
				e.preventDefault();
				console.log('Label clicked');
				const radio = this.previousElementSibling;
				console.log('Radio element:', radio);
				if (radio) {
					radio.checked = true;
					console.log('Radio checked, calling handlePaymentMethodChange');
					handlePaymentMethodChange.call(radio);
				}
			});
		});
		
		// Setup validation
		setupPaymentValidation();
	}
	
	// Setup phone number formatting
	function setupPhoneFormatting() {
		const phoneInput = document.getElementById('phone');
		if (phoneInput) {
			phoneInput.addEventListener('input', function(e) {
				let value = e.target.value.replace(/\D/g, '');
				if (value.length > 10) {
					value = value.slice(0, 10);
				}
				e.target.value = value;
			});
		}
	}
	
	function handlePaymentMethodChange() {
		console.log('Payment method changed to:', this.value);
		
		// Hide all payment details
		document.querySelectorAll('.payment-details').forEach(details => {
			details.style.display = 'none';
			console.log('Hiding details for:', details.id);
		});
		
		// Show selected payment details
		const selectedMethod = this.value;
		const detailsElement = document.getElementById(selectedMethod + '-details');
		console.log('Looking for details element:', selectedMethod + '-details', detailsElement);
		
		if (detailsElement) {
			detailsElement.style.display = 'block';
			console.log('Showing details for:', selectedMethod);
		} else {
			console.error('Details element not found for:', selectedMethod);
		}
		
		// Clear previous errors
		clearPaymentErrors();
	}
	
	function setupPaymentValidation() {
		// Add input validation for card details
		const cardNumber = document.getElementById('cardNumber');
		if (cardNumber) {
			cardNumber.addEventListener('input', function(e) {
				let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
				let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
				e.target.value = formattedValue;
				validateCardNumber();
			});
		}
		
		const expiry = document.getElementById('expiry');
		if (expiry) {
			expiry.addEventListener('input', function(e) {
				let value = e.target.value.replace(/\D/g, '');
				if (value.length >= 2) {
					value = value.substring(0, 2) + '/' + value.substring(2, 4);
				}
				e.target.value = value;
				validateExpiry();
			});
		}
		
		const cvv = document.getElementById('cvv');
		if (cvv) {
			cvv.addEventListener('input', function(e) {
				e.target.value = e.target.value.replace(/\D/g, '');
				validateCVV();
			});
		}
		
		const upiId = document.getElementById('upiId');
		if (upiId) {
			upiId.addEventListener('input', validateUPI);
		}
	}
	
	function validateCardNumber() {
		const cardNumber = document.getElementById('cardNumber');
		const errorElement = document.getElementById('cardNumber-error');
		const value = cardNumber.value.replace(/\s/g, '');
		
		if (value.length === 0) {
			showFieldError('cardNumber-error', 'Card number is required');
			return false;
		} else if (value.length < 16) {
			showFieldError('cardNumber-error', 'Card number must be 16 digits');
			return false;
		} else if (!/^[0-9]{16}$/.test(value)) {
			showFieldError('cardNumber-error', 'Invalid card number');
			return false;
		} else {
			clearFieldError('cardNumber-error');
			return true;
		}
	}
	
	function validateExpiry() {
		const expiry = document.getElementById('expiry');
		const errorElement = document.getElementById('expiry-error');
		const value = expiry.value;
		
		if (value.length === 0) {
			showFieldError('expiry-error', 'Expiry date is required');
			return false;
		} else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
			showFieldError('expiry-error', 'Invalid expiry date (MM/YY)');
			return false;
		} else {
			clearFieldError('expiry-error');
			return true;
		}
	}
	
	function validateCVV() {
		const cvv = document.getElementById('cvv');
		const errorElement = document.getElementById('cvv-error');
		const value = cvv.value;
		
		if (value.length === 0) {
			showFieldError('cvv-error', 'CVV is required');
			return false;
		} else if (value.length < 3) {
			showFieldError('cvv-error', 'CVV must be 3-4 digits');
			return false;
		} else {
			clearFieldError('cvv-error');
			return true;
		}
	}
	
	function validateUPI() {
		const upiId = document.getElementById('upiId');
		const errorElement = document.getElementById('upiId-error');
		const value = upiId.value;
		
		if (value.length === 0) {
			showFieldError('upiId-error', 'UPI ID is required');
			return false;
		} else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(value)) {
			showFieldError('upiId-error', 'Invalid UPI ID format');
			return false;
		} else {
			clearFieldError('upiId-error');
			return true;
		}
	}
	
	function showFieldError(fieldId, message) {
		const errorElement = document.getElementById(fieldId);
		if (errorElement) {
			errorElement.textContent = message;
			errorElement.style.display = 'block';
		}
	}
	
	function clearFieldError(fieldId) {
		const errorElement = document.getElementById(fieldId);
		if (errorElement) {
			errorElement.textContent = '';
			errorElement.style.display = 'none';
		}
	}
	
	function clearPaymentErrors() {
		['cardNumber-error', 'expiry-error', 'cvv-error', 'cardName-error', 'upiId-error'].forEach(fieldId => {
			clearFieldError(fieldId);
		});
	}
	
	function renderAddressStep() {
		return `
			<div class="checkout-step">
				<div class="step-header">
					<h3>Delivery Address</h3>
					<div class="step-indicator">
						<span class="step completed">1</span>
						<span class="step-line completed"></span>
						<span class="step completed">2</span>
						<span class="step-line completed"></span>
						<span class="step active">3</span>
						<span class="step-line"></span>
						<span class="step">4</span>
					</div>
				</div>
				
				<div class="address-form">
					<div class="form-group">
						<label>Full Name *</label>
						<input type="text" id="fullName" placeholder="Enter your full name" required>
					</div>
					
					<div class="form-group">
						<label>Phone Number *</label>
						<input type="tel" id="phone" placeholder="Enter your phone number" required>
					</div>
					
					<div class="form-group">
						<label>Address *</label>
						<textarea id="address" placeholder="Enter your complete address" rows="3" required></textarea>
					</div>
					
					<div class="form-row">
						<div class="form-group">
							<label>City *</label>
							<input type="text" id="city" placeholder="Enter city" required>
						</div>
						<div class="form-group">
							<label>State *</label>
							<input type="text" id="state" placeholder="Enter state" required>
						</div>
					</div>
					
					<div class="form-row">
						<div class="form-group">
							<label>Pincode *</label>
							<input type="text" id="pincode" placeholder="Enter pincode" required>
						</div>
						<div class="form-group">
							<label>Landmark (Optional)</label>
							<input type="text" id="landmark" placeholder="Enter landmark">
						</div>
					</div>
				</div>
				
				<div class="checkout-actions">
					<button class="btn-secondary" onclick="prevCheckoutStep()">Back</button>
					<button class="btn-primary" onclick="nextCheckoutStep()">Continue to Review</button>
				</div>
			</div>
		`;
	}
	
	function renderReviewStep() {
		const cartItems = Object.values(state.cart);
		const subtotal = cartItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
		const shipping = subtotal > 500 ? 0 : 50;
		const tax = Math.round(subtotal * 0.18); // 18% GST rounded
		const total = subtotal + shipping + tax;
		
		return `
			<div class="checkout-step">
				<div class="step-header">
					<h3>Review & Place Order</h3>
					<div class="step-indicator">
						<span class="step completed">1</span>
						<span class="step-line completed"></span>
						<span class="step completed">2</span>
						<span class="step-line completed"></span>
						<span class="step completed">3</span>
						<span class="step-line completed"></span>
						<span class="step active">4</span>
					</div>
				</div>
				
				<div class="review-content">
					<div class="review-section">
						<h4>Order Items</h4>
						<div class="review-items">
							${cartItems.map(item => `
								<div class="review-item">
									<img src="${item.image}" alt="${item.title}" style="width:60px;height:60px;object-fit:cover;border-radius:6px">
									<div class="item-info">
										<h5>${item.title}</h5>
										<p>${item.brand} • Qty: ${item.qty}</p>
									</div>
									<div class="item-price">₹${(item.qty * item.price).toLocaleString()}</div>
								</div>
							`).join('')}
						</div>
					</div>
					
					<div class="review-section">
						<h4>Delivery Address</h4>
						<div class="address-review" id="address-review">
							<!-- Address will be populated here -->
						</div>
					</div>
					
					<div class="review-section">
						<h4>Payment Method</h4>
						<div class="payment-review" id="payment-review">
							<!-- Payment method will be populated here -->
						</div>
					</div>
					
					<div class="review-section">
						<h4>Order Summary</h4>
						<div class="summary-review">
							<div class="summary-row">
								<span>Subtotal (${cartItems.length} items)</span>
								<span>₹${subtotal.toLocaleString()}</span>
							</div>
							<div class="summary-row">
								<span>Delivery</span>
								<span>${shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
							</div>
							<div class="summary-row">
								<span>GST (18%)</span>
								<span>₹${tax.toLocaleString()}</span>
							</div>
							<div class="summary-row total">
								<span>Total Amount</span>
								<span>₹${total.toLocaleString()}</span>
							</div>
						</div>
					</div>
				</div>
				
				<div class="checkout-actions">
					<button class="btn-secondary" onclick="prevCheckoutStep()">Back</button>
					<button class="btn-primary" onclick="placeOrder()">Place Order</button>
				</div>
			</div>
		`;
	}
	
	function nextCheckoutStep() {
		const validationResult = validateCurrentStep();
		
		if (validationResult) {
			currentCheckoutStep++;
			if (currentCheckoutStep <= 4) {
				renderCheckoutStep(currentCheckoutStep);
			}
		}
	}
	
	function prevCheckoutStep() {
		if (currentCheckoutStep > 1) {
			currentCheckoutStep--;
			renderCheckoutStep(currentCheckoutStep);
			setupCheckoutEventListeners();
		}
	}
	
	
	function validateCurrentStep() {
		
		switch(currentCheckoutStep) {
			case 1: // Products step - always valid
				return true;
			case 2: // Address validation
				const selectedAddr = document.querySelector('input[name="selectedAddress"]:checked');
				
				if (!selectedAddr) {
					showNotification('Please select a delivery address', 'error');
					return false;
				}
				selectedAddress = selectedAddr.value;
				return true;
			case 3: // Payment validation
				const paymentMethod = document.querySelector('input[name="payment"]:checked');
				if (!paymentMethod) {
					showNotification('Please select a payment method', 'error');
					return false;
				}
				selectedPaymentMethod = paymentMethod.value;
				
				// Validate payment details based on method
				if (selectedPaymentMethod === 'card') {
					const cardNumberValid = validateCardNumber();
					const expiryValid = validateExpiry();
					const cvvValid = validateCVV();
					const cardName = document.getElementById('cardName').value;
					
					if (!cardName) {
						showFieldError('cardName-error', 'Cardholder name is required');
						return false;
					} else {
						clearFieldError('cardName-error');
					}
					
					return cardNumberValid && expiryValid && cvvValid;
				} else if (selectedPaymentMethod === 'upi') {
					return validateUPI();
				} else if (selectedPaymentMethod === 'cod') {
					// COD doesn't require additional validation
					return true;
				}
				return true;
				
			case 4: // Review step - always valid
				return true;
				
			default:
				return true;
		}
	}
	
	function setupCheckoutEventListeners() {
		console.log('Setting up checkout event listeners for step:', currentCheckoutStep);
		
		// Cancel checkout button
		const cancelBtn = document.getElementById('cancel-checkout');
		if (cancelBtn) {
			console.log('Found cancel button, adding event listener');
			cancelBtn.addEventListener('click', closeCheckout);
		} else {
			console.log('Cancel button not found');
		}
		
		// Continue to payment button
		const continueToPaymentBtn = document.getElementById('continue-to-payment');
		if (continueToPaymentBtn) {
			console.log('Found continue to payment button, adding event listener');
			continueToPaymentBtn.addEventListener('click', nextCheckoutStep);
		} else {
			console.log('Continue to payment button not found');
		}
		
		// Back from payment button
		const backFromPaymentBtn = document.getElementById('back-from-payment');
		if (backFromPaymentBtn) {
			backFromPaymentBtn.addEventListener('click', prevCheckoutStep);
		}
		
		// Continue to address button
		const continueToAddressBtn = document.getElementById('continue-to-address');
		if (continueToAddressBtn) {
			continueToAddressBtn.addEventListener('click', nextCheckoutStep);
		}
		
		// Back from address button
		const backFromAddressBtn = document.getElementById('back-from-address');
		if (backFromAddressBtn) {
			backFromAddressBtn.addEventListener('click', prevCheckoutStep);
		}
		
		// Continue to review button
		const continueToReviewBtn = document.getElementById('continue-to-review');
		if (continueToReviewBtn) {
			continueToReviewBtn.addEventListener('click', nextCheckoutStep);
		}
		
		// Back from review button
		const backFromReviewBtn = document.getElementById('back-from-review');
		if (backFromReviewBtn) {
			backFromReviewBtn.addEventListener('click', prevCheckoutStep);
		}
		
		// Place order button
		const placeOrderBtn = document.getElementById('place-order-btn');
		if (placeOrderBtn) {
			placeOrderBtn.addEventListener('click', placeOrder);
		}
		
		// Payment method selection
		const paymentMethods = document.querySelectorAll('input[name="payment"]');
		paymentMethods.forEach(method => {
			method.addEventListener('change', (e) => {
				// Hide all payment details
				document.querySelectorAll('.payment-details').forEach(details => {
					details.style.display = 'none';
				});
				
				// Show selected payment details
				const methodType = e.target.value;
				const detailsElement = document.getElementById(methodType + '-details');
				if (detailsElement) {
					detailsElement.style.display = 'block';
				}
				
				// Enable continue button
				const continueBtn = document.getElementById('continue-to-address');
				if (continueBtn) {
					continueBtn.disabled = false;
				}
			});
		});
		
		// Populate review step data
		if (currentCheckoutStep === 4) {
			populateReviewData();
		}
	}
	
	function populateReviewData() {
		// Populate address review
		const addressReview = document.getElementById('address-review');
		if (addressReview && selectedAddress) {
			addressReview.innerHTML = `
				<div class="address-details">
					<p><strong>${selectedAddress.fullName}</strong></p>
					<p>${selectedAddress.phone}</p>
					<p>${selectedAddress.address}</p>
					<p>${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.pincode}</p>
					${selectedAddress.landmark ? `<p>Landmark: ${selectedAddress.landmark}</p>` : ''}
				</div>
			`;
		}
		
		// Populate payment review
		const paymentReview = document.getElementById('payment-review');
		if (paymentReview && selectedPaymentMethod) {
			let paymentText = '';
			if (selectedPaymentMethod === 'card') {
				const cardNumber = document.getElementById('cardNumber').value;
				paymentText = `Credit/Debit Card ending in ${cardNumber.slice(-4)}`;
			} else if (selectedPaymentMethod === 'upi') {
				const upiId = document.getElementById('upiId').value;
				paymentText = `UPI: ${upiId}`;
			} else if (selectedPaymentMethod === 'cod') {
				paymentText = 'Cash on Delivery';
			}
			
			paymentReview.innerHTML = `<p>${paymentText}</p>`;
		}
	}
	
	
	// Make checkout functions globally accessible
	window.nextCheckoutStep = nextCheckoutStep;
	window.prevCheckoutStep = prevCheckoutStep;
	window.closeCheckout = closeCheckout;
	window.placeOrder = placeOrder;
	
	// Make modal functions globally accessible
	window.openNotificationsModal = openNotificationsModal;
	window.closeNotificationsModal = closeNotificationsModal;
	window.openSettingsModal = openSettingsModal;
	window.closeSettingsModal = closeSettingsModal;
	window.openHelpModal = openHelpModal;
	window.closeHelpModal = closeHelpModal;
	window.openFeedbackModal = openFeedbackModal;
	window.closeFeedbackModal = closeFeedbackModal;
	window.openViewFeedbackModal = openViewFeedbackModal;
	window.closeViewFeedbackModal = closeViewFeedbackModal;
	window.openProfileModal = openProfileModal;
	window.closeProfileModal = closeProfileModal;
	window.openAddressesModal = openAddressesModal;
	window.closeAddressesModal = closeAddressesModal;
	window.openRecentlyViewedModal = openRecentlyViewedModal;
	window.closeRecentlyViewedModal = closeRecentlyViewedModal;
	window.openRecommendationsModal = openRecommendationsModal;
	window.closeRecommendationsModal = closeRecommendationsModal;
	
	// Test function for debugging
	window.testCheckout = function() {
		console.log('Current checkout step:', currentCheckoutStep);
		console.log('NextCheckoutStep function:', typeof nextCheckoutStep);
		console.log('Cart items:', Object.keys(state.cart).length);
	};
	
	
	// Make address functions globally accessible
	window.showAddressForm = showAddressForm;
	window.hideAddressForm = hideAddressForm;
	window.saveAddress = saveAddress;
	window.editAddress = editAddress;
	window.deleteAddress = deleteAddress;
	window.setDefaultAddress = setDefaultAddress;
	window.getDefaultAddress = getDefaultAddress;
	window.getAllAddresses = getAllAddresses;
	
	// Also make them accessible as properties of the main app object
	window.checkoutFunctions = {
		nextCheckoutStep: nextCheckoutStep,
		prevCheckoutStep: prevCheckoutStep,
		closeCheckout: closeCheckout,
		placeOrder: placeOrder
	};
	
	console.log('Global functions assigned:', {
		nextCheckoutStep: typeof window.nextCheckoutStep,
		closeCheckout: typeof window.closeCheckout,
		showAddressForm: typeof window.showAddressForm,
		saveAddress: typeof window.saveAddress
	});
	
	// Test function to check if everything is working
	window.testApp = function() {
		console.log('=== APP TEST ===');
		console.log('Cart items:', Object.keys(state.cart).length);
		console.log('Wishlist items:', Object.keys(state.wishlist).length);
		console.log('Saved addresses:', JSON.parse(localStorage.getItem('userAddresses') || '[]').length);
		console.log('Payment methods available:', document.querySelectorAll('input[name="payment"]').length);
		console.log('Checkout step:', currentCheckoutStep);
		console.log('=== END TEST ===');
	};
	
	// Test function to check Review Your Order page
	window.testReviewPage = function() {
		console.log('=== TESTING REVIEW PAGE ===');
		const cartItems = Object.values(state.cart);
		console.log('Cart items:', cartItems);
		console.log('Products available:', window.products.length);
		
		cartItems.forEach(item => {
			const product = window.products.find(p => p.id === item.id);
			console.log(`Item ${item.id}:`, {
				item: item,
				product: product,
				brand: product ? product.brand : 'No brand found',
				hasImage: product ? product.image : 'No product found'
			});
		});
		console.log('=== END TEST ===');
	};
	
	// Test function to check CSS
	window.testCSS = function() {
		console.log('=== TESTING CSS ===');
		const orderItemsList = document.querySelector('.order-items-list');
		if (orderItemsList) {
			const styles = window.getComputedStyle(orderItemsList);
			console.log('Order items list styles:', {
				display: styles.display,
				gridTemplateColumns: styles.gridTemplateColumns,
				gap: styles.gap
			});
		} else {
			console.log('Order items list not found');
		}
		console.log('=== END CSS TEST ===');
	};
	
	// Test function to check orders
	window.testOrders = function() {
		console.log('=== TESTING ORDERS ===');
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		console.log('Current user:', user);
		console.log('All orders:', state.orders);
		console.log('Orders from localStorage:', localStorage.getItem('orders'));
		
		if (user) {
			const userOrders = state.orders.filter(order => order.userId === user.email);
			console.log('User orders:', userOrders);
		}
		console.log('=== END ORDERS TEST ===');
	};
	
	// Test function to create a sample order
	window.createTestOrder = function() {
		console.log('=== CREATING TEST ORDER ===');
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		if (!user) {
			console.log('No user found, cannot create test order');
			return;
		}
		
		console.log('Before creating order:');
		console.log('State orders:', state.orders);
		console.log('State orders length:', state.orders.length);
		console.log('localStorage orders before:', localStorage.getItem('orders'));
		
		const testOrder = {
			id: 'TEST-' + Date.now(),
			userId: user.email,
			date: new Date().toISOString(),
			status: 'confirmed',
			items: [{
				id: 'test-1',
				title: 'Test Product',
				price: 1000,
				qty: 1,
				quantity: 1,
				image: 'https://via.placeholder.com/100',
				brand: 'Test Brand'
			}],
			subtotal: 1000,
			shipping: 50,
			tax: 100,
			total: 1150,
			address: {
				name: 'Test User',
				address: 'Test Address',
				city: 'Test City',
				state: 'Test State',
				pincode: '123456',
				phone: '1234567890'
			},
			paymentMethod: 'Credit Card',
			deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
			estimatedDelivery: '3-5 business days',
			orderStatus: 'Confirmed',
			trackingNumber: 'TRK' + Date.now().toString().slice(-8)
		};
		
		console.log('Pushing test order to state.orders...');
		state.orders.push(testOrder);
		console.log('After pushing:');
		console.log('State orders:', state.orders);
		console.log('State orders length:', state.orders.length);
		
		console.log('Calling saveOrders()...');
		saveOrders();
		
		console.log('After saveOrders():');
		console.log('localStorage orders after:', localStorage.getItem('orders'));
		
		console.log('Test order created:', testOrder);
		console.log('All orders now:', state.orders);
		console.log('=== END TEST ORDER CREATION ===');
	};
	
	// Function to reload orders from localStorage
	window.reloadOrders = function() {
		console.log('=== RELOADING ORDERS ===');
		console.log('Orders in localStorage:', localStorage.getItem('orders'));
		state.orders = loadOrders();
		console.log('Orders reloaded in state:', state.orders);
		console.log('Orders count:', state.orders.length);
		console.log('=== END RELOAD ===');
	};
	
	// Comprehensive debugging function
	window.debugEverything = function() {
		console.log('=== COMPREHENSIVE DEBUG ===');
		
		// Check user
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		console.log('1. Current user:', user);
		
		// Check localStorage
		console.log('2. All localStorage keys:', Object.keys(localStorage));
		console.log('3. Orders in localStorage:', localStorage.getItem('orders'));
		
		// Check state
		console.log('4. State orders:', state.orders);
		console.log('5. State orders length:', state.orders.length);
		
		// Check if orders exist for this user
		if (user) {
			const userOrders = state.orders.filter(order => order.userId === user.email);
			console.log('6. User orders:', userOrders);
			console.log('7. User orders length:', userOrders.length);
			
			// Check each order
			state.orders.forEach((order, index) => {
				console.log(`8. Order ${index}:`, {
					id: order.id,
					userId: order.userId,
					userEmail: user.email,
					matches: order.userId === user.email
				});
			});
		}
		
		// Check HTML elements
		console.log('9. Orders modal exists:', !!document.getElementById('orders-modal'));
		console.log('10. Orders content exists:', !!document.getElementById('orders-content'));
		console.log('11. Orders button exists:', !!document.getElementById('orders-btn'));
		
		console.log('=== END COMPREHENSIVE DEBUG ===');
	};
	
	// Quick test function to create order and show it
	window.testOrderAndShow = function() {
		console.log('=== CREATING ORDER AND SHOWING ===');
		
		// Create test order
		createTestOrder();
		
		// Wait a bit then show orders
		setTimeout(() => {
			console.log('Opening orders modal...');
			openOrders();
		}, 500);
		
		console.log('=== END TEST ORDER AND SHOW ===');
	};
	
	// Test function to check if functions are accessible
	window.testFunctions = function() {
		console.log('=== TESTING FUNCTIONS ===');
		console.log('openOrders function:', typeof window.openOrders);
		console.log('closeOrders function:', typeof window.closeOrders);
		console.log('closeCheckout function:', typeof window.closeCheckout);
		console.log('=== END FUNCTION TEST ===');
	};
	
	// Manual function to save orders
	window.manualSaveOrders = function() {
		console.log('=== MANUAL SAVE ORDERS ===');
		console.log('Current state.orders:', state.orders);
		console.log('Calling saveOrders()...');
		saveOrders();
		console.log('localStorage after manual save:', localStorage.getItem('orders'));
		console.log('=== END MANUAL SAVE ===');
	};
	
	// Function to check current state and localStorage
	window.checkState = function() {
		console.log('=== CHECKING STATE ===');
		console.log('state.orders:', state.orders);
		console.log('state.orders.length:', state.orders.length);
		console.log('localStorage.getItem("orders"):', localStorage.getItem('orders'));
		console.log('typeof localStorage.getItem("orders"):', typeof localStorage.getItem('orders'));
		console.log('All localStorage keys:', Object.keys(localStorage));
		console.log('=== END STATE CHECK ===');
	};
	
	// Function to manually place order from current cart
	window.placeOrderFromCart = function() {
		console.log('=== PLACING ORDER FROM CURRENT CART ===');
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		if (!user) {
			console.log('No user found');
			return;
		}
		
		// Get current cart items
		const cartItems = Object.values(state.cart);
		console.log('Current cart items:', cartItems);
		
		if (cartItems.length === 0) {
			console.log('Cart is empty, cannot place order');
			return;
		}
		
		// Calculate totals
		const subtotal = cartItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
		const shipping = subtotal > 500 ? 0 : 50;
		const tax = Math.round(subtotal * 0.18);
		const total = subtotal + shipping + tax;
		
		// Create order
		const order = {
			id: 'ORD-' + Date.now().toString().slice(-6),
			userId: user.email,
			date: new Date().toISOString(),
			status: 'confirmed',
			items: cartItems.map(item => ({
				id: item.id,
				title: item.title,
				price: item.price,
				qty: item.qty,
				quantity: item.qty,
				image: item.image,
				brand: item.brand || 'Unknown Brand'
			})),
			subtotal: subtotal,
			shipping: shipping,
			tax: tax,
			total: total,
			address: {
				name: user.name,
				address: '123 Main Street',
				city: 'Mumbai',
				state: 'Maharashtra',
				pincode: '400001',
				phone: '9876543210'
			},
			paymentMethod: 'Credit Card',
			deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
			estimatedDelivery: '3-5 business days',
			orderStatus: 'Confirmed',
			trackingNumber: 'TRK' + Date.now().toString().slice(-8)
		};
		
		console.log('Created order:', order);
		
		// Add to orders
		state.orders.push(order);
		saveOrders();
		
		// Clear cart
		state.cart = {};
		saveCart();
		
		// Update cart UI
		renderCart();
		updateCartCount();
		
		// Close cart drawer if open
		if (cartDrawer && cartDrawer.classList.contains('open')) {
			closeCart();
		}
		
		console.log('Order placed successfully!');
		console.log('Cart cleared and UI updated');
		console.log('=== END PLACE ORDER FROM CART ===');
	};
	
	// Function to clear all orders (including sample orders)
	window.clearAllOrders = function() {
		console.log('=== CLEARING ALL ORDERS ===');
		state.orders = [];
		localStorage.removeItem('orders');
		console.log('All orders cleared from state and localStorage');
		console.log('Current state.orders:', state.orders);
		console.log('localStorage orders:', localStorage.getItem('orders'));
		console.log('=== END CLEAR ORDERS ===');
	};
	
	// Function to completely clear localStorage and start fresh
	window.clearEverything = function() {
		console.log('=== CLEARING EVERYTHING ===');
		localStorage.clear();
		console.log('localStorage completely cleared');
		console.log('All localStorage keys:', Object.keys(localStorage));
		
		// Reload page to reset everything
		console.log('Reloading page to reset everything...');
		window.location.reload();
		console.log('=== END CLEAR EVERYTHING ===');
	};
	
	// Debug function to test payment form
	window.testPaymentForm = function() {
		console.log('=== PAYMENT FORM TEST ===');
		const paymentMethods = document.querySelectorAll('input[name="payment"]');
		console.log('Found payment methods:', paymentMethods.length);
		paymentMethods.forEach((method, index) => {
			console.log(`Method ${index + 1}:`, method.value, method.checked);
		});
		
		const details = document.querySelectorAll('.payment-details');
		console.log('Found payment details:', details.length);
		details.forEach((detail, index) => {
			console.log(`Detail ${index + 1}:`, detail.id, detail.style.display);
		});
		console.log('=== END PAYMENT TEST ===');
	};
	
	window.testCardSelection = function() {
		console.log('=== CARD SELECTION TEST ===');
		const cardRadio = document.querySelector('input[value="card"]');
		if (cardRadio) {
			console.log('Card radio found:', cardRadio);
			cardRadio.checked = true;
			handlePaymentMethodChange.call(cardRadio);
			console.log('Card selected and form should be visible');
		} else {
			console.log('Card radio not found');
		}
		console.log('=== END CARD TEST ===');
	};
	
	window.testAddressModal = function() {
		console.log('=== ADDRESS MODAL TEST ===');
		console.log('Testing address modal functionality...');
		openAddressesModal();
		console.log('Address modal should be open now');
		console.log('=== END ADDRESS MODAL TEST ===');
	};
	
	function renderAddressStep() {
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		const savedAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
		
		
		return `
			<div class="checkout-step">
				<div class="step-header">
					<div class="step-title">
						<h3>Select Delivery Address</h3>
						<p>Choose where you'd like your order delivered</p>
					</div>
					<div class="step-indicator">
						<div class="step-item completed">
							<div class="step-number">1</div>
							<div class="step-label">Review</div>
						</div>
						<div class="step-line completed"></div>
						<div class="step-item active">
							<div class="step-number">2</div>
							<div class="step-label">Address</div>
						</div>
						<div class="step-line"></div>
						<div class="step-item">
							<div class="step-number">3</div>
							<div class="step-label">Payment</div>
						</div>
						<div class="step-line"></div>
						<div class="step-item">
							<div class="step-number">4</div>
							<div class="step-label">Confirm</div>
						</div>
					</div>
				</div>
				
				<div class="address-selection-container">
					${savedAddresses.length > 0 ? `
						<div class="saved-addresses-section">
							<div class="section-header">
								<h4>Your Saved Addresses</h4>
								<span class="address-count">${savedAddresses.length} ${savedAddresses.length === 1 ? 'address' : 'addresses'}</span>
							</div>
							<div class="address-options-grid">
								${savedAddresses.map(addr => `
									<div class="address-option">
										<input type="radio" name="selectedAddress" value="${addr.id}" id="addr-${addr.id}" ${addr.isDefault ? 'checked' : ''}>
										<label for="addr-${addr.id}" class="address-selection-card">
											<div class="address-card-header">
												<div class="address-type-icon">
													${addr.type === 'home' ? '🏠' : addr.type === 'work' ? '🏢' : '📍'}
												</div>
												<div class="address-info">
													<div class="address-name">${addr.fullName}</div>
													<div class="address-type">${addr.type.charAt(0).toUpperCase() + addr.type.slice(1)}</div>
												</div>
												${addr.isDefault ? '<div class="default-badge">Default</div>' : ''}
											</div>
											<div class="address-card-body">
												<div class="address-line">${addr.address}</div>
												<div class="address-location">${addr.city}, ${addr.state} - ${addr.pincode}</div>
												<div class="address-phone">📞 ${addr.phone}</div>
												${addr.landmark ? `<div class="address-landmark">📍 ${addr.landmark}</div>` : ''}
											</div>
										</label>
									</div>
								`).join('')}
							</div>
						</div>
					` : `
						<div class="no-addresses-state">
							<div class="no-addresses-content">
								<div class="no-addresses-icon">📍</div>
								<h4>No saved addresses found</h4>
								<p>Add your first address to continue with checkout</p>
							</div>
						</div>
					`}
					
					<div class="add-address-section">
						
					</div>
				</div>
				
				<div class="checkout-actions">
					<button class="btn-secondary" onclick="prevCheckoutStep()">
						<span class="btn-icon">←</span>
						Back to Review Items
					</button>
					<button class="btn-primary" onclick="nextCheckoutStep()" id="continue-to-payment-btn">
						Proceed to Payment
						<span class="btn-icon">→</span>
					</button>
				</div>
			</div>
		`;
	}
	
	function showNotification(message, type = 'info') {
		const defaultPayment = state.paymentMethods.find(pm => pm.isDefault) || state.paymentMethods[0];
		
		return `
			<div class="checkout-step">
				<div class="step-header">
					<h3>Payment Method</h3>
					<div class="step-indicator">
						<span class="step completed">1</span>
						<span class="step-line completed"></span>
						<span class="step active">2</span>
						<span class="step-line"></span>
						<span class="step">3</span>
					</div>
				</div>
				
				<div class="payment-options">
					${state.paymentMethods.map((pm, index) => `
						<div class="payment-option">
							<input type="radio" name="selectedPayment" value="${pm.id}" id="pay-${pm.id}" ${pm.isDefault ? 'checked' : ''}>
							<label for="pay-${pm.id}" class="payment-card">
								<div class="payment-icon">💳</div>
								<div class="payment-details">
									<div class="payment-brand">${pm.brand} ****${pm.last4}</div>
									<div class="payment-expiry">Expires ${pm.expiry}</div>
								</div>
							</label>
						</div>
					`).join('')}
					
					<div class="add-new-payment">
						<button type="button" class="add-payment-btn" onclick="showAddPaymentForm()">
							<span>+</span> Add New Payment Method
						</button>
					</div>
				</div>
				
				<div class="step-actions">
					<button type="button" class="btn-secondary" onclick="prevCheckoutStep()">Back to Address</button>
					<button type="button" class="btn-primary" onclick="nextCheckoutStep()">Review Order</button>
				</div>
			</div>
		`;
	}
	
	function renderReviewStep() {
		const entries = Object.values(state.cart);
		const subtotal = entries.reduce((s,i)=>s+i.qty*i.price,0);
		const shipping = 0; // Free shipping
		const tax = Math.round(subtotal * 0.18); // 18% GST
		const total = subtotal + shipping + tax;
		
		const selectedAddress = state.userAddresses.find(addr => addr.id === document.querySelector('input[name="selectedAddress"]:checked')?.value);
		const selectedPayment = state.paymentMethods.find(pm => pm.id === document.querySelector('input[name="selectedPayment"]:checked')?.value);
		
		return `
			<div class="checkout-step">
				<div class="step-header">
					<h3>Review Your Order</h3>
					<div class="step-indicator">
						<span class="step completed">1</span>
						<span class="step-line completed"></span>
						<span class="step completed">2</span>
						<span class="step-line completed"></span>
						<span class="step active">3</span>
					</div>
				</div>
				
				<div class="review-content">
					<div class="review-section">
						<h4>Delivery Address</h4>
						<div class="review-address">
							<div class="address-name">${selectedAddress?.name}</div>
							<div class="address-phone">${selectedAddress?.phone}</div>
							<div class="address-line">${selectedAddress?.address}</div>
							<div class="address-location">${selectedAddress?.city}, ${selectedAddress?.state} ${selectedAddress?.zip}</div>
						</div>
					</div>
					
					<div class="review-section">
						<h4>Payment Method</h4>
						<div class="review-payment">
							<div class="payment-brand">${selectedPayment?.brand} ****${selectedPayment?.last4}</div>
							<div class="payment-expiry">Expires ${selectedPayment?.expiry}</div>
						</div>
					</div>
					
					<div class="review-section">
						<h4>Order Items</h4>
						<div class="order-items-review">
							${entries.map(item => `
								<div class="order-item-review">
									<img src="${item.image}" alt="${item.title}" style="width:60px;height:60px;object-fit:cover;border-radius:8px">
									<div class="item-details">
										<div class="item-title">${item.title}</div>
										<div class="item-brand">${item.brand}</div>
										<div class="item-qty">Qty: ${item.qty}</div>
									</div>
									<div class="item-price">₹${(item.qty * item.price).toLocaleString()}</div>
								</div>
							`).join('')}
						</div>
					</div>
					
					<div class="order-summary">
						<div class="summary-row">
							<span>Subtotal:</span>
							<span>₹${subtotal.toLocaleString()}</span>
						</div>
						<div class="summary-row">
							<span>Shipping:</span>
							<span>₹${shipping.toLocaleString()}</span>
						</div>
						<div class="summary-row">
							<span>Tax (GST):</span>
							<span>₹${tax.toLocaleString()}</span>
						</div>
						<div class="summary-row total">
							<span>Total:</span>
							<span>₹${total.toLocaleString()}</span>
						</div>
					</div>
				</div>
				
				<div class="step-actions">
					<button type="button" class="btn-secondary" onclick="prevCheckoutStep()">Back to Payment</button>
					<button type="button" class="btn-primary" onclick="placeOrder()">Place Order</button>
				</div>
			</div>
		`;
	}
	
	function renderConfirmationStep() {
		return `
			<div class="checkout-step">
				<div class="confirmation-content">
					<div class="success-icon">✅</div>
					<h3>Order Placed Successfully!</h3>
					<p>Thank you for your purchase. Your order has been confirmed and will be processed shortly.</p>
					
					<div class="order-details-confirmation">
						<div class="detail-item">
							<span class="detail-label">Order ID:</span>
							<span class="detail-value" id="confirmation-order-id"></span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Estimated Delivery:</span>
							<span class="detail-value">3-5 business days</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Payment Method:</span>
							<span class="detail-value" id="confirmation-payment"></span>
						</div>
					</div>
				</div>
				
				<div class="step-actions">
					<button type="button" class="btn-primary" onclick="closeCheckout(); renderOrders();">View Orders</button>
					<button type="button" class="btn-secondary" onclick="clearCartAndCloseCheckout()">Continue Shopping</button>
				</div>
			</div>
		`;
	}
	
	
	
	
	function saveOrder(order){
		try {
			const orders = JSON.parse(localStorage.getItem('orders') || '[]');
			orders.push(order);
			localStorage.setItem('orders', JSON.stringify(orders));
		} catch(e) {
			console.error('Failed to save order:', e);
		}
	}
	
	function getOrders(){
		try {
			return JSON.parse(localStorage.getItem('orders') || '[]');
		} catch(e) {
			return [];
		}
	}
	
	function sendOrderEmail(order){
		// Simulate email sending (in real app, this would call an email service)
		console.log('📧 Email notification sent:', {
			to: order.userName + ' <' + order.userId + '>',
			subject: `Order Confirmation - ${order.id}`,
			body: generateEmailBody(order)
		});
		
		// Show success message
		setTimeout(() => {
			alert('📧 Order confirmation email sent to ' + order.userId);
		}, 1000);
	}
	
	function generateEmailBody(order){
		return `
Order Confirmation - ${order.id}

Dear ${order.userName},

Thank you for your order! Your order has been confirmed and payment received.

ORDER DETAILS:
${order.items.map(item => `- ${item.title} x${item.quantity} - ₹${(item.price * item.quantity).toLocaleString()}`).join('\n')}

SHIPPING ADDRESS:
${order.address.fullName}
${order.address.address}
${order.address.city}, ${order.address.state} ${order.address.zip}
Phone: ${order.address.phone}

ORDER TOTALS:
Subtotal: ₹${order.totals.subtotal.toLocaleString()}
Shipping: ₹${order.totals.shipping.toLocaleString()}
Tax: ₹${order.totals.tax.toLocaleString()}
Total: ₹${order.totals.total.toLocaleString()}

Payment Method: ${order.payment.method.toUpperCase()}

Your order will be processed and shipped within 1-2 business days.

Thank you for shopping with us!

Best regards,
Simple Product Gallery Team
		`.trim();
	}
	
	// Event listeners
	document.getElementById('checkout-btn').addEventListener('click', openCheckout);
	
	// Wishlist event listeners
	document.getElementById('open-wishlist').addEventListener('click', openWishlist);
	document.getElementById('wishlist-close').addEventListener('click', closeWishlist);
	
	
	
	
	// Orders functionality
	window.openOrders = function openOrders(){
		console.log('=== OPEN ORDERS CALLED ===');
		const ordersModal = document.getElementById('orders-modal');
		const content = document.getElementById('orders-content');
		
		console.log('Orders modal found:', !!ordersModal);
		console.log('Orders content found:', !!content);
		
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		console.log('User found:', !!user);
		
		if(!user){
			console.log('No user found, showing login prompt');
			content.innerHTML = `
				<div class="error-state">
					<div class="error-icon">🔒</div>
					<h3>Please Login</h3>
					<p>You need to be logged in to view your orders.</p>
					<button class="btn-primary" onclick="closeOrders(); window.location.href='login.html';">
						Go to Login
					</button>
				</div>
			`;
			ordersModal.classList.add('open');
			ordersModal.setAttribute('aria-hidden','false');
			return;
		}
		
		// Force reload orders from localStorage before displaying
		console.log('=== RELOADING ORDERS BEFORE DISPLAY ===');
		state.orders = loadOrders();
		console.log('Orders reloaded from localStorage:', state.orders);
		
		// No sample orders - only show actual orders
		
		// Debug: Log all orders and user info
		console.log('=== OPEN ORDERS DEBUG ===');
		console.log('Current user:', user);
		console.log('User email:', user.email);
		console.log('All orders in state:', state.orders);
		console.log('Orders count:', state.orders.length);
		
		// Check each order's userId
		state.orders.forEach((order, index) => {
			console.log(`Order ${index}:`, {
				id: order.id,
				userId: order.userId,
				userIdType: typeof order.userId,
				userEmail: user.email,
				userEmailType: typeof user.email,
				matches: order.userId === user.email,
				strictMatch: order.userId === user.email,
				looseMatch: String(order.userId).toLowerCase() === String(user.email).toLowerCase()
			});
		});
		
		// Try multiple matching strategies
		let userOrders = state.orders.filter(order => order.userId === user.email);
		
		// If no matches found, try case-insensitive matching
		if (userOrders.length === 0) {
			console.log('No exact matches found, trying case-insensitive matching...');
			userOrders = state.orders.filter(order => 
				String(order.userId).toLowerCase() === String(user.email).toLowerCase()
			);
		}
		
		// If still no matches, try partial matching
		if (userOrders.length === 0) {
			console.log('No case-insensitive matches found, trying partial matching...');
			userOrders = state.orders.filter(order => 
				String(order.userId).includes(String(user.email)) || 
				String(user.email).includes(String(order.userId))
			);
		}
		
		// Sort by date
		userOrders = userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
		
		console.log('Filtered user orders:', userOrders);
		console.log('User orders count:', userOrders.length);
		console.log('=== END DEBUG ===');
		
		if(userOrders.length === 0){
			content.innerHTML = `
				<div class="empty-orders">
					<div class="empty-icon">📦</div>
					<h3>No Orders Yet</h3>
					<p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
				</div>
			`;
		} else {
			content.innerHTML = `
				<div class="orders-list">
					<div class="orders-header">
						<h3>Your Orders (${userOrders.length})</h3>
						<p>Track and manage all your orders</p>
					</div>
					<div class="orders-items">
						${userOrders.map(order => `
							<div class="order-card" data-order-id="${order.id}">
								<div class="order-header">
									<div class="order-info">
										<div class="order-id">Order #${order.id}</div>
										<div class="order-date">Placed on ${new Date(order.date).toLocaleDateString('en-IN', { 
											year: 'numeric', 
											month: 'long', 
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}</div>
									</div>
									<div class="order-status">
										<span class="status-badge status-${order.status}">${getStatusText(order.status)}</span>
									</div>
								</div>
								
								<div class="order-items">
									${order.items.map(item => `
										<div class="order-item">
											<img src="${item.image}" alt="${item.title}" style="width:60px;height:60px;object-fit:cover;border-radius:8px">
											<div class="item-details">
												<div class="item-title">${item.title}</div>
												<div class="item-brand">${item.brand}</div>
												<div class="item-qty">Qty: ${item.quantity}</div>
												<div class="item-price">₹${(item.quantity * item.price).toLocaleString()}</div>
											</div>
										</div>
									`).join('')}
								</div>
								
								<div class="order-summary">
									<div class="summary-row">
										<span>Total Amount:</span>
										<span class="total-amount">₹${(order.total || order.totals?.total || 0).toLocaleString()}</span>
									</div>
									<div class="delivery-info">
										<div class="delivery-status">
											<span class="delivery-label">Expected Delivery:</span>
											<span class="delivery-date">${getExpectedDelivery(order.date, order.status)}</span>
										</div>
									</div>
								</div>
								
								<div class="order-actions">
									<button class="action-btn secondary" onclick="viewOrderDetails('${order.id}')">
										<span class="btn-icon">👁️</span>
										View Details
									</button>
									<button class="action-btn primary" onclick="trackOrder('${order.id}')">
										<span class="btn-icon">📍</span>
										Track Order
									</button>
									<button class="action-btn outline" onclick="reorderItems('${order.id}')">
										<span class="btn-icon">🔄</span>
										Reorder
									</button>
								</div>
							</div>
						`).join('')}
					</div>
				</div>
			`;
		}
		
		ordersModal.classList.add('open');
		ordersModal.setAttribute('aria-hidden','false');
	}
	
	window.closeOrders = function closeOrders(){
		const ordersModal = document.getElementById('orders-modal');
		ordersModal.classList.remove('open');
		ordersModal.setAttribute('aria-hidden','true');
	}
	
	function getExpectedDelivery(orderDate, status) {
		const orderDateObj = new Date(orderDate);
		const deliveryDate = new Date(orderDateObj);
		
		// Calculate expected delivery based on status
		switch(status) {
			case 'pending':
				deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days for pending
				break;
			case 'processing':
				deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 days for processing
				break;
			case 'shipped':
				deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days for shipped
				break;
			case 'delivered':
				return 'Delivered';
			case 'cancelled':
				return 'Cancelled';
			default:
				deliveryDate.setDate(deliveryDate.getDate() + 5); // Default 5 days
		}
		
		return deliveryDate.toLocaleDateString('en-IN', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
	
	
	function getStatusText(status) {
		const statusMap = {
			'confirmed': 'Order Confirmed',
			'processing': 'Processing',
			'shipped': 'Shipped',
			'delivered': 'Delivered',
			'cancelled': 'Cancelled'
		};
		return statusMap[status] || status;
	}
	
	function viewOrderDetails(orderId) {
		const order = state.orders.find(o => o.id === orderId);
		if (!order) return;
		
		const modal = document.createElement('div');
		modal.className = 'modal order-details-modal';
		modal.innerHTML = `
			<div class="modal-card" style="max-width:800px;width:95vw;max-height:90vh;overflow-y:auto">
				<div class="modal-header">
					<h2>Order Details - #${order.id}</h2>
					<button onclick="this.closest('.modal').remove()" aria-label="Close">✕</button>
				</div>
				<div class="modal-body">
					<div class="order-details-content">
						<div class="details-section">
							<h3>Order Information</h3>
							<div class="detail-grid">
								<div class="detail-item">
									<span class="detail-label">Order ID:</span>
									<span class="detail-value">#${order.id}</span>
								</div>
								<div class="detail-item">
									<span class="detail-label">Order Date:</span>
									<span class="detail-value">${new Date(order.date).toLocaleDateString('en-IN', { 
										year: 'numeric', 
										month: 'long', 
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}</span>
								</div>
								<div class="detail-item">
									<span class="detail-label">Status:</span>
									<span class="detail-value"><span class="status-badge status-${order.status}">${getStatusText(order.status)}</span></span>
								</div>
							</div>
						</div>
						
						<div class="details-section">
							<h3>Delivery Address</h3>
							<div class="address-details">
								<div class="address-name">${order.address.fullName}</div>
								<div class="address-phone">${order.address.phone}</div>
								<div class="address-line">${order.address.address}</div>
								<div class="address-location">${order.address.city}, ${order.address.state} ${order.address.zip}</div>
							</div>
						</div>
						
						<div class="details-section">
							<h3>Payment Information</h3>
							<div class="payment-details">
								<div class="payment-method">${order.payment.method} ${order.payment.cardNumber}</div>
								<div class="payment-amount">Amount: ₹${order.payment.amount.toLocaleString()}</div>
							</div>
						</div>
						
						<div class="details-section">
							<h3>Order Items</h3>
							<div class="order-items-detail">
						${order.items.map(item => `
									<div class="order-item-detail">
										<img src="${item.image}" alt="${item.title}" style="width:80px;height:80px;object-fit:cover;border-radius:8px">
										<div class="item-info">
											<div class="item-title">${item.title}</div>
											<div class="item-brand">${item.brand}</div>
											<div class="item-specs">Quantity: ${item.quantity}</div>
								</div>
										<div class="item-price">₹${(item.quantity * item.price).toLocaleString()}</div>
							</div>
						`).join('')}
					</div>
				</div>
				
						<div class="details-section">
							<h3>Order Summary</h3>
							<div class="order-summary-detail">
								<div class="summary-row">
									<span>Subtotal:</span>
									<span>₹${order.totals.subtotal.toLocaleString()}</span>
					</div>
								<div class="summary-row">
									<span>Shipping:</span>
									<span>₹${order.totals.shipping.toLocaleString()}</span>
					</div>
								<div class="summary-row">
									<span>Tax (GST):</span>
									<span>₹${order.totals.tax.toLocaleString()}</span>
					</div>
								<div class="summary-row total">
									<span>Total:</span>
									<span>₹${order.totals.total.toLocaleString()}</span>
					</div>
				</div>
			</div>
					</div>
				</div>
			</div>
		`;
		
		document.body.appendChild(modal);
		modal.classList.add('open');
		modal.setAttribute('aria-hidden', 'false');
		
		// Close modal when clicking outside
		modal.addEventListener('click', (e) => {
			if (e.target === modal) {
				modal.remove();
			}
		});
	}
	
	function trackOrder(orderId) {
		const order = state.orders.find(o => o.id === orderId);
		if (!order) return;
		
		alert(`Order #${orderId} tracking:\n\nStatus: ${getStatusText(order.status)}\nLast Updated: ${new Date(order.tracking.timestamp).toLocaleString()}\nMessage: ${order.tracking.message}`);
	}
	
	function downloadInvoice(orderId) {
		alert(`Invoice download for Order #${orderId} would be implemented here. In a real application, this would generate and download a PDF invoice.`);
	}
	
	function reorderItems(orderId) {
		const order = state.orders.find(o => o.id === orderId);
		if (!order) return;
		
		// Add all items from the order back to cart
		order.items.forEach(item => {
			const product = window.products.find(p => p.id === item.id);
			if (product) {
				addToCart(item.id);
			}
		});
		
		alert('Items have been added to your cart!');
		renderCart();
		updateCartCount();
	}
	
	// Event listeners for orders and checkout will be set up in setupEventHandlers()

	// ----- Three Dots Menu Modal Functions -----
	
	// Notifications Modal
	function openNotificationsModal() {
		const modal = document.getElementById('notifications-modal');
		const content = document.getElementById('notifications-list');
		
		const unreadCount = state.notifications.filter(n => !n.read).length;
		document.getElementById('notification-count').textContent = unreadCount;
		
		content.innerHTML = state.notifications.map(notification => `
			<div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
				<div class="notification-icon">
					${notification.type === 'order' ? '📦' : 
					  notification.type === 'promotion' ? '🎉' : 
					  notification.type === 'product' ? '🛍️' : '📢'}
				</div>
				<div class="notification-content">
					<div class="notification-title">${notification.title}</div>
					<div class="notification-message">${notification.message}</div>
					<div class="notification-time">${formatTime(notification.timestamp)}</div>
				</div>
				${!notification.read ? '<div class="notification-dot"></div>' : ''}
			</div>
		`).join('');
		
		modal.classList.add('open');
		modal.setAttribute('aria-hidden', 'false');
		
		// Mark as read when opened
		state.notifications.forEach(n => n.read = true);
		saveNotifications();
		updateNotificationCount();
	}
	
	function closeNotificationsModal() {
		const modal = document.getElementById('notifications-modal');
		modal.classList.remove('open');
		modal.setAttribute('aria-hidden', 'true');
	}
	
	function updateNotificationCount() {
		const unreadCount = state.notifications.filter(n => !n.read).length;
		const badge = document.getElementById('notification-count');
		if (badge) {
			badge.textContent = unreadCount;
			badge.style.display = unreadCount > 0 ? 'flex' : 'none';
		}
	}
	
	
	// Addresses Modal
	function openAddressesModal() {
		console.log('Opening addresses modal...');
		const modal = document.getElementById('addresses-modal');
		const content = document.getElementById('addresses-content');
		const savedAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
		
		console.log('Modal element:', modal);
		console.log('Content element:', content);
		console.log('Saved addresses:', savedAddresses);
		
		content.innerHTML = `
			<div class="addresses-header">
				<h3>Manage Your Addresses</h3>
				<button class="add-address-btn" onclick="showAddressForm()">
					<span class="btn-icon">➕</span>
					<span class="btn-text">Add New Address</span>
				</button>
			</div>
			
			<div class="addresses-list" id="addresses-list">
				${savedAddresses.length > 0 ? savedAddresses.map(address => `
					<div class="address-card ${address.isDefault ? 'default' : ''}" data-id="${address.id}">
						<div class="address-header">
							<div class="address-type">
								<span class="type-icon">${address.type === 'home' ? '🏠' : address.type === 'work' ? '🏢' : '📍'}</span>
								<span class="type-text">${address.type.charAt(0).toUpperCase() + address.type.slice(1)}</span>
								${address.isDefault ? '<span class="default-badge">Default</span>' : ''}
							</div>
							<div class="address-actions">
								${!address.isDefault ? `
									<button class="set-default-btn" onclick="setDefaultAddress('${address.id}')" title="Set as default">
										<span class="btn-icon">⭐</span>
										Set Default
									</button>
								` : ''}
								<button class="edit-address-btn" onclick="editAddress('${address.id}')" title="Edit address">
									<span class="btn-icon">✏️</span>
									Edit
								</button>
								<button class="delete-address-btn" onclick="deleteAddress('${address.id}')" title="Delete address">
									<span class="btn-icon">🗑️</span>
									Delete
								</button>
							</div>
						</div>
						<div class="address-details">
							<div class="address-name">${address.fullName}</div>
							<div class="address-line1">${address.address}</div>
							<div class="address-line2">${address.city}, ${address.state} - ${address.pincode}</div>
							<div class="address-phone">Phone: ${address.phone}</div>
							${address.landmark ? `<div class="address-landmark">Landmark: ${address.landmark}</div>` : ''}
						</div>
					</div>
				`).join('') : `
					<div class="no-addresses">
						<div class="no-addresses-content">
							<span class="no-addresses-icon">📍</span>
							<h4>No addresses saved</h4>
							<p>Add your first address to get started</p>
						</div>
					</div>
				`}
			</div>
			
			<!-- Address Form (Hidden by default) -->
			<div class="address-form-container" id="address-form-container" style="display: none;">
				<div class="address-form-header">
					<h4 id="form-title">Add New Address</h4>
					<button class="close-form-btn" onclick="hideAddressForm()">×</button>
				</div>
				<form id="address-form" onsubmit="saveAddress(event)">
					<div class="form-row">
						<div class="form-group">
							<label for="fullName">Full Name *</label>
							<input type="text" id="fullName" name="fullName" required>
						</div>
						<div class="form-group">
							<label for="phone">Phone Number *</label>
							<input type="tel" id="phone" name="phone" required>
						</div>
					</div>
					
					<div class="form-group">
						<label for="address">Address *</label>
						<textarea id="address" name="address" rows="3" required></textarea>
					</div>
					
					<div class="form-row">
						<div class="form-group">
							<label for="city">City *</label>
							<input type="text" id="city" name="city" required>
						</div>
						<div class="form-group">
							<label for="state">State *</label>
							<input type="text" id="state" name="state" required>
						</div>
						<div class="form-group">
							<label for="pincode">Pincode *</label>
							<input type="text" id="pincode" name="pincode" required>
						</div>
					</div>
					
					<div class="form-group">
						<label for="landmark">Landmark (Optional)</label>
						<input type="text" id="landmark" name="landmark">
					</div>
					
					<div class="form-group">
						<label for="type">Address Type</label>
						<select id="type" name="type" required class="address-type-select">
							<option value="home">🏠 Home</option>
							<option value="work">🏢 Work</option>
							<option value="other">📍 Other</option>
						</select>
					</div>
					
					<div class="form-actions">
						<div class="form-actions-left">
							<label for="isDefault" class="default-checkbox-label">
								<input type="checkbox" id="isDefault" name="isDefault" class="default-checkbox">
								Set as default address
							</label>
						</div>
						<div class="form-actions-right">
							<button type="button" class="btn-secondary" onclick="hideAddressForm()">Cancel</button>
							<button type="submit" class="btn-primary">Save Address</button>
						</div>
					</div>
				</form>
			</div>
		`;
		
		modal.classList.add('open');
		modal.setAttribute('aria-hidden', 'false');
	}
	
	function closeAddressesModal() {
		const modal = document.getElementById('addresses-modal');
		modal.classList.remove('open');
		modal.setAttribute('aria-hidden', 'true');
	}
	
	// Address Form Functions
	function showAddressForm() {
		console.log('Showing address form...');
		const formContainer = document.getElementById('address-form-container');
		const formTitle = document.getElementById('form-title');
		const form = document.getElementById('address-form');
		
		console.log('Form container:', formContainer);
		console.log('Form title:', formTitle);
		console.log('Form:', form);
		
		if (formContainer) {
			formTitle.textContent = 'Add New Address';
			form.reset();
			formContainer.style.display = 'block';
			formContainer.scrollIntoView({ behavior: 'smooth' });
			console.log('Form should be visible now');
			
			// Setup phone formatting
			setupPhoneFormatting();
		} else {
			console.error('Form container not found!');
		}
	}
	
	function hideAddressForm() {
		const formContainer = document.getElementById('address-form-container');
		if (formContainer) {
			formContainer.style.display = 'none';
		}
	}
	
	function saveAddress(event) {
		console.log('Saving address...');
		event.preventDefault();
		
		const form = event.target;
		const formData = new FormData(form);
		
		console.log('Form data:', Object.fromEntries(formData.entries()));
		
		// Validate required fields
		const requiredFields = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
		for (let field of requiredFields) {
			if (!formData.get(field) || formData.get(field).trim() === '') {
				showNotification(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
				return;
			}
		}
		
		// Validate phone number (more flexible validation)
		const phone = formData.get('phone');
		const cleanPhone = phone.replace(/\D/g, ''); // Remove all non-digits
		if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
			showNotification('Please enter a valid 10-digit phone number starting with 6-9', 'error');
			return;
		}
		
		// Validate pincode
		const pincode = formData.get('pincode');
		if (!/^\d{6}$/.test(pincode)) {
			showNotification('Please enter a valid 6-digit pincode', 'error');
			return;
		}
		
		const address = {
			id: form.getAttribute('data-edit-id') || 'addr_' + Date.now(),
			fullName: formData.get('fullName').trim(),
			phone: cleanPhone, // Use cleaned phone number
			address: formData.get('address').trim(),
			city: formData.get('city').trim(),
			state: formData.get('state').trim(),
			pincode: formData.get('pincode').trim(),
			landmark: formData.get('landmark')?.trim() || '',
			type: formData.get('type'),
			isDefault: formData.get('isDefault') === 'on',
			createdAt: new Date().toISOString()
		};
		
		// Get existing addresses
		const savedAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
		
		// Check if editing existing address
		const isEditing = form.getAttribute('data-edit-id');
		if (isEditing) {
			// Update existing address
			const index = savedAddresses.findIndex(addr => addr.id === isEditing);
			if (index !== -1) {
				savedAddresses[index] = address;
			}
		} else {
			// Add new address
			savedAddresses.push(address);
		}
		
		// If this is set as default, remove default from others
		if (address.isDefault) {
			savedAddresses.forEach(addr => {
				if (addr.id !== address.id) {
					addr.isDefault = false;
				}
			});
		}
		
		// If this is the first address, make it default automatically
		if (savedAddresses.length === 0) {
			address.isDefault = true;
		}
		
		// Save to localStorage
		localStorage.setItem('userAddresses', JSON.stringify(savedAddresses));
		
		// Show success message
		showNotification(isEditing ? 'Address updated successfully!' : 'Address saved successfully!', 'success');
		
		// Hide form and refresh list
		hideAddressForm();
		openAddressesModal(); // Refresh the modal
		
		// If we're on checkout step 2 (address selection), refresh it
		if (typeof currentCheckoutStep !== 'undefined' && currentCheckoutStep === 2) {
			setTimeout(() => {
				renderCheckoutStep(2);
				showNotification('Address list updated! Please select your delivery address.', 'info');
			}, 100);
		}
	}
	
	function editAddress(addressId) {
		const savedAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
		const address = savedAddresses.find(addr => addr.id === addressId);
		
		if (!address) return;
		
		const formContainer = document.getElementById('address-form-container');
		const formTitle = document.getElementById('form-title');
		const form = document.getElementById('address-form');
		
		if (formContainer) {
			formTitle.textContent = 'Edit Address';
			
			// Populate form with address data
			document.getElementById('fullName').value = address.fullName;
			document.getElementById('phone').value = address.phone;
			document.getElementById('address').value = address.address;
			document.getElementById('city').value = address.city;
			document.getElementById('state').value = address.state;
			document.getElementById('pincode').value = address.pincode;
			document.getElementById('landmark').value = address.landmark;
			document.getElementById('type').value = address.type;
			document.getElementById('isDefault').checked = address.isDefault;
			
			// Store the address ID for updating
			form.setAttribute('data-edit-id', addressId);
			
			formContainer.style.display = 'block';
			formContainer.scrollIntoView({ behavior: 'smooth' });
			
			// Setup phone formatting
			setupPhoneFormatting();
		}
	}
	
	function deleteAddress(addressId) {
		if (confirm('Are you sure you want to delete this address?')) {
			const savedAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
			const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressId);
			
			// If we deleted the default address, make the first remaining address default
			if (savedAddresses.find(addr => addr.id === addressId)?.isDefault && updatedAddresses.length > 0) {
				updatedAddresses[0].isDefault = true;
			}
			
			localStorage.setItem('userAddresses', JSON.stringify(updatedAddresses));
			showNotification('Address deleted successfully!', 'success');
			
			// Refresh the modal
			openAddressesModal();
		}
	}
	
	function setDefaultAddress(addressId) {
		const savedAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
		
		// Remove default from all addresses
		savedAddresses.forEach(addr => {
			addr.isDefault = false;
		});
		
		// Set the selected address as default
		const address = savedAddresses.find(addr => addr.id === addressId);
		if (address) {
			address.isDefault = true;
			localStorage.setItem('userAddresses', JSON.stringify(savedAddresses));
			showNotification('Default address updated successfully!', 'success');
			
			// Refresh the modal
			openAddressesModal();
		}
	}
	
	function getDefaultAddress() {
		const savedAddresses = JSON.parse(localStorage.getItem('userAddresses') || '[]');
		return savedAddresses.find(addr => addr.isDefault) || savedAddresses[0] || null;
	}
	
	function getAllAddresses() {
		return JSON.parse(localStorage.getItem('userAddresses') || '[]');
	}
	
	// Payment Methods Modal
	function openPaymentMethodsModal() {
		const modal = document.getElementById('settings-modal'); // Reusing settings modal
		const content = document.getElementById('settings-content');
		
		content.innerHTML = `
			<div class="payment-methods-header">
				<h3>Payment Methods</h3>
				<button class="add-payment-btn">
					<span class="btn-icon">➕</span>
					<span class="btn-text">Add Payment Method</span>
				</button>
			</div>
			
			<div class="payment-methods-list">
				${state.paymentMethods.map(pm => `
					<div class="payment-method-card ${pm.isDefault ? 'default' : ''}" data-id="${pm.id}">
						<div class="payment-icon">💳</div>
						<div class="payment-details">
							<div class="payment-brand">${pm.brand} •••• ${pm.last4}</div>
							<div class="payment-expiry">Expires ${pm.expiry}</div>
							${pm.isDefault ? '<div class="default-badge">Default</div>' : ''}
						</div>
						<div class="payment-actions">
							<button class="edit-payment-btn">Edit</button>
							<button class="delete-payment-btn">Delete</button>
						</div>
					</div>
				`).join('')}
			</div>
		`;
		
		modal.classList.add('open');
		modal.setAttribute('aria-hidden', 'false');
	}
	
	// Recently Viewed Modal
	function openRecentlyViewedModal() {
		const modal = document.getElementById('recently-viewed-modal');
		const content = document.getElementById('recently-viewed-content');
		
		if (state.recentlyViewed.length === 0) {
			content.innerHTML = `
				<div class="empty-state">
					<div class="empty-icon">🕒</div>
					<h3>No Recently Viewed Items</h3>
					<p>Start browsing products to see them here</p>
					<button class="browse-btn" onclick="closeRecentlyViewedModal(); state.category='All'; renderGrid();">Browse Products</button>
				</div>
			`;
		} else {
			content.innerHTML = `
				<div class="recently-viewed-grid">
					${state.recentlyViewed.map(item => `
						<div class="recent-item-card" data-id="${item.id}">
							<img src="${item.image}" alt="${item.title}" class="recent-item-image">
							<div class="recent-item-info">
								<h4>${item.title}</h4>
								<p>${item.brand}</p>
								<div class="recent-item-price">₹${item.price.toLocaleString()}</div>
							</div>
						</div>
					`).join('')}
				</div>
			`;
		}
		
		modal.classList.add('open');
		modal.setAttribute('aria-hidden', 'false');
	}
	
	function closeRecentlyViewedModal() {
		const modal = document.getElementById('recently-viewed-modal');
		modal.classList.remove('open');
		modal.setAttribute('aria-hidden', 'true');
	}
	
	// Recommendations Modal
	function openRecommendationsModal() {
		const modal = document.getElementById('recommendations-modal');
		const content = document.getElementById('recommendations-content');
		
		// Generate recommendations based on user's browsing history and preferences
		const recommendations = generateRecommendations();
		
		content.innerHTML = `
			<div class="recommendations-header">
				<h3>Recommended for You</h3>
				<p>Based on your browsing history and preferences</p>
			</div>
			
			<div class="recommendations-grid">
				${recommendations.map(product => `
					<div class="recommendation-card" data-id="${product.id}">
						<img src="${product.image}" alt="${product.title}" class="recommendation-image">
						<div class="recommendation-info">
							<h4>${product.title}</h4>
							<p>${product.brand}</p>
							<div class="recommendation-rating">
								<span class="stars">${generateStars(product.rating)}</span>
								<span class="rating-text">${product.rating}</span>
							</div>
							<div class="recommendation-price">₹${product.price.toLocaleString()}</div>
							<button class="add-to-cart-btn" data-add="${product.id}">
								<span class="btn-icon">🛒</span>
								<span class="btn-text">Add to Cart</span>
							</button>
						</div>
					</div>
				`).join('')}
			</div>
		`;
		
		modal.classList.add('open');
		modal.setAttribute('aria-hidden', 'false');
	}
	
	function closeRecommendationsModal() {
		const modal = document.getElementById('recommendations-modal');
		modal.classList.remove('open');
		modal.setAttribute('aria-hidden', 'true');
	}
	
	// Settings Modal
	function openSettingsModal() {
		const modal = document.getElementById('settings-modal');
		const content = document.getElementById('settings-content');
		
		// Load current settings
		const currentSettings = loadSettings();
		const currentTheme = localStorage.getItem('theme') || 'dark';
		
		content.innerHTML = `
			<div class="settings-sections">
				<div class="settings-section">
					<h3>Account Settings</h3>
					<div class="setting-item">
						<label>Email Notifications</label>
						<label class="toggle-switch">
							<input type="checkbox" id="email-notifications" ${currentSettings.emailNotifications ? 'checked' : ''}>
							<span class="toggle-slider"></span>
						</label>
					</div>
					<div class="setting-item">
						<label>SMS Notifications</label>
						<label class="toggle-switch">
							<input type="checkbox" id="sms-notifications" ${currentSettings.smsNotifications ? 'checked' : ''}>
							<span class="toggle-slider"></span>
						</label>
					</div>
					<div class="setting-item">
						<label>Push Notifications</label>
						<label class="toggle-switch">
							<input type="checkbox" id="push-notifications" ${currentSettings.pushNotifications ? 'checked' : ''}>
							<span class="toggle-slider"></span>
						</label>
					</div>
				</div>
				
				<div class="settings-section">
					<h3>Display Settings</h3>
					<div class="setting-item">
						<label>Theme</label>
						<select id="theme-selector">
							<option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Dark Mode</option>
							<option value="light" ${currentTheme === 'light' ? 'selected' : ''}>Light Mode</option>
							<option value="auto" ${currentTheme === 'auto' ? 'selected' : ''}>Auto</option>
						</select>
					</div>
				</div>
			</div>
			
			<div class="settings-actions">
				<button class="save-settings-btn" id="save-settings">Save Settings</button>
				<button class="reset-settings-btn" id="reset-settings">Reset to Default</button>
			</div>
		`;
		
		modal.classList.add('open');
		modal.setAttribute('aria-hidden', 'false');
		
		// Add event listeners
		document.getElementById('save-settings').addEventListener('click', saveSettings);
		document.getElementById('reset-settings').addEventListener('click', resetSettings);
	}
	
	function closeSettingsModal() {
		const modal = document.getElementById('settings-modal');
		modal.classList.remove('open');
		modal.setAttribute('aria-hidden', 'true');
	}
	
	// Settings Functions
	function loadSettings() {
		try {
			const saved = localStorage.getItem('userSettings');
			return saved ? JSON.parse(saved) : {
				emailNotifications: true,
				smsNotifications: false,
				pushNotifications: true
			};
		} catch(err) {
			return {
				emailNotifications: true,
				smsNotifications: false,
				pushNotifications: true
			};
		}
	}
	
	function saveSettings() {
		const settings = {
			emailNotifications: document.getElementById('email-notifications').checked,
			smsNotifications: document.getElementById('sms-notifications').checked,
			pushNotifications: document.getElementById('push-notifications').checked
		};
		
		const theme = document.getElementById('theme-selector').value;
		
		// Save settings to localStorage
		localStorage.setItem('userSettings', JSON.stringify(settings));
		localStorage.setItem('theme', theme);
		
		// Apply theme immediately
		document.documentElement.setAttribute('data-theme', theme);
		updateThemeIcon(theme);
		
		// Show success message
		showNotification('Settings saved successfully!', 'success');
		
		// Close modal after a short delay
		setTimeout(() => {
			closeSettingsModal();
		}, 1000);
	}
	
	function resetSettings() {
		// Reset to default values
		document.getElementById('email-notifications').checked = true;
		document.getElementById('sms-notifications').checked = false;
		document.getElementById('push-notifications').checked = true;
		document.getElementById('theme-selector').value = 'dark';
		
		// Save default settings
		const defaultSettings = {
			emailNotifications: true,
			smsNotifications: false,
			pushNotifications: true
		};
		
		localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
		localStorage.setItem('theme', 'dark');
		
		// Apply default theme
		document.documentElement.setAttribute('data-theme', 'dark');
		updateThemeIcon('dark');
		
		// Show success message
		showNotification('Settings reset to default values!', 'success');
		
		// Close modal after a short delay
		setTimeout(() => {
			closeSettingsModal();
		}, 1000);
	}
	
	// Help & Support Modal
	function openHelpModal() {
		const modal = document.getElementById('help-modal');
		const content = document.getElementById('help-content');
		
		content.innerHTML = `
			<div class="help-sections">
				<div class="help-section">
					<h3>Frequently Asked Questions</h3>
					<div class="faq-list">
						<div class="faq-item">
							<div class="faq-question">How do I track my order?</div>
							<div class="faq-answer">You can track your order by going to "My Orders" in the three-dots menu and clicking on your order number.</div>
						</div>
						<div class="faq-item">
							<div class="faq-question">What is your return policy?</div>
							<div class="faq-answer">We offer a 30-day return policy for most items. Some items may have different return policies.</div>
						</div>
						<div class="faq-item">
							<div class="faq-question">How do I change my address?</div>
							<div class="faq-answer">Go to "Your Addresses" in the three-dots menu to add, edit, or delete addresses.</div>
						</div>
						<div class="faq-item">
							<div class="faq-question">What payment methods do you accept?</div>
							<div class="faq-answer">We accept all major credit cards, debit cards, and digital payment methods.</div>
						</div>
					</div>
				</div>
				
				<div class="help-section">
					<h3>Contact Support</h3>
					<div class="contact-options">
						<div class="contact-option">
							<div class="contact-icon">📧</div>
							<div class="contact-info">
								<h4>Email Support</h4>
								<p>support@shophub.com</p>
								<small>Response within 24 hours</small>
							</div>
						</div>
						<div class="contact-option">
							<div class="contact-icon">📞</div>
							<div class="contact-info">
								<h4>Phone Support</h4>
								<p>+1 (555) 123-4567</p>
								<small>Mon-Fri, 9AM-6PM EST</small>
							</div>
						</div>
						<div class="contact-option">
							<div class="contact-icon">💬</div>
							<div class="contact-info">
								<h4>Live Chat</h4>
								<p>Available 24/7</p>
								<small>Click to start chat</small>
							</div>
						</div>
					</div>
				</div>
				
			</div>
		`;
		
		modal.classList.add('open');
		modal.setAttribute('aria-hidden', 'false');
	}
	
	function closeHelpModal() {
		const modal = document.getElementById('help-modal');
		modal.classList.remove('open');
		modal.setAttribute('aria-hidden', 'true');
	}
	
	// Feedback Modal
	function openFeedbackModal() {
		const modal = document.getElementById('feedback-modal');
		const content = document.getElementById('feedback-content');
		
		content.innerHTML = `
			<div class="feedback-form">
				<div class="feedback-section">
					<h3>Share Your Feedback</h3>
					<p>We value your opinion and would love to hear from you!</p>
				</div>
				
				<form id="feedback-form">
					<div class="form-group">
						<label>Feedback Type</label>
						<select name="feedback-type" required>
							<option value="">Select type...</option>
							<option value="suggestion">Suggestion</option>
							<option value="bug">Bug Report</option>
							<option value="compliment">Compliment</option>
							<option value="complaint">Complaint</option>
						</select>
					</div>
					
					<div class="form-group">
						<label>Rating</label>
						<div class="rating-input">
							<input type="radio" name="rating" value="5" id="rating-5">
							<label for="rating-5">⭐</label>
							<input type="radio" name="rating" value="4" id="rating-4">
							<label for="rating-4">⭐</label>
							<input type="radio" name="rating" value="3" id="rating-3">
							<label for="rating-3">⭐</label>
							<input type="radio" name="rating" value="2" id="rating-2">
							<label for="rating-2">⭐</label>
							<input type="radio" name="rating" value="1" id="rating-1">
							<label for="rating-1">⭐</label>
						</div>
					</div>
					
					<div class="form-group">
						<label>Subject</label>
						<input type="text" name="subject" placeholder="Brief description of your feedback" required>
					</div>
					
					<div class="form-group">
						<label>Message</label>
						<textarea name="message" placeholder="Tell us more about your experience..." rows="5" required></textarea>
					</div>
					
					<div class="form-group">
						<label class="checkbox-label">
							<input type="checkbox" name="contact-permission">
							<span class="checkmark"></span>
							I would like to be contacted about this feedback
						</label>
					</div>
					
					<div class="feedback-actions">
						<button type="submit" class="submit-feedback-btn">Submit Feedback</button>
						<button type="button" class="cancel-feedback-btn" id="cancel-feedback">Cancel</button>
					</div>
				</form>
			</div>
		`;
		
		modal.classList.add('open');
		modal.setAttribute('aria-hidden', 'false');
		
		// Add form submission handler
		document.getElementById('feedback-form').addEventListener('submit', (e) => {
			e.preventDefault();
			const formData = new FormData(e.target);
			const feedback = Object.fromEntries(formData.entries());
			
			// Validate required fields
			if (!feedback['feedback-type'] || !feedback.subject || !feedback.message) {
				showNotification('Please fill in all required fields.', 'error');
				return;
			}
			
			// Save feedback to localStorage (in a real app, this would be sent to a server)
			saveFeedback(feedback);
			
			showNotification('Thank you for your feedback! We appreciate your input.', 'success');
			
			// Close modal after a short delay
			setTimeout(() => {
				closeFeedbackModal();
				// Show the submitted feedback
				openViewFeedbackModal();
			}, 1500);
		});
		
		// Add cancel button handler
		document.getElementById('cancel-feedback').addEventListener('click', () => {
			closeFeedbackModal();
		});
	}
	
	function closeFeedbackModal() {
		const modal = document.getElementById('feedback-modal');
		modal.classList.remove('open');
		modal.setAttribute('aria-hidden', 'true');
	}
	
	// Feedback Functions
	function saveFeedback(feedback) {
		try {
			const feedbacks = JSON.parse(localStorage.getItem('userFeedbacks') || '[]');
			const feedbackEntry = {
				id: 'fb_' + Date.now(),
				...feedback,
				submittedAt: new Date().toISOString(),
				status: 'submitted'
			};
			feedbacks.push(feedbackEntry);
			localStorage.setItem('userFeedbacks', JSON.stringify(feedbacks));
		} catch(err) {
			console.error('Failed to save feedback:', err);
		}
	}
	
	// View Feedback Modal
	function openViewFeedbackModal() {
		const modal = document.getElementById('view-feedback-modal');
		const content = document.getElementById('view-feedback-content');
		
		try {
			const feedbacks = JSON.parse(localStorage.getItem('userFeedbacks') || '[]');
			
			if (feedbacks.length === 0) {
				content.innerHTML = `
					<div class="empty-feedback">
						<div class="empty-icon">📝</div>
						<h3>No Feedback Submitted Yet</h3>
						<p>You haven't submitted any feedback yet. Click on "Feedback" to share your thoughts with us!</p>
						<button class="btn-primary submit-feedback-from-view" data-action="submit-feedback">
							Submit Feedback
						</button>
					</div>
				`;
			} else {
				content.innerHTML = `
					<div class="feedback-list">
						<div class="feedback-header">
							<h3>Your Submitted Feedback (${feedbacks.length})</h3>
							<p>Here's all the feedback you've shared with us:</p>
						</div>
						<div class="feedback-items">
							${feedbacks.map(feedback => `
								<div class="feedback-item">
									<div class="feedback-meta">
										<div class="feedback-type-badge ${feedback['feedback-type']}">
											${feedback['feedback-type'].charAt(0).toUpperCase() + feedback['feedback-type'].slice(1)}
										</div>
										<div class="feedback-date">
											${new Date(feedback.submittedAt).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'short',
												day: 'numeric',
												hour: '2-digit',
												minute: '2-digit'
											})}
										</div>
									</div>
									<div class="feedback-content">
										<div class="feedback-subject">${feedback.subject}</div>
										<div class="feedback-message">${feedback.message}</div>
										${feedback.rating ? `
											<div class="feedback-rating">
												<span class="rating-label">Rating:</span>
												<span class="rating-stars">${'⭐'.repeat(parseInt(feedback.rating))}</span>
											</div>
										` : ''}
									</div>
									<div class="feedback-status">
										<span class="status-badge ${feedback.status}">
											${feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
										</span>
									</div>
								</div>
							`).join('')}
						</div>
						<div class="feedback-actions">
							<button class="btn-primary submit-feedback-from-view" data-action="submit-feedback">
								Submit New Feedback
							</button>
						</div>
					</div>
				`;
			}
		} catch(err) {
			console.error('Failed to load feedback:', err);
			content.innerHTML = `
				<div class="error-state">
					<div class="error-icon">❌</div>
					<h3>Error Loading Feedback</h3>
					<p>There was an error loading your feedback. Please try again later.</p>
				</div>
			`;
		}
		
		modal.classList.add('open');
		modal.setAttribute('aria-hidden', 'false');
		
		// Add event listener for submit feedback buttons
		const submitButtons = modal.querySelectorAll('.submit-feedback-from-view');
		submitButtons.forEach(button => {
			button.addEventListener('click', () => {
				closeViewFeedbackModal();
				openFeedbackModal();
			});
		});
	}
	
	function closeViewFeedbackModal() {
		const modal = document.getElementById('view-feedback-modal');
		modal.classList.remove('open');
		modal.setAttribute('aria-hidden', 'true');
	}
	
	
	// Contact Modal (reusing help modal)
	function openContactModal() {
		openHelpModal();
	}
	
	// Profile Modal
	function openProfileModal() {
		const modal = document.getElementById('profile-modal');
		const content = document.getElementById('profile-content');
		
		// Get current user
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : { name: 'User', email: 'user@example.com', role: 'customer' };
		
		// Calculate statistics
		const cartItems = Object.values(state.cart);
		const wishlistItems = Object.values(state.wishlist);
		const totalCartItems = cartItems.reduce((sum, item) => sum + (item.qty || 0), 0);
		const totalWishlistItems = wishlistItems.length;
		const totalOrders = state.orders.length;
		const totalCartValue = cartItems.reduce((sum, item) => sum + ((item.qty || 0) * (item.price || 0)), 0);
		
		content.innerHTML = `
			<div class="profile-content">
				<div class="profile-header">
					<div class="profile-avatar">
						<div class="avatar-circle">
							<span class="avatar-text">${user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
						</div>
					</div>
					<div class="profile-info">
						<h3 class="profile-name">${user.name || 'User'}</h3>
						<p class="profile-email">${user.email || 'user@example.com'}</p>
						<span class="profile-role">${user.role || 'customer'}</span>
					</div>
				</div>
				
				<div class="profile-stats">
					<div class="stat-card">
						<div class="stat-icon">🛒</div>
						<div class="stat-info">
							<div class="stat-number">${totalCartItems}</div>
							<div class="stat-label">Cart Items</div>
						</div>
					</div>
					
					<div class="stat-card">
						<div class="stat-icon">♡</div>
						<div class="stat-info">
							<div class="stat-number">${totalWishlistItems}</div>
							<div class="stat-label">Wishlist Items</div>
						</div>
					</div>
					
					<div class="stat-card">
						<div class="stat-icon">📦</div>
						<div class="stat-info">
							<div class="stat-number">${totalOrders}</div>
							<div class="stat-label">Total Orders</div>
						</div>
					</div>
				</div>
				
				<div class="profile-summary">
					<h4>Account Summary</h4>
					<div class="summary-item">
						<span class="summary-label">Cart Value:</span>
						<span class="summary-value">₹${totalCartValue.toLocaleString()}</span>
					</div>
					<div class="summary-item">
						<span class="summary-label">Member Since:</span>
						<span class="summary-value">${new Date().getFullYear()}</span>
					</div>
					<div class="summary-item">
						<span class="summary-label">Recently Viewed:</span>
						<span class="summary-value">${state.recentlyViewed.length} items</span>
					</div>
				</div>
				
				<div class="profile-actions">
					<button class="profile-action-btn" onclick="openAddressesModal(); closeProfileModal();">
						<span class="action-icon">📍</span>
						<span class="action-text">Manage Addresses</span>
					</button>
				</div>
			</div>
		`;
		
		modal.classList.add('open');
		modal.setAttribute('aria-hidden', 'false');
	}
	
	function closeProfileModal() {
		const modal = document.getElementById('profile-modal');
		modal.classList.remove('open');
		modal.setAttribute('aria-hidden', 'true');
	}
	
	// Utility Functions
	function formatTime(timestamp) {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now - date;
		
		if (diff < 60000) return 'Just now';
		if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
		if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
		return date.toLocaleDateString();
	}
	
	function generateRecommendations() {
		// Simple recommendation algorithm based on user's browsing history
		const viewedCategories = state.recentlyViewed.map(item => item.category);
		const categoryCount = {};
		viewedCategories.forEach(cat => {
			categoryCount[cat] = (categoryCount[cat] || 0) + 1;
		});
		
		const topCategory = Object.keys(categoryCount).reduce((a, b) => 
			categoryCount[a] > categoryCount[b] ? a : b, 'Electronics'
		);
		
		// Return products from the most viewed category
		return products.filter(p => p.category === topCategory).slice(0, 6);
	}
	
	// Add to recently viewed when product is viewed
	function addToRecentlyViewed(productId) {
		const product = products.find(p => p.id === productId);
		if (!product) return;
		
		// Remove if already exists
		state.recentlyViewed = state.recentlyViewed.filter(p => p.id !== productId);
		
		// Add to beginning
		state.recentlyViewed.unshift({
			id: product.id,
			title: product.title,
			brand: product.brand,
			price: product.price,
			image: product.image,
			category: product.category,
			viewedAt: new Date().toISOString()
		});
		
		// Keep only last 20 items
		state.recentlyViewed = state.recentlyViewed.slice(0, 20);
		
		saveRecentlyViewed();
	}
	
	// Theme toggle functionality
	function initTheme(){
		const savedTheme = localStorage.getItem('theme') || 'dark';
		document.documentElement.setAttribute('data-theme', savedTheme);
		updateThemeIcon(savedTheme);
	}
	
	function toggleTheme(){
		const currentTheme = document.documentElement.getAttribute('data-theme');
		const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', newTheme);
		localStorage.setItem('theme', newTheme);
		updateThemeIcon(newTheme);
	}
	
	function updateThemeIcon(theme){
		const themeIcon = document.querySelector('.theme-icon');
		if(themeIcon){
			themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
		}
	}
	
	document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
	
	// Modal close event listeners
	document.getElementById('notifications-close').addEventListener('click', closeNotificationsModal);
	document.getElementById('settings-close').addEventListener('click', closeSettingsModal);
	document.getElementById('help-close').addEventListener('click', closeHelpModal);
	document.getElementById('feedback-close').addEventListener('click', closeFeedbackModal);
	document.getElementById('view-feedback-close').addEventListener('click', closeViewFeedbackModal);
	document.getElementById('profile-close').addEventListener('click', closeProfileModal);
	document.getElementById('addresses-close').addEventListener('click', closeAddressesModal);
	document.getElementById('recently-viewed-close').addEventListener('click', closeRecentlyViewedModal);
	document.getElementById('recommendations-close').addEventListener('click', closeRecommendationsModal);

	// Wishlist drawer event listeners
	document.getElementById('open-wishlist').addEventListener('click', openWishlist);
	document.getElementById('close-wishlist').addEventListener('click', closeWishlist);
	document.getElementById('empty-wishlist-btn').addEventListener('click', emptyWishlist);

	// Reset filters button
	document.getElementById('reset-filters-btn').addEventListener('click', resetFilters);



	// Three dots menu functionality
	function setupThreeDotsMenu() {
		const threeDotsToggle = document.getElementById('three-dots-toggle');
		const threeDotsDropdown = document.getElementById('three-dots-dropdown');
		
		threeDotsToggle.addEventListener('click', (e) => {
			e.stopPropagation();
			threeDotsDropdown.classList.toggle('active');
		});

		// Close dropdown when clicking outside
		document.addEventListener('click', (e) => {
			if (!e.target.closest('.three-dots-menu')) {
				threeDotsDropdown.classList.remove('active');
			}
		});

		// Handle dropdown item clicks
		threeDotsDropdown.addEventListener('click', (e) => {
			const dropdownItem = e.target.closest('.dropdown-item');
			if (dropdownItem) {
				const action = dropdownItem.dataset.action;
				handleDropdownAction(action);
				threeDotsDropdown.classList.remove('active');
			}
		});
	}

	function handleDropdownAction(action) {
		switch(action) {
			case 'profile':
				openProfileModal();
				break;
			case 'notifications':
				openNotificationsModal();
				break;
			case 'recently-viewed':
				openRecentlyViewedModal();
				break;
			case 'recommendations':
				openRecommendationsModal();
				break;
			case 'orders':
				openOrders();
				break;
			case 'help':
				openHelpModal();
				break;
			case 'view-feedback':
				openViewFeedbackModal();
				break;
			case 'settings':
				openSettingsModal();
				break;
			case 'logout':
				handleLogout();
				break;
			default:
				console.log('Unknown action:', action);
		}
	}
	
	function handleLogout() {
		// Show confirmation dialog
		if (confirm('Are you sure you want to logout?')) {
			// Clear session
			window.Auth.logout();
			
			// Show logout message
			showNotification('Logged out successfully', 'success');
			
			// Redirect to login page after a short delay
			setTimeout(() => {
				window.location.href = 'login.html';
			}, 1000);
		}
	}

	function addToCart(id, qty){
		const product = products.find(p=>p.id===id);
		if(!product) return;
		
		// Ensure qty is a valid number
		qty = Number(qty) || 1;
		if(isNaN(qty)) qty = 1;
		
		const existing = state.cart[id] || { 
			id, 
			title: product.title, 
			price: product.price, 
			image: product.image, 
			brand: product.brand,
			qty: 0 
		};
		
		// Ensure existing qty is a valid number
		existing.qty = Number(existing.qty) || 0;
		if(isNaN(existing.qty)) existing.qty = 0;
		
		existing.qty += qty;
		state.cart[id] = existing;
		if(existing.qty <= 0){ delete state.cart[id]; }
		
		// Remove from wishlist if it was there
		if(state.wishlist[id]){
			delete state.wishlist[id];
			saveWishlist();
			updateWishlistUI();
			updateWishlistCount();
		}
		
		saveCart();
		renderGrid();
		renderCart();
		updateCartCount();
	}

	function removeFromCart(id){
		delete state.cart[id];
		saveCart();
		renderGrid();
		renderCart();
	}
	function updateCartCount(){
		const entries = Object.values(state.cart);
		const totalQty = entries.reduce((s,i)=>{
			const qty = Number(i.qty) || 0;
			return s + qty;
		}, 0);
		cartCount.textContent = String(totalQty);
	}
	
	function renderCart(){
		const entries = Object.values(state.cart);
		if(entries.length===0){
			cartItemsEl.innerHTML = `<div class="empty">Your cart is empty.</div>`;
		}else{
			cartItemsEl.innerHTML = entries.map(item=> {
				// Ensure qty and price are valid numbers
				const qty = Number(item.qty) || 0;
				const price = Number(item.price) || 0;
				
				return `
				<div class="cart-item" data-id="${item.id}">
					<img src="${item.image}" alt="${item.title}" onerror="this.src='${item.fallback}'" style="width:64px;height:64px;border-radius:8px;object-fit:cover;flex-shrink:0">
					<div style="flex:1;min-width:0;padding-right:8px">
						<div style="font-weight:600;margin-bottom:4px;font-size:0.9rem;line-height:1.3">${item.title}</div>
						<div class="card-meta" style="font-size:0.8rem;color:var(--subtle)">₹${price.toLocaleString()} each</div>
					</div>
					<div class="qty" style="display:flex;align-items:center;gap:8px;flex-shrink:0;min-width:120px;justify-content:flex-end">
						<button data-dec style="width:28px;height:28px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center">−</button>
						<span aria-live="polite" style="min-width:24px;text-align:center;font-weight:600">${qty}</span>
						<button data-inc style="width:28px;height:28px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center">+</button>
						<button data-remove title="Remove" style="width:28px;height:28px;border-radius:6px;border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;margin-left:4px">🗑️</button>
					</div>
				</div>
				`;
			}).join("");
		}
		
		// Calculate total with validation
		const totalPrice = entries.reduce((s,i)=>{
			const qty = Number(i.qty) || 0;
			const price = Number(i.price) || 0;
			return s + (qty * price);
		}, 0);
		
		cartTotal.textContent = `₹${totalPrice.toLocaleString()}`;
		updateCartCount();
	}
	cartItemsEl.addEventListener("click", e=>{
		const root = e.target.closest(".cart-item");
		if(!root) return;
		const id = root.dataset.id;
		if(e.target.matches("[data-inc]")) addToCart(id, 1);
		else if(e.target.matches("[data-dec]")) addToCart(id, -1);
		else if(e.target.matches("[data-remove]")) removeFromCart(id);
	});

	// ----- Categories and Brands -----
	function renderCategories(){
		const categoriesNav = document.getElementById('categories-nav');
		const categories = ["All", ...Array.from(new Set(products.map(p=>p.category)))];
		
	// Enhanced category structure with subcategories and brands
	const categoryStructure = {
		"All": { subcategories: [], brands: [] },
        "Electronics": { 
            subcategories: {
                "Smartphones": { 
                    brands: ["Apple", "Samsung", "OnePlus", "Google", "Xiaomi", "Realme", "Vivo", "Oppo"],
                    gender: null
                },
                "Computers": { 
                    brands: ["Apple", "Dell", "HP", "Lenovo", "ASUS", "Acer", "MSI", "Microsoft"],
                    gender: null
                },
                "Audio": { 
                    brands: ["Apple", "Sony", "JBL", "Bose", "Sennheiser", "Audio-Technica", "Skullcandy"],
                    gender: null
                },
                "Gaming": { 
                    brands: ["Sony", "Microsoft", "Nintendo", "Razer", "Logitech", "SteelSeries"],
                    gender: null
                },
                "Wearables": { 
                    brands: ["Apple", "Samsung", "Fitbit", "Garmin", "Xiaomi", "Huawei"],
                    gender: null
                },
                "Cameras": { 
                    brands: ["Canon", "Nikon", "Sony", "Fujifilm", "Panasonic", "Olympus"],
                    gender: null
                },
                "Accessories": { 
                    brands: ["Logitech", "Razer", "Corsair", "SteelSeries", "HyperX", "ASUS", "Dell", "HP"],
                    gender: null
                }
            }
        },
		"Fashion": { 
			subcategories: {
				"Men's Clothing": { 
					brands: ["Nike", "Adidas", "Levi's", "Zara", "H&M", "Uniqlo", "Tommy Hilfiger", "Calvin Klein"],
					gender: "men"
				},
				"Women's Clothing": { 
					brands: ["Zara", "H&M", "Uniqlo", "Forever 21", "Mango", "Shein", "ASOS", "Urban Outfitters"],
					gender: "women"
				},
				"Men's Shoes": { 
					brands: ["Nike", "Adidas", "Puma", "Reebok", "Converse", "Vans", "Timberland", "Clarks"],
					gender: "men"
				},
				"Women's Shoes": { 
					brands: ["Nike", "Adidas", "Puma", "Steve Madden", "Nine West", "Aldo", "H&M", "Zara"],
					gender: "women"
				},
				"Men's Watches": { 
					brands: ["Apple", "Samsung", "Casio", "Seiko", "Timex", "Fossil", "Daniel Wellington", "MVMT"],
					gender: "men"
				},
				"Women's Watches": { 
					brands: ["Apple", "Samsung", "Casio", "Fossil", "Kate Spade", "Michael Kors", "Daniel Wellington", "MVMT"],
					gender: "women"
				},
				"Accessories": { 
					brands: ["Louis Vuitton", "Gucci", "Prada", "Chanel", "Coach", "Michael Kors", "Kate Spade"],
					gender: null
				}
			}
		},
		"Home & Kitchen": { 
			subcategories: {
				"Appliances": { 
					brands: ["Dyson", "Breville", "Ninja", "KitchenAid", "Bosch", "Samsung", "LG", "Whirlpool"],
					gender: null
				},
				"Furniture": { 
					brands: ["IKEA", "Wayfair", "West Elm", "Pottery Barn", "Crate & Barrel", "Ashley Furniture"],
					gender: null
				},
				"Cookware": { 
					brands: ["KitchenAid", "Cuisinart", "Le Creuset", "All-Clad", "Calphalon", "Tefal"],
					gender: null
				},
				"Home Decor": { 
					brands: ["IKEA", "Wayfair", "West Elm", "Pottery Barn", "Crate & Barrel", "Target"],
					gender: null
				}
			}
		},
		"Beauty & Personal Care": { 
			subcategories: {
				"Men's Grooming": { 
					brands: ["Gillette", "Braun", "Philips", "Dyson", "Harry's", "Dollar Shave Club", "Axe"],
					gender: "men"
				},
				"Women's Beauty": { 
					brands: ["L'Oreal", "Maybelline", "The Ordinary", "Dyson", "Olaplex", "CeraVe", "Neutrogena"],
					gender: "women"
				},
				"Skincare": { 
					brands: ["The Ordinary", "CeraVe", "Neutrogena", "Olay", "Clinique", "Estée Lauder"],
					gender: null
				},
				"Hair Care": { 
					brands: ["Dyson", "Olaplex", "Kerastase", "L'Oreal", "Pantene", "Head & Shoulders"],
					gender: null
				}
			}
		},
		"Books": { 
			subcategories: {
				"Fiction": { 
					brands: ["Penguin", "HarperCollins", "Random House", "Macmillan", "Simon & Schuster"],
					gender: null
				},
				"Non-Fiction": { 
					brands: ["Penguin", "HarperCollins", "Random House", "Oxford University Press", "Cambridge"],
					gender: null
				},
				"Self-Help": { 
					brands: ["Penguin", "HarperCollins", "Random House", "Hay House", "Rodale"],
					gender: null
				},
				"Business": { 
					brands: ["Harvard Business Review", "Penguin", "HarperCollins", "Wiley", "McGraw-Hill"],
					gender: null
				}
			}
		},
		"Fitness": { 
			subcategories: {
				"Exercise Equipment": { 
					brands: ["Bowflex", "Peloton", "NordicTrack", "ProForm", "Sunny Health", "CAP Barbell"],
					gender: null
				},
				"Men's Sports Wear": { 
					brands: ["Nike", "Adidas", "Under Armour", "Puma", "Reebok", "Lululemon", "Athleta"],
					gender: "men"
				},
				"Women's Sports Wear": { 
					brands: ["Nike", "Adidas", "Under Armour", "Puma", "Reebok", "Lululemon", "Athleta"],
					gender: "women"
				},
				"Supplements": { 
					brands: ["Optimum Nutrition", "MuscleTech", "Dymatize", "BSN", "Cellucor", "Quest"],
					gender: null
				}
			}
		},
		"Today's Deals": { 
			subcategories: {
				"Flash Sales": { brands: [], gender: null },
				"Clearance": { brands: [], gender: null },
				"Bundle Offers": { brands: [], gender: null }
			}
		}
	};
		
	// Sidebar navigation with clean, organized categories
		categoriesNav.innerHTML = categories.map(cat => {
			const categoryIcon = getCategoryIcon(cat);
			const hasSubcategories = categoryStructure[cat] && categoryStructure[cat].subcategories && Object.keys(categoryStructure[cat].subcategories).length > 0;
			
			return `
				<div class="category-section" data-category="${cat}">
					<div class="category-main ${hasSubcategories ? 'has-children' : ''}" data-category="${cat}">
						<span class="category-icon">${categoryIcon}</span>
						<span class="category-name">${cat}</span>
						${hasSubcategories ? '<span class="category-arrow">▼</span>' : ''}
					</div>
					${hasSubcategories ? `
						<div class="subcategories-container">
							${Object.entries(categoryStructure[cat].subcategories).map(([subName, subData]) => `
								<div class="subcategory-item" data-category="${cat}" data-subcategory="${subName}">
									<span class="subcategory-icon">${getSubcategoryIcon(subName)}</span>
									<span class="subcategory-name">${subName}</span>
									<span class="subcategory-arrow">▶</span>
									<div class="brands-dropdown">
										${subData.brands.map(brand => `
											<div class="brand-item" data-category="${cat}" data-subcategory="${subName}" data-brand="${brand}" data-gender="${subData.gender || ''}">
												<input type="checkbox" class="brand-checkbox" id="brand-${cat}-${subName}-${brand.replace(/\s+/g, '-')}">
												<label for="brand-${cat}-${subName}-${brand.replace(/\s+/g, '-')}" class="brand-label">
													<span class="brand-name">${brand}</span>
													<span class="brand-count">${getBrandProductCount(cat, subName, brand, subData.gender)}</span>
												</label>
											</div>
										`).join('')}
									</div>
								</div>
							`).join('')}
						</div>
					` : ''}
				</div>
			`;
		}).join('');
	}
	
	// Add category click handler separately
	function setupCategoryHandlers(){
		// Sidebar category navigation
		document.addEventListener('click', (e) => {
			const categoryMain = e.target.closest('.category-main');
			const subcategoryItem = e.target.closest('.subcategory-item');
			const brandItem = e.target.closest('.brand-item');
			const brandCheckbox = e.target.closest('.brand-checkbox');
			
			// Handle main category clicks
			if(categoryMain && !subcategoryItem && !brandItem) {
				const category = categoryMain.dataset.category;
				const hasChildren = categoryMain.classList.contains('has-children');
				
				if(hasChildren) {
					// Toggle subcategories visibility
					const subcategoriesContainer = categoryMain.parentElement.querySelector('.subcategories-container');
					const arrow = categoryMain.querySelector('.category-arrow');
					
					if(subcategoriesContainer) {
						subcategoriesContainer.classList.toggle('expanded');
						arrow.textContent = subcategoriesContainer.classList.contains('expanded') ? '▲' : '▼';
						categoryMain.classList.toggle('expanded');
					}
				}
				
				// Filter by main category
					state.category = category;
				state.searchQuery = "";
				state.selectedBrands = [];
					document.getElementById('search').value = "";
					document.getElementById('current-category-title').textContent = category === 'All' ? 'All Products' : category;
				clearAllBrandCheckboxes();
					renderGrid();
				updateActiveCategoryNav(category);
			}
			
			// Handle subcategory clicks
			if(subcategoryItem && !brandItem) {
				const category = subcategoryItem.dataset.category;
				const subcategory = subcategoryItem.dataset.subcategory;
				const brandsDropdown = subcategoryItem.querySelector('.brands-dropdown');
				const arrow = subcategoryItem.querySelector('.subcategory-arrow');
				
				// Toggle brands dropdown
				if(brandsDropdown) {
					brandsDropdown.classList.toggle('expanded');
					arrow.textContent = brandsDropdown.classList.contains('expanded') ? '▼' : '▶';
					subcategoryItem.classList.toggle('expanded');
				}
				
				// Filter by subcategory
				state.category = category;
				state.searchQuery = subcategory.toLowerCase();
				state.selectedBrands = [];
				document.getElementById('search').value = subcategory;
				document.getElementById('current-category-title').textContent = `${category} - ${subcategory}`;
				clearAllBrandCheckboxes();
				renderGrid();
				updateActiveCategoryNav(category);
			}
			
			// Handle brand checkbox clicks
			if(brandCheckbox) {
				const category = brandCheckbox.closest('.brand-item').dataset.category;
				const subcategory = brandCheckbox.closest('.brand-item').dataset.subcategory;
				const brand = brandCheckbox.closest('.brand-item').dataset.brand;
				const gender = brandCheckbox.closest('.brand-item').dataset.gender;
				
				// Initialize selectedBrands if not exists
				if(!state.selectedBrands) state.selectedBrands = [];
				
				if(brandCheckbox.checked) {
					// Add brand to selection
					if(!state.selectedBrands.some(b => b.brand === brand && b.category === category && b.subcategory === subcategory)) {
						state.selectedBrands.push({ brand, category, subcategory, gender });
					}
				} else {
					// Remove brand from selection
					state.selectedBrands = state.selectedBrands.filter(b => !(b.brand === brand && b.category === category && b.subcategory === subcategory));
				}
				
				// Update UI based on selected brands - FIXED LOGIC
				if(state.selectedBrands.length > 0) {
					// Clear search query to let brand filtering work properly
					state.searchQuery = "";
					document.getElementById('search').value = "";
					
					// Update title to show selected brands
					const brandNames = state.selectedBrands.map(b => b.brand).join(', ');
					document.getElementById('current-category-title').textContent = `${category} - ${subcategory} (${brandNames})`;
				} else {
					// No brands selected, show subcategory
					state.searchQuery = subcategory.toLowerCase();
					document.getElementById('search').value = subcategory;
					document.getElementById('current-category-title').textContent = `${category} - ${subcategory}`;
				}
				
				state.category = category;
				renderGrid();
				updateActiveCategoryNav(category);
			}
		});
		
		// Helper function to clear all brand checkboxes
		function clearAllBrandCheckboxes() {
			document.querySelectorAll('.brand-checkbox').forEach(checkbox => {
				checkbox.checked = false;
			});
		}
	}

	// Update active category navigation
	function updateActiveCategoryNav(activeCategory) {
		document.querySelectorAll('.category-nav-item').forEach(item => {
			item.classList.toggle('active', item.dataset.category === activeCategory);
		});
	}

	

	
	function getCategoryIcon(category){
		const icons = {
			"All": "🛍️",
			"Electronics": "📱",
			"Computers": "💻",
			"Fashion": "👕",
			"Home & Kitchen": "🏠",
			"Books": "📚",
			"Beauty & Personal Care": "💄",
			"Fitness": "💪",
			"Mobiles": "📱",
			"Bestsellers": "⭐",
			"New Releases": "🆕",
			"Prime": "👑",
			"Sell": "💰",
			"Customer Service": "🛟",
			"Amazon Pay": "💳",
			"Home Improvement": "🔨",
			"Fresh": "🥬",
			"Movies & TV": "🎬",
			"Apps & Games": "🎮"
		};
		return icons[category] || "📦";
	}

	function getSubcategoryIcon(subcategory){
		const icons = {
			// Electronics
			"Smartphones": "📱", "Audio": "🎧", "Cameras": "📷", "Gaming": "🎮", "Wearables": "⌚",
			// Computers
			"Laptops": "💻", "Desktops": "🖥️", "Tablets": "📱", "Accessories": "⌨️",
			// Fashion - Gender specific
			"Men's Clothing": "👔", "Women's Clothing": "👗", "Men's Shoes": "👞", "Women's Shoes": "👠",
			"Men's Watches": "⌚", "Women's Watches": "⌚", "Accessories": "👜", "Jewelry": "💍",
			// Home & Kitchen
			"Appliances": "🔌", "Furniture": "🪑", "Cookware": "🍳", "Home Decor": "🖼️",
			// Books
			"Fiction": "📖", "Non-Fiction": "📘", "Self-Help": "💡", "Business": "💼",
			// Beauty & Personal Care - Gender specific
			"Men's Grooming": "✂️", "Women's Beauty": "💄", "Skincare": "🧴", "Hair Care": "💇",
			// Fitness - Gender specific
			"Exercise Equipment": "🏋️", "Men's Sports Wear": "👟", "Women's Sports Wear": "👟", "Supplements": "💊",
			// Today's Deals
			"Flash Sales": "⚡", "Clearance": "🧹", "Bundle Offers": "📦"
		};
		return icons[subcategory] || "📦";
	}

	
	function getBrandProductCount(category, subcategory, brand, gender){
		let filteredProducts = products.filter(p => {
			// Match category
			let matchesCategory = p.category === category || category === "All";
			
			// Match brand (exact match or partial match)
			let matchesBrand = p.brand.toLowerCase() === brand.toLowerCase() || 
							  p.brand.toLowerCase().includes(brand.toLowerCase()) ||
							  brand.toLowerCase().includes(p.brand.toLowerCase());
			
			// Match subcategory (based on title/keywords and category)
			let matchesSubcategory = true;
			if (subcategory) {
				const title = p.title.toLowerCase();
				const brandName = p.brand.toLowerCase();
				
				if (subcategory === "Smartphones") {
					matchesSubcategory = title.includes('iphone') || title.includes('galaxy') || title.includes('phone') || title.includes('mobile') || title.includes('pixel') || title.includes('oneplus');
				} else if (subcategory === "Audio") {
					matchesSubcategory = title.includes('airpods') || title.includes('headphone') || title.includes('speaker') || title.includes('audio') || title.includes('earbud');
				} else if (subcategory === "Computers") {
					matchesSubcategory = title.includes('macbook') || title.includes('laptop') || title.includes('desktop') || title.includes('pc') || title.includes('computer') || title.includes('xps') || title.includes('notebook');
				} else if (subcategory === "Tablets") {
					matchesSubcategory = title.includes('ipad') || title.includes('tablet') || title.includes('tab');
				} else if (subcategory === "Cameras") {
					matchesSubcategory = title.includes('camera') || title.includes('canon') || title.includes('nikon') || title.includes('sony') || title.includes('dslr');
				} else if (subcategory === "Gaming") {
					matchesSubcategory = title.includes('gaming') || title.includes('nintendo') || title.includes('playstation') || title.includes('xbox') || title.includes('console');
				} else if (subcategory === "Wearables") {
					matchesSubcategory = title.includes('watch') || title.includes('fitbit') || title.includes('apple watch') || title.includes('wearable') || title.includes('band');
				} else if (subcategory === "Men's Clothing") {
					matchesSubcategory = (title.includes('men') || title.includes('male')) && (title.includes('shirt') || title.includes('pant') || title.includes('jacket') || title.includes('jeans') || title.includes('clothing')) && !title.includes('shoe') && !title.includes('watch');
				} else if (subcategory === "Women's Clothing") {
					matchesSubcategory = (title.includes('women') || title.includes('female')) && (title.includes('dress') || title.includes('ladies') || title.includes('top') || title.includes('blouse') || title.includes('jeans') || title.includes('clothing')) && !title.includes('shoe') && !title.includes('watch');
				} else if (subcategory === "Men's Shoes") {
					matchesSubcategory = (title.includes('men') || title.includes('male')) && (title.includes('shoe') || title.includes('sneaker') || title.includes('boot') || title.includes('sandal') || title.includes('heels'));
				} else if (subcategory === "Women's Shoes") {
					matchesSubcategory = (title.includes('women') || title.includes('female')) && (title.includes('shoe') || title.includes('sneaker') || title.includes('boot') || title.includes('sandal') || title.includes('heels'));
				} else if (subcategory === "Men's Watches") {
					matchesSubcategory = (title.includes('men') || title.includes('male')) && title.includes('watch');
				} else if (subcategory === "Women's Watches") {
					matchesSubcategory = (title.includes('women') || title.includes('female')) && title.includes('watch');
				} else if (subcategory === "Furniture") {
					matchesSubcategory = title.includes('sofa') || title.includes('table') || title.includes('chair') || title.includes('bed') || title.includes('furniture') || title.includes('dining');
				} else if (subcategory === "Appliances") {
					matchesSubcategory = title.includes('coffee') || title.includes('air fryer') || title.includes('appliance') || title.includes('maker') || title.includes('fryer');
				} else if (subcategory === "Home Decor") {
					matchesSubcategory = title.includes('decor') || title.includes('bed sheet') || title.includes('sheet') || title.includes('bedding');
				} else if (subcategory === "Bedding") {
					matchesSubcategory = title.includes('bed') || title.includes('sheet') || title.includes('bedding') || title.includes('pillow');
				} else if (subcategory === "Fiction") {
					matchesSubcategory = title.includes('gatsby') || title.includes('1984') || title.includes('fiction') || title.includes('novel');
				} else if (subcategory === "Non-Fiction") {
					matchesSubcategory = title.includes('psychology') || title.includes('money') || title.includes('non-fiction') || title.includes('self-help');
				} else if (subcategory === "Educational") {
					matchesSubcategory = title.includes('educational') || title.includes('textbook') || title.includes('learning');
				} else if (subcategory === "Children's") {
					matchesSubcategory = title.includes('children') || title.includes('kids') || title.includes('child');
				} else if (subcategory === "Skincare") {
					matchesSubcategory = title.includes('skincare') || title.includes('moisturizer') || title.includes('cream') || title.includes('serum');
				} else if (subcategory === "Makeup") {
					matchesSubcategory = title.includes('foundation') || title.includes('lipstick') || title.includes('mascara') || title.includes('eyeshadow') || title.includes('makeup');
				} else if (subcategory === "Hair Care") {
					matchesSubcategory = title.includes('hair') || title.includes('dryer') || title.includes('straightener') || title.includes('shampoo');
				} else if (subcategory === "Personal Care") {
					matchesSubcategory = title.includes('razor') || title.includes('shaving') || title.includes('personal care') || title.includes('electric');
				} else if (subcategory === "Equipment") {
					matchesSubcategory = title.includes('yoga mat') || title.includes('dumbbell') || title.includes('equipment') || title.includes('mat');
				} else if (subcategory === "Clothing") {
					matchesSubcategory = title.includes('leggings') || title.includes('bra') || title.includes('clothing') || title.includes('athletic');
				} else if (subcategory === "Accessories") {
					matchesSubcategory = title.includes('mouse') || title.includes('accessory') || title.includes('wireless');
				} else if (subcategory === "Supplements") {
					matchesSubcategory = title.includes('protein') || title.includes('creatine') || title.includes('supplement') || title.includes('powder');
				} else {
					// For other subcategories, be more flexible
					matchesSubcategory = true; // Show all products for the brand in the category
				}
			}
			
			// Match gender if specified
			let matchesGender = true;
			if (gender) {
				const title = p.title.toLowerCase();
				const brandName = p.brand.toLowerCase();
				if (gender === 'men') {
					matchesGender = title.includes('men') || title.includes('male') || brandName.includes('men');
				} else if (gender === 'women') {
					matchesGender = title.includes('women') || title.includes('female') || title.includes('ladies') || brandName.includes('women');
				}
			}
			
			return matchesCategory && matchesSubcategory && matchesBrand && matchesGender;
		});
		
		return filteredProducts.length;
	}


	function reloadUserCart() {
		// Reload cart for the current user
		state.cart = loadCart();
		renderCart();
		updateCartCount();
		console.log('User cart reloaded:', state.cart);
	}

	function clearCartCompletely() {
		// Clear state cart
		state.cart = {};
		
		// Get current user
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		const cartKey = user ? `cart_${user.email}` : "cart";
		
		// Clear from localStorage
		localStorage.removeItem(cartKey);
		
		// Save empty cart
		saveCart();
		
		// Force update all cart-related UI elements
		renderCart();
		updateCartCount();
		
		// Force update cart count in header
		const cartCountEl = document.querySelector('.cart-count');
		if (cartCountEl) {
			cartCountEl.textContent = '0';
		}
		
		console.log('Cart completely cleared for user:', user?.email);
	}

	// ----- Product Details Modal -----
	function showProductDetails(productId) {
		const product = products.find(p => p.id === productId);
		if (!product) return;
		
		const modal = document.createElement('div');
		modal.className = 'product-modal-overlay';
		modal.innerHTML = `
			<div class="product-modal">
				<button class="modal-close" onclick="this.closest('.product-modal-overlay').remove()">×</button>
				<div class="product-modal-content">
					<div class="product-modal-image">
						<img src="${product.image}" alt="${product.title}">
					</div>
					<div class="product-modal-info">
						<div class="product-modal-brand">${product.brand}</div>
						<h2 class="product-modal-title">${product.title}</h2>
						<div class="product-modal-rating">
							<div class="stars">${generateStars(product.rating)}</div>
							<span class="rating-text">${product.rating}</span>
							<span class="rating-count">(${product.reviews || 0} reviews)</span>
						</div>
						<div class="product-modal-description">
							<h3>Description</h3>
							<p>${product.description || 'No description available.'}</p>
						</div>
						${product.features ? `
							<div class="product-modal-features">
								<h3>Key Features</h3>
								<ul>
									${product.features.map(feature => `<li>${feature}</li>`).join('')}
								</ul>
							</div>
						` : ''}
						<div class="product-modal-pricing">
							<div class="current-price">₹${product.price.toLocaleString()}</div>
							${product.originalPrice ? `<div class="original-price">₹${product.originalPrice.toLocaleString()}</div>` : ''}
						</div>
						<button class="add-to-cart-btn" data-add="${product.id}">
							<span class="btn-icon">🛒</span>
							<span class="btn-text">Add to Cart</span>
						</button>
					</div>
				</div>
			</div>
		`;
		
		document.body.appendChild(modal);
		
		// Add event listener for add to cart in modal
		modal.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
			e.preventDefault();
			e.stopImmediatePropagation(); // Prevent global event listener from firing
			addToCart(product.id, 1); // Explicitly specify quantity
			renderCart();
			modal.remove();
		});
	}

	// ----- Reset Filters Function -----				
	function resetFilters() {
		state.category = "All";
		state.searchQuery = "";
		state.selectedBrands = [];
		state.priceRange = { min: 0, max: 150000 };
		
		// Reset UI elements
		document.getElementById('search').value = "";
		document.getElementById('current-category-title').textContent = "All Products";
		document.getElementById('price-min').value = 0;
		document.getElementById('price-max').value = 150000;
		document.getElementById('price-slider-min').value = 0;
		document.getElementById('price-slider-max').value = 150000;
		
		// Clear all brand checkboxes
		document.querySelectorAll('.brand-checkbox').forEach(checkbox => {
			checkbox.checked = false;
		});
		
		// Close all expanded submenus
		document.querySelectorAll('.category-submenu').forEach(submenu => {
			submenu.classList.remove('expanded');
		});
		document.querySelectorAll('.expand-icon').forEach(icon => {
			icon.textContent = '+';
		});
		document.querySelectorAll('.brands-section').forEach(section => {
			section.style.display = 'none';
		});
		document.querySelectorAll('.subcategory-expand').forEach(icon => {
			icon.textContent = '+';
		});
		
		// Update active category navigation
		updateActiveCategoryNav("All");
		
		// Re-render grid
		renderGrid();
		
		// Update price slider progress
		updatePriceSliderProgress();
		
		showNotification('All filters have been reset', 'success');
	}

	// ----- Price Range Slider Functions -----
	function updatePriceSliderProgress() {
		const minSlider = document.getElementById('price-slider-min');
		const maxSlider = document.getElementById('price-slider-max');
		const progress = document.querySelector('.price-slider-progress');
		
		if (minSlider && maxSlider && progress) {
			const min = parseInt(minSlider.value);
			const max = parseInt(maxSlider.value);
			const minRange = parseInt(minSlider.min);
			const maxRange = parseInt(minSlider.max);
			
			const leftPercent = ((min - minRange) / (maxRange - minRange)) * 100;
			const rightPercent = ((maxRange - max) / (maxRange - minRange)) * 100;
			
			progress.style.left = leftPercent + '%';
			progress.style.right = rightPercent + '%';
		}
	}

	function setupPriceRangeSlider() {
		const minSlider = document.getElementById('price-slider-min');
		const maxSlider = document.getElementById('price-slider-max');
		const minInput = document.getElementById('price-min');
		const maxInput = document.getElementById('price-max');
		
		if (!minSlider || !maxSlider || !minInput || !maxInput) return;
		
		// Update progress bar on slider change
		function updateSliders(event) {
			const minVal = parseInt(minSlider.value);
			const maxVal = parseInt(maxSlider.value);
			
			// Ensure min doesn't exceed max and vice versa
			if (minVal >= maxVal) {
				if (event && event.target === minSlider) {
					minSlider.value = Math.max(0, maxVal - 1000);
				} else if (event && event.target === maxSlider) {
					maxSlider.value = Math.min(150000, minVal + 1000);
				}
			}
			
			// Update input fields
			minInput.value = minSlider.value;
			maxInput.value = maxSlider.value;
			
			// Update state
			state.priceRange.min = parseInt(minSlider.value);
			state.priceRange.max = parseInt(maxSlider.value);
			
			// Update progress bar
			updatePriceSliderProgress();
			
			// Re-render grid
			renderGrid();
		}
		
		// Update sliders on input change
		function updateFromInputs() {
			const minVal = parseInt(minInput.value) || 0;
			const maxVal = parseInt(maxInput.value) || 150000;
			
			// Ensure min doesn't exceed max
			if (minVal >= maxVal) {
				minInput.value = Math.max(0, maxVal - 1000);
				maxSlider.value = maxVal;
			}
			
			minSlider.value = minInput.value;
			maxSlider.value = maxInput.value;
			
			// Update state
			state.priceRange.min = parseInt(minSlider.value);
			state.priceRange.max = parseInt(maxSlider.value);
			
			// Update progress bar
			updatePriceSliderProgress();
			
			// Re-render grid
			renderGrid();
		}
		
		// Event listeners
		minSlider.addEventListener('input', (e) => updateSliders(e));
		maxSlider.addEventListener('input', (e) => updateSliders(e));
		minInput.addEventListener('input', updateFromInputs);
		maxInput.addEventListener('input', updateFromInputs);
	}

	// ----- Event Handlers -----
	function setupEventHandlers() {
		// Product card clicks (for recently viewed and product details)
		document.addEventListener('click', (e) => {
			const productCard = e.target.closest('.product-card');
			if (productCard && !e.target.closest('.wishlist-btn') && !e.target.closest('.quick-view-btn') && !e.target.closest('.add-to-cart-btn')) {
				const productId = productCard.dataset.id;
				const product = products.find(p => p.id === productId);
				if (product) {
					// Add to recently viewed
					addToRecentlyViewed(productId);
					// Show product details
					showProductDetails(productId);
				}
			}
		});

		// Quick view buttons
		document.addEventListener('click', (e) => {
			if (e.target.closest('.quick-view-btn')) {
				e.stopPropagation(); // Prevent product card click
				const productId = e.target.closest('.quick-view-btn').dataset.quickView;
				showProductDetails(productId);
			}
		});
		
		// Add to cart buttons
		document.addEventListener('click', (e) => {
			if (e.target.closest('.add-to-cart-btn')) {
				e.stopPropagation(); // Prevent product card click
				e.preventDefault(); // Prevent default behavior
				const productId = e.target.closest('.add-to-cart-btn').dataset.add;
				addToCart(productId, 1);
				renderCart();
				updateCartCount();
				renderGrid(); // Update the button text
				showNotification('Added to cart!', 'success');
			}
		});
		
		// Wishlist buttons
		document.addEventListener('click', (e) => {
			console.log('Click event triggered on:', e.target);
			if (e.target.closest('.wishlist-btn')) {
				e.stopPropagation(); // Prevent product card click
				const productId = e.target.closest('.wishlist-btn').dataset.wishlist;
				console.log('Wishlist button clicked for product:', productId);
				toggleWishlist(productId);
			}
			if (e.target.closest('.add-to-cart-from-wishlist')) {
				const productId = e.target.closest('.add-to-cart-from-wishlist').dataset.addFromWishlist;
				console.log('Add to cart from wishlist clicked for product:', productId);
				addToCartFromWishlist(productId);
			}
			if (e.target.closest('.remove-from-wishlist')) {
				const productId = e.target.closest('.remove-from-wishlist').dataset.removeWishlist;
				console.log('Remove from wishlist clicked for product:', productId);
				removeFromWishlist(productId);
			}
		});
		
		// Event listeners for orders and checkout (with null checks)
		const ordersBtn = document.getElementById('orders-btn');
		if (ordersBtn) {
			ordersBtn.addEventListener('click', openOrders);
		}
		
		const ordersClose = document.getElementById('orders-close');
		if (ordersClose) {
			ordersClose.addEventListener('click', closeOrders);
		}
		
		const checkoutClose = document.getElementById('checkout-close');
		if (checkoutClose) {
			checkoutClose.addEventListener('click', closeCheckout);
		}
		
	}





	function renderReviewStep() {
		const cartItems = Object.values(state.cart);
		const total = cartItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
		const selectedAddr = state.userAddresses.find(addr => addr.id === selectedAddress);
		const selectedPm = state.paymentMethods.find(pm => pm.id === selectedPayment);
		
		return `
			<div class="checkout-step">
				<div class="step-header">
					<div class="step-indicator">
						<div class="step completed">1</div>
						<div class="step-line completed"></div>
						<div class="step completed">2</div>
						<div class="step-line completed"></div>
						<div class="step active">3</div>
						<div class="step-line"></div>
						<div class="step">4</div>
					</div>
					<h3>Review Your Order</h3>
				</div>
				
				<div class="order-summary">
					<div class="summary-section">
						<h4>Delivery Address</h4>
						<div class="summary-content">
							<div class="address-summary">
								<div class="address-name">${selectedAddr?.name || 'Not selected'}</div>
								<div class="address-details">${selectedAddr ? `${selectedAddr.address}, ${selectedAddr.city}, ${selectedAddr.state} ${selectedAddr.zip}` : 'Please select an address'}</div>
								<div class="address-phone">${selectedAddr?.phone || ''}</div>
							</div>
						</div>
					</div>
					
					<div class="summary-section">
						<h4>Payment Method</h4>
						<div class="summary-content">
							<div class="payment-summary">
								<div class="payment-brand">${selectedPm?.brand || 'Not selected'}</div>
								<div class="payment-number">${selectedPm ? `**** **** **** ${selectedPm.last4}` : 'Please select a payment method'}</div>
							</div>
						</div>
					</div>
					
					<div class="summary-section">
						<h4>Order Items</h4>
						<div class="summary-content">
							${cartItems.map(item => `
								<div class="order-item">
									<img src="${item.image}" alt="${item.title}" class="item-image">
									<div class="item-details">
										<div class="item-title">${item.title}</div>
										<div class="item-qty">Qty: ${item.qty}</div>
									</div>
									<div class="item-price">₹${(item.qty * item.price).toLocaleString()}</div>
								</div>
							`).join('')}
						</div>
					</div>
					
					<div class="order-total">
						<div class="total-line">
							<span>Subtotal:</span>
							<span>₹${total.toLocaleString()}</span>
						</div>
						<div class="total-line">
							<span>Delivery:</span>
							<span>Free</span>
						</div>
						<div class="total-line total">
							<span>Total:</span>
							<span>₹${total.toLocaleString()}</span>
						</div>
					</div>
				</div>
				
				<div class="checkout-actions">
					<button type="button" class="btn-secondary" onclick="prevCheckoutStep()">Back</button>
					<button type="button" class="btn-primary" onclick="placeOrder()">Place Order</button>
				</div>
			</div>
		`;
	}

	function renderConfirmationStep() {
		// Get the order from lastOrderDetails or state.orders
		const order = window.lastOrderDetails || state.orders[state.orders.length - 1] || {};
		const orderNumber = order.id || 'ORD-' + Date.now().toString().slice(-6);
		
		console.log('=== RENDER CONFIRMATION DEBUG ===');
		console.log('window.lastOrderDetails:', window.lastOrderDetails);
		console.log('state.orders:', state.orders);
		console.log('Using order:', order);
		console.log('=== END RENDER CONFIRMATION DEBUG ===');
		
		return `
			<div class="checkout-step">
				<div class="step-header">
					<div class="step-indicator">
						<div class="step completed">1</div>
						<div class="step-line completed"></div>
						<div class="step completed">2</div>
						<div class="step-line completed"></div>
						<div class="step completed">3</div>
						<div class="step-line completed"></div>
						<div class="step completed">4</div>
					</div>
					<h3>Order Confirmed!</h3>
				</div>
				
				<div class="confirmation-content">
					<div class="success-icon">✅</div>
					<h2>Thank you for your order!</h2>
					<p>Your order has been placed successfully and is being processed.</p>
					
					<div class="order-details">
						<div class="detail-item">
							<span class="detail-label">Order Number:</span>
							<span class="detail-value">${orderNumber}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Order Status:</span>
							<span class="detail-value status-${order.orderStatus?.toLowerCase() || 'confirmed'}">${order.orderStatus || 'Confirmed'}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Tracking Number:</span>
							<span class="detail-value">${order.trackingNumber || 'TRK' + Date.now().toString().slice(-8)}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Estimated Delivery:</span>
							<span class="detail-value">${order.estimatedDelivery || '3-5 business days'}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Delivery Date:</span>
							<span class="detail-value">${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Payment Method:</span>
							<span class="detail-value">${order.paymentMethod?.brand || 'Card'} ****${order.paymentMethod?.last4 || '1234'}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">Total Amount:</span>
							<span class="detail-value">₹${(order.total || 0).toLocaleString()}</span>
						</div>
					</div>
					
					<div class="order-items-summary">
						<h4>Order Items (${order.items?.length || 0})</h4>
						${order.items ? order.items.map(item => `
							<div class="confirmation-item">
								<img src="${item.image}" alt="${item.title}" class="item-image">
								<div class="item-info">
									<div class="item-title">${item.title}</div>
									<div class="item-brand">${item.brand}</div>
									<div class="item-qty">Qty: ${item.qty}</div>
								</div>
								<div class="item-price">₹${(item.qty * item.price).toLocaleString()}</div>
							</div>
						`).join('') : ''}
					</div>
					
					<div class="delivery-address-summary">
						<h4>Delivery Address</h4>
						<div class="address-info">
							<div class="address-name">${order.address?.name || 'Not specified'}</div>
							<div class="address-details">${order.address ? `${order.address.address}, ${order.address.city}, ${order.address.state} ${order.address.zip}` : 'Not specified'}</div>
							<div class="address-phone">${order.address?.phone || ''}</div>
						</div>
					</div>
				</div>
				
				<div class="checkout-actions">
					<button type="button" class="btn-primary" onclick="closeCheckout(); setTimeout(() => openOrders(), 100);">View Orders</button>
					<button type="button" class="btn-secondary" onclick="closeCheckout()">Continue Shopping</button>
				</div>
			</div>
		`;
	}


	function prevCheckoutStep() {
		if (currentCheckoutStep > 1) {
			currentCheckoutStep--;
			renderCheckoutStep(currentCheckoutStep);
		}
	}


	function placeOrder() {
		// Validate final step
		if (!validateCurrentStep()) {
			return;
		}
		
		// Create order
		const orderNumber = 'ORD-' + Date.now().toString().slice(-6);
		const cartItems = Object.values(state.cart);
		const subtotal = cartItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
		const shipping = subtotal > 500 ? 0 : 50;
		const tax = Math.round(subtotal * 0.18); // 18% GST
		const total = subtotal + shipping + tax;
		
		const selectedAddr = state.userAddresses.find(addr => addr.id === selectedAddress);
		const selectedPm = state.paymentMethods.find(pm => pm.id === selectedPayment);
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		
		// Calculate delivery date (3-5 business days)
		const deliveryDate = new Date();
		deliveryDate.setDate(deliveryDate.getDate() + 4);
		
		const order = {
			id: orderNumber,
			userId: user.email,
			date: new Date().toISOString(),
			status: 'confirmed',
			items: cartItems.map(item => ({
				id: item.id,
				title: item.title,
				price: item.price,
				qty: item.qty,
				quantity: item.qty, // Add both for compatibility
				image: item.image,
				brand: item.brand
			})),
			subtotal: subtotal,
			shipping: shipping,
			tax: tax,
			total: total,
			address: selectedAddr,
			paymentMethod: selectedPm,
			deliveryDate: deliveryDate.toISOString(),
			estimatedDelivery: '3-5 business days',
			orderStatus: 'Confirmed',
			trackingNumber: 'TRK' + Date.now().toString().slice(-8)
		};
		
		// Add to orders
		console.log('=== BEFORE ADDING ORDER ===');
		console.log('Orders before:', state.orders);
		console.log('Orders count before:', state.orders.length);
		
		state.orders.push(order);
		console.log('Orders after push:', state.orders);
		console.log('Orders count after:', state.orders.length);
		
		saveOrders();
		
		// Debug: Log order creation
		console.log('=== ORDER CREATED DEBUG ===');
		console.log('New order:', order);
		console.log('Total orders in state:', state.orders.length);
		console.log('Orders in localStorage:', localStorage.getItem('orders'));
		console.log('=== END ORDER DEBUG ===');
		
		// CLEAR CART LIKE MINUS ICON - Order place hone ke baad
		console.log('=== ORDER PLACED - CLEARING CART LIKE MINUS ICON ===');
		
		// Get all cart items and remove them one by one (like minus icon)
		const cartItemIds = Object.keys(state.cart);
		console.log('Removing cart items:', cartItemIds);
		console.log('Before clear - localStorage cart:', localStorage.getItem(`cart_${user.email}`));
		
		// Remove each item from cart (same as minus icon functionality)
		cartItemIds.forEach(id => {
			delete state.cart[id];
		});
		
		// Save cart to localStorage (same as minus icon)
		saveCart();
		
		// ALSO explicitly remove the cart key from localStorage to ensure it's empty
		const cartKey = `cart_${user.email}`;
		localStorage.removeItem(cartKey);
		
		// Update UI (same as minus icon)
		renderGrid();
		renderCart();
		updateCartCount();
		
		console.log('After clear - localStorage cart:', localStorage.getItem(cartKey));
		console.log('Cart cleared like minus icon - Items:', Object.keys(state.cart).length);
		console.log('=== CART CLEARED LIKE MINUS ICON ===');
		
		// Close cart drawer if open
		const cartDrawer = document.getElementById('cart-drawer');
		if (cartDrawer && cartDrawer.classList.contains('open')) {
			closeCart();
		}
		
		// Store order details for confirmation
		window.lastOrderDetails = order;
		
		// Move to confirmation step
		currentCheckoutStep = 4;
		renderCheckoutStep(currentCheckoutStep);
		
		
		showNotification('Order placed successfully!', 'success');
	}

	function showNotification(message, type = 'info') {
		// Create notification element
		const notification = document.createElement('div');
		notification.className = `notification notification-${type}`;
		notification.textContent = message;
		
		// Add styles
		notification.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			padding: 12px 20px;
			border-radius: 8px;
			color: white;
			font-weight: 500;
			z-index: 10000;
			transform: translateX(100%);
			transition: transform 0.3s ease;
		`;
		
		// Set background color based on type
		switch (type) {
			case 'success':
				notification.style.background = '#10b981';
				break;
			case 'error':
				notification.style.background = '#ef4444';
				break;
			case 'warning':
				notification.style.background = '#f59e0b';
				break;
			default:
				notification.style.background = '#6b7280';
		}
		
		// Add to DOM
		document.body.appendChild(notification);
		
		// Animate in
		setTimeout(() => {
			notification.style.transform = 'translateX(0)';
		}, 100);
		
		// Remove after 3 seconds
		setTimeout(() => {
			notification.style.transform = 'translateX(100%)';
			setTimeout(() => {
				document.body.removeChild(notification);
			}, 300);
		}, 3000);
	}

	function renderAuthArea() {
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		console.log('renderAuthArea - user:', user);
		if (!authArea) return;
		if (user) {
			console.log('User is authenticated, rendering user info');
			authArea.innerHTML = `
				<div class="user-info">
					<div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
					<div class="user-details">
						<div class="user-name">${user.name}</div>
						<div class="user-role">${user.role || "customer"}</div>
					</div>
				</div>
			`;
			const ordersBtn = document.getElementById('orders-btn');
			if (ordersBtn) {
				ordersBtn.style.display = 'flex';
			}
		} else {
			console.log('User is not authenticated, showing login/signup buttons');
			authArea.innerHTML = `
				<a class="action-btn login-btn" href="login.html?next=index.html">
					<span class="btn-icon">👤</span>
					<span class="btn-text">Login</span>
				</a>
				<a class="action-btn signup-btn primary" href="signup.html">
					<span class="btn-icon">✍️</span>
					<span class="btn-text">Sign Up</span>
				</a>
			`;
			const ordersBtn = document.getElementById('orders-btn');
			if (ordersBtn) {
				ordersBtn.style.display = 'none';
			}
		}
	}


	// ----- Banner Carousel -----
	let currentSlide = 0;
	let slideInterval;
	
	function initBannerCarousel() {
		const slides = document.querySelectorAll('.banner-slide');
		const dots = document.querySelectorAll('.dot');
		const totalSlides = slides.length;
		
		if (totalSlides === 0) return; // No banner slides found
		
		function showSlide(index) {
			slides.forEach((slide, i) => {
				slide.classList.toggle('active', i === index);
			});
			dots.forEach((dot, i) => {
				dot.classList.toggle('active', i === index);
			});
		}
		
		function nextSlide() {
			currentSlide = (currentSlide + 1) % totalSlides;
			showSlide(currentSlide);
		}
		
		function prevSlide() {
			currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
			showSlide(currentSlide);
		}
		
		function startAutoSlide() {
			slideInterval = setInterval(nextSlide, 4000); // Auto-slide every 4 seconds
		}
		
		function stopAutoSlide() {
			if(slideInterval) {
				clearInterval(slideInterval);
			}
		}
		
		// Start auto-sliding
		startAutoSlide();
		
		// Event listeners
		const nextBtn = document.getElementById('banner-next');
		const prevBtn = document.getElementById('banner-prev');
		
		if (nextBtn) {
			nextBtn.addEventListener('click', () => {
				nextSlide();
				stopAutoSlide();
				startAutoSlide(); // Restart auto-slide
			});
		}
		
		if (prevBtn) {
			prevBtn.addEventListener('click', () => {
				prevSlide();
				stopAutoSlide();
				startAutoSlide(); // Restart auto-slide
			});
		}
		
		dots.forEach((dot, index) => {
			dot.addEventListener('click', () => {
				currentSlide = index;
				showSlide(currentSlide);
				stopAutoSlide();
				startAutoSlide(); // Restart auto-slide
			});
		});
	}

	// ----- Init -----
	// Immediate authentication check
	function immediateAuthCheck() {
		console.log('immediateAuthCheck called');
		// Check if user is logged in by checking localStorage directly
		const session = localStorage.getItem('session');
		console.log('Session in localStorage:', session);
		
		if (!session) {
			console.log('No session found, redirecting to login');
			// Only redirect if we're not already on the login page
			if (!window.location.pathname.includes('login.html')) {
				window.location.href = 'login.html?next=' + encodeURIComponent(window.location.pathname);
			}
			return;
		}
		
		// If session exists, wait for Auth module and then proceed
		console.log('Session found, proceeding with Auth module check');
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', checkAuthentication);
		} else {
			checkAuthentication();
		}
	}
	


	// Test function to check cart key
	window.checkCartKey = function() {
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		if (!user) {
			console.log('No user logged in');
			return;
		}
		const cartKey = `cart_${user.email}`;
		const cartFromStorage = localStorage.getItem(cartKey);
		const cartFromState = Object.keys(state.cart).length;
		
		console.log('=== CART KEY CHECK ===');
		console.log('User:', user.email);
		console.log('Cart key:', cartKey);
		console.log('Items in state.cart:', cartFromState);
		console.log('Items in localStorage:', cartFromStorage ? JSON.parse(cartFromStorage) : 'null');
		console.log('====================');
	};

	// Function to clear cart and close checkout
	window.clearCartAndCloseCheckout = function() {
		console.log('=== CLEAR CART AND CLOSE CHECKOUT ===');
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		if (user) {
			const cartKey = `cart_${user.email}`;
			console.log('Clearing cart for user:', user.email);
			
			// Clear state cart
			state.cart = {};
			
			// Clear from localStorage
			localStorage.removeItem(cartKey);
			localStorage.removeItem('cart');
			
			// Save empty cart
			saveCart();
			
			// Update UI
			renderCart();
			updateCartCount();
			
			console.log('Cart cleared from Continue Shopping button');
		}
		
		// Close checkout
		closeCheckout();
	};

	// Function to clear cart from Continue Shopping button
	window.clearCartFromContinueShopping = function() {
		console.log('=== CONTINUE SHOPPING - CLEARING CART ===');
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		if (user) {
			const cartKey = `cart_${user.email}`;
			console.log('Clearing cart for user:', user.email);
			console.log('Before clear - localStorage cart:', localStorage.getItem(cartKey));
			
			// Clear state cart
			state.cart = {};
			
			// Clear from localStorage
			localStorage.removeItem(cartKey);
			localStorage.removeItem('cart');
			
			// Save empty cart
			saveCart();
			
			// Update UI
			renderCart();
			updateCartCount();
			
			console.log('After clear - localStorage cart:', localStorage.getItem(cartKey));
			console.log('Cart cleared from Continue Shopping button');
		}
		
		// Close order confirmation modal
		const orderConfirmation = document.getElementById('order-confirmation');
		if (orderConfirmation) {
			orderConfirmation.classList.remove('open');
			orderConfirmation.setAttribute('aria-hidden','true');
		}
	};

	// Test function to manually clear cart
	window.testClearCart = function() {
		console.log('=== TEST CLEAR CART ===');
		clearCartFromContinueShopping();
	};

	// Test function to check orders
	window.testOrders = function() {
		console.log('=== TEST ORDERS ===');
		const user = (window.Auth && typeof window.Auth.getCurrentUser === "function") ? window.Auth.getCurrentUser() : null;
		console.log('Current user:', user);
		console.log('All orders in state:', state.orders);
		console.log('Orders in localStorage:', localStorage.getItem('orders'));
		console.log('=== END TEST ORDERS ===');
	};

	// Start immediate authentication check
	immediateAuthCheck();
	
	
})();
