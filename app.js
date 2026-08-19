/**
 * Toufiq H. | Amazon Listing & A+ Portfolio Website Logic Controller
 * Custom Slider, Dynamic CSV Parser, Amazon Simulator, A+ content switcher, and Theme Manager.
 */

const initApp = () => {
    // 1. Core State
    let projectsData = [];
    let activeAplusBrand = 'colsigen';

    // 2. DOM Elements
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const navbar = document.getElementById('main-nav');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    // Before/After Slider Elements
    const heroSlider = document.getElementById('hero-slider');
    const sliderAfter = document.getElementById('hero-slider-after');
    const sliderHandle = document.getElementById('hero-slider-handle');

    // Portfolio Gallery Elements
    const galleryGrid = document.getElementById('gallery-grid');
    const filterButtons = document.querySelectorAll('#gallery-filters .filter-btn');



    // A+ Content Elements
    const aplusSelectors = document.querySelectorAll('#aplus-selectors .filter-btn');
    const aplusLivePreview = document.getElementById('aplus-live-preview');

    // Project Details Modal Elements
    const projectModal = document.getElementById('project-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalSlidesWrapper = document.getElementById('modal-slides-wrapper');
    const modalArrowLeft = document.getElementById('modal-arrow-left');
    const modalArrowRight = document.getElementById('modal-arrow-right');
    const modalPagination = document.getElementById('modal-pagination');
    const modalCategory = document.getElementById('modal-category');
    const modalUplift = document.getElementById('modal-uplift');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalFeaturesList = document.getElementById('modal-features-list');

    // Contact Form Elements
    const inquiryForm = document.getElementById('inquiry-form');
    const formSuccessMessage = document.getElementById('form-success-message');

    // ==========================================
    // 3. Dark/Light Theme Manager
    // ==========================================
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    };

    const updateThemeIcon = (theme) => {
        if (theme === 'light') {
            themeIcon.className = 'fa-solid fa-sun';
        } else {
            themeIcon.className = 'fa-solid fa-moon';
        }
    };

    themeToggleBtn && themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    initTheme();

    // ==========================================
    // 4. Navigation & Navbar Scroll Event
    // ==========================================
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isActive = navMenu.classList.toggle('active');
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                if (isActive) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });

        // Close menu when clicking nav item
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });

        // Close menu when clicking anywhere outside
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active')) {
                if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    const icon = mobileMenuToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-xmark');
                        icon.classList.add('fa-bars');
                    }
                }
            }
        });
    }

    // ==========================================
    // 5. Before/After Interactive Slider Logic
    // ==========================================
    let isDragging = false;

    const moveSlider = (clientX) => {
        const rect = heroSlider.getBoundingClientRect();
        const position = clientX - rect.left;
        let percentage = (position / rect.width) * 100;
        
        // Boundaries restriction
        percentage = Math.max(0, Math.min(100, percentage));
        
        sliderAfter.style.clipPath = `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`;
        sliderHandle.style.left = `${percentage}%`;
    };

    // Desktop Mouse Events
    sliderHandle && sliderHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        moveSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Mobile Touch Events
    sliderHandle && sliderHandle.addEventListener('touchstart', (e) => {
        isDragging = true;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        if (e.touches.length > 0) {
            moveSlider(e.touches[0].clientX);
        }
    }, { passive: true });

    window.addEventListener('touchend', () => {
        isDragging = false;
    });

    // Optional click on slider anywhere to move handle
    heroSlider && heroSlider.addEventListener('click', (e) => {
        if (e.target !== sliderHandle && !sliderHandle.contains(e.target)) {
            moveSlider(e.clientX);
        }
    });

    // ==========================================
    // 6. CSV Data Fetch & Parser
    // ==========================================
    const parseCSV = (text) => {
        const lines = [];
        let row = [""];
        let inQuotes = false;
        
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            const next = text[i+1];
            
            if (c === '"') {
                if (inQuotes && next === '"') {
                    row[row.length - 1] += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c === ',' && !inQuotes) {
                row.push("");
            } else if ((c === '\r' || c === '\n') && !inQuotes) {
                if (c === '\r' && next === '\n') { i++; }
                lines.push(row);
                row = [""];
            } else {
                row[row.length - 1] += c;
            }
        }
        if (row.length > 1 || row[0] !== "") {
            lines.push(row);
        }

        const headers = lines[0].map(h => h.trim());
        return lines.slice(1).map(line => {
            const obj = {};
            headers.forEach((h, index) => {
                obj[h] = line[index] !== undefined ? line[index].trim() : "";
            });
            return obj;
        }).filter(p => p.ID); // Filter out empty or corrupt records
    };

    const renderServiceGrid = (gridElement, projects) => {
        gridElement.innerHTML = '';
        if (projects.length === 0) {
            gridElement.innerHTML = '<p style="grid-column:1/-1; text-align:center;">No projects found.</p>';
            return;
        }

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'glass-card gallery-card';
            
            // Format metric tags
            const categories = project.Category.split(',');
            const primaryTag = categories[0].replace(/"/g, '').trim();
            
            card.style.cursor = 'pointer';
            card.innerHTML = `
                <img src="${project.After_Image}" alt="${project.Title}" onerror="this.src='images/placeholder_rect.svg'">
                <div class="gallery-info">
                    <span style="color: var(--accent); font-weight: 700; font-size: 0.8rem; text-transform: uppercase;">${primaryTag} &bull; ${project.Metrics_Uplift}</span>
                    <h4>${project.Title}</h4>
                    <p>${project.Description.substring(0, 100)}...</p>
                </div>
            `;

            card.addEventListener('click', () => {
                openProjectModal(project);
            });

            gridElement.appendChild(card);
        });
    };

    const fetchProjects = async () => {
        try {
            const response = await fetch('projects.csv');
            const dataText = await response.text();
            projectsData = parseCSV(dataText);
            
            if (galleryGrid) {
                const featuredIds = ["22", "25", "18", "23", "24", "15", "7", "14", "19"];
                const featured = featuredIds.map(id => projectsData.find(p => String(p.ID) === id)).filter(Boolean);
                renderPortfolioGrid(featured.length > 0 ? featured : projectsData);
            }

            // Dynamically load listing page gallery if element exists
            const listingGrid = document.getElementById('listing-gallery-grid');
            if (listingGrid) {
                const listings = projectsData.filter(p => p.Category.toLowerCase().includes('listing images'));
                renderServiceGrid(listingGrid, listings);
            }

            // Dynamically load A+ page gallery if element exists
            const aplusGrid = document.getElementById('aplus-gallery-grid');
            if (aplusGrid) {
                const aplus = projectsData.filter(p => p.Category.toLowerCase().includes('a+ content'));
                renderServiceGrid(aplusGrid, aplus);
            }

            // Dynamically load storefront page gallery if element exists
            const storefrontGrid = document.getElementById('storefront-gallery-grid');
            if (storefrontGrid) {
                const storefronts = projectsData.filter(p => p.Category.toLowerCase().includes('storefronts'));
                renderServiceGrid(storefrontGrid, storefronts);
            }

            renderAplusContent(activeAplusBrand); // Setup first A+ brand
        } catch (error) {
            console.error('Error fetching CSV projects:', error);
            if (galleryGrid) {
                galleryGrid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align:center; padding:50px;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size:3rem; color:#ef4444; margin-bottom:15px;"></i>
                        <h4>Error Loading Portfolio Data</h4>
                        <p style="color:var(--text-secondary);">Please ensure projects.csv file is correctly configured in your root directory.</p>
                    </div>
                `;
            }
        }
    };

    // ==========================================
    // 7. Portfolio Rendering & Filtering
    // ==========================================
    const renderPortfolioGrid = (projects) => {
        galleryGrid.innerHTML = '';
        if (projects.length === 0) {
            galleryGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">No projects found matching selection.</p>';
            return;
        }

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = 'glass-card portfolio-item';
            card.dataset.category = project.Category;
            
            card.innerHTML = `
                <div class="portfolio-image-wrapper">
                    <img src="${project.After_Image}" alt="${project.Title}" onerror="this.src='images/placeholder_rect.svg'">
                    <div class="portfolio-hover-overlay">
                        <span>View Project Case Study</span>
                    </div>
                </div>
                <div class="portfolio-details">
                    <div class="meta">
                        <span class="category">${project.Category}</span>
                        <span class="uplift">${project.Metrics_Uplift}</span>
                    </div>
                    <h3>${project.Title}</h3>
                    <p>${project.Description.substring(0, 100)}...</p>
                </div>
            `;

            // Open Modal event click
            card.addEventListener('click', () => {
                openProjectModal(project);
            });

            galleryGrid.appendChild(card);
        });
    };

    // Filter Trigger
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.dataset.filter;
            if (filterValue === 'all') {
                // Curated 9 Featured Works: 3 Best Listing (22, 25, 18), 4 Best A+ (23, 24, 15, 7), 2 Best Storefronts (14, 19)
                const featuredIds = ["22", "25", "18", "23", "24", "15", "7", "14", "19"];
                const featured = featuredIds.map(id => projectsData.find(p => String(p.ID) === id)).filter(Boolean);
                renderPortfolioGrid(featured.length > 0 ? featured : projectsData);
            } else {
                const filtered = projectsData.filter(p => p.Category.toLowerCase().includes(filterValue.toLowerCase()));
                renderPortfolioGrid(filtered);
            }
        });
    });

    // ==========================================
    // 8. Project Details Modal Window (Dynamic Carousel)
    // ==========================================
    const FOLDER_MAPPING = {
        1: 'Colsigen Mist',
        2: 'candles',
        3: 'Sleep Aid',
        4: 'string lights',
        5: 'Zooba Lab Fluoride-Free Toothpaste',
        6: 'wireless Headset',
        7: 'Sombra Body Cream',
        8: 'salf control book',
        9: 'Demure Shop Bar',
        10: 'Red Onion',
        11: 'Ameer Ice',
        12: 'aysoni glutathione',
        13: 'ronson-storefront',
        14: 'starfire-storefront',
        15: 'blitz',
        16: 'Pink Cones',
        17: 'Moringa Bitters Listing',
        18: 'Slecon gun and reel cloth',
        19: 'blitz-storefront',
        20: 'gem-jewelry-cleaner',
        21: 'gem-jewelry-cleaner',
        22: 'ravitine-citrus',
        23: 'ravitine-citrus',
        24: 'soursop-bitters',
        25: 'blitz',
        27: 'Strataderm/listing/strataderm',
        28: 'Strataderm/listing/stratamed',
        29: 'Strataderm/listing/strataMGT',
        30: 'Strataderm/A+ Content/Stataderm',
        31: 'Strataderm/A+ Content/Stratamed',
        32: 'Strataderm/A+ Content/Strata MGT'
    };

    let currentSlideIndex = 0;
    let totalSlides = 0;

    const showSlide = (index) => {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        currentSlideIndex = index;
        modalSlidesWrapper.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
        modalPagination.innerText = `${currentSlideIndex + 1} / ${totalSlides}`;
    };

    modalArrowLeft && modalArrowLeft.addEventListener('click', (e) => {
        e.stopPropagation();
        showSlide(currentSlideIndex - 1);
    });
    
    modalArrowRight && modalArrowRight.addEventListener('click', (e) => {
        e.stopPropagation();
        showSlide(currentSlideIndex + 1);
    });

    const openProjectModal = (project) => {
        // Reset slider states
        currentSlideIndex = 0;
        modalSlidesWrapper.innerHTML = '';
        modalSlidesWrapper.style.transform = 'translateX(0)';
        modalArrowLeft.style.opacity = '0';
        modalArrowLeft.style.pointerEvents = 'none';
        modalArrowRight.style.opacity = '0';
        modalArrowRight.style.pointerEvents = 'none';
        modalPagination.style.display = 'none';

        modalCategory.innerText = project.Category;
        modalUplift.innerText = project.Metrics_Uplift;
        modalTitle.innerText = project.Title;
        modalDesc.innerText = project.Description;

        // Populate dynamic feature list
        modalFeaturesList.innerHTML = '';
        if (project.Bullet_Points) {
            const bullets = project.Bullet_Points.split(';');
            bullets.forEach(bullet => {
                if (bullet.trim() === "") return;
                const parts = bullet.split(':');
                const boldTitle = parts[0] ? `<strong>${parts[0]}:</strong>` : '';
                const bodyText = parts[1] || '';
                
                const li = document.createElement('li');
                li.style.listStyle = 'none';
                li.style.display = 'flex';
                li.style.gap = '10px';
                li.style.fontSize = '0.9rem';
                li.innerHTML = `
                    <i class="fa-solid fa-circle-check" style="color:var(--accent); font-size:1.1rem; flex-shrink:0;"></i>
                    <span>${boldTitle} ${bodyText}</span>
                `;
                modalFeaturesList.appendChild(li);
            });
        }

        // Determine folders & images to try loading
        const folderName = FOLDER_MAPPING[project.ID] || project.Client_Name;
        const slides = [];

        // Check if category is listing images or A+ content
        const categories = project.Category.toLowerCase();
        let subfolder = 'listing';
        if (categories.includes('a+ content') || categories.includes('ebc')) {
            subfolder = 'ebc';
        }

        const imageExtensions = ['jpg', 'png', 'jpeg'];
        
        // Helper to add a slide to the DOM
        const addSlideImage = (src) => {
            const slide = document.createElement('div');
            slide.className = 'modal-slide';
            slide.innerHTML = `<img src="${src}" alt="Project Image" onerror="this.src='images/placeholder_rect.svg'">`;
            modalSlidesWrapper.appendChild(slide);
        };

        // Try loading images 01 to 08
        const tryLoadImages = async () => {
            let foundAny = false;
            
            for (let i = 1; i <= 8; i++) {
                const prefix = i < 10 ? '0' : '';
                const baseNamePadded = `${prefix}${i}`;
                const baseNameRaw = `${i}`;
                let loaded = false;
                
                for (const baseName of [baseNamePadded, baseNameRaw]) {
                    for (const ext of imageExtensions) {
                        const testUrls = [
                            `images/${folderName}/${subfolder}/${baseName}.${ext}`,
                            `images/${folderName}/${baseName}.${ext}`
                        ];
                        
                        for (const testUrl of testUrls) {
                            const exists = await new Promise((resolve) => {
                                const img = new Image();
                                img.onload = () => resolve(true);
                                img.onerror = () => resolve(false);
                                img.src = testUrl;
                            });

                            if (exists) {
                                addSlideImage(testUrl);
                                slides.push(testUrl);
                                foundAny = true;
                                loaded = true;
                                break;
                            }
                        }
                        if (loaded) break;
                    }
                    if (loaded) break;
                }
                
                // If this index failed to load in all formats, we stop loading further sequential slides
                if (!loaded) {
                    break;
                }
            }

            // Fallback to After_Image thumbnail if no slideshow files were found in subfolders
            if (!foundAny) {
                addSlideImage(project.After_Image);
                slides.push(project.After_Image);
            }

            // Update UI based on loaded slides count
            totalSlides = slides.length;
            if (totalSlides > 1) {
                modalArrowLeft.style.opacity = '1';
                modalArrowLeft.style.pointerEvents = 'all';
                modalArrowRight.style.opacity = '1';
                modalArrowRight.style.pointerEvents = 'all';
                modalPagination.innerText = `1 / ${totalSlides}`;
                modalPagination.style.display = 'block';
            }
        };

        tryLoadImages();

        projectModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    };

    const closeProjectModal = () => {
        projectModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    modalCloseBtn && modalCloseBtn.addEventListener('click', closeProjectModal);
    projectModal && projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) {
            closeProjectModal();
        }
    });

    // ==========================================
    // 10. Amazon A+ EBC Content Builder Previews
    // ==========================================
    const renderAplusContent = (brand) => {
        aplusLivePreview.innerHTML = '';

        if (brand === 'banord') {
            // Outdoor Lights Modular Content
            aplusLivePreview.innerHTML = `
                <!-- Banner Image Module -->
                <div class="aplus-banner-module">
                    <img src="images/string lights/ebc/1.png" alt="Banord Premium S14 String Lights Banner" onerror="this.src='images/aplus_banner_placeholder.svg'">
                </div>

                <div style="margin:20px 0; text-align:center; padding:0 20px;">
                    <h3 style="font-size:1.6rem; color:#1e293b; margin-bottom:10px;">Transform Your Yard Into A Cozy Bistro Oasis</h3>
                    <p style="color:#64748b; font-size:0.95rem; max-width:800px; margin:0 auto;">Banord commercial grade S14 LED heavy-duty string lights are designed to withstand all outdoor elements while generating a warm, golden ambiance. Perfect for patios, cafes, pergolas, and weddings.</p>
                </div>

                <!-- Grid Images Module -->
                <div class="aplus-grid-module">
                    <div class="aplus-grid-card">
                        <img src="images/string lights/ebc/2.png" alt="IP65 Weatherproof Details" onerror="this.src='images/placeholder_square.svg'">
                        <h4>IP65 Commercial Waterproof</h4>
                        <p>Fitted with heavy-duty rubber cable sleeve sockets that create a watertight seal around bulb filament bases to handle heavy rain, snowstorms, and dust.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/string lights/ebc/3.png" alt="Shatterproof LED Filament" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Shatterproof Plastic LED</h4>
                        <p>Constructed with durable polymer shell instead of brittle glass. Dropping or bumping these bulbs won't result in glass hazards or cracked filaments.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/string lights/ebc/4.png" alt="Energy Saving LED S14" onerror="this.src='images/placeholder_square.svg'">
                        <h4>90% Energy Efficient LED</h4>
                        <p>Only draws 1W of power per bulb. Replaces hot 11W incandescent bulbs, reducing household electricity bills while providing a warm 2700K sunset light.</p>
                    </div>
                </div>

                <!-- Comparison Table Module -->
                <div style="margin-top:30px;">
                    <h4 style="font-size:1.2rem; color:#1e293b; margin-bottom:15px; font-weight:600;">How Banord Outperforms Standard Market Lights</h4>
                    <div class="aplus-table-module">
                        <table class="aplus-table">
                            <thead>
                                <tr>
                                    <th>Feature Spec</th>
                                    <th>Our Design (Banord)</th>
                                    <th>Other Brands (Cheap Brand)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Bulb Material</strong></td>
                                    <td>Shatterproof Polymer <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Fragile Glass Bulbs <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Weatherproofing</strong></td>
                                    <td>IP65 Dual Seal Sockets <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Non-sealed PVC Sockets <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Lifespan Hours</strong></td>
                                    <td>30,000 Hours (LED) <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>1,000 Hours (Tungsten) <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (brand === 'zooba') {
            // Zooba Lab Toothpaste Modular Content
            aplusLivePreview.innerHTML = `
                <!-- Banner Image Module -->
                <div class="aplus-banner-module">
                    <img src="images/Zooba Lab Fluoride-Free Toothpaste/ebc/01.jpg" alt="Zooba Toothpaste Clean Organic Whitening Banner" onerror="this.src='images/aplus_banner_placeholder.svg'">
                </div>

                <div style="margin:20px 0; text-align:center; padding:0 20px;">
                    <h3 style="font-size:1.6rem; color:#1e293b; margin-bottom:10px;">Naturally Brighten Your Smile Without Harsh Chemicals</h3>
                    <p style="color:#64748b; font-size:0.95rem; max-width:800px; margin:0 auto;">Zooba Lab toothpaste leverages biological nano-hydroxyapatite and organic charcoal to naturally polish enamel and balance microflora, completely free from artificial sweeteners or fluoride.</p>
                </div>

                <!-- Grid Images Module -->
                <div class="aplus-grid-module">
                    <div class="aplus-grid-card">
                        <img src="images/Zooba Lab Fluoride-Free Toothpaste/ebc/02.jpg" alt="Nano-Hydroxyapatite Science" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Enamel Remineralization</h4>
                        <p>Formulated with biologically active Nano-HAp to fill microscopic gaps in enamel, reversing early cavity erosion and minimizing tooth sensitivity.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/Zooba Lab Fluoride-Free Toothpaste/ebc/03.jpg" alt="Organic Coconut Oil Blend" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Organic Coconut Oil</h4>
                        <p>Utilizes organic virgin coconut oil for safe bacterial extraction, targeting yellow tooth stains and keeping gums hydrated and healthy.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/Zooba Lab Fluoride-Free Toothpaste/ebc/04.jpg" alt="Zero Toxins Chemical Free" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Fluoride & Sulfate Free</h4>
                        <p>Contains absolutely zero artificial foaming agents, GMOs, parabens, SLS, or synthetic colorings. Clean foam from soapbark trees.</p>
                    </div>
                </div>

                <!-- Comparison Table Module -->
                <div style="margin-top:30px;">
                    <h4 style="font-size:1.2rem; color:#1e293b; margin-bottom:15px; font-weight:600;">Zooba Lab vs. Commercial Chemically Foam Pastes</h4>
                    <div class="aplus-table-module">
                        <table class="aplus-table">
                            <thead>
                                <tr>
                                    <th>Ingredients & Safety</th>
                                    <th>Zooba Bio Paste</th>
                                    <th>Generic Store Toothpaste</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Whitening Agent</strong></td>
                                    <td>Biological Active Charcoal & HAp <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Abrasive Silica & Peroxides <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Foaming Agent</strong></td>
                                    <td>Natural Quillaja Wood Saponins <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Sodium Lauryl Sulfate (SLS) <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Children Safe</strong></td>
                                    <td>100% Swallow-Safe <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Toxic Warning on Back <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (brand === 'colsigen') {
            // Colsigen Mist Modular Content
            aplusLivePreview.innerHTML = `
                <!-- Banner Image Module -->
                <div class="aplus-banner-module">
                    <img src="images/Colsigen Mist/ebc/01.jpg" alt="Colsigen Mist Collagen Banner" onerror="this.src='images/aplus_banner_placeholder.svg'">
                </div>

                <div style="margin:20px 0; text-align:center; padding:0 20px;">
                    <h3 style="font-size:1.6rem; color:#1e293b; margin-bottom:10px;">High-Converting A+ Content & Listing Images</h3>
                    <p style="color:#64748b; font-size:0.95rem; max-width:800px; margin:0 auto;">Clean, modern layouts featuring benefit-focused visuals and custom-rendered lifestyle scenes that build emotional brand trust and drive higher conversion rates.</p>
                </div>

                <!-- Grid Images Module -->
                <div class="aplus-grid-module">
                    <div class="aplus-grid-card">
                        <img src="images/Colsigen Mist/ebc/02.jpg" alt="Benefit-Focused Visuals" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Benefit-Focused Visuals</h4>
                        <p>High-impact graphics designed to grab customer attention immediately and make your product stand out in a crowded market.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/Colsigen Mist/ebc/03.jpg" alt="Clean Modern Layouts" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Clean Modern Layouts</h4>
                        <p>Optimized module structures that hold customer attention as they scroll, explaining key details step-by-step.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/Colsigen Mist/ebc/04.jpg" alt="Lifestyle Images" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Lifestyle Renderings</h4>
                        <p>Custom-rendered product scenes placing the product in high-end environments, establishing visual authority and brand trust.</p>
                    </div>
                </div>

                <!-- Comparison Table Module -->
                <div style="margin-top:30px;">
                    <h4 style="font-size:1.2rem; color:#1e293b; margin-bottom:15px; font-weight:600;">Sombra vs Drugstore Pain Ointments</h4>
                    <div class="aplus-table-module">
                        <table class="aplus-table">
                            <thead>
                                <tr>
                                    <th>Therapy Features</th>
                                    <th>Sombra Cold Therapy</th>
                                    <th>Generic Pain Patches / Gels</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Scent Profile</strong></td>
                                    <td>Refreshing Orange & Menthol <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Heavy Pungent Chemical Odor <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Absorption</strong></td>
                                    <td>Non-Greasy Gel (No Residue) <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Oily Ointment (Stains Clothes) <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Ingredients</strong></td>
                                    <td>98% Natural Botanicals <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Synthetic Painkillers & Fillers <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (brand === 'oasis') {
            // Oasis Sand Candles Modular Content
            aplusLivePreview.innerHTML = `
                <!-- Banner Image Module -->
                <div class="aplus-banner-module">
                    <img src="images/candles/ebc/01.jpg" alt="Oasis Pearled Sand Candles Banner" onerror="this.src='images/aplus_banner_placeholder.svg'">
                </div>

                <div style="margin:20px 0; text-align:center; padding:0 20px;">
                    <h3 style="font-size:1.6rem; color:#1e293b; margin-bottom:10px;">Create Your Own Custom Candlelight Experience</h3>
                    <p style="color:#64748b; font-size:0.95rem; max-width:800px; margin:0 auto;">Oasis Pearled Sand Candles feature premium granulated plant-based wax pearls, allowing you to turn any container into a clean-burning, mess-free candle. Scented with premium Sandalwood Vanilla and Holiday Balsam.</p>
                </div>

                <!-- Grid Images Module -->
                <div class="aplus-grid-module">
                    <div class="aplus-grid-card">
                        <img src="images/candles/ebc/02.jpg" alt="Mess-Free Granulated Wax" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Mess-Free Granulated Wax</h4>
                        <p>Simply pour the sand pearls into any heat-safe container, insert one of the 30 included wicks, and light it up. No melted wax mess.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/candles/ebc/03.jpg" alt="Refillable & Reusable" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Refillable & Reusable</h4>
                        <p>Wicks are easy to replace. Once burned, simply pull out the old wick, pour fresh sand pearls, insert a new wick, and it's brand new.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/candles/ebc/04.jpg" alt="Clean Burning Non-Toxic" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Eco-Friendly & Non-Toxic</h4>
                        <p>100% plant-based formulation that burns cleanly without producing soot, toxins, or paraffin residues, keeping household air safe.</p>
                    </div>
                </div>

                <!-- Comparison Table Module -->
                <div style="margin-top:30px;">
                    <h4 style="font-size:1.2rem; color:#1e293b; margin-bottom:15px; font-weight:600;">Oasis Sand Candles vs. Traditional Block Wax Candles</h4>
                    <div class="aplus-table-module">
                        <table class="aplus-table">
                            <thead>
                                <tr>
                                    <th>Feature Specs</th>
                                    <th>Oasis Pearled Sand</th>
                                    <th>Generic Block Candles</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Container Versatility</strong></td>
                                    <td>Any Heat-Safe Container <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Fixed Container Only <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Cleanup Mess</strong></td>
                                    <td>No Melting / Zero Mess <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Hot Sticky Wax Residue <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Wick Customization</strong></td>
                                    <td>Replaceable 30 Included Wicks <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Single Fixed Non-replaceable <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (brand === 'ayaani') {
            // Ayaani Sleep Aid Modular Content
            aplusLivePreview.innerHTML = `
                <!-- Banner Image Module -->
                <div class="aplus-banner-module">
                    <img src="images/Sleep Aid/ebc/01.jpg" alt="Ayaani Sweet Dreams Sleep Aid Banner" onerror="this.src='images/aplus_banner_placeholder.svg'">
                </div>

                <div style="margin:20px 0; text-align:center; padding:0 20px;">
                    <h3 style="font-size:1.6rem; color:#1e293b; margin-bottom:10px;">Wake Up Refreshed Without Morning Brain Fog</h3>
                    <p style="color:#64748b; font-size:0.95rem; max-width:800px; margin:0 auto;">Ayaani Sweet Dreams formulation targets key sleep receptors naturally to reduce stress, calm the nervous system, and support deep restful sleeping patterns without habit-forming chemicals.</p>
                </div>

                <!-- Grid Images Module -->
                <div class="aplus-grid-module">
                    <div class="aplus-grid-card">
                        <img src="images/Sleep Aid/ebc/02.jpg" alt="Fall Asleep Faster" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Fall Asleep Faster</h4>
                        <p>Formulated with herbal extracts that signal the brain to shut down active daily thoughts, shifting you into a natural state of relaxation.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/Sleep Aid/ebc/03.jpg" alt="Deep Sleep Restoration" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Deep Restful Sleep</h4>
                        <p>Supports extended REM cycles, ensuring your body enters the deepest restorative stages of sleep to repair muscles and restore mental energy.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/Sleep Aid/ebc/04.jpg" alt="100% Clean Ingredients" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Antioxidants & Calming Blend</h4>
                        <p>100% vegan-friendly, gluten-free, sugar-free, and non-GMO tablets manufactured in a certified USA facility under strict guidelines.</p>
                    </div>
                </div>

                <!-- Comparison Table Module -->
                <div style="margin-top:30px;">
                    <h4 style="font-size:1.2rem; color:#1e293b; margin-bottom:15px; font-weight:600;">Ayaani vs. Drugstore Sleep Medications</h4>
                    <div class="aplus-table-module">
                        <table class="aplus-table">
                            <thead>
                                <tr>
                                    <th>Health & Safety</th>
                                    <th>Ayaani Sweet Dreams</th>
                                    <th>Generic Chemical Pills</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Habit Forming</strong></td>
                                    <td>100% Non-Addictive <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>High Risk of Dependency <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Morning Grogginess</strong></td>
                                    <td>None / Alert Awakening <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Heavy Brain Fog / Fatigue <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Ingredients</strong></td>
                                    <td>Clean Herbal Botanical Extracts <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Synthetic Sleep Inducing Drugs <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (brand === 'sombra') {
            // Sombra Hemp Cream Modular Content
            aplusLivePreview.innerHTML = `
                <!-- Banner Image Module -->
                <div class="aplus-banner-module">
                    <img src="images/Sombra Body Cream/ebc/01.jpg" alt="Sombra Hemp Body Cream Banner" onerror="this.src='images/aplus_banner_placeholder.svg'">
                </div>

                <div style="margin:20px 0; text-align:center; padding:0 20px;">
                    <h3 style="font-size:1.6rem; color:#1e293b; margin-bottom:10px;">Deep Moisture and Organic Relief for Your Skin</h3>
                    <p style="color:#64748b; font-size:0.95rem; max-width:800px; margin:0 auto;">Sombra's premium hemp-enriched formula provides quick skin recovery and intense moisture. Formulated using botanical extracts, this clean body cream softens and hydrates dry, sensitive skin.</p>
                </div>

                <!-- Grid Images Module -->
                <div class="aplus-grid-module">
                    <div class="aplus-grid-card">
                        <img src="images/Sombra Body Cream/ebc/02.jpg" alt="Deep Hydration Skincare" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Deep Hydration Care</h4>
                        <p>Specially formulated to lock in moisture for up to 24 hours, restoring the skin barrier of dry, sensitive, or cracked skin.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/Sombra Body Cream/ebc/03.jpg" alt="Hemp Seed Oil Botanicals" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Hemp-Enriched Formula</h4>
                        <p>Powered by organic hemp seed oil combined with cooling botanicals to comfort tired skin muscles and deliver essential fatty acids.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/Sombra Body Cream/ebc/04.jpg" alt="Clean Paraben Free Cream" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Clean & Safe Skincare</h4>
                        <p>100% free from parabens, mineral oils, silicones, dyes, or heavy artificial perfumes. Safe for daily full-body use.</p>
                    </div>
                </div>

                <!-- Comparison Table Module -->
                <div style="margin-top:30px;">
                    <h4 style="font-size:1.2rem; color:#1e293b; margin-bottom:15px; font-weight:600;">Sombra Hemp Cream vs. Traditional Body Lotions</h4>
                    <div class="aplus-table-module">
                        <table class="aplus-table">
                            <thead>
                                <tr>
                                    <th>Ingredients & Texture</th>
                                    <th>Sombra Hemp Cream</th>
                                    <th>Generic Body Lotions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Skin Feel</strong></td>
                                    <td>Smooth, Non-Greasy Absorption <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Sticky Residue / Oily Layer <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Formulation</strong></td>
                                    <td>Pure Organic Botanicals & Hemp <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Petrolatum & Synthetic Fillers <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Cruelty-Free Status</strong></td>
                                    <td>100% Vegan & Leaping Bunny Certified <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Animal Tested / Synthetic Byproducts <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (brand === 'selfcontrol') {
            // Self-Control Book Modular Content
            aplusLivePreview.innerHTML = `
                <!-- Banner Image Module -->
                <div class="aplus-banner-module">
                    <img src="images/salf control book/ebc/01.jpg" alt="Self-Control Book Linno Freyre Banner" onerror="this.src='images/aplus_banner_placeholder.svg'">
                </div>

                <div style="margin:20px 0; text-align:center; padding:0 20px;">
                    <h3 style="font-size:1.6rem; color:#1e293b; margin-bottom:10px;">Take Charge of Your Emotions and Live With Purpose</h3>
                    <p style="color:#64748b; font-size:0.95rem; max-width:800px; margin:0 auto;">In 'Self-Control: Who's Running the Show?', Linno Freyre outlines a structured path to building emotional discipline, mastering attention, and forming life-changing productivity habits.</p>
                </div>

                <!-- Grid Images Module -->
                <div class="aplus-grid-module">
                    <div class="aplus-grid-card">
                        <img src="images/salf control book/ebc/02.jpg" alt="Mindfulness Focus Exercises" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Start Anytime Program</h4>
                        <p>Flexible exercises and reflection logs that integrate seamlessly into any busy schedule. Build emotional resilience step by step.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/salf control book/ebc/03.jpg" alt="Premium Step by Step Program" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Premium Practical Edition</h4>
                        <p>Each chapter is designed with practical worksheets, summary checklists, and cognitive routines to convert knowledge into real-world habits.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/salf control book/ebc/04.jpg" alt="Motivational Clear Design Layout" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Focused Clear Typography</h4>
                        <p>Beautiful layouts and flowcharts designed to enhance readability, keeping you motivated and engaged throughout the learning process.</p>
                    </div>
                </div>

                <!-- Comparison Table Module -->
                <div style="margin-top:30px;">
                    <h4 style="font-size:1.2rem; color:#1e293b; margin-bottom:15px; font-weight:600;">Self-Control Book vs. Traditional Self-Help Theories</h4>
                    <div class="aplus-table-module">
                        <table class="aplus-table">
                            <thead>
                                <tr>
                                    <th>Approach & Layout</th>
                                    <th>Self-Control (Freyre)</th>
                                    <th>Standard Motivation Books</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Actionable Content</strong></td>
                                    <td>Weekly Reflection & Practice Logs <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Pure Theoretical Concepts Only <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Formatting Style</strong></td>
                                    <td>Skimmable Diagrams & Flowcharts <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Dense Text Blocks (Hard to Scan) <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Application Goal</strong></td>
                                    <td>Long-Term Habit Formation <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Short-Lived Motivation Spurt <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (brand === 'soap') {
            // Demure Soap Bar Modular Content
            aplusLivePreview.innerHTML = `
                <!-- Banner Image Module -->
                <div class="aplus-banner-module">
                    <img src="images/Demure Shop Bar/01.jpg" alt="Demure Premium Skincare Soap Bar Banner" onerror="this.src='images/aplus_banner_placeholder.svg'">
                </div>

                <div style="margin:20px 0; text-align:center; padding:0 20px;">
                    <h3 style="font-size:1.6rem; color:#1e293b; margin-bottom:10px;">Clear Blemishes and Revitalize Your Skin Enamel</h3>
                    <p style="color:#64748b; font-size:0.95rem; max-width:800px; margin:0 auto;">Demure Sulphur & Salicylic Acid Soap Bar is crafted specifically for acne-prone and inflamed skin. Cleanses pores deeply while restoring skin moisture balance.</p>
                </div>

                <!-- Grid Images Module -->
                <div class="aplus-grid-module">
                    <div class="aplus-grid-card">
                        <img src="images/Demure Shop Bar/02.jpg" alt="Pore Exfoliating Skin Cleanse" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Pore Exfoliating Action</h4>
                        <p>Salicylic acid targets clogged pores, dissolving dead skin and dirt build-up without drying or damaging healthy skin layers.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/Demure Shop Bar/03.jpg" alt="Reduces Acne Bacteria" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Active Anti-Bacterial Guard</h4>
                        <p>Infused with natural Sulphur to defend against acne-causing bacteria, preventing future outbreaks and soothing redness.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/Demure Shop Bar/04.jpg" alt="Anti Inflammatory Hydration" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Soothing Hydration Blend</h4>
                        <p>Contains plant-based anti-inflammatory extracts that nourish irritated skin, leaving it feeling soft and refreshed after every wash.</p>
                    </div>
                </div>

                <!-- Comparison Table Module -->
                <div style="margin-top:30px;">
                    <h4 style="font-size:1.2rem; color:#1e293b; margin-bottom:15px; font-weight:600;">Demure Soap Bar vs. Generic Chemical Soap Bars</h4>
                    <div class="aplus-table-module">
                        <table class="aplus-table">
                            <thead>
                                <tr>
                                    <th>Therapeutic Benefits</th>
                                    <th>Demure Medicated Soap</th>
                                    <th>Generic Chemical Bar</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Blemish Control</strong></td>
                                    <td>Salicylic Acid & Sulphur Blend <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Standard Deodorizing Perfumes <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Skin Feel</strong></td>
                                    <td>Moisturized & Calmed <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Stripped Dry / Tight Skin <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Exfoliation</strong></td>
                                    <td>Chemical Pore-Deep Cleanse <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Abrasive Microplastic Scrubbing <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (brand === 'onion') {
            // JUX Red Onion Modular Content
            aplusLivePreview.innerHTML = `
                <!-- Banner Image Module -->
                <div class="aplus-banner-module">
                    <img src="images/Red Onion/ebc/01.jpg" alt="JUX Freeze Dried Red Onion Banner" onerror="this.src='images/aplus_banner_placeholder.svg'">
                </div>

                <div style="margin:20px 0; text-align:center; padding:0 20px;">
                    <h3 style="font-size:1.6rem; color:#1e293b; margin-bottom:10px;">Instant Flavour and Nutrients - No Prep, No Tears</h3>
                    <p style="color:#64748b; font-size:0.95rem; max-width:800px; margin:0 auto;">JUX Foods freeze-dried red onions lock in 98% of natural vitamins, antioxidants, and a bold, pungent flavor. The perfect addition to elevate your everyday meals instantly.</p>
                </div>

                <!-- Grid Images Module -->
                <div class="aplus-grid-module">
                    <div class="aplus-grid-card">
                        <img src="images/Red Onion/ebc/02.jpg" alt="One of Your 5-A-Day" onerror="this.src='images/placeholder_square.svg'">
                        <h4>One of Your 5-A-Day</h4>
                        <p>Provides a quick, highly nutritious vegetable serving rich in heart-healthy organosulfur compounds and vitamin C.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/Red Onion/ebc/03.jpg" alt="100% Natural Ingredients" onerror="this.src='images/placeholder_square.svg'">
                        <h4>100% Natural Red Onion</h4>
                        <p>Zero preservatives, chemical additives, or artificial salt additions. Simply pure farm-grown red onions.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/Red Onion/ebc/04.jpg" alt="Fuller Freeze Dried Flavour" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Fuller Freeze Dried Flavour</h4>
                        <p>Vacuum freeze-dried at harvest to retain the original sweetness, crunch, and sharp aroma of freshly sliced onions.</p>
                    </div>
                </div>

                <!-- Comparison Table Module -->
                <div style="margin-top:30px;">
                    <h4 style="font-size:1.2rem; color:#1e293b; margin-bottom:15px; font-weight:600;">JUX Freeze Dried vs. Standard Dehydrated Onions</h4>
                    <div class="aplus-table-module">
                        <table class="aplus-table">
                            <thead>
                                <tr>
                                    <th>Ingredient Quality</th>
                                    <th>JUX Freeze Dried</th>
                                    <th>Generic Dehydrated Flakes</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Nutrition Retained</strong></td>
                                    <td>98% Original Vitamins <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Less than 40% (Heat Damaged) <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Texture After Water</strong></td>
                                    <td>Crisp, Soft, Natural Texture <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Hard, Chewy, Rubber-like <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Flavor and Smell</strong></td>
                                    <td>Sharp, Rich Red Onion Pungency <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Dull, Sweeter, Dusty Aroma <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (brand === 'icecubes') {
            // Amer-Ice Ice Cube Trays Modular Content
            aplusLivePreview.innerHTML = `
                <!-- Banner Image Module -->
                <div class="aplus-banner-module">
                    <img src="images/Ameer Ice/01.jpg" alt="Amer-Ice Ice Cube Trays Patriotic Banner" onerror="this.src='images/aplus_banner_placeholder.svg'">
                </div>

                <div style="margin:20px 0; text-align:center; padding:0 20px;">
                    <h3 style="font-size:1.6rem; color:#1e293b; margin-bottom:10px;">More Than Ice - It's a Kitchen Adventure</h3>
                    <p style="color:#64748b; font-size:0.95rem; max-width:800px; margin:0 auto;">Amer-Ice premium food-grade silicone trays create unique state-shaped ice cubes. Complete with spill-proof lids and a durable construction backed by a forever warranty.</p>
                </div>

                <!-- Grid Images Module -->
                <div class="aplus-grid-module">
                    <div class="aplus-grid-card">
                        <img src="images/Ameer Ice/02.jpg" alt="Patriotic Colors Red Blue" onerror="this.src='images/placeholder_square.svg'">
                        <h4>2 Trays, 2 Lids, 2 Colors</h4>
                        <p>Includes a set of two vibrant red and blue trays matching a patriotic theme, each with its own secure, flexible lid.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/Ameer Ice/03.jpg" alt="Single Compartment Cube Release" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Single Compartment Release</h4>
                        <p>Made from premium LFGB-certified soft silicone. Gently push from the bottom to pop individual cubes out cleanly.</p>
                    </div>
                    <div class="aplus-grid-card">
                        <img src="images/Ameer Ice/04.jpg" alt="Forever Warranty Ice Tray" onerror="this.src='images/placeholder_square.svg'">
                        <h4>Forever Parts Warranty</h4>
                        <p>Engineered to handle freezing temperatures without cracking or tearing. Backed by a full lifetime customer replacement support.</p>
                    </div>
                </div>

                <!-- Comparison Table Module -->
                <div style="margin-top:30px;">
                    <h4 style="font-size:1.2rem; color:#1e293b; margin-bottom:15px; font-weight:600;">Amer-Ice Silicone Trays vs. Cheap Plastic Trays</h4>
                    <div class="aplus-table-module">
                        <table class="aplus-table">
                            <thead>
                                <tr>
                                    <th>Design & Durability</th>
                                    <th>Amer-Ice Silicone</th>
                                    <th>Generic Plastic Trays</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>Material Safety</strong></td>
                                    <td>Food-Grade LFGB Certified Silicone <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Low-Grade BPA Containing Plastic <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Lid Odor Protection</strong></td>
                                    <td>Tight-Fitting Spill-Proof Lids <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Open-Air Freezer Exposure <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                                <tr>
                                    <td><strong>Durability Life</strong></td>
                                    <td>Flexible/Crack-Proof Forever Warranty <span class="check-icon"><i class="fa-solid fa-circle-check"></i></span></td>
                                    <td>Stiff/Breaks after a few freezes <span class="cross-icon"><i class="fa-solid fa-circle-xmark"></i></span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    };

    // A+ brand selectors click listeners
    aplusSelectors.forEach(btn => {
        btn.addEventListener('click', () => {
            aplusSelectors.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            activeAplusBrand = btn.dataset.aplus;
            renderAplusContent(activeAplusBrand);
        });
    });

    // ==========================================
    // 10.5. Amazon Storefront Showcase Switcher
    // ==========================================
    const storefrontSelectors = document.querySelectorAll('[data-storefront]');
    const storefrontPreviewImg = document.getElementById('storefront-preview-img');
    const storefrontBrowserAddress = document.getElementById('storefront-browser-address');
    const sfDetailsStarfire = document.getElementById('sf-details-starfire');
    const sfDetailsRonson = document.getElementById('sf-details-ronson');
    const sfDetailsBlitz = document.getElementById('sf-details-blitz');

    storefrontSelectors.forEach(btn => {
        btn.addEventListener('click', () => {
            storefrontSelectors.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selected = btn.dataset.storefront;

            if (selected === 'starfire') {
                storefrontPreviewImg.src = 'images/starfire-storefront/preview-01.jpg';
                storefrontPreviewImg.alt = 'Amazon Storefront Design for STARFIRE - Toufiq Creative';
                storefrontBrowserAddress.textContent = 'amazon.com/stores/starfire';
                
                sfDetailsStarfire.style.display = 'block';
                sfDetailsRonson.style.display = 'none';
                if (sfDetailsBlitz) sfDetailsBlitz.style.display = 'none';
            } else if (selected === 'ronson') {
                storefrontPreviewImg.src = 'images/ronson-storefront/storefront-artboard.jpg';
                storefrontPreviewImg.alt = 'Amazon Storefront Design for Ronson - Toufiq Creative';
                storefrontBrowserAddress.textContent = 'amazon.com/stores/ronson';

                sfDetailsStarfire.style.display = 'none';
                sfDetailsRonson.style.display = 'block';
                if (sfDetailsBlitz) sfDetailsBlitz.style.display = 'none';
            } else if (selected === 'blitz') {
                storefrontPreviewImg.src = 'images/blitz-storefront/preview-01.jpg';
                storefrontPreviewImg.alt = 'Amazon Storefront Design for Blitz Jewelry Care - Toufiq Creative';
                storefrontBrowserAddress.textContent = 'amazon.com/stores/blitz';

                sfDetailsStarfire.style.display = 'none';
                sfDetailsRonson.style.display = 'none';
                if (sfDetailsBlitz) sfDetailsBlitz.style.display = 'block';
            }

            // Reset scroll animation to start from top
            storefrontPreviewImg.style.animation = 'none';
            storefrontPreviewImg.offsetHeight; // Trigger DOM reflow
            storefrontPreviewImg.style.animation = '';
        });
    });

    // ==========================================
    // 10.6. Upwork Testimonials & Reviews Switcher
    // ==========================================
    const reviewTabs = document.querySelectorAll('#reviews-tabs .filter-btn');
    const completedReviewsBox = document.getElementById('completed-reviews');
    const inprogressContractsBox = document.getElementById('inprogress-contracts');

    reviewTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            reviewTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selected = btn.dataset.review;

            if (selected === 'completed') {
                completedReviewsBox.style.display = 'grid';
                inprogressContractsBox.style.display = 'none';
            } else if (selected === 'progress') {
                completedReviewsBox.style.display = 'none';
                inprogressContractsBox.style.display = 'grid';
            }
        });
    });

    // ==========================================
    // 11. Contact Form State Animation
    // ==========================================
    inquiryForm && inquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Dynamic loading transition
        const submitBtn = inquiryForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Submitting Inquiry...';
 
        setTimeout(() => {
            // Animate transition between form and success message
            inquiryForm.style.display = 'none';
            formSuccessMessage.style.display = 'block';
            formSuccessMessage.style.opacity = '0';
            
            // Fade-in success details
            let opacity = 0;
            const fadeIn = setInterval(() => {
                if (opacity >= 1) {
                    clearInterval(fadeIn);
                } else {
                    opacity += 0.1;
                    formSuccessMessage.style.opacity = opacity;
                }
            }, 30);
        }, 1500); // 1.5 seconds mock server loading
    });

    // ==========================================
    // 12. Run Initializer
    // ==========================================
    fetchProjects();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
