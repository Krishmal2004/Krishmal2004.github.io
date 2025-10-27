document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // Set current time and date in footer and mobile nav
    const currentTimeElement = document.getElementById('current-time');
    const timeStr = '2025-06-25 08:49:13'; // From user input

    if (currentTimeElement) {
        const timeParts = timeStr.split(' ')[1].split(':');
        const hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const seconds = timeParts[2];
        currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // Set username
    const userElements = document.querySelectorAll('.system-info-item:nth-child(2) span:last-child');
    userElements.forEach(element => {
        element.textContent = 'IT24103866'; // From user input
    });

    // Matrix Code Rain Effect
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Matrix characters (using more tech/AI-themed characters)
    const matrixChars = '01アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン∞Σπ?×÷><=≠≥≤∆∇∫∮∴∵∈∋⊆⊇⊂⊃∪∩¬∧∨⊕⊗∥⊥→←↑↓↔※';

    // Create drops
    const drops = [];
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);

    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * -canvas.height / fontSize);
    }

    function drawMatrix() {
        // Semi-transparent black to create the fade effect
        ctx.fillStyle = 'rgba(10, 10, 16, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Green text color with varying opacity
        ctx.fillStyle = '#00ffd5';
        ctx.font = `${fontSize}px monospace`;

        // Loop over drops
        for (let i = 0; i < drops.length; i++) {
            // Random character
            const char = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));

            // x coordinate of the drop, y coordinate is drops[i] * fontSize
            ctx.fillText(char, i * fontSize, drops[i] * fontSize);

            // Send the drop back to the top randomly after it has crossed the screen
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.99) {
                drops[i] = 0;
            }

            // Move drops down
            drops[i]++;
        }
    }

    // Run matrix code rain animation
    setInterval(drawMatrix, 33);

    // Initialize Particles.js
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#00ffd5"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                }
            },
            "opacity": {
                "value": 0.3,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": true,
                    "speed": 2,
                    "size_min": 0.3,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#00ffd5",
                "opacity": 0.2,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 1,
                "direction": "none",
                "random": true,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 0.4
                    }
                },
                "push": {
                    "particles_nb": 4
                }
            }
        },
        "retina_detect": true
    });

    // Terminal Loader Animation
    const terminalLoader = document.querySelector('.terminal-loader');
    const progressBar = document.querySelector('.progress');
    const statusLine = document.querySelector('.status-line');

    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress > 100) progress = 100;

        progressBar.textContent = `${progress}%`;

        if (progress === 100) {
            clearInterval(progressInterval);
            statusLine.innerHTML = 'Status: <span class="success">Ready</span>';

            setTimeout(() => {
                terminalLoader.classList.add('hidden');
                setTimeout(() => {
                    terminalLoader.style.display = 'none';
                    initPageAnimations();
                }, 500);
            }, 1000);
        }
    }, 150);

    // Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });

    // Close mobile nav when clicking a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileNav.classList.remove('active');
        });
    });

    // Navbar scroll effect
    const nav = document.querySelector('.main-nav');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });



    // Smooth scrolling for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        });
    });

    // Update active nav link on scroll
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        const scrollPosition = window.scrollY + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink);

    // Projects filtering
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Skills progress animation
    function animateSkills() {
        const progressBars = document.querySelectorAll('.progress-indicator');
        progressBars.forEach(bar => {
            const percentage = bar.parentElement.getAttribute('data-percentage');
            bar.style.width = percentage + '%';
        });
    }

    // Contact form submission
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Basic form validation
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !subject || !message) {
                alert('ERROR: All fields are required');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('ERROR: Please enter a valid email address');
                return;
            }

            // Simulating form submission
            alert('MESSAGE TRANSMITTED SUCCESSFULLY');
            contactForm.reset();
        });
    }


    // Initialize page animations after loader is hidden
    function initPageAnimations() {
        // Animate skill bars on scroll
        const skillsSection = document.querySelector('#skills');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateSkills();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        if (skillsSection) {
            observer.observe(skillsSection);
        }

        // Add glitch effect to elements on hover
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('glitch-hover');
            });

            card.addEventListener('mouseleave', () => {
                card.classList.remove('glitch-hover');
            });
        });

        

        // Random glitch effect on the page
        function randomGlitch() {
            const glitchOverlay = document.querySelector('.glitch-overlay');

            // Random opacity change
            glitchOverlay.style.opacity = '0.2';
            setTimeout(() => {
                glitchOverlay.style.opacity = '0.1';
            }, 100);

            // Schedule next glitch
            setTimeout(randomGlitch, Math.random() * 10000 + 5000);
        }

        // Start random glitches
        setTimeout(randomGlitch, 5000);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

});