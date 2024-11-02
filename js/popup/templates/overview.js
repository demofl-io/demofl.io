// js/popup/templates/overview.js
import { hexToHSL } from '../utils/colors.js';

export function generateOverviewHTML(demoData) {
    const hslColor = hexToHSL(demoData.theme["brand-color"]);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Demo Steps Overview</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/daisyui@1.14.0/dist/full.css" rel="stylesheet">
         <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <style>
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
          .step-card {
            transition: transform 0.2s ease-in-out;
          }
          .step-card:hover {
            transform: translateY(-5px);
          }
          .steps-container {
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
          }
          .step-card {
            scroll-snap-align: start;
            width: calc(100vw - 2rem);
            max-width: 400px;
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
          main {
            flex: 1 0 auto;
          }
          footer {
            flex-shrink: 0;
          }
        </style>
      </head>
      <body class="bg-base-200">
        <div class="hero bg-base-100 py-8 md:py-12 shadow-lg">
          <div class="hero-content text-center px-4">
            <div>
              <div class="flex justify-center items-center gap-4 md:gap-8 mb-6">
                <img src="${demoData.product.logourl}" alt="${demoData.product.name}" class="h-16 md:h-24">
                <div class="divider divider-horizontal">x</div>
                <img src="${demoData.customer.logourl}" alt="${demoData.customer.name}" class="h-16 md:h-24">
              </div>
              <h1 class="text-3xl md:text-5xl font-bold mb-2">Demo Journey</h1>
              <p class="text-lg md:text-xl opacity-75">Follow the story step by step</p>
            </div>
          </div>
        </div>
  
        <main class="container mx-auto p-4 md:p-8">
          <div class="steps-container flex gap-4 md:gap-6 overflow-x-auto pb-6">
            ${demoData.steps.map((step, index) => `
              <div class="step-card card bg-base-100 shadow-xl hover:shadow-2xl">
                <div class="card-body p-4 md:p-6">
                  <div class="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                                        <div class="badge badge-lg badge-primary flex items-center gap-2">
                      <span class="material-icons">${step.icon}</span>
                      <span>${index + 1}</span>
                    </div>
                    <h2 class="card-title text-xl md:text-2xl">${step.title}</h2>
                  </div>
                  <p class="text-base-content/70 text-base md:text-lg">${step.description}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </main>
  
        <footer class="footer footer-center p-4 bg-base-300 text-base-content mt-auto">
          <div>
            <p class="text-sm md:text-base">Demo Story Overview - ${demoData.product.name} x ${demoData.customer.name}</p>
          </div>
        </footer>
      </body>
      </html>
    `;
}