// js/popup/templates/overview.js
import { hexToHSL } from '../utils/colors.js';
import { getStoredImage } from '../../editor/utils/images.js';



export const getOverviewStyles = (hslColor) => `
    :root {
        --p: ${hslColor};
        --pf: ${hslColor};
        --pc: 0 0% 100%;
    }
    body {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }
    #content {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
    .page-content {
        flex: 1 0 auto;
        display: flex;
        flex-direction: column;
    }
    .step-card {
        transition: all 0.3s ease-in-out;
        position: relative;
        margin-top: 1rem; /* Add space for the badge */
        background: hsl(var(--b1));
    }
    .step-card:hover {
        transform: translateY(-5px);
    }
    .steps-container {
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
        padding: 1rem 0.5rem; /* Add horizontal padding to show left border */
        margin: -1rem -0.5rem; /* Compensate for padding */
    }
    .step-card {
        scroll-snap-align: start;
        width: calc(100vw - 3rem); /* Adjust for new padding */
        max-width: 400px;
        min-height: 280px;
        display: flex;
        flex-direction: column;
        border: 1px solid hsl(var(--b3)); /* Base border for all cards */
        position: relative; /* Add this for video positioning */
    }
    .card-header-content {
        padding: 1.5rem;
        border-bottom: 1px solid hsl(var(--b3));
        border-radius: 1rem 1rem 0 0;
    }
    @media (min-width: 640px) {
        .step-card {
            width: 300px;
        }
    }
    @media (min-width: 768px) {
        .step-card {
            width: 350px;
        }
    }
    @media (min-width: 1024px) {
        .step-card {
            width: 400px;
        }
    }
    ::-webkit-scrollbar {
        height: 8px;
    }
    ::-webkit-scrollbar-track {
        background: #1f2937;
    }
    ::-webkit-scrollbar-thumb {
        background: #4b5563;
        border-radius: 4px;
    }
    .material-icons.icon-large {
        font-size: 48px;
        transform: scale(1.2);
    }
    main {
        flex: 1 0 auto;
    }
    footer {
        flex-shrink: 0;
    }
    @keyframes cardBump {
        0%, 100% {
            transform: translateY(-5px) scale(1.02);
        }
        50% {
            transform: translateY(-10px) scale(1.02);
        }
    }
    .step-card.current-step {
        border-width: 2px;
        border-color: hsl(var(--p));
        transform: translateY(-5px) scale(1.02);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        z-index: 10;
        background: hsl(var(--p) / 0.05);
        animation: cardBump 3s ease-in-out infinite;
    }
    .step-card.current-step:hover {
        animation-play-state: paused;
        transform: translateY(-10px) scale(1.02);
    }
    .step-card.current-step .card-header-content {
        background: hsl(var(--p) / 0.1);
    }
    .current-step-badge {
        position: absolute;
        top: -0.75rem;
        right: 1rem;
        z-index: 20;
        padding: 0.5rem 1rem;
        font-weight: 600;
        background-color: hsl(var(--p));
        color: hsl(var(--pc));
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        border: 2px solid hsl(var(--b1));
    }
`;

export async function generateOverviewHTML(demoData, currentStep = null) {
    const hslColor = hexToHSL(demoData.theme["brand-color"]);

    const [productLogo, customerLogo] = await Promise.all([
        getStoredImage(demoData.product.logourl),
        getStoredImage(demoData.customer.logourl)
    ]);

    return {
        styles: getOverviewStyles(hslColor),
        content: `
            ${currentStep !== null && demoData.steps[currentStep]?.video ? `
                <div id="draggableVideo" class="video-container">
                    <div class="video-drag-handle">
                        <span>Step ${currentStep + 1} Video</span>
                        <button class="minimize-btn">_</button>
                    </div>
                    <div class="video-content">
                        <iframe
                            src="https://customer-6q7djnjft9y9t31b.cloudflarestream.com/${demoData.steps[currentStep].video}/iframe?loop=true&poster=https%3A%2F%2Fcustomer-6q7djnjft9y9t31b.cloudflarestream.com%2F${demoData.steps[currentStep].video}%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600"
                            loading="lazy"
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                            allowfullscreen="true"
                        ></iframe>
                    </div>
                    <div class="video-resize-handle"></div>
                </div>
            ` : ''}
            <div class="page-content">
                <div class="hero bg-base-100 py-8 md:py-12 shadow-lg">
                    <div class="hero-content text-center px-4">
                        <div>
                            <div class="flex justify-center items-center gap-4 md:gap-8 mb-6">
                                <img src="${productLogo || ''}" alt="${demoData.product.name}" class="h-16 md:h-24">
                                <div class="divider divider-horizontal">x</div>
                                <img src="${customerLogo || ''}" alt="${demoData.customer.name}" class="h-16 md:h-24">
                            </div>
                            <h1 class="text-3xl md:text-5xl font-bold mb-2">Demo Journey</h1>
                            <p class="text-lg md:text-xl opacity-75">Follow the story step by step</p>
                        </div>
                    </div>
                </div>
                <main class="container mx-auto p-4 md:p-8 flex-1">
                    <div class="steps-container flex gap-4 md:gap-6 overflow-x-auto pb-6">
                        ${demoData.steps.map((step, index) => `
                            <div class="step-card card bg-base-100 shadow-xl hover:shadow-2xl ${currentStep === index ? 'current-step' : ''}">
                                ${currentStep === index ? `
                                    <div class="current-step-badge badge badge-primary badge-lg">Current Step</div>
                                ` : ''}
                                <div class="card-header-content">
                                    <div class="flex items-center gap-6">
                                        <div class="w-16 h-16 rounded-full ${currentStep === index ? 'bg-primary text-primary-content' : 'bg-primary/10'} flex items-center justify-center">
                                            <span class="material-icons icon-large">${step.icon}</span>
                                        </div>
                                        <h2 class="card-title text-xl md:text-2xl flex-1">${step.title}</h2>
                                        ${step.video ? `
                                            <span class="material-icons text-primary" title="Has video">videocam</span>
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="card-body">
                                    <p class="text-base-content/70 text-lg leading-relaxed">${step.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </main>
            </div>
            <footer class="footer footer-center p-4 bg-base-300 text-base-content">
                <div>
                    <p class="text-sm md:text-base">Demo Story Overview - ${demoData.product.name} x ${demoData.customer.name}</p>
                </div>
            </footer>
        `
    };
}