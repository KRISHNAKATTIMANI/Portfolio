// DOM Elements
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');
const skillBars = document.querySelectorAll('.skill-progress');
const contactForm = document.querySelector('.contact-form');

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const headerOffset = 80;
            const elementPosition = targetSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Active navigation link highlighting
function updateActiveNavLink() {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (sectionTop <= 100 && sectionTop + sectionHeight > 100) {
            current = sectionId;
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// Navbar background on scroll
function updateNavbarBackground() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(26, 32, 44, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(26, 32, 44, 0.95)';
        navbar.style.boxShadow = 'none';
    }
}

// Skill bar animation
function animateSkillBars() {
    const aboutSection = document.getElementById('about');
    const aboutTop = aboutSection.getBoundingClientRect().top;
    const aboutBottom = aboutSection.getBoundingClientRect().bottom;
    
    if (aboutTop < window.innerHeight && aboutBottom > 0) {
        skillBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width;
        });
    }
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animate elements on scroll
function initScrollAnimations() {
    const animateElements = document.querySelectorAll('.service-card, .portfolio-item, .contact-item, .stat');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Typing effect for subtitle
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing effect
function initTypingEffect() {
    const subtitle = document.querySelector('.home-subtitle');
    if (subtitle) {
        const originalText = subtitle.textContent;
        setTimeout(() => {
            typeWriter(subtitle, originalText, 100);
        }, 1000);
    }
}

// Contact form handling
function initContactForm() {
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const name = contactForm.querySelector('input[name="name"]').value;
            const email = contactForm.querySelector('input[name="email"]').value;
            const subject = contactForm.querySelector('input[name="subject"]').value;
            const message = contactForm.querySelector('textarea[name="message"]').value;
            
            // Simple validation
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Update button state
            const submitBtn = contactForm.querySelector('.btn-primary');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            try {
                console.log('Starting form submission...');
                console.log('Form data:', { name, email, subject, message });
                
                // Prepare email template parameters to match the template exactly
                const templateParams = {
                    from_name: name,
                    name: name,           // For {{name}} in template
                    email: email,         // For {{email}} in template
                    subject: `Contact Us: ${subject}`,  // Matches template subject format
                    message: message,
                    dateTime: new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                        timeZone: 'GMT'
                    }) + ' GMT+8',
                    reply_to: email
                };
                
                console.log('Sending email via EmailJS...', {
                    serviceId: 'service_xthjgjt',
                    templateId: 'template_pkmpbjv',
                    templateParams
                });
                
                // Send email notification using EmailJS first
                const emailResult = await emailjs.send(
                    'service_xthjgjt',  // Your Gmail service ID
                    'template_pkmpbjv',  // Your template ID as shown in the screenshot
                    templateParams,
                    'm6V-Q7RXmyfHBwoD7' // Your public key
                );

                console.log('EmailJS Response:', emailResult);

                // Save to Firestore after email is sent
                const db = firebase.firestore();
                const messageData = {
                    name,
                    email,
                    subject,
                    message,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'unread',
                    dateCreated: new Date().toISOString()
                };

                // Save to Firestore
                await db.collection('messages').add(messageData);
                console.log('EmailJS Response:', emailResult);
                
                // Only proceed with Firestore if email was sent successfully
                if (emailResult.status === 200) {
                    try {
                        // Save to Firestore
                        const db = firebase.firestore();
                        const messageData = {
                            name,
                            email,
                            subject,
                            message,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                            status: 'unread',
                            dateCreated: new Date().toISOString(),
                            emailSent: true
                        };
                        
                        await db.collection('messages').add(messageData);
                        console.log('Message saved to Firestore');
                        
                        showNotification('Message sent successfully! We will get back to you soon.', 'success');
                        contactForm.reset();
                    } catch (dbError) {
                        console.error('Firestore error:', dbError);
                        showNotification('Message sent but could not save to database.', 'warning');
                        contactForm.reset();
                    }
                }
            } catch (error) {
                console.error('Submission error:', {
                    message: error.message,
                    code: error.code,
                    status: error.status,
                    text: error.text,
                    stack: error.stack
                });
                
                let errorMessage = 'Failed to send message. ';
                if (error.status === 0) {
                    errorMessage += 'Please check your internet connection.';
                } else if (error.status === 400) {
                    errorMessage += 'Invalid template configuration. Please contact the administrator.';
                } else if (error.status === 403) {
                    errorMessage += 'Email service authentication failed. Please contact the administrator.';
                } else {
                    errorMessage += 'Please try again or contact directly via email at krishnamb90@gmail.com';
                }
                
                showNotification(errorMessage, 'error');
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transition: top 0.5s ease;
        max-width: 300px;
        word-wrap: break-word;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    // Set color based on type
    switch (type) {
        case 'success':
            notification.style.background = '#38a169';
            break;
        case 'error':
            notification.style.background = '#e53e3e';
            break;
        default:
            notification.style.background = '#3182ce';
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.top = '20px';
    });
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.top = '-100px';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 500);
    }, 4000);
}

// Parallax effect for home section
function initParallaxEffect() {
    const homeSection = document.getElementById('home');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        if (homeSection) {
            homeSection.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Portfolio item click handlers
function initPortfolioInteractions() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        item.addEventListener('click', () => {
            // Add click animation
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
                item.style.transform = '';
            }, 150);
        });
    });
}

// Service card hover effects
function initServiceCardEffects() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.service-icon');
            icon.style.transform = 'rotateY(180deg)';
        });
        
        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.service-icon');
            icon.style.transform = 'rotateY(0deg)';
        });
    });
}

// Smooth reveal animation for sections
function initSectionReveal() {
    const sections = document.querySelectorAll('section');
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    sections.forEach(section => {
        section.classList.add('section-hidden');
        sectionObserver.observe(section);
    });
}

// Add CSS for section animations
function addSectionAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .section-hidden {
            opacity: 0;
            transform: translateY(50px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .section-visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .service-icon {
            transition: transform 0.4s ease;
        }
        
        .portfolio-item {
            transition: transform 0.2s ease;
        }
    `;
    document.head.appendChild(style);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateActiveNavLink();
    updateNavbarBackground();
    animateSkillBars();
    initScrollAnimations();
    initTypingEffect();
    initContactForm();
    initPortfolioInteractions();
    initServiceCardEffects();
    initSectionReveal();
    addSectionAnimationStyles();
    
    // Add scroll event listeners
    window.addEventListener('scroll', () => {
        updateActiveNavLink();
        updateNavbarBackground();
        animateSkillBars();
    });
    
    // Add resize event listener for responsive handling
    window.addEventListener('resize', () => {
        // Close mobile menu on resize
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

// Preloader (optional)
window.addEventListener('load', () => {
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = `
        <div class="preloader-content">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `;
    
    preloader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--dark-bg);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 1;
        transition: opacity 0.5s ease;
    `;
    
    const spinnerStyle = document.createElement('style');
    spinnerStyle.textContent = `
        .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid var(--border-color);
            border-top: 3px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .preloader-content {
            text-align: center;
            color: var(--text-secondary);
        }
    `;
    
    document.head.appendChild(spinnerStyle);
    document.body.appendChild(preloader);
    
    // Remove preloader after a short delay
    setTimeout(() => {
        preloader.style.opacity = '0';
        setTimeout(() => {
            if (preloader.parentNode) {
                preloader.remove();
            }
        }, 500);
    }, 1500);
});