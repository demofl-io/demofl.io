// Helper function to convert hex to HSL
function hexToHSL(hex) {
    // Remove the # if present
    hex = hex.replace('#', '');
    
    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    // Find greatest and smallest RGB values
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    let h, s, l = (max + min) / 2;
  
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
  
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  }

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

export function generatePersonasHTML(demoData) {
    const hslColor = hexToHSL(demoData.theme["brand-color"]);

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Demo Personas</title>
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      <link href="https://cdn.jsdelivr.net/npm/daisyui@1.14.0/dist/full.css" rel="stylesheet">
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
        .persona-card {
          transition: transform 0.2s ease-in-out;
        }
        .persona-card:hover {
          transform: translateY(-5px);
        }
        .avatar.large {
          width: 96px;
          height: 96px;
        }
        main {
          flex: 1 0 auto;
        }
        footer {
          flex-shrink: 0;
        }
      </style>
    </head>
    <body class="min-h-screen bg-base-200">
      <!-- Hero section -->
      <div class="hero bg-base-100 py-12 mb-8 shadow-lg">
        <div class="hero-content text-center">
          <div>
            <div class="flex justify-center items-center gap-8 mb-6">
              <img src="${demoData.product.logourl}" alt="${demoData.product.name}" class="h-16 md:h-24">
              <div class="divider divider-horizontal">x</div>
              <img src="${demoData.customer.logourl}" alt="${demoData.customer.name}" class="h-16 md:h-24">
            </div>
            <h1 class="text-5xl font-bold mb-2">Meet the Team</h1>
            <p class="text-xl opacity-75">The key players in this demo story</p>
          </div>
        </div>
      </div>

      <main class="container mx-auto px-4 pb-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${Object.entries(demoData.personnas).map(([key, persona]) => {
            const pictureUrl = persona.pictureurl ? 
              chrome.runtime.getURL(`pictures/${persona.pictureurl}`) : null;
            
            return `
              <div class="persona-card card bg-base-100 shadow-xl hover:shadow-2xl">
                <div class="card-body items-center text-center p-8">
                  <div class="avatar large placeholder mb-4">
                    <div class="bg-primary text-primary-content rounded-full w-24 h-24 ring ring-primary ring-offset-2">
                      ${pictureUrl ?
                        `<img src="${pictureUrl}" alt="${persona.name}" class="mask mask-circle">` :
                        `<span class="text-3xl font-bold">${persona.name.charAt(0)}</span>`
                      }
                    </div>
                  </div>
                  <h2 class="card-title text-2xl mb-1">${persona.name}</h2>
                  <div class="badge badge-primary badge-lg mb-4">${persona.title}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </main>

      <footer class="footer footer-center p-4 bg-base-300 text-base-content mt-auto">
        <div>
          <p>Demo Story Personas - ${demoData.product.name} x ${demoData.customer.name}</p>
        </div>
      </footer>
    </body>
    </html>
  `;
}