// js/popup/index.ts
import { loadDemoList } from './list.js';
import { initializeImport } from './import.js';
import ExtPay from 'extpay';
import { AuthService } from '../auth';
import { initializeTheme } from '../utils/theme.js';
import { AuthUser, ExtensionMessage } from '../types.js';

const authService = new AuthService();
const extpay = ExtPay('abobjbfojjkoonmfffjppmkobmbcebdj'); // Careful! See note below

extpay.getUser().then((user: AuthUser) => {

})

const trialDays = 30;


document.querySelector('#login').addEventListener('click', () =>extpay.openLoginPage());
document.querySelector('#paynow').addEventListener('click',() => extpay.openPaymentPage());
document.querySelector('#trial').addEventListener('click', func => {
    extpay.openTrialPage("Enter an email to start your *"+trialDays+"-days* free trial");
});

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme
    initializeTheme();
    
    // Add popout handler
    document.getElementById('popout').addEventListener('click', () => {
        chrome.tabs.create({
            url: chrome.runtime.getURL('html/popup.html')
        });
        window.close();
    });

    const isAuthenticated = await authService.isAuthenticated();

    // demofl.io cloud for the team plan
    if (isAuthenticated) {
        document.querySelector('#payheader').innerHTML = 'Welcome to the cloud  🎉';
        // Add sign out button
        document.querySelector('#payheader').innerHTML += ' <button id="signout" class="btn btn-link">Sign out</button>';
        // Add sign out handler
        document.querySelector('#signout').addEventListener('click', async () => {
            await authService.signOut();
            window.location.reload();
        });
        loadDemoList();
        initializeImport();
    
    } else {
        // always show cloud login button
        showLoginButton();

        // here we use ExtPay to check if the user is logged in and paid for the personnal plan
        extpay.getUser().then((user: AuthUser) => {
            if (user.email) {
                // Remove all payment-related buttons when user is logged in
                document.querySelector('#login')?.remove();

            }
            if (user.paid) {
                document.querySelector('#paynow')?.remove();
                document.querySelector('#trial')?.remove();
                const payHeaderElement = document.querySelector('#payheader');
                if (payHeaderElement) {
                    payHeaderElement.innerHTML = '<div class="flex flex-col">' +
                        '<div>Welcome ' + user.email + ' 🎉</div>' +
                        '<div class="flex gap-2">' +
                        '<button id="preferences" class="btn btn-link">Manage your subscription</button>' +
                        '<button id="extpay-signout" class="btn btn-link">Sign out</button>' +
                        '</div></div>';

                    document.querySelector('#preferences')?.addEventListener('click', extpay.openPaymentPage);
                    document.querySelector('#extpay-signout')?.addEventListener('click', () => {
                        // Clear ExtPay user data from storage
                        chrome.storage.sync.remove(['extensionpay_api_key', 'extensionpay_user'], () => {
                            window.location.reload();
                        });
                    });
                }
            } else {

                const now = new Date();
                const sevenDays = 1000 * 60 * 60 * 24 * trialDays // in milliseconds
                if (user.trialStartedAt && (now.getTime() - user.trialStartedAt.getTime()) < sevenDays) {
                    document.querySelector('#paynow')?.remove();

                    const payHeaderElement = document.querySelector('#payheader');
                    if (payHeaderElement) {
                        payHeaderElement.innerHTML = '<div class="flex flex-col">' +
                            '<div>Welcome ' + user.email + ' . Your trial ends in ' + Math.floor((sevenDays - (now.getTime() - user.trialStartedAt.getTime())) / (1000 * 60 * 60 * 24)) + ' days</div>' +
                            '<div class="flex gap-2">' +
                            '<button id="preferences" class="btn btn-link">Manage your subscription</button>' +
                            '<button id="extpay-signout" class="btn btn-link">Sign out</button>' +
                            '</div></div>';

                        document.querySelector('#preferences')?.addEventListener('click', extpay.openPaymentPage);

                        document.querySelector('#extpay-signout')?.addEventListener('click', () => {
                            // Clear ExtPay user data from storage
                            chrome.storage.sync.remove(['extensionpay_api_key', 'extensionpay_user'], () => {
                                window.location.reload();
                            });
                        });
                    }
                } else {
                    // user's trial is not active
                    document.querySelector('#demoflio')?.remove();
                    return;
                }
    
            }
            loadDemoList();
            initializeImport();
        }).catch((err: Error) => {
            const errorElement = document.querySelector('p');
            if (errorElement) {
                errorElement.innerHTML = "Error fetching data :( Check that your ExtensionPay id is correct and you're connected to the internet";
            }
        });
    }


});

function showLoginButton(): void {
    const loginButton = document.createElement('button');
    loginButton.className = 'btn btn-primary';
    loginButton.textContent = 'Login with Demofl.io Cloud (coming soon)';
    loginButton.disabled = true;
    loginButton.addEventListener('click', async () => {
        const authUrl = await authService.initiateLogin();
        chrome.windows.create({
            url: authUrl,
            type: 'popup',
            width: 600,
            height: 700
        });
    });

    const loginContainer = document.querySelector('#login-container');
    if (loginContainer) {
        loginContainer.appendChild(loginButton);
    }
}

// Listen for authentication success
chrome.runtime.onMessage.addListener((message: ExtensionMessage) => {
    if (message.type === 'AUTH_SUCCESS') {
        window.location.reload();
    }
});

