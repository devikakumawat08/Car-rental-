// Mobile Navigation Toggle
function initializeNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
            });
        });
    }
}

// Vehicle Filtering
function initializeVehicleFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            vehicleCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.classList.remove('hidden');
                    card.style.display = 'block';
                } else {
                    card.classList.add('hidden');
                    card.style.display = 'none';
                }
            });
        });
    });
}

// Vehicle Pricing Toggles
function initializePricingToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const vehicleCard = button.closest('.vehicle-card');
            const allToggles = vehicleCard.querySelectorAll('.toggle-btn');
            const allTabs = vehicleCard.querySelectorAll('.price-tab');
            const period = button.getAttribute('data-period');
            
            // Remove active class from all toggles in this card
            allToggles.forEach(toggle => toggle.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            // Hide all tabs and show the selected one
            allTabs.forEach(tab => {
                tab.classList.remove('active');
                if (tab.getAttribute('data-period') === period) {
                    tab.classList.add('active');
                }
            });
            
            // Show notification about the selected period
            const vehicleName = vehicleCard.querySelector('h4').textContent;
            if (period === 'weekly') {
                showNotification(`${vehicleName} weekly rate: 1500km included for 7 days`, 'info');
            } else {
                showNotification(`${vehicleName} daily rate: 300km included per day`, 'info');
            }
        });
    });
}

// Booking Form Handling
function initializeBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    
    if (bookingForm) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        const pickupDate = document.getElementById('pickupDate');
        const returnDate = document.getElementById('returnDate');
        
        if (pickupDate) {
            pickupDate.setAttribute('min', today);
            pickupDate.addEventListener('change', () => {
                if (returnDate) {
                    returnDate.setAttribute('min', pickupDate.value);
                }
            });
        }
        
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = {
                pickupLocation: document.getElementById('pickupLocation').value,
                returnLocation: document.getElementById('pickupLocation').value, // Same as pickup
                pickupDate: document.getElementById('pickupDate').value,
                returnDate: document.getElementById('returnDate').value,
                pickupTime: document.getElementById('pickupTime').value,
                returnTime: document.getElementById('returnTime')?.value || formData.pickupTime,
                vehicleType: document.getElementById('vehicleType').value
            };
            
            // Validate form
            if (!formData.pickupLocation || !formData.pickupDate || 
                !formData.returnDate || !formData.pickupTime || !formData.vehicleType) {
                showNotification('Please fill in all required fields to check self-drive availability', 'error');
                return;
            }
            
            // Calculate days
            const pickup = new Date(formData.pickupDate);
            const returnDateObj = new Date(formData.returnDate);
            const timeDiff = returnDateObj.getTime() - pickup.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            if (daysDiff < 1) {
                showNotification('Return date must be after pickup date for self-drive rental', 'error');
                return;
            }
            
            // Simulate booking process
            showNotification('Checking availability...', 'info');
            
            setTimeout(() => {
                const vehiclePricing = getVehiclePricing(formData.vehicleType);
                let pricingInfo = '';
                let kmLimitInfo = '';
                
                if (vehiclePricing) {
                    if (daysDiff >= 7) {
                        const weeks = Math.floor(daysDiff / 7);
                        const extraDays = daysDiff % 7;
                        pricingInfo = `Weekly Rate: ₹${vehiclePricing.weekly.toLocaleString()} × ${weeks} week(s)`;
                        if (extraDays > 0) {
                            pricingInfo += ` + ₹${vehiclePricing.daily['24hr'].toLocaleString()} × ${extraDays} day(s)`;
                        }
                        kmLimitInfo = `Running Limit: ${vehiclePricing.kmLimit.weekly} per week`;
                    } else {
                        pricingInfo = `Daily Rate: ₹${vehiclePricing.daily['24hr'].toLocaleString()} × ${daysDiff} day(s)`;
                        kmLimitInfo = `Running Limit: ${vehiclePricing.kmLimit.daily} per day`;
                    }
                }
                
                showNotification(`Great! ${getVehicleTypeName(formData.vehicleType)} available for ${daysDiff} day(s) at ${getLocationName(formData.pickupLocation)}. ${kmLimitInfo}. Same-location return required.`, 'success');
                
                // Generate booking reference
                const bookingRef = 'EB' + Date.now().toString().slice(-6);
                
                setTimeout(() => {
                    alert(`Self-Drive Booking Reference: ${bookingRef}\n\nVehicle: ${getVehicleTypeName(formData.vehicleType)}\nLocation: ${getLocationName(formData.pickupLocation)}\nPickup: ${formData.pickupDate} at ${formData.pickupTime}\nReturn: ${formData.returnDate} at ${formData.returnTime || formData.pickupTime}\nDuration: ${daysDiff} day(s)\n\n${pricingInfo}\n${kmLimitInfo}\nExtra KM: ₹8 per km (daily) / ₹6 per km (weekly)\n\n** SAME-LOCATION RETURN POLICY **\nVehicle MUST be returned to ${getLocationName(formData.pickupLocation)}\nOne-way rentals are not available.\n\n** SELF-DRIVE RENTAL - NO DRIVER PROVIDED **\nYou will drive the vehicle yourself.\n\nRequired Documents:\n• Valid Driving License\n• Aadhar Card/Government ID\n• Security Deposit\n\nOur team will call you within 30 minutes to confirm booking details.`);
                }, 2000);
            }, 1500);
        });
    }
}

// Contact Form Handling
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('contactName').value,
                phone: document.getElementById('contactPhone').value,
                email: document.getElementById('contactEmail').value,
                serviceType: document.getElementById('serviceType').value,
                message: document.getElementById('contactMessage').value
            };
            
            // Validate required fields
            if (!formData.name || !formData.phone || !formData.serviceType) {
                showNotification('Please fill in all required fields for your self-drive inquiry', 'error');
                return;
            }
            
            // Validate phone number (basic validation)
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(formData.phone.replace(/[\s\-\+]/g, '').slice(-10))) {
                showNotification('Please enter a valid 10-digit phone number', 'error');
                return;
            }
            
            // Simulate sending message
            showNotification('Sending your message...', 'info');
            
            setTimeout(() => {
                showNotification('Thank you for your self-drive inquiry! We will contact you within 2 hours with availability, pricing, and running limit details.', 'success');
                contactForm.reset();
            }, 1500);
        });
    }
}

// Utility Functions
function getVehicleTypeName(type) {
    const types = {
        'swift-new': 'New Swift',
        'swift-old': 'Old Swift',
        'dzire': 'Swift Dzire',
        'swift-dzire': 'Swift Dzire',
        'thar': 'Mahindra Thar',
        'scorpio': 'Mahindra Scorpio',
        'venue': 'Hyundai Venue'
    };
    return types[type] || type;
}

function getLocationName(locationId) {
    const locations = {
        'khatushyamji': 'Toran Dawar Khatushyamji',
        'sikar': 'Sawali Circle Sikar',
        'reengus': 'Bheru Ji Mode Reengus',
        'jaipur': 'Sindhi Camp Jaipur'
    };
    return locations[locationId] || locationId;
}

function getVehiclePricing(vehicleType, period = 'daily') {
    const pricing = {
        'swift-new': {
            daily: { '12hr': 1800, '24hr': 2800 },
            weekly: 18000,
            kmLimit: { daily: '300km', weekly: '1500km' }
        },
        'swift-old': {
            daily: { '12hr': 1700, '24hr': 2700 },
            weekly: 17000,
            kmLimit: { daily: '300km', weekly: '1500km' }
        },
        'swift-dzire': {
            daily: { '12hr': 1900, '24hr': 2900 },
            weekly: 19000,
            kmLimit: { daily: '300km', weekly: '1500km' }
        },
        'thar': {
            daily: { '12hr': 3500, '24hr': 5500 },
            weekly: 32000,
            kmLimit: { daily: '300km', weekly: '1500km' }
        },
        'scorpio': {
            daily: { '12hr': 3500, '24hr': 5500 },
            weekly: 30000,
            kmLimit: { daily: '300km', weekly: '1500km' }
        },
        'venue': {
            daily: { '12hr': 2000, '24hr': 3000 },
            weekly: 20000,
            kmLimit: { daily: '300km', weekly: '1500km' }
        }
    };
    
    return pricing[vehicleType] || null;
}

function showNotification(message, type = 'info') {
    // Create notification element with enhanced styling
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    
    // Create icon based on type
    const icons = {
        'success': '<i class="fas fa-check-circle"></i>',
        'error': '<i class="fas fa-exclamation-circle"></i>',
        'info': '<i class="fas fa-car"></i>',
        'warning': '<i class="fas fa-exclamation-triangle"></i>'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">${icons[type] || icons.info}</div>
        <div class="notification-message">${message}</div>
        <button class="notification-close" onclick="this.parentNode.remove()">×</button>
    `;
    
    // Add enhanced styles with yellow-black theme
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        padding: 20px;
        border-radius: 16px;
        color: var(--color-black-primary);
        font-weight: 600;
        z-index: 2000;
        max-width: 420px;
        backdrop-filter: blur(20px);
        border: 2px solid var(--color-yellow-primary);
        transform: translateX(120%) scale(0.8);
        transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        display: flex;
        align-items: center;
        gap: 15px;
        box-shadow: 0 20px 40px rgba(255, 215, 0, 0.3);
    `;
    
    // Set background gradient based on type (yellow-black theme)
    const gradients = {
        'success': 'linear-gradient(135deg, #FFD700, #FFC107)',
        'error': 'linear-gradient(135deg, #FFD700, #FFC107)',
        'info': 'linear-gradient(135deg, #FFD700, #FFC107)',
        'warning': 'linear-gradient(135deg, #FFD700, #FFC107)'
    };
    notification.style.background = gradients[type] || gradients.info;
    
    // Style the icon
    const iconElement = notification.querySelector('.notification-icon');
    if (iconElement) {
        iconElement.style.cssText = `
            font-size: 24px;
            flex-shrink: 0;
        `;
    }
    
    // Style the message
    const messageElement = notification.querySelector('.notification-message');
    if (messageElement) {
        messageElement.style.cssText = `
            flex: 1;
            line-height: 1.4;
        `;
    }
    
    // Style the close button
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
        closeButton.style.cssText = `
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--color-black-primary);
            color: var(--color-black-primary);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
            transition: all 0.3s ease;
        `;
        
        closeButton.addEventListener('mouseenter', () => {
            closeButton.style.background = 'rgba(255, 255, 255, 0.3)';
            closeButton.style.transform = 'scale(1.1)';
        });
        
        closeButton.addEventListener('mouseleave', () => {
            closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
            closeButton.style.transform = 'scale(1)';
        });
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0) scale(1)';
    }, 100);
    
    // Auto-remove after 6 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(120%) scale(0.8)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }
    }, 6000);
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Initialize modal click handlers
function initializeModals() {
    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modals.forEach(modal => {
                if (modal.classList.contains('show')) {
                    hideModal(modal.id);
                }
            });
        }
    });
}

// Smooth Scrolling for Navigation Links
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Vehicle Card Click Handlers
function initializeVehicleCards() {
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    
    vehicleCards.forEach(card => {
        const bookButton = card.querySelector('.btn--outline');
        if (bookButton) {
            bookButton.addEventListener('click', (e) => {
                e.preventDefault();
                
                const vehicleName = card.querySelector('h4').textContent;
                const vehiclePrice = card.querySelector('.price').textContent;
                const vehicleCategory = card.querySelector('.vehicle-category').textContent;
                
                // Pre-fill booking form
                const vehicleTypeSelect = document.getElementById('vehicleType');
                const categoryMap = {
                    'Scooters & Bikes': 'scooter',
                    'Cars & Sedans': 'car',
                    'SUVs & MUVs': 'suv',
                    'Tempo Travellers': 'tempo'
                };
                
                if (vehicleTypeSelect) {
                    vehicleTypeSelect.value = categoryMap[vehicleCategory] || '';
                }
                
                // Scroll to booking form
                const bookingForm = document.getElementById('bookingForm');
                if (bookingForm) {
                    bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                showNotification(`Selected: ${vehicleName} for self-drive rental`, 'info');
            });
        }
    });
}

// Enhanced Intersection Observer for Animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered animation delays
                setTimeout(() => {
                    const element = entry.target;
                    
                    // Different animations for different elements
                    if (element.classList.contains('vehicle-card')) {
                        element.classList.add('slide-in-left');
                    } else if (element.classList.contains('service-card')) {
                        element.classList.add('bounce-in');
                    } else if (element.classList.contains('pricing-card')) {
                        element.classList.add('slide-in-right');
                    } else if (element.classList.contains('testimonial-card')) {
                        element.classList.add('fade-in');
                    } else {
                        element.classList.add('fade-in');
                    }
                    
                    // Add floating animation to certain elements
                    if (element.classList.contains('service-card') || element.classList.contains('pricing-card')) {
                        setTimeout(() => {
                            element.classList.add('float');
                        }, 800);
                    }
                }, index * 200); // Stagger animations
            }
        });
    }, observerOptions);
    
    // Observe elements
    const elementsToAnimate = document.querySelectorAll('.vehicle-card, .service-card, .pricing-card, .testimonial-card, .stat-item, .contact-item');
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
    
    // Counter animation for stats
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
}

// Counter Animation Function
function animateCounter(element) {
    const target = parseInt(element.textContent.replace(/[^0-9]/g, ''));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const counter = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(counter);
        }
        
        const suffix = element.textContent.replace(/[0-9]/g, '');
        element.textContent = Math.floor(current) + suffix;
    }, 16);
}

// Enhanced Navbar Scroll Effect
function initializeNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide navbar on scroll down, show on scroll up
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Scroll Progress Bar
function initializeScrollProgress() {
    // Create scroll progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / documentHeight) * 100;
        
        progressBar.style.width = `${progress}%`;
    });
}

// Enhanced Price Calculator with Running Limits
function initializePriceCalculator() {
    const pickupDate = document.getElementById('pickupDate');
    const returnDate = document.getElementById('returnDate');
    const vehicleType = document.getElementById('vehicleType');
    
    // Create enhanced price display element
    const priceDisplay = document.createElement('div');
    priceDisplay.className = 'price-display enhanced';
    priceDisplay.style.cssText = `
        margin-top: 16px;
        padding: 20px;
        background: linear-gradient(135deg, rgba(8, 145, 178, 0.15), rgba(245, 158, 11, 0.15));
        border-radius: 16px;
        border: 2px solid rgba(8, 145, 178, 0.3);
        text-align: center;
        transition: all 0.4s ease;
        display: none;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    `;
    
    // Add price display after the form
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.appendChild(priceDisplay);
    }
    
    function calculatePrice() {
        if (!pickupDate?.value || !returnDate?.value || !vehicleType?.value) {
            priceDisplay.style.display = 'none';
            return;
        }
        
        const pickup = new Date(pickupDate.value);
        const returnDateObj = new Date(returnDate.value);
        const timeDiff = returnDateObj.getTime() - pickup.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (daysDiff < 1) {
            priceDisplay.style.display = 'none';
            return;
        }
        
        // Show loading state
        priceDisplay.style.display = 'block';
        priceDisplay.innerHTML = '<div class="loading-spinner"></div><p style="margin-top: 10px; color: white;">Calculating best price...</p>';
        
        setTimeout(() => {
            const basePrices = {
                'scooter': 300,
                'car': 1200,
                'suv': 2200,
                'tempo': 3500
            };
            
            const vehicleNames = {
                'scooter': 'Scooters & Bikes',
                'car': 'Cars & Sedans', 
                'suv': 'SUVs & MUVs',
                'tempo': 'Tempo Travellers'
            };
            
            const vehiclePricing = basePrices[vehicleType.value];
            if (!vehiclePricing) return;
            
            let totalPrice = 0;
            let discountText = '';
            let originalPrice = 0;
            let pricingDetails = '';
            
            // Calculate pricing based on rental duration
            if (daysDiff === 1) {
                // For single day, show both 12hr and 24hr options
                const price12hr = vehiclePricing['12hr'];
                const price24hr = vehiclePricing['24hr'];
                totalPrice = price24hr;
                originalPrice = totalPrice;
                pricingDetails = `12hrs: ₹${price12hr.toLocaleString()} | 24hrs: ₹${price24hr.toLocaleString()}`;
            } else {
                // For multiple days, use 24hr price
                const dailyPrice = vehiclePricing['24hr'];
                totalPrice = dailyPrice * daysDiff;
                originalPrice = totalPrice;
                
                // Apply discounts for longer rentals
                if (daysDiff >= 30) {
                    totalPrice *= 0.75;
                    discountText = '25% Monthly Discount Applied!';
                } else if (daysDiff >= 7) {
                    totalPrice *= 0.85;
                    discountText = '15% Weekly Discount Applied!';
                }
                
                pricingDetails = `₹${dailyPrice.toLocaleString()} per day × ${daysDiff} days`;
            }
            
            const savings = originalPrice - totalPrice;
            
            priceDisplay.innerHTML = `
                <div style="color: white; font-weight: 600; margin-bottom: 8px;">
                    ${vehicleNames[vehicleType.value]}
                </div>
                <div style="color: white; font-size: 24px; font-weight: 800; margin-bottom: 8px;">
                    ₹${Math.round(totalPrice).toLocaleString()}
                </div>
                <div style="color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 8px;">
                    ${pricingDetails}
                </div>
                ${savings > 0 ? `
                    <div style="color: #10b981; font-weight: 600; font-size: 14px; margin-bottom: 4px;">
                        ${discountText}
                    </div>
                    <div style="color: rgba(255,255,255,0.7); font-size: 12px; text-decoration: line-through;">
                        Original: ₹${Math.round(originalPrice).toLocaleString()}
                    </div>
                    <div style="color: #10b981; font-weight: 600; font-size: 12px;">
                        You Save: ₹${Math.round(savings).toLocaleString()}
                    </div>
                ` : ''}
            `;
            
            // Add bounce animation
            priceDisplay.style.transform = 'scale(0.95)';
            setTimeout(() => {
                priceDisplay.style.transform = 'scale(1)';
            }, 100);
        }, 800);
    }
    
    [pickupDate, returnDate, vehicleType].forEach(element => {
        if (element) {
            element.addEventListener('change', calculatePrice);
        }
    });
}

// Enhanced WhatsApp Integration
function initializeWhatsApp() {
    // Add WhatsApp floating button with enhanced styling
    const whatsappContainer = document.createElement('div');
    whatsappContainer.className = 'whatsapp-container';
    
    const whatsappButton = document.createElement('a');
    whatsappButton.href = 'https://wa.me/917073517615?text=Hi,%20I%20want%20to%20book%20a%20self-drive%20vehicle%20from%20Elite%20Brothers.%20Please%20share%20availability%20and%20pricing%20with%20running%20limits.';
    whatsappButton.target = '_blank';
    whatsappButton.className = 'whatsapp-float';
    whatsappButton.innerHTML = '<i class="fab fa-whatsapp"></i>';
    
    const whatsappTooltip = document.createElement('div');
    whatsappTooltip.className = 'whatsapp-tooltip';
    whatsappTooltip.textContent = 'Book Self-Drive • Running Limits Included';
    
    // Add enhanced styles
    whatsappContainer.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 15px;
    `;
    
    whatsappButton.style.cssText = `
        width: 70px;
        height: 70px;
        background: linear-gradient(135deg, #25d366, #128c7e);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 28px;
        box-shadow: 0 8px 25px rgba(37, 211, 102, 0.4);
        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        animation: pulse 2s infinite;
        position: relative;
        overflow: hidden;
    `;
    
    whatsappTooltip.style.cssText = `
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 16px;
        border-radius: 25px;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        opacity: 0;
        transform: translateX(20px);
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    
    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes whatsappPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); box-shadow: 0 12px 35px rgba(37, 211, 102, 0.6); }
            100% { transform: scale(1); }
        }
        .whatsapp-float { animation: whatsappPulse 3s infinite; }
    `;
    document.head.appendChild(style);
    
    whatsappButton.addEventListener('mouseenter', () => {
        whatsappButton.style.transform = 'scale(1.15) rotate(10deg)';
        whatsappButton.style.boxShadow = '0 15px 40px rgba(37, 211, 102, 0.6)';
        whatsappTooltip.style.opacity = '1';
        whatsappTooltip.style.transform = 'translateX(0)';
    });
    
    whatsappButton.addEventListener('mouseleave', () => {
        whatsappButton.style.transform = 'scale(1) rotate(0deg)';
        whatsappButton.style.boxShadow = '0 8px 25px rgba(37, 211, 102, 0.4)';
        whatsappTooltip.style.opacity = '0';
        whatsappTooltip.style.transform = 'translateX(20px)';
    });
    
    whatsappContainer.appendChild(whatsappTooltip);
    whatsappContainer.appendChild(whatsappButton);
    document.body.appendChild(whatsappContainer);
}

// Floating Background Elements
function createFloatingElements() {
    const floatingContainer = document.createElement('div');
    floatingContainer.className = 'floating-elements';
    
    for (let i = 0; i < 3; i++) {
        const circle = document.createElement('div');
        circle.className = 'floating-circle';
        floatingContainer.appendChild(circle);
    }
    
    document.body.appendChild(floatingContainer);
}

// Running Limits Display Enhancement
function initializeRunningLimitsDisplay() {
    // Add running limits info to all vehicle cards
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    
    vehicleCards.forEach(card => {
        const vehicleTitle = card.querySelector('h4').textContent;
        const infoSection = card.querySelector('.vehicle-info');
        
        // Create running limits display
        const runningLimitsDiv = document.createElement('div');
        runningLimitsDiv.className = 'running-limits-info';
        runningLimitsDiv.style.cssText = `
            background: var(--color-bg-3);
            padding: 12px;
            border-radius: 8px;
            margin: 12px 0;
            border-left: 4px solid var(--color-success);
        `;
        
        runningLimitsDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="color: var(--color-success); font-weight: 600; font-size: 12px;">🏃‍♂️ RUNNING LIMITS</span>
                <span style="color: var(--color-text-secondary); font-size: 11px;">Extra charges apply</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
                <div>
                    <span style="color: var(--color-text); font-weight: 500;">Daily:</span>
                    <span style="color: var(--color-success); font-weight: 600;">300km</span>
                </div>
                <div>
                    <span style="color: var(--color-text); font-weight: 500;">Weekly:</span>
                    <span style="color: var(--color-success); font-weight: 600;">1500km</span>
                </div>
            </div>
            <div style="font-size: 10px; color: var(--color-text-secondary); margin-top: 6px;">
                Extra: ₹8/km (daily) • ₹6/km (weekly)
            </div>
        `;
        
        // Insert before pricing section
        const pricingSection = card.querySelector('.vehicle-price');
        if (pricingSection) {
            infoSection.insertBefore(runningLimitsDiv, pricingSection);
        }
    });
}

// Google Form Button Tracking
function initializeGoogleFormButtons() {
    const googleFormButtons = document.querySelectorAll('.btn--google-form');
    
    googleFormButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Show notification when clicking Google Form button
            showNotification('Opening Google Form... Please fill in all details for faster response!', 'info');
            
            // Track button click location for analytics
            const buttonLocation = button.closest('.hero-cta') ? 'Hero Section' : 
                                 button.closest('.google-form-cta') ? 'Contact Section' :
                                 button.closest('.footer-google-form') ? 'Footer' : 'Unknown';
            
            console.log(`Google Form opened from: ${buttonLocation}`);
        });
    });
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializeVehicleFilters();
    initializePricingToggles();
    initializeBookingForm();
    initializeContactForm();
    initializeModals();
    initializeSmoothScrolling();
    initializeVehicleCards();
    initializeAnimations();
    initializeNavbarScroll();
    initializePriceCalculator();
    initializeWhatsApp();
    initializeScrollProgress();
    createFloatingElements();
    addPageTransitions();
    initializeParticleEffect();
    initializeEnhancedFeatures();
    optimizePerformance();
    initializeRunningLimitsDisplay();
    initializeGoogleFormButtons();
    
    // Set current date as default for booking form
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const pickupDate = document.getElementById('pickupDate');
    const returnDate = document.getElementById('returnDate');
    
    if (pickupDate) pickupDate.value = today;
    if (returnDate) returnDate.value = tomorrowStr;
    
    console.log('Elite Brothers self-drive website with yellow-black theme and car animations initialized successfully!');
    
    // Show welcome message with same-location policy
    setTimeout(() => {
        showNotification('🚗 Welcome to Elite Brothers! Same-location return policy applies to all rentals.', 'info');
    }, 3000);
    
    // Show Google Form reminder after 10 seconds
    setTimeout(() => {
        showNotification('📝 Need quick booking? Use our "Send Us a Message" button to fill our Google Form!', 'info');
    }, 10000);
    
    // Initialize car animations
    initializeCarAnimations();
});

// Page Transitions
function addPageTransitions() {
    // Add smooth page load animation
    document.body.style.opacity = '0';
    document.body.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        document.body.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateY(0)';
    }, 100);
    
    // Add stagger animation to hero elements
    setTimeout(() => {
        const heroElements = document.querySelectorAll('.hero-text h1, .hero-text p, .hero-features, .booking-form-container');
        heroElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }, 300);
}

// Particle Effect for Hero Section
function initializeParticleEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    particleContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: hidden;
        z-index: 1;
    `;
    
    // Create particles
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            animation: float ${8 + Math.random() * 10}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        
        // Random position
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        particleContainer.appendChild(particle);
    }
    
    hero.appendChild(particleContainer);
}

// Enhanced Form Interactions
function enhanceFormExperience() {
    // Add floating label effect
    const formControls = document.querySelectorAll('.form-control');
    
    formControls.forEach(control => {
        const label = control.previousElementSibling;
        if (label && label.classList.contains('form-label')) {
            control.addEventListener('focus', () => {
                label.style.transform = 'translateY(-8px) scale(0.85)';
                label.style.color = '#0891b2';
            });
            
            control.addEventListener('blur', () => {
                if (!control.value) {
                    label.style.transform = 'translateY(0) scale(1)';
                    label.style.color = '';
                }
            });
        }
        
        // Add input validation visual feedback
        control.addEventListener('input', () => {
            if (control.checkValidity()) {
                control.style.borderColor = '#10b981';
                control.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
            } else {
                control.style.borderColor = '#ef4444';
                control.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
            }
        });
    });
}

// Advanced Mouse Interactions
function initializeMouseEffects() {
    // Create cursor follower
    const cursor = document.createElement('div');
    cursor.className = 'cursor-follower';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(8, 145, 178, 0.8), rgba(245, 158, 11, 0.8));
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.1s ease;
        opacity: 0;
        transform: translate(-50%, -50%);
    `;
    
    document.body.appendChild(cursor);
    
    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursor.style.opacity = '1';
    });
    
    // Hide cursor when mouse leaves
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    // Scale cursor on interactive elements
    const interactiveElements = document.querySelectorAll('button, a, .btn, .vehicle-card, .service-card');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(2)';
            cursor.style.background = 'radial-gradient(circle, rgba(245, 158, 11, 0.8), rgba(8, 145, 178, 0.8))';
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.background = 'radial-gradient(circle, rgba(8, 145, 178, 0.8), rgba(245, 158, 11, 0.8))';
        });
    });
}

// Parallax Scrolling Effects
function initializeParallax() {
    const parallaxElements = document.querySelectorAll('.hero-bg, .floating-circle');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        parallaxElements.forEach(element => {
            element.style.transform = `translateY(${rate}px)`;
        });
    });
}

// Advanced Loading States
function showLoadingState(element, message = 'Loading...') {
    const originalContent = element.innerHTML;
    element.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 12px;">
            <div class="loading-spinner"></div>
            <span>${message}</span>
        </div>
    `;
    element.disabled = true;
    
    return () => {
        element.innerHTML = originalContent;
        element.disabled = false;
    };
}

// Car Animations Controller
function initializeCarAnimations() {
    // Add more dynamic car elements
    const carAnimationsContainer = document.querySelector('.car-animations');
    
    // Create additional animated elements
    setTimeout(() => {
        // Add tire tracks
        const tireTrack = document.createElement('div');
        tireTrack.className = 'tire-track';
        tireTrack.style.cssText = `
            position: absolute;
            bottom: 10%;
            left: -100px;
            width: 200px;
            height: 4px;
            background: repeating-linear-gradient(
                90deg,
                transparent 0px,
                rgba(255, 215, 0, 0.3) 10px,
                transparent 20px
            );
            animation: tireTrackMove 8s linear infinite;
            opacity: 0.6;
        `;
        
        const style = document.createElement('style');
        style.textContent += `
            @keyframes tireTrackMove {
                0% { transform: translateX(0); }
                100% { transform: translateX(calc(100vw + 200px)); }
            }
        `;
        document.head.appendChild(style);
        
        carAnimationsContainer.appendChild(tireTrack);
        
        // Add speedometer needle animation
        const speedometer = document.createElement('div');
        speedometer.className = 'speedometer';
        speedometer.style.cssText = `
            position: absolute;
            top: 15%;
            right: 8%;
            width: 80px;
            height: 80px;
            border: 3px solid rgba(255, 215, 0, 0.4);
            border-radius: 50%;
            opacity: 0.5;
        `;
        
        const needle = document.createElement('div');
        needle.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 2px;
            height: 30px;
            background: var(--color-yellow-primary);
            transform-origin: bottom center;
            transform: translate(-50%, -100%);
            animation: speedometerNeedle 4s ease-in-out infinite;
        `;
        
        style.textContent += `
            @keyframes speedometerNeedle {
                0%, 100% { transform: translate(-50%, -100%) rotate(-30deg); }
                50% { transform: translate(-50%, -100%) rotate(30deg); }
            }
        `;
        
        speedometer.appendChild(needle);
        carAnimationsContainer.appendChild(speedometer);
        
        // Add traffic light animation
        const trafficLight = document.createElement('div');
        trafficLight.className = 'traffic-light';
        trafficLight.style.cssText = `
            position: absolute;
            top: 5%;
            left: 5%;
            width: 20px;
            height: 60px;
            background: rgba(0, 0, 0, 0.8);
            border-radius: 10px;
            border: 2px solid rgba(255, 215, 0, 0.3);
            opacity: 0.4;
        `;
        
        // Add traffic light colors
        ['red', 'yellow', 'green'].forEach((color, index) => {
            const light = document.createElement('div');
            light.style.cssText = `
                position: absolute;
                top: ${5 + (index * 17)}px;
                left: 50%;
                transform: translateX(-50%);
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: ${color === 'yellow' ? '#FFD700' : (color === 'red' ? '#ff4444' : '#44ff44')};
                opacity: ${color === 'yellow' ? '1' : '0.3'};
                animation: trafficLightBlink ${4 + index}s ease-in-out infinite;
                animation-delay: ${index * 1.5}s;
            `;
            trafficLight.appendChild(light);
        });
        
        style.textContent += `
            @keyframes trafficLightBlink {
                0%, 70%, 100% { opacity: 0.3; }
                15%, 55% { opacity: 1; }
            }
        `;
        
        carAnimationsContainer.appendChild(trafficLight);
        
    }, 2000);
    
    // Add sound wave visualizer (visual representation of car engine)
    setTimeout(() => {
        const soundWaves = document.createElement('div');
        soundWaves.className = 'sound-waves';
        soundWaves.style.cssText = `
            position: absolute;
            bottom: 25%;
            right: 20%;
            display: flex;
            gap: 4px;
            opacity: 0.3;
        `;
        
        for(let i = 0; i < 5; i++) {
            const wave = document.createElement('div');
            wave.style.cssText = `
                width: 3px;
                height: ${20 + Math.random() * 30}px;
                background: var(--color-yellow-primary);
                animation: soundWave 1s ease-in-out infinite;
                animation-delay: ${i * 0.2}s;
            `;
            soundWaves.appendChild(wave);
        }
        
        const style = document.createElement('style');
        style.textContent += `
            @keyframes soundWave {
                0%, 100% { height: 20px; opacity: 0.3; }
                50% { height: 50px; opacity: 0.8; }
            }
        `;
        document.head.appendChild(style);
        
        carAnimationsContainer.appendChild(soundWaves);
    }, 4000);
}

// Enhanced Vehicle Hover Effects
function enhanceVehicleAnimations() {
    const vehicleCards = document.querySelectorAll('.vehicle-card');
    
    vehicleCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add car driving sound effect visualization
            const soundEffect = document.createElement('div');
            soundEffect.className = 'hover-car-effect';
            soundEffect.style.cssText = `
                position: absolute;
                bottom: 10px;
                right: 10px;
                font-size: 20px;
                animation: carHover 0.8s ease-out;
                z-index: 10;
            `;
            soundEffect.textContent = '🏎️💨';
            
            const style = document.createElement('style');
            style.textContent += `
                @keyframes carHover {
                    0% { transform: translateX(50px) scale(0); opacity: 0; }
                    50% { transform: translateX(0) scale(1.2); opacity: 1; }
                    100% { transform: translateX(-20px) scale(1); opacity: 0.8; }
                }
            `;
            document.head.appendChild(style);
            
            card.appendChild(soundEffect);
            
            setTimeout(() => {
                if (soundEffect.parentNode) {
                    soundEffect.parentNode.removeChild(soundEffect);
                }
            }, 800);
        });
    });
}

// Initialize Enhanced Features
function initializeEnhancedFeatures() {
    enhanceFormExperience();
    initializeMouseEffects();
    initializeParallax();
    enhanceVehicleAnimations();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // ESC to close modals
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                hideModal(modal.id);
            });
        }
        
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const vehicleTypeSelect = document.getElementById('vehicleType');
            if (vehicleTypeSelect) {
                vehicleTypeSelect.focus();
                showNotification('Use the dropdown to search vehicles', 'info');
            }
        }
    });
    
    // Add scroll-triggered animations
    const observeElements = document.querySelectorAll('.section-header, .about-stats, .contact-details');
    const slideObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    observeElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        element.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        slideObserver.observe(element);
    });
}

// Performance Optimization
function optimizePerformance() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Debounce scroll events
    let scrollTimeout;
    const originalScrollHandler = window.onscroll;
    
    window.onscroll = function(e) {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(() => {
            if (originalScrollHandler) {
                originalScrollHandler(e);
            }
        }, 16); // ~60fps
    };
}
