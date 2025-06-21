// js/popup/templates/personas.ts
import { hexToHSL } from '../utils/colors.js';
import { getStoredImage } from '../../editor/utils/images.js';
import { DemoFlowTemplate } from '../../types.js';

export const getPersonasStyles = (hslColor: string): string => `
    :root {
        --p: ${hslColor};
        --pf: ${hslColor};
        --pc: 0 0% 100%;
    }

`;

export async function generatePersonasHTML(demoData: DemoFlowTemplate): Promise<{ styles: string; content: string }> {
  const hslColor = hexToHSL(demoData.theme["brand-color"]);

  const [productLogo, customerLogo] = await Promise.all([
    getStoredImage(demoData.product.logourl),
    getStoredImage(demoData.customer.logourl)
  ]);

  const personaPictures = {};
  for (const [key, persona] of Object.entries(demoData.personas)) {
    if (persona.pictureurl) {
      personaPictures[key] = await getStoredImage(persona.pictureurl);
    }
  }

  return {
    styles: getPersonasStyles(hslColor),
    content: `
        <div class="page-content">
            <div class="hero bg-base-100 py-12 mb-8 shadow-lg">
                <div class="hero-content text-center">
                    <div>
                        <div class="flex justify-center items-center gap-8 mb-6">
                            <img src="${productLogo || ''}" alt="${demoData.product.name}" class="h-16 md:h-24">
                            <div class="divider divider-horizontal">x</div>
                            <img src="${customerLogo || ''}" alt="${demoData.customer.name}" class="h-16 md:h-24">
                        </div>
                        <h1 class="text-5xl font-bold mb-2">Meet the Team</h1>
                        <p class="text-xl opacity-75">The key players in this demo story</p>
                    </div>
                </div>
            </div>

            <main class="container mx-auto px-4 pb-16">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${Object.entries(demoData.personas).map(([key, persona]) => {
      const pictureData = personaPictures[key];
      return `
                            <div class="persona-card card bg-base-100 shadow-xl hover:shadow-2xl">
                                <div class="card-body items-center text-center p-8">
                                    <div class="avatar large placeholder mb-4">
                                        <div class="bg-primary text-primary-content rounded-full w-24 h-24 ring-3 ring-primary ring-offset-2">
                                            ${pictureData ?
          `<img src="${pictureData}" alt="${persona.name}" class="mask mask-circle">` :
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
</div>
            <footer class="footer footer-center p-4 bg-base-300 text-base-content mt-auto">
                <div>
                    <p>Demo Story Personas - ${demoData.product.name} x ${demoData.customer.name}</p>
                </div>
            </footer>
        `
  };
}