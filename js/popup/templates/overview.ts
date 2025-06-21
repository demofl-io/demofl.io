// js/popup/templates/overview.ts
import { hexToHSL } from '../utils/colors.js';
import { getStoredImage } from '../../editor/utils/images.js';
import { DemoFlowTemplate } from '../../types.js';

export const getOverviewStyles = (hslColor: string): string => `
    :root {
        --p: ${hslColor};
        --pf: ${hslColor};
        --pc: 0 0% 100%;
    }
`;

export async function generateOverviewHTML(demoData: DemoFlowTemplate, currentStep: number | null = null): Promise<{ styles: string; content: string }> {
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