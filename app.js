/* ==========================================
   SHRINGAR  SALON - JAVASCRIPT
   Features: Stateful Cart, Booking Flow, Slider, Scroll Reveal
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- State Management ---
    let bookedServices = [];
    const stylistsInfo = {
        'any': 'Any Specialist (No Preference)',
        'sophia': 'Sophia Vance (Master Stylist)',
        'julian': 'Julian Pierce (Color Specialist)',
        'elena': 'Elena Rostova (Skin Therapist)',
        'marcus': 'Marcus Vance (Nail Sculptor)'
    };

    // --- DOM Elements ---
    const header = document.getElementById('header');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Services Filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuCards = document.querySelectorAll('.menu-card');
    
    // Booking Form & Summary Basket
    const selectedList = document.getElementById('selected-list');
    const emptyBasketMsg = document.getElementById('empty-basket-message');
    const totalDurationEl = document.getElementById('total-duration');
    const totalPriceEl = document.getElementById('total-price');
    const selectedCountBadge = document.getElementById('selected-count');
    const appointmentForm = document.getElementById('appointment-form');
    const bookingDateInput = document.getElementById('booking-date');
    const bookingTimeSelect = document.getElementById('booking-time');
    
    // Modal Ticket elements
    const bookingModal = document.getElementById('booking-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const btnPrintTicket = document.getElementById('btn-print-ticket');
    
    // Contact Form
    const contactForm = document.getElementById('contact-form');
    const contactSuccessMsg = document.getElementById('contact-success-msg');

    // --- Sticky Header Scroll Effect ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active Nav Section Highlighting
        highlightNavOnScroll();
    });

    function highlightNavOnScroll() {
        let scrollPosition = window.scrollY + 120;
        document.querySelectorAll('section').forEach(section => {
            if (scrollPosition >= section.offsetTop && scrollPosition < (section.offsetTop + section.offsetHeight)) {
                const currentId = section.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // --- Mobile Hamburger Menu ---
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile nav when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scroll for "Book Now" header button
    document.querySelectorAll('.scroll-to-booking').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector('#booking');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });


    // --- Services Menu Filtering ---
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state on button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.getAttribute('data-category');

            menuCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                // Add fade out effect
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    if (category === 'all' || cardCategory === category) {
                        card.style.display = 'flex';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                }, 300);
            });
        });
    });


    // --- Cart / Booking Management ---

    // Delegate click to "Add to Booking" buttons
    document.querySelectorAll('.btn-add-service').forEach(button => {
        button.addEventListener('click', (e) => {
            const serviceId = button.getAttribute('data-id');
            const name = button.getAttribute('data-name');
            const price = parseFloat(button.getAttribute('data-price'));
            const duration = parseInt(button.getAttribute('data-duration'));

            toggleServiceBooking(serviceId, name, price, duration, button);
        });
    });

    function toggleServiceBooking(id, name, price, duration, cardBtn) {
        const index = bookedServices.findIndex(item => item.id === id);

        if (index === -1) {
            // Add service
            bookedServices.push({ id, name, price, duration });
            if (cardBtn) {
                cardBtn.classList.add('added');
                cardBtn.querySelector('.btn-text').textContent = 'Added';
                cardBtn.querySelector('.btn-icon i').className = 'fa-solid fa-check';
            }
        } else {
            // Remove service
            bookedServices.splice(index, 1);
            if (cardBtn) {
                cardBtn.classList.remove('added');
                cardBtn.querySelector('.btn-text').textContent = 'Add to Booking';
                cardBtn.querySelector('.btn-icon i').className = 'fa-solid fa-plus';
            }
        }

        updateBookingSummary();
    }

    function updateBookingSummary() {
        // Clear summary list
        selectedList.querySelectorAll('.basket-item').forEach(el => el.remove());

        if (bookedServices.length === 0) {
            emptyBasketMsg.style.display = 'block';
            selectedCountBadge.textContent = '0';
            totalDurationEl.textContent = '0 mins';
            totalPriceEl.textContent = '$0';
            return;
        }

        emptyBasketMsg.style.display = 'none';
        selectedCountBadge.textContent = bookedServices.length;

        let totalDuration = 0;
        let totalPrice = 0;

        bookedServices.forEach(service => {
            totalDuration += service.duration;
            totalPrice += service.price;

            // Create basket list item DOM
            const basketItem = document.createElement('div');
            basketItem.className = 'basket-item';
            basketItem.innerHTML = `
                <div class="basket-item-info">
                    <div class="basket-item-title">${service.name}</div>
                    <div class="basket-item-meta">${service.duration} mins</div>
                </div>
                <div class="basket-item-price-col">
                    <span class="basket-item-price">$${service.price}</span>
                    <button class="btn-remove-basket" data-id="${service.id}" aria-label="Remove service">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            `;

            // Event listener to remove from basket
            basketItem.querySelector('.btn-remove-basket').addEventListener('click', () => {
                // Find matching menu card button to restore state
                const originalBtn = document.querySelector(`.btn-add-service[data-id="${service.id}"]`);
                toggleServiceBooking(service.id, service.name, service.price, service.duration, originalBtn);
            });

            selectedList.appendChild(basketItem);
        });

        totalDurationEl.textContent = `${totalDuration} mins`;
        totalPriceEl.textContent = `$${totalPrice}`;
    }


    // --- Date/Time Limit and Generation ---
    
    // Disable selecting past dates (min = tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    
    bookingDateInput.min = `${year}-${month}-${day}`;

    // Enable and generate times slots when a valid date is picked
    bookingDateInput.addEventListener('change', () => {
        const selectedDate = new Date(bookingDateInput.value);
        const dayOfWeek = selectedDate.getDay(); // 0 is Sunday, 6 is Saturday
        
        bookingTimeSelect.removeAttribute('disabled');
        bookingTimeSelect.innerHTML = '<option value="">Select a time slot...</option>';
        
        // Generate hourly slots depending on business hours
        // Mon-Fri: 9am - 8pm (last slot 7pm)
        // Sat-Sun: 10am - 6pm (last slot 5pm)
        let startHour = 9;
        let endHour = 20;

        if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
            startHour = 10;
            endHour = 18;
        }

        for (let hour = startHour; hour < endHour; hour++) {
            let labelHour = hour > 12 ? hour - 12 : hour;
            let ampm = hour >= 12 ? 'PM' : 'AM';
            
            // Format to standard 10:00 AM style
            const timeVal = `${labelHour}:00 ${ampm}`;
            
            const option = document.createElement('option');
            option.value = timeVal;
            option.textContent = timeVal;
            bookingTimeSelect.appendChild(option);
        }
    });


    // --- Appointment Form Validation & Submission ---
    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Reset previous errors
        document.querySelectorAll('.form-group').forEach(grp => grp.classList.remove('invalid'));

        let isValid = true;

        // Verify that there is at least one service added
        if (bookedServices.length === 0) {
            alert('Your booking list is empty. Please select at least one treatment from the Services Menu above.');
            const targetMenu = document.getElementById('services');
            targetMenu.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        // Validate Full Name
        const nameVal = document.getElementById('client-name').value.trim();
        if (!nameVal) {
            setError('client-name');
            isValid = false;
        }

        // Validate Email
        const emailVal = document.getElementById('client-email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailVal || !emailRegex.test(emailVal)) {
            setError('client-email');
            isValid = false;
        }

        // Validate Phone Number
        const phoneVal = document.getElementById('client-phone').value.trim();
        if (!phoneVal) {
            setError('client-phone');
            isValid = false;
        }

        // Validate Date
        const dateVal = bookingDateInput.value;
        if (!dateVal) {
            setError('booking-date');
            isValid = false;
        }

        // Validate Time Slot
        const timeVal = bookingTimeSelect.value;
        if (!timeVal) {
            setError('booking-time');
            isValid = false;
        }

        if (!isValid) return;

        // If validation succeeds: Generate Stylist Ticket Details
        const reservationId = `AUR-${Math.floor(100000 + Math.random() * 900000)}`;
        const selectedStylistKey = document.getElementById('stylist-select').value;
        const selectedStylistName = stylistsInfo[selectedStylistKey];

        // Format date string beautifully (e.g. Wednesday, June 24, 2026)
        const dateObj = new Date(dateVal);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

                // Set Ticket Fields
        document.getElementById('t-id').textContent = reservationId;
        document.getElementById('t-guest').textContent = nameVal;
        document.getElementById('t-stylist').textContent = selectedStylistName;
        document.getElementById('t-datetime').textContent = `${formattedDate} at ${timeVal}`;
        
        // Render Booked Treatments List in ticket
        const tServicesList = document.getElementById('t-services-list');
        tServicesList.innerHTML = '';
        let totalPriceSum = 0;
        let servicesTextArray = [];

        bookedServices.forEach(srv => {
            totalPriceSum += srv.price;
            servicesTextArray.push(`${srv.name} ($${srv.price})`);
            const li = document.createElement('li');
            li.innerHTML = `<span>${srv.name}</span> <span>$${srv.price}</span>`;
            tServicesList.appendChild(li);
        });

        document.getElementById('t-total').textContent = `$${totalPriceSum}`;

        // Save Reservation in Local Storage for persistent records
        const reservationData = {
            id: reservationId,
            guest: nameVal,
            email: emailVal,
            phone: phoneVal,
            stylist: selectedStylistName,
            dateTime: `${formattedDate} at ${timeVal}`,
            services: bookedServices,
            total: totalPriceSum
        };
        localStorage.setItem(reservationId, JSON.stringify(reservationData));

        // Send Email Notification in the background via Web3Forms
        const web3formsAccessKey = "ef2a22b2-3406-4e6e-a098-997f2898b9ce"; // ⬅️ REPLACE WITH YOUR KEY HERE
        
        if (web3formsAccessKey) {
            const notesVal = document.getElementById('special-notes').value.trim();
            
            fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    access_key: web3formsAccessKey,
                    subject: `New Appointment Booking (${reservationId})`,
                    from_name: "Shringar Salon System",
                    "Client Name": nameVal,
                    "Client Email": emailVal,
                    "Client Phone": phoneVal,
                    "Preferred Stylist": selectedStylistName,
                    "Date and Time": `${formattedDate} at ${timeVal}`,
                    "Booked Treatments": servicesTextArray.join(", "),
                    "Total Amount": `$${totalPriceSum}`,
                    "Special Requests": notesVal || "None"
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log("Email Notification Status:", data.success ? "Success" : "Failed");
            })
            .catch(err => console.error("Error sending email notification:", err));
        }

        // Open Ticket Modal overlay
        bookingModal.classList.add('active');

        // Reset state after booking
        resetBookingState();
    });

    function setError(inputId) {
        const inputEl = document.getElementById(inputId);
        const group = inputEl.closest('.form-group');
        group.classList.add('invalid');
    }

    function resetBookingState() {
        // Clear booked services state
        bookedServices = [];
        updateBookingSummary();

        // Reset all buttons in the services list
        document.querySelectorAll('.btn-add-service').forEach(btn => {
            btn.classList.remove('added');
            btn.querySelector('.btn-text').textContent = 'Add to Booking';
            btn.querySelector('.btn-icon i').className = 'fa-solid fa-plus';
        });

        // Reset booking form fields
        appointmentForm.reset();
        bookingTimeSelect.innerHTML = '<option value="">Select a date first...</option>';
        bookingTimeSelect.setAttribute('disabled', 'true');
    }

    // Modal Closing Listeners
    closeModalBtn.addEventListener('click', () => {
        bookingModal.classList.remove('active');
    });

    // Close modal when clicking outside contents
    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            bookingModal.classList.remove('active');
        }
    });

    // Print Receipt Action
    btnPrintTicket.addEventListener('click', () => {
        window.print();
    });


    // --- Testimonials Slider Carousel ---
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.slider-dots .dot');
    const btnPrev = document.getElementById('slider-prev');
    const btnNext = document.getElementById('slider-next');
    let currentSlide = 0;
    let autoSlideInterval;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        // Handle bounds loop
        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(nextSlide, 5000); // 5 seconds interval
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
        }
    }

    btnNext.addEventListener('click', () => {
        stopAutoSlide();
        showSlide(currentSlide + 1);
        startAutoSlide();
    });

    btnPrev.addEventListener('click', () => {
        stopAutoSlide();
        showSlide(currentSlide - 1);
        startAutoSlide();
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            stopAutoSlide();
            showSlide(index);
            startAutoSlide();
        });
    });

    // Initialize auto slider
    startAutoSlide();


    // --- Contact Form Submission ---
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Simulating email trigger submission
        contactSuccessMsg.style.display = 'block';
        contactForm.reset();
        
        // Hide success alert after 5 seconds
        setTimeout(() => {
            contactSuccessMsg.style.display = 'none';
        }, 5000);
    });


    // --- Intersection Observer for Scroll Reveal Animations ---
    const revealElements = document.querySelectorAll('.reveal-scroll, .fade-in-up');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Once it is revealed, there's no need to observe it again
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element fits in viewport
    });

    revealElements.forEach(el => {
        observer.observe(el);
    });

});